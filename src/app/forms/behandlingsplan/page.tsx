'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Heart, AlertCircle, Target, Calendar, Plus, Trash2, Pill, Activity, Info, FileCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface Tiltak {
    id: string;
    navn: string;
    beskrivelse: string;
    frekvens: string;
    ansvarlig: string;
    startDato: string;
}

interface Medikament {
    id: string;
    navn: string;
    dose: string;
    frekvens: string;
    varighet: string;
    notater: string;
}

export default function BehandlingsplanForm() {
    const [formData, setFormData] = useState({
        patientNavn: '',
        patientFnr: '',
        patientTelefon: '',
        kodesystem: 'ICPC-2',
        diagnoseKode: '',
        diagnoseBeskrivelse: '',
        diagnoseFritekst: '',
        kortsiktigeMaal: '',
        langsiktigeMaal: '',
        livsstilAnbefalinger: '',
        nesteKonsultasjon: '',
        evalueringskriterier: '',
        ansvarligBehandler: '',
        pasientSamtykke: false,
        pasientSignatur: '',
    });

    const [tiltak, setTiltak] = useState<Tiltak[]>([]);
    const [medikamenter, setMedikamenter] = useState<Medikament[]>([]);

    const { saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'behandlingsplan' });

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getAllFormData = () => ({
        ...formData,
        tiltak,
        medikamenter,
    });

    const handleSave = () => {
        saveAsDraft(getAllFormData());
    };

    const handleSubmit = () => {
        submitForm(getAllFormData());
    };

    // Dynamic list management — Tiltak
    const addTiltak = () => {
        setTiltak(prev => [...prev, { id: crypto.randomUUID(), navn: '', beskrivelse: '', frekvens: '', ansvarlig: '', startDato: '' }]);
    };
    const removeTiltak = (id: string) => {
        setTiltak(prev => prev.filter(t => t.id !== id));
    };
    const updateTiltak = (id: string, field: keyof Tiltak, value: string) => {
        setTiltak(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    // Dynamic list management — Medikamenter
    const addMedikament = () => {
        setMedikamenter(prev => [...prev, { id: crypto.randomUUID(), navn: '', dose: '', frekvens: '', varighet: '', notater: '' }]);
    };
    const removeMedikament = (id: string) => {
        setMedikamenter(prev => prev.filter(m => m.id !== id));
    };
    const updateMedikament = (id: string, field: keyof Medikament, value: string) => {
        setMedikamenter(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    // Common ICPC-2 codes for treatment plans
    const commonCodes = [
        { code: 'L03', label: 'Korsryggsymptomer' },
        { code: 'P76', label: 'Depressiv lidelse' },
        { code: 'T90', label: 'Diabetes type 2' },
        { code: 'K86', label: 'Hypertensjon' },
        { code: 'P74', label: 'Angstlidelse' },
        { code: 'L91', label: 'Artrose' },
        { code: 'K77', label: 'Hjertesvikt' },
        { code: 'T82', label: 'Overvekt' },
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
                        <button
                            onClick={() => exportPdf(getAllFormData(), 'Behandlingsplan', 'Lege')}
                            className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
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
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />}
                            {submitting ? 'Lagrer...' : submitted ? 'Lagret' : 'Lagre behandlingsplan'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[rgba(239,68,68,0.1)] rounded-xl flex items-center justify-center">
                            <Heart className="w-5 h-5 text-[#EF4444]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#EDEDED]" style={{ fontFamily: "'Georgia', serif" }}>
                        Behandlingsplan
                    </h1>
                    <p className="text-[#8B8B8B] mt-1">Strukturert behandlingsplan med mål, tiltak og oppfølgingsplan</p>
                </div>

                {submitted ? (
                    <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#10B981]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#EDEDED] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Behandlingsplan lagret
                        </h2>
                        <p className="text-[#8B8B8B] mb-6">Behandlingsplanen er lagret i pasientjournalen.</p>
                        {error && <p className="text-sm text-[#EF4444] mb-4">{error}</p>}
                        <p className="text-sm font-mono text-[#5C5C5C] mb-8">Referanse: BEH-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
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
                        {/* Section 1: Pasientopplysninger */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Informasjon om pasienten</p>

                            <div className="grid grid-cols-3 gap-4">
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
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
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

                        {/* Section 2: Diagnoseinformasjon */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">2. Diagnoseinformasjon</h2>
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
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] font-mono"
                                        placeholder="L03"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Diagnosebeskrivelse <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseBeskrivelse}
                                        onChange={(e) => updateField('diagnoseBeskrivelse', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="Korsryggsymptomer"
                                    />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="p-3 bg-[rgba(94,106,210,0.08)] rounded-lg border border-[rgba(94,106,210,0.15)] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#7B89DB]" />
                                    <span className="text-xs font-semibold text-[#7B89DB]">Vanlige ICPC-2-koder for behandlingsplan</span>
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
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Utdypende beskrivelse</label>
                                <textarea
                                    value={formData.diagnoseFritekst}
                                    onChange={(e) => updateField('diagnoseFritekst', e.target.value)}
                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[60px] resize-y"
                                    placeholder="Utdypende beskrivelse av diagnose..."
                                />
                            </div>
                        </div>

                        {/* Section 3: Behandlingsmal */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">3. Behandlingsmål</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Definerte mål for behandlingen</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Kortsiktige mål (4-6 uker) <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.kortsiktigeMaal}
                                        onChange={(e) => updateField('kortsiktigeMaal', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                        placeholder="Beskriv konkrete kortsiktige mål for behandlingen..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Langsiktige mål (3-6 måneder) <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.langsiktigeMaal}
                                        onChange={(e) => updateField('langsiktigeMaal', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                        placeholder="Beskriv overordnede langsiktige mål for behandlingen..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Planlagte tiltak */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">4. Planlagte tiltak</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Intervensjoner og behandlingstiltak</p>

                            {tiltak.length === 0 ? (
                                <p className="text-sm text-[#5C5C5C] italic text-center py-6">
                                    Ingen tiltak lagt til ennå. Klikk knappen under for å legge til.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {tiltak.map((t, index) => (
                                        <div key={t.id} className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 mb-3 relative">
                                            <button
                                                onClick={() => removeTiltak(t.id)}
                                                className="absolute top-3 right-3 p-1.5 rounded-lg text-[#5C5C5C] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                                                title="Fjern tiltak"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <p className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-3">Tiltak {index + 1}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Navn på tiltak</label>
                                                    <input
                                                        type="text"
                                                        value={t.navn}
                                                        onChange={(e) => updateTiltak(t.id, 'navn', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                        placeholder="Navn på tiltak"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Frekvens</label>
                                                    <input
                                                        type="text"
                                                        value={t.frekvens}
                                                        onChange={(e) => updateTiltak(t.id, 'frekvens', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                        placeholder="Frekvens, f.eks. 2x/uke"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Ansvarlig behandler</label>
                                                    <input
                                                        type="text"
                                                        value={t.ansvarlig}
                                                        onChange={(e) => updateTiltak(t.id, 'ansvarlig', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                        placeholder="Ansvarlig behandler"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Startdato</label>
                                                    <input
                                                        type="date"
                                                        value={t.startDato}
                                                        onChange={(e) => updateTiltak(t.id, 'startDato', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Beskrivelse</label>
                                                <textarea
                                                    value={t.beskrivelse}
                                                    onChange={(e) => updateTiltak(t.id, 'beskrivelse', e.target.value)}
                                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[60px] resize-y"
                                                    placeholder="Beskrivelse av tiltaket..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addTiltak}
                                className="mt-3 w-full py-2.5 rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.06)] text-sm font-medium text-[#8B8B8B] hover:border-[#5E6AD2] hover:text-[#7B89DB] hover:bg-[rgba(94,106,210,0.08)] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Legg til tiltak
                            </button>
                        </div>

                        {/* Section 5: Medikamentplan */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Pill className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">5. Medikamentplan</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Oversikt over medikamentell behandling</p>

                            {medikamenter.length === 0 ? (
                                <p className="text-sm text-[#5C5C5C] italic text-center py-6">
                                    Ingen medikamenter lagt til ennå. Klikk knappen under for å legge til.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {medikamenter.map((m, index) => (
                                        <div key={m.id} className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 mb-3 relative">
                                            <button
                                                onClick={() => removeMedikament(m.id)}
                                                className="absolute top-3 right-3 p-1.5 rounded-lg text-[#5C5C5C] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                                                title="Fjern medikament"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <p className="text-xs font-semibold text-[#5C5C5C] uppercase tracking-wider mb-3">Medikament {index + 1}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Medikamentnavn</label>
                                                    <input
                                                        type="text"
                                                        value={m.navn}
                                                        onChange={(e) => updateMedikament(m.id, 'navn', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                        placeholder="Medikamentnavn"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Dosering</label>
                                                    <input
                                                        type="text"
                                                        value={m.dose}
                                                        onChange={(e) => updateMedikament(m.id, 'dose', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                        placeholder="Dosering, f.eks. 500mg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Frekvens</label>
                                                    <input
                                                        type="text"
                                                        value={m.frekvens}
                                                        onChange={(e) => updateMedikament(m.id, 'frekvens', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                        placeholder="Frekvens, f.eks. 2x daglig"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Varighet</label>
                                                    <input
                                                        type="text"
                                                        value={m.varighet}
                                                        onChange={(e) => updateMedikament(m.id, 'varighet', e.target.value)}
                                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                                        placeholder="Varighet, f.eks. 3 måneder"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Spesielle instruksjoner</label>
                                                <textarea
                                                    value={m.notater}
                                                    onChange={(e) => updateMedikament(m.id, 'notater', e.target.value)}
                                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[40px] resize-y"
                                                    placeholder="Spesielle instruksjoner..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addMedikament}
                                className="mt-3 w-full py-2.5 rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.06)] text-sm font-medium text-[#8B8B8B] hover:border-[#5E6AD2] hover:text-[#7B89DB] hover:bg-[rgba(94,106,210,0.08)] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Legg til medikament
                            </button>
                        </div>

                        {/* Section 6: Aktivitet og livsstil */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">6. Aktivitet og livsstil</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Anbefalinger for livsstilsendringer</p>

                            <div>
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Livsstilsanbefalinger</label>
                                <textarea
                                    value={formData.livsstilAnbefalinger}
                                    onChange={(e) => updateField('livsstilAnbefalinger', e.target.value)}
                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[100px] resize-y"
                                    placeholder="Anbefalinger for livsstilsendringer..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Oppfolgingsplan */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">7. Oppfølgingsplan</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Plan for videre oppfølging og evaluering</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Neste konsultasjon <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.nesteKonsultasjon}
                                        onChange={(e) => updateField('nesteKonsultasjon', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Ansvarlig behandler</label>
                                    <input
                                        type="text"
                                        value={formData.ansvarligBehandler}
                                        onChange={(e) => updateField('ansvarligBehandler', e.target.value)}
                                        className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                        placeholder="Navn på ansvarlig behandler"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Evalueringskriterier</label>
                                <textarea
                                    value={formData.evalueringskriterier}
                                    onChange={(e) => updateField('evalueringskriterier', e.target.value)}
                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] min-h-[80px] resize-y"
                                    placeholder="Kriterier for evaluering av behandlingseffekt..."
                                />
                            </div>
                        </div>

                        {/* Section 8: Pasientmedvirkning */}
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <FileCheck className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[#EDEDED]">8. Pasientmedvirkning</h2>
                            </div>
                            <p className="text-xs text-[#5C5C5C] mb-4 ml-6">Pasientens samtykke og signatur</p>

                            <label className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all mb-4",
                                formData.pasientSamtykke ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2]/30"
                            )}>
                                <input
                                    type="checkbox"
                                    checked={formData.pasientSamtykke}
                                    onChange={(e) => updateField('pasientSamtykke', e.target.checked)}
                                    className="mt-0.5 w-5 h-5 rounded border-[rgba(255,255,255,0.10)] text-[#5E6AD2] focus:ring-[#5E6AD2]"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-[#EDEDED] block">Pasientens samtykke</span>
                                    <span className="text-xs text-[#8B8B8B] mt-1 block">
                                        Pasienten har deltatt i utarbeidelsen av behandlingsplanen og samtykker til de planlagte tiltakene
                                    </span>
                                </div>
                            </label>

                            <div className="mb-3">
                                <label className="text-[#8B8B8B] text-sm font-medium block mb-1.5">Pasientens signatur (skriv fullt navn) <span className="text-[#EF4444]">*</span></label>
                                <input
                                    type="text"
                                    value={formData.pasientSignatur}
                                    onChange={(e) => updateField('pasientSignatur', e.target.value)}
                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C]"
                                    style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
                                    placeholder="Skriv ditt fulle navn her som elektronisk signatur"
                                />
                            </div>
                            <p className="text-xs text-[#5C5C5C]">
                                Dato: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#10B981]" />
                                <span className="text-xs font-semibold text-[#10B981]">GDPR-kompatibel</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {error && <p className="text-sm text-[#EF4444]">{error}</p>}
                                <button onClick={handleSave} disabled={saving} className="border border-[rgba(255,255,255,0.06)] text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Lagrer...' : 'Lagre utkast'}
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                                    {submitting ? 'Lagrer...' : 'Lagre behandlingsplan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
