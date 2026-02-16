'use client';

import { useState, useCallback } from 'react';

interface UseFormSubmissionOptions {
    formType: string;
    patientId?: string;
}

interface FormSubmissionResult {
    id: string;
    formType: string;
    data: Record<string, unknown>;
    status: string;
    score?: number;
    createdAt: string;
}

export function useFormSubmission({ formType, patientId }: UseFormSubmissionOptions) {
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveAsDraft = useCallback(async (data: Record<string, unknown>, score?: number) => {
        setSaving(true);
        setError(null);
        try {
            const body: Record<string, unknown> = {
                formType,
                data,
                status: 'draft',
            };
            if (patientId) body.patientId = patientId;
            if (score !== undefined) body.score = score;

            let res;
            if (submissionId) {
                res = await fetch(`/api/forms/submissions/${submissionId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            } else {
                res = await fetch('/api/forms/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            }

            if (res.ok) {
                const result: FormSubmissionResult = await res.json();
                setSubmissionId(result.id);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
                return result;
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || 'Kunne ikke lagre skjema');
                return null;
            }
        } catch (err) {
            console.error('Save failed:', err);
            setError('Nettverksfeil ved lagring');
            return null;
        } finally {
            setSaving(false);
        }
    }, [formType, patientId, submissionId]);

    const submitForm = useCallback(async (data: Record<string, unknown>, score?: number) => {
        setSubmitting(true);
        setError(null);
        try {
            const body: Record<string, unknown> = {
                formType,
                data,
                status: 'submitted',
            };
            if (patientId) body.patientId = patientId;
            if (score !== undefined) body.score = score;

            let res;
            if (submissionId) {
                res = await fetch(`/api/forms/submissions/${submissionId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...body, status: 'submitted' }),
                });
            } else {
                res = await fetch('/api/forms/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...body, status: 'submitted' }),
                });
            }

            if (res.ok) {
                const result: FormSubmissionResult = await res.json();
                setSubmissionId(result.id);
                setSubmitted(true);
                return result;
            } else {
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || 'Kunne ikke sende inn skjema');
                return null;
            }
        } catch (err) {
            console.error('Submit failed:', err);
            setError('Nettverksfeil ved innsending');
            return null;
        } finally {
            setSubmitting(false);
        }
    }, [formType, patientId, submissionId]);

    const exportPdf = useCallback(async (data: Record<string, unknown>, title: string, author: string) => {
        try {
            // Build a simple HTML representation of the form data
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

    return {
        submissionId,
        saving,
        submitting,
        saved,
        submitted,
        error,
        saveAsDraft,
        submitForm,
        exportPdf,
    };
}
