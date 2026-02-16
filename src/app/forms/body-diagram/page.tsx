'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Download, Shield, User, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useFormSubmission } from '@/hooks/useFormSubmission';

interface PainPoint {
    zone: string;
    label: string;
    intensity: number; // 0-10 NPRS
    type: string;
    notes: string;
}

const BODY_ZONES = [
    // Front body zones
    { id: 'head', label: 'Hode', cx: 150, cy: 35, side: 'front' },
    { id: 'neck', label: 'Nakke', cx: 150, cy: 65, side: 'front' },
    { id: 'r-shoulder', label: 'Høyre skulder', cx: 110, cy: 90, side: 'front' },
    { id: 'l-shoulder', label: 'Venstre skulder', cx: 190, cy: 90, side: 'front' },
    { id: 'chest', label: 'Bryst', cx: 150, cy: 115, side: 'front' },
    { id: 'r-arm-upper', label: 'Høyre overarm', cx: 90, cy: 130, side: 'front' },
    { id: 'l-arm-upper', label: 'Venstre overarm', cx: 210, cy: 130, side: 'front' },
    { id: 'abdomen', label: 'Mage', cx: 150, cy: 155, side: 'front' },
    { id: 'r-elbow', label: 'Høyre albue', cx: 80, cy: 160, side: 'front' },
    { id: 'l-elbow', label: 'Venstre albue', cx: 220, cy: 160, side: 'front' },
    { id: 'r-forearm', label: 'Høyre underarm', cx: 75, cy: 185, side: 'front' },
    { id: 'l-forearm', label: 'Venstre underarm', cx: 225, cy: 185, side: 'front' },
    { id: 'r-hip', label: 'Høyre hofte', cx: 125, cy: 195, side: 'front' },
    { id: 'l-hip', label: 'Venstre hofte', cx: 175, cy: 195, side: 'front' },
    { id: 'r-hand', label: 'Høyre hånd', cx: 65, cy: 220, side: 'front' },
    { id: 'l-hand', label: 'Venstre hånd', cx: 235, cy: 220, side: 'front' },
    { id: 'r-thigh', label: 'Høyre lår', cx: 130, cy: 240, side: 'front' },
    { id: 'l-thigh', label: 'Venstre lår', cx: 170, cy: 240, side: 'front' },
    { id: 'r-knee', label: 'Høyre kne', cx: 130, cy: 280, side: 'front' },
    { id: 'l-knee', label: 'Venstre kne', cx: 170, cy: 280, side: 'front' },
    { id: 'r-shin', label: 'Høyre legg', cx: 130, cy: 315, side: 'front' },
    { id: 'l-shin', label: 'Venstre legg', cx: 170, cy: 315, side: 'front' },
    { id: 'r-ankle', label: 'Høyre ankel', cx: 130, cy: 350, side: 'front' },
    { id: 'l-ankle', label: 'Venstre ankel', cx: 170, cy: 350, side: 'front' },
    // Back body zones
    { id: 'upper-back', label: 'Øvre rygg', cx: 150, cy: 100, side: 'back' },
    { id: 'mid-back', label: 'Midtre rygg', cx: 150, cy: 135, side: 'back' },
    { id: 'lower-back', label: 'Korsrygg', cx: 150, cy: 170, side: 'back' },
    { id: 'sacrum', label: 'Bekken/Sacrum', cx: 150, cy: 200, side: 'back' },
    { id: 'r-glute', label: 'Høyre sete', cx: 130, cy: 215, side: 'back' },
    { id: 'l-glute', label: 'Venstre sete', cx: 170, cy: 215, side: 'back' },
    { id: 'r-hamstring', label: 'Høyre bakside lår', cx: 130, cy: 250, side: 'back' },
    { id: 'l-hamstring', label: 'Venstre bakside lår', cx: 170, cy: 250, side: 'back' },
    { id: 'r-calf', label: 'Høyre legg (bak)', cx: 130, cy: 310, side: 'back' },
    { id: 'l-calf', label: 'Venstre legg (bak)', cx: 170, cy: 310, side: 'back' },
];

const PAIN_TYPES = [
    'Skarp/stikkende',
    'Dump/verkende',
    'Brennende',
    'Strålende',
    'Pressende',
    'Krampeaktig',
    'Stivhet',
    'Nummenhet/kribling',
];

export default function BodyDiagram() {
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'body-diagram' });
    const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
    const [newIntensity, setNewIntensity] = useState(5);
    const [newType, setNewType] = useState(PAIN_TYPES[0]);
    const [newNotes, setNewNotes] = useState('');

    const activeZones = BODY_ZONES.filter(z => z.side === activeSide);
    const selectedZoneInfo = BODY_ZONES.find(z => z.id === selectedZone);
    const existingPoint = painPoints.find(p => p.zone === selectedZone);

    const addPainPoint = () => {
        if (!selectedZone) return;
        const zone = BODY_ZONES.find(z => z.id === selectedZone);
        if (!zone) return;

        const newPoint: PainPoint = {
            zone: selectedZone,
            label: zone.label,
            intensity: newIntensity,
            type: newType,
            notes: newNotes,
        };

        setPainPoints(prev => [...prev.filter(p => p.zone !== selectedZone), newPoint]);
        setNewNotes('');
    };

    const removePainPoint = (zone: string) => {
        setPainPoints(prev => prev.filter(p => p.zone !== zone));
        if (selectedZone === zone) setSelectedZone(null);
    };

    const getIntensityColor = (intensity: number) => {
        if (intensity <= 3) return 'var(--success)';
        if (intensity <= 6) return 'var(--warning)';
        return 'var(--error)';
    };

    const getIntensityHex = (intensity: number) => {
        if (intensity <= 3) return '#059669';
        if (intensity <= 6) return '#D97706';
        return '#EF4444';
    };

    const getAllFormData = () => ({ painPoints });

    const handleSave = () => {
        saveAsDraft(getAllFormData());
    };

    const handleExportPdf = () => {
        exportPdf(getAllFormData(), 'Smertekart / Kroppskart', 'Kliniker');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 glass-header border-b border-[var(--glass-border)]">
                <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Link href="/forms" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Tilbake til skjemaer</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button onClick={handleSave} disabled={saving} className="glass-btn-ghost text-xs flex items-center gap-1.5 !py-2 cursor-pointer">
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre'}
                        </button>
                        <button onClick={handleExportPdf} className="glass-btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5 cursor-pointer">
                            <Download className="w-3.5 h-3.5" /> Eksporter
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                        Smertekart / Kroppskart
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">Klikk på kroppen for å markere smerteområder (NPRS 0-10)</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Body Diagram SVG */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6">
                            {/* Front/Back toggle */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <button
                                    onClick={() => setActiveSide('front')}
                                    className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer", activeSide === 'front' ? "bg-[var(--primary)] text-white" : "bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)]")}
                                >
                                    Foran
                                </button>
                                <button
                                    onClick={() => setActiveSide('back')}
                                    className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer", activeSide === 'back' ? "bg-[var(--primary)] text-white" : "bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)]")}
                                >
                                    Bak
                                </button>
                            </div>

                            <div className="flex justify-center">
                                <svg viewBox="0 0 300 380" className="w-full max-w-[400px]" style={{ maxHeight: '500px' }}>
                                    {/* Body outline */}
                                    <g stroke="var(--glass-border)" strokeWidth="1.5" fill="none">
                                        {/* Head */}
                                        <ellipse cx="150" cy="35" rx="22" ry="28" />
                                        {/* Neck */}
                                        <rect x="140" y="57" width="20" height="15" rx="4" />
                                        {/* Torso */}
                                        <path d="M110 72 Q100 80 100 100 L100 190 Q100 200 120 200 L180 200 Q200 200 200 190 L200 100 Q200 80 190 72 Z" />
                                        {/* Left Arm */}
                                        <path d="M100 80 Q80 85 75 100 L65 170 Q60 185 55 200 L50 220 Q48 228 55 230 L70 225 Q75 220 78 200 L90 150 Q95 120 100 100" />
                                        {/* Right Arm */}
                                        <path d="M200 80 Q220 85 225 100 L235 170 Q240 185 245 200 L250 220 Q252 228 245 230 L230 225 Q225 220 222 200 L210 150 Q205 120 200 100" />
                                        {/* Left Leg */}
                                        <path d="M120 200 L115 250 L112 290 Q110 310 112 330 L115 355 Q116 365 125 365 L135 365 Q140 365 140 358 L138 340 L135 300 L140 260 L150 200" />
                                        {/* Right Leg */}
                                        <path d="M180 200 L185 250 L188 290 Q190 310 188 330 L185 355 Q184 365 175 365 L165 365 Q160 365 160 358 L162 340 L165 300 L160 260 L150 200" />
                                    </g>

                                    {/* Clickable zones */}
                                    {activeZones.map((zone) => {
                                        const point = painPoints.find(p => p.zone === zone.id);
                                        const isSelected = selectedZone === zone.id;
                                        return (
                                            <g key={zone.id} onClick={() => setSelectedZone(zone.id)} className="cursor-pointer">
                                                <circle
                                                    cx={zone.cx}
                                                    cy={zone.cy}
                                                    r={point ? 12 : 10}
                                                    fill={point ? getIntensityHex(point.intensity) + '30' : isSelected ? 'var(--primary-subtle)' : 'transparent'}
                                                    stroke={point ? getIntensityHex(point.intensity) : isSelected ? 'var(--primary)' : 'transparent'}
                                                    strokeWidth={point ? 2.5 : isSelected ? 2 : 0}
                                                    className="transition-all hover:fill-[var(--primary-subtle)] hover:stroke-[var(--primary)] hover:stroke-2"
                                                />
                                                {point && (
                                                    <text x={zone.cx} y={zone.cy + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill={getIntensityHex(point.intensity)}>
                                                        {point.intensity}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* Intensity legend */}
                            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[var(--text-secondary)]">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[var(--success)]" /> Mild (1-3)</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[var(--warning)]" /> Moderat (4-6)</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[var(--error)]" /> Alvorlig (7-10)</span>
                            </div>
                        </div>
                    </div>

                    {/* Pain Details Panel */}
                    <div className="space-y-4">
                        {/* Add/Edit Pain Point */}
                        {selectedZone && selectedZoneInfo && (
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
                                    {selectedZoneInfo.label}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="form-label">Smerteintensitet (NPRS)</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                value={existingPoint?.intensity ?? newIntensity}
                                                onChange={(e) => setNewIntensity(parseInt(e.target.value))}
                                                className="flex-1"
                                            />
                                            <span className="score-indicator" style={{ backgroundColor: getIntensityHex(existingPoint?.intensity ?? newIntensity) + '20', color: getIntensityColor(existingPoint?.intensity ?? newIntensity) }}>
                                                {existingPoint?.intensity ?? newIntensity}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                                            <span>Ingen smerte</span>
                                            <span>Verst tenkelig</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">Smertetype</label>
                                        <select
                                            value={existingPoint?.type ?? newType}
                                            onChange={(e) => setNewType(e.target.value)}
                                            className="input-field !text-sm"
                                        >
                                            {PAIN_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="form-label">Notater</label>
                                        <textarea
                                            value={existingPoint?.notes ?? newNotes}
                                            onChange={(e) => setNewNotes(e.target.value)}
                                            className="input-field !text-sm min-h-[60px] resize-y"
                                            placeholder="Provoserbart, bevegelsesrelatert, etc..."
                                        />
                                    </div>

                                    <button onClick={addPainPoint} className="glass-btn-primary w-full text-sm !py-2.5 cursor-pointer">
                                        {existingPoint ? 'Oppdater' : 'Legg til'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pain Points List */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                                Registrerte smerteområder ({painPoints.length})
                            </h3>

                            {painPoints.length === 0 ? (
                                <p className="text-sm text-[var(--text-muted)] text-center py-4">
                                    Klikk på kroppen for å markere smerteområder
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {painPoints.map((point) => (
                                        <div
                                            key={point.zone}
                                            onClick={() => setSelectedZone(point.zone)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                selectedZone === point.zone ? "border-[var(--primary)] bg-[var(--primary-subtle)]" : "border-[var(--glass-border)] hover:border-[var(--primary)]/30"
                                            )}
                                        >
                                            <span className="score-indicator !w-8 !h-8 !text-xs" style={{ backgroundColor: getIntensityHex(point.intensity) + '20', color: getIntensityColor(point.intensity) }}>
                                                {point.intensity}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{point.label}</p>
                                                <p className="text-[11px] text-[var(--text-secondary)]">{point.type}</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removePainPoint(point.zone); }}
                                                className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
