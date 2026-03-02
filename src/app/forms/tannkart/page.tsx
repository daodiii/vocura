'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, FileText, Plus, Trash2, Info, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface ToothData {
    id: string;
    status: string;
    surfaces: string[];
    treatment: string;
    priority: string;
    notes: string;
}

const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
const UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38'];
const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];

const TOOTH_STATUS = [
    { value: 'healthy', label: 'Frisk', color: '#FFFFFF', border: '#CBD2D9' },
    { value: 'cavity', label: 'Karies', color: '#FEF3C7', border: '#C8842B' },
    { value: 'filling', label: 'Fylling', color: '#DDD7CE', border: '#7D7267' },
    { value: 'crown', label: 'Krone', color: '#FEF3C7', border: '#C8842B' },
    { value: 'missing', label: 'Mangler', color: '#FAEAE8', border: '#C44536' },
    { value: 'rootcanal', label: 'Rotfylt', color: '#EDE9FE', border: '#4F5ABF' },
    { value: 'implant', label: 'Implantat', color: '#CCFBF1', border: '#0D9488' },
];

const SURFACES = ['Mesial', 'Distal', 'Bukkal', 'Lingual', 'Okklusal'];

const TREATMENTS = [
    'Ingen behandling',
    'Fylling',
    'Krone',
    'Rotfylling',
    'Ekstraksjon',
    'Implantat',
    'Bro',
    'Porselen laminate',
    'Tannrens',
    'Annet',
];

const PRIORITIES = ['Lav', 'Middels', 'Høy', 'Akutt'];

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'Lav': return { bg: '#F5F2ED', text: '#5E5549' };
        case 'Middels': return { bg: '#FEF3C7', text: '#C8842B' };
        case 'Høy': return { bg: '#FAEAE8', text: '#C44536' };
        case 'Akutt': return { bg: '#FAEAE8', text: '#DC2626' };
        default: return { bg: '#F5F2ED', text: '#5E5549' };
    }
};

export default function TannkartForm() {
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'tannkart' });
    const [formData, setFormData] = useState({
        patientNavn: '',
        patientFnr: '',
        forsikringsselskap: '',
        polisseNummer: '',
        dekningsprosent: '',
        pasientSamtykke: false,
        pasientSignatur: '',
    });

    const [teeth, setTeeth] = useState<Record<string, ToothData>>({});
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getToothData = (id: string): ToothData => {
        return teeth[id] || { id, status: 'healthy', surfaces: [], treatment: 'Ingen behandling', priority: 'Lav', notes: '' };
    };

    const updateTooth = (id: string, field: keyof ToothData, value: string | string[]) => {
        setTeeth(prev => ({
            ...prev,
            [id]: { ...getToothData(id), [field]: value }
        }));
    };

    const toggleSurface = (toothId: string, surface: string) => {
        const data = getToothData(toothId);
        const newSurfaces = data.surfaces.includes(surface)
            ? data.surfaces.filter(s => s !== surface)
            : [...data.surfaces, surface];
        updateTooth(toothId, 'surfaces', newSurfaces);
    };

    const getStatusStyle = (id: string) => {
        const data = teeth[id];
        if (!data) return TOOTH_STATUS[0];
        return TOOTH_STATUS.find(s => s.value === data.status) || TOOTH_STATUS[0];
    };

    const getAllFormData = () => ({ ...formData, teeth });

    const handleSave = () => {
        saveAsDraft(getAllFormData());
    };

    const handleSubmit = () => {
        submitForm(getAllFormData());
    };

    const handleExportPdf = () => {
        exportPdf(getAllFormData(), 'Tannkart og behandlingsplan', 'Tannlege');
    };

    const teethWithTreatment = Object.values(teeth).filter(t => t.treatment !== 'Ingen behandling');

    const treatmentCounts = teethWithTreatment.reduce<Record<string, number>>((acc, t) => {
        acc[t.treatment] = (acc[t.treatment] || 0) + 1;
        return acc;
    }, {});

    const referenceId = `TANN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const renderToothButton = (id: string) => (
        <button
            key={id}
            onClick={() => setSelectedTooth(id)}
            className={cn(
                "w-10 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-mono transition-all cursor-pointer",
                selectedTooth === id && "ring-2 ring-[#A0714F] ring-offset-1",
            )}
            style={{
                backgroundColor: getStatusStyle(id).color,
                borderColor: getStatusStyle(id).border,
            }}
        >
            <span className="text-[10px] font-bold text-[#7D7267]">{id}</span>
            {teeth[id]?.treatment && teeth[id].treatment !== 'Ingen behandling' && (
                <span className="w-2 h-2 rounded-full bg-[#0D9488] mt-0.5" />
            )}
        </button>
    );

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F5F2ED]">
                <AppHeader />
                <main className="max-w-6xl mx-auto px-6 py-16">
                    <div className="card-base p-12 text-center max-w-lg mx-auto">
                        <div className="w-16 h-16 bg-[#CCFBF1] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#0D9488]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Tannkart lagret
                        </h2>
                        <p className="text-[#7D7267] mb-2">Tannkartet og behandlingsplanen er lagret.</p>
                        <p className="text-sm text-[#9E958C] mb-6">
                            Referanse: <span className="font-mono font-semibold text-[#0D9488]">{submissionId || referenceId}</span>
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
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F2ED]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[#FFFDF9] border-b border-[#DDD7CE]">
                <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
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
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre'}
                        </button>
                        <button onClick={handleExportPdf} className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Eksporter
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-primary text-xs !py-2 !px-4 flex items-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            {submitting ? 'Lagrer...' : 'Lagre tannkart'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#CCFBF1] rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#0D9488]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                        Tannkart og behandlingsplan
                    </h1>
                    <p className="text-[#7D7267] mt-1">Visuelt tannkart med behandlingsplanlegging</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left 2 columns: Dental Chart + Treatment Summary */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Dental Chart */}
                        <div className="card-base p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                                    Tannkart
                                </h2>
                            </div>

                            {/* Upper Jaw */}
                            <div className="mb-2">
                                <p className="text-xs font-semibold text-[#7D7267] uppercase tracking-wider mb-2 text-center">Overkjeve</p>
                                <div className="flex justify-center gap-1 mb-1">
                                    {UPPER_RIGHT.map(id => renderToothButton(id))}
                                    <div className="w-px bg-[#CBD2D9] mx-1" />
                                    {UPPER_LEFT.map(id => renderToothButton(id))}
                                </div>
                            </div>

                            {/* Divider between jaws */}
                            <div className="border-t-2 border-dashed border-[#DDD7CE] my-3" />

                            {/* Lower Jaw */}
                            <div className="mt-2">
                                <div className="flex justify-center gap-1 mb-2">
                                    {LOWER_RIGHT.map(id => renderToothButton(id))}
                                    <div className="w-px bg-[#CBD2D9] mx-1" />
                                    {LOWER_LEFT.map(id => renderToothButton(id))}
                                </div>
                                <p className="text-xs font-semibold text-[#7D7267] uppercase tracking-wider mt-2 text-center">Underkjeve</p>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center justify-center gap-3 mt-5 pt-4 border-t border-[#DDD7CE]">
                                {TOOTH_STATUS.map(status => (
                                    <span key={status.value} className="flex items-center gap-1.5 text-xs text-[#7D7267]">
                                        <span
                                            className="w-4 h-4 rounded border-2 inline-block"
                                            style={{ backgroundColor: status.color, borderColor: status.border }}
                                        />
                                        {status.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Treatment Summary Table */}
                        <div className="card-base p-4">
                            <h3 className="text-sm font-semibold text-[#1E1914] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                                Behandlingsoversikt ({teethWithTreatment.length} tenner)
                            </h3>

                            {teethWithTreatment.length === 0 ? (
                                <p className="text-sm text-[#9E958C] text-center py-6">
                                    Ingen behandlinger planlagt ennå
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[#DDD7CE]">
                                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#7D7267] uppercase tracking-wider">Tann</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#7D7267] uppercase tracking-wider">Status</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#7D7267] uppercase tracking-wider">Behandling</th>
                                                <th className="text-left py-2 px-3 text-xs font-semibold text-[#7D7267] uppercase tracking-wider">Prioritet</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teethWithTreatment
                                                .sort((a, b) => {
                                                    const priorityOrder = ['Akutt', 'Høy', 'Middels', 'Lav'];
                                                    return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
                                                })
                                                .map(tooth => {
                                                    const statusInfo = TOOTH_STATUS.find(s => s.value === tooth.status);
                                                    const priorityStyle = getPriorityColor(tooth.priority);
                                                    return (
                                                        <tr
                                                            key={tooth.id}
                                                            onClick={() => setSelectedTooth(tooth.id)}
                                                            className={cn(
                                                                "border-b border-[#F5F2ED] cursor-pointer transition-colors",
                                                                selectedTooth === tooth.id ? "bg-[#F5FAFF]" : "hover:bg-[#F5F2ED]"
                                                            )}
                                                        >
                                                            <td className="py-2.5 px-3 font-mono font-semibold text-[#1E1914]">{tooth.id}</td>
                                                            <td className="py-2.5 px-3">
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    <span
                                                                        className="w-3 h-3 rounded border inline-block"
                                                                        style={{ backgroundColor: statusInfo?.color, borderColor: statusInfo?.border }}
                                                                    />
                                                                    <span className="text-[#5E5549]">{statusInfo?.label}</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 px-3 text-[#1E1914]">{tooth.treatment}</td>
                                                            <td className="py-2.5 px-3">
                                                                <span
                                                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                                    style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
                                                                >
                                                                    {tooth.priority}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Cost Estimate */}
                        <div className="card-base p-4">
                            <h3 className="text-sm font-semibold text-[#1E1914] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                                Kostnadsoverslag
                            </h3>

                            {Object.keys(treatmentCounts).length === 0 ? (
                                <p className="text-sm text-[#9E958C] text-center py-4">
                                    Legg til behandlinger for å se kostnadsoverslag
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {Object.entries(treatmentCounts).map(([treatment, count]) => (
                                        <div key={treatment} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F5F2ED]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
                                                <span className="text-sm text-[#1E1914]">{treatment}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-[#5E5549]">
                                                {count} {count === 1 ? 'tann' : 'tenner'}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#DDD7CE]">
                                        <span className="text-sm font-semibold text-[#1E1914]">Totalt behandlinger</span>
                                        <span className="text-sm font-bold text-[#0D9488]">
                                            {teethWithTreatment.length} tenner
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column: Detail Panel */}
                    <div className="space-y-4">
                        {/* Patient Info */}
                        <div className="card-base p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-4 h-4 text-[#0D9488]" />
                                <h3 className="text-sm font-semibold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                                    Pasientopplysninger
                                </h3>
                            </div>
                            <div className="space-y-3">
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
                                    <label className="form-label form-required">Fødselsnummer</label>
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
                        </div>

                        {/* Tooth Detail Panel */}
                        {selectedTooth && (
                            <div className="card-base p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                                        Tann {selectedTooth}
                                    </h3>
                                    <button
                                        onClick={() => setSelectedTooth(null)}
                                        className="text-[#9E958C] hover:text-[#5E5549] transition-colors text-xs"
                                    >
                                        Lukk
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Status */}
                                    <div>
                                        <label className="form-label">Status</label>
                                        <select
                                            value={getToothData(selectedTooth).status}
                                            onChange={(e) => updateTooth(selectedTooth, 'status', e.target.value)}
                                            className="input-field !text-sm"
                                        >
                                            {TOOTH_STATUS.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Surfaces */}
                                    <div>
                                        <label className="form-label">Flater</label>
                                        <div className="flex flex-wrap gap-2">
                                            {SURFACES.map(surface => {
                                                const isActive = getToothData(selectedTooth).surfaces.includes(surface);
                                                return (
                                                    <button
                                                        key={surface}
                                                        onClick={() => toggleSurface(selectedTooth, surface)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                                            isActive
                                                                ? "bg-[#CCFBF1] border-[#0D9488] text-[#0D9488]"
                                                                : "bg-[#FFFDF9] border-[#DDD7CE] text-[#5E5549] hover:border-[#0D9488]/30"
                                                        )}
                                                    >
                                                        {surface}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Treatment */}
                                    <div>
                                        <label className="form-label">Behandling</label>
                                        <select
                                            value={getToothData(selectedTooth).treatment}
                                            onChange={(e) => updateTooth(selectedTooth, 'treatment', e.target.value)}
                                            className="input-field !text-sm"
                                        >
                                            {TREATMENTS.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="form-label">Prioritet</label>
                                        <div className="flex gap-2">
                                            {PRIORITIES.map(p => {
                                                const isActive = getToothData(selectedTooth).priority === p;
                                                const style = getPriorityColor(p);
                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => updateTooth(selectedTooth, 'priority', p)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                                            isActive
                                                                ? "ring-2 ring-offset-1"
                                                                : "opacity-60 hover:opacity-100"
                                                        )}
                                                        style={{
                                                            backgroundColor: style.bg,
                                                            color: style.text,
                                                            borderColor: isActive ? style.text : 'transparent',
                                                            ...(isActive ? { '--tw-ring-color': style.text } as React.CSSProperties : {}),
                                                        }}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="form-label">Notater</label>
                                        <textarea
                                            value={getToothData(selectedTooth).notes}
                                            onChange={(e) => updateTooth(selectedTooth, 'notes', e.target.value)}
                                            className="input-field !text-sm min-h-[40px] resize-y"
                                            placeholder="Tilleggsinformasjon om tannen..."
                                        />
                                    </div>

                                    {/* Update button */}
                                    <button
                                        onClick={() => {
                                            // Ensure tooth data is saved (already reactive via updateTooth)
                                            handleSave();
                                        }}
                                        disabled={saving}
                                        className="btn-primary w-full text-sm !py-2.5 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: '#0D9488' }}
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        {saving ? 'Lagrer...' : 'Oppdater'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Insurance */}
                        <div className="card-base p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-4 h-4 text-[#0D9488]" />
                                <h3 className="text-sm font-semibold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                                    Forsikring
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="form-label">Forsikringsselskap</label>
                                    <input
                                        type="text"
                                        value={formData.forsikringsselskap}
                                        onChange={(e) => updateField('forsikringsselskap', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="F.eks. Tryg, If, Storebrand"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Polissenummer</label>
                                    <input
                                        type="text"
                                        value={formData.polisseNummer}
                                        onChange={(e) => updateField('polisseNummer', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="123456789"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Dekningsprosent</label>
                                    <input
                                        type="text"
                                        value={formData.dekningsprosent}
                                        onChange={(e) => updateField('dekningsprosent', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="F.eks. 80%"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Consent */}
                        <div className="card-base p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-4 h-4 text-[#0D9488]" />
                                <h3 className="text-sm font-semibold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                                    Samtykke
                                </h3>
                            </div>
                            <div className="space-y-3">
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.pasientSamtykke ? "border-[#0D9488] bg-[#F0FDFA]" : "border-[#DDD7CE] hover:border-[#0D9488]/30"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.pasientSamtykke}
                                        onChange={(e) => updateField('pasientSamtykke', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[#CBD2D9] text-[#0D9488] focus:ring-[#0D9488]"
                                    />
                                    <span className="text-sm text-[#1E1914]">
                                        Pasienten samtykker til behandlingsplanen
                                    </span>
                                </label>

                                <div>
                                    <label className="form-label">Pasientens signatur</label>
                                    <input
                                        type="text"
                                        value={formData.pasientSignatur}
                                        onChange={(e) => updateField('pasientSignatur', e.target.value)}
                                        className="input-field !text-sm"
                                        style={{ fontFamily: "'Georgia', serif", fontStyle: 'italic' }}
                                        placeholder="Skriv fullt navn som elektronisk signatur"
                                    />
                                </div>

                                <p className="text-xs text-[#9E958C]">
                                    Dato: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
