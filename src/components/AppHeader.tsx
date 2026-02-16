'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic, LayoutDashboard, BookOpen, PenLine, ClipboardList, Sparkles, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
    { href: '/dictation', label: 'Diktering', icon: Mic },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/editor', label: 'Editor', icon: PenLine },
    { href: '/forms', label: 'Skjemaer', icon: ClipboardList },
    { href: '/summary', label: 'Oppsummering', icon: Sparkles },
];

function getInitialDarkMode(): boolean {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('mediscribe_dark_mode');
    return stored === null ? true : stored === 'true';
}

export default function AppHeader() {
    const pathname = usePathname();
    const [darkMode, setDarkMode] = useState(getInitialDarkMode);
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem('mediscribe_dark_mode', next.toString());
        if (next) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <header className="sticky top-0 z-50 glass-header">
            <div className="px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-[0_0_10px_var(--primary-glow)]">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold gradient-text">MediScribe</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-[var(--primary)] text-white shadow-[0_0_10px_var(--primary-glow)]"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)]"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 cursor-pointer"
                    title={darkMode ? 'Bytt til lyst modus' : 'Bytt til mørkt modus'}
                    aria-label={darkMode ? 'Bytt til lyst modus' : 'Bytt til mørkt modus'}
                >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>
        </header>
    );
}
