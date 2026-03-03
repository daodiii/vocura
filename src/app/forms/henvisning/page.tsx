'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Send, AlertCircle, Info, FileText, Plus, Trash2, Paperclip, Loader2, XCircle } from 'lucide-react';
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
    { field: 'spesialistType', label: 'Spesialitet' },
    { field: 'diagnoseKode', label: 'Diagnosekode' },
    { field: 'diagnoseBeskrivelse', label: 'Diagnosebeskrivelse' },
    { field: 'sykehistorie', label: 'Sykehistorie og aktuell problemstilling' },
];

export default function HenvisningForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'henvisning' });
    const [fnrError, setFnrError] = useState('');
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [touched, setTouched] = useState<TouchedFields>({});
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        // Referring doctor (read-only)
        legeNavn: '',
        legeHPR: '9876543',
        legeAdresse: 'Storgata 1, 0182 Oslo',
        legeTelefon: '22 33 44 55',
        // Patient
        patientNavn: '',
        patientFnr: '',
        patientAdresse: '',
        patientTelefon: '',
        // Urgency
        hastegrad: 'normal',
        // Referral to
        spesialistType: '',
        institusjon: '',
        spesifikkLege: '',
        // Clinical info
        kodesystem: 'ICPC-2',
        diagnoseKode: '',
        diagnoseBeskrivelse: '',
        sykehistorie: '',
        medisiner: '',
        undersokelseFunn: '',
        // Purpose
        formaal: [] as string[],
        spesifikkeSporsmal: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, legeNavn: profile.name }));
        }
    }, [profile]);

    const [vedlegg, setVedlegg] = useState<string[]>([]);
    const [nyttVedlegg, setNyttVedlegg] = useState('');

    const updateField = (field: string, value: string | string[]) => {
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

        // At least one formaal should be selected (recommended but we make it required)
        if (formData.formaal.length === 0) {
            errors.formaal = 'Velg minst ett formal med henvisningen';
        }

        return errors;
    }, [formData]);

    const fieldErrors = validateFormData();
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
        return extraValid || 'border-[#DDD7CE] focus:border-[#A0714F]';
    };

    const handleSave = () => {
        saveAsDraft(formData as unknown as Record<string, unknown>);
    };

    const handleSubmit = () => {
        setAttemptedSubmit(true);

        // Mark all required fields as touched
        const allTouched: TouchedFields = {};
        for (const { field } of REQUIRED_FIELDS) {
            allTouched[field] = true;
        }
        allTouched.formaal = true;
        setTouched(prev => ({ ...prev, ...allTouched }));

        // Re-validate
        const errors = validateFormData();
        if (Object.keys(errors).length > 0) {
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
            diagnoseKode: formData.diagnoseKode.trim(),
        };
        submitForm(trimmedData as unknown as Record<string, unknown>);
    };

    const toggleFormaal = (item: string) => {
        markTouched('formaal');
        setFormData(prev => ({
            ...prev,
            formaal: prev.formaal.includes(item)
                ? prev.formaal.filter(f => f !== item)
                : [...prev.formaal, item],
        }));
    };

    const addVedlegg = () => {
        if (nyttVedlegg.trim()) {
            setVedlegg(prev => [...prev, nyttVedlegg.trim()]);
            setNyttVedlegg('');
        }
    };

    const removeVedlegg = (index: number) => {
        setVedlegg(prev => prev.filter((_, i) => i !== index));
    };

    // Common ICPC-2 codes for referrals
    const commonCodes = [
        { code: 'L03', label: 'Korsryggsymptomer' },
        { code: 'K86', label: 'Hypertensjon' },
        { code: 'D12', label: 'Forstoppelse' },
        { code: 'L84', label: 'Ryggsyndrom uten utstråling' },
        { code: 'T90', label: 'Diabetes type 2' },
        { code: 'K77', label: 'Hjertesvikt' },
        { code: 'N87', label: 'Basalganglielidelse/Parkinsonisme' },
        { code: 'L86', label: 'Ryggsyndrom med utstråling' },
    ];

    const formaalOptions = [
        'Vurdering',
        'Utredning',
        'Behandling',
        'Operasjon',
        'Second opinion',
    ];

    // --- Label helpers ---
    const RequiredLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
        <label htmlFor={htmlFor} className="form-label">
            {children} <span className="text-[var(--color-error)]" aria-hidden="true">*</span>
        </label>
    );

    const OptionalLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
        <label htmlFor={htmlFor} className="form-label">
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

    return (
        <div className="min-h-screen bg-[var(--surface-primary)]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[#FFFDF9] border-b border-[#DDD7CE]">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Breadcrumbs items={[
                        { label: 'Hjem', href: '/dashboard' },
                        { label: 'Skjemaer', href: '/forms' },
                        { label: 'Henvisning' },
                    ]} />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-ghost text-xs flex items-center gap-1.5 !py-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#3D8B6E]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button
                            onClick={() => exportPdf(formData as unknown as Record<string, unknown>, 'Henvisning til spesialist', formData.legeNavn)}
                            className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5",
                                submitted ? "bg-[#3D8B6E] text-white rounded-lg font-semibold" : "btn-primary"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {submitted ? 'Henvisning sendt' : submitting ? 'Sender...' : 'Send henvisning'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#F5EDE6] rounded-xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-[#A0714F]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                        Henvisning til spesialist
                    </h1>
                    <p className="text-[#7D7267] mt-1">Henvisningsskjema fra fastlege til spesialisthelsetjenesten</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Henvisning sendt
                        </h2>
                        <p className="text-[#7D7267] mb-6">Henvisningen er sendt til spesialisthelsetjenesten.</p>
                        <p className="text-sm font-mono text-[#9E958C] mb-8">Referanse: HEN-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="btn-secondary inline-flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Validation Error Summary */}
                        {attemptedSubmit && hasErrors && (
                            <div
                                ref={errorSummaryRef}
                                tabIndex={-1}
                                role="alert"
                                aria-live="assertive"
                                className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.25)] rounded-xl p-5 outline-none"
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

                        {/* Section 1: Referring Doctor */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Henvisende lege</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om henvisende behandler</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <OptionalLabel>Legens navn</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.legeNavn}
                                        className="input-field !text-sm bg-[var(--surface-primary)]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>HPR-nummer</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.legeHPR}
                                        className="input-field !text-sm bg-[var(--surface-primary)] font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Adresse</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.legeAdresse}
                                        className="input-field !text-sm bg-[var(--surface-primary)]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Telefon</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.legeTelefon}
                                        className="input-field !text-sm bg-[var(--surface-primary)]"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Patient Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om pasienten som henvises</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <RequiredLabel>Fullt navn</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="patientNavn"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        onBlur={() => handleBlur('patientNavn')}
                                        className={cn("input-field !text-sm", showFieldError('patientNavn') && "!border-[var(--color-error)] focus:!border-[var(--color-error)]")}
                                        placeholder="Ola Nordmann"
                                        aria-invalid={showFieldError('patientNavn')}
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
                                        className={cn("input-field !text-sm font-mono", showFieldError('patientFnr') && "!border-[var(--color-error)] focus:!border-[var(--color-error)]")}
                                        placeholder="01019012345"
                                        maxLength={11}
                                        aria-invalid={showFieldError('patientFnr')}
                                    />
                                    <FieldError field="patientFnr" />
                                </div>
                                <div>
                                    <OptionalLabel>Adresse</OptionalLabel>
                                    <input
                                        type="text"
                                        value={formData.patientAdresse}
                                        onChange={(e) => updateField('patientAdresse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Storgata 1, 0182 Oslo"
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Telefon</OptionalLabel>
                                    <input
                                        type="tel"
                                        value={formData.patientTelefon}
                                        onChange={(e) => updateField('patientTelefon', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="412 34 567"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Urgency */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Hastegrad</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Angi prioritet for henvisningen</p>

                            <div className="space-y-3">
                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.hastegrad === 'normal'
                                        ? "border-[#3D8B6E] bg-[#E8F5EE]/30"
                                        : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="hastegrad"
                                        value="normal"
                                        checked={formData.hastegrad === 'normal'}
                                        onChange={() => updateField('hastegrad', 'normal')}
                                        className="mt-0.5 w-5 h-5 text-[#3D8B6E] focus:ring-[#3D8B6E]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[#1E1914] block">Normal</span>
                                        <span className="text-xs text-[#7D7267] mt-1 block">Standard ventetid (4-12 uker)</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.hastegrad === 'haster'
                                        ? "border-[#C8842B] bg-[#FEF3C7]/30"
                                        : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="hastegrad"
                                        value="haster"
                                        checked={formData.hastegrad === 'haster'}
                                        onChange={() => updateField('hastegrad', 'haster')}
                                        className="mt-0.5 w-5 h-5 text-[#C8842B] focus:ring-[#C8842B]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[#1E1914] block">Haster</span>
                                        <span className="text-xs text-[#7D7267] mt-1 block">Prioritert vurdering (1-4 uker)</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.hastegrad === 'akutt'
                                        ? "border-[#C44536] bg-[#FAEAE8]/30"
                                        : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="hastegrad"
                                        value="akutt"
                                        checked={formData.hastegrad === 'akutt'}
                                        onChange={() => updateField('hastegrad', 'akutt')}
                                        className="mt-0.5 w-5 h-5 text-[#C44536] focus:ring-[#C44536]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[#1E1914] block">Akutt</span>
                                        <span className="text-xs text-[#7D7267] mt-1 block">Umiddelbar vurdering nodvendig</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Section 4: Referral To */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Send className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Henvist til</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Spesialist eller institusjon det henvises til</p>

                            <div className="space-y-4">
                                <div>
                                    <RequiredLabel>Spesialitet</RequiredLabel>
                                    <select
                                        data-field="spesialistType"
                                        value={formData.spesialistType}
                                        onChange={(e) => { updateField('spesialistType', e.target.value); markTouched('spesialistType'); }}
                                        onBlur={() => handleBlur('spesialistType')}
                                        className={cn("input-field !text-sm", showFieldError('spesialistType') && "!border-[var(--color-error)] focus:!border-[var(--color-error)]")}
                                        aria-invalid={showFieldError('spesialistType')}
                                    >
                                        <option value="">Velg spesialitet...</option>
                                        <option value="Ortoped">Ortoped</option>
                                        <option value="Kardiolog">Kardiolog</option>
                                        <option value="Nevrolog">Nevrolog</option>
                                        <option value="Revmatolog">Revmatolog</option>
                                        <option value="Psykiater">Psykiater</option>
                                        <option value="ONH-spesialist">ONH-spesialist</option>
                                        <option value="Radiologi">Radiologi</option>
                                        <option value="Gastroenterolog">Gastroenterolog</option>
                                        <option value="Urolog">Urolog</option>
                                        <option value="Gynekolog">Gynekolog</option>
                                        <option value="Oyelege">Oyelege</option>
                                        <option value="Hudlege">Hudlege</option>
                                        <option value="Annen">Annen</option>
                                    </select>
                                    <FieldError field="spesialistType" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <OptionalLabel>Institusjon / sykehus</OptionalLabel>
                                        <input
                                            type="text"
                                            value={formData.institusjon}
                                            onChange={(e) => updateField('institusjon', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="F.eks. Oslo universitetssykehus"
                                        />
                                    </div>
                                    <div>
                                        <OptionalLabel>Spesifikk lege (valgfritt)</OptionalLabel>
                                        <input
                                            type="text"
                                            value={formData.spesifikkLege}
                                            onChange={(e) => updateField('spesifikkLege', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="Navn pa spesialist"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Clinical Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Klinisk informasjon</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Relevant medisinsk informasjon</p>

                            {/* Diagnosis code system toggle */}
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
                                            className="text-[#A0714F]"
                                        />
                                        <span className="text-sm text-[#3E4C59] font-medium">ICPC-2 (Fastlege)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="kodesystem"
                                            value="ICD-10"
                                            checked={formData.kodesystem === 'ICD-10'}
                                            onChange={() => updateField('kodesystem', 'ICD-10')}
                                            className="text-[#A0714F]"
                                        />
                                        <span className="text-sm text-[#3E4C59] font-medium">ICD-10 (Spesialist)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Diagnosis code and description */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <RequiredLabel>Diagnosekode</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="diagnoseKode"
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        onBlur={() => handleBlur('diagnoseKode')}
                                        className={cn("input-field !text-sm font-mono", showFieldError('diagnoseKode') && "!border-[var(--color-error)] focus:!border-[var(--color-error)]")}
                                        placeholder="L03"
                                        aria-invalid={showFieldError('diagnoseKode')}
                                    />
                                    <FieldError field="diagnoseKode" />
                                </div>
                                <div className="col-span-2">
                                    <RequiredLabel>Diagnosebeskrivelse</RequiredLabel>
                                    <input
                                        type="text"
                                        data-field="diagnoseBeskrivelse"
                                        value={formData.diagnoseBeskrivelse}
                                        onChange={(e) => updateField('diagnoseBeskrivelse', e.target.value)}
                                        onBlur={() => handleBlur('diagnoseBeskrivelse')}
                                        className={cn("input-field !text-sm", showFieldError('diagnoseBeskrivelse') && "!border-[var(--color-error)] focus:!border-[var(--color-error)]")}
                                        placeholder="Korsryggsymptomer"
                                        aria-invalid={showFieldError('diagnoseBeskrivelse')}
                                    />
                                    <FieldError field="diagnoseBeskrivelse" />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="p-3 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#A0714F]" />
                                    <span className="text-xs font-semibold text-[#A0714F]">Vanlige ICPC-2-koder for henvisning</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {commonCodes.map((item) => (
                                        <button
                                            key={item.code}
                                            type="button"
                                            onClick={() => {
                                                updateField('diagnoseKode', item.code);
                                                updateField('diagnoseBeskrivelse', item.label);
                                            }}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all",
                                                formData.diagnoseKode === item.code
                                                    ? "bg-[#A0714F] text-white border-[#A0714F]"
                                                    : "bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#A0714F] hover:text-[#A0714F]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clinical text fields */}
                            <div className="space-y-4">
                                <div>
                                    <RequiredLabel>Sykehistorie og aktuell problemstilling</RequiredLabel>
                                    <textarea
                                        data-field="sykehistorie"
                                        value={formData.sykehistorie}
                                        onChange={(e) => updateField('sykehistorie', e.target.value)}
                                        onBlur={() => handleBlur('sykehistorie')}
                                        className={cn("input-field !text-sm min-h-[100px] resize-y", showFieldError('sykehistorie') && "!border-[var(--color-error)] focus:!border-[var(--color-error)]")}
                                        placeholder="Relevant sykehistorie og navarende problemstilling..."
                                        aria-invalid={showFieldError('sykehistorie')}
                                    />
                                    <FieldError field="sykehistorie" />
                                </div>
                                <div>
                                    <OptionalLabel>Navarende medikamenter</OptionalLabel>
                                    <textarea
                                        value={formData.medisiner}
                                        onChange={(e) => updateField('medisiner', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Navarende medikamenter og dosering..."
                                    />
                                </div>
                                <div>
                                    <OptionalLabel>Undersokelsesfunn</OptionalLabel>
                                    <textarea
                                        value={formData.undersokelseFunn}
                                        onChange={(e) => updateField('undersokelseFunn', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Relevante funn fra undersokelse..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Purpose */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Formal med henvisningen <span className="text-[var(--color-error)]" aria-hidden="true">*</span></h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Hva onskes utfort av spesialisten</p>

                            <div className="space-y-3 mb-4" data-field="formaal">
                                {formaalOptions.map((option) => (
                                    <label
                                        key={option}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                            formData.formaal.includes(option)
                                                ? "border-[#A0714F] bg-[#F5FAFF]"
                                                : showFieldError('formaal')
                                                    ? "border-[var(--color-error)]/40 hover:border-[var(--color-error)]/60"
                                                    : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.formaal.includes(option)}
                                            onChange={() => toggleFormaal(option)}
                                            className="mt-0.5 w-5 h-5 rounded border-[#CBD2D9] text-[#A0714F] focus:ring-[#A0714F]"
                                        />
                                        <span className="text-sm font-semibold text-[#1E1914]">{option}</span>
                                    </label>
                                ))}
                            </div>
                            <FieldError field="formaal" />

                            <div className="mt-4">
                                <OptionalLabel>Spesifikke sporsmal til spesialisten</OptionalLabel>
                                <textarea
                                    value={formData.spesifikkeSporsmal}
                                    onChange={(e) => updateField('spesifikkeSporsmal', e.target.value)}
                                    className="input-field !text-sm min-h-[100px] resize-y"
                                    placeholder="Spesifikke sporsmal til spesialisten..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Attachments */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Paperclip className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Vedlegg</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Legg til beskrivelse av vedlagte dokumenter</p>

                            {/* Attachment list */}
                            {vedlegg.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {vedlegg.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="w-3.5 h-3.5 text-[#A0714F]" />
                                                <span className="text-sm text-[#3E4C59]">{item}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeVedlegg(index)}
                                                className="p-1 text-[#9E958C] hover:text-[#C44536] transition-colors rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add attachment input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={nyttVedlegg}
                                    onChange={(e) => setNyttVedlegg(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addVedlegg();
                                        }
                                    }}
                                    className="input-field !text-sm flex-1"
                                    placeholder="F.eks. Blodprovesvar, rontgenbilde, EKG..."
                                />
                                <button
                                    type="button"
                                    onClick={addVedlegg}
                                    disabled={!nyttVedlegg.trim()}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        nyttVedlegg.trim()
                                            ? "bg-[#A0714F] text-white hover:bg-[#0052A3]"
                                            : "bg-[#DDD7CE] text-[#9E958C] cursor-not-allowed"
                                    )}
                                >
                                    <Plus className="w-4 h-4" />
                                    Legg til
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-[#FAEAE8] border border-[#C44536]/20 rounded-lg text-sm text-[#C44536]">
                                {error}
                            </div>
                        )}

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3D8B6E]" />
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel innsending</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                                </button>
                                <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {submitting ? 'Sender...' : 'Send henvisning'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
