'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, Calendar, User, Briefcase, FileCheck, AlertCircle, ChevronDown, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function SykemeldingForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'sykemelding' });
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

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                legeNavn: profile.name,
                legeHPR: profile.hprNumber || '',
                legeAdresse: profile.address || '',
            }));
        }
    }, [profile]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        saveAsDraft(formData);
    };

    const handleSubmit = () => {
        submitForm(formData);
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
        { code: 'R74', label: 'Øvre luftveisinfeksjon' },
        { code: 'K86', label: 'Hypertensjon, ukomplisert' },
        { code: 'L84', label: 'Ryggsyndrom uten utstråling' },
        { code: 'P74', label: 'Angstlidelse' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-deep)]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 glass-header border-b border-[var(--glass-border)]">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Link href="/forms" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Tilbake til skjemaer</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="glass-btn-ghost text-xs flex items-center gap-1.5 !py-2 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button onClick={handleExport} className="glass-btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5 cursor-pointer">
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5 cursor-pointer",
                                submitted ? "bg-[var(--success)] text-white rounded-lg font-semibold" : "glass-btn-primary"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                            {submitted ? 'Sendt til NAV' : 'Send til NAV'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[var(--warning-subtle)] rounded-xl flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-[var(--warning)]" />
                        </div>
                        <div>
                            <span className="glass-badge glass-badge-warning">NAV</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        Sykemelding
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">Elektronisk sykemelding for innsending til NAV</p>
                </div>

                {submitted ? (
                    <div className="glass-card-elevated p-12 text-center">
                        <div className="w-16 h-16 bg-[var(--success-subtle)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[var(--success)]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                            Sykemelding sendt til NAV
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">Skjemaet er sendt elektronisk og vil bli behandlet innen 1-3 virkedager.</p>
                        <p className="text-sm font-mono text-[var(--text-muted)] mb-8">Referanse: {submissionId || 'N/A'}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="glass-btn-secondary inline-flex items-center gap-2 cursor-pointer">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="glass-btn-primary inline-flex items-center gap-2 cursor-pointer">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section 1: Patient Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[var(--primary)]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Informasjon om den sykmeldte</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label form-required">Fullt navn</label>
                                    <input
                                        type="text"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Ola Nordmann"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Fødselsnummer (11 siffer)</label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.patientAdresse}
                                        onChange={(e) => updateField('patientAdresse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Storgata 1, 0182 Oslo"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Telefon</label>
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

                        {/* Section 2: Employer */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-[var(--primary)]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Arbeidsgiver</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Informasjon om arbeidsforholdet</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label form-required">Arbeidsgivers navn</label>
                                    <input
                                        type="text"
                                        value={formData.arbeidsgiver}
                                        onChange={(e) => updateField('arbeidsgiver', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Firma AS"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Organisasjonsnummer</label>
                                    <input
                                        type="text"
                                        value={formData.arbeidsgiverOrgnr}
                                        onChange={(e) => updateField('arbeidsgiverOrgnr', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="123 456 789"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Stillingsprosent</label>
                                    <select
                                        value={formData.stillingsprosent}
                                        onChange={(e) => updateField('stillingsprosent', e.target.value)}
                                        className="input-field !text-sm"
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
                        </div>

                        {/* Section 3: Diagnosis */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[var(--primary)]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Diagnose</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Medisinsk diagnose etter ICPC-2 eller ICD-10</p>

                            <div className="mb-4">
                                <label className="form-label">Kodesystem</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="kodesystem"
                                            value="ICPC-2"
                                            checked={formData.kodesystem === 'ICPC-2'}
                                            onChange={() => updateField('kodesystem', 'ICPC-2')}
                                            className="text-[var(--primary)]"
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
                                            className="text-[var(--primary)]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)] font-medium">ICD-10 (Spesialist)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Diagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.hoveddiagnoseKode}
                                        onChange={(e) => updateField('hoveddiagnoseKode', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="L03"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label form-required">Diagnosebeskrivelse</label>
                                    <input
                                        type="text"
                                        value={formData.hoveddiagnoseBeskrivelse}
                                        onChange={(e) => updateField('hoveddiagnoseBeskrivelse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Korsryggsymptomer"
                                    />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="info-card p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[var(--primary-light)]" />
                                    <span className="text-xs font-semibold text-[var(--primary-light)]">Vanlige ICPC-2-koder for sykemelding</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {commonCodes.map((item) => (
                                        <button
                                            key={item.code}
                                            onClick={() => {
                                                updateField('hoveddiagnoseKode', item.code);
                                                updateField('hoveddiagnoseBeskrivelse', item.label);
                                            }}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                                                formData.hoveddiagnoseKode === item.code
                                                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                                                    : "glass-card-static text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary-light)]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="form-label">Bidiagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.bidiagnoseKode}
                                        onChange={(e) => updateField('bidiagnoseKode', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="Valgfritt"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label">Bidiagnosebeskrivelse</label>
                                    <input
                                        type="text"
                                        value={formData.bidiagnoseBeskrivelse}
                                        onChange={(e) => updateField('bidiagnoseBeskrivelse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Valgfritt"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Functional Assessment */}
                        <div className="form-section">
                            <h2 className="form-section-title">4. Funksjonsnedsettelse og arbeidsevne</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Beskriv funksjonsnedsettelsen</label>
                                    <textarea
                                        value={formData.funksjonsnedsettelse}
                                        onChange={(e) => updateField('funksjonsnedsettelse', e.target.value)}
                                        className="input-field !text-sm min-h-[100px] resize-y"
                                        placeholder="Beskriv hvordan sykdommen/skaden påvirker pasientens funksjon..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Vurdering av arbeidsevne</label>
                                    <textarea
                                        value={formData.arbeidsevne}
                                        onChange={(e) => updateField('arbeidsevne', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv i hvilken grad pasienten kan utføre arbeid..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Period */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[var(--primary)]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Sykmeldingsperiode</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Periode for sykemelding og eventuell gradering</p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Fra dato</label>
                                    <input
                                        type="date"
                                        value={formData.fom}
                                        onChange={(e) => updateField('fom', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Til dato</label>
                                    <input
                                        type="date"
                                        value={formData.tom}
                                        onChange={(e) => updateField('tom', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Type</label>
                                    <select
                                        value={formData.gradType}
                                        onChange={(e) => updateField('gradType', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="full">100% sykemeldt</option>
                                        <option value="gradert">Gradert sykemelding</option>
                                        <option value="avventende">Avventende sykemelding</option>
                                        <option value="behandlingsdager">Behandlingsdager</option>
                                    </select>
                                </div>
                            </div>

                            {formData.gradType === 'gradert' && (
                                <div className="p-4 bg-[var(--warning-subtle)] rounded-lg border border-[var(--warning)]/20 mb-4">
                                    <label className="form-label">Sykmeldingsgrad (%)</label>
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
                                        <span className="text-lg font-bold text-[var(--warning)] w-16 text-right">{formData.grad}%</span>
                                    </div>
                                    <p className="text-xs text-[var(--warning)] mt-1">
                                        Pasienten kan arbeide {100 - parseInt(formData.grad)}% av stillingen
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Section 6: Activity Requirements */}
                        <div className="form-section">
                            <h2 className="form-section-title">6. Aktivitetskrav</h2>

                            <div className="mb-4">
                                <label className="form-label form-required">Er det medisinske grunner til at arbeidsrelatert aktivitet ikke er mulig?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktivitet"
                                            value="ja"
                                            checked={formData.aktivitetMulig === 'ja'}
                                            onChange={() => updateField('aktivitetMulig', 'ja')}
                                            className="text-[var(--primary)]"
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
                                            className="text-[var(--primary)]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.aktivitetMulig === 'ja' && (
                                <div>
                                    <label className="form-label form-required">Medisinsk begrunnelse</label>
                                    <textarea
                                        value={formData.aktivitetBegrunnelse}
                                        onChange={(e) => updateField('aktivitetBegrunnelse', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Begrunn hvorfor arbeidsrelatert aktivitet ikke er medisinsk forsvarlig..."
                                    />
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="form-label">Anbefalinger om tilrettelegging</label>
                                <textarea
                                    value={formData.tilrettelegging}
                                    onChange={(e) => updateField('tilrettelegging', e.target.value)}
                                    className="input-field !text-sm min-h-[60px] resize-y"
                                    placeholder="Beskriv eventuell tilrettelegging som kan muliggjøre (delvis) arbeid..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Prognosis */}
                        <div className="form-section">
                            <h2 className="form-section-title">7. Prognose</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Prognose for bedring</label>
                                    <textarea
                                        value={formData.prognose}
                                        onChange={(e) => updateField('prognose', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Vurder prognose og forventet varighet av arbeidsuførhet..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Forventet tilbakeføring til arbeid</label>
                                    <select
                                        value={formData.tilbakeArbeid}
                                        onChange={(e) => updateField('tilbakeArbeid', e.target.value)}
                                        className="input-field !text-sm"
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
                        </div>

                        {/* Section 8: Doctor Info */}
                        <div className="form-section">
                            <h2 className="form-section-title">8. Sykmelder</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">Legens navn</label>
                                    <input
                                        type="text"
                                        value={formData.legeNavn}
                                        className="input-field !text-sm bg-[var(--glass-bg)]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.legeHPR}
                                        className="input-field !text-sm bg-[var(--glass-bg)] font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.legeAdresse}
                                        className="input-field !text-sm bg-[var(--glass-bg)]"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="trust-badge">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-semibold">GDPR-kompatibel innsending til NAV</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="glass-btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2 cursor-pointer">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Lagre utkast
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} className="glass-btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2 cursor-pointer">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                                    Send til NAV
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
