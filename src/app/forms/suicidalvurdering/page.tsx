'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, AlertTriangle, Calendar, Phone, Plus, Trash2, Info, ShieldCheck, Heart, Brain, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function SuicidalvurderingForm() {
    const [formData, setFormData] = useState({
        // Patient & Assessor
        patientNavn: '',
        patientFnr: '',
        vurdererNavn: '',
        vurdererRolle: '',
        vurderingsDato: '',
        vurderingsTid: '',
        sted: '',
        // Current situation
        arsakTilVurdering: '',
        aktuellKrise: '',
        // Static risk factors
        tidligereForsok: false,
        tidligereForsokAntall: '',
        tidligereForsokDatoer: '',
        familiehistorieSuicid: false,
        kroniskSykdom: false,
        tidligereInnleggelse: false,
        rusmisbrukHistorie: false,
        barndomstraumer: false,
        // Dynamic risk factors
        aktuellSuicidalIdeering: 'nei',
        ideaSjonFrekvens: '',
        haaploshet: '',
        aktueltRusmiddelbruk: false,
        nyligeTap: false,
        sovnforstyrrelse: false,
        agitasjon: false,
        tilgangTilMidler: false,
        // Protective factors
        sosialtNettverk: false,
        barnFamilieansvar: false,
        behandlingsengasjement: false,
        religioseVerdier: false,
        fremtidsplaner: false,
        terapeutiskRelasjon: false,
        // Ideation assessment
        tankeFrekvens: '',
        tankeIntensitet: '',
        harPlan: 'nei',
        planDetaljer: '',
        tilgangMidler: 'nei',
        midlerType: '',
        intensjon: '',
        tidslinje: '',
        // Risk level
        risikoniva: '',
        // Safety plan
        varseltegn: '',
        mestringsstrategier: '',
        fagligKontakt: '',
        tryggeOmgivelser: '',
        // Clinical actions
        sikkerhetsplanOpprettet: false,
        medisingjennomgang: false,
        parorendeVarslet: false,
        tvangsVurdert: false,
        innleggelse: false,
        polikliniskOppfolging: false,
        oppfolgingsDato: '',
        oppfolgingsplan: '',
    });

    const [kontakter, setKontakter] = useState<{ navn: string; telefon: string }[]>([]);
    const [nyKontaktNavn, setNyKontaktNavn] = useState('');
    const [nyKontaktTelefon, setNyKontaktTelefon] = useState('');

    const { saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'suicidalvurdering' });

    const updateField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getAllFormData = () => ({
        ...formData,
        kontakter,
    });

    const handleSave = () => {
        saveAsDraft(getAllFormData());
    };

    const handleSubmit = () => {
        submitForm(getAllFormData());
    };

    const addKontakt = () => {
        if (nyKontaktNavn.trim() && nyKontaktTelefon.trim()) {
            setKontakter(prev => [...prev, { navn: nyKontaktNavn.trim(), telefon: nyKontaktTelefon.trim() }]);
            setNyKontaktNavn('');
            setNyKontaktTelefon('');
        }
    };

    const removeKontakt = (index: number) => {
        setKontakter(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-[var(--surface-deep)]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[var(--surface-primary)]/80 border-b border-[rgba(255,255,255,0.06)]">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Breadcrumbs items={[
                        { label: 'Hjem', href: '/dashboard' },
                        { label: 'Skjemaer', href: '/forms' },
                        { label: 'Suicidalvurdering' },
                    ]} />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-1.5 transition-colors duration-150 text-xs flex items-center gap-1.5 !py-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button
                            onClick={() => exportPdf(getAllFormData(), 'Suicidalvurdering', 'Lege')}
                            className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs !py-2 !px-4 flex items-center gap-1.5"
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
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            {submitting ? 'Lagrer...' : submitted ? 'Vurdering lagret' : 'Lagre suicidalvurdering'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[rgba(239,68,68,0.1)] rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[rgba(16,185,129,0.1)] text-[#10B981] uppercase tracking-wider">Helsedirektoratet</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Georgia', serif" }}>
                        Suicidalvurdering
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">Strukturert vurdering av suicidalrisiko med handlingsplan</p>
                </div>

                {submitted ? (
                    <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#10B981]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Suicidalvurdering lagret
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">Vurderingen er lagret i pasientjournalen.</p>
                        {error && <p className="text-sm text-[#EF4444] mb-4">{error}</p>}
                        <p className="text-sm font-mono text-[var(--text-muted)] mb-8">Referanse: SUI-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 inline-flex items-center gap-2">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section 1: Pasient og vurderer */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#EF4444]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">1. Pasient og vurderer</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Informasjon om pasienten og den som gjennomforer vurderingen</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Pasientens navn <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                        placeholder="Fornavn Etternavn"
                                    />
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Fodselsnummer (11 siffer) <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Vurderers navn <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.vurdererNavn}
                                        onChange={(e) => updateField('vurdererNavn', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                        placeholder="Fornavn Etternavn"
                                    />
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Rolle <span className="text-[#EF4444]">*</span></label>
                                    <select
                                        value={formData.vurdererRolle}
                                        onChange={(e) => updateField('vurdererRolle', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="Psykolog">Psykolog</option>
                                        <option value="Psykiater">Psykiater</option>
                                        <option value="Lege">Lege</option>
                                        <option value="Sykepleier">Sykepleier</option>
                                        <option value="Sosionom">Sosionom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Sted <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.sted}
                                        onChange={(e) => updateField('sted', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                        placeholder="Avdeling / lokasjon"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Dato <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.vurderingsDato}
                                        onChange={(e) => updateField('vurderingsDato', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Tidspunkt <span className="text-[#EF4444]">*</span></label>
                                    <input
                                        type="time"
                                        value={formData.vurderingsTid}
                                        onChange={(e) => updateField('vurderingsTid', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Aktuell situasjon */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">2. Aktuell situasjon</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Bakgrunn for vurderingen og navaerende krise</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Arsak til vurdering <span className="text-[#EF4444]">*</span></label>
                                    <textarea
                                        value={formData.arsakTilVurdering}
                                        onChange={(e) => updateField('arsakTilVurdering', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[100px] resize-y"
                                        placeholder="Hva er arsaken til at suicidalvurdering gjennomfores?"
                                    />
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Aktuell krisesituasjon</label>
                                    <textarea
                                        value={formData.aktuellKrise}
                                        onChange={(e) => updateField('aktuellKrise', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[80px] resize-y"
                                        placeholder="Beskriv den aktuelle krisesituasjonen..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Statiske risikofaktorer */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">3. Statiske risikofaktorer</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Historiske faktorer som oker risiko</p>

                            <div className="space-y-3">
                                {/* Tidligere selvmordsforsok */}
                                <div>
                                    <label className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                        formData.tidligereForsok ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                    )}>
                                        <input
                                            type="checkbox"
                                            checked={formData.tidligereForsok}
                                            onChange={(e) => updateField('tidligereForsok', e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                        />
                                        <span className="text-sm text-[var(--text-primary)]">Tidligere selvmordsforsok</span>
                                    </label>
                                    {formData.tidligereForsok && (
                                        <div className="grid grid-cols-2 gap-4 mt-3 ml-7">
                                            <div>
                                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Antall forsok</label>
                                                <input
                                                    type="text"
                                                    value={formData.tidligereForsokAntall}
                                                    onChange={(e) => updateField('tidligereForsokAntall', e.target.value)}
                                                    className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                                    placeholder="Antall"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Datoer / tidspunkt</label>
                                                <input
                                                    type="text"
                                                    value={formData.tidligereForsokDatoer}
                                                    onChange={(e) => updateField('tidligereForsokDatoer', e.target.value)}
                                                    className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                                    placeholder="Omtrentlige datoer"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Familiehistorie med selvmord */}
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.familiehistorieSuicid ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.familiehistorieSuicid}
                                        onChange={(e) => updateField('familiehistorieSuicid', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Familiehistorie med selvmord</span>
                                </label>

                                {/* Kronisk sykdom */}
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.kroniskSykdom ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.kroniskSykdom}
                                        onChange={(e) => updateField('kroniskSykdom', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Kronisk sykdom</span>
                                </label>

                                {/* Tidligere psykiatrisk innleggelse */}
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.tidligereInnleggelse ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.tidligereInnleggelse}
                                        onChange={(e) => updateField('tidligereInnleggelse', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Tidligere psykiatrisk innleggelse</span>
                                </label>

                                {/* Historikk med rusmisbruk */}
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.rusmisbrukHistorie ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.rusmisbrukHistorie}
                                        onChange={(e) => updateField('rusmisbrukHistorie', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Historikk med rusmisbruk</span>
                                </label>

                                {/* Barndomstraumer */}
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.barndomstraumer ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.barndomstraumer}
                                        onChange={(e) => updateField('barndomstraumer', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Barndomstraumer</span>
                                </label>
                            </div>
                        </div>

                        {/* Section 4: Dynamiske risikofaktorer */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Brain className="w-4 h-4 text-[#EF4444]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">4. Dynamiske risikofaktorer</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Navaerende faktorer som kan endres over tid</p>

                            {/* Aktuell suicidal ideering */}
                            <div className="mb-4">
                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Aktuell suicidal ideering? <span className="text-[#EF4444]">*</span></label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="suicidalIdeering"
                                            value="ja"
                                            checked={formData.aktuellSuicidalIdeering === 'ja'}
                                            onChange={() => updateField('aktuellSuicidalIdeering', 'ja')}
                                            className="text-[#EF4444]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="suicidalIdeering"
                                            value="nei"
                                            checked={formData.aktuellSuicidalIdeering === 'nei'}
                                            onChange={() => updateField('aktuellSuicidalIdeering', 'nei')}
                                            className="text-[#EF4444]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.aktuellSuicidalIdeering === 'ja' && (
                                <div className="mb-4">
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Frekvens</label>
                                    <input
                                        type="text"
                                        value={formData.ideaSjonFrekvens}
                                        onChange={(e) => updateField('ideaSjonFrekvens', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                        placeholder="Beskriv frekvens av suicidale tanker..."
                                    />
                                </div>
                            )}

                            {/* Haploshet */}
                            <div className="mb-4">
                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Haploshet</label>
                                <select
                                    value={formData.haaploshet}
                                    onChange={(e) => updateField('haaploshet', e.target.value)}
                                    className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                >
                                    <option value="">Velg...</option>
                                    <option value="Ingen">Ingen</option>
                                    <option value="Mild">Mild</option>
                                    <option value="Moderat">Moderat</option>
                                    <option value="Alvorlig">Alvorlig</option>
                                </select>
                            </div>

                            {/* Dynamic checkboxes */}
                            <div className="space-y-3">
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.aktueltRusmiddelbruk ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.aktueltRusmiddelbruk}
                                        onChange={(e) => updateField('aktueltRusmiddelbruk', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Aktuelt rusmiddelbruk</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.nyligeTap ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.nyligeTap}
                                        onChange={(e) => updateField('nyligeTap', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Nylige signifikante tap</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.sovnforstyrrelse ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.sovnforstyrrelse}
                                        onChange={(e) => updateField('sovnforstyrrelse', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Sovnforstyrrelser</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.agitasjon ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agitasjon}
                                        onChange={(e) => updateField('agitasjon', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Agitasjon/uro</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.tilgangTilMidler ? "border-[#EF4444]/30 bg-[rgba(239,68,68,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.tilgangTilMidler}
                                        onChange={(e) => updateField('tilgangTilMidler', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Tilgang til midler</span>
                                </label>
                            </div>
                        </div>

                        {/* Section 5: Beskyttende faktorer */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">5. Beskyttende faktorer</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Faktorer som reduserer risiko</p>

                            <div className="space-y-3">
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.sosialtNettverk ? "border-[#10B981]/30 bg-[rgba(16,185,129,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.sosialtNettverk}
                                        onChange={(e) => updateField('sosialtNettverk', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#10B981] focus:ring-[#10B981]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Sosialt stottenettverk</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.barnFamilieansvar ? "border-[#10B981]/30 bg-[rgba(16,185,129,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.barnFamilieansvar}
                                        onChange={(e) => updateField('barnFamilieansvar', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#10B981] focus:ring-[#10B981]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Barn/familieansvar</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.behandlingsengasjement ? "border-[#10B981]/30 bg-[rgba(16,185,129,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.behandlingsengasjement}
                                        onChange={(e) => updateField('behandlingsengasjement', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#10B981] focus:ring-[#10B981]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Behandlingsengasjement</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.religioseVerdier ? "border-[#10B981]/30 bg-[rgba(16,185,129,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.religioseVerdier}
                                        onChange={(e) => updateField('religioseVerdier', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#10B981] focus:ring-[#10B981]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Religiose/kulturelle verdier</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.fremtidsplaner ? "border-[#10B981]/30 bg-[rgba(16,185,129,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.fremtidsplaner}
                                        onChange={(e) => updateField('fremtidsplaner', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#10B981] focus:ring-[#10B981]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Fremtidsplaner/grunner til a leve</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.terapeutiskRelasjon ? "border-[#10B981]/30 bg-[rgba(16,185,129,0.1)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.terapeutiskRelasjon}
                                        onChange={(e) => updateField('terapeutiskRelasjon', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#10B981] focus:ring-[#10B981]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Terapeutisk relasjon</span>
                                </label>
                            </div>
                        </div>

                        {/* Section 6: Selvmordstankevurdering */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">6. Selvmordstankevurdering</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Detaljert vurdering av selvmordstanker og plan</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Tankefrekvens</label>
                                    <select
                                        value={formData.tankeFrekvens}
                                        onChange={(e) => updateField('tankeFrekvens', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="Sjelden">Sjelden</option>
                                        <option value="Ukentlig">Ukentlig</option>
                                        <option value="Daglig">Daglig</option>
                                        <option value="Konstant">Konstant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Tankeintensitet</label>
                                    <select
                                        value={formData.tankeIntensitet}
                                        onChange={(e) => updateField('tankeIntensitet', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="1">1 - Svaert lav</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5 - Mild</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                        <option value="10">10 - Ekstremt sterk</option>
                                    </select>
                                </div>
                            </div>

                            {/* Har pasienten en plan? */}
                            <div className="mb-4">
                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Har pasienten en plan? <span className="text-[#EF4444]">*</span></label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="harPlan"
                                            value="ja"
                                            checked={formData.harPlan === 'ja'}
                                            onChange={() => updateField('harPlan', 'ja')}
                                            className="text-[#EF4444]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="harPlan"
                                            value="nei"
                                            checked={formData.harPlan === 'nei'}
                                            onChange={() => updateField('harPlan', 'nei')}
                                            className="text-[#EF4444]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.harPlan === 'ja' && (
                                <div className="mb-4">
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Plandetaljer</label>
                                    <textarea
                                        value={formData.planDetaljer}
                                        onChange={(e) => updateField('planDetaljer', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[80px] resize-y"
                                        placeholder="Beskriv planen i detalj..."
                                    />
                                </div>
                            )}

                            {/* Tilgang til midler? */}
                            <div className="mb-4">
                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Tilgang til midler? <span className="text-[#EF4444]">*</span></label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tilgangMidler"
                                            value="ja"
                                            checked={formData.tilgangMidler === 'ja'}
                                            onChange={() => updateField('tilgangMidler', 'ja')}
                                            className="text-[#EF4444]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tilgangMidler"
                                            value="nei"
                                            checked={formData.tilgangMidler === 'nei'}
                                            onChange={() => updateField('tilgangMidler', 'nei')}
                                            className="text-[#EF4444]"
                                        />
                                        <span className="text-sm text-[var(--text-secondary)]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.tilgangMidler === 'ja' && (
                                <div className="mb-4">
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Type midler</label>
                                    <input
                                        type="text"
                                        value={formData.midlerType}
                                        onChange={(e) => updateField('midlerType', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                        placeholder="Beskriv type midler pasienten har tilgang til..."
                                    />
                                </div>
                            )}

                            {/* Intensjon */}
                            <div className="mb-4">
                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Intensjon</label>
                                <select
                                    value={formData.intensjon}
                                    onChange={(e) => updateField('intensjon', e.target.value)}
                                    className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                >
                                    <option value="">Velg...</option>
                                    <option value="Ingen intensjon">Ingen intensjon</option>
                                    <option value="Ambivalent">Ambivalent</option>
                                    <option value="Klar intensjon">Klar intensjon</option>
                                </select>
                            </div>

                            {/* Tidslinje */}
                            <div>
                                <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Tidslinje/tidsramme</label>
                                <input
                                    type="text"
                                    value={formData.tidslinje}
                                    onChange={(e) => updateField('tidslinje', e.target.value)}
                                    className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                    placeholder="Tidslinje/tidsramme"
                                />
                            </div>
                        </div>

                        {/* Section 7: Risikoniva */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">7. Risikoniva</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Samlet vurdering av risikoniva med anbefalte tiltak</p>

                            <div className="space-y-3">
                                {/* Lavt */}
                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.risikoniva === 'lavt'
                                        ? "border-[#10B981] bg-[rgba(16,185,129,0.1)]"
                                        : "border-[rgba(255,255,255,0.06)] hover:border-[#10B981]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="risikoniva"
                                        value="lavt"
                                        checked={formData.risikoniva === 'lavt'}
                                        onChange={() => updateField('risikoniva', 'lavt')}
                                        className="mt-1 w-5 h-5 text-[#10B981] focus:ring-[#10B981]"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                                            <span className="text-sm font-bold text-[#10B981]">Lavt</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mb-2">Lav umiddelbar risiko. Pasienten har beskyttende faktorer og ingen aktiv plan.</p>
                                        <div className="p-2 bg-[rgba(16,185,129,0.1)] rounded text-xs text-[#10B981]">
                                            <strong>Anbefalte tiltak:</strong> Oppfolging i poliklinikk. Sikkerhetsplan. Neste vurdering om 2-4 uker.
                                        </div>
                                    </div>
                                </label>

                                {/* Moderat */}
                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.risikoniva === 'moderat'
                                        ? "border-[#F59E0B] bg-[rgba(245,158,11,0.1)]"
                                        : "border-[rgba(255,255,255,0.06)] hover:border-[#F59E0B]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="risikoniva"
                                        value="moderat"
                                        checked={formData.risikoniva === 'moderat'}
                                        onChange={() => updateField('risikoniva', 'moderat')}
                                        className="mt-1 w-5 h-5 text-[#F59E0B] focus:ring-[#F59E0B]"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                                            <span className="text-sm font-bold text-[#F59E0B]">Moderat</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mb-2">Forhoyede risikofaktorer. Suicidale tanker til stede, men ambivalent.</p>
                                        <div className="p-2 bg-[rgba(245,158,11,0.1)] rounded text-xs text-[#F59E0B]">
                                            <strong>Anbefalte tiltak:</strong> Hyppig oppfolging (ukentlig). Vurder medisinendring. Sikkerhetsplan obligatorisk.
                                        </div>
                                    </div>
                                </label>

                                {/* Hoyt */}
                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.risikoniva === 'hoyt'
                                        ? "border-[#F97316] bg-[rgba(249,115,22,0.1)]"
                                        : "border-[rgba(255,255,255,0.06)] hover:border-[#F97316]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="risikoniva"
                                        value="hoyt"
                                        checked={formData.risikoniva === 'hoyt'}
                                        onChange={() => updateField('risikoniva', 'hoyt')}
                                        className="mt-1 w-5 h-5 text-[#F97316] focus:ring-[#F97316]"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-4 h-4 text-[#F97316]" />
                                            <span className="text-sm font-bold text-[#F97316]">Hoyt</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mb-2">Signifikant risiko. Aktive suicidale tanker med mulig plan.</p>
                                        <div className="p-2 bg-[rgba(249,115,22,0.1)] rounded text-xs text-[#F97316]">
                                            <strong>Anbefalte tiltak:</strong> Daglig oppfolging. Vurder innleggelse. Varsle parorende. Fjern tilgang til midler.
                                        </div>
                                    </div>
                                </label>

                                {/* Akutt */}
                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.risikoniva === 'akutt'
                                        ? "border-[#EF4444] bg-[rgba(239,68,68,0.1)] animate-pulse"
                                        : "border-[rgba(255,255,255,0.06)] hover:border-[#EF4444]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="risikoniva"
                                        value="akutt"
                                        checked={formData.risikoniva === 'akutt'}
                                        onChange={() => updateField('risikoniva', 'akutt')}
                                        className="mt-1 w-5 h-5 text-[#EF4444] focus:ring-[#EF4444]"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                                            <span className="text-sm font-bold text-[#EF4444]">Akutt</span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)] mb-2">Umiddelbar fare. Klar intensjon og/eller aktiv plan med tilgang til midler.</p>
                                        <div className="p-2 bg-[rgba(239,68,68,0.1)] rounded text-xs text-[#EF4444]">
                                            <strong>Anbefalte tiltak:</strong> Umiddelbar innleggelse eller tvangsvurdering. Kontinuerlig tilsyn. Varsle nodkontakter.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Section 8: Sikkerhetsplan */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">8. Sikkerhetsplan</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Individuell sikkerhetsplan for pasienten</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Varseltegn</label>
                                    <textarea
                                        value={formData.varseltegn}
                                        onChange={(e) => updateField('varseltegn', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[80px] resize-y"
                                        placeholder="Varseltegn pasienten skal vaere oppmerksom pa..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Mestringsstrategier</label>
                                    <textarea
                                        value={formData.mestringsstrategier}
                                        onChange={(e) => updateField('mestringsstrategier', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[80px] resize-y"
                                        placeholder="Mestringsstrategier pasienten kan bruke..."
                                    />
                                </div>

                                {/* Kontaktpersoner */}
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Kontaktpersoner</label>

                                    {kontakter.length > 0 && (
                                        <div className="space-y-2 mb-3">
                                            {kontakter.map((kontakt, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-[rgba(94,106,210,0.08)] rounded-lg border border-[rgba(94,106,210,0.15)]"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-3.5 h-3.5 text-[#7B89DB]" />
                                                            <span className="text-sm text-[var(--text-primary)]">{kontakt.navn}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3.5 h-3.5 text-[#7B89DB]" />
                                                            <span className="text-sm text-[var(--text-primary)] font-mono">{kontakt.telefon}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeKontakt(index)}
                                                        className="p-1 text-[var(--text-muted)] hover:text-[#EF4444] transition-colors rounded"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <div className="grid grid-cols-2 gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={nyKontaktNavn}
                                                onChange={(e) => setNyKontaktNavn(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addKontakt();
                                                    }
                                                }}
                                                className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                                placeholder="Navn"
                                            />
                                            <input
                                                type="text"
                                                value={nyKontaktTelefon}
                                                onChange={(e) => setNyKontaktTelefon(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addKontakt();
                                                    }
                                                }}
                                                className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                                placeholder="Telefon"
                                            />
                                        </div>
                                        <button
                                            onClick={addKontakt}
                                            disabled={!nyKontaktNavn.trim() || !nyKontaktTelefon.trim()}
                                            className={cn(
                                                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                                nyKontaktNavn.trim() && nyKontaktTelefon.trim()
                                                    ? "bg-[#5E6AD2] text-white hover:bg-[#4F5ABF]"
                                                    : "bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] cursor-not-allowed"
                                            )}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Legg til
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Profesjonell kontakt (navn og telefon)</label>
                                    <input
                                        type="text"
                                        value={formData.fagligKontakt}
                                        onChange={(e) => updateField('fagligKontakt', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                        placeholder="Profesjonell kontakt (navn og telefon)"
                                    />
                                </div>

                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Trygge omgivelser</label>
                                    <textarea
                                        value={formData.tryggeOmgivelser}
                                        onChange={(e) => updateField('tryggeOmgivelser', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[60px] resize-y"
                                        placeholder="Tiltak for a sikre trygge omgivelser..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 9: Kliniske tiltak og oppfolging */}
                        <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="w-4 h-4 text-[#5E6AD2]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">9. Kliniske tiltak og oppfolging</h2>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-4 ml-6">Besluttede tiltak og plan for videre oppfolging</p>

                            <div className="space-y-3 mb-4">
                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.sikkerhetsplanOpprettet ? "border-[#5E6AD2]/30 bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.sikkerhetsplanOpprettet}
                                        onChange={(e) => updateField('sikkerhetsplanOpprettet', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#5E6AD2] focus:ring-[#5E6AD2]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Sikkerhetsplan opprettet</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.medisingjennomgang ? "border-[#5E6AD2]/30 bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.medisingjennomgang}
                                        onChange={(e) => updateField('medisingjennomgang', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#5E6AD2] focus:ring-[#5E6AD2]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Medisingjennomgang utfort</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.parorendeVarslet ? "border-[#5E6AD2]/30 bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.parorendeVarslet}
                                        onChange={(e) => updateField('parorendeVarslet', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#5E6AD2] focus:ring-[#5E6AD2]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Parorende varslet</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.tvangsVurdert ? "border-[#5E6AD2]/30 bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.tvangsVurdert}
                                        onChange={(e) => updateField('tvangsVurdert', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#5E6AD2] focus:ring-[#5E6AD2]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Tvangsvurdering vurdert</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.innleggelse ? "border-[#5E6AD2]/30 bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.innleggelse}
                                        onChange={(e) => updateField('innleggelse', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#5E6AD2] focus:ring-[#5E6AD2]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Innleggelse</span>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                                    formData.polikliniskOppfolging ? "border-[#5E6AD2]/30 bg-[rgba(94,106,210,0.08)]" : "border-[rgba(255,255,255,0.06)] hover:border-[#5E6AD2]/20"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.polikliniskOppfolging}
                                        onChange={(e) => updateField('polikliniskOppfolging', e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[rgba(255,255,255,0.10)] text-[#5E6AD2] focus:ring-[#5E6AD2]"
                                    />
                                    <span className="text-sm text-[var(--text-primary)]">Poliklinisk oppfolging</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Oppfolgingsdato</label>
                                    <input
                                        type="date"
                                        value={formData.oppfolgingsDato}
                                        onChange={(e) => updateField('oppfolgingsDato', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)]"
                                    />
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm font-medium block mb-1.5">Oppfolgingsplan</label>
                                    <textarea
                                        value={formData.oppfolgingsplan}
                                        onChange={(e) => updateField('oppfolgingsplan', e.target.value)}
                                        className="bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] px-3 py-2 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] min-h-[80px] resize-y"
                                        placeholder="Beskriv plan for videre oppfolging..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#10B981]" />
                                <span className="text-xs font-semibold text-[#10B981]">GDPR-kompatibel lagring i journal</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {error && <p className="text-sm text-[#EF4444]">{error}</p>}
                                <button onClick={handleSave} disabled={saving} className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Lagrer...' : 'Lagre utkast'}
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150 !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                                    {submitting ? 'Lagrer...' : 'Lagre suicidalvurdering'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
