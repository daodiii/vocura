'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import { csrfHeaders } from '@/lib/csrf-client';

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
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify({}),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const CHUNK_TIMEOUT_MS = 30_000;

      while (true) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), CHUNK_TIMEOUT_MS);
        });

        let result: ReadableStreamReadResult<Uint8Array>;
        try {
          result = await Promise.race([reader.read(), timeoutPromise]);
        } catch {
          setLog((prev) => [...prev, 'Tidsavbrudd: ingen data mottatt på 30 sekunder.']);
          setDone(false);
          reader.cancel();
          break;
        }

        const { done: streamDone, value } = result;
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
      const errMsg = (err as Error).message || 'Ukjent feil';
      if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('Failed')) {
        setLog((prev) => [...prev, `Nettverksfeil: Kunne ikke nå indekseringstjenesten. Sjekk internettforbindelsen.`]);
      } else {
        setLog((prev) => [...prev, `Reindeksering feilet: ${errMsg}`]);
      }
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
