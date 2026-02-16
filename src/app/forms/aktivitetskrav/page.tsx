'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, FileCheck, AlertCircle, Calendar, Briefcase, Info, ClipboardList, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function AktivitetskravForm() {
    const { profile } = useUserProfile();
    const [formData, setFormData] = useState({
        // Patient
        patientNavn: '',
        patientFnr: '',
        patientTelefon: '',
        // Sick leave period
        opprinneligSykmeldingDato: '',
        kodesystem: 'ICPC-2',
        diagnoseKode: '',
        diagnoseBeskrivelse: '',
        // Work capacity
        funksjonsBeskrivelse: '',
        hvaKanPasienten: '',
        hvaKanIkkePasienten: '',
        // Activity possibilities
        aktivitetMulig: '',
        aktivitetstyper: [] as string[],
        tilretteleggingForslag: '',
        // Duration
        forventetVarighet: '',
        forventetTilbake: '',
        // Justification
        medisinskBegrunnelse: '',
        // Return plan
        tilbakeforingsplan: '',
        gradviseTiltak: '',
        milepaler: '',
        // Doctor
        legeNavn: '',
        legeHPR: '9876543',
        legeAdresse: 'Storgata 1, 0182 Oslo',
        bekreftelse: false,
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, legeNavn: profile.name }));
        }
    }, [profile]);

    const { saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'aktivitetskrav' });

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleAktivitetstype = (type: string) => {
        setFormData(prev => ({
            ...prev,
            aktivitetstyper: prev.aktivitetstyper.includes(type)
                ? prev.aktivitetstyper.filter(t => t !== type)
                : [...prev.aktivitetstyper, type],
        }));
    };

    const getAllFormData = () => ({ ...formData });

    const handleSave = () => {
        saveAsDraft(getAllFormData());
    };

    const handleSubmit = () => {
        submitForm(getAllFormData());
    };

    const commonCodes = [
        { code: 'L02', label: 'Ryggsymptomer/plager' },
        { code: 'L03', label: 'Korsryggsymptomer' },
        { code: 'P76', label: 'Depressiv lidelse' },
        { code: 'P02', label: 'Akutt stressreaksjon' },
        { code: 'L84', label: 'Ryggsyndrom uten utstråling' },
        { code: 'P74', label: 'Angstlidelse' },
        { code: 'A04', label: 'Slapphet/tretthet' },
        { code: 'L86', label: 'Ryggsyndrom med utstråling' },
    ];

    const aktivitetstypeOptions = [
        'Tilpasset arbeid hos egen arbeidsgiver',
        'Arbeidsrettet rehabilitering',
        'Gradert sykemelding',
        'Arbeidstrening',
    ];

    return (
        <div className="min-h-screen bg-[#F5F2ED]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[#FFFDF9] border-b border-[#DDD7CE]">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Link href="/forms" className="flex items-center gap-2 text-[#5E5549] hover:text-[#1E1914] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Tilbake til skjemaer</span>
                    </Link>
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
                            onClick={() => exportPdf(getAllFormData(), 'Aktivitetskrav erklæring (8 uker)', 'Lege')}
                            className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.bekreftelse || submitting}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5",
                                submitted
                                    ? "bg-[#3D8B6E] text-white rounded-lg font-semibold"
                                    : formData.bekreftelse
                                        ? "btn-primary"
                                        : "bg-[#DDD7CE] text-[var(--medical-gray-400)] rounded-lg font-semibold cursor-not-allowed"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                            {submitting ? 'Sender...' : submitted ? 'Sendt til NAV' : 'Send til NAV'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-[#C8842B]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#C8842B] uppercase tracking-wider">NAV</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                        Aktivitetskrav erklæring (8 uker)
                    </h1>
                    <p className="text-[#7D7267] mt-1">Erklæring om aktivitetskrav ved sykemelding over 8 uker</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                            Erklæring sendt til NAV
                        </h2>
                        <p className="text-[#7D7267] mb-6">Aktivitetskraverklæring er sendt til NAV og vil bli behandlet innen 1-3 virkedager.</p>
                        {error && <p className="text-sm text-[#C44536] mb-4">{error}</p>}
                        <p className="text-sm font-mono text-[var(--medical-gray-400)] mb-8">Referanse: NAV-AKT-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
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
                        {/* Section 1: Patient Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Informasjon om den sykmeldte</p>

                            <div className="grid grid-cols-3 gap-4">
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

                        {/* Section 2: Sick Leave Period & Diagnosis */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Sykmeldingsperiode og diagnose</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Opprinnelig sykemelding og diagnose</p>

                            <div className="mb-4">
                                <label className="form-label form-required">Dato for opprinnelig sykemelding</label>
                                <input
                                    type="date"
                                    value={formData.opprinneligSykmeldingDato}
                                    onChange={(e) => updateField('opprinneligSykmeldingDato', e.target.value)}
                                    className="input-field !text-sm w-64"
                                />
                            </div>

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
                                            className="text-[#C8842B]"
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
                                            className="text-[#C8842B]"
                                        />
                                        <span className="text-sm text-[#3E4C59] font-medium">ICD-10 (Spesialist)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Diagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="L03"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label form-required">Diagnosebeskrivelse</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseBeskrivelse}
                                        onChange={(e) => updateField('diagnoseBeskrivelse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Korsryggsymptomer"
                                    />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="p-3 bg-[#FFFBEB] rounded-lg border border-[#FEF3C7]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#C8842B]" />
                                    <span className="text-xs font-semibold text-[#C8842B]">Vanlige ICPC-2-koder for sykemelding</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {commonCodes.map((item) => (
                                        <button
                                            key={item.code}
                                            onClick={() => {
                                                updateField('diagnoseKode', item.code);
                                                updateField('diagnoseBeskrivelse', item.label);
                                            }}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all",
                                                formData.diagnoseKode === item.code
                                                    ? "bg-[#C8842B] text-white border-[#C8842B]"
                                                    : "bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#C8842B] hover:text-[#C8842B]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Medical Assessment of Work Capacity */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Medisinsk vurdering av arbeidsevne</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Beskriv pasientens funksjonsnivå og arbeidsevne</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Funksjonsbeskrivelse</label>
                                    <textarea
                                        value={formData.funksjonsBeskrivelse}
                                        onChange={(e) => updateField('funksjonsBeskrivelse', e.target.value)}
                                        className="input-field !text-sm min-h-[100px] resize-y"
                                        placeholder="Beskriv pasientens nåværende funksjonsnivå..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label form-required">Hva kan pasienten gjøre?</label>
                                        <textarea
                                            value={formData.hvaKanPasienten}
                                            onChange={(e) => updateField('hvaKanPasienten', e.target.value)}
                                            className="input-field !text-sm min-h-[80px] resize-y"
                                            placeholder="Beskriv aktiviteter pasienten kan utføre..."
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label form-required">Hva kan pasienten ikke gjøre?</label>
                                        <textarea
                                            value={formData.hvaKanIkkePasienten}
                                            onChange={(e) => updateField('hvaKanIkkePasienten', e.target.value)}
                                            className="input-field !text-sm min-h-[80px] resize-y"
                                            placeholder="Beskriv begrensninger og aktiviteter pasienten ikke kan utføre..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Activity Possibilities */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <ClipboardList className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Aktivitetsmuligheter</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Vurdering av mulighet for tilpasset aktivitet</p>

                            <div className="mb-4">
                                <label className="form-label form-required">Kan pasienten utføre tilpasset arbeid?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktivitetMulig"
                                            value="Ja"
                                            checked={formData.aktivitetMulig === 'Ja'}
                                            onChange={() => updateField('aktivitetMulig', 'Ja')}
                                            className="text-[#C8842B]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktivitetMulig"
                                            value="Nei"
                                            checked={formData.aktivitetMulig === 'Nei'}
                                            onChange={() => updateField('aktivitetMulig', 'Nei')}
                                            className="text-[#C8842B]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktivitetMulig"
                                            value="Delvis"
                                            checked={formData.aktivitetMulig === 'Delvis'}
                                            onChange={() => updateField('aktivitetMulig', 'Delvis')}
                                            className="text-[#C8842B]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Delvis</span>
                                    </label>
                                </div>
                            </div>

                            {(formData.aktivitetMulig === 'Ja' || formData.aktivitetMulig === 'Delvis') && (
                                <div className="space-y-4 mt-4 p-4 bg-[#FFFBEB] rounded-lg border border-[#FEF3C7]">
                                    <div>
                                        <label className="form-label">Hvilke aktivitetstyper er aktuelle?</label>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            {aktivitetstypeOptions.map((type) => (
                                                <label
                                                    key={type}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                        formData.aktivitetstyper.includes(type)
                                                            ? "border-[#C8842B] bg-[#FEF3C7]"
                                                            : "border-[#DDD7CE] hover:border-[#C8842B]/30"
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.aktivitetstyper.includes(type)}
                                                        onChange={() => toggleAktivitetstype(type)}
                                                        className="w-4 h-4 rounded border-[#CBD2D9] text-[#C8842B] focus:ring-[#C8842B]"
                                                    />
                                                    <span className="text-sm text-[#3E4C59] font-medium">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Forslag til tilrettelegging</label>
                                        <textarea
                                            value={formData.tilretteleggingForslag}
                                            onChange={(e) => updateField('tilretteleggingForslag', e.target.value)}
                                            className="input-field !text-sm min-h-[80px] resize-y"
                                            placeholder="Forslag til tilrettelegging på arbeidsplassen..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 5: Expected Duration */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Forventet varighet</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Estimert varighet og dato for tilbakeføring</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label form-required">Forventet varighet av arbeidsuførhet</label>
                                    <select
                                        value={formData.forventetVarighet}
                                        onChange={(e) => updateField('forventetVarighet', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="under-2-uker">Under 2 uker</option>
                                        <option value="2-4-uker">2-4 uker</option>
                                        <option value="4-8-uker">4-8 uker</option>
                                        <option value="8-12-uker">8-12 uker</option>
                                        <option value="over-12-uker">Over 12 uker</option>
                                        <option value="usikkert">Usikkert</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Forventet dato for tilbakeføring</label>
                                    <input
                                        type="date"
                                        value={formData.forventetTilbake}
                                        onChange={(e) => updateField('forventetTilbake', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Medical Justification (PROMINENT) */}
                        <div className="form-section !border-[#C8842B]/30">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Medisinsk begrunnelse</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Påkrevd ved sykemelding over 8 uker</p>

                            <div className="p-4 bg-[#FFFBEB] rounded-lg border border-[#FEF3C7] mb-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-[#C8842B] shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#92400E]">
                                        Ved sykemelding over 8 uker kreves en utfyllende medisinsk begrunnelse for videre arbeidsuførhet (folketrygdloven &#167; 8-7)
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="form-label form-required">Medisinsk begrunnelse for fortsatt arbeidsuførhet</label>
                                <textarea
                                    value={formData.medisinskBegrunnelse}
                                    onChange={(e) => updateField('medisinskBegrunnelse', e.target.value)}
                                    className="input-field !text-sm min-h-[150px] resize-y !border-[#C8842B]/30 focus:!border-[#C8842B]"
                                    placeholder="Begrunn hvorfor pasienten fortsatt er arbeidsufør etter 8 uker..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Return Plan */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Plan for tilbakeføring til arbeid</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Konkret plan for tilbakeføring og gradvise tiltak</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Tilbakeføringsplan</label>
                                    <textarea
                                        value={formData.tilbakeforingsplan}
                                        onChange={(e) => updateField('tilbakeforingsplan', e.target.value)}
                                        className="input-field !text-sm min-h-[100px] resize-y"
                                        placeholder="Overordnet plan for tilbakeføring..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Gradvise tiltak</label>
                                    <textarea
                                        value={formData.gradviseTiltak}
                                        onChange={(e) => updateField('gradviseTiltak', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Gradvise tiltak for økt arbeidsdeltagelse..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Milepæler</label>
                                    <textarea
                                        value={formData.milepaler}
                                        onChange={(e) => updateField('milepaler', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Viktige milepæler og evalueringspunkter..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 8: Doctor's Declaration */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-[#C8842B]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">8. Legens erklæring</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Bekreftelse og legeopplysninger</p>

                            <div className="p-4 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6] mb-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-[#A0714F] shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#3E4C59]">
                                        Undertegnede erklærer at opplysningene i dette skjemaet er korrekte og at vurderingen er basert på medisinsk undersøkelse av pasienten.
                                    </p>
                                </div>
                            </div>

                            <label className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all mb-4",
                                formData.bekreftelse ? "border-[#C8842B] bg-[#FFFBEB]" : "border-[#DDD7CE] hover:border-[#C8842B]/30"
                            )}>
                                <input
                                    type="checkbox"
                                    checked={formData.bekreftelse}
                                    onChange={(e) => updateField('bekreftelse', e.target.checked)}
                                    className="mt-0.5 w-5 h-5 rounded border-[#CBD2D9] text-[#C8842B] focus:ring-[#C8842B]"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-[#1E1914] block">
                                        Jeg bekrefter at opplysningene er korrekte <span className="text-[#C44536]">*</span>
                                    </span>
                                    <span className="text-xs text-[#7D7267] mt-1 block">
                                        Ved å krysse av bekrefter du at erklæringen er basert på en medisinsk vurdering og at opplysningene er korrekte.
                                    </span>
                                </div>
                            </label>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">Legens navn</label>
                                    <input
                                        type="text"
                                        value={formData.legeNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.legeHPR}
                                        className="input-field !text-sm bg-[#F5F2ED] font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.legeAdresse}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-[var(--medical-gray-400)] mt-4">
                                Dato: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3D8B6E]" />
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel innsending til NAV</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {error && <p className="text-sm text-[#C44536]">{error}</p>}
                                <button onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Lagrer...' : 'Lagre utkast'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.bekreftelse || submitting}
                                    className={cn(
                                        "!py-2.5 !px-6 text-sm flex items-center gap-2",
                                        formData.bekreftelse
                                            ? "btn-primary"
                                            : "bg-[#DDD7CE] text-[var(--medical-gray-400)] rounded-lg font-semibold cursor-not-allowed"
                                    )}
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                                    {submitting ? 'Sender...' : 'Send til NAV'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
