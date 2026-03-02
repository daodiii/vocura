# Design: Lab Module + Felleskatalogen AI Assistant

**Date:** 2026-02-19
**Status:** Approved

---

## Overview

Two new features for Vocura:

1. **Lab Module** (`/lab`) — interpret lab test results with AI, supporting both manual paste and optional auto-fetch
2. **Felleskatalogen AI Assistant** (`/felleskatalogen`) — RAG-powered drug knowledge chat, available as standalone page and inline editor panel

---

## Feature 1: Lab Module

### Route
`/lab` — new sidebar nav item under a new **"Referanse"** section

### Input Modes (tabs)

**Tab 1: Lim inn verdier**
- Free-text area where clinician pastes or types lab values
- Example input: `"Hb 9.2, CRP 87, kreatinin 145, Na 138, K 4.1"`
- AI parses values, identifies units, maps to reference ranges, interprets clinically
- Submit button: "Analyser"

**Tab 2: Hent automatisk**
- Placeholder UI for future external system connection (Norsk Helsenett / DIPS / Labportalen)
- "Koble til" CTA shown with a description of what it enables
- When connected: fetches structured lab results and displays in same output format
- Not all clinicians will use this — paste mode is always available

### Output — Two-Level Display

**Level 1: Quick View (always shown)**
- Table with columns: Analyse | Verdi | Enhet | Referanseområde | Status
- Status column: color-coded badge
  - 🟢 Normal
  - 🟡 Borderline (within 10% of limit)
  - 🔴 Utenfor referanse (high or low indicated with ↑↓)
- Reference ranges sourced from Norwegian lab standards (Folkehelseinstituttet / NOKLUS)

**Level 2: Klinisk vurdering (expandable accordion)**
- AI-generated structured summary using `CLINICAL_CORE_PROMPT` style
- Sections:
  - **Funn** — which values are abnormal and by how much
  - **Klinisk kontekst** — what these patterns may indicate (differential considerations)
  - **Forslag til oppfølging** — suggested next steps (e.g. "vurder nyresvikt-utredning", "gjenta om 3 måneder")
- Clearly marked as AI-generated, not a diagnosis
- "Kopier til journal" button — inserts formatted summary into active editor note

### API
- `POST /api/lab/interpret`
  - Input: `{ rawText: string, mode: 'paste' | 'fetch', fetchedValues?: LabValue[] }`
  - Calls OpenAI to parse values + apply reference ranges + generate clinical summary
  - Returns: `{ values: ParsedLabValue[], summary: string }`

### Data / Privacy
- No lab data stored server-side (session only)
- GDPR-safe by default
- Optional: user can choose to save a lab panel to their patient session in-memory

### Reference Ranges
- Hardcoded Norwegian reference ranges for common panels (CBC, metabolic, lipids, thyroid, HbA1c, etc.)
- Sourced from NOKLUS (Norsk kvalitetsforbedring av laboratorievirksomhet utenfor sykehus)
- Stored as a JSON config file in `/src/lib/lab-reference-ranges.ts`

---

## Feature 2: Felleskatalogen AI Assistant

### Routes
- `/felleskatalogen` — standalone chat page
- Inline panel accessible from `/editor` via floating button

### Architecture: RAG with Supabase pgvector

**Indexing pipeline (one-time build + on-demand re-index):**

1. **Scraper** (`/scripts/index-felleskatalogen.ts`) — Node.js script that:
   - Fetches drug monograph list from felleskatalogen.no
   - Scrapes each monograph page (name, ATC code, indications, dosing, contraindications, side effects, interactions, pregnancy/lactation)
   - Chunks content into ~500 token segments with overlap
   - Generates embeddings via OpenAI `text-embedding-3-small`
   - Upserts into Supabase `felleskatalogen_chunks` table with pgvector

2. **Supabase schema:**
```sql
CREATE TABLE felleskatalogen_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL,
  atc_code TEXT,
  section TEXT,         -- e.g. "Dosering", "Bivirkninger"
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  source_url TEXT,
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON felleskatalogen_chunks
  USING ivfflat (embedding vector_cosine_ops);
```

3. **Admin re-index trigger:**
   - Button in a simple `/admin` or settings page: "Re-indekser Felleskatalogen"
   - Calls `POST /api/admin/reindex-felleskatalogen`
   - Runs the scraper + re-embedding job
   - Shows progress (drug count indexed, estimated time)

**Chat flow (per query):**

1. User types question → `POST /api/felleskatalogen/chat`
2. API embeds the question with `text-embedding-3-small`
3. Semantic search: top 5 most relevant chunks retrieved from `felleskatalogen_chunks` via cosine similarity
4. Chunks passed as context to OpenAI (Claude Sonnet as primary, GPT-4o as fallback)
5. AI generates structured answer with source attribution
6. Response streamed back to UI

### Standalone Page (`/felleskatalogen`)

- Chat interface: message thread + input box at bottom
- Multi-turn conversation within session (full history passed to each API call)
- Each AI answer shows:
  - The answer in clear Norwegian
  - Source attribution: drug name + Felleskatalogen section + link to source URL
- "Kopier til journal" button on each answer
- Suggested starter questions shown when chat is empty:
  - "Hva er maksdosen av paracetamol?"
  - "Hvilke legemidler er trygge i svangerskapet?"
  - "Bivirkninger ved metformin"

### Inline Editor Panel

- Floating pill button in `/editor` toolbar: "FK" with a book icon
- Clicking opens a 380px slide-in drawer on the right side
- Pre-fills search context: if the current note contains known drug names, the first suggested question references them
- Same chat API as standalone page
- "Sett inn i notat" button inserts answer at cursor position in Tiptap editor

### Sidebar Navigation

New section added to `AppSidebar.tsx`:

```
Referanse
  ├── Laboratorium       (/lab)
  └── Felleskatalogen    (/felleskatalogen)
```

---

## Implementation Phases

### Phase 1: Lab Module
1. Add `/lab` route + page component
2. Build reference ranges config (`/src/lib/lab-reference-ranges.ts`)
3. Build `POST /api/lab/interpret` route
4. UI: tabs, value table with flags, expandable klinisk vurdering
5. Add to sidebar under "Referanse"

### Phase 2: Felleskatalogen RAG Infrastructure
1. Enable pgvector on Supabase, create `felleskatalogen_chunks` table
2. Build scraper script (`/scripts/index-felleskatalogen.ts`)
3. Build `POST /api/admin/reindex-felleskatalogen` route
4. Test indexing on a subset of drugs

### Phase 3: Felleskatalogen Chat
1. Build `POST /api/felleskatalogen/chat` with RAG retrieval
2. Build standalone `/felleskatalogen` chat page
3. Add inline panel to `/editor`
4. Add to sidebar under "Referanse"

---

## Open Questions / Future Work
- Auto-fetch lab integration (Norsk Helsenett): deferred, requires NHN partnership
- Felleskatalogen scraping terms of service: verify permitted use for internal medical tool
- Admin re-index UI: may live in a simple `/admin` route or settings modal
- Streaming responses for chat: nice-to-have for perceived performance
