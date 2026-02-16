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
    Building2,
    AlertCircle,
    Calendar,
    Info,
    Plus,
    Trash2,
    FileCheck,
    FileText,
    ChevronDown,
    Loader2,
} from 'lucide-react';
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

const tannDiagnoser = [
    { code: 'K02.1', label: 'Karies i dentin' },
    { code: 'K04.0', label: 'Pulpitt' },
    { code: 'K05.1', label: 'Kronisk gingivitt' },
    { code: 'K05.3', label: 'Kronisk periodontitt' },
    { code: 'K08.1', label: 'Tanntap pga ulykke/ekstraksjon' },
    { code: 'K03.0', label: 'Tannslitasje' },
    { code: 'K07.3', label: 'Bittavvik' },
    { code: 'K12.0', label: 'Residiverende orale aft\u00f8se s\u00e5r' },
];

const vanligeTannTakster = [
    { kode: '1', beskrivelse: 'Unders\u00f8kelse hos tannlege', sats: 585 },
    { kode: '2', beskrivelse: 'Unders\u00f8kelse hos tannpleier', sats: 385 },
    { kode: '101', beskrivelse: 'Enflatesfylling, kompositt', sats: 495 },
    { kode: '102', beskrivelse: 'Toflatesfylling, kompositt', sats: 705 },
    { kode: '103', beskrivelse: 'Treflatesfylling, kompositt', sats: 890 },
    { kode: '201', beskrivelse: 'Rotfylling, 1-kanals', sats: 2150 },
    { kode: '304', beskrivelse: 'Helkrone, porselen', sats: 4800 },
    { kode: '401', beskrivelse: 'Ekstraksjon, enkel', sats: 750 },
    { kode: '501', beskrivelse: 'Tannrens/depurasjon', sats: 425 },
    { kode: '701', beskrivelse: 'R\u00f8ntgen, enkeltbilde', sats: 115 },
];

const stonadspunkter = [
    { value: '1', label: 'Punkt 1: Sjelden medisinsk tilstand' },
    { value: '2', label: 'Punkt 2: Leppe-/kjeve-/ganespalte' },
    { value: '3', label: 'Punkt 3: Svulster i munnhulen' },
    { value: '4', label: 'Punkt 4: Infeksjonssykdommer' },
    { value: '5', label: 'Punkt 5: Sykdommer/skader i kjeveledd' },
    { value: '6', label: 'Punkt 6: Periodontitt' },
    { value: '7', label: 'Punkt 7: Tannutviklingsforstyrrelser' },
    { value: '8', label: 'Punkt 8: Bittanomalier' },
    { value: '9', label: 'Punkt 9: Patologisk tannslitasje' },
    { value: '10', label: 'Punkt 10: Hyposalivasjon' },
    { value: '11', label: 'Punkt 11: Allergiske reaksjoner' },
    { value: '12', label: 'Punkt 12: Tannskade ved ulykke' },
    { value: '13', label: 'Punkt 13: Sterkt nedsatt evne til egenomsorg' },
    { value: '14', label: 'Punkt 14: Helt eller delvis tannl\u00f8s' },
    { value: '15', label: 'Punkt 15: Forberedende behandling' },
];

export default function HelfoTannlegeForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'helfo-tannlege' });
    const [formData, setFormData] = useState({
        // Dentist
        tannlegeNavn: '',
        tannlegeHPR: '9876543',
        praksisNavn: 'MediScribe Tannklinikk',
        orgNummer: '987654321',
        praksisAdresse: 'Storgata 1, 0182 Oslo',
        // Patient
        patientNavn: '',
        patientFnr: '',
        helfoNummer: '',
        // Treatment dates
        behandlingFra: '',
        behandlingTil: '',
        // Diagnosis
        diagnoseKode: '',
        diagnoseBeskrivelse: '',
        // St\u00f8nadsordning
        stonadspunkt: '',
        tilleggsDokumentasjon: '',
        // Documentation
        journalnotat: false,
        rontgenbilder: false,
        behandlingsplan: false,
        kostnadsoverslag: false,
        annenDok: false,
        // Declaration
        bekreftelse: false,
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, tannlegeNavn: profile.name }));
        }
    }, [profile]);

    const [takstRader, setTakstRader] = useState<TakstRow[]>([
        { id: '1', kode: '', beskrivelse: '', antall: 1, sats: 0 },
    ]);

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTakstRow = () => {
        setTakstRader(prev => [
            ...prev,
            { id: Date.now().toString(), kode: '', beskrivelse: '', antall: 1, sats: 0 },
        ]);
    };

    const removeTakstRow = (id: string) => {
        setTakstRader(prev => prev.filter(r => r.id !== id));
    };

    const updateTakstRow = (id: string, field: keyof TakstRow, value: string | number) => {
        setTakstRader(prev =>
            prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
        );
    };

    const totalBeloep = takstRader.reduce((sum, r) => sum + r.antall * r.sats, 0);

    const handleSave = () => {
        saveAsDraft({ ...formData, takstRader } as unknown as Record<string, unknown>);
    };

    const handleSubmit = () => {
        submitForm({ ...formData, takstRader } as unknown as Record<string, unknown>);
    };

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
                            onClick={() => exportPdf({ ...formData, takstRader } as unknown as Record<string, unknown>, 'HELFO tannlegerefusjon', formData.tannlegeNavn)}
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
                            <Building2 className="w-5 h-5 text-[#7C3AED]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDE9FE] text-[#7C3AED] uppercase tracking-wider">HELFO</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                        HELFO tannlegerefusjon
                    </h1>
                    <p className="text-[#7D7267] mt-1">Refusjonskrav for tannbehandling gjennom HELFO-ordningen</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                            Refusjonskrav sendt til HELFO
                        </h2>
                        <p className="text-[#7D7267] mb-6">Kravet er sendt elektronisk og vil bli behandlet innen 5-10 virkedager.</p>
                        <p className="text-sm font-mono text-[var(--medical-gray-400)] mb-8">Referanse: HELFO-TANN-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
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
                        {/* Section 1: Tannlegeinformasjon */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#7C3AED]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Tannlegeinformasjon</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Opplysninger om behandlende tannlege</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="form-label">Tannlegens navn</label>
                                    <input
                                        type="text"
                                        value={formData.tannlegeNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.tannlegeHPR}
                                        className="input-field !text-sm bg-[#F5F2ED] font-mono"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">Praksis</label>
                                    <input
                                        type="text"
                                        value={formData.praksisNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Org.nummer</label>
                                    <input
                                        type="text"
                                        value={formData.orgNummer}
                                        className="input-field !text-sm bg-[#F5F2ED] font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.praksisAdresse}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pasientopplysninger */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#7C3AED]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Pasientopplysninger</h2>
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
                                    <label className="form-label form-required">F&oslash;dselsnummer (11 siffer)</label>
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
                                    <label className="form-label">HELFO-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.helfoNummer}
                                        onChange={(e) => updateField('helfoNummer', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="Valgfritt"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Behandlingsdatoer */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#7C3AED]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Behandlingsdatoer</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Periode for behandling</p>

                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                        </div>

                        {/* Section 4: Diagnosekoder */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#7C3AED]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Diagnosekoder</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Tannmedisinske diagnosekoder</p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Diagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="K02.1"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label form-required">Diagnosebeskrivelse</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseBeskrivelse}
                                        onChange={(e) => updateField('diagnoseBeskrivelse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Karies i dentin"
                                    />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="p-3 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#7C3AED]" />
                                    <span className="text-xs font-semibold text-[#7C3AED]">Vanlige tannmedisinske diagnosekoder</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {tannDiagnoser.map((item) => (
                                        <button
                                            key={item.code}
                                            onClick={() => {
                                                updateField('diagnoseKode', item.code);
                                                updateField('diagnoseBeskrivelse', item.label);
                                            }}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all",
                                                formData.diagnoseKode === item.code
                                                    ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                                                    : "bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#7C3AED] hover:text-[#7C3AED]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Takstkoder og bel\u00f8p */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-[#7C3AED]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Takstkoder og bel&oslash;p</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Takster for utf&oslash;rt behandling</p>

                            {/* Quick-select chips */}
                            <div className="p-3 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#7C3AED]" />
                                    <span className="text-xs font-semibold text-[#7C3AED]">Hurtigvalg - vanlige takster</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {vanligeTannTakster.map((takst) => (
                                        <button
                                            key={takst.kode}
                                            onClick={() => {
                                                // Find first empty row, or add a new one
                                                const emptyRow = takstRader.find(r => r.kode === '');
                                                if (emptyRow) {
                                                    updateTakstRow(emptyRow.id, 'kode', takst.kode);
                                                    updateTakstRow(emptyRow.id, 'beskrivelse', takst.beskrivelse);
                                                    updateTakstRow(emptyRow.id, 'sats', takst.sats);
                                                } else {
                                                    setTakstRader(prev => [
                                                        ...prev,
                                                        {
                                                            id: Date.now().toString(),
                                                            kode: takst.kode,
                                                            beskrivelse: takst.beskrivelse,
                                                            antall: 1,
                                                            sats: takst.sats,
                                                        },
                                                    ]);
                                                }
                                            }}
                                            className="text-xs px-2.5 py-1 rounded-full border transition-all bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#7C3AED] hover:text-[#7C3AED]"
                                        >
                                            <span className="font-mono font-semibold">{takst.kode}</span> {takst.beskrivelse} ({takst.sats} kr)
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fee table */}
                            <div className="border border-[#DDD7CE] rounded-lg overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-[100px_1fr_80px_100px_48px] gap-2 px-4 py-2.5 bg-[#F5F3FF] border-b border-[#EDE9FE]">
                                    <span className="text-xs font-semibold text-[#7C3AED]">Takst</span>
                                    <span className="text-xs font-semibold text-[#7C3AED]">Beskrivelse</span>
                                    <span className="text-xs font-semibold text-[#7C3AED] text-center">Antall</span>
                                    <span className="text-xs font-semibold text-[#7C3AED] text-right">Sats (kr)</span>
                                    <span></span>
                                </div>

                                {/* Table rows */}
                                {takstRader.map((rad, index) => (
                                    <div
                                        key={rad.id}
                                        className={cn(
                                            "grid grid-cols-[100px_1fr_80px_100px_48px] gap-2 px-4 py-2 items-center",
                                            index < takstRader.length - 1 && "border-b border-[#DDD7CE]"
                                        )}
                                    >
                                        <input
                                            type="text"
                                            value={rad.kode}
                                            onChange={(e) => updateTakstRow(rad.id, 'kode', e.target.value)}
                                            className="input-field !text-sm font-mono !py-1.5"
                                            placeholder="Kode"
                                        />
                                        <input
                                            type="text"
                                            value={rad.beskrivelse}
                                            onChange={(e) => updateTakstRow(rad.id, 'beskrivelse', e.target.value)}
                                            className="input-field !text-sm !py-1.5"
                                            placeholder="Beskrivelse av behandling"
                                        />
                                        <input
                                            type="number"
                                            value={rad.antall}
                                            onChange={(e) => updateTakstRow(rad.id, 'antall', parseInt(e.target.value) || 0)}
                                            className="input-field !text-sm !py-1.5 text-center"
                                            min={1}
                                        />
                                        <input
                                            type="number"
                                            value={rad.sats || ''}
                                            onChange={(e) => updateTakstRow(rad.id, 'sats', parseFloat(e.target.value) || 0)}
                                            className="input-field !text-sm !py-1.5 text-right font-mono"
                                            placeholder="0"
                                        />
                                        <button
                                            onClick={() => removeTakstRow(rad.id)}
                                            disabled={takstRader.length === 1}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors flex items-center justify-center",
                                                takstRader.length === 1
                                                    ? "text-[#CBD2D9] cursor-not-allowed"
                                                    : "text-[var(--medical-gray-400)] hover:text-[#C44536] hover:bg-[#FEF2F2]"
                                            )}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add row button */}
                            <button
                                onClick={addTakstRow}
                                className="mt-3 text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1.5 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Legg til rad
                            </button>

                            {/* Total */}
                            <div className="mt-4 p-4 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE] flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#1E1914]">Totalt bel&oslash;p</span>
                                <span className="text-xl font-bold text-[#7C3AED] font-mono">
                                    {totalBeloep.toLocaleString('nb-NO')} kr
                                </span>
                            </div>
                        </div>

                        {/* Section 6: St\u00f8nadsordning */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-[#7C3AED]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. St&oslash;nadsordning</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Velg relevant st&oslash;nadspunkt for refusjonskravet</p>

                            <div className="mb-4">
                                <label className="form-label form-required">St&oslash;nadspunkt</label>
                                <div className="relative">
                                    <select
                                        value={formData.stonadspunkt}
                                        onChange={(e) => updateField('stonadspunkt', e.target.value)}
                                        className="input-field !text-sm appearance-none pr-10"
                                    >
                                        <option value="">Velg st&oslash;nadspunkt...</option>
                                        {stonadspunkter.map((sp) => (
                                            <option key={sp.value} value={sp.value}>
                                                {sp.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-[var(--medical-gray-400)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {formData.stonadspunkt && (
                                <div className="p-4 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE] mt-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-[#1E1914] mb-1">Dokumentasjonskrav</p>
                                            <p className="text-xs text-[#5E5549]">For valgt st&oslash;nadsordning kreves relevant dokumentasjon som bekrefter at vilk&aring;rene er oppfylt.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="form-label">Tilleggsdokumentasjon</label>
                                <textarea
                                    value={formData.tilleggsDokumentasjon}
                                    onChange={(e) => updateField('tilleggsDokumentasjon', e.target.value)}
                                    className="input-field !text-sm min-h-[60px] resize-y"
                                    placeholder="Tilleggsdokumentasjon eller kommentarer..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Dokumentasjon og erkl\u00e6ring */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#7C3AED]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Dokumentasjon og erkl&aelig;ring</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Vedlagt dokumentasjon og bekreftelse</p>

                            {/* Documentation checkboxes */}
                            <div className="space-y-3 mb-6">
                                <p className="text-sm font-semibold text-[#1E1914]">Vedlagt dokumentasjon</p>
                                {[
                                    { field: 'journalnotat', label: 'Journalnotat' },
                                    { field: 'rontgenbilder', label: 'R\u00f8ntgenbilder' },
                                    { field: 'behandlingsplan', label: 'Behandlingsplan' },
                                    { field: 'kostnadsoverslag', label: 'Kostnadsoverslag' },
                                    { field: 'annenDok', label: 'Annen dokumentasjon' },
                                ].map((dok) => (
                                    <label key={dok.field} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData[dok.field as keyof typeof formData] as boolean}
                                            onChange={(e) => updateField(dok.field, e.target.checked)}
                                            className="w-4 h-4 rounded border-[#CBD2D9] text-[#7C3AED] focus:ring-[#7C3AED]"
                                        />
                                        <span className="text-sm text-[#3E4C59] group-hover:text-[#1E1914] transition-colors">{dok.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Declaration */}
                            <div className="p-4 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE] mb-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
                                    <p className="text-sm text-[#3E4C59]">
                                        Undertegnede erkl&aelig;rer at opplysningene i dette refusjonskravet er korrekte og at behandlingen er utf&oslash;rt i henhold til gjeldende forskrifter og takster.
                                    </p>
                                </div>
                            </div>

                            <label className={cn(
                                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all mb-4",
                                formData.bekreftelse ? "border-[#7C3AED] bg-[#F5F3FF]" : "border-[#DDD7CE] hover:border-[#7C3AED]/30"
                            )}>
                                <input
                                    type="checkbox"
                                    checked={formData.bekreftelse}
                                    onChange={(e) => updateField('bekreftelse', e.target.checked)}
                                    className="mt-0.5 w-5 h-5 rounded border-[#CBD2D9] text-[#7C3AED] focus:ring-[#7C3AED]"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-[#1E1914] block">
                                        Jeg bekrefter at opplysningene er korrekte <span className="text-[#C44536]">*</span>
                                    </span>
                                    <span className="text-xs text-[#7D7267] mt-1 block">
                                        Ved &aring; krysse av bekrefter du at refusjonskravet er i samsvar med gjeldende regelverk og at behandlingen er utf&oslash;rt som beskrevet.
                                    </span>
                                </div>
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Tannlegens navn</label>
                                    <input
                                        type="text"
                                        value={formData.tannlegeNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Dato</label>
                                    <input
                                        type="text"
                                        value={new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                                        "!py-2.5 !px-6 text-sm flex items-center gap-2",
                                        formData.bekreftelse
                                            ? "btn-primary"
                                            : "bg-[#DDD7CE] text-[var(--medical-gray-400)] rounded-lg font-semibold cursor-not-allowed"
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
