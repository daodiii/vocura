'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Building2, AlertCircle, Calendar, Info, Plus, Trash2, FileCheck, FileText, Activity, Loader2 } from 'lucide-react';
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

const commonCodes = [
    { code: 'L02', label: 'Ryggsymptomer/plager' },
    { code: 'L03', label: 'Korsryggsymptomer' },
    { code: 'L84', label: 'Ryggsyndrom uten utstråling' },
    { code: 'L86', label: 'Ryggsyndrom med utstråling' },
    { code: 'L92', label: 'Skuldersyndrom' },
    { code: 'L87', label: 'Bursitt/tendinitt/synovitt' },
    { code: 'L91', label: 'Artrose' },
    { code: 'N81', label: 'Skade nervesystem annet' },
];

const fysioTakster = [
    { kode: 'A1a', beskrivelse: 'Unders\u00f8kelse ved fysioterapeut', sats: 352 },
    { kode: 'A2a', beskrivelse: 'Behandling hos fysioterapeut, 20 min', sats: 172 },
    { kode: 'A2b', beskrivelse: 'Behandling hos fysioterapeut, 40 min', sats: 300 },
    { kode: 'A2c', beskrivelse: 'Behandling hos fysioterapeut, 60 min', sats: 428 },
    { kode: 'A8a', beskrivelse: 'Gruppebehandling (per deltaker)', sats: 86 },
    { kode: 'A9a', beskrivelse: 'Tillegg for bruk av utstyr', sats: 43 },
    { kode: 'C34a', beskrivelse: 'Manuellterapi, unders\u00f8kelse', sats: 440 },
    { kode: 'C34b', beskrivelse: 'Manuellterapi, behandling', sats: 220 },
    { kode: 'C35', beskrivelse: 'Tillegg for dry needling', sats: 86 },
    { kode: 'E50a', beskrivelse: 'Tverrfaglig samarbeidsm\u00f8te', sats: 352 },
];

export default function HELFOFysioterapiForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'helfo-fysioterapi' });
    const [formData, setFormData] = useState({
        // Physiotherapist
        fysioterapeutNavn: '',
        fysioterapeutHPR: '9876543',
        driftstilskuddNr: 'DT-12345',
        praksisNavn: 'Vocura Fysioterapi',
        kommune: 'Oslo',
        orgNummer: '987654321',
        // Patient
        patientNavn: '',
        patientFnr: '',
        helfoNummer: '',
        // Treatment period
        behandlingFra: '',
        behandlingTil: '',
        antallBehandlinger: '',
        // Diagnosis
        kodesystem: 'ICPC-2',
        diagnoseKode: '',
        diagnoseBeskrivelse: '',
        // Driftsavtale
        driftsavtaleType: '',
        avtaleNummer: '',
        dekningsDetaljer: '',
        // Documentation
        journalnotat: false,
        henvisning: false,
        epikriser: false,
        funksjonsrapport: false,
        annenDok: false,
        // Declaration
        bekreftelse: false,
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, fysioterapeutNavn: profile.name }));
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

    // Fee table management
    const addTakstRad = () => {
        const newId = (Math.max(...takstRader.map(r => parseInt(r.id)), 0) + 1).toString();
        setTakstRader(prev => [...prev, { id: newId, kode: '', beskrivelse: '', antall: 1, sats: 0 }]);
    };

    const removeTakstRad = (id: string) => {
        if (takstRader.length <= 1) return;
        setTakstRader(prev => prev.filter(r => r.id !== id));
    };

    const updateTakstRad = (id: string, field: keyof TakstRow, value: string | number) => {
        setTakstRader(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const applyTakst = (takst: typeof fysioTakster[0]) => {
        const emptyRow = takstRader.find(r => r.kode === '');
        if (emptyRow) {
            setTakstRader(prev => prev.map(r =>
                r.id === emptyRow.id
                    ? { ...r, kode: takst.kode, beskrivelse: takst.beskrivelse, sats: takst.sats }
                    : r
            ));
        } else {
            const newId = (Math.max(...takstRader.map(r => parseInt(r.id)), 0) + 1).toString();
            setTakstRader(prev => [...prev, { id: newId, kode: takst.kode, beskrivelse: takst.beskrivelse, antall: 1, sats: takst.sats }]);
        }
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
                            className="btn-ghost text-xs flex items-center gap-1.5 !py-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#3D8B6E]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button
                            onClick={() => exportPdf({ ...formData, takstRader } as unknown as Record<string, unknown>, 'HELFO fysioterapirefusjon', formData.fysioterapeutNavn)}
                            className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.bekreftelse || submitting}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5 rounded-lg font-semibold transition-colors",
                                submitted
                                    ? "bg-[#3D8B6E] text-white"
                                    : formData.bekreftelse
                                        ? "bg-[#4F5ABF] text-white hover:bg-[#6D28D9]"
                                        : "bg-[#DDD7CE] text-[#9E958C] cursor-not-allowed"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
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
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                        HELFO fysioterapirefusjon
                    </h1>
                    <p className="text-[#7D7267] mt-1">Refusjonskrav for fysioterapibehandling til HELFO</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Refusjonskrav sendt til HELFO
                        </h2>
                        <p className="text-[#7D7267] mb-6">Kravet er sendt elektronisk og vil bli behandlet innen 5-10 virkedager.</p>
                        <p className="text-sm font-mono text-[#9E958C] mb-8">Referanse: HELFO-FYS-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
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
                        {/* Section 1: Physiotherapist Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Fysioterapeutinformasjon</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om behandlende fysioterapeut</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Fysioterapeutens navn</label>
                                    <input
                                        type="text"
                                        value={formData.fysioterapeutNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.fysioterapeutHPR}
                                        className="input-field !text-sm bg-[#F5F2ED] font-mono"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="form-label">Driftstilskudd-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.driftstilskuddNr}
                                        className="input-field !text-sm bg-[#CCFBF1] border-[#0D9488]/20 font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Praksisnavn</label>
                                    <input
                                        type="text"
                                        value={formData.praksisNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="form-label">Kommune</label>
                                    <input
                                        type="text"
                                        value={formData.kommune}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Organisasjonsnummer</label>
                                    <input
                                        type="text"
                                        value={formData.orgNummer}
                                        className="input-field !text-sm bg-[#F5F2ED] font-mono"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Patient Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om pasienten</p>

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
                                <div>
                                    <label className="form-label form-required">HELFO-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.helfoNummer}
                                        onChange={(e) => updateField('helfoNummer', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="HELFO-12345678"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Treatment Period */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Behandlingsperiode</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Periode for fysioterapibehandlingen</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label form-required">Fra dato</label>
                                    <input
                                        type="date"
                                        value={formData.behandlingFra}
                                        onChange={(e) => updateField('behandlingFra', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Til dato</label>
                                    <input
                                        type="date"
                                        value={formData.behandlingTil}
                                        onChange={(e) => updateField('behandlingTil', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Antall behandlinger</label>
                                    <input
                                        type="number"
                                        value={formData.antallBehandlinger}
                                        onChange={(e) => updateField('antallBehandlinger', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="0"
                                        min={0}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Diagnosis Codes */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Diagnosekoder</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Medisinsk diagnose etter ICPC-2 eller ICD-10</p>

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
                            <div className="p-3 bg-[#FAF5FF] rounded-lg border border-[#EDE9FE]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#4F5ABF]" />
                                    <span className="text-xs font-semibold text-[#4F5ABF]">Vanlige ICPC-2-koder for fysioterapi</span>
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

                        {/* Section 5: Fee Codes and Amounts */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Takstkoder og belop</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Velg takster og angi antall for refusjonskravet</p>

                            {/* Quick-select chips */}
                            <div className="p-3 bg-[#FAF5FF] rounded-lg border border-[#EDE9FE] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#4F5ABF]" />
                                    <span className="text-xs font-semibold text-[#4F5ABF]">Hurtigvalg takster</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {fysioTakster.map((takst) => (
                                        <button
                                            key={takst.kode}
                                            onClick={() => applyTakst(takst)}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all",
                                                takstRader.some(r => r.kode === takst.kode)
                                                    ? "bg-[#4F5ABF] text-white border-[#4F5ABF]"
                                                    : "bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#4F5ABF] hover:text-[#4F5ABF]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{takst.kode}</span> {takst.beskrivelse} ({takst.sats} kr)
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic fee table */}
                            <div className="border border-[#DDD7CE] rounded-lg overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-[100px_1fr_80px_100px_60px] gap-2 px-4 py-2.5 bg-[#F5F2ED] border-b border-[#DDD7CE]">
                                    <span className="text-xs font-semibold text-[#7D7267] uppercase tracking-wider">Kode</span>
                                    <span className="text-xs font-semibold text-[#7D7267] uppercase tracking-wider">Beskrivelse</span>
                                    <span className="text-xs font-semibold text-[#7D7267] uppercase tracking-wider">Antall</span>
                                    <span className="text-xs font-semibold text-[#7D7267] uppercase tracking-wider text-right">Belop</span>
                                    <span></span>
                                </div>

                                {/* Table rows */}
                                {takstRader.map((rad) => (
                                    <div key={rad.id} className="grid grid-cols-[100px_1fr_80px_100px_60px] gap-2 px-4 py-2 border-b border-[#DDD7CE] last:border-b-0 items-center">
                                        <input
                                            type="text"
                                            value={rad.kode}
                                            onChange={(e) => updateTakstRad(rad.id, 'kode', e.target.value)}
                                            className="input-field !text-xs font-mono !py-1.5"
                                            placeholder="A2a"
                                        />
                                        <input
                                            type="text"
                                            value={rad.beskrivelse}
                                            onChange={(e) => updateTakstRad(rad.id, 'beskrivelse', e.target.value)}
                                            className="input-field !text-xs !py-1.5"
                                            placeholder="Beskrivelse"
                                        />
                                        <input
                                            type="number"
                                            value={rad.antall}
                                            onChange={(e) => updateTakstRad(rad.id, 'antall', parseInt(e.target.value) || 0)}
                                            className="input-field !text-xs !py-1.5 text-center"
                                            min={1}
                                        />
                                        <div className="text-sm font-semibold text-[#1E1914] text-right font-mono">
                                            {(rad.antall * rad.sats).toLocaleString('nb-NO')} kr
                                        </div>
                                        <button
                                            onClick={() => removeTakstRad(rad.id)}
                                            disabled={takstRader.length <= 1}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors flex items-center justify-center",
                                                takstRader.length <= 1
                                                    ? "text-[#CBD2D9] cursor-not-allowed"
                                                    : "text-[#9E958C] hover:text-[#C44536] hover:bg-[#FAEAE8]"
                                            )}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add row button */}
                                <div className="px-4 py-2 bg-[#F5F2ED]">
                                    <button
                                        onClick={addTakstRad}
                                        className="text-xs text-[#4F5ABF] hover:text-[#6D28D9] font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Legg til rad
                                    </button>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="mt-4 flex justify-end">
                                <div className="bg-[#FAF5FF] border border-[#EDE9FE] rounded-lg px-6 py-3 flex items-center gap-4">
                                    <span className="text-sm font-medium text-[#7D7267]">Totalt belop:</span>
                                    <span className="text-xl font-bold text-[#4F5ABF] font-mono">
                                        {totalBeloep.toLocaleString('nb-NO')} kr
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Municipal Operating Agreement */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Kommunal driftsavtale</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om driftsavtale med kommunen</p>

                            <div className="mb-4">
                                <label className="form-label form-required">Type driftsavtale</label>
                                <select
                                    value={formData.driftsavtaleType}
                                    onChange={(e) => updateField('driftsavtaleType', e.target.value)}
                                    className="input-field !text-sm"
                                >
                                    <option value="">Velg...</option>
                                    <option value="fastlonnet">Fastlonnet</option>
                                    <option value="driftstilskudd">Driftstilskudd</option>
                                    <option value="uten">Uten driftsavtale</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Avtalenummer</label>
                                    <input
                                        type="text"
                                        value={formData.avtaleNummer}
                                        onChange={(e) => updateField('avtaleNummer', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="AVT-12345"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Dekningsdetaljer</label>
                                    <input
                                        type="text"
                                        value={formData.dekningsDetaljer}
                                        onChange={(e) => updateField('dekningsDetaljer', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Spesifiser dekning"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-[#FAF5FF] rounded-lg border border-[#EDE9FE]">
                                <div className="flex items-start gap-2">
                                    <Info className="w-3.5 h-3.5 text-[#4F5ABF] mt-0.5 shrink-0" />
                                    <p className="text-xs text-[#7D7267]">
                                        Fysioterapeuter med kommunal driftsavtale har rett til direkte oppgjor med HELFO for sine pasienter.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 7: Documentation and Declaration */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Dokumentasjon og erklaering</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Vedlagt dokumentasjon og bekreftelse</p>

                            {/* Checkboxes */}
                            <div className="space-y-3 mb-6">
                                <p className="text-sm font-medium text-[#3E4C59]">Vedlagt dokumentasjon:</p>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.journalnotat}
                                        onChange={(e) => updateField('journalnotat', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#CBD2D9] text-[#4F5ABF] focus:ring-[#4F5ABF]"
                                    />
                                    <span className="text-sm text-[#3E4C59] group-hover:text-[#1E1914]">Journalnotat</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.henvisning}
                                        onChange={(e) => updateField('henvisning', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#CBD2D9] text-[#4F5ABF] focus:ring-[#4F5ABF]"
                                    />
                                    <span className="text-sm text-[#3E4C59] group-hover:text-[#1E1914]">Henvisning fra lege</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.epikriser}
                                        onChange={(e) => updateField('epikriser', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#CBD2D9] text-[#4F5ABF] focus:ring-[#4F5ABF]"
                                    />
                                    <span className="text-sm text-[#3E4C59] group-hover:text-[#1E1914]">Epikriser</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.funksjonsrapport}
                                        onChange={(e) => updateField('funksjonsrapport', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#CBD2D9] text-[#4F5ABF] focus:ring-[#4F5ABF]"
                                    />
                                    <span className="text-sm text-[#3E4C59] group-hover:text-[#1E1914]">Funksjonsrapport</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.annenDok}
                                        onChange={(e) => updateField('annenDok', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#CBD2D9] text-[#4F5ABF] focus:ring-[#4F5ABF]"
                                    />
                                    <span className="text-sm text-[#3E4C59] group-hover:text-[#1E1914]">Annen dokumentasjon</span>
                                </label>
                            </div>

                            {/* Declaration */}
                            <div className="p-4 bg-[#FAF5FF] rounded-lg border border-[#EDE9FE]">
                                <p className="text-sm text-[#3E4C59] mb-4">
                                    Jeg bekrefter at opplysningene i dette refusjonskravet er korrekte og i samsvar med gjeldende
                                    regelverk for fysioterapirefusjon fra HELFO. Behandlingene er utfort som angitt, og dokumentasjonen
                                    er tilgjengelig for eventuell kontroll.
                                </p>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.bekreftelse}
                                        onChange={(e) => updateField('bekreftelse', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#CBD2D9] text-[#4F5ABF] focus:ring-[#4F5ABF]"
                                    />
                                    <span className="text-sm font-medium text-[#1E1914] group-hover:text-[#4F5ABF]">
                                        Jeg bekrefter at opplysningene er korrekte
                                    </span>
                                </label>
                            </div>

                            {/* Read-only: physio name + date */}
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Fysioterapeut</label>
                                    <input
                                        type="text"
                                        value={formData.fysioterapeutNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Dato</label>
                                    <input
                                        type="text"
                                        value={new Date().toLocaleDateString('nb-NO')}
                                        className="input-field !text-sm bg-[#F5F2ED]"
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
                                <button onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.bekreftelse || submitting}
                                    className={cn(
                                        "!py-2.5 !px-6 text-sm flex items-center gap-2 rounded-lg font-semibold transition-colors",
                                        formData.bekreftelse
                                            ? "bg-[#4F5ABF] text-white hover:bg-[#6D28D9]"
                                            : "bg-[#DDD7CE] text-[#9E958C] cursor-not-allowed"
                                    )}
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
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
