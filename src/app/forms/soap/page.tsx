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
        submitForm(formData);
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
                        <button onClick={handleExport} className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5">
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
                        <div className="w-10 h-10 bg-[#F5EDE6] rounded-xl flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-[#A0714F]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                        SOAP Journalnotat
                    </h1>
                    <p className="text-[#7D7267] mt-1">Standardisert klinisk dokumentasjon</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                            Journalnotat lagret
                        </h2>
                        <p className="text-[#7D7267] mb-6">SOAP-notatet er lagret i pasientjournalen.</p>
                        <p className="text-sm font-mono text-[var(--medical-gray-400)] mb-8">Referanse: {submissionId || 'N/A'}</p>
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
                        {/* Section 1: Patient and Consultation */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Pasient og konsultasjon</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Pasientinformasjon og konsultasjonsdetaljer</p>

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
                                    <label className="form-label form-required">Fodselsnummer (11 siffer)</label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="form-label form-required">Konsultasjonsdato og -tid</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.konsultasjonDato}
                                        onChange={(e) => updateField('konsultasjonDato', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Konsultasjonstype</label>
                                    <select
                                        value={formData.konsultasjonstype}
                                        onChange={(e) => updateField('konsultasjonstype', e.target.value)}
                                        className="input-field !text-sm"
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
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Clipboard className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. S -- Subjektivt</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Pasientens beskrivelse av plager og symptomer</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Hovedplage</label>
                                    <textarea
                                        value={formData.hovedplage}
                                        onChange={(e) => updateField('hovedplage', e.target.value)}
                                        className="input-field !text-sm min-h-[100px] resize-y"
                                        placeholder="Hva er hovedgrunnen til at pasienten oppsoker lege?"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Symptomhistorikk</label>
                                    <textarea
                                        value={formData.symptomHistorikk}
                                        onChange={(e) => updateField('symptomHistorikk', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Nar startet symptomene? Varighet, forverring, lindrende faktorer..."
                                    />
                                </div>

                                {/* Pain assessment sub-section */}
                                <div className="p-4 bg-[#FEF3C7]/50 rounded-lg border border-[#F59E0B]/20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Smertlokalisering</label>
                                            <input
                                                type="text"
                                                value={formData.smerteLokasjon}
                                                onChange={(e) => updateField('smerteLokasjon', e.target.value)}
                                                className="input-field !text-sm"
                                                placeholder="Lokalisering av smerte"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Smerteintensitet (0-10)</label>
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
                                                <span className="text-lg font-bold text-[#C8842B] w-10 text-right">{formData.smerteIntensitet}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Objective */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Stethoscope className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. O -- Objektivt</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Kliniske funn og malinger</p>

                            {/* Vital signs */}
                            <div className="p-4 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6] mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-3.5 h-3.5 text-[#A0714F]" />
                                    <span className="text-xs font-semibold text-[#A0714F]">Vitale tegn</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3 mb-3">
                                    <div>
                                        <label className="form-label text-xs">Systolisk <span className="text-[var(--medical-gray-400)] font-normal">mmHg</span></label>
                                        <input
                                            type="number"
                                            value={formData.systolisk}
                                            onChange={(e) => updateField('systolisk', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="120"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-xs">Diastolisk <span className="text-[var(--medical-gray-400)] font-normal">mmHg</span></label>
                                        <input
                                            type="number"
                                            value={formData.diastolisk}
                                            onChange={(e) => updateField('diastolisk', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="80"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-xs">Puls <span className="text-[var(--medical-gray-400)] font-normal">bpm</span></label>
                                        <input
                                            type="number"
                                            value={formData.puls}
                                            onChange={(e) => updateField('puls', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="72"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-xs">Temperatur <span className="text-[var(--medical-gray-400)] font-normal">&deg;C</span></label>
                                        <input
                                            type="number"
                                            value={formData.temperatur}
                                            onChange={(e) => updateField('temperatur', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="37.0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    <div>
                                        <label className="form-label text-xs">Resp.frekvens <span className="text-[var(--medical-gray-400)] font-normal">/min</span></label>
                                        <input
                                            type="number"
                                            value={formData.respFrekvens}
                                            onChange={(e) => updateField('respFrekvens', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="16"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-xs">SpO2 <span className="text-[var(--medical-gray-400)] font-normal">%</span></label>
                                        <input
                                            type="number"
                                            value={formData.spo2}
                                            onChange={(e) => updateField('spo2', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="98"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-xs">Vekt <span className="text-[var(--medical-gray-400)] font-normal">kg</span></label>
                                        <input
                                            type="number"
                                            value={formData.vekt}
                                            onChange={(e) => updateField('vekt', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="75"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label text-xs">Hoyde <span className="text-[var(--medical-gray-400)] font-normal">cm</span></label>
                                        <input
                                            type="number"
                                            value={formData.hoyde}
                                            onChange={(e) => updateField('hoyde', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="175"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Fysisk undersokelse</label>
                                    <textarea
                                        value={formData.fysiskUndersokelse}
                                        onChange={(e) => updateField('fysiskUndersokelse', e.target.value)}
                                        className="input-field !text-sm min-h-[100px] resize-y"
                                        placeholder="Funn ved klinisk undersokelse..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Laboratorieresultater</label>
                                    <textarea
                                        value={formData.labResultater}
                                        onChange={(e) => updateField('labResultater', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Laboratorieresultater, bildediagnostikk..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Assessment */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. A -- Analyse/Vurdering</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Diagnostisk vurdering</p>

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
                            <div className="p-3 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#A0714F]" />
                                    <span className="text-xs font-semibold text-[#A0714F]">Vanlige ICPC-2-koder</span>
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
                                                    ? "bg-[#A0714F] text-white border-[#A0714F]"
                                                    : "bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#A0714F] hover:text-[#A0714F]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Differensialdiagnoser</label>
                                <textarea
                                    value={formData.differensialdiagnoser}
                                    onChange={(e) => updateField('differensialdiagnoser', e.target.value)}
                                    className="input-field !text-sm min-h-[60px] resize-y"
                                    placeholder="Andre mulige diagnoser som bor vurderes..."
                                />
                            </div>
                        </div>

                        {/* Section 5: Plan */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. P -- Plan</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Behandlingsplan og oppfolging</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Behandlingsplan</label>
                                    <textarea
                                        value={formData.behandlingsplan}
                                        onChange={(e) => updateField('behandlingsplan', e.target.value)}
                                        className="input-field !text-sm min-h-[100px] resize-y"
                                        placeholder="Beskrivelse av behandlingsplan..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Medikamenter</label>
                                    <textarea
                                        value={formData.medikamenter}
                                        onChange={(e) => updateField('medikamenter', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Forskrevne medikamenter med dosering..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Henvisning</label>
                                    <textarea
                                        value={formData.henvisning}
                                        onChange={(e) => updateField('henvisning', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Eventuelle henvisninger til spesialist..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Oppfolging</label>
                                        <textarea
                                            value={formData.oppfolging}
                                            onChange={(e) => updateField('oppfolging', e.target.value)}
                                            className="input-field !text-sm min-h-[60px] resize-y"
                                            placeholder="Plan for oppfolging..."
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Neste konsultasjon</label>
                                        <input
                                            type="date"
                                            value={formData.nesteKonsultasjon}
                                            onChange={(e) => updateField('nesteKonsultasjon', e.target.value)}
                                            className="input-field !text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Doctor Info */}
                        <div className="form-section">
                            <h2 className="form-section-title">6. Sykmelder</h2>
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
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3D8B6E]" />
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel lagring</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Lagre utkast
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2">
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
