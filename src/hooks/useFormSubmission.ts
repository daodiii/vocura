'use client';

import { useState, useCallback, useEffect } from 'react';
import { csrfHeaders } from '@/lib/csrf-client';

function escapeHtml(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

interface UseFormSubmissionOptions {
    formType: string;
    patientId?: string;
}

export function useFormSubmission({ formType, patientId }: UseFormSubmissionOptions) {
    const [saving, setSaving] = useState(false);
    const [pushing, setPushing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [pushed, setPushed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localDraft, setLocalDraft] = useState<Record<string, unknown> | null>(null);

    const storageKey = `vocura_form_draft_${formType}`;

    // Restore draft from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.data && Date.now() - (parsed.timestamp || 0) < 24 * 60 * 60 * 1000) {
                    setLocalDraft(parsed.data);
                }
            }
        } catch { /* ignore */ }
    }, [storageKey]);

    const saveAsDraft = useCallback((data: Record<string, unknown>, _score?: number) => {
        setSaving(true);
        setError(null);
        try {
            localStorage.setItem(storageKey, JSON.stringify({ data, timestamp: Date.now() }));
            setLocalDraft(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError('Kunne ikke lagre utkast lokalt. Nettleseren har kanskje ikke nok lagringsplass.');
        } finally {
            setSaving(false);
        }
    }, [storageKey]);

    const pushToEPJ = useCallback(async (data: Record<string, unknown>, title: string) => {
        setPushing(true);
        setError(null);
        try {
            const sections = Object.entries(data)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</p>`)
                .join('');

            const res = await fetch('/api/export/epj', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify({
                    title,
                    content: sections,
                    patientId: patientId || 'ukjent',
                    patientDisplayName: '',
                    templateType: `form-${formType}`,
                }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    setError('Økten din har utløpt. Logg inn på nytt og prøv igjen.');
                } else if (res.status === 400) {
                    const text = await res.text().catch(() => '');
                    setError(text || 'Skjemadata er ugyldige. Sjekk at alle obligatoriske felt er fylt ut.');
                } else if (res.status === 502) {
                    setError('EPJ-systemet er ikke tilgjengelig. Prøv igjen om noen minutter, eller bruk PDF-eksport.');
                } else {
                    const text = await res.text().catch(() => '');
                    setError(text || `Kunne ikke sende skjema til EPJ (feilkode ${res.status}). Prøv igjen.`);
                }
                return null;
            }

            const result = await res.json();
            if (result.success) {
                setPushed(true);
                localStorage.removeItem(storageKey);
                setLocalDraft(null);
                return result;
            } else {
                setError(result.error || 'Kunne ikke sende skjema til EPJ. Bruk PDF-eksport som alternativ.');
                return null;
            }
        } catch (err) {
            console.error('EPJ push failed:', err);
            setError('Kunne ikke nå EPJ-tjenesten. Sjekk internettforbindelsen og prøv igjen, eller bruk PDF-eksport.');
            return null;
        } finally {
            setPushing(false);
        }
    }, [formType, patientId, storageKey]);

    const exportPdf = useCallback(async (data: Record<string, unknown>, title: string, author: string) => {
        try {
            const sections = Object.entries(data)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</p>`)
                .join('');

            const res = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
                body: JSON.stringify({
                    content: sections,
                    title,
                    type: 'form',
                    author,
                }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${formType}-${new Date().toISOString().split('T')[0]}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                setError('Kunne ikke eksportere PDF. Prøv igjen eller kopier skjemadataene manuelt.');
            }
        } catch (err) {
            console.error('PDF-eksport feilet:', err);
            setError('Kunne ikke koble til eksporttjenesten. Sjekk internettforbindelsen og prøv igjen.');
        }
    }, [formType]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(storageKey);
        setLocalDraft(null);
    }, [storageKey]);

    return {
        saving,
        pushing,
        saved,
        pushed,
        error,
        localDraft,
        saveAsDraft,
        pushToEPJ,
        exportPdf,
        clearDraft,
        // Backwards-compatible aliases (to be removed when all forms are migrated)
        submissionId: null as string | null,
        submitting: pushing,
        submitted: pushed,
        submitForm: async (data: Record<string, unknown>, _score?: number) => {
            return pushToEPJ(data, formType);
        },
    };
}
