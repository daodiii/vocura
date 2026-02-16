'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Mic, Square, Loader2, FileText, Shield, ChevronRight, User, Zap, PenLine, Search, Calendar, Clock, TrendingUp, Keyboard, BookOpen, ClipboardList, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import Toast from '@/components/Toast';
import { useUserProfile } from '@/hooks/useUserProfile';

// Consent audit log types
interface ConsentLogEntry {
    action: 'granted' | 'withdrawn';
    timestamp: string;
    type: 'recording_consent';
}

function getConsentLog(): ConsentLogEntry[] {
    try {
        const log = localStorage.getItem('mediscribe_consent_log');
        return log ? JSON.parse(log) : [];
    } catch {
        return [];
    }
}

function addConsentLogEntry(action: 'granted' | 'withdrawn') {
    const log = getConsentLog();
    log.push({
        action,
        timestamp: new Date().toISOString(),
        type: 'recording_consent',
    });
    localStorage.setItem('mediscribe_consent_log', JSON.stringify(log));
}

function getLastConsentState(): boolean {
    const log = getConsentLog();
    if (log.length === 0) return false;
    return log[log.length - 1].action === 'granted';
}

export default function Dashboard() {
    const { profile } = useUserProfile();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);
    const [profession, setProfession] = useState('lege');
    const [patientId, setPatientId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [encounterType, setEncounterType] = useState('kontroll');
    const [recordingTime, setRecordingTime] = useState(0);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [stats, setStats] = useState({ todayRecordings: 0, todayMinutes: 0 });
    const [patientResults, setPatientResults] = useState<any[]>([]);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const patientSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const patientDropdownRef = useRef<HTMLDivElement | null>(null);
    const [waveformBars, setWaveformBars] = useState<number[]>(new Array(24).fill(4));
    const [showTranscriptToast, setShowTranscriptToast] = useState(false);

    // Persist GDPR consent with audit trail in localStorage
    useEffect(() => {
        const lastConsent = getLastConsentState();
        if (lastConsent) {
            setConsentGiven(true);
        }
    }, []);

    // Fetch real stats on mount
    useEffect(() => {
        async function fetchStats() {
            try {
                const recRes = await fetch('/api/recordings');
                if (recRes.ok) {
                    const recordings = await recRes.json();
                    const today = new Date().toDateString();
                    const todayRecs = recordings.filter((r: any) => new Date(r.createdAt).toDateString() === today);
                    const totalDuration = todayRecs.reduce((sum: number, r: any) => sum + (r.duration || 0), 0);
                    setStats({
                        todayRecordings: todayRecs.length,
                        todayMinutes: Math.round(totalDuration / 60),
                    });
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        }
        fetchStats();
    }, []);

    // Close patient dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
                setShowPatientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Patient search with debounce
    const searchPatients = useCallback(async (query: string) => {
        if (query.length < 2) {
            setPatientResults([]);
            setShowPatientDropdown(false);
            return;
        }
        try {
            const res = await fetch(`/api/patients?search=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setPatientResults(data);
                setShowPatientDropdown(true);
            }
        } catch {
            // Silently fail on search errors
        }
    }, []);

    const handlePatientNameChange = (value: string) => {
        setPatientName(value);
        if (patientSearchTimeoutRef.current) {
            clearTimeout(patientSearchTimeoutRef.current);
        }
        patientSearchTimeoutRef.current = setTimeout(() => {
            searchPatients(value);
        }, 300);
    };

    const selectPatient = (patient: any) => {
        setPatientId(patient.patientId || patient.id || '');
        setPatientName(patient.name || '');
        setShowPatientDropdown(false);
        setPatientResults([]);
    };

    const handleConsentChange = (checked: boolean) => {
        setConsentGiven(checked);
        addConsentLogEntry(checked ? 'granted' : 'withdrawn');
        // Also keep sessionStorage for backward compatibility
        sessionStorage.setItem('mediscribe_gdpr_consent', checked.toString());
    };

    // Delete all locally stored data (GDPR right to erasure)
    const handleDeleteAllData = () => {
        // Clear all MediScribe localStorage entries
        localStorage.removeItem('mediscribe_consent_log');
        localStorage.removeItem('mediscribe_dark_mode');
        // Clear sessionStorage
        sessionStorage.removeItem('mediscribe_gdpr_consent');
        // Reset state
        setConsentGiven(false);
        setTranscript('');
        setPatientId('');
        setPatientName('');
        setShowDeleteConfirm(false);
        // Reload to reset all in-memory state
        window.location.reload();
    };

    // Real waveform from audio analyser
    const updateWaveform = useCallback(() => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            const bars = [];
            const barCount = 24;
            const step = Math.floor(dataArray.length / barCount);
            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i * step];
                bars.push(Math.max(4, (value / 255) * 80));
            }
            setWaveformBars(bars);
        }
        animationRef.current = requestAnimationFrame(updateWaveform);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+R to start/stop recording
            if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
                e.preventDefault();
                if (isRecording) {
                    stopRecording();
                } else {
                    startRecording();
                }
            }
            // Ctrl+E to open editor (when transcript exists)
            if ((e.metaKey || e.ctrlKey) && e.key === 'e' && transcript) {
                e.preventDefault();
                window.location.href = `/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`;
            }
            // ? to show shortcuts
            if (e.key === '?' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                setShowShortcuts(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecording, transcript, profession, patientName, patientId]);

    const startRecording = async () => {
        if (!consentGiven) {
            alert('Du må bekrefte samsvar med personvernregler før opptak kan starte.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Set up audio analyser for real waveform
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await handleTranscription(audioBlob);
                audioContext.close();
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start waveform animation
            animationRef.current = requestAnimationFrame(updateWaveform);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Kunne ikke få tilgang til mikrofonen. Vennligst sjekk tillatelser.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

            // Stop waveform animation
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            setWaveformBars(new Array(24).fill(4));

            // Stop timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleTranscription = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('profession', profession);

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.text) {
                setTranscript(data.text);
                setShowTranscriptToast(true);

                // Save recording + transcript to database
                try {
                    await fetch('/api/recordings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: 'recording.webm',
                            duration: recordingTime,
                            fileSize: audioBlob.size,
                            mimeType: 'audio/webm',
                            source: 'dashboard',
                            patientId: patientId || undefined,
                            transcript: {
                                text: data.text,
                                language: 'no',
                                wordCount: data.text.split(/\s+/).filter(Boolean).length,
                            },
                        }),
                    });

                    // Refresh stats after saving
                    const recRes = await fetch('/api/recordings');
                    if (recRes.ok) {
                        const recordings = await recRes.json();
                        const today = new Date().toDateString();
                        const todayRecs = recordings.filter((r: any) => new Date(r.createdAt).toDateString() === today);
                        const totalDuration = todayRecs.reduce((sum: number, r: any) => sum + (r.duration || 0), 0);
                        setStats({
                            todayRecordings: todayRecs.length,
                            todayMinutes: Math.round(totalDuration / 60),
                        });
                    }
                } catch (saveError) {
                    console.error('Failed to save recording:', saveError);
                }
            } else {
                setTranscript('');
                alert('Kunne ikke transkribere opptaket. Vennligst prøv igjen.');
            }
            setIsTranscribing(false);
        } catch (error) {
            console.error('Transcription failed:', error);
            setTranscript('');
            alert('Transkribering feilet. Vennligst prøv igjen.');
            setIsTranscribing(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <AppSidebar>
                <div className="pt-6 px-2">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">Profesjon</label>
                    <select
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="glass-input !text-sm !py-2.5 cursor-pointer"
                    >
                        <option value="lege">Lege / Spesialist</option>
                        <option value="tannlege">Tannlege</option>
                        <option value="psykolog">Psykolog</option>
                        <option value="fysioterapeut">Fysioterapeut / Manuellterapeut</option>
                    </select>
                </div>

                {/* Time Saved Stats */}
                <div className="pt-4 px-2">
                    <div className="glass-card-static p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-[var(--primary-light)]" />
                            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tid spart i dag</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--primary-light)]">{stats.todayMinutes} min</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{stats.todayRecordings} konsultasjoner dokumentert</p>
                    </div>
                </div>

                {/* GDPR Data Management */}
                <div className="pt-4 px-2">
                    <div className="glass-card-static p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-[var(--success)]" />
                            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Personvern</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mb-2">
                            Samtykke: {consentGiven ? (
                                <span className="text-[var(--success)] font-semibold">Aktivt</span>
                            ) : (
                                <span className="text-[var(--text-muted)] font-semibold">Ikke gitt</span>
                            )}
                        </p>
                        {consentGiven && (
                            <button
                                onClick={() => handleConsentChange(false)}
                                className="text-[11px] text-[var(--warning)] hover:text-[var(--warning)] font-medium transition-colors cursor-pointer"
                            >
                                Trekk tilbake samtykke
                            </button>
                        )}
                        <div className="mt-2 pt-2 border-t border-[var(--glass-border)]">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-1.5 text-[11px] text-[var(--error)] hover:text-[var(--error)] font-medium transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-3 h-3" />
                                Slett alle mine data
                            </button>
                        </div>
                    </div>
                </div>
            </AppSidebar>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="glass-header h-16 flex items-center justify-between px-8">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Aktiv arbeidsøkt</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowShortcuts(prev => !prev)}
                            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                            title="Hurtigtaster (?)"
                        >
                            <Keyboard className="w-4 h-4" />
                            <span className="hidden sm:inline">Hurtigtaster</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                {profile ? profile.name : 'Demomodus'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Patient Context Bar */}
                        <div className="glass-card p-5 mb-6 animate-fade-in">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-4 h-4 text-[var(--primary-light)]" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pasientkontekst</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Pasient-ID</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={patientId}
                                            onChange={(e) => setPatientId(e.target.value)}
                                            placeholder="P-2024-0847"
                                            className="glass-input !text-sm !py-2.5 !pr-10 font-mono"
                                        />
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                    </div>
                                </div>
                                <div className="relative" ref={patientDropdownRef}>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Pasientnavn</label>
                                    <input
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => handlePatientNameChange(e.target.value)}
                                        onFocus={() => { if (patientResults.length > 0) setShowPatientDropdown(true); }}
                                        placeholder="Fornavn Etternavn"
                                        className="glass-input !text-sm !py-2.5"
                                        autoComplete="off"
                                    />
                                    {showPatientDropdown && patientResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 glass-card-elevated z-20 max-h-48 overflow-y-auto">
                                            {patientResults.map((patient: any, idx: number) => (
                                                <button
                                                    key={patient.id || idx}
                                                    type="button"
                                                    onClick={() => selectPatient(patient)}
                                                    className="w-full text-left px-3 py-2.5 hover:bg-[var(--glass-hover)] transition-colors border-b border-[var(--glass-border)] last:border-b-0 cursor-pointer"
                                                >
                                                    <span className="text-sm font-medium text-[var(--text-primary)] block">{patient.name}</span>
                                                    {patient.patientId && (
                                                        <span className="text-[11px] text-[var(--text-muted)] font-mono">{patient.patientId}</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Konsultasjonstype</label>
                                    <select
                                        value={encounterType}
                                        onChange={(e) => setEncounterType(e.target.value)}
                                        className="glass-input !text-sm !py-2.5 cursor-pointer"
                                    >
                                        <option value="kontroll">Kontroll</option>
                                        <option value="nykonsultasjon">Ny konsultasjon</option>
                                        <option value="akutt">Akutt</option>
                                        <option value="oppfølging">Oppfølging</option>
                                        <option value="prosedyre">Prosedyre</option>
                                        <option value="telefonkonsultasjon">Telefonkonsultasjon</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Session Header */}
                        <div className="flex items-end justify-between mb-8 animate-fade-in stagger-1">
                            <div>
                                <p className="text-xs font-semibold text-[var(--primary-light)] uppercase tracking-wider mb-1">Nytt journalnotat</p>
                                <h2 className="text-3xl font-bold text-[var(--text-primary)]">Diktering</h2>
                                {patientId && (
                                    <p className="text-sm text-[var(--text-muted)] mt-1">
                                        Pasient: <span className="font-mono font-semibold text-[var(--text-secondary)]">{patientId}</span>
                                        {patientName && <span> - {patientName}</span>}
                                    </p>
                                )}
                            </div>
                            {transcript && (
                                <Link
                                    href={`/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`}
                                    className="glass-btn-primary text-sm !py-2.5 !px-5 inline-flex items-center gap-2 cursor-pointer"
                                >
                                    Åpne Editor
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {/* Recording Interface */}
                        <div className="glass-card-elevated p-12 flex flex-col items-center gap-10 animate-slide-up stagger-2">
                            {/* Status Text */}
                            <div className="text-center" aria-live="polite" aria-atomic="true">
                                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-1">
                                    {isRecording ? "Tar opp lyd..." : isTranscribing ? "Transkriberer tale..." : transcript ? "Diktering ferdig" : "Klar for diktering"}
                                </h3>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {isRecording
                                        ? `${formatTime(recordingTime)} - Trykk for å stoppe`
                                        : isTranscribing
                                            ? "Vennligst vent"
                                            : transcript
                                                ? "Transkripsjon fullført"
                                                : "Trykk på mikrofonen eller bruk Ctrl+R"}
                                </p>
                            </div>

                            {/* Waveform - Real audio data */}
                            <div className="flex items-center justify-center gap-1.5 h-24 w-full">
                                {waveformBars.map((height, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-1.5 rounded-full transition-all",
                                            isRecording
                                                ? "bg-[var(--error)]"
                                                : transcript
                                                    ? "bg-[var(--primary)]"
                                                    : "bg-[var(--glass-border)]"
                                        )}
                                        style={{
                                            height: `${height}px`,
                                            transition: isRecording ? 'height 50ms ease' : 'height 300ms ease',
                                            background: isRecording
                                                ? 'var(--error)'
                                                : transcript
                                                    ? 'linear-gradient(to top, var(--primary), var(--primary-light))'
                                                    : 'var(--glass-border)',
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Mic Button */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isTranscribing}
                                className={cn(
                                    "relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer",
                                    isRecording
                                        ? "w-24 h-24 bg-[var(--error-subtle)] border-2 border-[var(--error)]"
                                        : "w-24 h-24 border-2 border-[var(--primary)] animate-pulse-glow",
                                    !isRecording && !isTranscribing && "hover:shadow-[0_0_30px_var(--primary-glow)]",
                                    isTranscribing && "opacity-50 cursor-not-allowed"
                                )}
                                style={!isRecording ? { background: 'linear-gradient(135deg, rgba(8,145,178,0.15), rgba(34,211,238,0.1))' } : undefined}
                            >
                                {isRecording && (
                                    <div className="absolute inset-0 rounded-full border-2 border-[var(--error)] animate-pulse-ring" />
                                )}
                                {isTranscribing ? (
                                    <span role="status">
                                        <Loader2 className="w-8 h-8 text-[var(--primary-light)] animate-spin" />
                                        <span className="sr-only">Transkriberer tale...</span>
                                    </span>
                                ) : isRecording ? (
                                    <Square className="w-7 h-7 text-[var(--error)] fill-current" />
                                ) : (
                                    <Mic className="w-8 h-8 text-[var(--primary-light)]" />
                                )}
                            </button>

                            {/* GDPR Consent */}
                            {!isRecording && !transcript && (
                                <label className="flex items-start gap-3 cursor-pointer max-w-md">
                                    <input
                                        type="checkbox"
                                        checked={consentGiven}
                                        onChange={(e) => handleConsentChange(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-[var(--glass-border)] text-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 accent-[var(--primary)] cursor-pointer"
                                    />
                                    <span className={cn("text-sm leading-relaxed", consentGiven ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]")}>
                                        Jeg bekrefter at pasientdata behandles i henhold til personvernlovgivningen (GDPR)
                                    </span>
                                </label>
                            )}

                            {/* Transcript Display */}
                            {transcript && (
                                <div className="w-full glass-card-static p-6" aria-live="polite">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText className="w-4 h-4 text-[var(--primary-light)]" />
                                        <span className="text-xs font-semibold text-[var(--primary-light)] uppercase tracking-wider">Transkripsjon</span>
                                        {recordingTime > 0 && (
                                            <span className="text-[11px] text-[var(--text-muted)] ml-auto flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatTime(recordingTime)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[var(--text-secondary)] leading-relaxed">{transcript}</p>

                                    {/* Time saved indicator */}
                                    <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[var(--success)]" />
                                        <span className="text-xs font-semibold text-[var(--success)]">Estimert tid spart: ~8 minutter</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        {transcript && (
                            <div className="grid grid-cols-4 gap-4 mt-6 animate-fade-in stagger-3">
                                <Link href={`/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`} className="glass-card p-5 text-center group cursor-pointer">
                                    <PenLine className="w-6 h-6 text-[var(--primary-light)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Rediger i Editor</span>
                                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">Ctrl+E</span>
                                </Link>
                                <Link href="/journal" className="glass-card p-5 text-center group cursor-pointer">
                                    <BookOpen className="w-6 h-6 text-[var(--success)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Lagre i Journal</span>
                                </Link>
                                <Link href="/forms" className="glass-card p-5 text-center group cursor-pointer">
                                    <ClipboardList className="w-6 h-6 text-[var(--warning)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Fyll ut skjema</span>
                                </Link>
                                <Link href="/summary" className="glass-card p-5 text-center group cursor-pointer">
                                    <Sparkles className="w-6 h-6 text-[var(--accent)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Pasientoppsummering</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Delete Data Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="glass-card-elevated p-6 max-w-sm w-full mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[var(--error-subtle)] rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Slett alle data</h3>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                            Dette vil slette alle lokalt lagrede data, inkludert:
                        </p>
                        <ul className="text-sm text-[var(--text-secondary)] mb-6 space-y-1">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[var(--error)] rounded-full shrink-0" />
                                Samtykkelogg og samtykke-status
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[var(--error)] rounded-full shrink-0" />
                                Innstillinger (mørk modus)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[var(--error)] rounded-full shrink-0" />
                                Aktiv transkripsjon og sesjondata
                            </li>
                        </ul>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="glass-btn-secondary flex-1 !text-sm !py-2.5 cursor-pointer"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleDeleteAllData}
                                className="flex-1 bg-[var(--error)] hover:bg-[var(--error)] text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                            >
                                Slett alt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
                    <div className="glass-card-elevated p-6 max-w-sm w-full mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Hurtigtaster</h3>
                            <button onClick={() => setShowShortcuts(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">&times;</button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">Start/stopp opptak</span>
                                <span className="kbd">Ctrl+R</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">Åpne editor</span>
                                <span className="kbd">Ctrl+E</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">Lagre utkast</span>
                                <span className="kbd">Ctrl+S</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">Godkjenn dokument</span>
                                <span className="kbd">Ctrl+Enter</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[var(--text-secondary)]">Vis hurtigtaster</span>
                                <span className="kbd">?</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transcript ready toast */}
            {showTranscriptToast && transcript && (
                <Toast
                    message="Transkribering fullført! Gå til editor for å strukturere notatet."
                    type="success"
                    action={{
                        label: "Åpne i Editor",
                        href: `/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`
                    }}
                    onDismiss={() => setShowTranscriptToast(false)}
                    autoDismissMs={10000}
                />
            )}
        </div>
    );
}
