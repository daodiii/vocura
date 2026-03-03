'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, FileCheck, Info, Mic, Loader2 } from 'lucide-react';
import { cn, validateFnr } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function SamtykkeForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'samtykke' });
    const [fnrError, setFnrError] = useState('');
    const [formData, setFormData] = useState({
        patientNavn: '',
        patientFnr: '',
        patientAdresse: '',
        behandler: '',
        behandlingssted: 'Vocura Legesenter',
        samtykkeTilBehandling: false,
        samtykkeJournalføring: false,
        samtykkeDeling: false,
        samtykkeForkning: false,
        samtykkeLydopptak: false,
        samtykkeAI: false,
        spesifikkInformasjon: '',
        begrensninger: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, behandler: profile.name }));
        }
    }, [profile]);

    const [signed, setSigned] = useState(false);
    const [signature, setSignature] = useState('');

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const allRequiredConsents = formData.samtykkeTilBehandling && formData.samtykkeJournalføring;

    return (
        <div className="min-h-screen bg-[var(--surface-deep)]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[var(--surface-primary)]/80 border-b border-[rgba(255,255,255,0.06)]">
                <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Breadcrumbs items={[
                        { label: 'Hjem', href: '/dashboard' },
                        { label: 'Skjemaer', href: '/forms' },
                        { label: 'Samtykke' },
                    ]} />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => exportPdf(formData as unknown as Record<string, unknown>, 'Samtykke til helsehjelp', formData.behandler)}
                            className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                    </div>
                </div>
            </div>

            <main id="main-content" className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[rgba(16,185,129,0.1)] rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#10B981]" />
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(16,185,129,0.1)] text-[#10B981]">Helsedirektoratet</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        Samtykke til helsehjelp
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">I henhold til Pasient- og brukerrettighetsloven og GDPR</p>
                </div>

                {signed ? (
                    <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#10B981]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                            Samtykke registrert
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">Pasientens samtykke er registrert og lagret i journalen.</p>
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
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()} noValidate>
                        {/* Patient Info */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Pasientopplysninger</legend>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-4 h-4 text-[#7B89DB]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Pasientopplysninger</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Fullt navn <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                        placeholder="Ola Nordmann"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Fødselsnummer <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        onBlur={() => setFnrError(validateFnr(formData.patientFnr) || '')}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                        required
                                    />
                                    {fnrError && <p className="text-[#EF4444] text-xs mt-1">{fnrError}</p>}
                                </div>
                            </div>
                        </fieldset>

                        {/* Consent Items */}
                        <fieldset className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <legend className="sr-only">Samtykkevalg</legend>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">Samtykke</h2>
                            <p className="text-sm text-[var(--text-secondary)] mb-6">Pasienten samtykker til følgende (kryss av):</p>

                            <div className="space-y-4">
                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.samtykkeTilBehandling ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)]"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.samtykkeTilBehandling}
                                        onChange={(e) => updateField('samtykkeTilBehandling', e.target.checked)}
                                        className="mt-0.5 w-5 h-5 rounded accent-[#5E6AD2]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[var(--text-primary)] block">Samtykke til undersøkelse og behandling <span className="text-[#EF4444]">*</span></span>
                                        <span className="text-xs text-[var(--text-secondary)] mt-1 block">Jeg samtykker til at helsepersonell kan utføre nødvendig undersøkelse og behandling i henhold til helsepersonelloven.</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.samtykkeJournalføring ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)]"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.samtykkeJournalføring}
                                        onChange={(e) => updateField('samtykkeJournalføring', e.target.checked)}
                                        className="mt-0.5 w-5 h-5 rounded accent-[#5E6AD2]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[var(--text-primary)] block">Samtykke til journalføring <span className="text-[#EF4444]">*</span></span>
                                        <span className="text-xs text-[var(--text-secondary)] mt-1 block">Jeg samtykker til at opplysninger fra konsultasjonen registreres i min pasientjournal i tråd med GDPR og journalforskriften.</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.samtykkeDeling ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)]"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.samtykkeDeling}
                                        onChange={(e) => updateField('samtykkeDeling', e.target.checked)}
                                        className="mt-0.5 w-5 h-5 rounded accent-[#5E6AD2]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[var(--text-primary)] block">Deling av helseopplysninger</span>
                                        <span className="text-xs text-[var(--text-secondary)] mt-1 block">Jeg samtykker til at relevante helseopplysninger kan deles med andre behandlere involvert i min behandling (f.eks. spesialister, laboratorier).</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.samtykkeLydopptak ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)]"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.samtykkeLydopptak}
                                        onChange={(e) => updateField('samtykkeLydopptak', e.target.checked)}
                                        className="mt-0.5 w-5 h-5 rounded accent-[#5E6AD2]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                            Lydopptak av konsultasjonen
                                            <Mic className="w-3.5 h-3.5 text-[#7B89DB]" />
                                        </span>
                                        <span className="text-xs text-[var(--text-secondary)] mt-1 block">Jeg samtykker til at konsultasjonen kan tas opp som lydopptak for transkripsjons- og dokumentasjonsformål. Opptaket behandles i henhold til GDPR.</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.samtykkeAI ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)]"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.samtykkeAI}
                                        onChange={(e) => updateField('samtykkeAI', e.target.checked)}
                                        className="mt-0.5 w-5 h-5 rounded accent-[#5E6AD2]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[var(--text-primary)] block">AI-assistert dokumentasjon</span>
                                        <span className="text-xs text-[var(--text-secondary)] mt-1 block">Jeg samtykker til at AI-teknologi brukes for å transkribere og strukturere journalnotater. Alle AI-genererte tekster gjennomgås og godkjennes av behandler.</span>
                                    </div>
                                </label>
                            </div>
                        </fieldset>

                        {/* Limitations */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">Begrensninger (valgfritt)</h2>
                            <textarea
                                value={formData.begrensninger}
                                onChange={(e) => updateField('begrensninger', e.target.value)}
                                className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[60px] resize-y"
                                placeholder="Spesifiser eventuelle begrensninger for samtykket..."
                            />
                        </div>

                        {/* Info about rights */}
                        <div className="bg-[rgba(94,106,210,0.08)] border border-[rgba(94,106,210,0.15)] rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-[#7B89DB] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Pasientens rettigheter</p>
                                    <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                                        <li>Du kan når som helst trekke tilbake hele eller deler av samtykket.</li>
                                        <li>Du har rett til innsyn i din journal og til å korrigere opplysninger.</li>
                                        <li>Tilbaketrekking av samtykke påvirker ikke lovligheten av behandling basert på samtykke før tilbaketrekkingen.</li>
                                        <li>Henvendelser om personvern rettes til behandlingsansvarlig.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">Signatur</h2>
                            <div>
                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Pasientens signatur (skriv fullt navn) <span className="text-[#EF4444]">*</span></label>
                                <input
                                    type="text"
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] italic"
                                    placeholder="Skriv ditt fulle navn her som elektronisk signatur"
                                    required
                                />
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-2">
                                Dato: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-sm text-[#EF4444]">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2 text-[#10B981]">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-semibold">GDPR-kompatibel</span>
                            </div>
                            <button
                                onClick={async () => {
                                    await submitForm(formData as unknown as Record<string, unknown>);
                                    setSigned(true);
                                }}
                                disabled={!allRequiredConsents || !signature || submitting || !!fnrError}
                                className={cn(
                                    "py-2.5 px-6 text-sm flex items-center gap-2 rounded-lg font-medium transition-colors duration-150",
                                    allRequiredConsents && signature && !submitting ? "bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white cursor-pointer" : "bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] cursor-not-allowed"
                                )}
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                                {submitting ? 'Registrerer...' : 'Registrer samtykke'}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
