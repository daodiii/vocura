'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    CheckCircle,
    Download,
    Shield,
    User,
    Activity,
    AlertCircle,
    Target,
    Calendar,
    Plus,
    Trash2,
    Info,
    Dumbbell,
    ClipboardList,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface Exercise {
    id: string;
    navn: string;
    beskrivelse: string;
    sett: string;
    repetisjoner: string;
    frekvens: string;
    intensitet: string;
    progresjonskriterier: string;
    hjemmeovelse: boolean;
}

interface Milepel {
    id: string;
    beskrivelse: string;
    maalDato: string;
    kriterier: string;
}

export default function OpptreningsplanForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'opptreningsplan' });
    const [formData, setFormData] = useState({
        patientNavn: '',
        patientFnr: '',
        vurderingsDato: '',
        diagnose: '',
        diagnoseKode: '',
        naaverendeFunksjon: '',
        kortsiktigeMaal: '',
        langsiktigeMaal: '',
        forholdsregler: '',
        kontraindikasjoner: '',
        revurderingsDato: '',
        terapeutNavn: '',
        terapeutNotater: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, terapeutNavn: profile.name }));
        }
    }, [profile]);

    const [ovelser, setOvelser] = useState<Exercise[]>([]);
    const [milepeler, setMilepeler] = useState<Milepel[]>([]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addOvelse = () => {
        setOvelser(prev => [...prev, {
            id: Date.now().toString(),
            navn: '',
            beskrivelse: '',
            sett: '',
            repetisjoner: '',
            frekvens: '',
            intensitet: '',
            progresjonskriterier: '',
            hjemmeovelse: false,
        }]);
    };

    const removeOvelse = (id: string) => {
        setOvelser(prev => prev.filter(o => o.id !== id));
    };

    const updateOvelse = (id: string, field: keyof Exercise, value: string | boolean) => {
        setOvelser(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    };

    const addMilepel = () => {
        setMilepeler(prev => [...prev, {
            id: Date.now().toString(),
            beskrivelse: '',
            maalDato: '',
            kriterier: '',
        }]);
    };

    const removeMilepel = (id: string) => {
        setMilepeler(prev => prev.filter(m => m.id !== id));
    };

    const updateMilepel = (id: string, field: keyof Milepel, value: string) => {
        setMilepeler(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const getAllFormData = () => ({ ...formData, ovelser, milepeler });

    const handleSave = () => {
        saveAsDraft(getAllFormData());
    };

    const handleSubmit = () => {
        submitForm(getAllFormData());
    };

    const handleExportPdf = () => {
        exportPdf(getAllFormData(), 'Opptreningsplan', formData.terapeutNavn || 'Ukjent');
    };

    const hjemmeovelser = ovelser.filter(o => o.hjemmeovelse);

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
                        <button onClick={handleExportPdf} className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                            {submitting ? 'Lagrer...' : 'Lagre opptreningsplan'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#CCFBF1] rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5 text-[#0D9488]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                        Opptreningsplan
                    </h1>
                    <p className="text-[#7D7267] mt-1">Detaljert opptreningsplan med øvelser, mål og progresjon</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                            Opptreningsplan lagret
                        </h2>
                        <p className="text-[#7D7267] mb-6">Opptreningsplanen er lagret i pasientjournalen.</p>
                        <p className="text-sm font-mono text-[var(--medical-gray-400)] mb-8">
                            Referanse: {submissionId || `OPPT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`}
                        </p>
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
                                <User className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Informasjon om pasienten</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label form-required">Pasientnavn</label>
                                    <input
                                        type="text"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Fornavn Etternavn"
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
                                    <label className="form-label form-required">Vurderingsdato</label>
                                    <input
                                        type="date"
                                        value={formData.vurderingsDato}
                                        onChange={(e) => updateField('vurderingsDato', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Diagnose og nåværende funksjonsnivå */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Diagnose og nåværende funksjonsnivå</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Diagnose og funksjonsbeskrivelse</p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Diagnose</label>
                                    <input
                                        type="text"
                                        value={formData.diagnose}
                                        onChange={(e) => updateField('diagnose', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Hoveddiagnose"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Diagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="L03 / M54.5"
                                    />
                                </div>
                                <div />
                            </div>

                            <div>
                                <label className="form-label form-required">Nåværende funksjonsnivå</label>
                                <textarea
                                    value={formData.naaverendeFunksjon}
                                    onChange={(e) => updateField('naaverendeFunksjon', e.target.value)}
                                    className="input-field !text-sm min-h-[100px] resize-y"
                                    placeholder="Beskriv pasientens nåværende funksjonsnivå..."
                                />
                            </div>
                        </div>

                        {/* Section 3: Mål */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Mål</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Kortsiktige og langsiktige behandlingsmål</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Kortsiktige mål (4-6 uker)</label>
                                    <textarea
                                        value={formData.kortsiktigeMaal}
                                        onChange={(e) => updateField('kortsiktigeMaal', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv kortsiktige mål for rehabiliteringen..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Langsiktige mål (3-6 måneder)</label>
                                    <textarea
                                        value={formData.langsiktigeMaal}
                                        onChange={(e) => updateField('langsiktigeMaal', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv langsiktige mål for rehabiliteringen..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Øvelsesprogram */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Dumbbell className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Øvelsesprogram</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Øvelser med sett, repetisjoner og progresjonskriterier</p>

                            {ovelser.length === 0 ? (
                                <div className="p-6 text-center rounded-lg border-2 border-dashed border-[#DDD7CE]">
                                    <Info className="w-5 h-5 text-[var(--medical-gray-400)] mx-auto mb-2" />
                                    <p className="text-sm text-[var(--medical-gray-400)]">
                                        Ingen øvelser lagt til. Klikk knappen under for å legge til øvelser i programmet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ovelser.map((ovelse, index) => (
                                        <div
                                            key={ovelse.id}
                                            className="card-base p-4 mb-3 border-l-4 border-l-[#0D9488] relative"
                                        >
                                            {/* Exercise number badge & delete */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-[#0D9488] bg-[#CCFBF1] px-2 py-0.5 rounded">
                                                    Øvelse {index + 1}
                                                </span>
                                                <button
                                                    onClick={() => removeOvelse(ovelse.id)}
                                                    className="p-1.5 rounded-lg text-[var(--medical-gray-400)] hover:text-[#C44536] hover:bg-[#FAEAE8] transition-colors"
                                                    title="Fjern øvelse"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Row 1: Name + Frequency */}
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="form-label">Øvelsesnavn</label>
                                                    <input
                                                        type="text"
                                                        value={ovelse.navn}
                                                        onChange={(e) => updateOvelse(ovelse.id, 'navn', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Øvelsesnavn"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Frekvens</label>
                                                    <select
                                                        value={ovelse.frekvens}
                                                        onChange={(e) => updateOvelse(ovelse.id, 'frekvens', e.target.value)}
                                                        className="input-field !text-sm"
                                                    >
                                                        <option value="">Velg...</option>
                                                        <option value="1x/uke">1x/uke</option>
                                                        <option value="2x/uke">2x/uke</option>
                                                        <option value="3x/uke">3x/uke</option>
                                                        <option value="4x/uke">4x/uke</option>
                                                        <option value="5x/uke">5x/uke</option>
                                                        <option value="Daglig">Daglig</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Row 2: Sets, Reps, Intensity */}
                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div>
                                                    <label className="form-label">Antall sett</label>
                                                    <input
                                                        type="text"
                                                        value={ovelse.sett}
                                                        onChange={(e) => updateOvelse(ovelse.id, 'sett', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Antall sett"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Antall repetisjoner</label>
                                                    <input
                                                        type="text"
                                                        value={ovelse.repetisjoner}
                                                        onChange={(e) => updateOvelse(ovelse.id, 'repetisjoner', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Antall repetisjoner"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Intensitet/belastning</label>
                                                    <input
                                                        type="text"
                                                        value={ovelse.intensitet}
                                                        onChange={(e) => updateOvelse(ovelse.id, 'intensitet', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Intensitet/belastning"
                                                    />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="mb-3">
                                                <label className="form-label">Beskrivelse og instruksjoner</label>
                                                <textarea
                                                    value={ovelse.beskrivelse}
                                                    onChange={(e) => updateOvelse(ovelse.id, 'beskrivelse', e.target.value)}
                                                    className="input-field !text-sm min-h-[40px] resize-y"
                                                    placeholder="Beskrivelse og instruksjoner..."
                                                />
                                            </div>

                                            {/* Progression criteria */}
                                            <div className="mb-3">
                                                <label className="form-label">Progresjonskriterier</label>
                                                <input
                                                    type="text"
                                                    value={ovelse.progresjonskriterier}
                                                    onChange={(e) => updateOvelse(ovelse.id, 'progresjonskriterier', e.target.value)}
                                                    className="input-field !text-sm"
                                                    placeholder="Kriterier for progresjon, f.eks. øk med 2kg når 12 reps er oppnådd"
                                                />
                                            </div>

                                            {/* Home exercise checkbox */}
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={ovelse.hjemmeovelse}
                                                    onChange={(e) => updateOvelse(ovelse.id, 'hjemmeovelse', e.target.checked)}
                                                    className="w-4 h-4 rounded border-[#CBD2D9] text-[#0D9488] focus:ring-[#0D9488]"
                                                />
                                                <span className="text-sm text-[#3E4C59] font-medium">Også som hjemmeøvelse</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addOvelse}
                                className="btn-ghost text-sm flex items-center gap-2 mt-4 text-[#0D9488] hover:bg-[#CCFBF1]/50"
                            >
                                <Plus className="w-4 h-4" />
                                Legg til øvelse
                            </button>
                        </div>

                        {/* Section 5: Forholdsregler */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Forholdsregler</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Kontraindikasjoner og forholdsregler under trening</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Kontraindikasjoner</label>
                                    <textarea
                                        value={formData.kontraindikasjoner}
                                        onChange={(e) => updateField('kontraindikasjoner', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Kontraindikasjoner..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Forholdsregler under trening</label>
                                    <textarea
                                        value={formData.forholdsregler}
                                        onChange={(e) => updateField('forholdsregler', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Forholdsregler under trening..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Hjemmeøvelser */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <ClipboardList className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Hjemmeøvelser</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Automatisk generert fra øvelser markert som hjemmeøvelser</p>

                            {hjemmeovelser.length === 0 ? (
                                <div className="p-4 bg-[#F5F2ED] rounded-lg border border-[#DDD7CE]">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-4 h-4 text-[var(--medical-gray-400)] shrink-0 mt-0.5" />
                                        <p className="text-sm text-[var(--medical-gray-400)]">
                                            Ingen øvelser er markert som hjemmeøvelser ennå. Merk øvelser i programmet ovenfor.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {hjemmeovelser.map(o => (
                                        <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#CCFBF1]/30 border border-[#0D9488]/10">
                                            <CheckCircle className="w-4 h-4 text-[#0D9488]" />
                                            <div>
                                                <p className="text-sm font-semibold text-[#1E1914]">{o.navn || 'Uten navn'}</p>
                                                <p className="text-xs text-[#7D7267]">
                                                    {o.sett} sett × {o.repetisjoner} reps, {o.frekvens}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 7: Progresjonsmilpæler */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Progresjonsmilpæler</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Milepæler for å spore progresjon</p>

                            {milepeler.length === 0 ? (
                                <div className="p-6 text-center rounded-lg border-2 border-dashed border-[#DDD7CE]">
                                    <Info className="w-5 h-5 text-[var(--medical-gray-400)] mx-auto mb-2" />
                                    <p className="text-sm text-[var(--medical-gray-400)]">
                                        Ingen milepæler lagt til. Klikk knappen under for å legge til milepæler.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {milepeler.map((milepel, index) => (
                                        <div
                                            key={milepel.id}
                                            className="card-base p-4 mb-3 border-l-4 border-l-[#0D9488] relative"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-[#0D9488] bg-[#CCFBF1] px-2 py-0.5 rounded">
                                                    Milepæl {index + 1}
                                                </span>
                                                <button
                                                    onClick={() => removeMilepel(milepel.id)}
                                                    className="p-1.5 rounded-lg text-[var(--medical-gray-400)] hover:text-[#C44536] hover:bg-[#FAEAE8] transition-colors"
                                                    title="Fjern milepæl"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="form-label">Milepælbeskrivelse</label>
                                                    <input
                                                        type="text"
                                                        value={milepel.beskrivelse}
                                                        onChange={(e) => updateMilepel(milepel.id, 'beskrivelse', e.target.value)}
                                                        className="input-field !text-sm"
                                                        placeholder="Milepælbeskrivelse"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="form-label">Måldato</label>
                                                    <input
                                                        type="date"
                                                        value={milepel.maalDato}
                                                        onChange={(e) => updateMilepel(milepel.id, 'maalDato', e.target.value)}
                                                        className="input-field !text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="form-label">Oppnåelseskriterier</label>
                                                <input
                                                    type="text"
                                                    value={milepel.kriterier}
                                                    onChange={(e) => updateMilepel(milepel.id, 'kriterier', e.target.value)}
                                                    className="input-field !text-sm"
                                                    placeholder="Oppnåelseskriterier"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addMilepel}
                                className="btn-ghost text-sm flex items-center gap-2 mt-4 text-[#0D9488] hover:bg-[#CCFBF1]/50"
                            >
                                <Plus className="w-4 h-4" />
                                Legg til milepæl
                            </button>
                        </div>

                        {/* Section 8: Terapeutnotat */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">8. Terapeutnotat</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Re-evaluering og kliniske notater</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="form-label">Dato for re-evaluering</label>
                                    <input
                                        type="date"
                                        value={formData.revurderingsDato}
                                        onChange={(e) => updateField('revurderingsDato', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Terapeut</label>
                                    <input
                                        type="text"
                                        value={formData.terapeutNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Kliniske notater og observasjoner</label>
                                <textarea
                                    value={formData.terapeutNotater}
                                    onChange={(e) => updateField('terapeutNotater', e.target.value)}
                                    className="input-field !text-sm min-h-[80px] resize-y"
                                    placeholder="Kliniske notater og observasjoner..."
                                />
                            </div>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3D8B6E]" />
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {saving ? 'Lagrer...' : 'Lagre utkast'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                                    {submitting ? 'Lagrer...' : 'Lagre opptreningsplan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
