# Vocura Companion Tool Pivot — Design Document

**Date:** 2026-02-24
**Status:** Approved
**Author:** Claude + Dao

## Problem

Norwegian healthcare professionals won't trust a startup to store sensitive patient data (personnummer, clinical notes, form submissions). They already use established EPJ systems (System X, Infodoc, Pasientsky, Pridok, etc.). Vocura must pivot from a standalone journal/storage system to a **companion tool**: handle dictation + AI structuring, then push the finished note into the doctor's existing EPJ via **Leyr** (Norwegian healthcare API aggregator).

## Decisions

- **Companion tool model** — Vocura = dictation + AI + push to EPJ, not a storage system
- **Leyr API aggregator** for EPJ integration (covers DIPS, EG Pasientsky, Pridok)
- **Transient data model** — no permanent patient records, session-only processing
- **Full pg_dump backup** before any destructive migration
- **Summary page stays** as a stateless session tool

## New Data Flow

```
[Optional] EPJ patient search → Leyr API → patient context in browser state
Audio capture → POST /api/transcribe → OpenAI Whisper → transcript text (browser only)
→ POST /api/ai/structure-note → GPT-4o → structured HTML (browser only)
→ Doctor reviews/edits in Tiptap editor (browser state + localStorage backup)
→ POST /api/export/epj → LeyrAdapter.pushNote() → EPJ system
   OR POST /api/export/pdf → PDF download (fallback)
   OR Copy to clipboard (fallback)
```

Nothing persists in Vocura's database except: user accounts, templates, audit log hashes, EPJ integration credentials (encrypted).

## Architecture

### EPJ Adapter Pattern

A TypeScript interface `EPJAdapter` with two implementations:
- **LeyrAdapter** — calls Leyr REST API (OAuth2 auth, token caching, retry with backoff)
- **ManualExportAdapter** — fallback when no EPJ is connected (routes to PDF/clipboard)

Factory: `getEPJAdapter(userId)` loads per-user credentials from DB, returns correct adapter.

### New API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/export/epj` | POST | Push structured note to EPJ via Leyr |
| `/api/import/patient-context` | GET | Search/fetch patient from EPJ |
| `/api/user/epj-integration` | GET/POST/DELETE | Manage Leyr credentials (encrypted at rest) |

### Database Changes

**Added:** `epj_integrations` table (per-user Leyr credentials, AES-256-GCM encrypted)

**Removed (Phase 5, after backup):** `patients`, `journal_entries`, `recordings`, `transcripts`, `form_submissions`

**Kept:** `users`, `templates`, `audit_logs`

### UI Changes

- **Editor:** "Lagre kladd"/"Godkjenn" → "Send til EPJ" with confirmation modal
- **Dashboard:** Patient search from EPJ instead of local DB; no recording save
- **Sidebar:** "Journal" → "EPJ-aktivitet"; new "Innstillinger" link
- **Forms:** All 17 forms push to EPJ instead of saving to DB
- **New:** Settings page with EPJ connection config, Activity page showing push history

## Implementation Phases

1. **Infrastructure** — Prisma model, EPJ adapter layer, new API routes (backward-compatible)
2. **Editor Integration** — "Send til EPJ" button, localStorage-only auto-save
3. **Dashboard Integration** — EPJ patient search, remove recording saves
4. **Settings + Forms** — Settings page, update useFormSubmission hook, sidebar navigation
5. **Database Cleanup** — Backup, drop sensitive tables, remove deprecated routes/pages

## Norwegian EPJ Ecosystem Context

### Leyr (leyr.io)
- Norwegian API aggregator for EPJ integration
- Partnerships with DIPS and EG Pasientsky
- Read/write medical notes, patient details, appointments
- ~2 week integration time via unified API

### Key EPJ Systems
- **EG Pasientsky** — cloud-native, API-accessible, target for first integration via Leyr
- **System X / Hove Total** — ~40% of GPs, no known public API
- **EG Infodoc** — legacy dominant system, no known public API
- **CGM Pridok** — web-based, Leyr pilot integration
- **DIPS** — dominant hospital EPJ, accessible via Open DIPS + Leyr

### Competitor: Journalia
- Norwegian AI clinical documentation tool
- Already integrates with EG Pasientsky and Pridok
- Proves the companion tool model works in the Norwegian GP market

### Future: SMART on FHIR (EPJ-løftet)
- Government initiative requiring EPJ vendors to open APIs
- Standard path for launching third-party apps inside EPJs
- Only Aspit has implemented so far; broader rollout underway
