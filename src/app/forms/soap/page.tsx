'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Stethoscope, AlertCircle, Calendar, Clipboard, FileText, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function SOAPForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'soap' });
    const [formData, setFormData] = useState({
        // Patient
        patientNavn: '',
        patientFnr: '',
        konsultasjonDato: '',
        konsultasjonstype: '',
        // Subjective
        hovedplage: '',
        symptomHistorikk: '',
        smerteIntensitet: 5,
        smerteLokasjon: '',
        // Objective
        systolisk: '',
        diastolisk: '',
        puls: '',
        temperatur: '',
        respFrekvens: '',
        spo2: '',
        vekt: '',
        hoyde: '',
        fysiskUndersokelse: '',
        labResultater: '',
        // Assessment
        kodesystem: 'ICPC-2',
        hoveddiagnoseKode: '',
        hoveddiagnoseBeskrivelse: '',
        differensialdiagnoser: '',
        // Plan
        behandlingsplan: '',
        medikamenter: '',
        henvisning: '',
        oppfolging: '',
        nesteKonsultasjon: '',
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

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        saveAsDraft(formData);
    };

    const handleSubmit = () => {
        // Trim diagnosis codes and patient ID to avoid matching issues from trailing spaces
        const trimmedData = {
            ...formData,
            patientFnr: formData.patientFnr.trim(),
            hoveddiagnoseKode: formData.hoveddiagnoseKode.trim(),
        };
        submitForm(trimmedData);
    };

    const handleExport = () => {
        exportPdf(formData, 'SOAP Journalnotat', profile?.name || 'Lege');
    };

    const commonCodes = [
        { code: 'R74', label: 'Ovre luftveisinfeksjon' },
        { code: 'L03', label: 'Korsryggsymptomer' },
        { code: 'K86', label: 'Hypertensjon, ukomplisert' },
        { code: 'T90', label: 'Diabetes type 2' },
        { code: 'P76', label: 'Depressiv lidelse' },
        { code: 'D73', label: 'Gastroenteritt' },
        { code: 'L02', label: 'Ryggsymptomer/plager' },
        { code: 'R78', label: 'Akutt bronkitt' },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[#111111]/80 border-b border-[rgba(255,255,255,0.06)] backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Link href="/forms" className="flex items-center gap-2 text-[#8B8B8B] hover:text-[#EDEDED] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Tilbake til skjemaer</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-[#8B8B8B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-1.5 transition-colors duration-150 text-xs flex items-center gap-1.5 !py-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button onClick={handleExport} className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs !py-2 !px-4 flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5",
                                submitted ? "bg-[#10B981] text-white rounded-lg font-semibold" : "bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Stethoscope className="w-3.5 h-3.5" />}
                            {submitted ? 'Lagret' : 'Lagre journalnotat'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[rgba(94,106,210,0.08)] rounded-xl flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-[#5E6AD2]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#EDEDED]" style={{ fontFamily: "'Georgia', serif" }}>
                        SOAP Journalnotat
                    </h1>
                    <p className="text-[#8B8B8B] mt-1">Standardisert klinisk dokumentasjon</p>
                </div>

                {submitted ? (
                    <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#10B981]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#EDEDED] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Journalnotat lagret
                        </h2>
                        <p className="text-[#8B8B8B] mb-6">SOAP-notatet er lagret i pasientjournalen.</p>
                        <p className="text-sm font-mono text-[#5C5C5C] mb-8">Referanse: {submissionId || 'N/A'}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section 1: Patient and Consultation */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">1. Pasient og konsultasjon</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Pasientinformasjon og konsultasjonsdetaljer</p>

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
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Fodselsnummer (11 siffer) <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Konsultasjonsdato og -tid <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="datetime-local"
                                        value={formData.konsultasjonDato}
                                        onChange={(e) => updateField('konsultasjonDato', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Konsultasjonstype <span className="text-[#EF4444]">*</span></label>
                                    <select
                                        value={formData.konsultasjonstype}
                                        onChange={(e) => updateField('konsultasjonstype', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="ordinaer">Ordinaer konsultasjon</option>
                                        <option value="akutt">Akutt-time</option>
                                        <option value="telefon">Telefonkonsultasjon</option>
                                        <option value="video">Videokonsultasjon</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Subjective */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Clipboard className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">2. S -- Subjektivt</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Pasientens beskrivelse av plager og symptomer</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Hovedplage <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.hovedplage}
                                        onChange={(e) => updateField('hovedplage', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[100px] resize-y"
                                        placeholder="Hva er hovedgrunnen til at pasienten oppsoker lege?"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Symptomhistorikk</label>
                                    <textarea
                                        value={formData.symptomHistorikk}
                                        onChange={(e) => updateField('symptomHistorikk', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                        placeholder="Nar startet symptomene? Varighet, forverring, lindrende faktorer..."
                                    />
                                </div>

                                {/* Pain assessment sub-section */}
                                <div className="p-4 bg-[rgba(245,158,11,0.1)] rounded-lg border border-[rgba(245,158,11,0.2)]">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Smertlokalisering</label>
                                            <input
                                                type="text"
                                                value={formData.smerteLokasjon}
                                                onChange={(e) => updateField('smerteLokasjon', e.target.value)}
                                                className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                placeholder="Lokalisering av smerte"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Smerteintensitet (0-10)</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    step="1"
                                                    value={formData.smerteIntensitet}
                                                    onChange={(e) => updateField('smerteIntensitet', parseInt(e.target.value))}
                                                    className="flex-1"
                                                />
                                                <span className="text-lg font-bold text-[#F59E0B] w-10 text-right">{formData.smerteIntensitet}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Objective */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Stethoscope className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">3. O -- Objektivt</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Kliniske funn og malinger</p>

                            {/* Vital signs */}
                            <div className="p-4 bg-[rgba(94,106,210,0.08)] rounded-lg border border-[rgba(94,106,210,0.15)] mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-3.5 h-3.5 text-[#7B89DB]" />
                                    <span className="text-xs font-semibold text-[#7B89DB]">Vitale tegn</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">Systolisk <span className="text-[#5C5C5C] font-normal">mmHg</span></label>
                                        <input
                                            type="number"
                                            value={formData.systolisk}
                                            onChange={(e) => updateField('systolisk', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="120"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">Diastolisk <span className="text-[#5C5C5C] font-normal">mmHg</span></label>
                                        <input
                                            type="number"
                                            value={formData.diastolisk}
                                            onChange={(e) => updateField('diastolisk', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="80"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">Puls <span className="text-[#5C5C5C] font-normal">bpm</span></label>
                                        <input
                                            type="number"
                                            value={formData.puls}
                                            onChange={(e) => updateField('puls', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="72"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">Temperatur <span className="text-[#5C5C5C] font-normal">&deg;C</span></label>
                                        <input
                                            type="number"
                                            value={formData.temperatur}
                                            onChange={(e) => updateField('temperatur', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="37.0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">Resp.frekvens <span className="text-[#5C5C5C] font-normal">/min</span></label>
                                        <input
                                            type="number"
                                            value={formData.respFrekvens}
                                            onChange={(e) => updateField('respFrekvens', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="16"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">SpO2 <span className="text-[#5C5C5C] font-normal">%</span></label>
                                        <input
                                            type="number"
                                            value={formData.spo2}
                                            onChange={(e) => updateField('spo2', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="98"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">Vekt <span className="text-[#5C5C5C] font-normal">kg</span></label>
                                        <input
                                            type="number"
                                            value={formData.vekt}
                                            onChange={(e) => updateField('vekt', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="75"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#8B8B8B] text-xs font-medium block mb-1.5">Hoyde <span className="text-[#5C5C5C] font-normal">cm</span></label>
                                        <input
                                            type="number"
                                            value={formData.hoyde}
                                            onChange={(e) => updateField('hoyde', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                            placeholder="175"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Fysisk undersokelse</label>
                                    <textarea
                                        value={formData.fysiskUndersokelse}
                                        onChange={(e) => updateField('fysiskUndersokelse', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[100px] resize-y"
                                        placeholder="Funn ved klinisk undersokelse..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Laboratorieresultater</label>
                                    <textarea
                                        value={formData.labResultater}
                                        onChange={(e) => updateField('labResultater', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                        placeholder="Laboratorieresultater, bildediagnostikk..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Assessment */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">4. A -- Analyse/Vurdering</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Diagnostisk vurdering</p>

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
                                            className="text-[#5E6AD2]"
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
                                            className="text-[#5E6AD2]"
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
                            <div className="p-3 bg-[rgba(94,106,210,0.08)] rounded-lg border border-[rgba(94,106,210,0.15)] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#7B89DB]" />
                                    <span className="text-xs font-semibold text-[#7B89DB]">Vanlige ICPC-2-koder</span>
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
                                                "text-xs px-2.5 py-1 rounded-full border transition-all",
                                                formData.hoveddiagnoseKode === item.code
                                                    ? "bg-[#5E6AD2] text-white border-[#5E6AD2]"
                                                    : "bg-[#111111] text-[#8B8B8B] border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2] hover:text-[#7B89DB]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Differensialdiagnoser</label>
                                <textarea
                                    value={formData.differensialdiagnoser}
                                    onChange={(e) => updateField('differensialdiagnoser', e.target.value)}
                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[60px] resize-y"
                                    placeholder="Andre mulige diagnoser som bor vurderes..."
                                />
                            </div>
                        </div>

                        {/* Section 5: Plan */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">5. P -- Plan</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Behandlingsplan og oppfolging</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Behandlingsplan <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.behandlingsplan}
                                        onChange={(e) => updateField('behandlingsplan', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[100px] resize-y"
                                        placeholder="Beskrivelse av behandlingsplan..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Medikamenter</label>
                                    <textarea
                                        value={formData.medikamenter}
                                        onChange={(e) => updateField('medikamenter', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                        placeholder="Forskrevne medikamenter med dosering..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Henvisning</label>
                                    <textarea
                                        value={formData.henvisning}
                                        onChange={(e) => updateField('henvisning', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[60px] resize-y"
                                        placeholder="Eventuelle henvisninger til spesialist..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Oppfolging</label>
                                        <textarea
                                            value={formData.oppfolging}
                                            onChange={(e) => updateField('oppfolging', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[60px] resize-y"
                                            placeholder="Plan for oppfolging..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Neste konsultasjon</label>
                                        <input
                                            type="date"
                                            value={formData.nesteKonsultasjon}
                                            onChange={(e) => updateField('nesteKonsultasjon', e.target.value)}
                                            className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Doctor Info */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <h2 className="text-sm font-semibold text-[#EDEDED] mb-4 pb-3 border-b border-[rgba(255,255,255,0.06)]">6. Sykmelder</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Legens navn</label>
                                    <input
                                        type="text"
                                        value={formData.legeNavn}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] bg-[#111111]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.legeHPR}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] bg-[#111111] font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.legeAdresse}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] bg-[#111111]"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#10B981]" />
                                <span className="text-xs font-semibold text-[#10B981]">GDPR-kompatibel lagring</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Lagre utkast
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                                    Lagre journalnotat
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
