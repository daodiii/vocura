'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Download, Shield, CheckCircle, AlertTriangle, Info, Brain, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useFormSubmission } from '@/hooks/useFormSubmission';

const PHQ9_QUESTIONS = [
    'Lite interesse for eller glede ved å gjøre ting',
    'Følt deg nedfor, deprimert eller håpløs',
    'Problemer med å sovne, sove hele natten eller sove for mye',
    'Følt deg trøtt eller hatt lite energi',
    'Dårlig appetitt eller spist for mye',
    'Følt deg negativt om deg selv – eller følt at du er mislykket, eller har sviktet deg selv eller familien din',
    'Problemer med å konsentrere deg, for eksempel om å lese avisen eller se TV',
    'Beveget deg eller snakket så langsomt at andre kan ha lagt merke til det? Eller motsatt – vært urolig og rastløs',
    'Tanker om at det ville vært bedre om du var død, eller om å skade deg selv på noen måte',
];

const RESPONSE_OPTIONS = [
    { value: 0, label: 'Ikke i det hele tatt' },
    { value: 1, label: 'Noen dager' },
    { value: 2, label: 'Mer enn halvparten av dagene' },
    { value: 3, label: 'Nesten hver dag' },
];

const DIFFICULTY_OPTIONS = [
    'Ikke vanskelig i det hele tatt',
    'Noe vanskelig',
    'Svært vanskelig',
    'Ekstremt vanskelig',
];

function getScoreInterpretation(score: number) {
    if (score <= 4) return { label: 'Minimal depresjon', color: '#10B981', bg: 'rgba(16,185,129,0.10)', recommendation: 'Ingen behandling nødvendig. Oppfølging ved behov.' };
    if (score <= 9) return { label: 'Mild depresjon', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', recommendation: 'Vurder oppfølgingssamtale. Gjenoppta PHQ-9 om 2-4 uker.' };
    if (score <= 14) return { label: 'Moderat depresjon', color: '#F97316', bg: 'rgba(249,115,22,0.10)', recommendation: 'Vurder behandlingsplan med samtaleterapi og/eller medikasjon.' };
    if (score <= 19) return { label: 'Moderat-alvorlig depresjon', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.10)', recommendation: 'Aktiv behandling med psykoterapi og/eller medikamenter anbefalt.' };
    return { label: 'Alvorlig depresjon', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', recommendation: 'Umiddelbar behandling nødvendig. Vurder henvisning til spesialist.' };
}

export default function PHQ9Assessment() {
    const { saving, saved, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'phq9' });
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(9).fill(null));
    const [difficulty, setDifficulty] = useState('');
    const [patientNavn, setPatientNavn] = useState('');
    const [patientId, setPatientId] = useState('');
    const [showResults, setShowResults] = useState(false);

    const setAnswer = (questionIndex: number, value: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = value;
        setAnswers(newAnswers);
    };

    const handleRadioKeyDown = useCallback((e: React.KeyboardEvent, questionIndex: number, currentValue: number) => {
        let newValue: number | null = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newValue = Math.min(currentValue + 1, 3);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newValue = Math.max(currentValue - 1, 0);
        } else if (e.key === 'Home') {
            e.preventDefault();
            newValue = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            newValue = 3;
        }
        if (newValue !== null) {
            setAnswer(questionIndex, newValue);
            // Move focus to the newly selected radio button
            const container = (e.target as HTMLElement).closest('[role="radiogroup"]');
            if (container) {
                const buttons = container.querySelectorAll<HTMLElement>('[role="radio"]');
                buttons[newValue]?.focus();
            }
        }
    }, []);

    const totalScore = answers.reduce((sum: number, a) => sum + (a ?? 0), 0);
    const allAnswered = answers.every(a => a !== null);
    const interpretation = getScoreInterpretation(totalScore);
    const question9Score = answers[8] ?? 0;

    return (
        <div className="min-h-screen bg-[var(--surface-deep)]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[var(--surface-primary)]/80 border-b border-[rgba(255,255,255,0.06)]">
                <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Breadcrumbs items={[
                        { label: 'Hjem', href: '/dashboard' },
                        { label: 'Skjemaer', href: '/forms' },
                        { label: 'PHQ-9' },
                    ]} />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => saveAsDraft({ answers, difficulty, patientNavn, patientId, totalScore, interpretation: getScoreInterpretation(totalScore).label }, totalScore)}
                            disabled={saving}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-1.5 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre i journal'}
                        </button>
                        <button
                            onClick={() => exportPdf({ answers, difficulty, patientNavn, patientId, totalScore, interpretation: getScoreInterpretation(totalScore).label }, 'PHQ-9 Depresjonsskala', 'Behandler')}
                            className="border border-[rgba(255,255,255,0.06)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                    </div>
                </div>
            </div>

            <main id="main-content" className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[rgba(94,106,210,0.08)] rounded-xl flex items-center justify-center">
                            <Brain className="w-5 h-5 text-[#7B89DB]" />
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(94,106,210,0.1)] text-[#7B89DB]">Standardisert verktøy</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        PHQ-9 Depresjonsskala
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">Patient Health Questionnaire - Vurdering av depresjonsgrad</p>
                </div>

                {/* Patient Info */}
                <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phq9-pasientnavn" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Pasientnavn</label>
                            <input
                                id="phq9-pasientnavn"
                                type="text"
                                value={patientNavn}
                                onChange={(e) => setPatientNavn(e.target.value)}
                                className="w-full bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] text-sm px-3 py-2"
                                placeholder="Fornavn Etternavn"
                            />
                        </div>
                        <div>
                            <label htmlFor="phq9-pasientid" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Pasient-ID</label>
                            <input
                                id="phq9-pasientid"
                                type="text"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className="w-full bg-[var(--surface-hover)] border border-[rgba(255,255,255,0.06)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[#5E6AD2] placeholder:text-[var(--text-muted)] text-sm font-mono px-3 py-2"
                                placeholder="P-2024-0000"
                            />
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-[rgba(94,106,210,0.08)] border border-[rgba(94,106,210,0.15)] rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#7B89DB] shrink-0 mt-0.5" />
                        <p className="text-sm text-[var(--text-secondary)]">
                            <strong>Instruksjon:</strong> I løpet av de siste 2 ukene, hvor ofte har du vært plaget av noen av de følgende problemene?
                        </p>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-4 mb-6">
                    {PHQ9_QUESTIONS.map((question, index) => (
                        <div key={index} className={cn(
                            "bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5",
                            index === 8 && question9Score >= 1 && "!border-[#EF4444] !bg-[rgba(239,68,68,0.08)]"
                        )}>
                            <div className="flex items-start gap-3 mb-4">
                                <span className="w-7 h-7 bg-[rgba(255,255,255,0.03)] rounded-lg flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] shrink-0">
                                    {index + 1}
                                </span>
                                <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed pt-1">{question}</p>
                            </div>

                            <div className="grid grid-cols-4 gap-2 ml-10" role="radiogroup" aria-label={`Spørsmål ${index + 1}: ${question}`}>
                                {RESPONSE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        role="radio"
                                        aria-checked={answers[index] === option.value}
                                        aria-label={`${option.value} - ${option.label}`}
                                        tabIndex={answers[index] === option.value || (answers[index] === null && option.value === 0) ? 0 : -1}
                                        onClick={() => setAnswer(index, option.value)}
                                        onKeyDown={(e) => handleRadioKeyDown(e, index, option.value)}
                                        className={cn(
                                            "p-2.5 rounded-lg border-2 text-center transition-all text-xs font-medium cursor-pointer",
                                            answers[index] === option.value
                                                ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)] text-[var(--text-primary)]"
                                                : "border-[rgba(255,255,255,0.06)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[rgba(94,106,210,0.3)]"
                                        )}
                                    >
                                        <span className="text-lg font-bold block mb-0.5">{option.value}</span>
                                        <span className="leading-tight block">{option.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Suicide risk flag on question 9 */}
                            {index === 8 && question9Score >= 1 && (
                                <div className="ml-10 mt-3 p-3 bg-[rgba(239,68,68,0.08)] rounded-lg border border-[rgba(239,68,68,0.3)] flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-[#EF4444]">Selvskading/selvmordsrisiko identifisert</p>
                                        <p className="text-[11px] text-[#EF4444] opacity-80 mt-0.5">Gjennomfør strukturert suicidalvurdering. Vurder sikkerhetstiltak umiddelbart.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Difficulty question */}
                <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 mb-6">
                    <p className="text-sm text-[var(--text-primary)] font-medium mb-3">
                        Hvor vanskelig har disse problemene gjort det å utføre arbeidet ditt, ta deg av ting hjemme eller komme overens med andre?
                    </p>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Vanskelighetsgrad">
                        {DIFFICULTY_OPTIONS.map((option, idx) => (
                            <button
                                key={option}
                                role="radio"
                                aria-checked={difficulty === option}
                                tabIndex={difficulty === option || (difficulty === '' && idx === 0) ? 0 : -1}
                                onClick={() => setDifficulty(option)}
                                onKeyDown={(e) => {
                                    let newIdx: number | null = null;
                                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        newIdx = Math.min(idx + 1, DIFFICULTY_OPTIONS.length - 1);
                                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                        e.preventDefault();
                                        newIdx = Math.max(idx - 1, 0);
                                    }
                                    if (newIdx !== null) {
                                        setDifficulty(DIFFICULTY_OPTIONS[newIdx]);
                                        const container = (e.target as HTMLElement).closest('[role="radiogroup"]');
                                        if (container) {
                                            const buttons = container.querySelectorAll<HTMLElement>('[role="radio"]');
                                            buttons[newIdx]?.focus();
                                        }
                                    }
                                }}
                                className={cn(
                                    "p-3 rounded-lg border-2 text-center transition-all text-xs font-medium cursor-pointer",
                                    difficulty === option
                                        ? "border-[#5E6AD2] bg-[rgba(94,106,210,0.08)] text-[var(--text-primary)]"
                                        : "border-[rgba(255,255,255,0.06)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[rgba(94,106,210,0.3)]"
                                )}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Running Score */}
                <div className="bg-[var(--surface-elevated)] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Resultat</h3>
                        {!allAnswered && (
                            <span className="text-xs text-[var(--text-muted)]">{answers.filter(a => a !== null).length}/9 besvart</span>
                        )}
                    </div>

                    {/* Score bar */}
                    <div className="mb-4">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-4xl font-bold" style={{ color: interpretation.color }}>
                                {totalScore}
                            </span>
                            <span className="text-sm text-[var(--text-secondary)]">av 27 mulige</span>
                        </div>
                        <div className="h-3 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${(totalScore / 27) * 100}%`, backgroundColor: interpretation.color }}
                            />
                        </div>
                        {/* Scale markers */}
                        <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)]">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                            <span>15</span>
                            <span>20</span>
                            <span>27</span>
                        </div>
                    </div>

                    {/* Interpretation */}
                    <div className="p-4 rounded-lg" style={{ backgroundColor: interpretation.bg }}>
                        <p className="text-sm font-bold mb-1" style={{ color: interpretation.color }}>
                            {interpretation.label} (PHQ-9: {totalScore})
                        </p>
                        <p className="text-xs opacity-80" style={{ color: interpretation.color }}>
                            {interpretation.recommendation}
                        </p>
                    </div>

                    {/* Severity scale reference */}
                    <div className="grid grid-cols-5 gap-1 mt-4">
                        {[
                            { label: 'Minimal', range: '0-4', color: '#10B981' },
                            { label: 'Mild', range: '5-9', color: '#F59E0B' },
                            { label: 'Moderat', range: '10-14', color: '#F97316' },
                            { label: 'Mod.-alv.', range: '15-19', color: '#EA580C' },
                            { label: 'Alvorlig', range: '20-27', color: '#EF4444' },
                        ].map((level) => (
                            <div key={level.label} className="text-center">
                                <div className="h-2 rounded-full mb-1" style={{ backgroundColor: level.color }} />
                                <span className="text-[10px] text-[var(--text-secondary)] block">{level.label}</span>
                                <span className="text-[10px] text-[var(--text-muted)] block">{level.range}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2 text-[#10B981]">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs font-semibold">GDPR-kompatibel</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        Dato: {new Date().toLocaleDateString('nb-NO')}
                    </div>
                </div>
            </main>
        </div>
    );
}
