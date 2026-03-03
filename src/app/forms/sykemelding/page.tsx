'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, Calendar, User, Briefcase, FileCheck, AlertCircle, ChevronDown, Info, Loader2, XCircle } from 'lucide-react';
import { cn, validateFnr } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

// --- Validation types and helpers ---

type FieldErrors = Record<string, string>;
type TouchedFields = Record<string, boolean>;

interface ValidationRule {
    field: string;
    label: string;
}

const REQUIRED_FIELDS: ValidationRule[] = [
    { field: 'patientNavn', label: 'Pasientens navn' },
    { field: 'patientFnr', label: 'Fodselsnummer' },
    { field: 'arbeidsgiver', label: 'Arbeidsgivers navn' },
    { field: 'hoveddiagnoseKode', label: 'Diagnosekode' },
    { field: 'hoveddiagnoseBeskrivelse', label: 'Diagnosebeskrivelse' },
    { field: 'funksjonsnedsettelse', label: 'Funksjonsnedsettelse' },
    { field: 'arbeidsevne', label: 'Arbeidsevne' },
    { field: 'fom', label: 'Fra dato' },
    { field: 'tom', label: 'Til dato' },
];

export default function SykemeldingForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'sykemelding' });
    const [fnrError, setFnrError] = useState('');
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [touched, setTouched] = useState<TouchedFields>({});
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        // Patient info
        patientNavn: '',
        patientFnr: '',
        patientAdresse: '',
        patientTelefon: '',
        // Employer
        arbeidsgiver: '',
        arbeidsgiverOrgnr: '',
        stillingsprosent: '100',
        // Diagnosis
        hoveddiagnoseKode: '',
        hoveddiagnoseBeskrivelse: '',
        bidiagnoseKode: '',
        bidiagnoseBeskrivelse: '',
        kodesystem: 'ICPC-2',
        // Function
        funksjonsnedsettelse: '',
        arbeidsevne: '',
        // Period
        fom: '',
        tom: '',
        grad: '100',
        gradType: 'full',
        // Activity
        aktivitetMulig: 'nei',
        aktivitetBegrunnelse: '',
        tilrettelegging: '',
        // Prognosis
        prognose: '',
        tilbakeArbeid: '',
        // Doctor
        legeNavn: '',
        legeHPR: '',
        legeAdresse: '',
    });

    // Track the initial form state (after profile loads) to detect unsaved changes
    const initialFormData = useRef(formData);

    useEffect(() => {
        if (profile) {
            const updated = {
                ...formData,
                legeNavn: profile.name,
                legeHPR: profile.hprNumber || '',
                legeAdresse: profile.address || '',
            };
            setFormData(updated);
            initialFormData.current = updated;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    // Warn user about unsaved changes when navigating away (browser native dialog)
    useEffect(() => {
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData.current);
        const handler = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [formData]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const markTouched = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field: string) => {
        markTouched(field);
        if (field === 'patientFnr') {
            setFnrError(validateFnr(formData.patientFnr) || '');
        }
    };

    // --- Validation logic ---

    const validateFormData = useCallback((): FieldErrors => {
        const errors: FieldErrors = {};

        // Required field checks
        for (const { field, label } of REQUIRED_FIELDS) {
            const value = formData[field as keyof typeof formData];
            if (!value || (typeof value === 'string' && !value.trim())) {
                errors[field] = `${label} er obligatorisk`;
            }
        }

        // FNR format check
        if (formData.patientFnr && formData.patientFnr.trim()) {
            const fnrValidation = validateFnr(formData.patientFnr);
            if (fnrValidation) {
                errors.patientFnr = fnrValidation;
            }
        }

        // Date range check
        if (formData.fom && formData.tom && formData.tom < formData.fom) {
            errors.tom = 'Sluttdato kan ikke vaere for startdato';
        }

        // Conditional: if aktivitetMulig is 'ja', begrunnelse is required
        if (formData.aktivitetMulig === 'ja' && !formData.aktivitetBegrunnelse.trim()) {
            errors.aktivitetBegrunnelse = 'Medisinsk begrunnelse er obligatorisk nar arbeidsrelatert aktivitet ikke er mulig';
        }

        return errors;
    }, [formData]);

    const fieldErrors = validateFormData();
    const dateError = formData.fom && formData.tom && formData.tom < formData.fom;
    const hasErrors = Object.keys(fieldErrors).length > 0;

    // Helper: should we show an error for a specific field?
    const showFieldError = (field: string): boolean => {
        return (attemptedSubmit || touched[field]) && !!fieldErrors[field];
    };

    // Helper: get the input border class based on validation state
    const inputBorderClass = (field: string, extraValid?: string): string => {
        if (showFieldError(field)) {
            return 'border-[var(--color-error)] focus:border-[var(--color-error)]';
        }
        return extraValid || 'border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]';
    };

    const handleSave = () => {
        saveAsDraft(formData);
    };

    const handleSubmit = () => {
        setAttemptedSubmit(true);

        // Mark all required fields as touched
        const allTouched: TouchedFields = {};
        for (const { field } of REQUIRED_FIELDS) {
            allTouched[field] = true;
        }
        if (formData.aktivitetMulig === 'ja') {
            allTouched.aktivitetBegrunnelse = true;
        }
        setTouched(prev => ({ ...prev, ...allTouched }));

        // Re-validate
        const errors = validateFormData();
        if (Object.keys(errors).length > 0) {
            // Scroll to error summary
            setTimeout(() => {
                errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                errorSummaryRef.current?.focus();
            }, 100);
            return;
        }

        // Trim diagnosis codes and patient ID to avoid matching issues from trailing spaces
        const trimmedData = {
            ...formData,
            patientFnr: formData.patientFnr.trim(),
            hoveddiagnoseKode: formData.hoveddiagnoseKode.trim(),
            bidiagnoseKode: formData.bidiagnoseKode.trim(),
        };
        submitForm(trimmedData);
    };

    const handleExport = () => {
        exportPdf(formData, 'Sykemelding', profile?.name || 'Lege');
    };

    // Common ICPC-2 codes for sick leave
    const commonCodes = [
        { code: 'L02', label: 'Ryggsymptomer/plager' },
        { code: 'L03', label: 'Korsryggsymptomer' },
        { code: 'P76', label: 'Depressiv lidelse' },
        { code: 'P02', label: 'Akutt stressreaksjon' },
        { code: 'R74', label: 'Ovre luftveisinfeksjon' },
        { code: 'K86', label: 'Hypertensjon, ukomplisert' },
        { code: 'L84', label: 'Ryggsyndrom uten utstråling' },
        { code: 'P74', label: 'Angstlidelse' },
    ];

    // --- Required field label helper ---
    const RequiredLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
        <label htmlFor={htmlFor} className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">
            {children} <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
    );

    const OptionalLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
        <label htmlFor={htmlFor} className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">
            {children}
        </label>
    );

    // --- Inline error message component ---
    const FieldError = ({ field }: { field: string }) => {
        if (!showFieldError(field)) return null;
        return (
            <p className="text-[var(--color-error)] text-xs mt-1 flex items-center gap-1" role="alert">
                <XCircle className="w-3 h-3 flex-shrink-0" />
                {fieldErrors[field]}
            </p>
        );
    };

    // Base input class (shared across all text inputs)
    const baseInputClass = "bg-[var(--surface-hover)] border rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none placeholder:text-[var(--text-muted)] transition-colors duration-150";

    return (
        <div className="min-h-screen bg-[var(--surface-deep)]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[var(--surface-primary)]/80 border-b border-[rgba(255,255,255,0.06)]">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Breadcrumbs items={[
                        { label: 'Hjem', href: '/dashboard' },
                        { label: 'Skjemaer', href: '/forms' },
                        { label: 'Sykemelding' },
                    ]} />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button onClick={handleExport} className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer">
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={cn(
                                "text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-lg font-medium transition-colors duration-150",
                                submitted ? "bg-[#10B981] text-white font-semibold" : "bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white",
                                (submitting) && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                            {submitted ? 'Sendt til NAV' : 'Send til NAV'}
                        </button>
                    </div>
                </div>
            </div>

            <main id="main-content" className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[rgba(245,158,11,0.1)] rounded-xl flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(245,158,11,0.1)] text-[#F59E0B]">NAV</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        Sykemelding
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">Elektronisk sykemelding for innsending til NAV</p>
                </div>

                {submitted ? (
                    <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#10B981]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                            Sykemelding sendt til NAV
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">Skjemaet er sendt elektronisk og vil bli behandlet innen 1-3 virkedager.</p>
                        <p className="text-sm font-mono text-[var(--text-muted)] mb-8">Referanse: {submissionId || 'N/A'}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
                        {/* Validation Error Summary */}
                        {attemptedSubmit && hasErrors && (
                            <div
                                ref={errorSummaryRef}
                                tabIndex={-1}
                                role="alert"
                                aria-live="assertive"
                                className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-xl p-5 outline-none"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
                                    <h2 className="text-sm font-semibold text-[var(--color-error)]">
                                        Skjemaet inneholder {Object.keys(fieldErrors).length} feil som ma rettes
                                    </h2>
                                </div>
                                <ul className="space-y-1 ml-7">
                                    {Object.entries(fieldErrors).map(([field, message]) => (
                                        <li key={field} className="text-xs text-[var(--color-error)]">
                                            <button
                                                type="button"
                                                className="underline hover:no-underline text-left cursor-pointer"
                                                onClick={() => {
                                                    const el = document.querySelector(`[data-field="${field}"]`) as HTMLElement;
                                                    if (el) {
                                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        el.focus();
                                                    }
                                                }}
                                            >
                                                {message}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Section 1: Patient Information */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Pasientopplysninger</legend>
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Informasjon om den sykmeldte</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <RequiredLabel>Fullt navn</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="patientNavn"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        onBlur={() => handleBlur('patientNavn')}
                                        className={cn(baseInputClass, inputBorderClass('patientNavn'))}
                                        placeholder="Ola Nordmann"
                                        required
                                        aria-invalid={showFieldError('patientNavn')}
                                        aria-describedby={showFieldError('patientNavn') ? 'err-patientNavn' : undefined}
                                    />
                                    <FieldError field="patientNavn" />
                                </div>
                                <div>
                                    <RequiredLabel>Fodselsnummer (11 siffer)</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="patientFnr"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        onBlur={() => handleBlur('patientFnr')}
                                        className={cn(baseInputClass, 'font-mono', inputBorderClass('patientFnr'))}
                                        placeholder="01019012345"
                                        maxLength={11}
                                        required
                                        aria-invalid={showFieldError('patientFnr')}
                                        aria-describedby={showFieldError('patientFnr') ? 'err-patientFnr' : undefined}
                                    />
                                    <FieldError field="patientFnr" />
                                </div>
                                <div>
                                    <OptionalLabel>Adresse</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.patientAdresse}
                                        onChange={(e) => updateField('patientAdresse', e.target.value)}
                                        className={cn(baseInputClass, 'border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                        placeholder="Storgata 1, 0182 Oslo"
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Telefon</OptionalLabel>
                                    <input
                                        type="tel"
                                        value={formData.patientTelefon}
                                        onChange={(e) => updateField('patientTelefon', e.target.value)}
                                        className={cn(baseInputClass, 'border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                        placeholder="412 34 567"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 2: Employer */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Arbeidsgiver</legend>
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">2. Arbeidsgiver</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Informasjon om arbeidsforholdet</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <RequiredLabel>Arbeidsgivers navn</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="arbeidsgiver"
                                        value={formData.arbeidsgiver}
                                        onChange={(e) => updateField('arbeidsgiver', e.target.value)}
                                        onBlur={() => handleBlur('arbeidsgiver')}
                                        className={cn(baseInputClass, inputBorderClass('arbeidsgiver'))}
                                        placeholder="Firma AS"
                                        required
                                        aria-invalid={showFieldError('arbeidsgiver')}
                                    />
                                    <FieldError field="arbeidsgiver" />
                                </div>
                                <div>
                                    <OptionalLabel>Organisasjonsnummer</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.arbeidsgiverOrgnr}
                                        onChange={(e) => updateField('arbeidsgiverOrgnr', e.target.value)}
                                        className={cn(baseInputClass, 'font-mono border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                        placeholder="123 456 789"
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Stillingsprosent</OptionalLabel>
                                    <select
                                        value={formData.stillingsprosent}
                                        onChange={(e) => updateField('stillingsprosent', e.target.value)}
                                        className={cn(baseInputClass, 'border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                    >
                                        <option value="100">100%</option>
                                        <option value="80">80%</option>
                                        <option value="60">60%</option>
                                        <option value="50">50%</option>
                                        <option value="40">40%</option>
                                        <option value="20">20%</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 3: Diagnosis */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Diagnose</legend>
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">3. Diagnose</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Medisinsk diagnose etter ICPC-2 eller ICD-10</p>

                            <div className="mb-4">
                                <OptionalLabel>Kodesystem</OptionalLabel>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="kodesystem"
                                            value="ICPC-2"
                                            checked={formData.kodesystem === 'ICPC-2'}
                                            onChange={() => updateField('kodesystem', 'ICPC-2')}
                                            className="accent-[#5E6AD2]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)] font-medium">ICPC-2 (Fastlege)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="kodesystem"
                                            value="ICD-10"
                                            checked={formData.kodesystem === 'ICD-10'}
                                            onChange={() => updateField('kodesystem', 'ICD-10')}
                                            className="accent-[#5E6AD2]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)] font-medium">ICD-10 (Spesialist)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <RequiredLabel>Diagnosekode</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="hoveddiagnoseKode"
                                        value={formData.hoveddiagnoseKode}
                                        onChange={(e) => updateField('hoveddiagnoseKode', e.target.value)}
                                        onBlur={() => handleBlur('hoveddiagnoseKode')}
                                        className={cn(baseInputClass, 'font-mono', inputBorderClass('hoveddiagnoseKode'))}
                                        placeholder="L03"
                                        required
                                        aria-invalid={showFieldError('hoveddiagnoseKode')}
                                    />
                                    <FieldError field="hoveddiagnoseKode" />
                                </div>
                                <div className="col-span-2">
                                    <RequiredLabel>Diagnosebeskrivelse</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="hoveddiagnoseBeskrivelse"
                                        value={formData.hoveddiagnoseBeskrivelse}
                                        onChange={(e) => updateField('hoveddiagnoseBeskrivelse', e.target.value)}
                                        onBlur={() => handleBlur('hoveddiagnoseBeskrivelse')}
                                        className={cn(baseInputClass, inputBorderClass('hoveddiagnoseBeskrivelse'))}
                                        placeholder="Korsryggsymptomer"
                                        aria-invalid={showFieldError('hoveddiagnoseBeskrivelse')}
                                    />
                                    <FieldError field="hoveddiagnoseBeskrivelse" />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="bg-[rgba(94,106,210,0.08)] border border-[rgba(94,106,210,0.15)] rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#7B89DB]" />
                                    <span className="text-xs font-semibold text-[#7B89DB]">Vanlige ICPC-2-koder for sykemelding</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {commonCodes.map((item) => (
                                        <button
                                            key={item.code}
                                            type="button"
                                            onClick={() => {
                                                updateField('hoveddiagnoseKode', item.code);
                                                updateField('hoveddiagnoseBeskrivelse', item.label);
                                            }}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                                                formData.hoveddiagnoseKode === item.code
                                                    ? "bg-[#5E6AD2] text-white border-[#5E6AD2]"
                                                    : "bg-[var(--surface-elevated)] border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:border-[#5E6AD2] hover:text-[#7B89DB]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <OptionalLabel>Bidiagnosekode</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.bidiagnoseKode}
                                        onChange={(e) => updateField('bidiagnoseKode', e.target.value)}
                                        className={cn(baseInputClass, 'font-mono border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                        placeholder="Valgfritt"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <OptionalLabel>Bidiagnosebeskrivelse</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.bidiagnoseBeskrivelse}
                                        onChange={(e) => updateField('bidiagnoseBeskrivelse', e.target.value)}
                                        className={cn(baseInputClass, 'border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                        placeholder="Valgfritt"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 4: Functional Assessment */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Funksjonsnedsettelse og arbeidsevne</legend>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">4. Funksjonsnedsettelse og arbeidsevne</h2>

                            <div className="space-y-4">
                                <div>
                                    <RequiredLabel>Beskriv funksjonsnedsettelsen</RequiredLabel>
                                    <textarea
                                        data-field="funksjonsnedsettelse"
                                        value={formData.funksjonsnedsettelse}
                                        onChange={(e) => updateField('funksjonsnedsettelse', e.target.value)}
                                        onBlur={() => handleBlur('funksjonsnedsettelse')}
                                        className={cn(baseInputClass, 'min-h-[100px] resize-y', inputBorderClass('funksjonsnedsettelse'))}
                                        placeholder="Beskriv hvordan sykdommen/skaden pavirker pasientens funksjon..."
                                        required
                                        aria-invalid={showFieldError('funksjonsnedsettelse')}
                                    />
                                    <FieldError field="funksjonsnedsettelse" />
                                </div>
                                <div>
                                    <RequiredLabel>Vurdering av arbeidsevne</RequiredLabel>
                                    <textarea
                                        data-field="arbeidsevne"
                                        value={formData.arbeidsevne}
                                        onChange={(e) => updateField('arbeidsevne', e.target.value)}
                                        onBlur={() => handleBlur('arbeidsevne')}
                                        className={cn(baseInputClass, 'min-h-[80px] resize-y', inputBorderClass('arbeidsevne'))}
                                        placeholder="Beskriv i hvilken grad pasienten kan utfore arbeid..."
                                        required
                                        aria-invalid={showFieldError('arbeidsevne')}
                                    />
                                    <FieldError field="arbeidsevne" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 5: Period */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Sykmeldingsperiode</legend>
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">5. Sykmeldingsperiode</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Periode for sykemelding og eventuell gradering</p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <RequiredLabel>Fra dato</RequiredLabel>
                                    <input
                                        type="date"
                                        data-field="fom"
                                        value={formData.fom}
                                        onChange={(e) => updateField('fom', e.target.value)}
                                        onBlur={() => handleBlur('fom')}
                                        className={cn(baseInputClass, inputBorderClass('fom'))}
                                        aria-invalid={showFieldError('fom')}
                                    />
                                    <FieldError field="fom" />
                                </div>
                                <div>
                                    <RequiredLabel>Til dato</RequiredLabel>
                                    <input
                                        type="date"
                                        data-field="tom"
                                        value={formData.tom}
                                        onChange={(e) => updateField('tom', e.target.value)}
                                        onBlur={() => handleBlur('tom')}
                                        className={cn(baseInputClass, inputBorderClass('tom'))}
                                        aria-invalid={showFieldError('tom')}
                                    />
                                    <FieldError field="tom" />
                                </div>
                                <div>
                                    <RequiredLabel>Type</RequiredLabel>
                                    <select
                                        value={formData.gradType}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            updateField('gradType', newType);
                                            // Reset grad to default when switching away from 'gradert'
                                            // to avoid stale slider values leaking into submission data
                                            if (newType !== 'gradert') {
                                                updateField('grad', '100');
                                            }
                                        }}
                                        className={cn(baseInputClass, 'border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                    >
                                        <option value="full">100% sykemeldt</option>
                                        <option value="gradert">Gradert sykemelding</option>
                                        <option value="avventende">Avventende sykemelding</option>
                                        <option value="behandlingsdager">Behandlingsdager</option>
                                    </select>
                                </div>
                            </div>

                            {formData.gradType === 'gradert' && (
                                <div className="p-4 bg-[rgba(245,158,11,0.08)] rounded-lg border border-[rgba(245,158,11,0.2)] mb-4">
                                    <OptionalLabel>Sykmeldingsgrad (%)</OptionalLabel>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="20"
                                            max="80"
                                            step="10"
                                            value={formData.grad}
                                            onChange={(e) => updateField('grad', e.target.value)}
                                            className="flex-1"
                                        />
                                        <span className="text-lg font-bold text-[#F59E0B] w-16 text-right">{formData.grad}%</span>
                                    </div>
                                    <p className="text-xs text-[#F59E0B] mt-1">
                                        Pasienten kan arbeide {100 - parseInt(formData.grad)}% av stillingen
                                    </p>
                                </div>
                            )}
                        </fieldset>

                        {/* Section 6: Activity Requirements */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Aktivitetskrav</legend>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">6. Aktivitetskrav</h2>

                            <div className="mb-4">
                                <RequiredLabel>Er det medisinske grunner til at arbeidsrelatert aktivitet ikke er mulig?</RequiredLabel>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktivitet"
                                            value="ja"
                                            checked={formData.aktivitetMulig === 'ja'}
                                            onChange={() => updateField('aktivitetMulig', 'ja')}
                                            className="accent-[#5E6AD2]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktivitet"
                                            value="nei"
                                            checked={formData.aktivitetMulig === 'nei'}
                                            onChange={() => updateField('aktivitetMulig', 'nei')}
                                            className="accent-[#5E6AD2]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.aktivitetMulig === 'ja' && (
                                <div>
                                    <RequiredLabel>Medisinsk begrunnelse</RequiredLabel>
                                    <textarea
                                        data-field="aktivitetBegrunnelse"
                                        value={formData.aktivitetBegrunnelse}
                                        onChange={(e) => updateField('aktivitetBegrunnelse', e.target.value)}
                                        onBlur={() => handleBlur('aktivitetBegrunnelse')}
                                        className={cn(baseInputClass, 'min-h-[80px] resize-y', inputBorderClass('aktivitetBegrunnelse'))}
                                        placeholder="Begrunn hvorfor arbeidsrelatert aktivitet ikke er medisinsk forsvarlig..."
                                        aria-invalid={showFieldError('aktivitetBegrunnelse')}
                                    />
                                    <FieldError field="aktivitetBegrunnelse" />
                                </div>
                            )}

                            <div className="mt-4">
                                <OptionalLabel>Anbefalinger om tilrettelegging</OptionalLabel>
                                <textarea
                                    value={formData.tilrettelegging}
                                    onChange={(e) => updateField('tilrettelegging', e.target.value)}
                                    className={cn(baseInputClass, 'min-h-[60px] resize-y border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                    placeholder="Beskriv eventuell tilrettelegging som kan muliggjore (delvis) arbeid..."
                                />
                            </div>
                        </fieldset>

                        {/* Section 7: Prognosis */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Prognose</legend>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">7. Prognose</h2>
                            <div className="space-y-4">
                                <div>
                                    <OptionalLabel>Prognose for bedring</OptionalLabel>
                                    <textarea
                                        value={formData.prognose}
                                        onChange={(e) => updateField('prognose', e.target.value)}
                                        className={cn(baseInputClass, 'min-h-[60px] resize-y border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                        placeholder="Vurder prognose og forventet varighet av arbeidsuforhet..."
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Forventet tilbakeføring til arbeid</OptionalLabel>
                                    <select
                                        value={formData.tilbakeArbeid}
                                        onChange={(e) => updateField('tilbakeArbeid', e.target.value)}
                                        className={cn(baseInputClass, 'border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]')}
                                    >
                                        <option value="">Velg...</option>
                                        <option value="1-2uker">1-2 uker</option>
                                        <option value="2-4uker">2-4 uker</option>
                                        <option value="4-8uker">4-8 uker</option>
                                        <option value="8-12uker">8-12 uker</option>
                                        <option value="over12uker">Over 12 uker</option>
                                        <option value="usikkert">Usikkert</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 8: Doctor Info */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Sykmelder</legend>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">8. Sykmelder</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <OptionalLabel>Legens navn</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.legeNavn}
                                        className={cn(baseInputClass, 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]')}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>HPR-nummer</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.legeHPR}
                                        className={cn(baseInputClass, 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] font-mono')}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Adresse</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.legeAdresse}
                                        className={cn(baseInputClass, 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]')}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2 text-[#10B981]">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-semibold">GDPR-kompatibel innsending til NAV</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={handleSave} disabled={saving} className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-6 py-2.5 transition-colors duration-150 text-sm flex items-center gap-2 cursor-pointer">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Lagre utkast
                                </button>
                                <button type="submit" disabled={submitting} className={cn("bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-6 py-2.5 transition-colors duration-150 text-sm flex items-center gap-2 cursor-pointer", submitting && "opacity-50 cursor-not-allowed")}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                                    Send til NAV
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
