'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Square, Loader2, FileText, Shield, ChevronRight, User, PenLine, Search, Clock, TrendingUp, Keyboard, Send, Plug, ClipboardList, Sparkles, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { cn, fetchWithTimeout } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import Toast from '@/components/Toast';
import ConversationMockup from '@/components/ConversationMockup';
import { useUserProfile } from '@/hooks/useUserProfile';

// Consent audit log types
interface ConsentLogEntry {
    action: 'granted' | 'withdrawn';
    timestamp: string;
    type: 'recording_consent';
}

function getConsentLog(): ConsentLogEntry[] {
    try {
        const log = localStorage.getItem('vocura_consent_log');
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
    localStorage.setItem('vocura_consent_log', JSON.stringify(log));
}

function getLastConsentState(): boolean {
    const log = getConsentLog();
    if (log.length === 0) return false;
    return log[log.length - 1].action === 'granted';
}

// Generate a session ID
function generateSessionId(): string {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `S-${datePart}-${rand}`;
}

export default function Dashboard() {
    const router = useRouter();
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
    const [patientSearchError, setPatientSearchError] = useState('');
    const [patientInformed, setPatientInformed] = useState(false);
    const [isEPJConnected, setIsEPJConnected] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const patientSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const patientDropdownRef = useRef<HTMLDivElement | null>(null);
    const [waveformBars, setWaveformBars] = useState<number[]>(new Array(28).fill(4));
    const [showTranscriptToast, setShowTranscriptToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'error' | 'info' | 'success' } | null>(null);
    const [recoveredRecording, setRecoveredRecording] = useState<Blob | null>(null);
    const [sessionId] = useState(() => generateSessionId());

    // Persist GDPR consent with audit trail in localStorage
    useEffect(() => {
        const lastConsent = getLastConsentState();
        if (lastConsent) {
            setConsentGiven(true);
        }
    }, []);

    // Idle waveform breathing animation
    useEffect(() => {
        if (isRecording || transcript || isTranscribing) return;
        const interval = setInterval(() => {
            setWaveformBars(prev => prev.map((_, i) => {
                return 4 + Math.sin(Date.now() / 800 + i * 0.5) * 3;
            }));
        }, 100);
        return () => clearInterval(interval);
    }, [isRecording, transcript, isTranscribing]);

    // Load session stats from sessionStorage on mount
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem('vocura_session_stats');
            if (stored) {
                const parsed = JSON.parse(stored);
                setStats({
                    todayRecordings: parsed.todayRecordings || 0,
                    todayMinutes: parsed.todayMinutes || 0,
                });
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    // Check EPJ connection status on mount
    useEffect(() => {
        async function checkEPJConnection() {
            try {
                const res = await fetchWithTimeout('/api/user/epj-integration');
                if (res.ok) {
                    const data = await res.json();
                    setIsEPJConnected(!!data.isConnected);
                }
            } catch {
                setIsEPJConnected(false);
            }
        }
        checkEPJConnection();
    }, []);

    // Recover saved recording backup from localStorage on mount
    useEffect(() => {
        try {
            const backup = localStorage.getItem('vocura_recording_backup');
            if (backup) {
                const byteString = atob(backup.split(',')[1]);
                const mimeType = backup.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeType });
                setRecoveredRecording(blob);
            }
        } catch {
            // Corrupted backup — remove it
            localStorage.removeItem('vocura_recording_backup');
        }
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

    // Patient search with debounce — EPJ search when connected, no API when not
    const searchPatients = useCallback(async (query: string) => {
        if (query.length < 2) {
            setPatientResults([]);
            setShowPatientDropdown(false);
            setPatientSearchError('');
            return;
        }
        // If EPJ is not connected, just use free-text input — no API search
        if (!isEPJConnected) {
            setPatientResults([]);
            setShowPatientDropdown(false);
            return;
        }
        setPatientSearchError('');
        try {
            const res = await fetchWithTimeout(`/api/import/patient-context?search=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setPatientResults(data.patients || []);
                setShowPatientDropdown(true);
            } else {
                setPatientSearchError('Kunne ikke søke etter pasienter i EPJ. Prøv igjen.');
            }
        } catch {
            setPatientSearchError('EPJ-pasientsøk feilet. Sjekk nettverkstilkoblingen.');
        }
    }, [isEPJConnected]);

    const handlePatientNameChange = (value: string) => {
        setPatientName(value);
        setPatientInformed(false);
        if (patientSearchTimeoutRef.current) {
            clearTimeout(patientSearchTimeoutRef.current);
        }
        patientSearchTimeoutRef.current = setTimeout(() => {
            searchPatients(value);
        }, 300);
    };

    const selectPatient = (patient: any) => {
        setPatientId(patient.epjPatientId || patient.patientId || patient.id || '');
        setPatientName(patient.displayName || patient.name || '');
        setShowPatientDropdown(false);
        setPatientResults([]);
        setPatientInformed(false);
    };

    const handleConsentChange = (checked: boolean) => {
        setConsentGiven(checked);
        addConsentLogEntry(checked ? 'granted' : 'withdrawn');
        localStorage.setItem('vocura_gdpr_consent', checked.toString());
    };

    const handlePatientInformedChange = async (checked: boolean) => {
        setPatientInformed(checked);
        if (checked) {
            try {
                await fetchWithTimeout('/api/consent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        consentType: 'patient_ai_informed',
                        granted: true,
                        version: '1.0',
                    }),
                });
            } catch {
                // Silent fail — consent UI state is primary
            }
        }
    };

    // Delete all locally stored data (GDPR right to erasure)
    const handleDeleteAllData = () => {
        localStorage.removeItem('vocura_consent_log');
        localStorage.removeItem('vocura_dark_mode');
        localStorage.removeItem('vocura_accent_theme');
        localStorage.removeItem('vocura_gdpr_consent');
        setConsentGiven(false);
        setPatientInformed(false);
        setTranscript('');
        setPatientId('');
        setPatientName('');
        setShowDeleteConfirm(false);
        window.location.reload();
    };

    // Real waveform from audio analyser
    const updateWaveform = useCallback(() => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            const bars = [];
            const barCount = 28;
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
            if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
                e.preventDefault();
                if (isRecording) {
                    stopRecording();
                } else {
                    startRecording();
                }
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'e' && transcript) {
                e.preventDefault();
                router.push(`/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`);
            }
            if (e.key === '?' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                setShowShortcuts(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecording, transcript, profession, patientName, patientId]);

    const RECORDING_BACKUP_KEY = 'vocura_recording_backup';
    const RECORDING_BACKUP_MAX_BYTES = 5 * 1024 * 1024; // 5 MB limit

    const showToast = useCallback((text: string, type: 'error' | 'info' | 'success' = 'error') => {
        setToastMessage({ text, type });
    }, []);

    const saveRecordingBackup = useCallback((blob: Blob) => {
        if (blob.size > RECORDING_BACKUP_MAX_BYTES) {
            console.warn('Recording too large for localStorage backup, skipping.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                localStorage.setItem(RECORDING_BACKUP_KEY, reader.result as string);
            } catch (e) {
                console.warn('Failed to save recording backup to localStorage:', e);
            }
        };
        reader.readAsDataURL(blob);
    }, []);

    const clearRecordingBackup = useCallback(() => {
        try {
            localStorage.removeItem(RECORDING_BACKUP_KEY);
        } catch {
            // Ignore
        }
    }, []);

    const startRecording = async () => {
        if (!consentGiven) {
            showToast('Du må bekrefte samsvar med personvernregler før opptak kan starte.');
            return;
        }
        if (!patientInformed) {
            showToast('Du må bekrefte at pasienten er informert om AI-behandling før opptak.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
                saveRecordingBackup(audioBlob);
                await handleTranscription(audioBlob);
                audioContext.close();
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            animationRef.current = requestAnimationFrame(updateWaveform);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err: unknown) {
            console.error('Error accessing microphone:', err);
            const domErr = err as { name?: string };
            if (domErr.name === 'NotAllowedError') {
                showToast('Mikrofontilgang ble avslått. Gi tillatelse i nettleserinnstillingene og prøv igjen.');
            } else if (domErr.name === 'NotFoundError') {
                showToast('Ingen mikrofon funnet. Koble til en mikrofon og prøv igjen.');
            } else if (domErr.name === 'NotReadableError') {
                showToast('Mikrofonen er opptatt av et annet program. Lukk andre apper som bruker mikrofonen.');
            } else {
                showToast('Kunne ikke starte opptak. Sjekk at mikrofonen er tilkoblet og at nettleseren har tillatelse.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            setWaveformBars(new Array(28).fill(4));

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

            const response = await fetchWithTimeout('/api/transcribe', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.error || 'Ukjent feil';
                console.error(`Transcription API error [${response.status}]:`, errorMsg);
                setTranscript('');
                if (response.status === 401) {
                    showToast('Økten din har utløpt. Logg inn på nytt for å transkribere.');
                } else if (response.status === 413) {
                    showToast('Opptaket er for stort (maks 25 MB). Prøv et kortere opptak.');
                } else if (response.status === 415) {
                    showToast('Lydformatet støttes ikke. Bruk et vanlig format (WebM, MP3, WAV).');
                } else if (response.status === 429) {
                    showToast('For mange forespørsler. Vent litt og prøv igjen.');
                } else {
                    showToast(`Transkribering feilet: ${errorMsg}`);
                }
            } else if (data.text) {
                setTranscript(data.text);
                setShowTranscriptToast(true);
                clearRecordingBackup();

                // Update session stats in sessionStorage
                try {
                    const stored = sessionStorage.getItem('vocura_session_stats');
                    const current = stored ? JSON.parse(stored) : { todayRecordings: 0, todayMinutes: 0 };
                    const updated = {
                        todayRecordings: (current.todayRecordings || 0) + 1,
                        todayMinutes: (current.todayMinutes || 0) + Math.round(recordingTime / 60),
                    };
                    sessionStorage.setItem('vocura_session_stats', JSON.stringify(updated));
                    setStats(updated);
                } catch {
                    // Ignore sessionStorage errors
                }
            } else {
                console.error('Transcription returned empty text:', data);
                setTranscript('');
                showToast('Ingen tale ble gjenkjent. Snakk tydelig nær mikrofonen og prøv igjen.');
            }
            setIsTranscribing(false);
        } catch (error) {
            console.error('Transcription failed:', error);
            setTranscript('');
            showToast('Kunne ikke nå transkriberingstjenesten. Sjekk internettforbindelsen din og prøv igjen.');
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
                <div className="pt-4 px-1">
                    <label className="text-[11px] font-medium text-[var(--text-muted)] tracking-wider block mb-1.5 px-1.5">Profesjon</label>
                    <select
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] text-[13px] px-2.5 py-2 cursor-pointer focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                    >
                        <option value="lege">Lege / Spesialist</option>
                        <option value="tannlege">Tannlege</option>
                        <option value="psykolog">Psykolog</option>
                        <option value="fysioterapeut">Fysioterapeut / Manuellterapeut</option>
                    </select>
                </div>

                {/* Time Saved Stats */}
                <div className="pt-3 px-1">
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                            <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wider">Tid spart i dag</span>
                        </div>
                        <p className="text-xl font-semibold text-[var(--text-primary)]">{stats.todayMinutes} min</p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{stats.todayRecordings} konsultasjoner dokumentert</p>
                    </div>
                </div>

                {/* GDPR Data Management */}
                <div className="pt-3 px-1">
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-3.5 h-3.5 text-[var(--color-success)]" />
                            <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wider">Personvern</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mb-2">
                            Samtykke: {consentGiven ? (
                                <span className="text-[var(--color-success)] font-medium">Aktivt</span>
                            ) : (
                                <span className="text-[var(--text-muted)] font-medium">Ikke gitt</span>
                            )}
                        </p>
                        {consentGiven && (
                            <button
                                onClick={() => handleConsentChange(false)}
                                className="text-[11px] text-[var(--color-warning)] hover:opacity-80 font-medium transition-colors cursor-pointer"
                            >
                                Trekk tilbake samtykke
                            </button>
                        )}
                        <div className="mt-2 pt-2 border-t border-[var(--border-default)]">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-1.5 text-[11px] text-[var(--color-error)] hover:opacity-80 font-medium transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-3 h-3" />
                                Slett alle mine data
                            </button>
                        </div>
                    </div>
                </div>
            </AppSidebar>

            {/* Main Content */}
            <main id="main-content" className="flex-1 flex flex-col overflow-hidden bg-[var(--surface-deep)]">
                {/* Session Header Bar */}
                <header className="bg-[var(--surface-primary)]/80 backdrop-blur-sm border-b border-[var(--border-default)] h-12 flex items-center justify-between px-5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--surface-overlay)]">
                            <span className="text-[11px] font-mono text-[var(--text-secondary)] tracking-wide">{sessionId}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <span className={cn(
                                "font-mono text-base tracking-wider",
                                isRecording ? "text-[var(--color-error)]" : "text-[var(--text-primary)]"
                            )}>
                                {formatTime(recordingTime)}
                            </span>
                        </div>

                        {isRecording && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.10)]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-error)] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-error)]" />
                                </span>
                                <span className="text-[11px] font-medium text-[var(--color-error)] uppercase tracking-wider">REC</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowShortcuts(prev => !prev)}
                            className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-[var(--surface-overlay)]"
                            title="Hurtigtaster (?)"
                            aria-label="Vis hurtigtaster"                        >
                            <Keyboard className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hurtigtaster</span>
                        </button>
                        <div className="w-px h-3.5 bg-[var(--border-default)]" />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--surface-overlay)]">
                            <Lock className="w-3 h-3 text-[var(--color-success)]" />
                            <span className="text-[11px] font-medium text-[var(--text-primary)]">
                                {profile ? profile.name : 'Demomodus'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-6 py-8">
                        {/* Patient Context - Inline bar */}
                        <div className="flex flex-wrap items-end gap-4 pb-6 mb-8 border-b border-[var(--border-default)] animate-fade-in">
                            <div className="flex items-center gap-2 mr-2 self-center">
                                <User className="w-4 h-4 text-[var(--text-muted)]" />
                                <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Pasient</span>
                                <div className="flex items-center gap-1 ml-1" title={isEPJConnected ? 'EPJ tilkoblet' : 'EPJ ikke tilkoblet'}>
                                    <Plug className={cn(
                                        "w-3 h-3",
                                        isEPJConnected ? "text-[var(--color-success)]" : "text-[var(--text-muted)]"
                                    )} />
                                    <span className={cn(
                                        "inline-block w-2 h-2 rounded-full",
                                        isEPJConnected ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"
                                    )} />
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                        {isEPJConnected ? 'EPJ' : 'Fritekst'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[140px] max-w-[180px]">
                                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">ID</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={patientId}
                                        onChange={(e) => setPatientId(e.target.value)}
                                        placeholder="P-2024-0847"
                                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] text-sm px-3 py-2 pr-9 font-mono placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                    />
                                    <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-[160px] max-w-[200px] relative" ref={patientDropdownRef}>
                                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Navn</label>
                                <input
                                    type="text"
                                    value={patientName}
                                    onChange={(e) => handlePatientNameChange(e.target.value)}
                                    onFocus={() => { if (patientResults.length > 0) setShowPatientDropdown(true); }}
                                    placeholder="Fornavn Etternavn"
                                    className="w-full bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] text-sm px-3 py-2 placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                    autoComplete="off"
                                />
                                {showPatientDropdown && patientResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg z-20 max-h-48 overflow-y-auto" style={{ boxShadow: 'var(--shadow-overlay)' }}>
                                        {patientResults.map((patient: any, idx: number) => (
                                            <button
                                                key={patient.epjPatientId || patient.id || idx}
                                                type="button"
                                                onClick={() => selectPatient(patient)}
                                                className="w-full text-left px-3 py-2 hover:bg-[var(--surface-overlay)] transition-colors border-b border-[var(--border-subtle)] last:border-b-0 cursor-pointer"
                                            >
                                                <span className="text-sm font-medium text-[var(--text-primary)] block">{patient.displayName || patient.name}</span>
                                                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                                                    {patient.epjPatientId || patient.patientId}
                                                    {patient.birthYear && ` \u00B7 f. ${patient.birthYear}`}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {patientSearchError && (
                                    <p className="absolute top-full left-0 right-0 mt-1 text-[11px] text-[var(--color-error)] px-1">
                                        {patientSearchError}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1 min-w-[150px] max-w-[180px]">
                                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">Type</label>
                                <select
                                    value={encounterType}
                                    onChange={(e) => setEncounterType(e.target.value)}
                                    className="w-full bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] text-sm px-3 py-2 cursor-pointer focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                >
                                    <option value="kontroll">Kontroll</option>
                                    <option value="nykonsultasjon">Ny konsultasjon</option>
                                    <option value="akutt">Akutt</option>
                                    <option value="oppfolging">Oppfølging</option>
                                    <option value="prosedyre">Prosedyre</option>
                                    <option value="telefonkonsultasjon">Telefonkonsultasjon</option>
                                </select>
                            </div>
                            {transcript && (
                                <Link
                                    href={`/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`}
                                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-[13px] font-medium rounded-md px-4 py-2 inline-flex items-center gap-2 cursor-pointer transition-colors self-end"
                                >
                                    Åpne editor
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {/* Recording Interface */}
                        <div
                            className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-10 flex flex-col items-center gap-8 animate-slide-up stagger-1 relative overflow-hidden"
                        >
                            {/* Status Text */}
                            <div className="text-center relative z-10" aria-live="polite" aria-atomic="true">
                                <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">
                                    {isRecording ? "Tar opp lyd..." : isTranscribing ? "Transkriberer tale..." : transcript ? "Diktering ferdig" : "Klar for diktering"}
                                </h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {isRecording
                                        ? `${formatTime(recordingTime)} — Trykk for å stoppe`
                                        : isTranscribing
                                            ? "Vennligst vent"
                                            : transcript
                                                ? "Transkripsjon fullført"
                                                : "Trykk på mikrofonen eller bruk Ctrl+R"}
                                </p>
                            </div>

                            {/* Waveform */}
                            <div className="flex items-center justify-center gap-[3px] h-20 w-full max-w-md relative z-10">
                                {waveformBars.map((height, i) => (
                                    <div
                                        key={i}
                                        className="w-[4px] rounded-full"
                                        style={{
                                            height: `${height}px`,
                                            transition: isRecording ? 'height 50ms ease' : 'height 300ms ease',
                                            background: isRecording
                                                ? `linear-gradient(to top, var(--waveform-from), var(--waveform-to))`
                                                : transcript
                                                    ? `linear-gradient(to top, var(--waveform-idle-from), var(--waveform-idle-to))`
                                                    : 'var(--border-default)',
                                            opacity: isRecording ? (0.7 + (height / 80) * 0.3) : 0.6 + Math.sin(i * 0.5) * 0.4,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* DR/PA Conversation Mockup */}
                            <ConversationMockup isRecording={isRecording} recordingTime={recordingTime} />

                            {/* Mic Button */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isTranscribing}
                                aria-label={isRecording ? "Stopp opptak" : isTranscribing ? "Transkriberer" : "Start opptak"}
                                className={cn(
                                    "relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer z-10",
                                    isRecording
                                        ? "w-16 h-16 bg-[rgba(239,68,68,0.08)] border-2 border-[var(--color-error)]"
                                        : "w-16 h-16 border-2 border-[var(--border-strong)] hover:border-[var(--accent-primary)]",
                                    isTranscribing && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isRecording && (
                                    <div
                                        className="absolute inset-0 rounded-full border border-[var(--color-error)]"
                                        style={{
                                            animation: 'pulse-ring 1.5s ease-out infinite',
                                        }}
                                    />
                                )}
                                {isTranscribing ? (
                                    <span role="status">
                                        <Loader2 className="w-6 h-6 text-[var(--accent-primary)] animate-spin" />
                                        <span className="sr-only">Transkriberer tale...</span>
                                    </span>
                                ) : isRecording ? (
                                    <Square className="w-5 h-5 text-[var(--color-error)] fill-current" />
                                ) : (
                                    <Mic className="w-6 h-6 text-[var(--text-primary)]" />
                                )}
                            </button>

                            {/* GDPR Consent Toggle */}
                            {!isRecording && !transcript && (
                                <div className="flex items-center gap-3 relative z-10">
                                    <button
                                        role="switch"
                                        aria-checked={consentGiven}
                                        onClick={() => handleConsentChange(!consentGiven)}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--surface-elevated)]",
                                            consentGiven ? "bg-[var(--accent-primary)]" : "bg-[var(--border-strong)]"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                                                consentGiven ? "translate-x-4" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                    <span className="text-[13px] leading-relaxed max-w-sm text-[var(--text-secondary)]">
                                        GDPR-samtykke for opptak og databehandling
                                    </span>
                                    {consentGiven && (
                                        <Shield className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />
                                    )}
                                </div>
                            )}

                            {/* Per-Patient AI Consent Checkbox */}
                            {!isRecording && !transcript && consentGiven && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 relative z-10">
                                    <input
                                        type="checkbox"
                                        id="patient-informed"
                                        checked={patientInformed}
                                        onChange={(e) => handlePatientInformedChange(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="patient-informed" className="text-sm text-amber-800 dark:text-amber-200">
                                        Pasienten er informert om at AI brukes til journalbehandling
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Transcript Display */}
                        {transcript && (
                            <div
                                className="mt-6 bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6 animate-fade-in stagger-2"
                                aria-live="polite"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                                    <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Transkripsjon</span>
                                    {recordingTime > 0 && (
                                        <span className="text-[11px] text-[var(--text-muted)] ml-auto flex items-center gap-1 font-mono">
                                            <Clock className="w-3 h-3" /> {formatTime(recordingTime)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[var(--text-primary)] leading-relaxed text-[14px]">{transcript}</p>

                                <div className="mt-4 pt-4 border-t border-[var(--border-default)] flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-[var(--color-success)]" />
                                    <span className="text-xs font-medium text-[var(--color-success)]">Estimert tid spart: ~8 minutter</span>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        {transcript && (
                            <div className="grid grid-cols-4 gap-3 mt-6 animate-fade-in stagger-3">
                                <Link
                                    href={`/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`}
                                    className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-4 text-center group cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-all"
                                >
                                    <PenLine className="w-4 h-4 text-[var(--accent-secondary)] mx-auto mb-2" />
                                    <span className="text-[13px] font-medium text-[var(--text-primary)] block">Rediger i Editor</span>
                                    <span className="text-[10px] text-[var(--text-muted)] block mt-1 font-mono">Ctrl+E</span>
                                </Link>
                                <Link
                                    href={`/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}&epj=true`}
                                    className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-4 text-center group cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-all"
                                >
                                    <Send className="w-4 h-4 text-[var(--color-success)] mx-auto mb-2" />
                                    <span className="text-[13px] font-medium text-[var(--text-primary)] block">Send til EPJ</span>
                                    <span className="text-[10px] text-[var(--text-muted)] block mt-1 font-mono">Ctrl+Enter</span>
                                </Link>
                                <Link
                                    href="/forms"
                                    className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-4 text-center group cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-all"
                                >
                                    <ClipboardList className="w-4 h-4 text-[var(--color-warning)] mx-auto mb-2" />
                                    <span className="text-[13px] font-medium text-[var(--text-primary)] block">Fyll ut skjema</span>
                                </Link>
                                <Link
                                    href="/summary"
                                    className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-4 text-center group cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-all"
                                >
                                    <Sparkles className="w-4 h-4 text-[var(--accent-primary)] mx-auto mb-2" />
                                    <span className="text-[13px] font-medium text-[var(--text-primary)] block">Pasientoppsummering</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Delete Data Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-[var(--overlay-bg)] z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6 max-w-sm w-full mx-4 animate-scale-in" style={{ boxShadow: 'var(--shadow-overlay)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-[rgba(239,68,68,0.10)] rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-[var(--color-error)]" />
                            </div>
                            <h3 className="text-base font-semibold text-[var(--text-primary)]">Slett alle data</h3>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                            Dette vil slette alle lokalt lagrede data, inkludert:
                        </p>
                        <ul className="text-sm text-[var(--text-secondary)] mb-6 space-y-1.5">
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-[var(--color-error)] rounded-full shrink-0" />
                                Samtykkelogg og samtykke-status
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-[var(--color-error)] rounded-full shrink-0" />
                                Innstillinger (mørk modus)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-[var(--color-error)] rounded-full shrink-0" />
                                Aktiv transkripsjon og sesjondata
                            </li>
                        </ul>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleDeleteAllData}
                                className="flex-1 bg-[var(--color-error)] hover:bg-[#DC2626] text-white text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                            >
                                Slett alt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyboard Shortcuts Modal */}
            {showShortcuts && (
                <div className="fixed inset-0 bg-[var(--overlay-bg)] z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6 max-w-sm w-full mx-4 animate-scale-in" style={{ boxShadow: 'var(--shadow-overlay)' }} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-[var(--text-primary)]">Hurtigtaster</h3>
                            <button onClick={() => setShowShortcuts(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xl leading-none">&times;</button>
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
                                <span className="text-sm text-[var(--text-secondary)]">Send til EPJ</span>
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
                        label: "Åpne i editor",
                        href: `/editor?profession=${profession}&transcript=${encodeURIComponent(transcript)}&patientName=${encodeURIComponent(patientName)}&patientId=${encodeURIComponent(patientId)}`
                    }}
                    onDismiss={() => setShowTranscriptToast(false)}
                    autoDismissMs={10000}
                />
            )}

            {/* General error/info toast */}
            {toastMessage && (
                <Toast
                    message={toastMessage.text}
                    type={toastMessage.type}
                    onDismiss={() => setToastMessage(null)}
                    autoDismissMs={7000}
                />
            )}

            {/* Recovered recording banner */}
            {recoveredRecording && !isRecording && !isTranscribing && !transcript && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full">
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-4 shadow-lg border-l-4 border-l-[#F59E0B]" style={{ boxShadow: 'var(--shadow-overlay)' }}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--text-primary)]">Et usendt opptak ble funnet fra forrige økt.</p>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={async () => {
                                            setRecoveredRecording(null);
                                            await handleTranscription(recoveredRecording);
                                        }}
                                        className="btn-primary text-xs px-3 py-1.5 cursor-pointer"
                                    >
                                        Transkriber nå
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRecoveredRecording(null);
                                            clearRecordingBackup();
                                        }}
                                        className="btn-ghost text-xs px-3 py-1.5 cursor-pointer"
                                    >
                                        Forkast
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline keyframes for pulse-ring animation */}
            <style jsx>{`
                @keyframes pulse-ring {
                    0% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(1.4);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
