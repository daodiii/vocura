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
        setTiltak(prev => [...prev, { id: Date.now().toString(), navn: '', beskrivelse: '', frekvens: '', ansvarlig: '', startDato: '' }]);
    };
    const removeTiltak = (id: string) => {
        setTiltak(prev => prev.filter(t => t.id !== id));
    };
    const updateTiltak = (id: string, field: keyof Tiltak, value: string) => {
        setTiltak(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    // Dynamic list management — Medikamenter
    const addMedikament = () => {
        setMedikamenter(prev => [...prev, { id: Date.now().toString(), navn: '', dose: '', frekvens: '', varighet: '', notater: '' }]);
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
                            onClick={() => exportPdf(getAllFormData(), 'Behandlingsplan', 'Lege')}
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
                        <div className="w-10 h-10 bg-[#FAEAE8] rounded-xl flex items-center justify-center">
                            <Heart className="w-5 h-5 text-[#C44536]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                        Behandlingsplan
                    </h1>
                    <p className="text-[#7D7267] mt-1">Strukturert behandlingsplan med mål, tiltak og oppfølgingsplan</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                            Behandlingsplan lagret
                        </h2>
                        <p className="text-[#7D7267] mb-6">Behandlingsplanen er lagret i pasientjournalen.</p>
                        {error && <p className="text-sm text-[#C44536] mb-4">{error}</p>}
                        <p className="text-sm font-mono text-[var(--medical-gray-400)] mb-8">Referanse: BEH-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
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
                        {/* Section 1: Pasientopplysninger */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Informasjon om pasienten</p>

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

                        {/* Section 2: Diagnoseinformasjon */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Diagnoseinformasjon</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Medisinsk diagnose etter ICPC-2 eller ICD-10</p>

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
                            <div className="p-3 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#A0714F]" />
                                    <span className="text-xs font-semibold text-[#A0714F]">Vanlige ICPC-2-koder for behandlingsplan</span>
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
                                <label className="form-label">Utdypende beskrivelse</label>
                                <textarea
                                    value={formData.diagnoseFritekst}
                                    onChange={(e) => updateField('diagnoseFritekst', e.target.value)}
                                    className="input-field !text-sm min-h-[60px] resize-y"
                                    placeholder="Utdypende beskrivelse av diagnose..."
                                />
                            </div>
                        </div>

                        {/* Section 3: Behandlingsmal */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Behandlingsm&aring;l</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Definerte mål for behandlingen</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Kortsiktige mål (4-6 uker)</label>
                                    <textarea
                                        value={formData.kortsiktigeMaal}
                                        onChange={(e) => updateField('kortsiktigeMaal', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv konkrete kortsiktige mål for behandlingen..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Langsiktige mål (3-6 måneder)</label>
                                    <textarea
                                        value={formData.langsiktigeMaal}
                                        onChange={(e) => updateField('langsiktigeMaal', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv overordnede langsiktige mål for behandlingen..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Planlagte tiltak */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Planlagte tiltak</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Intervensjoner og behandlingstiltak</p>

                            {tiltak.length === 0 ? (
                                <p className="text-sm text-[var(--medical-gray-400)] italic text-center py-6">
                                    Ingen tiltak lagt til enn&aring;. Klikk knappen under for &aring; legge til.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {tiltak.map((t, index) => (
                                        <div key={t.id} className="card-base p-4 mb-3 relative">
                                            <button
                                                onClick={() => removeTiltak(t.id)}
                                                className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--medical-gray-400)] hover:text-[#C44536] hover:bg-[#FAEAE8] transition-colors"
                                                title="Fjern tiltak"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <p className="text-xs font-semibold text-[var(--medical-gray-400)] uppercase tracking-wider mb-3">Tiltak {index + 1}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="form-label">Navn på tiltak</label>
                                                    <input
                                                        type="text"
                                                        value={t.navn}
                                                        onChange={(e) => updateTiltak(t.id, 'navn', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Navn på tiltak"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Frekvens</label>
                                                    <input
                                                        type="text"
                                                        value={t.frekvens}
                                                        onChange={(e) => updateTiltak(t.id, 'frekvens', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Frekvens, f.eks. 2x/uke"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="form-label">Ansvarlig behandler</label>
                                                    <input
                                                        type="text"
                                                        value={t.ansvarlig}
                                                        onChange={(e) => updateTiltak(t.id, 'ansvarlig', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Ansvarlig behandler"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Startdato</label>
                                                    <input
                                                        type="date"
                                                        value={t.startDato}
                                                        onChange={(e) => updateTiltak(t.id, 'startDato', e.target.value)}
                                                        className="input-field !text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="form-label">Beskrivelse</label>
                                                <textarea
                                                    value={t.beskrivelse}
                                                    onChange={(e) => updateTiltak(t.id, 'beskrivelse', e.target.value)}
                                                    className="input-field !text-sm min-h-[60px] resize-y"
                                                    placeholder="Beskrivelse av tiltaket..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addTiltak}
                                className="mt-3 w-full py-2.5 rounded-lg border-2 border-dashed border-[#DDD7CE] text-sm font-medium text-[#5E5549] hover:border-[#A0714F] hover:text-[#A0714F] hover:bg-[#F5FAFF] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Legg til tiltak
                            </button>
                        </div>

                        {/* Section 5: Medikamentplan */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Pill className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Medikamentplan</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Oversikt over medikamentell behandling</p>

                            {medikamenter.length === 0 ? (
                                <p className="text-sm text-[var(--medical-gray-400)] italic text-center py-6">
                                    Ingen medikamenter lagt til enn&aring;. Klikk knappen under for &aring; legge til.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {medikamenter.map((m, index) => (
                                        <div key={m.id} className="card-base p-4 mb-3 relative">
                                            <button
                                                onClick={() => removeMedikament(m.id)}
                                                className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--medical-gray-400)] hover:text-[#C44536] hover:bg-[#FAEAE8] transition-colors"
                                                title="Fjern medikament"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <p className="text-xs font-semibold text-[var(--medical-gray-400)] uppercase tracking-wider mb-3">Medikament {index + 1}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="form-label">Medikamentnavn</label>
                                                    <input
                                                        type="text"
                                                        value={m.navn}
                                                        onChange={(e) => updateMedikament(m.id, 'navn', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Medikamentnavn"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Dosering</label>
                                                    <input
                                                        type="text"
                                                        value={m.dose}
                                                        onChange={(e) => updateMedikament(m.id, 'dose', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Dosering, f.eks. 500mg"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="form-label">Frekvens</label>
                                                    <input
                                                        type="text"
                                                        value={m.frekvens}
                                                        onChange={(e) => updateMedikament(m.id, 'frekvens', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Frekvens, f.eks. 2x daglig"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Varighet</label>
                                                    <input
                                                        type="text"
                                                        value={m.varighet}
                                                        onChange={(e) => updateMedikament(m.id, 'varighet', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Varighet, f.eks. 3 måneder"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="form-label">Spesielle instruksjoner</label>
                                                <textarea
                                                    value={m.notater}
                                                    onChange={(e) => updateMedikament(m.id, 'notater', e.target.value)}
                                                    className="input-field !text-sm min-h-[40px] resize-y"
                                                    placeholder="Spesielle instruksjoner..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addMedikament}
                                className="mt-3 w-full py-2.5 rounded-lg border-2 border-dashed border-[#DDD7CE] text-sm font-medium text-[#5E5549] hover:border-[#A0714F] hover:text-[#A0714F] hover:bg-[#F5FAFF] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Legg til medikament
                            </button>
                        </div>

                        {/* Section 6: Aktivitet og livsstil */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Aktivitet og livsstil</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Anbefalinger for livsstilsendringer</p>

                            <div>
                                <label className="form-label">Livsstilsanbefalinger</label>
                                <textarea
                                    value={formData.livsstilAnbefalinger}
                                    onChange={(e) => updateField('livsstilAnbefalinger', e.target.value)}
                                    className="input-field !text-sm min-h-[100px] resize-y"
                                    placeholder="Anbefalinger for livsstilsendringer..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Oppfolgingsplan */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Oppfølgingsplan</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Plan for videre oppfølging og evaluering</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Neste konsultasjon</label>
                                    <input
                                        type="date"
                                        value={formData.nesteKonsultasjon}
                                        onChange={(e) => updateField('nesteKonsultasjon', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Ansvarlig behandler</label>
                                    <input
                                        type="text"
                                        value={formData.ansvarligBehandler}
                                        onChange={(e) => updateField('ansvarligBehandler', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Navn på ansvarlig behandler"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Evalueringskriterier</label>
                                <textarea
                                    value={formData.evalueringskriterier}
                                    onChange={(e) => updateField('evalueringskriterier', e.target.value)}
                                    className="input-field !text-sm min-h-[80px] resize-y"
                                    placeholder="Kriterier for evaluering av behandlingseffekt..."
                                />
                            </div>
                        </div>

                        {/* Section 8: Pasientmedvirkning */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <FileCheck className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">8. Pasientmedvirkning</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Pasientens samtykke og signatur</p>

                            <label className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all mb-4",
                                formData.pasientSamtykke ? "border-[#A0714F] bg-[#F5FAFF]" : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                            )}>
                                <input
                                    type="checkbox"
                                    checked={formData.pasientSamtykke}
                                    onChange={(e) => updateField('pasientSamtykke', e.target.checked)}
                                    className="mt-0.5 w-5 h-5 rounded border-[#CBD2D9] text-[#A0714F] focus:ring-[#A0714F]"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-[#1E1914] block">Pasientens samtykke</span>
                                    <span className="text-xs text-[#7D7267] mt-1 block">
                                        Pasienten har deltatt i utarbeidelsen av behandlingsplanen og samtykker til de planlagte tiltakene
                                    </span>
                                </div>
                            </label>

                            <div className="mb-3">
                                <label className="form-label form-required">Pasientens signatur (skriv fullt navn)</label>
                                <input
                                    type="text"
                                    value={formData.pasientSignatur}
                                    onChange={(e) => updateField('pasientSignatur', e.target.value)}
                                    className="input-field !text-sm"
                                    style={{ fontFamily: "var(--font-serif), 'Georgia', serif", fontStyle: 'italic' }}
                                    placeholder="Skriv ditt fulle navn her som elektronisk signatur"
                                />
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)]">
                                Dato: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3D8B6E]" />
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {error && <p className="text-sm text-[#C44536]">{error}</p>}
                                <button onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Lagrer...' : 'Lagre utkast'}
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2">
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
