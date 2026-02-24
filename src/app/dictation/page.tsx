'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Mic, Square, Loader2, Copy, PenLine, Trash2, ArrowRight, Clock, Type } from 'lucide-react';
import { cn, fetchWithTimeout } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';

export default function Dictation() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [copied, setCopied] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationRef = useRef<number | null>(null);
    const [waveformBars, setWaveformBars] = useState<number[]>(new Array(30).fill(8));


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
                try {
                    await handleTranscription(audioBlob);
                } finally {
                    // Always close audio context, even if transcription fails
                    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                        audioContextRef.current.close();
                    }
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

            const response = await fetchWithTimeout('/api/transcribe', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.text) {
                setTranscript(prev => prev ? prev + ' ' + data.text : data.text);
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

    const openInEditor = () => {
        window.location.href = `/editor?transcript=${encodeURIComponent(transcript)}`;
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
        <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
            <AppSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#111111]">
                <div className="max-w-2xl mx-auto px-6 py-16">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-[#EDEDED] mb-3 font-serif tracking-tight">
                            AI-diktering
                        </h1>
                        <p className="text-[#5C5C5C] text-sm">
                            Snakk fritt — AI-en transkriberer og strukturerer teksten for deg.
                        </p>
                    </div>

                    {/* Recording Area */}
                    <div
                        className="relative bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-xl p-10 flex flex-col items-center gap-8 mb-6 transition-all duration-200"
                    >
                        {/* Violet radial glow when recording */}
                        {isRecording && (
                            <div
                                className="absolute inset-0 rounded-xl pointer-events-none"
                                style={{
                                    background: 'radial-gradient(ellipse at center, rgba(94,106,210,0.08) 0%, transparent 70%)',
                                }}
                            />
                        )}

                        {/* Waveform - Real audio data */}
                        <div className="flex items-center justify-center gap-1.5 h-16 w-full relative z-10">
                            {waveformBars.map((height, i) => (
                                <div
                                    key={i}
                                    className="w-1 rounded-full"
                                    style={{
                                        height: `${height}px`,
                                        transition: isRecording ? 'height 50ms ease' : 'height 300ms ease',
                                        background: isRecording
                                            ? '#EF4444'
                                            : transcript && !isRecording && !isTranscribing
                                                ? `linear-gradient(to top, #4F5ABF, #7B89DB)`
                                                : 'rgba(255,255,255,0.06)',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Record Button */}
                        <div className="relative z-10">
                            {/* Glow ring behind button */}
                            {!isRecording && !isTranscribing && (
                                <div
                                    className="absolute inset-[-16px] rounded-full pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(ellipse at center, rgba(94,106,210,0.15) 0%, transparent 70%)',
                                    }}
                                />
                            )}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isTranscribing}
                                className={cn(
                                    "relative flex items-center justify-center w-[112px] h-[112px] rounded-full transition-all duration-200 cursor-pointer",
                                    isRecording
                                        ? "bg-[rgba(239,68,68,0.1)] border-[3px] border-[#EF4444]"
                                        : "border-[3px] border-[#5E6AD2] bg-[rgba(94,106,210,0.08)]",
                                    !isRecording && !isTranscribing && "hover:bg-[rgba(94,106,210,0.15)] hover:shadow-[0_0_40px_rgba(94,106,210,0.2)]",
                                    isTranscribing && "opacity-50 cursor-not-allowed border-[3px] border-[#5E6AD2] bg-[rgba(94,106,210,0.05)]"
                                )}
                            >
                                {/* Recording pulse ring */}
                                {isRecording && (
                                    <div className="absolute inset-0 rounded-full border-[3px] border-[#EF4444] animate-ping opacity-30" />
                                )}
                                {isTranscribing ? (
                                    <Loader2 className="w-10 h-10 text-[#7B89DB] animate-spin" />
                                ) : isRecording ? (
                                    <Square className="w-9 h-9 text-[#EF4444] fill-current" />
                                ) : (
                                    <Mic className="w-10 h-10 text-[#7B89DB]" />
                                )}
                            </button>
                        </div>

                        {/* Status & Timer */}
                        <div className="text-center relative z-10" aria-live="polite" aria-atomic="true">
                            <p className="text-sm font-medium text-[#EDEDED]">
                                {isRecording ? "Tar opp..." : isTranscribing ? "Transkriberer..." : "Trykk for å starte diktering"}
                            </p>
                            {(isRecording || recordingTime > 0) && (
                                <div className="flex items-center justify-center gap-4 mt-2.5 text-sm text-[#5C5C5C]">
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
                        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 mb-6 border-l-[3px] border-l-[#5E6AD2]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-semibold text-[#7B89DB] uppercase tracking-wider">
                                    Transkripsjon
                                </h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-[#8B8B8B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        {copied ? 'Kopiert!' : 'Kopier'}
                                    </button>
                                    <button
                                        onClick={() => { setTranscript(''); setRecordingTime(0); }}
                                        className="text-[#EF4444] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors duration-150 cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Tøm
                                    </button>
                                </div>
                            </div>
                            <p className="text-[#8B8B8B] leading-relaxed text-[15px]">
                                {transcript}
                            </p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    {transcript && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Link
                                href={`/editor?transcript=${encodeURIComponent(transcript)}`}
                                className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex items-center gap-4 group cursor-pointer hover:border-[rgba(94,106,210,0.3)] transition-all duration-200"
                            >
                                <div className="w-10 h-10 bg-[rgba(94,106,210,0.08)] rounded-xl flex items-center justify-center group-hover:bg-[#5E6AD2] transition-colors duration-200">
                                    <PenLine className="w-5 h-5 text-[#7B89DB] group-hover:text-white transition-colors duration-200" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#EDEDED]">Send til Editor</p>
                                    <p className="text-xs text-[#5C5C5C] mt-0.5">Rediger og formater dokumentet</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#5C5C5C] group-hover:text-[#7B89DB] transition-colors duration-200" />
                            </Link>
                            <button
                                onClick={openInEditor}
                                className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex items-center gap-4 group text-left cursor-pointer hover:border-[rgba(16,185,129,0.3)] transition-all duration-200"
                            >
                                <div className="w-10 h-10 bg-[rgba(16,185,129,0.08)] rounded-xl flex items-center justify-center group-hover:bg-[#10B981] transition-colors duration-200">
                                    <PenLine className="w-5 h-5 text-[#10B981] group-hover:text-white transition-colors duration-200" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#EDEDED]">Rediger og send</p>
                                    <p className="text-xs text-[#5C5C5C] mt-0.5">Formater og push til EPJ</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#5C5C5C] group-hover:text-[#10B981] transition-colors duration-200" />
                            </button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
