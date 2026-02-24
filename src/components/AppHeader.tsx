'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic, LayoutDashboard, Activity, PenLine, ClipboardList, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import AccentThemeSelector from '@/components/AccentThemeSelector';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
    { href: '/dictation', label: 'Diktering', icon: Mic },
    { href: '/activity', label: 'Aktivitet', icon: Activity },
    { href: '/editor', label: 'Editor', icon: PenLine },
    { href: '/forms', label: 'Skjemaer', icon: ClipboardList },
    { href: '/summary', label: 'Oppsummering', icon: Sparkles },
];

export default function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 bg-[var(--surface-primary)]/80 backdrop-blur-xl border-b border-[var(--border-default)]">
            <div className="px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-[var(--text-primary)]">Vocura</span>
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
                                            ? "bg-[var(--surface-overlay)] text-[var(--text-primary)]"
                                            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-bg)]"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex items-center gap-1">
                    <AccentThemeSelector />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
