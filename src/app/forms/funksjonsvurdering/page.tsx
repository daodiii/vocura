'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Activity, AlertCircle, Info, Target, Users, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useFormSubmission } from '@/hooks/useFormSubmission';

const ICF_SCALE = [
    { value: 0, label: 'Ingen problem' },
    { value: 1, label: 'Lett problem' },
    { value: 2, label: 'Moderat problem' },
    { value: 3, label: 'Alvorlig problem' },
    { value: 4, label: 'Totalt problem' },
];

const BODY_FUNCTIONS = [
    'Smerte',
    'Leddbevegelighet (ROM)',
    'Muskelstyrke',
    'Sensibilitet',
    'Utholdenhet',
    'Balanse',
    'Koordinasjon',
];

const ACTIVITY_ITEMS = [
    'Gangfunksjon',
    'Trappegang',
    'Reise seg / sette seg',
    'Personlig stell',
    'L\u00f8fte og b\u00e6re',
    'Rekke og gripe',
    'Kommunikasjon',
];

const PARTICIPATION_ITEMS = [
    'Arbeid / utdanning',
    'Sosiale aktiviteter',
    'Fritid / hobby',
    'Husarbeid',
    'Transport',
];

const getAverage = (scores: (number | null)[]) => {
    const valid = scores.filter(s => s !== null) as number[];
    if (valid.length === 0) return 0;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
};

const getScoreColor = (score: number) => {
    if (score < 1) return '#3D8B6E';
    if (score < 2) return '#0D9488';
    if (score < 3) return '#F59E0B';
    if (score < 4) return '#F97316';
    return '#C44536';
};

const getScoreLabel = (score: number) => {
    if (score < 1) return 'Ingen/minimal';
    if (score < 2) return 'Lett';
    if (score < 3) return 'Moderat';
    if (score < 4) return 'Alvorlig';
    return 'Totalt';
};

export default function FunksjonsvurderingICF() {
    const [formData, setFormData] = useState({
        patientNavn: '',
        patientFnr: '',
        vurderingsDato: '',
        diagnose: '',
        diagnoseKode: '',
    });
    const [bodyScores, setBodyScores] = useState<(number | null)[]>(new Array(7).fill(null));
    const [activityScores, setActivityScores] = useState<(number | null)[]>(new Array(7).fill(null));
    const [participationScores, setParticipationScores] = useState<(number | null)[]>(new Array(5).fill(null));
    const [miljoFasilitatorer, setMiljoFasilitatorer] = useState('');
    const [miljoBarrierer, setMiljoBarrierer] = useState('');
    const [personligeFaktorer, setPersonligeFaktorer] = useState('');
    const [maal, setMaal] = useState('');
    const [anbefalinger, setAnbefalinger] = useState('');
    const [nesteVurdering, setNesteVurdering] = useState('');

    const { saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'funksjonsvurdering' });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getAllFormData = () => ({
        ...formData,
        bodyScores,
        activityScores,
        participationScores,
        miljoFasilitatorer,
        miljoBarrierer,
        personligeFaktorer,
        maal,
        anbefalinger,
        nesteVurdering,
    });

    const handleSave = () => {
        saveAsDraft(getAllFormData());
    };

    const handleSubmit = () => {
        submitForm(getAllFormData());
    };

    const totalAvg = (() => {
        const avgs = [getAverage(bodyScores), getAverage(activityScores), getAverage(participationScores)];
        const nonZeroAvgs = avgs.filter((_, i) => {
            const scores = [bodyScores, activityScores, participationScores][i];
            return scores.some(s => s !== null);
        });
        if (nonZeroAvgs.length === 0) return 0;
        return nonZeroAvgs.reduce((a, b) => a + b, 0) / nonZeroAvgs.length;
    })();

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
                            onClick={() => exportPdf(getAllFormData(), 'Funksjonsvurdering (ICF)', 'Lege')}
                            className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                            {submitting ? 'Lagrer...' : 'Lagre funksjonsvurdering'}
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
                        Funksjonsvurdering (ICF)
                    </h1>
                    <p className="text-[#7D7267] mt-1">Funksjonsvurdering basert p&aring; WHO sitt ICF-rammeverk</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                            Funksjonsvurdering lagret
                        </h2>
                        <p className="text-[#7D7267] mb-6">ICF-vurderingen er lagret i pasientjournalen.</p>
                        {error && <p className="text-sm text-[#C44536] mb-4">{error}</p>}
                        <p className="text-sm font-mono text-[var(--medical-gray-400)] mb-8">Referanse: ICF-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
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

                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                            <div className="grid grid-cols-1 gap-4 mt-4">
                                <div>
                                    <label className="form-label form-required">Vurderingsdato</label>
                                    <input
                                        type="date"
                                        value={formData.vurderingsDato}
                                        onChange={(e) => updateField('vurderingsDato', e.target.value)}
                                        className="input-field !text-sm w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Diagnoseinformasjon */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Diagnoseinformasjon</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Hoveddiagnose og diagnosekode</p>

                            <div className="grid grid-cols-3 gap-4">
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
                        </div>

                        {/* Section 3: Kroppsfunksjoner */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Kroppsfunksjoner</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Vurder grad av funksjonsnedsettelse (ICF 0-4)</p>

                            <div className="space-y-4">
                                {BODY_FUNCTIONS.map((item, index) => (
                                    <div key={index} className="form-section !mb-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="w-7 h-7 bg-[#CCFBF1] rounded-lg flex items-center justify-center text-xs font-bold text-[#0D9488] shrink-0">{index + 1}</span>
                                            <p className="text-sm text-[#1E1914] font-medium pt-1">{item}</p>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 ml-10">
                                            {ICF_SCALE.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => { const n = [...bodyScores]; n[index] = option.value; setBodyScores(n); }}
                                                    className={cn(
                                                        "p-2 rounded-lg border-2 text-center transition-all text-xs font-medium",
                                                        bodyScores[index] === option.value
                                                            ? "border-[#0D9488] bg-[#CCFBF1] text-[#0D9488]"
                                                            : "border-[#DDD7CE] bg-[#FFFDF9] text-[#5E5549] hover:border-[#0D9488]/30"
                                                    )}
                                                >
                                                    <span className="text-lg font-bold block mb-0.5">{option.value}</span>
                                                    <span className="leading-tight block text-[10px]">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 4: Aktivitetsbegrensninger */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Aktivitetsbegrensninger</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Vurder grad av aktivitetsbegrensning (ICF 0-4)</p>

                            <div className="space-y-4">
                                {ACTIVITY_ITEMS.map((item, index) => (
                                    <div key={index} className="form-section !mb-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="w-7 h-7 bg-[#CCFBF1] rounded-lg flex items-center justify-center text-xs font-bold text-[#0D9488] shrink-0">{index + 1}</span>
                                            <p className="text-sm text-[#1E1914] font-medium pt-1">{item}</p>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 ml-10">
                                            {ICF_SCALE.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => { const n = [...activityScores]; n[index] = option.value; setActivityScores(n); }}
                                                    className={cn(
                                                        "p-2 rounded-lg border-2 text-center transition-all text-xs font-medium",
                                                        activityScores[index] === option.value
                                                            ? "border-[#0D9488] bg-[#CCFBF1] text-[#0D9488]"
                                                            : "border-[#DDD7CE] bg-[#FFFDF9] text-[#5E5549] hover:border-[#0D9488]/30"
                                                    )}
                                                >
                                                    <span className="text-lg font-bold block mb-0.5">{option.value}</span>
                                                    <span className="leading-tight block text-[10px]">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 5: Deltakelsesbegrensninger */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Deltakelsesbegrensninger</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Vurder grad av deltakelsesbegrensning (ICF 0-4)</p>

                            <div className="space-y-4">
                                {PARTICIPATION_ITEMS.map((item, index) => (
                                    <div key={index} className="form-section !mb-0">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="w-7 h-7 bg-[#CCFBF1] rounded-lg flex items-center justify-center text-xs font-bold text-[#0D9488] shrink-0">{index + 1}</span>
                                            <p className="text-sm text-[#1E1914] font-medium pt-1">{item}</p>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 ml-10">
                                            {ICF_SCALE.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => { const n = [...participationScores]; n[index] = option.value; setParticipationScores(n); }}
                                                    className={cn(
                                                        "p-2 rounded-lg border-2 text-center transition-all text-xs font-medium",
                                                        participationScores[index] === option.value
                                                            ? "border-[#0D9488] bg-[#CCFBF1] text-[#0D9488]"
                                                            : "border-[#DDD7CE] bg-[#FFFDF9] text-[#5E5549] hover:border-[#0D9488]/30"
                                                    )}
                                                >
                                                    <span className="text-lg font-bold block mb-0.5">{option.value}</span>
                                                    <span className="leading-tight block text-[10px]">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 6: Miljo- og personlige faktorer */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Milj&oslash;- og personlige faktorer</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Faktorer som p&aring;virker funksjon og deltagelse</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Milj&oslash;fasilitatorer</label>
                                    <textarea
                                        value={miljoFasilitatorer}
                                        onChange={(e) => setMiljoFasilitatorer(e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Faktorer i milj&oslash;et som fremmer funksjon..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Milj&oslash;barrierer</label>
                                    <textarea
                                        value={miljoBarrierer}
                                        onChange={(e) => setMiljoBarrierer(e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Faktorer i milj&oslash;et som hemmer funksjon..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Personlige faktorer</label>
                                    <textarea
                                        value={personligeFaktorer}
                                        onChange={(e) => setPersonligeFaktorer(e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Personlige faktorer som p&aring;virker funksjon..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 7: Oppsummering */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <BarChart3 className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Oppsummering</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Automatisk beregnet funksjonsprofil</p>

                            <div className="card-base p-6">
                                {[
                                    { name: 'Kroppsfunksjoner', scores: bodyScores },
                                    { name: 'Aktivitet', scores: activityScores },
                                    { name: 'Deltagelse', scores: participationScores },
                                ].map(cat => {
                                    const avg = getAverage(cat.scores);
                                    return (
                                        <div key={cat.name} className="flex items-center gap-4 py-3 border-b border-[#DDD7CE] last:border-0">
                                            <span className="text-sm font-medium text-[#1E1914] w-40">{cat.name}</span>
                                            <div className="flex-1 h-4 bg-[#F5F2ED] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${(avg / 4) * 100}%`, backgroundColor: getScoreColor(avg) }} />
                                            </div>
                                            <span className="text-sm font-bold w-20 text-right" style={{ color: getScoreColor(avg) }}>
                                                {avg.toFixed(1)} - {getScoreLabel(avg)}
                                            </span>
                                        </div>
                                    );
                                })}

                                {/* Total score */}
                                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: getScoreColor(totalAvg) + '15' }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[#1E1914]">Totalskala (gjennomsnitt)</span>
                                        <span className="text-2xl font-bold" style={{ color: getScoreColor(totalAvg), fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                                            {totalAvg.toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: getScoreColor(totalAvg) }}>
                                        {getScoreLabel(totalAvg)} funksjonsnedsettelse
                                    </p>
                                </div>

                                {/* ICF scale reference */}
                                <div className="grid grid-cols-5 gap-1 mt-4">
                                    {[
                                        { label: 'Ingen', range: '0', color: '#3D8B6E' },
                                        { label: 'Lett', range: '1', color: '#0D9488' },
                                        { label: 'Moderat', range: '2', color: '#F59E0B' },
                                        { label: 'Alvorlig', range: '3', color: '#F97316' },
                                        { label: 'Totalt', range: '4', color: '#C44536' },
                                    ].map(level => (
                                        <div key={level.label} className="text-center">
                                            <div className="h-2 rounded-full mb-1" style={{ backgroundColor: level.color }} />
                                            <span className="text-[10px] text-[#7D7267] block">{level.label}</span>
                                            <span className="text-[10px] text-[var(--medical-gray-400)] block">{level.range}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 8: Mal og anbefalinger */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-[#0D9488]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">8. M&aring;l og anbefalinger</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Behandlingsm&aring;l og videre anbefalinger</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Behandlingsm&aring;l</label>
                                    <textarea
                                        value={maal}
                                        onChange={(e) => setMaal(e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Behandlingsm&aring;l..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Anbefalinger</label>
                                    <textarea
                                        value={anbefalinger}
                                        onChange={(e) => setAnbefalinger(e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Anbefalinger for videre behandling..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Neste vurdering</label>
                                    <input
                                        type="date"
                                        value={nesteVurdering}
                                        onChange={(e) => setNesteVurdering(e.target.value)}
                                        className="input-field !text-sm w-64"
                                    />
                                </div>
                            </div>
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
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                                    {submitting ? 'Lagrer...' : 'Lagre funksjonsvurdering'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
