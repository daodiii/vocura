'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Shield, LogOut } from 'lucide-react';

const IDLE_TIMEOUT = 15 * 60_000;
const WARNING_BEFORE = 3 * 60_000;

const PROTECTED_PREFIXES = [
    '/dashboard',
    '/dictation',
    '/editor',
    '/journal',
    '/forms',
    '/summary',
    '/templates',
];

export default function SessionTimeout() {
    const pathname = usePathname();
    const [showWarning, setShowWarning] = useState(false);
    const [showLock, setShowLock] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const lastActivityRef = useRef(Date.now());
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const isProtected = PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );

    const resetTimers = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);

        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setRemainingSeconds(Math.ceil(WARNING_BEFORE / 1000));

            countdownRef.current = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        if (countdownRef.current) clearInterval(countdownRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, IDLE_TIMEOUT - WARNING_BEFORE);

        lockTimerRef.current = setTimeout(() => {
            setShowWarning(false);
            setShowLock(true);
        }, IDLE_TIMEOUT);
    }, []);

    useEffect(() => {
        if (!isProtected) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        const handleActivity = () => {
            if (!showLock) {
                resetTimers();
            }
        };

        events.forEach((event) => window.addEventListener(event, handleActivity));
        resetTimers();

        return () => {
            events.forEach((event) => window.removeEventListener(event, handleActivity));
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [isProtected, showLock, resetTimers]);

    const handleUnlock = () => {
        window.location.href = '/login?redirect=' + encodeURIComponent(pathname);
    };

    const handleStayActive = () => {
        resetTimers();
    };

    if (!isProtected) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {showWarning && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="glass-card-elevated p-8 max-w-md mx-4 animate-fade-in glow-warning">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[var(--warning-subtle)] rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-[var(--warning)]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Inaktiv sesjon</h2>
                                <p className="text-sm text-[var(--text-muted)]">Automatisk utlogging om {formatTime(remainingSeconds)}</p>
                            </div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            For å beskytte pasientdata logger MediScribe deg ut etter inaktivitet. Klikk nedenfor for å fortsette.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleStayActive}
                                className="glass-btn-primary flex-1"
                            >
                                Fortsett å jobbe
                            </button>
                            <button
                                onClick={handleUnlock}
                                className="glass-btn flex-1"
                            >
                                Logg ut
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLock && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070B14]/95 backdrop-blur-lg">
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_var(--primary-glow)]">
                            <LogOut className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                            Sesjonen er utløpt
                        </h2>
                        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
                            Du har blitt logget ut på grunn av inaktivitet. Logg inn på nytt for å fortsette.
                        </p>
                        <button
                            onClick={handleUnlock}
                            className="glass-btn-primary px-8 py-3"
                        >
                            Logg inn på nytt
                        </button>
                        <p className="text-xs text-[var(--text-muted)] mt-4">
                            <Shield className="w-3.5 h-3.5 inline mr-1" />
                            Beskyttet av Normen-sikkerhetskrav
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
