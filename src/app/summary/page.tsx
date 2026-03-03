'use client';

import React, { useState } from 'react';
import { Send, Copy, Check, FileText, User, Sparkles, Shield, RefreshCw, Languages } from 'lucide-react';
import { cn, fetchWithTimeout } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';

export default function PatientSummary() {
    const [clinicalNote, setClinicalNote] = useState('');
    const [patientSummary, setPatientSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [language, setLanguage] = useState<'bokmal' | 'nynorsk' | 'enkel'>('bokmal');

    const generateSummary = async () => {
        setIsGenerating(true);
        try {
            const res = await fetchWithTimeout('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: clinicalNote,
                    language,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setPatientSummary(data.summary);
            } else {
                if (res.status === 401) {
                    alert('Økten din har utløpt. Logg inn på nytt og prøv igjen.');
                } else if (res.status === 429) {
                    alert('Du har sendt for mange forespørsler. Vent et minutt og prøv igjen.');
                } else {
                    const data = await res.json().catch(() => ({}));
                    alert(data.error || 'Kunne ikke generere pasientoppsummering. Prøv igjen eller forenkle notatteksten.');
                }
            }
        } catch (err) {
            console.error('Summary generation failed:', err);
            alert('Kunne ikke nå oppsummeringstjenesten. Sjekk internettforbindelsen din og prøv igjen.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(patientSummary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    return (
        <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
            <AppSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="mb-8 animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(94,106,210,0.08)]">
                                <Sparkles className="w-5 h-5 text-[#5E6AD2]" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white">
                            Pasientoppsummering
                        </h1>
                        <p className="mt-1 text-white">Generer en forståelig oppsummering for pasienten basert på konsultasjonsnotatet</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 animate-slide-up stagger-1">
                        {/* Clinical Note Input */}
                        <div>
                            <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 !mb-0 h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-4 h-4 text-[#5E6AD2]" />
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Klinisk notat</h2>
                                </div>
                                <textarea
                                    value={clinicalNote}
                                    onChange={(e) => setClinicalNote(e.target.value)}
                                    className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-white focus:outline-none focus:border-[#5E6AD2] placeholder:text-white text-sm min-h-[300px] resize-y flex-1 p-3 w-full"
                                    placeholder="Lim inn eller skriv det kliniske notatet her..."
                                />

                                <div className="mt-4 space-y-3">
                                    {/* Language selection */}
                                    <div>
                                        <label className="form-label flex items-center gap-2">
                                            <Languages className="w-3.5 h-3.5" />
                                            Språknivå
                                        </label>
                                        <div className="flex items-center gap-1 bg-[#191919] p-1 rounded-lg">
                                            {[
                                                { id: 'bokmal' as const, label: 'Bokmål' },
                                                { id: 'nynorsk' as const, label: 'Nynorsk' },
                                                { id: 'enkel' as const, label: 'Enkelt språk' },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setLanguage(opt.id)}
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer",
                                                        language === opt.id
                                                            ? "bg-[#5E6AD2] text-white"
                                                            : "text-white hover:text-white"
                                                    )}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={generateSummary}
                                        disabled={clinicalNote.trim().length < 10 || isGenerating}
                                        className={cn(
                                            "w-full py-3 text-sm flex items-center justify-center gap-2 cursor-pointer rounded-lg font-medium transition-colors duration-150",
                                            isGenerating || clinicalNote.trim().length < 10
                                                ? "border border-[rgba(255,255,255,0.06)] text-white opacity-50 cursor-not-allowed"
                                                : "bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white"
                                        )}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Genererer oppsummering...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Generer pasientoppsummering
                                            </>
                                        )}
                                    </button>
                                    {clinicalNote.trim().length > 0 && clinicalNote.trim().length < 10 && (
                                        <p className="text-xs text-[#F59E0B] mt-1">Skriv minst 10 tegn for å generere sammendrag</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Generated Patient Summary */}
                        <div>
                            <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6 !mb-0 h-full flex flex-col" aria-live="polite">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-[#10B981]" />
                                        <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Pasientversjon</h2>
                                    </div>
                                    {patientSummary && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleCopy}
                                                className="text-white hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-1.5 transition-colors duration-150 text-xs flex items-center gap-1 cursor-pointer"
                                            >
                                                {copied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                                {copied ? 'Kopiert!' : 'Kopier'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {patientSummary ? (
                                    <div className="flex-1">
                                        <div className="p-5 rounded-xl min-h-[300px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                                            <pre className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                                                {patientSummary}
                                            </pre>
                                        </div>

                                        {/* Send options */}
                                        <div className="mt-4 space-y-3">
                                            <button
                                                disabled
                                                className="w-full py-3 text-sm flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.06)] text-white rounded-lg opacity-50 cursor-not-allowed font-medium transition-colors duration-150"
                                                title="Denne funksjonen er under utvikling og krever HL7/FHIR-integrasjon"
                                            >
                                                <Send className="w-4 h-4" />
                                                Send til Helsenorge
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[rgba(245,158,11,0.1)] text-[#F59E0B] ml-1">Kommer snart</span>
                                            </button>

                                            <p className="text-[11px] text-center flex items-center justify-center gap-1 text-white">
                                                <Shield className="w-3 h-3" />
                                                Oppsummeringen gjennomgås av behandler før sending
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center min-h-[300px]">
                                        <div className="text-center">
                                            <Sparkles className="w-10 h-10 mx-auto mb-3 text-white" />
                                            <p className="text-sm text-white">
                                                Klikk &ldquo;Generer&rdquo; for å lage en<br />pasientvennlig oppsummering
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
