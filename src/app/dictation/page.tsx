'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Mic, Square, Loader2, Copy, PenLine, BookOpen, Trash2, ArrowRight, Clock, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';

export default function Dictation() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [copied, setCopied] = useState(false);
    const [recentRecordings, setRecentRecordings] = useState<any[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationRef = useRef<number | null>(null);
    const [waveformBars, setWaveformBars] = useState<number[]>(new Array(30).fill(8));

    // Load recent dictation recordings on mount
    useEffect(() => {
        async function loadRecent() {
            try {
                const res = await fetch('/api/recordings?source=dictation');
                if (res.ok) {
                    const data = await res.json();
                    setRecentRecordings(data.slice(0, 5));
                }
            } catch {
                // Silently fail if API is unavailable
            }
        }
        loadRecent();
    }, []);

    // Real waveform from audio analyser
    const updateWaveform = useCallback(() => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const bars = [];
            const barCount = 30;
            const step = Math.floor(dataArray.length / barCount);
            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i * step];
                bars.push(Math.max(8, (value / 255) * 60));
            }
            setWaveformBars(bars);
        }
        animationRef.current = requestAnimationFrame(updateWaveform);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Set up audio analyser for real waveform
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;
            audioContextRef.current = audioContext;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (timerRef.current) clearInterval(timerRef.current);
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await handleTranscription(audioBlob);
                // Close audio context after transcription
                if (audioContextRef.current) {
                    audioContextRef.current.close();
                    audioContextRef.current = null;
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start waveform animation
            animationRef.current = requestAnimationFrame(updateWaveform);
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
            setWaveformBars(new Array(30).fill(8));
        }
    };

    const handleTranscription = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.text) {
                setTranscript(prev => prev ? prev + ' ' + data.text : data.text);

                // Save recording + transcript to database
                try {
                    await fetch('/api/recordings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: 'dictation.webm',
                            duration: recordingTime,
                            fileSize: audioBlob.size,
                            mimeType: 'audio/webm',
                            source: 'dictation',
                            transcript: {
                                text: data.text,
                                language: 'no',
                                wordCount: data.text.split(/\s+/).filter(Boolean).length,
                            },
                        }),
                    });

                    // Refresh recent recordings after saving
                    const recRes = await fetch('/api/recordings?source=dictation');
                    if (recRes.ok) {
                        const recordings = await recRes.json();
                        setRecentRecordings(recordings.slice(0, 5));
                    }
                } catch (saveErr) {
                    console.error('Failed to save recording:', saveErr);
                }
            } else {
                alert('Kunne ikke transkribere opptaket. Vennligst prøv igjen.');
            }
            setIsTranscribing(false);
        } catch (error) {
            console.error('Transcription failed:', error);
            alert('Transkribering feilet. Vennligst prøv igjen.');
            setIsTranscribing(false);
        }
    };

    const saveToJournal = async () => {
        try {
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Diktering ${new Date().toLocaleDateString('nb-NO')}`,
                    content: `<p>${transcript}</p>`,
                    template: 'Diktering',
                    status: 'draft',
                }),
            });
            if (res.ok) {
                window.location.href = '/journal';
            }
        } catch (err) {
            console.error('Failed to save to journal:', err);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(transcript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        AI-diktering
                    </h1>
                    <p className="text-[var(--text-muted)]">Snakk fritt — AI-en transkriberer og strukturerer teksten for deg.</p>
                </div>

                {/* Recording Area */}
                <div className="glass-card-elevated p-10 flex flex-col items-center gap-8 mb-6 animate-slide-up stagger-1">
                    {/* Waveform - Real audio data */}
                    <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                        {waveformBars.map((height, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1 rounded-full transition-all",
                                    isRecording ? "bg-[var(--error)]" : "bg-[var(--glass-border)]"
                                )}
                                style={{
                                    height: `${height}px`,
                                    transition: isRecording ? 'height 50ms ease' : 'height 300ms ease',
                                    background: isRecording
                                        ? 'var(--error)'
                                        : 'var(--glass-border)',
                                }}
                            />
                        ))}
                    </div>

                    {/* Record Button */}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTranscribing}
                        className={cn(
                            "relative flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer",
                            isRecording
                                ? "w-28 h-28 bg-[var(--error-subtle)] border-3 border-[var(--error)]"
                                : "w-28 h-28 border-3 border-[var(--primary)] animate-pulse-glow",
                            !isRecording && !isTranscribing && "hover:shadow-[0_0_30px_var(--primary-glow)]",
                            isTranscribing && "opacity-50 cursor-not-allowed"
                        )}
                        style={!isRecording ? { background: 'linear-gradient(135deg, rgba(8,145,178,0.15), rgba(34,211,238,0.1))' } : undefined}
                    >
                        {isRecording && (
                            <div className="absolute inset-0 rounded-full border-3 border-[var(--error)] animate-pulse-ring" />
                        )}
                        {isTranscribing ? (
                            <Loader2 className="w-10 h-10 text-[var(--primary-light)] animate-spin" />
                        ) : isRecording ? (
                            <Square className="w-9 h-9 text-[var(--error)] fill-current" />
                        ) : (
                            <Mic className="w-10 h-10 text-[var(--primary-light)]" />
                        )}
                    </button>

                    {/* Status & Timer */}
                    <div className="text-center" aria-live="polite" aria-atomic="true">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {isRecording ? "Tar opp..." : isTranscribing ? "Transkriberer..." : "Trykk for å starte diktering"}
                        </p>
                        {(isRecording || recordingTime > 0) && (
                            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {formatTime(recordingTime)}
                                </span>
                                {wordCount > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <Type className="w-4 h-4" />
                                        {wordCount} ord
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Transcript Display */}
                {transcript && (
                    <div className="glass-card p-6 mb-6 animate-fade-in stagger-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-[var(--primary-light)] uppercase tracking-wider">Transkripsjon</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="glass-btn-ghost text-xs flex items-center gap-1.5 !py-1.5 cursor-pointer"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    {copied ? 'Kopiert!' : 'Kopier'}
                                </button>
                                <button
                                    onClick={() => { setTranscript(''); setRecordingTime(0); }}
                                    className="glass-btn-ghost text-xs flex items-center gap-1.5 !py-1.5 text-[var(--error)] hover:!text-[var(--error)] hover:!bg-[var(--error-subtle)] cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Tøm
                                </button>
                            </div>
                        </div>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                            {transcript}
                        </p>
                    </div>
                )}

                {/* Quick Actions */}
                {transcript && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in stagger-3">
                        <Link href={`/editor?transcript=${encodeURIComponent(transcript)}`} className="glass-card p-5 flex items-center gap-4 group cursor-pointer">
                            <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                                <PenLine className="w-5 h-5 text-[var(--primary-light)] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">Send til Editor</p>
                                <p className="text-xs text-[var(--text-muted)]">Rediger og formater dokumentet</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary-light)] transition-colors" />
                        </Link>
                        <button onClick={saveToJournal} className="glass-card p-5 flex items-center gap-4 group text-left cursor-pointer">
                            <div className="w-10 h-10 bg-[var(--success-subtle)] rounded-xl flex items-center justify-center group-hover:bg-[var(--success)] transition-colors">
                                <BookOpen className="w-5 h-5 text-[var(--success)] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[var(--text-primary)]">Lagre i Journal</p>
                                <p className="text-xs text-[var(--text-muted)]">Arkiver som journaloppføring</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--success)] transition-colors" />
                        </button>
                    </div>
                )}

                {/* Recent Dictation Recordings */}
                {recentRecordings.length > 0 && (
                    <div className="mt-8 animate-fade-in stagger-4">
                        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Tidligere dikteringer</h3>
                        <div className="space-y-2">
                            {recentRecordings.map((rec) => (
                                <div key={rec.id} className="glass-card p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{rec.transcript?.text || 'Ingen transkripsjon'}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">
                                            {new Date(rec.createdAt).toLocaleDateString('nb-NO')} · {Math.round(rec.duration / 60)} min
                                        </p>
                                    </div>
                                    <Link href={`/editor?transcript=${encodeURIComponent(rec.transcript?.text || '')}`} className="glass-btn-ghost text-xs cursor-pointer">
                                        Åpne i editor
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </main>
        </div>
    );
}
