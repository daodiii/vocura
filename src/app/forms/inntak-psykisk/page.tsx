'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Brain, AlertTriangle, Calendar, Info, Heart, Pill, Wine, Users, ClipboardList, FileText, Loader2 } from 'lucide-react';
import { cn, validateFnr } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function InntakPsykiskForm() {
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'inntak-psykisk' });
    const [fnrError, setFnrError] = useState('');
    const [formData, setFormData] = useState({
        // Patient
        patientNavn: '',
        patientFnr: '',
        alder: '',
        telefon: '',
        adresse: '',
        // Referral
        henvist_av: '',
        henvisningsDato: '',
        henvisningsGrunn: '',
        // Presenting problem
        hovedproblem: '',
        startTidspunkt: '',
        alvorlighetsgrad: '',
        // Symptoms
        symptomVarighet: '',
        tidligereEpisoder: 'nei',
        tidligereEpisoderDetaljer: '',
        triggere: '',
        // Previous treatment
        tidligereBehandling: 'nei',
        tidligereBehandlingType: '',
        tidligereBehandlingVarighet: '',
        tidligereBehandlingUtfall: '',
        tidligereInnleggelse: 'nei',
        tidligereInnleggelseDetaljer: '',
        // Medications
        naavarendeMedisiner: '',
        tidligerePsykMedisiner: '',
        // Substance
        alkoholFrekvens: '',
        alkoholMengde: '',
        rusmidler: 'nei',
        rusmidlerType: '',
        tobakk: '',
        // Risk
        suicidalTanker: 'nei',
        suicidalTankerFrekvens: '',
        suicidalTankerPlan: '',
        selvskading: 'nei',
        selvskadingDetaljer: '',
        voldsrisiko: 'nei',
        voldsrisikoDetaljer: '',
        // Social
        bosituasjon: '',
        arbeidssituasjon: '',
        sivilstatus: '',
        barn: '',
        familiePsykiatri: '',
        // Assessment
        forelopigDiagnose: '',
        diagnoseKode: '',
        funksjonsvurdering: '',
        anbefalteBehandlinger: [] as string[],
        oppfolgingsplan: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleBehandling = (behandling: string) => {
        setFormData(prev => ({
            ...prev,
            anbefalteBehandlinger: prev.anbefalteBehandlinger.includes(behandling)
                ? prev.anbefalteBehandlinger.filter(b => b !== behandling)
                : [...prev.anbefalteBehandlinger, behandling],
        }));
    };

    const handleSave = () => {
        saveAsDraft(formData as unknown as Record<string, unknown>);
    };

    const handleSubmit = () => {
        submitForm(formData as unknown as Record<string, unknown>);
    };

    const handleExportPdf = () => {
        exportPdf(formData as unknown as Record<string, unknown>, 'Inntaksnotat (psykisk helse)', 'Kliniker');
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
                        <button onClick={handleExportPdf} className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !!fnrError}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5",
                                submitted ? "bg-[#3D8B6E] text-white rounded-lg font-semibold" : "btn-primary"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                            {submitting ? 'Lagrer...' : submitted ? 'Lagret' : 'Lagre inntaksnotat'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#EDE9FE] rounded-xl flex items-center justify-center">
                            <Brain className="w-5 h-5 text-[#4F5ABF]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                        Inntaksnotat (psykisk helse)
                    </h1>
                    <p className="text-[#7D7267] mt-1">Strukturert inntaksnotat for første konsultasjon</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Inntaksnotat lagret
                        </h2>
                        <p className="text-[#7D7267] mb-6">Inntaksnotatet er lagret i pasientjournalen.</p>
                        <p className="text-sm font-mono text-[#9E958C] mb-8">Referanse: {submissionId || `PSY-INT-${Math.random().toString(36).substr(2, 8).toUpperCase()}`}</p>
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
                                <User className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Grunnleggende pasientinformasjon</p>

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
                                    <label className="form-label form-required">Fødselsnummer (11 siffer)</label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        onBlur={() => setFnrError(validateFnr(formData.patientFnr) || '')}
                                        className="input-field !text-sm font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                    {fnrError && <p className="text-[#EF4444] text-xs mt-1">{fnrError}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="form-label">Alder</label>
                                    <input
                                        type="text"
                                        value={formData.alder}
                                        onChange={(e) => updateField('alder', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="35"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.telefon}
                                        onChange={(e) => updateField('telefon', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="412 34 567"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.adresse}
                                        onChange={(e) => updateField('adresse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Storgata 1, 0182 Oslo"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Henvisningsinformasjon */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Henvisningsinformasjon</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om henvisningen</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Henvist av</label>
                                    <input
                                        type="text"
                                        value={formData.henvist_av}
                                        onChange={(e) => updateField('henvist_av', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Fastlege / annen instans"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Henvisningsdato</label>
                                    <input
                                        type="date"
                                        value={formData.henvisningsDato}
                                        onChange={(e) => updateField('henvisningsDato', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Henvisningsgrunn</label>
                                <textarea
                                    value={formData.henvisningsGrunn}
                                    onChange={(e) => updateField('henvisningsGrunn', e.target.value)}
                                    className="input-field !text-sm min-h-[80px] resize-y"
                                    placeholder="Beskriv grunnen til henvisningen..."
                                />
                            </div>
                        </div>

                        {/* Section 3: Presenterende problem */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Brain className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Presenterende problem</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Hovedproblem og alvorlighetsgrad</p>

                            <div>
                                <label className="form-label form-required">Hovedproblem</label>
                                <textarea
                                    value={formData.hovedproblem}
                                    onChange={(e) => updateField('hovedproblem', e.target.value)}
                                    className="input-field !text-sm min-h-[100px] resize-y"
                                    placeholder="Beskriv hovedproblemet/klagen..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="form-label">Starttidspunkt</label>
                                    <input
                                        type="text"
                                        value={formData.startTidspunkt}
                                        onChange={(e) => updateField('startTidspunkt', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Når startet problemet?"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Alvorlighetsgrad</label>
                                    <select
                                        value={formData.alvorlighetsgrad}
                                        onChange={(e) => updateField('alvorlighetsgrad', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="mild">Mild</option>
                                        <option value="moderat">Moderat</option>
                                        <option value="alvorlig">Alvorlig</option>
                                        <option value="svaert_alvorlig">Svært alvorlig</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Symptomhistorikk */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Symptomhistorikk</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Varighet, tidligere episoder og triggere</p>

                            <div>
                                <label className="form-label">Varighet av nåværende episode</label>
                                <input
                                    type="text"
                                    value={formData.symptomVarighet}
                                    onChange={(e) => updateField('symptomVarighet', e.target.value)}
                                    className="input-field !text-sm"
                                    placeholder="Varighet av nåværende episode"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Tidligere episoder?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tidligereEpisoder"
                                            value="ja"
                                            checked={formData.tidligereEpisoder === 'ja'}
                                            onChange={() => updateField('tidligereEpisoder', 'ja')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tidligereEpisoder"
                                            value="nei"
                                            checked={formData.tidligereEpisoder === 'nei'}
                                            onChange={() => updateField('tidligereEpisoder', 'nei')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.tidligereEpisoder === 'ja' && (
                                <div className="mt-4">
                                    <label className="form-label">Detaljer om tidligere episoder</label>
                                    <textarea
                                        value={formData.tidligereEpisoderDetaljer}
                                        onChange={(e) => updateField('tidligereEpisoderDetaljer', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Beskriv tidligere episoder..."
                                    />
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="form-label">Triggere</label>
                                <textarea
                                    value={formData.triggere}
                                    onChange={(e) => updateField('triggere', e.target.value)}
                                    className="input-field !text-sm min-h-[60px] resize-y"
                                    placeholder="Kjente triggere eller utløsende faktorer..."
                                />
                            </div>
                        </div>

                        {/* Section 5: Tidligere behandling */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Tidligere behandling</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Tidligere behandlingshistorikk</p>

                            <div>
                                <label className="form-label">Har pasienten mottatt tidligere behandling?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tidligereBehandling"
                                            value="ja"
                                            checked={formData.tidligereBehandling === 'ja'}
                                            onChange={() => updateField('tidligereBehandling', 'ja')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tidligereBehandling"
                                            value="nei"
                                            checked={formData.tidligereBehandling === 'nei'}
                                            onChange={() => updateField('tidligereBehandling', 'nei')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.tidligereBehandling === 'ja' && (
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="form-label">Type behandling</label>
                                        <input
                                            type="text"
                                            value={formData.tidligereBehandlingType}
                                            onChange={(e) => updateField('tidligereBehandlingType', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="Type behandling"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Varighet</label>
                                        <input
                                            type="text"
                                            value={formData.tidligereBehandlingVarighet}
                                            onChange={(e) => updateField('tidligereBehandlingVarighet', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="Varighet"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Utfall</label>
                                        <input
                                            type="text"
                                            value={formData.tidligereBehandlingUtfall}
                                            onChange={(e) => updateField('tidligereBehandlingUtfall', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="Utfall"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="form-label">Tidligere innleggelser?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tidligereInnleggelse"
                                            value="ja"
                                            checked={formData.tidligereInnleggelse === 'ja'}
                                            onChange={() => updateField('tidligereInnleggelse', 'ja')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="tidligereInnleggelse"
                                            value="nei"
                                            checked={formData.tidligereInnleggelse === 'nei'}
                                            onChange={() => updateField('tidligereInnleggelse', 'nei')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.tidligereInnleggelse === 'ja' && (
                                <div className="mt-4">
                                    <label className="form-label">Detaljer om innleggelser</label>
                                    <textarea
                                        value={formData.tidligereInnleggelseDetaljer}
                                        onChange={(e) => updateField('tidligereInnleggelseDetaljer', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Beskriv tidligere innleggelser..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Section 6: Medikamenter */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Pill className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Medikamenter</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Nåværende og tidligere medikamenter</p>

                            <div>
                                <label className="form-label">Nåværende medikamenter</label>
                                <textarea
                                    value={formData.naavarendeMedisiner}
                                    onChange={(e) => updateField('naavarendeMedisiner', e.target.value)}
                                    className="input-field !text-sm min-h-[80px] resize-y"
                                    placeholder="Nåværende medikamenter og dosering..."
                                />
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Tidligere psykiatriske medikamenter</label>
                                <textarea
                                    value={formData.tidligerePsykMedisiner}
                                    onChange={(e) => updateField('tidligerePsykMedisiner', e.target.value)}
                                    className="input-field !text-sm min-h-[60px] resize-y"
                                    placeholder="Tidligere psykiatriske medikamenter..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Rusmiddelbruk */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Wine className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Rusmiddelbruk</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Alkohol, tobakk og andre rusmidler</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">Alkoholfrekvens</label>
                                    <select
                                        value={formData.alkoholFrekvens}
                                        onChange={(e) => updateField('alkoholFrekvens', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="aldri">Aldri</option>
                                        <option value="sjelden">Sjelden</option>
                                        <option value="ukentlig">Ukentlig</option>
                                        <option value="daglig">Daglig</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Mengde per gang</label>
                                    <input
                                        type="text"
                                        value={formData.alkoholMengde}
                                        onChange={(e) => updateField('alkoholMengde', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Mengde per gang"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Tobakk</label>
                                    <select
                                        value={formData.tobakk}
                                        onChange={(e) => updateField('tobakk', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="aldri">Aldri</option>
                                        <option value="tidligere">Tidligere</option>
                                        <option value="daglig">Daglig</option>
                                        <option value="av_og_til">Av og til</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Bruk av andre rusmidler?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="rusmidler"
                                            value="ja"
                                            checked={formData.rusmidler === 'ja'}
                                            onChange={() => updateField('rusmidler', 'ja')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="rusmidler"
                                            value="nei"
                                            checked={formData.rusmidler === 'nei'}
                                            onChange={() => updateField('rusmidler', 'nei')}
                                            className="text-[#4F5ABF]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.rusmidler === 'ja' && (
                                <div className="mt-4">
                                    <label className="form-label">Spesifiser rusmidler</label>
                                    <textarea
                                        value={formData.rusmidlerType}
                                        onChange={(e) => updateField('rusmidlerType', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Spesifiser type og frekvens..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* Section 8: Risikovurdering */}
                        <div className="form-section !border-[#C44536]/20">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-[#C44536]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0 !text-[#C44536]">8. Risikovurdering</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Vurdering av risikofaktorer</p>

                            {/* Suicidal tanker */}
                            <div>
                                <label className="form-label">Suicidale tanker?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="suicidalTanker"
                                            value="ja"
                                            checked={formData.suicidalTanker === 'ja'}
                                            onChange={() => updateField('suicidalTanker', 'ja')}
                                            className="text-[#C44536]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="suicidalTanker"
                                            value="nei"
                                            checked={formData.suicidalTanker === 'nei'}
                                            onChange={() => updateField('suicidalTanker', 'nei')}
                                            className="text-[#C44536]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.suicidalTanker === 'ja' && (
                                <>
                                    <div className="mt-3 p-3 bg-[#FAEAE8] rounded-lg border border-[#C44536]/30 flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-[#C44536] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-[#C44536]">Suicidalrisiko identifisert</p>
                                            <p className="text-[11px] text-[#C44536]/80 mt-0.5">Gjennomfør strukturert suicidalvurdering umiddelbart.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="form-label">Frekvens</label>
                                            <input
                                                type="text"
                                                value={formData.suicidalTankerFrekvens}
                                                onChange={(e) => updateField('suicidalTankerFrekvens', e.target.value)}
                                                className="input-field !text-sm"
                                                placeholder="Frekvens av tanker"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Plan</label>
                                            <input
                                                type="text"
                                                value={formData.suicidalTankerPlan}
                                                onChange={(e) => updateField('suicidalTankerPlan', e.target.value)}
                                                className="input-field !text-sm"
                                                placeholder="Eventuell plan"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Selvskading */}
                            <div className="mt-4">
                                <label className="form-label">Selvskading?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="selvskading"
                                            value="ja"
                                            checked={formData.selvskading === 'ja'}
                                            onChange={() => updateField('selvskading', 'ja')}
                                            className="text-[#C44536]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="selvskading"
                                            value="nei"
                                            checked={formData.selvskading === 'nei'}
                                            onChange={() => updateField('selvskading', 'nei')}
                                            className="text-[#C44536]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.selvskading === 'ja' && (
                                <>
                                    <div className="mt-3 p-3 bg-[#FAEAE8] rounded-lg border border-[#C44536]/30 flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-[#C44536] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-[#C44536]">Selvskadingsrisiko identifisert</p>
                                            <p className="text-[11px] text-[#C44536]/80 mt-0.5">Vurder sikkerhetstiltak og oppfølgingsplan.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="form-label">Detaljer om selvskading</label>
                                        <textarea
                                            value={formData.selvskadingDetaljer}
                                            onChange={(e) => updateField('selvskadingDetaljer', e.target.value)}
                                            className="input-field !text-sm min-h-[60px] resize-y"
                                            placeholder="Beskriv type og frekvens av selvskading..."
                                        />
                                    </div>
                                </>
                            )}

                            {/* Voldsrisiko */}
                            <div className="mt-4">
                                <label className="form-label">Voldsrisiko?</label>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="voldsrisiko"
                                            value="ja"
                                            checked={formData.voldsrisiko === 'ja'}
                                            onChange={() => updateField('voldsrisiko', 'ja')}
                                            className="text-[#C44536]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Ja</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="voldsrisiko"
                                            value="nei"
                                            checked={formData.voldsrisiko === 'nei'}
                                            onChange={() => updateField('voldsrisiko', 'nei')}
                                            className="text-[#C44536]"
                                        />
                                        <span className="text-sm text-[#3E4C59]">Nei</span>
                                    </label>
                                </div>
                            </div>

                            {formData.voldsrisiko === 'ja' && (
                                <>
                                    <div className="mt-3 p-3 bg-[#FAEAE8] rounded-lg border border-[#C44536]/30 flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-[#C44536] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-[#C44536]">Voldsrisiko identifisert</p>
                                            <p className="text-[11px] text-[#C44536]/80 mt-0.5">Gjennomfør strukturert voldsrisikovurdering.</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="form-label">Detaljer om voldsrisiko</label>
                                        <textarea
                                            value={formData.voldsrisikoDetaljer}
                                            onChange={(e) => updateField('voldsrisikoDetaljer', e.target.value)}
                                            className="input-field !text-sm min-h-[60px] resize-y"
                                            placeholder="Beskriv voldsrisiko og kontekst..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Section 9: Sosial situasjon og familiehistorikk */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">9. Sosial situasjon og familiehistorikk</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Boforhold, arbeid og familiær belastning</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Bosituasjon</label>
                                    <select
                                        value={formData.bosituasjon}
                                        onChange={(e) => updateField('bosituasjon', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="alene">Alene</option>
                                        <option value="med_partner">Med partner</option>
                                        <option value="med_familie">Med familie</option>
                                        <option value="kollektiv">Kollektiv</option>
                                        <option value="institusjon">Institusjon</option>
                                        <option value="annet">Annet</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Arbeidssituasjon</label>
                                    <select
                                        value={formData.arbeidssituasjon}
                                        onChange={(e) => updateField('arbeidssituasjon', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="fulltidsarbeid">Fulltidsarbeid</option>
                                        <option value="deltidsarbeid">Deltidsarbeid</option>
                                        <option value="sykemeldt">Sykemeldt</option>
                                        <option value="arbeidsledig">Arbeidsledig</option>
                                        <option value="student">Student</option>
                                        <option value="pensjonert">Pensjonert</option>
                                        <option value="uforetrygdet">Uføretrygdet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="form-label">Sivilstatus</label>
                                    <select
                                        value={formData.sivilstatus}
                                        onChange={(e) => updateField('sivilstatus', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="enslig">Enslig</option>
                                        <option value="samboer">Samboer</option>
                                        <option value="gift">Gift</option>
                                        <option value="separert">Separert</option>
                                        <option value="skilt">Skilt</option>
                                        <option value="enke_enkemann">Enke/enkemann</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Barn</label>
                                    <input
                                        type="text"
                                        value={formData.barn}
                                        onChange={(e) => updateField('barn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Antall barn"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Psykiatrisk sykdom i familien</label>
                                <textarea
                                    value={formData.familiePsykiatri}
                                    onChange={(e) => updateField('familiePsykiatri', e.target.value)}
                                    className="input-field !text-sm min-h-[60px] resize-y"
                                    placeholder="Kjent psykiatrisk sykdom i familien..."
                                />
                            </div>
                        </div>

                        {/* Section 10: Foreløpig vurdering */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <ClipboardList className="w-4 h-4 text-[#4F5ABF]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">10. Foreløpig vurdering</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Diagnose, funksjonsvurdering og behandlingsplan</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Foreløpig diagnose</label>
                                    <input
                                        type="text"
                                        value={formData.forelopigDiagnose}
                                        onChange={(e) => updateField('forelopigDiagnose', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Foreløpig diagnose"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Diagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="Diagnosekode"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Funksjonsvurdering</label>
                                <textarea
                                    value={formData.funksjonsvurdering}
                                    onChange={(e) => updateField('funksjonsvurdering', e.target.value)}
                                    className="input-field !text-sm min-h-[80px] resize-y"
                                    placeholder="Vurdering av funksjonsnivå..."
                                />
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Anbefalte behandlinger</label>
                                <div className="space-y-2 mt-2">
                                    {[
                                        'Individualterapi',
                                        'Gruppeterapi',
                                        'Medikamentell behandling',
                                        'Dagbehandling',
                                        'Innleggelse',
                                        'Annen',
                                    ].map((behandling) => (
                                        <label
                                            key={behandling}
                                            className={cn(
                                                "flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all",
                                                formData.anbefalteBehandlinger.includes(behandling)
                                                    ? "border-[#4F5ABF] bg-[#EDE9FE]/30"
                                                    : "border-[#DDD7CE] hover:border-[#4F5ABF]/30"
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.anbefalteBehandlinger.includes(behandling)}
                                                onChange={() => toggleBehandling(behandling)}
                                                className="w-5 h-5 rounded border-[#CBD2D9] text-[#4F5ABF] focus:ring-[#4F5ABF]"
                                            />
                                            <span className="text-sm font-medium text-[#1E1914]">{behandling}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="form-label">Oppfølgingsplan</label>
                                <textarea
                                    value={formData.oppfolgingsplan}
                                    onChange={(e) => updateField('oppfolgingsplan', e.target.value)}
                                    className="input-field !text-sm min-h-[80px] resize-y"
                                    placeholder="Plan for oppfølging..."
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
                                <button onClick={handleSubmit} disabled={submitting || !!fnrError} className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                    {submitting ? 'Lagrer...' : 'Lagre inntaksnotat'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
