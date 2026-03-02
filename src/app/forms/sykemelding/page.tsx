'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, Calendar, User, Briefcase, FileCheck, AlertCircle, ChevronDown, Info, Loader2 } from 'lucide-react';
import { cn, validateFnr } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function SykemeldingForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'sykemelding' });
    const [fnrError, setFnrError] = useState('');
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

    const handleSave = () => {
        saveAsDraft(formData);
    };

    const dateError = formData.fom && formData.tom && formData.tom < formData.fom;

    const handleSubmit = () => {
        if (dateError) return;
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
        { code: 'R74', label: 'Øvre luftveisinfeksjon' },
        { code: 'K86', label: 'Hypertensjon, ukomplisert' },
        { code: 'L84', label: 'Ryggsyndrom uten utstråling' },
        { code: 'P74', label: 'Angstlidelse' },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[#111111]/80 border-b border-[rgba(255,255,255,0.06)]">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Link href="/forms" className="flex items-center gap-2 text-[#8B8B8B] hover:text-[#EDEDED] transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Tilbake til skjemaer</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-[#8B8B8B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button onClick={handleExport} className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer">
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !!dateError || !!fnrError}
                            className={cn(
                                "text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-lg font-medium transition-colors duration-150",
                                submitted ? "bg-[#10B981] text-white font-semibold" : "bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white",
                                dateError && "opacity-50 cursor-not-allowed"
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
                        <div className="w-10 h-10 bg-[rgba(245,158,11,0.1)] rounded-xl flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(245,158,11,0.1)] text-[#F59E0B]">NAV</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#EDEDED]">
                        Sykemelding
                    </h1>
                    <p className="text-[#8B8B8B] mt-1">Elektronisk sykemelding for innsending til NAV</p>
                </div>

                {submitted ? (
                    <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-12 text-center">
                        <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#10B981]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#EDEDED] mb-3">
                            Sykemelding sendt til NAV
                        </h2>
                        <p className="text-[#8B8B8B] mb-6">Skjemaet er sendt elektronisk og vil bli behandlet innen 1-3 virkedager.</p>
                        <p className="text-sm font-mono text-[#5C5C5C] mb-8">Referanse: {submissionId || 'N/A'}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section 1: Patient Information */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Informasjon om den sykmeldte</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Fullt navn <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="Ola Nordmann"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Fødselsnummer (11 siffer) <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        onBlur={() => setFnrError(validateFnr(formData.patientFnr) || '')}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                    {fnrError && <p className="text-[#EF4444] text-xs mt-1">{fnrError}</p>}
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.patientAdresse}
                                        onChange={(e) => updateField('patientAdresse', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="Storgata 1, 0182 Oslo"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.patientTelefon}
                                        onChange={(e) => updateField('patientTelefon', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="412 34 567"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Employer */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">2. Arbeidsgiver</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Informasjon om arbeidsforholdet</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Arbeidsgivers navn <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.arbeidsgiver}
                                        onChange={(e) => updateField('arbeidsgiver', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="Firma AS"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Organisasjonsnummer</label>
                                    <input
                                        type="text"
                                        value={formData.arbeidsgiverOrgnr}
                                        onChange={(e) => updateField('arbeidsgiverOrgnr', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] font-mono"
                                        placeholder="123 456 789"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Stillingsprosent</label>
                                    <select
                                        value={formData.stillingsprosent}
                                        onChange={(e) => updateField('stillingsprosent', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2]"
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
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">3. Diagnose</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Medisinsk diagnose etter ICPC-2 eller ICD-10</p>

                            <div className="mb-4">
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Kodesystem</label>
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
                                        <span className="text-sm text-[#8B8B8B] font-medium">ICPC-2 (Fastlege)</span>
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
                                        <span className="text-sm text-[#8B8B8B] font-medium">ICD-10 (Spesialist)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Diagnosekode <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.hoveddiagnoseKode}
                                        onChange={(e) => updateField('hoveddiagnoseKode', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] font-mono"
                                        placeholder="L03"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Diagnosebeskrivelse <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.hoveddiagnoseBeskrivelse}
                                        onChange={(e) => updateField('hoveddiagnoseBeskrivelse', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="Korsryggsymptomer"
                                    />
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
                                            onClick={() => {
                                                updateField('hoveddiagnoseKode', item.code);
                                                updateField('hoveddiagnoseBeskrivelse', item.label);
                                            }}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer",
                                                formData.hoveddiagnoseKode === item.code
                                                    ? "bg-[#5E6AD2] text-white border-[#5E6AD2]"
                                                    : "bg-[#191919] border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:border-[#5E6AD2] hover:text-[#7B89DB]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Bidiagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.bidiagnoseKode}
                                        onChange={(e) => updateField('bidiagnoseKode', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] font-mono"
                                        placeholder="Valgfritt"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Bidiagnosebeskrivelse</label>
                                    <input
                                        type="text"
                                        value={formData.bidiagnoseBeskrivelse}
                                        onChange={(e) => updateField('bidiagnoseBeskrivelse', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="Valgfritt"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Functional Assessment */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[#EDEDED] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">4. Funksjonsnedsettelse og arbeidsevne</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Beskriv funksjonsnedsettelsen <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.funksjonsnedsettelse}
                                        onChange={(e) => updateField('funksjonsnedsettelse', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[100px] resize-y"
                                        placeholder="Beskriv hvordan sykdommen/skaden påvirker pasientens funksjon..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Vurdering av arbeidsevne <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.arbeidsevne}
                                        onChange={(e) => updateField('arbeidsevne', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                        placeholder="Beskriv i hvilken grad pasienten kan utføre arbeid..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Period */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">5. Sykmeldingsperiode</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Periode for sykemelding og eventuell gradering</p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Fra dato <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.fom}
                                        onChange={(e) => updateField('fom', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Til dato <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.tom}
                                        onChange={(e) => updateField('tom', e.target.value)}
                                        className={cn(
                                            "bg-[#222222] border rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none",
                                            dateError ? "border-[#EF4444] focus:border-[#EF4444]" : "border-[rgba(255,255,255,0.06)] focus:border-[#5E6AD2]"
                                        )}
                                    />
                                    {dateError && (
                                        <p className="text-[#EF4444] text-xs mt-1">Sluttdato kan ikke være før startdato</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Type <span className="text-[#EF4444]">*</span></label>
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
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2]"
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
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Sykmeldingsgrad (%)</label>
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
                        </div>

                        {/* Section 6: Activity Requirements */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[#EDEDED] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">6. Aktivitetskrav</h2>

                            <div className="mb-4">
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Er det medisinske grunner til at arbeidsrelatert aktivitet ikke er mulig? <span className="text-[#EF4444]">*</span></label>
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
                                        <span className="text-sm text-[#8B8B8B]">Ja</span>
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
                                        <span className="text-sm text-[#8B8B8B]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.aktivitetMulig === 'ja' && (
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Medisinsk begrunnelse <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.aktivitetBegrunnelse}
                                        onChange={(e) => updateField('aktivitetBegrunnelse', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                        placeholder="Begrunn hvorfor arbeidsrelatert aktivitet ikke er medisinsk forsvarlig..."
                                    />
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Anbefalinger om tilrettelegging</label>
                                <textarea
                                    value={formData.tilrettelegging}
                                    onChange={(e) => updateField('tilrettelegging', e.target.value)}
                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[60px] resize-y"
                                    placeholder="Beskriv eventuell tilrettelegging som kan muliggjøre (delvis) arbeid..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Prognosis */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[#EDEDED] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">7. Prognose</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Prognose for bedring</label>
                                    <textarea
                                        value={formData.prognose}
                                        onChange={(e) => updateField('prognose', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[60px] resize-y"
                                        placeholder="Vurder prognose og forventet varighet av arbeidsuførhet..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Forventet tilbakeføring til arbeid</label>
                                    <select
                                        value={formData.tilbakeArbeid}
                                        onChange={(e) => updateField('tilbakeArbeid', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2]"
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
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[#EDEDED] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">8. Sykmelder</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Legens navn</label>
                                    <input
                                        type="text"
                                        value={formData.legeNavn}
                                        className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.legeHPR}
                                        className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.legeAdresse}
                                        className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2 text-[#10B981]">
                                <Shield className="w-4 h-4" />
                                <span className="text-xs font-semibold">GDPR-kompatibel innsending til NAV</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-6 py-2.5 transition-colors duration-150 text-sm flex items-center gap-2 cursor-pointer">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Lagre utkast
                                </button>
                                <button onClick={handleSubmit} disabled={submitting || !!dateError || !!fnrError} className={cn("bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-6 py-2.5 transition-colors duration-150 text-sm flex items-center gap-2 cursor-pointer", dateError && "opacity-50 cursor-not-allowed")}>
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
