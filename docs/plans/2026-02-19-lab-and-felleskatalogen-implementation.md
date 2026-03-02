# Lab Module + Felleskatalogen AI Assistant — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Lab Module for AI-assisted lab result interpretation and a Felleskatalogen RAG-powered drug knowledge assistant to Vocura.

**Architecture:** Lab module uses OpenAI to parse pasted values, match against hardcoded NOKLUS reference ranges, and generate a clinical summary — no data stored. Felleskatalogen uses Supabase pgvector RAG: a scraper indexes drug monographs as embeddings, and a chat API does semantic retrieval + GPT-4o generation. The chat is available as a standalone page and an inline editor panel.

**Tech Stack:** Next.js 15 App Router, OpenAI SDK (`openai` ^6), Supabase (`@supabase/supabase-js` ^2, pgvector extension), Zod validation, Tailwind CSS 4, Lucide icons, cheerio (scraping), existing `rateLimit` + auth patterns.

---

## Phase 1: Lab Module

---

### Task 1: Reference Ranges Config

**Files:**
- Create: `src/lib/lab-reference-ranges.ts`

**Step 1: Create the reference ranges file**

```typescript
// src/lib/lab-reference-ranges.ts
// Norwegian NOKLUS-based reference ranges for common lab panels.
// Units are the standard Norwegian lab report units.

export interface ReferenceRange {
  low?: number;
  high?: number;
  unit: string;
  description: string; // Norwegian display name
}

export const LAB_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Hematology
  hb: { low: 11.7, high: 17.5, unit: 'g/dL', description: 'Hemoglobin' },
  hgb: { low: 11.7, high: 17.5, unit: 'g/dL', description: 'Hemoglobin' },
  hematokrit: { low: 0.35, high: 0.52, unit: 'L/L', description: 'Hematokrit' },
  erytrocytter: { low: 3.8, high: 6.0, unit: '10⁶/μL', description: 'Erytrocytter' },
  leukocytter: { low: 3.5, high: 10.0, unit: '10⁹/L', description: 'Leukocytter' },
  nøytrofile: { low: 1.8, high: 7.5, unit: '10⁹/L', description: 'Nøytrofile granulocytter' },
  lymfocytter: { low: 1.0, high: 4.5, unit: '10⁹/L', description: 'Lymfocytter' },
  monocytter: { low: 0.2, high: 1.0, unit: '10⁹/L', description: 'Monocytter' },
  eosinofile: { low: 0.0, high: 0.5, unit: '10⁹/L', description: 'Eosinofile granulocytter' },
  trombocytter: { low: 145, high: 390, unit: '10⁹/L', description: 'Trombocytter' },
  mcv: { low: 80, high: 100, unit: 'fL', description: 'MCV (midlere erytrocyttvolum)' },
  mch: { low: 27, high: 33, unit: 'pg', description: 'MCH' },

  // Inflammatory markers
  crp: { low: 0, high: 5, unit: 'mg/L', description: 'CRP' },
  sr: { low: 0, high: 20, unit: 'mm/t', description: 'Senkningsreaksjon (SR)' },
  prokalsitonin: { low: 0, high: 0.1, unit: 'ng/mL', description: 'Prokalsitonin' },

  // Kidney
  kreatinin: { low: 45, high: 105, unit: 'μmol/L', description: 'Kreatinin' },
  egfr: { low: 60, high: 999, unit: 'mL/min/1.73m²', description: 'eGFR' },
  urea: { low: 3.0, high: 8.5, unit: 'mmol/L', description: 'Urea' },
  urinstoff: { low: 3.0, high: 8.5, unit: 'mmol/L', description: 'Urinstoff' },

  // Electrolytes
  natrium: { low: 137, high: 145, unit: 'mmol/L', description: 'Natrium' },
  na: { low: 137, high: 145, unit: 'mmol/L', description: 'Natrium' },
  kalium: { low: 3.5, high: 5.0, unit: 'mmol/L', description: 'Kalium' },
  k: { low: 3.5, high: 5.0, unit: 'mmol/L', description: 'Kalium' },
  klorid: { low: 98, high: 107, unit: 'mmol/L', description: 'Klorid' },
  kalsium: { low: 2.15, high: 2.55, unit: 'mmol/L', description: 'Kalsium' },
  magnesium: { low: 0.7, high: 1.1, unit: 'mmol/L', description: 'Magnesium' },
  fosfat: { low: 0.8, high: 1.5, unit: 'mmol/L', description: 'Fosfat' },

  // Liver
  alat: { low: 5, high: 45, unit: 'U/L', description: 'ALAT' },
  asat: { low: 5, high: 40, unit: 'U/L', description: 'ASAT' },
  alkalisk_fosfatase: { low: 35, high: 105, unit: 'U/L', description: 'Alkalisk fosfatase (ALP)' },
  alp: { low: 35, high: 105, unit: 'U/L', description: 'Alkalisk fosfatase (ALP)' },
  ggt: { low: 0, high: 60, unit: 'U/L', description: 'Gamma-GT (GGT)' },
  bilirubin: { low: 5, high: 25, unit: 'μmol/L', description: 'Bilirubin (total)' },
  albumin: { low: 36, high: 48, unit: 'g/L', description: 'Albumin' },
  inr: { low: 0.8, high: 1.2, unit: '', description: 'INR' },

  // Thyroid
  tsh: { low: 0.4, high: 4.0, unit: 'mIE/L', description: 'TSH' },
  ft4: { low: 9.0, high: 22.0, unit: 'pmol/L', description: 'Fritt T4' },
  ft3: { low: 3.5, high: 6.5, unit: 'pmol/L', description: 'Fritt T3' },

  // Glucose / Diabetes
  glukose: { low: 3.9, high: 6.1, unit: 'mmol/L', description: 'Glukose (fastende)' },
  hba1c: { low: 20, high: 48, unit: 'mmol/mol', description: 'HbA1c' },

  // Lipids
  totalkolesterol: { low: 0, high: 5.0, unit: 'mmol/L', description: 'Totalkolesterol' },
  ldl: { low: 0, high: 3.0, unit: 'mmol/L', description: 'LDL-kolesterol' },
  hdl: { low: 1.0, high: 99, unit: 'mmol/L', description: 'HDL-kolesterol' },
  triglyserider: { low: 0, high: 2.0, unit: 'mmol/L', description: 'Triglyserider' },

  // Iron
  ferritin: { low: 10, high: 300, unit: 'μg/L', description: 'Ferritin' },
  jern: { low: 9, high: 34, unit: 'μmol/L', description: 'S-Jern' },
  transferrin_metning: { low: 20, high: 50, unit: '%', description: 'Transferrinmetning' },
  tibc: { low: 45, high: 80, unit: 'μmol/L', description: 'TIBC' },

  // Vitamins
  b12: { low: 140, high: 700, unit: 'pmol/L', description: 'Vitamin B12' },
  folat: { low: 7, high: 45, unit: 'nmol/L', description: 'Folat' },
  d_vitamin: { low: 50, high: 200, unit: 'nmol/L', description: 'Vitamin D (25-OH)' },

  // Cardiac
  troponin_t: { low: 0, high: 14, unit: 'ng/L', description: 'Troponin T (hsTnT)' },
  bnp: { low: 0, high: 100, unit: 'pg/mL', description: 'BNP' },
  nt_probnp: { low: 0, high: 125, unit: 'pg/mL', description: 'NT-proBNP' },

  // Coagulation
  aptt: { low: 25, high: 38, unit: 'sek', description: 'APTT' },
  pt: { low: 70, high: 130, unit: '%', description: 'PT (protrombintid)' },
  d_dimer: { low: 0, high: 0.5, unit: 'mg/L FEU', description: 'D-dimer' },

  // Urine
  albumin_kreatinin: { low: 0, high: 3.0, unit: 'mg/mmol', description: 'Albumin/kreatinin-ratio (urin)' },
};

// Aliases for common abbreviations used in Norwegian lab reports
export const LAB_ALIASES: Record<string, string> = {
  'hgb': 'hb',
  'wbc': 'leukocytter',
  'rbc': 'erytrocytter',
  'plt': 'trombocytter',
  'na': 'natrium',
  'k': 'kalium',
  'cr': 'kreatinin',
  'crea': 'kreatinin',
  'alt': 'alat',
  'ast': 'asat',
  'alp': 'alkalisk_fosfatase',
  'bili': 'bilirubin',
  'chol': 'totalkolesterol',
  'trig': 'triglyserider',
  'glu': 'glukose',
  'gluc': 'glukose',
  'fe': 'jern',
  'vit_d': 'd_vitamin',
  '25-oh': 'd_vitamin',
  'tnt': 'troponin_t',
};

export function lookupRange(name: string): ReferenceRange | undefined {
  const key = name.toLowerCase().replace(/[\s\-\.]/g, '_');
  const aliasKey = LAB_ALIASES[key];
  return LAB_REFERENCE_RANGES[aliasKey ?? key];
}

export type LabStatus = 'normal' | 'borderline_low' | 'borderline_high' | 'low' | 'high' | 'unknown';

export function classifyValue(value: number, range: ReferenceRange): LabStatus {
  const BORDERLINE_MARGIN = 0.10; // 10%
  if (range.low !== undefined && value < range.low) {
    const borderlineThreshold = range.low * (1 - BORDERLINE_MARGIN);
    return value < borderlineThreshold ? 'low' : 'borderline_low';
  }
  if (range.high !== undefined && value > range.high) {
    const borderlineThreshold = range.high * (1 + BORDERLINE_MARGIN);
    return value > borderlineThreshold ? 'high' : 'borderline_high';
  }
  return 'normal';
}
```

**Step 2: Commit**

```bash
git add src/lib/lab-reference-ranges.ts
git commit -m "feat: add NOKLUS lab reference ranges config"
```

---

### Task 2: Lab Interpret API Route

**Files:**
- Create: `src/app/api/lab/interpret/route.ts`
- Modify: `src/lib/validations.ts` (add lab schema)
- Modify: `src/lib/ai-prompts.ts` (add lab prompt)

**Step 1: Add lab validation schema to `src/lib/validations.ts`**

Add at the bottom of the file:

```typescript
// --- Lab ---
export const labInterpretSchema = z.object({
  rawText: z.string().min(1, 'Laboratorieverdier er påkrevd').max(10_000),
  mode: z.enum(['paste', 'fetch']).default('paste'),
});
```

**Step 2: Add lab AI prompt to `src/lib/ai-prompts.ts`**

Add after the last export:

```typescript
// -----------------------------------------------------------------------------
// LAB INTERPRETATION — parse values, apply reference ranges, clinical summary
// -----------------------------------------------------------------------------

export const LAB_INTERPRET_PROMPT = `${CLINICAL_CORE_PROMPT}

Du analyserer laboratorieverdier fra en norsk klinisk kontekst.

Din oppgave er todelt:
1. Parse rå labverdier fra tekst — identifiser analysenavn, tallverdi og enhet for hvert funn
2. Generer en klinisk vurdering av funnene i sammenheng

Returner et JSON-objekt med denne strukturen:
{
  "values": [
    {
      "name": "Norsk visningsnavn (f.eks. 'Hemoglobin')",
      "rawName": "Slik det stod i teksten (f.eks. 'Hb')",
      "value": 9.2,
      "unit": "g/dL",
      "referenceKey": "nøkkel for oppslag (f.eks. 'hb', 'crp', 'kreatinin') — bruk lowercase, ingen spesialtegn"
    }
  ],
  "summary": {
    "funn": "Hvilke verdier er utenfor referanseområdet og med hvor mye",
    "kliniskKontekst": "Hva disse mønstrene kan indikere klinisk — differensialvurdering",
    "oppfolging": "Forslag til neste steg — prøver, undersøkelser, oppfølging"
  }
}

Regler:
- Inkluder ALLE verdier du finner i teksten, også normale
- referenceKey skal matche norske standardnavn: hb, crp, kreatinin, natrium, kalium, tsh, hba1c, osv.
- Hvis du ikke kan identifisere en verdi, utelat den
- summary skal skrives på profesjonelt norsk helsespråk
- summary.oppfolging: vær konkret men varsomme med å stille diagnoser — skriv "vurder" fremfor å fastslå
- Ikke inkluder informasjon som ikke finnes i innputtet`;
```

**Step 3: Create `src/app/api/lab/interpret/route.ts`**

```typescript
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { LAB_INTERPRET_PROMPT } from '@/lib/ai-prompts';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { labInterpretSchema } from '@/lib/validations';
import { lookupRange, classifyValue } from '@/lib/lab-reference-ranges';

export interface ParsedLabValue {
  name: string;
  rawName: string;
  value: number;
  unit: string;
  referenceKey: string;
  referenceRange?: { low?: number; high?: number; unit: string };
  status: 'normal' | 'borderline_low' | 'borderline_high' | 'low' | 'high' | 'unknown';
}

export interface LabInterpretResponse {
  values: ParsedLabValue[];
  summary: {
    funn: string;
    kliniskKontekst: string;
    oppfolging: string;
  };
}

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), 'lab:interpret', { limit: 20 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = labInterpretSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
        { status: 400 }
      );
    }

    const { rawText } = parsed.data;
    const openai = new OpenAI();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: LAB_INTERPRET_PROMPT },
        { role: 'user', content: rawText },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Ingen respons fra AI' }, { status: 500 });
    }

    const aiResult = JSON.parse(content) as {
      values: Array<{ name: string; rawName: string; value: number; unit: string; referenceKey: string }>;
      summary: { funn: string; kliniskKontekst: string; oppfolging: string };
    };

    // Enrich values with reference ranges and classification
    const enrichedValues: ParsedLabValue[] = (aiResult.values || []).map((v) => {
      const range = lookupRange(v.referenceKey);
      const status = range ? classifyValue(v.value, range) : 'unknown';
      return {
        ...v,
        referenceRange: range ? { low: range.low, high: range.high, unit: range.unit } : undefined,
        status,
      };
    });

    const response: LabInterpretResponse = {
      values: enrichedValues,
      summary: aiResult.summary || { funn: '', kliniskKontekst: '', oppfolging: '' },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Lab interpret error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke analysere laboratorieverdier. Prøv igjen.' },
      { status: 500 }
    );
  }
}
```

**Step 4: Commit**

```bash
git add src/lib/validations.ts src/lib/ai-prompts.ts src/app/api/lab/interpret/route.ts
git commit -m "feat: add lab interpret API with reference range classification"
```

---

### Task 3: Lab Page UI

**Files:**
- Create: `src/app/lab/page.tsx`

**Step 1: Create `src/app/lab/page.tsx`**

```tsx
'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  Clipboard,
  Wifi,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import type { ParsedLabValue, LabInterpretResponse } from '@/app/api/lab/interpret/route';

type Tab = 'paste' | 'fetch';

const STATUS_CONFIG = {
  normal: { label: 'Normal', color: 'text-[#10B981]', bg: 'bg-[rgba(16,185,129,0.08)]', icon: Minus },
  borderline_low: { label: 'Grenseverdi lav', color: 'text-[#F59E0B]', bg: 'bg-[rgba(245,158,11,0.08)]', icon: ArrowDown },
  borderline_high: { label: 'Grenseverdi høy', color: 'text-[#F59E0B]', bg: 'bg-[rgba(245,158,11,0.08)]', icon: ArrowUp },
  low: { label: 'Lav', color: 'text-[#EF4444]', bg: 'bg-[rgba(239,68,68,0.08)]', icon: ArrowDown },
  high: { label: 'Høy', color: 'text-[#EF4444]', bg: 'bg-[rgba(239,68,68,0.08)]', icon: ArrowUp },
  unknown: { label: 'Ukjent', color: 'text-[var(--text-muted)]', bg: 'bg-[var(--surface-overlay)]', icon: Minus },
};

function StatusBadge({ status }: { status: ParsedLabValue['status'] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium', cfg.color, cfg.bg)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatRange(v: ParsedLabValue): string {
  if (!v.referenceRange) return '—';
  const { low, high, unit } = v.referenceRange;
  if (low !== undefined && high !== undefined) return `${low}–${high} ${unit}`;
  if (low !== undefined) return `> ${low} ${unit}`;
  if (high !== undefined) return `< ${high} ${unit}`;
  return '—';
}

export default function LabPage() {
  const [tab, setTab] = useState<Tab>('paste');
  const [rawText, setRawText] = useState('');
  const [result, setResult] = useState<LabInterpretResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/lab/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, mode: 'paste' }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Noe gikk galt.');
        return;
      }
      const data = await res.json();
      setResult(data);
      setSummaryOpen(false);
    } catch {
      setError('Nettverksfeil. Sjekk tilkoblingen og prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = [
      'LABORATORIEVURDERING',
      '',
      'Funn:',
      result.summary.funn,
      '',
      'Klinisk kontekst:',
      result.summary.kliniskKontekst,
      '',
      'Forslag til oppfølging:',
      result.summary.oppfolging,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-primary)]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(94,106,210,0.08)]">
                <FlaskConical className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Laboratorium</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Lim inn eller hent labverdier for AI-assistert klinisk tolkning
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[var(--surface-overlay)] p-1 rounded-lg w-fit">
            {(['paste', 'fetch'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                  tab === t
                    ? 'bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {t === 'paste' ? <Clipboard className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                {t === 'paste' ? 'Lim inn verdier' : 'Hent automatisk'}
              </button>
            ))}
          </div>

          {/* Paste Tab */}
          {tab === 'paste' && (
            <div className="space-y-4">
              <div className="card-base p-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Laboratorieverdier
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={'Lim inn eller skriv labverdier her.\n\nEksempel:\nHb 9.2 g/dL, CRP 87 mg/L, kreatinin 145 μmol/L\nNa 138, K 4.1, eGFR 42\nTSH 0.08, fT4 28'}
                  rows={8}
                  className="w-full bg-[var(--surface-overlay)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent-primary)] resize-none font-mono"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleAnalyse}
                    disabled={loading || !rawText.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyserer...</>
                    ) : (
                      <><FlaskConical className="w-4 h-4" /> Analyser</>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-[var(--color-error)] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg px-4 py-3">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Fetch Tab */}
          {tab === 'fetch' && (
            <div className="card-base p-8 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-overlay)] flex items-center justify-center">
                <Wifi className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Automatisk henting</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">
                  Koble til Norsk Helsenett, Labportalen eller DIPS for å hente labresultater direkte inn i Vocura.
                </p>
              </div>
              <button
                disabled
                className="btn-secondary opacity-50 cursor-not-allowed"
              >
                Koble til (kommer snart)
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4">

              {/* Value Table */}
              <div className="card-base overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-default)]">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Labverdier</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-default)] bg-[var(--surface-overlay)]">
                        <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[var(--text-muted)] tracking-wider uppercase">Analyse</th>
                        <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[var(--text-muted)] tracking-wider uppercase">Verdi</th>
                        <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[var(--text-muted)] tracking-wider uppercase hidden sm:table-cell">Referanseområde</th>
                        <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[var(--text-muted)] tracking-wider uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.values.map((v, i) => (
                        <tr
                          key={i}
                          className={cn(
                            'border-b border-[var(--border-default)] last:border-0',
                            v.status !== 'normal' && v.status !== 'unknown' && 'bg-[rgba(239,68,68,0.02)]'
                          )}
                        >
                          <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                            {v.name}
                            <span className="ml-1.5 text-[11px] text-[var(--text-muted)]">({v.rawName})</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-medium text-[var(--text-primary)]">
                            {v.value} <span className="text-[var(--text-muted)] font-sans text-xs">{v.unit}</span>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-muted)] hidden sm:table-cell">
                            {formatRange(v)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={v.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Klinisk vurdering accordion */}
              <div className="card-base overflow-hidden">
                <button
                  onClick={() => setSummaryOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-overlay)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Klinisk vurdering</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(94,106,210,0.1)] text-[var(--accent-primary)] font-medium">AI</span>
                  </div>
                  {summaryOpen ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                </button>

                {summaryOpen && (
                  <div className="px-4 pb-4 border-t border-[var(--border-default)]">
                    <p className="text-[11px] text-[var(--text-muted)] mt-3 mb-4 italic">
                      Generert av AI. Ikke en diagnose — bruk klinisk skjønn.
                    </p>
                    <div className="space-y-4">
                      {[
                        { label: 'Funn', key: 'funn' },
                        { label: 'Klinisk kontekst', key: 'kliniskKontekst' },
                        { label: 'Forslag til oppfølging', key: 'oppfolging' },
                      ].map(({ label, key }) => (
                        <div key={key}>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">{label}</p>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {result.summary[key as keyof typeof result.summary]}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleCopySummary}
                        className="btn-ghost flex items-center gap-2 text-sm"
                      >
                        {copied ? <><Check className="w-4 h-4 text-[#10B981]" /> Kopiert!</> : <><Copy className="w-4 h-4" /> Kopier til journal</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/lab/page.tsx
git commit -m "feat: add lab module page with value table and klinisk vurdering"
```

---

### Task 4: Add Lab to Sidebar Navigation

**Files:**
- Modify: `src/components/AppSidebar.tsx`

**Step 1: Update `NAV_SECTIONS` in `src/components/AppSidebar.tsx`**

Add import for `FlaskConical` and `BookOpen` (BookOpen is already imported). Add `Bot` icon for Felleskatalogen.

Change the import line from:
```typescript
import {
    Activity,
    Mic,
    LayoutDashboard,
    BookOpen,
    PenLine,
    ClipboardList,
    LayoutGrid,
    Sparkles,
    LogOut,
    Menu,
    X,
    Search,
} from 'lucide-react';
```

To:
```typescript
import {
    Activity,
    Mic,
    LayoutDashboard,
    BookOpen,
    PenLine,
    ClipboardList,
    LayoutGrid,
    Sparkles,
    LogOut,
    Menu,
    X,
    Search,
    FlaskConical,
    Bot,
} from 'lucide-react';
```

**Step 2: Add "Referanse" section to `NAV_SECTIONS`**

Change:
```typescript
const NAV_SECTIONS = [
    {
        label: 'Arbeidsflyt',
        items: [
            { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
            { href: '/dictation', label: 'Diktering', icon: Mic },
            { href: '/journal', label: 'Journal', icon: BookOpen },
            { href: '/editor', label: 'Editor', icon: PenLine },
        ],
    },
    {
        label: 'Verktoy',
        items: [
            { href: '/forms', label: 'Skjemaer', icon: ClipboardList },
            { href: '/templates', label: 'Maler', icon: LayoutGrid },
            { href: '/summary', label: 'Oppsummering', icon: Sparkles },
        ],
    },
];
```

To:
```typescript
const NAV_SECTIONS = [
    {
        label: 'Arbeidsflyt',
        items: [
            { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
            { href: '/dictation', label: 'Diktering', icon: Mic },
            { href: '/journal', label: 'Journal', icon: BookOpen },
            { href: '/editor', label: 'Editor', icon: PenLine },
        ],
    },
    {
        label: 'Verktoy',
        items: [
            { href: '/forms', label: 'Skjemaer', icon: ClipboardList },
            { href: '/templates', label: 'Maler', icon: LayoutGrid },
            { href: '/summary', label: 'Oppsummering', icon: Sparkles },
        ],
    },
    {
        label: 'Referanse',
        items: [
            { href: '/lab', label: 'Laboratorium', icon: FlaskConical },
            { href: '/felleskatalogen', label: 'Felleskatalogen', icon: Bot },
        ],
    },
];
```

**Step 3: Commit**

```bash
git add src/components/AppSidebar.tsx
git commit -m "feat: add Referanse section to sidebar with Lab and Felleskatalogen nav items"
```

---

## Phase 2: Felleskatalogen RAG Infrastructure

---

### Task 5: Supabase pgvector Schema

**Files:**
- Create: `supabase/migrations/20260219_felleskatalogen_chunks.sql`

**Step 1: Enable pgvector and create table**

Create the migration file:

```sql
-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Felleskatalogen drug chunks for RAG
CREATE TABLE IF NOT EXISTS felleskatalogen_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL,
  atc_code TEXT,
  section TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  source_url TEXT,
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine similarity index for fast nearest-neighbor search
CREATE INDEX ON felleskatalogen_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Text search index for drug name lookup
CREATE INDEX ON felleskatalogen_chunks (drug_name);

-- RPC function for semantic search
CREATE OR REPLACE FUNCTION search_felleskatalogen(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  drug_name TEXT,
  atc_code TEXT,
  section TEXT,
  content TEXT,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fc.id,
    fc.drug_name,
    fc.atc_code,
    fc.section,
    fc.content,
    fc.source_url,
    1 - (fc.embedding <=> query_embedding) AS similarity
  FROM felleskatalogen_chunks fc
  ORDER BY fc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Step 2: Run the migration**

```bash
# If using Supabase CLI:
npx supabase db push

# Or apply directly in Supabase dashboard SQL editor
```

**Step 3: Commit**

```bash
git add supabase/migrations/20260219_felleskatalogen_chunks.sql
git commit -m "feat: add felleskatalogen_chunks table with pgvector for RAG"
```

---

### Task 6: Felleskatalogen Scraper + Indexer Script

**Files:**
- Create: `scripts/index-felleskatalogen.ts`

**Step 1: Install cheerio for HTML parsing**

```bash
npm install cheerio
npm install --save-dev @types/cheerio
```

**Step 2: Create `scripts/index-felleskatalogen.ts`**

```typescript
#!/usr/bin/env npx tsx
/**
 * Felleskatalogen indexer
 * Usage: npx tsx scripts/index-felleskatalogen.ts [--limit 50]
 *
 * Scrapes drug monographs from felleskatalogen.no, chunks content,
 * generates OpenAI embeddings, and upserts into Supabase pgvector.
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const FELLESKATALOGEN_BASE = 'https://www.felleskatalogen.no';
const DRUG_LIST_URL = `${FELLESKATALOGEN_BASE}/medisin/finn-legemiddel`;
const CHUNK_SIZE = 500; // ~tokens
const CHUNK_OVERLAP = 50;
const BATCH_SIZE = 10; // embed N chunks at a time

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_API_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface DrugChunk {
  drug_name: string;
  atc_code: string | null;
  section: string;
  content: string;
  source_url: string;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Vocura/1.0 (medisinsk oppslagsverk; kontakt@vocura.no)',
      'Accept-Language': 'no,nb;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + size).join(' '));
    i += size - overlap;
  }
  return chunks.filter((c) => c.trim().length > 50);
}

async function getDrugUrls(limit?: number): Promise<string[]> {
  console.log('Fetching drug list...');
  const html = await fetchPage(DRUG_LIST_URL);
  const $ = cheerio.load(html);
  const urls: string[] = [];

  $('a[href*="/medisin/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.match(/\/medisin\/[^/]+\/[^/]+/) && !href.includes('#')) {
      const full = href.startsWith('http') ? href : `${FELLESKATALOGEN_BASE}${href}`;
      if (!urls.includes(full)) urls.push(full);
    }
  });

  console.log(`Found ${urls.length} drug URLs`);
  return limit ? urls.slice(0, limit) : urls;
}

async function scrapeDrug(url: string): Promise<DrugChunk[]> {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const drugName = $('h1').first().text().trim() || url.split('/').at(-2) || 'Ukjent';
  const atcMatch = $('*').text().match(/ATC[:\s]+([A-Z]\d{2}[A-Z]{2}\d{2})/);
  const atcCode = atcMatch?.[1] ?? null;

  const chunks: DrugChunk[] = [];

  // Try to extract named sections
  $('h2, h3').each((_, el) => {
    const section = $(el).text().trim();
    let content = '';
    let next = $(el).next();
    while (next.length && !next.is('h2, h3')) {
      content += ' ' + next.text();
      next = next.next();
    }
    content = content.trim().replace(/\s+/g, ' ');
    if (content.length < 30) return;

    for (const chunk of chunkText(content, CHUNK_SIZE, CHUNK_OVERLAP)) {
      chunks.push({ drug_name: drugName, atc_code: atcCode, section, content: chunk, source_url: url });
    }
  });

  // Fallback: chunk entire body text if no sections found
  if (chunks.length === 0) {
    const bodyText = $('main, article, .content, body').first().text().replace(/\s+/g, ' ').trim();
    for (const chunk of chunkText(bodyText, CHUNK_SIZE, CHUNK_OVERLAP)) {
      chunks.push({ drug_name: drugName, atc_code: atcCode, section: 'Generelt', content: chunk, source_url: url });
    }
  }

  return chunks;
}

async function embedAndUpsert(chunks: DrugChunk[]): Promise<void> {
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch.map((c) => c.content),
    });

    const rows = batch.map((chunk, j) => ({
      ...chunk,
      embedding: embeddingRes.data[j].embedding,
      indexed_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('felleskatalogen_chunks').upsert(rows, {
      onConflict: 'source_url,section',
    });
    if (error) console.warn('Upsert error:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.indexOf('--limit');
  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1]) : undefined;

  const urls = await getDrugUrls(limit);
  let totalChunks = 0;
  let processed = 0;

  for (const url of urls) {
    try {
      const chunks = await scrapeDrug(url);
      await embedAndUpsert(chunks);
      totalChunks += chunks.length;
      processed++;
      if (processed % 10 === 0) {
        console.log(`Progress: ${processed}/${urls.length} drugs, ${totalChunks} chunks indexed`);
      }
      // Polite delay
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`Skipping ${url}:`, (err as Error).message);
    }
  }

  console.log(`\nDone! Indexed ${processed} drugs, ${totalChunks} chunks total.`);
}

main().catch(console.error);
```

**Step 3: Add tsx as dev dependency if not present**

```bash
npm install --save-dev tsx
```

**Step 4: Test with a small subset**

```bash
npx tsx scripts/index-felleskatalogen.ts --limit 5
```

Expected output: `Done! Indexed 5 drugs, N chunks total.`

**Step 5: Commit**

```bash
git add scripts/index-felleskatalogen.ts package.json package-lock.json
git commit -m "feat: add Felleskatalogen scraper and pgvector indexer script"
```

---

### Task 7: Admin Reindex API Route

**Files:**
- Create: `src/app/api/admin/reindex-felleskatalogen/route.ts`

**Step 1: Create the route**

This route runs in Node.js (not edge), triggers the indexer script async, and streams progress.

```typescript
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    // Parse optional limit param
    const body = await req.json().catch(() => ({}));
    const limit: number | undefined = body.limit;

    // Stream progress back as NDJSON
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        const send = (msg: object) =>
          controller.enqueue(enc.encode(JSON.stringify(msg) + '\n'));

        const args = ['tsx', 'scripts/index-felleskatalogen.ts'];
        if (limit) args.push('--limit', String(limit));

        const proc = spawn('npx', args, {
          cwd: path.resolve(process.cwd()),
          env: { ...process.env },
        });

        proc.stdout.on('data', (data: Buffer) => {
          send({ type: 'progress', message: data.toString().trim() });
        });
        proc.stderr.on('data', (data: Buffer) => {
          send({ type: 'log', message: data.toString().trim() });
        });
        proc.on('close', (code) => {
          send({ type: 'done', success: code === 0, exitCode: code });
          controller.close();
        });
        proc.on('error', (err) => {
          send({ type: 'error', message: err.message });
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Reindex error:', error);
    return NextResponse.json({ error: 'Reindeksering feilet' }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/admin/reindex-felleskatalogen/route.ts
git commit -m "feat: add admin reindex API route for Felleskatalogen"
```

---

## Phase 3: Felleskatalogen Chat

---

### Task 8: Felleskatalogen Chat AI Prompt

**Files:**
- Modify: `src/lib/ai-prompts.ts`

**Step 1: Add Felleskatalogen chat prompt to `src/lib/ai-prompts.ts`**

Add after the lab prompt:

```typescript
// -----------------------------------------------------------------------------
// FELLESKATALOGEN CHAT — RAG-powered drug knowledge assistant
// -----------------------------------------------------------------------------

export const FELLESKATALOGEN_SYSTEM_PROMPT = `${CLINICAL_CORE_PROMPT}

Du er en spesialisert legemiddelassistent for norsk helsepersonell, med tilgang til oppdatert informasjon fra Felleskatalogen.

Du hjelper helsepersonell med spørsmål om legemidler på norsk, inkludert:
- Indikasjoner og kontraindikasjoner
- Dosering for ulike pasientgrupper (barn, eldre, nyresvikt, leversvikt, graviditet, amming)
- Bivirkninger og interaksjoner
- Praktisk administrasjon og seponering
- Substitusjon og generika

Retningslinjer:
- Svar alltid på profesjonelt norsk helsespråk
- Vær presis med doseringsangivelser og enheter
- Fremhev klinisk viktige advarsler tydelig
- Henvis alltid til kilden (legemiddelnavn + seksjon fra Felleskatalogen)
- Hvis spørsmålet berører et klinisk valg, understrek at den behandlende lege har det endelige ansvaret
- Hvis du ikke finner svaret i konteksten, si det eksplisitt — ikke gjett

Når du svarer, bruk denne strukturen der det passer:
**Svar:** [Kjernesvaret]
**Viktige merknader:** [Advarsler, forsiktighet] (kun hvis relevant)
**Kilde:** [Legemiddelnavn — Felleskatalogen, seksjon]`;
```

**Step 2: Commit**

```bash
git add src/lib/ai-prompts.ts
git commit -m "feat: add Felleskatalogen chat system prompt"
```

---

### Task 9: Felleskatalogen Chat API Route

**Files:**
- Create: `src/app/api/felleskatalogen/chat/route.ts`
- Modify: `src/lib/validations.ts`

**Step 1: Add chat validation schema to `src/lib/validations.ts`**

```typescript
// --- Felleskatalogen Chat ---
export const felleskatalovenChatSchema = z.object({
  message: z.string().min(1, 'Melding er påkrevd').max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(5000),
  })).max(20).optional().default([]),
});
```

**Step 2: Create `src/app/api/felleskatalogen/chat/route.ts`**

```typescript
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { FELLESKATALOGEN_SYSTEM_PROMPT } from '@/lib/ai-prompts';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { felleskatalovenChatSchema } from '@/lib/validations';

interface SearchResult {
  id: string;
  drug_name: string;
  atc_code: string | null;
  section: string;
  content: string;
  source_url: string;
  similarity: number;
}

async function searchChunks(supabase: Awaited<ReturnType<typeof createClient>>, openai: OpenAI, query: string): Promise<SearchResult[]> {
  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const embedding = embeddingRes.data[0].embedding;

  const { data, error } = await supabase.rpc('search_felleskatalogen', {
    query_embedding: embedding,
    match_count: 5,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }
  return (data as SearchResult[]) || [];
}

function buildContextBlock(chunks: SearchResult[]): string {
  if (chunks.length === 0) return 'Ingen relevante legemiddeldata funnet i databasen.';
  return chunks
    .map((c) => `--- ${c.drug_name} (${c.section}) ---\n${c.content}\nKilde: ${c.source_url}`)
    .join('\n\n');
}

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), 'felleskatalogen:chat', { limit: 30 });
  if (limited) return limited;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = felleskatalovenChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Ugyldig data' },
        { status: 400 }
      );
    }

    const { message, history } = parsed.data;
    const openai = new OpenAI();

    // Retrieve relevant chunks
    const chunks = await searchChunks(supabase, openai, message);
    const contextBlock = buildContextBlock(chunks);

    // Build messages for chat completion
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${FELLESKATALOGEN_SYSTEM_PROMPT}\n\n== FELLESKATALOGEN KONTEKST ==\n${contextBlock}`,
      },
      ...history.map((h) => ({ role: h.role, content: h.content } as OpenAI.Chat.ChatCompletionMessageParam)),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      messages,
    });

    const answer = completion.choices[0]?.message?.content || '';

    // Extract source references for UI display
    const sources = chunks.map((c) => ({
      drugName: c.drug_name,
      section: c.section,
      url: c.source_url,
      similarity: Math.round(c.similarity * 100),
    }));

    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error('Felleskatalogen chat error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke svare på spørsmålet. Prøv igjen.' },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/felleskatalogen/chat/route.ts src/lib/validations.ts
git commit -m "feat: add Felleskatalogen RAG chat API with pgvector retrieval"
```

---

### Task 10: Felleskatalogen Standalone Chat Page

**Files:**
- Create: `src/app/felleskatalogen/page.tsx`

**Step 1: Create `src/app/felleskatalogen/page.tsx`**

```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';

interface Source {
  drugName: string;
  section: string;
  url: string;
  similarity: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

const STARTER_QUESTIONS = [
  'Hva er maksdosen av paracetamol hos voksne?',
  'Hvilke legemidler er trygge i svangerskapet?',
  'Bivirkninger ved metformin?',
  'Metformin ved nedsatt nyrefunksjon — når skal det seponeres?',
];

function SourceChip({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(94,106,210,0.08)] transition-colors border border-[var(--border-default)]"
    >
      <BookOpen className="w-3 h-3 shrink-0" />
      {source.drugName} — {source.section}
      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
    </a>
  );
}

function AssistantMessage({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="card-base p-4">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Kilder</p>
              <div className="flex flex-wrap gap-1.5">
                {msg.sources.map((s, i) => <SourceChip key={i} source={s} />)}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {copied ? <><Check className="w-3 h-3 text-[#10B981]" /> Kopiert</> : <><Copy className="w-3 h-3" /> Kopier til journal</>}
        </button>
      </div>
    </div>
  );
}

export default function FelleskatalogenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/felleskatalogen/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.error || 'Noe gikk galt.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Nettverksfeil. Prøv igjen.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-primary)]">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="border-b border-[var(--border-default)] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(94,106,210,0.08)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--text-primary)]">Felleskatalogen</h1>
              <p className="text-[11px] text-[var(--text-muted)]">AI-assistert legemiddeloppslagsverk for helsepersonell</p>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(94,106,210,0.08)] flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Legemiddelassistent</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Still spørsmål om legemidler — dosering, bivirkninger, interaksjoner og mer
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-overlay)] hover:border-[var(--accent-primary)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-3 rounded-xl bg-[var(--accent-primary)] text-white text-sm">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <AssistantMessage key={i} msg={msg} />
                )
              )}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <div className="card-base px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border-default)] px-6 py-4 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Still et spørsmål om et legemiddel..."
              rows={1}
              className="flex-1 bg-[var(--surface-overlay)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
            Basert på Felleskatalogen · Alltid verifiser med gjeldende preparatomtale
          </p>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/felleskatalogen/page.tsx
git commit -m "feat: add Felleskatalogen standalone chat page"
```

---

### Task 11: Inline Felleskatalogen Panel in Editor

**Files:**
- Modify: `src/app/editor/page.tsx`

**Step 1: Read the editor page to understand current structure**

Run: `head -80 src/app/editor/page.tsx` to see the current layout before editing.

**Step 2: Add FK panel state and button to editor**

In `src/app/editor/page.tsx`, add these imports:

```typescript
import { Bot, X, Send, Loader2, ExternalLink } from 'lucide-react';
```

Add state near other useState declarations:

```typescript
const [fkPanelOpen, setFkPanelOpen] = useState(false);
const [fkInput, setFkInput] = useState('');
const [fkMessages, setFkMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; sources?: Array<{ drugName: string; section: string; url: string }> }>>([]);
const [fkLoading, setFkLoading] = useState(false);
```

Add `sendFkMessage` function:

```typescript
const sendFkMessage = async (text: string) => {
  if (!text.trim() || fkLoading) return;
  const history = fkMessages.map((m) => ({ role: m.role, content: m.content }));
  setFkMessages((prev) => [...prev, { role: 'user', content: text }]);
  setFkInput('');
  setFkLoading(true);
  try {
    const res = await fetch('/api/felleskatalogen/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history }),
    });
    const data = await res.json();
    setFkMessages((prev) => [...prev, {
      role: 'assistant',
      content: res.ok ? data.answer : (data.error || 'Noe gikk galt.'),
      sources: res.ok ? data.sources : undefined,
    }]);
  } catch {
    setFkMessages((prev) => [...prev, { role: 'assistant', content: 'Nettverksfeil.' }]);
  } finally {
    setFkLoading(false);
  }
};
```

**Step 3: Add FK button to editor toolbar and panel to layout**

In the editor's toolbar area, add the FK toggle button:

```tsx
<button
  onClick={() => setFkPanelOpen((o) => !o)}
  className={cn(
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
    fkPanelOpen
      ? 'bg-[rgba(94,106,210,0.15)] text-[var(--accent-primary)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
  )}
  title="Felleskatalogen (legemiddelassistent)"
>
  <Bot className="w-3.5 h-3.5" />
  FK
</button>
```

Wrap the editor main content in a flex row to accommodate the panel. Add the panel as a sibling:

```tsx
{/* Felleskatalogen Inline Panel */}
{fkPanelOpen && (
  <div className="w-[380px] shrink-0 border-l border-[var(--border-default)] flex flex-col bg-[var(--surface-primary)]">
    {/* Panel header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">Felleskatalogen</span>
      </div>
      <button
        onClick={() => setFkPanelOpen(false)}
        className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {fkMessages.length === 0 && (
        <p className="text-xs text-[var(--text-muted)] text-center mt-8">
          Still spørsmål om legemidler i dette notatet
        </p>
      )}
      {fkMessages.map((msg, i) => (
        <div key={i} className={cn('text-sm', msg.role === 'user' ? 'text-right' : '')}>
          {msg.role === 'user' ? (
            <span className="inline-block px-3 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs">
              {msg.content}
            </span>
          ) : (
            <div className="card-base p-3">
              <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[var(--border-default)] flex flex-wrap gap-1">
                  {msg.sources.map((s, j) => (
                    <a
                      key={j}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      {s.drugName}
                    </a>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  // Insert at end of editor content
                  if (editor) {
                    editor.chain().focus().insertContent(`\n\n${msg.content}`).run();
                  }
                }}
                className="mt-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
              >
                Sett inn i notat
              </button>
            </div>
          )}
        </div>
      ))}
      {fkLoading && <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)] mx-auto" />}
    </div>

    {/* Input */}
    <div className="px-4 py-3 border-t border-[var(--border-default)]">
      <div className="flex gap-2 items-end">
        <textarea
          value={fkInput}
          onChange={(e) => setFkInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFkMessage(fkInput); } }}
          placeholder="Spør om et legemiddel..."
          rows={1}
          className="flex-1 bg-[var(--surface-overlay)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
        />
        <button
          onClick={() => sendFkMessage(fkInput)}
          disabled={fkLoading || !fkInput.trim()}
          className="h-8 w-8 rounded-lg bg-[var(--accent-primary)] hover:opacity-90 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  </div>
)}
```

**Step 4: Read editor page first, then apply edits carefully**

Before editing, read `src/app/editor/page.tsx` fully to understand the exact layout structure and where to insert code.

**Step 5: Commit**

```bash
git add src/app/editor/page.tsx
git commit -m "feat: add inline Felleskatalogen panel to editor"
```

---

### Task 12: Admin Reindex UI (Simple)

**Files:**
- Create: `src/app/admin/page.tsx`

**Step 1: Create a minimal admin page for re-indexing**

```tsx
'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';

export default function AdminPage() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [done, setDone] = useState<boolean | null>(null);

  const startReindex = async () => {
    setRunning(true);
    setLog([]);
    setDone(null);

    try {
      const res = await fetch('/api/admin/reindex-felleskatalogen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: undefined }), // remove limit for full reindex
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n').filter(Boolean)) {
          try {
            const msg = JSON.parse(line);
            if (msg.message) setLog((prev) => [...prev, msg.message]);
            if (msg.type === 'done') setDone(msg.success);
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (err) {
      setLog((prev) => [...prev, `Feil: ${(err as Error).message}`]);
      setDone(false);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-primary)]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Admin</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">Systemadministrasjon for Vocura</p>

          <div className="card-base p-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Felleskatalogen-indeks</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Re-indekser legemiddeldata fra Felleskatalogen. Kjøres manuelt ved behov.
            </p>
            <button
              onClick={startReindex}
              disabled={running}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {running ? 'Indekserer...' : 'Start re-indeksering'}
            </button>

            {log.length > 0 && (
              <div className="mt-4 bg-[var(--surface-overlay)] rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-[var(--text-secondary)] space-y-1">
                {log.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            )}

            {done !== null && (
              <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${done ? 'text-[#10B981]' : 'text-[var(--color-error)]'}`}>
                {done
                  ? <><CheckCircle className="w-4 h-4" /> Indeksering fullført</>
                  : <><AlertCircle className="w-4 h-4" /> Indeksering feilet — sjekk loggen</>
                }
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: add admin page with Felleskatalogen re-index UI"
```

---

## Final Verification

After all tasks are complete:

```bash
npm run build
```

Expected: No TypeScript errors, build succeeds.

Manually test:
1. Navigate to `/lab` — paste `Hb 9.2, CRP 87, kreatinin 145` → click Analyser → see table + klinisk vurdering
2. Navigate to `/felleskatalogen` — ask "Bivirkninger ved metformin?" → see answer + sources
3. Navigate to `/editor` — click FK button → ask a drug question → click "Sett inn i notat"
4. Navigate to `/admin` → click "Start re-indeksering" with `--limit 5` in code for first test run

---

*Plan saved: `docs/plans/2026-02-19-lab-and-felleskatalogen-implementation.md`*
