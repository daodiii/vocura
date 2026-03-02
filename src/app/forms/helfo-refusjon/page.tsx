'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Building2, AlertCircle, Calendar, Info, Plus, Trash2, FileCheck, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface TakstRow {
    id: string;
    kode: string;
    beskrivelse: string;
    antall: number;
    sats: number;
}

export default function HelfoRefusjonForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'helfo-refusjon' });
    const [formData, setFormData] = useState({
        // Practitioner
        behandlerNavn: '',
        behandlerHPR: '9876543',
        praksisNavn: 'Vocura Legesenter',
        orgNummer: '987654321',
        praksisAdresse: 'Storgata 1, 0182 Oslo',
        // Patient
        patientNavn: '',
        patientFnr: '',
        helfoNummer: '',
        // Treatment dates
        behandlingFra: '',
        behandlingTil: '',
        konsultasjonstype: '',
        // Diagnosis
        kodesystem: 'ICPC-2',
        diagnoseKode: '',
        diagnoseBeskrivelse: '',
        // Documentation
        journalnotat: false,
        henvisningsbrev: false,
        labResultater: false,
        bildediagnostikk: false,
        annenDok: false,
        annenDokBeskrivelse: '',
        // Declaration
        bekreftelse: false,
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, behandlerNavn: profile.name }));
        }
    }, [profile]);

    const [takstRader, setTakstRader] = useState<TakstRow[]>([
        { id: '1', kode: '', beskrivelse: '', antall: 1, sats: 0 },
    ]);

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        saveAsDraft({ ...formData, takstRader } as unknown as Record<string, unknown>);
    };

    const handleSubmit = () => {
        submitForm({ ...formData, takstRader } as unknown as Record<string, unknown>);
    };

    // Common ICPC-2 codes
    const commonCodes = [
        { code: 'R74', label: 'Øvre luftveisinfeksjon' },
        { code: 'L03', label: 'Korsryggsymptomer' },
        { code: 'K86', label: 'Hypertensjon' },
        { code: 'T90', label: 'Diabetes type 2' },
        { code: 'D73', label: 'Gastroenteritt' },
        { code: 'P76', label: 'Depressiv lidelse' },
        { code: 'R78', label: 'Akutt bronkitt' },
        { code: 'L84', label: 'Ryggsyndrom' },
    ];

    // Common fee codes
    const vanligeTakster = [
        { kode: '2ad', beskrivelse: 'Konsultasjon hos allmennlege, dag', sats: 155 },
        { kode: '2ak', beskrivelse: 'Konsultasjon hos allmennlege, kveld', sats: 235 },
        { kode: '2cd', beskrivelse: 'Enkel pasientkontakt, dag', sats: 65 },
        { kode: '2dd', beskrivelse: 'Telefonkonsultasjon', sats: 100 },
        { kode: '2ed', beskrivelse: 'Videokonsultasjon', sats: 155 },
        { kode: '1ad', beskrivelse: 'Tillegg for tidsbruk, dag (per 15 min)', sats: 120 },
        { kode: '1ak', beskrivelse: 'Tillegg for tidsbruk, kveld', sats: 180 },
        { kode: '615', beskrivelse: 'Prøvetaking, blodprøve', sats: 55 },
    ];

    // Takst row management
    const addTakstRow = () => {
        setTakstRader(prev => [...prev, { id: Date.now().toString(), kode: '', beskrivelse: '', antall: 1, sats: 0 }]);
    };

    const removeTakstRow = (id: string) => {
        setTakstRader(prev => prev.filter(r => r.id !== id));
    };

    const updateTakstRow = (id: string, field: keyof TakstRow, value: string | number) => {
        setTakstRader(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const applyTakst = (id: string, takst: typeof vanligeTakster[0]) => {
        setTakstRader(prev => prev.map(r => r.id === id ? { ...r, kode: takst.kode, beskrivelse: takst.beskrivelse, sats: takst.sats } : r));
    };

    const totalBeloep = takstRader.reduce((sum, r) => sum + (r.antall * r.sats), 0);

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
                            className="text-[#5E5549] hover:text-[#1E1914] hover:bg-[rgba(0,0,0,0.04)] rounded-lg px-3 py-1.5 transition-colors duration-150 text-xs flex items-center gap-1.5 !py-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#3D8B6E]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button
                            onClick={() => exportPdf({ ...formData, takstRader } as unknown as Record<string, unknown>, 'HELFO Refusjonskrav', formData.behandlerNavn)}
                            className="border border-[#DDD7CE] text-[#5E5549] hover:bg-[rgba(0,0,0,0.04)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs !py-2 !px-4 flex items-center gap-1.5"
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
                                    : !formData.bekreftelse
                                        ? "bg-[#4F5ABF] hover:bg-[#6D28D9] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 opacity-50 cursor-not-allowed"
                                        : "bg-[#4F5ABF] hover:bg-[#6D28D9] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
                            {submitted ? 'Sendt til HELFO' : submitting ? 'Sender...' : 'Send til HELFO'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-[#4F5ABF]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDE9FE] text-[#4F5ABF] uppercase tracking-wider">HELFO</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                        HELFO Refusjonskrav
                    </h1>
                    <p className="text-[#7D7267] mt-1">Skjema for refusjonskrav fra HELFO for utført behandling</p>
                </div>

                {submitted ? (
                    <div className="bg-white border border-[#DDD7CE] rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "'Lora', 'Georgia', serif" }}>
                            Refusjonskrav sendt til HELFO
                        </h2>
                        <p className="text-[#7D7267] mb-6">Kravet er sendt elektronisk og vil bli behandlet innen 5-10 virkedager.</p>
                        <p className="text-sm font-mono text-[#7D7267] mb-8">Referanse: HELFO-REF-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="border border-[#DDD7CE] text-[#5E5549] hover:bg-[rgba(0,0,0,0.04)] rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="bg-[#4F5ABF] hover:bg-[#6D28D9] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section 1: Behandlerinformasjon */}
                        <div className="bg-white border border-[#DDD7CE] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="text-sm font-semibold text-[#1E1914]">1. Behandlerinformasjon</h2>
                            </div>
                            <p className="text-xs text-[#7D7267] mb-4 ml-6">Informasjon om behandlende lege og praksis</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Behandlers navn</label>
                                    <input
                                        type="text"
                                        value={formData.behandlerNavn}
                                        className="bg-[#F5F2ED] border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.behandlerHPR}
                                        className="bg-[#F5F2ED] border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] font-mono"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Praksisnavn</label>
                                    <input
                                        type="text"
                                        value={formData.praksisNavn}
                                        className="bg-[#F5F2ED] border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Organisasjonsnummer</label>
                                    <input
                                        type="text"
                                        value={formData.orgNummer}
                                        className="bg-[#F5F2ED] border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Praksisadresse</label>
                                    <input
                                        type="text"
                                        value={formData.praksisAdresse}
                                        className="bg-[#F5F2ED] border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pasientopplysninger */}
                        <div className="bg-white border border-[#DDD7CE] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="text-sm font-semibold text-[#1E1914]">2. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[#7D7267] mb-4 ml-6">Informasjon om pasienten</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Fullt navn <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                        placeholder="Ola Nordmann"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Fødselsnummer (11 siffer) <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">HELFO-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.helfoNummer}
                                        onChange={(e) => updateField('helfoNummer', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] font-mono"
                                        placeholder="Valgfritt"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Behandlingsinformasjon */}
                        <div className="bg-white border border-[#DDD7CE] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="text-sm font-semibold text-[#1E1914]">3. Behandlingsinformasjon</h2>
                            </div>
                            <p className="text-xs text-[#7D7267] mb-4 ml-6">Dato og type behandling</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Fra dato <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.behandlingFra}
                                        onChange={(e) => updateField('behandlingFra', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Til dato <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.behandlingTil}
                                        onChange={(e) => updateField('behandlingTil', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Konsultasjonstype <span className="text-[#EF4444]">*</span></label>
                                    <select
                                        value={formData.konsultasjonstype}
                                        onChange={(e) => updateField('konsultasjonstype', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="ordinaer">Ordinær konsultasjon</option>
                                        <option value="akutt">Akutt-time</option>
                                        <option value="telefon">Telefonkonsultasjon</option>
                                        <option value="video">Videokonsultasjon</option>
                                        <option value="sykebesoek">Sykebesøk</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Diagnosekoder */}
                        <div className="bg-white border border-[#DDD7CE] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="text-sm font-semibold text-[#1E1914]">4. Diagnosekoder</h2>
                            </div>
                            <p className="text-xs text-[#7D7267] mb-4 ml-6">Medisinsk diagnose etter ICPC-2 eller ICD-10</p>

                            <div className="mb-4">
                                <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Kodesystem</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="kodesystem"
                                            value="ICPC-2"
                                            checked={formData.kodesystem === 'ICPC-2'}
                                            onChange={() => updateField('kodesystem', 'ICPC-2')}
                                            className="text-[#4F5ABF]"
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
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59] font-medium">ICD-10 (Spesialist)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Diagnosekode <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] font-mono"
                                        placeholder="L03"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Diagnosebeskrivelse <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseBeskrivelse}
                                        onChange={(e) => updateField('diagnoseBeskrivelse', e.target.value)}
                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                        placeholder="Korsryggsymptomer"
                                    />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="p-3 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#4F5ABF]" />
                                    <span className="text-xs font-semibold text-[#4F5ABF]">Vanlige ICPC-2-koder</span>
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
                                                    ? "bg-[#4F5ABF] text-white border-[#4F5ABF]"
                                                    : "bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#4F5ABF] hover:text-[#4F5ABF]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Takstkoder og beløp */}
                        <div className="bg-white border border-[#DDD7CE] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="text-sm font-semibold text-[#1E1914]">5. Takstkoder og beløp</h2>
                            </div>
                            <p className="text-xs text-[#7D7267] mb-4 ml-6">Registrer takster for utført behandling</p>

                            {/* Quick-select chips for common takster */}
                            <div className="p-3 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#4F5ABF]" />
                                    <span className="text-xs font-semibold text-[#4F5ABF]">Vanlige takster</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {vanligeTakster.map(t => (
                                        <button
                                            key={t.kode}
                                            onClick={() => {
                                                setTakstRader(prev => [...prev, { id: Date.now().toString(), kode: t.kode, beskrivelse: t.beskrivelse, antall: 1, sats: t.sats }]);
                                            }}
                                            className="text-xs px-2.5 py-1 rounded-full border bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#4F5ABF] hover:text-[#4F5ABF] transition-all"
                                        >
                                            <span className="font-mono font-semibold">{t.kode}</span> {t.beskrivelse} ({t.sats} kr)
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#DDD7CE]">
                                            <th className="text-left py-2 px-2 text-xs font-semibold text-[#7D7267]">Takst</th>
                                            <th className="text-left py-2 px-2 text-xs font-semibold text-[#7D7267]">Beskrivelse</th>
                                            <th className="text-center py-2 px-2 text-xs font-semibold text-[#7D7267] w-20">Antall</th>
                                            <th className="text-right py-2 px-2 text-xs font-semibold text-[#7D7267] w-28">Sats (kr)</th>
                                            <th className="text-right py-2 px-2 text-xs font-semibold text-[#7D7267] w-28">Sum (kr)</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {takstRader.map(row => (
                                            <tr key={row.id} className="border-b border-[#F5F2ED]">
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        value={row.kode}
                                                        onChange={e => updateTakstRow(row.id, 'kode', e.target.value)}
                                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-1.5 text-sm w-20 focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] font-mono"
                                                        placeholder="2ad"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        value={row.beskrivelse}
                                                        onChange={e => updateTakstRow(row.id, 'beskrivelse', e.target.value)}
                                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-1.5 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                                        placeholder="Beskrivelse"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.antall}
                                                        onChange={e => updateTakstRow(row.id, 'antall', parseInt(e.target.value) || 0)}
                                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-1.5 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] text-center"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.sats}
                                                        onChange={e => updateTakstRow(row.id, 'sats', parseFloat(e.target.value) || 0)}
                                                        className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-1.5 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B] text-right font-mono"
                                                    />
                                                </td>
                                                <td className="py-2 px-2 text-right font-mono font-semibold text-[#1E1914]">
                                                    {(row.antall * row.sats).toLocaleString('nb-NO')}
                                                </td>
                                                <td className="py-2 px-2">
                                                    {takstRader.length > 1 && (
                                                        <button onClick={() => removeTakstRow(row.id)} className="text-[#7D7267] hover:text-[#C44536] transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add row button */}
                            <button onClick={addTakstRow} className="text-[#5E5549] hover:text-[#1E1914] hover:bg-[rgba(0,0,0,0.04)] rounded-lg px-3 py-1.5 transition-colors duration-150 text-xs flex items-center gap-1.5 mt-2">
                                <Plus className="w-3.5 h-3.5" /> Legg til rad
                            </button>

                            {/* Total */}
                            <div className="flex justify-end mt-4 pt-4 border-t border-[#DDD7CE]">
                                <div className="text-right">
                                    <span className="text-sm text-[#7D7267]">Totalt beløp</span>
                                    <p className="text-2xl font-bold text-[#4F5ABF] font-mono">{totalBeloep.toLocaleString('nb-NO')} kr</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Dokumentasjon */}
                        <div className="bg-white border border-[#DDD7CE] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="text-sm font-semibold text-[#1E1914]">6. Dokumentasjon</h2>
                            </div>
                            <p className="text-xs text-[#7D7267] mb-4 ml-6">Vedlagt dokumentasjon til kravet</p>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[#F5F3FF] transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.journalnotat}
                                        onChange={(e) => updateField('journalnotat', e.target.checked)}
                                        className="w-4 h-4 text-[#4F5ABF] rounded border-[#CBD2D9]"
                                    />
                                    <span className="text-sm text-[#3E4C59]">Journalnotat vedlagt</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[#F5F3FF] transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.henvisningsbrev}
                                        onChange={(e) => updateField('henvisningsbrev', e.target.checked)}
                                        className="w-4 h-4 text-[#4F5ABF] rounded border-[#CBD2D9]"
                                    />
                                    <span className="text-sm text-[#3E4C59]">Henvisningsbrev vedlagt</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[#F5F3FF] transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.labResultater}
                                        onChange={(e) => updateField('labResultater', e.target.checked)}
                                        className="w-4 h-4 text-[#4F5ABF] rounded border-[#CBD2D9]"
                                    />
                                    <span className="text-sm text-[#3E4C59]">Laboratorieresultater vedlagt</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[#F5F3FF] transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.bildediagnostikk}
                                        onChange={(e) => updateField('bildediagnostikk', e.target.checked)}
                                        className="w-4 h-4 text-[#4F5ABF] rounded border-[#CBD2D9]"
                                    />
                                    <span className="text-sm text-[#3E4C59]">Bildediagnostikk vedlagt</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[#F5F3FF] transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.annenDok}
                                        onChange={(e) => updateField('annenDok', e.target.checked)}
                                        className="w-4 h-4 text-[#4F5ABF] rounded border-[#CBD2D9]"
                                    />
                                    <span className="text-sm text-[#3E4C59]">Annen dokumentasjon</span>
                                </label>
                                {formData.annenDok && (
                                    <div className="ml-10">
                                        <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Beskriv dokumentasjon</label>
                                        <input
                                            type="text"
                                            value={formData.annenDokBeskrivelse}
                                            onChange={(e) => updateField('annenDokBeskrivelse', e.target.value)}
                                            className="bg-white border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                            placeholder="Beskriv vedlagt dokumentasjon..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 7: Erklæring og signatur */}
                        <div className="bg-white border border-[#DDD7CE] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="text-sm font-semibold text-[#1E1914]">7. Erklæring og signatur</h2>
                            </div>
                            <p className="text-xs text-[#7D7267] mb-4 ml-6">Bekreftelse og signering av kravet</p>

                            {/* Declaration text */}
                            <div className="p-4 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE] mb-4">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-[#4F5ABF] flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#3E4C59] leading-relaxed">
                                        Undertegnede erklærer at de oppgitte opplysningene er korrekte og at behandlingen er utført i samsvar med gjeldende regelverk.
                                    </p>
                                </div>
                            </div>

                            {/* Confirmation checkbox */}
                            <label className={cn(
                                "flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all",
                                formData.bekreftelse
                                    ? "border-[#4F5ABF] bg-[#F5F3FF]"
                                    : "border-[#DDD7CE] hover:border-[#CBD2D9]"
                            )}>
                                <input
                                    type="checkbox"
                                    checked={formData.bekreftelse}
                                    onChange={(e) => updateField('bekreftelse', e.target.checked)}
                                    className="w-4 h-4 text-[#4F5ABF] rounded border-[#CBD2D9]"
                                />
                                <span className="text-sm font-medium text-[#3E4C59]">Jeg bekrefter at opplysningene er korrekte</span>
                            </label>

                            {/* Read-only doctor name + date */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Behandlers navn</label>
                                    <input
                                        type="text"
                                        value={formData.behandlerNavn}
                                        className="bg-[#F5F2ED] border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="text-[#5E5549] text-sm font-medium block mb-1.5">Dato</label>
                                    <input
                                        type="text"
                                        value={new Date().toLocaleDateString('nb-NO')}
                                        className="bg-[#F5F2ED] border border-[#DDD7CE] rounded-lg text-[#1E1914] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#4F5ABF] placeholder:text-[#8B8B8B]"
                                        readOnly
                                    />
                                </div>
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
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel innsending til HELFO</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="border border-[#DDD7CE] text-[#5E5549] hover:bg-[rgba(0,0,0,0.04)] rounded-lg px-4 py-2 transition-colors duration-150 !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.bekreftelse || submitting}
                                    className={cn(
                                        "!py-2.5 !px-6 text-sm flex items-center gap-2",
                                        !formData.bekreftelse
                                            ? "bg-[#4F5ABF] hover:bg-[#6D28D9] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 opacity-50 cursor-not-allowed"
                                            : "bg-[#4F5ABF] hover:bg-[#6D28D9] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150"
                                    )}
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                                    {submitting ? 'Sender...' : 'Send til HELFO'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
