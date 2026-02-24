'use client';

import { useState, useCallback, useEffect } from 'react';

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
            setError('Kunne ikke lagre utkast lokalt');
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
                .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                .join('');

            const res = await fetch('/api/export/epj', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: sections,
                    patientId: patientId || 'ukjent',
                    patientDisplayName: '',
                    templateType: `form-${formType}`,
                }),
            });

            const result = await res.json();
            if (result.success) {
                setPushed(true);
                localStorage.removeItem(storageKey);
                setLocalDraft(null);
                return result;
            } else {
                setError(result.error || 'Kunne ikke sende til EPJ');
                return null;
            }
        } catch (err) {
            console.error('EPJ push failed:', err);
            setError('Nettverksfeil ved sending til EPJ');
            return null;
        } finally {
            setPushing(false);
        }
    }, [formType, patientId, storageKey]);

    const exportPdf = useCallback(async (data: Record<string, unknown>, title: string, author: string) => {
        try {
            const sections = Object.entries(data)
                .filter(([, v]) => v !== '' && v !== null && v !== undefined)
                .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                .join('');

            const res = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            }
        } catch (err) {
            console.error('Export failed:', err);
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
