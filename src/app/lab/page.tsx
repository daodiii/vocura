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
