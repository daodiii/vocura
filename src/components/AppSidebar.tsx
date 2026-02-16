'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Mic, LayoutDashboard, BookOpen, PenLine, ClipboardList, LayoutGrid, User, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
    { href: '/dictation', label: 'Diktering', icon: Mic },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/editor', label: 'Editor', icon: PenLine },
    { href: '/forms', label: 'Skjemaer', icon: ClipboardList },
    { href: '/templates', label: 'Maler', icon: LayoutGrid },
    { href: '/summary', label: 'Pasientoppsummering', icon: Sparkles },
];

export default function AppSidebar({ children }: { children?: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { profile, loading: profileLoading } = useUserProfile();
    const supabase = createClient();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 1024px)');
        setIsMobile(!mql.matches);
        const handler = (e: MediaQueryListEvent) => {
            setIsMobile(!e.matches);
            if (e.matches) setSidebarOpen(false);
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (!isMobile || !sidebarOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, sidebarOpen]);

    useEffect(() => {
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobile, sidebarOpen]);

    const handleNavClick = useCallback(() => {
        if (isMobile) setSidebarOpen(false);
    }, [isMobile]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const sidebarContent = (
        <>
            <div className="p-6 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-3" onClick={handleNavClick}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#B8860B] to-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.25)]">
                        <Mic className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="text-lg font-semibold gradient-text">Aurelius</span>
                </Link>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200 lg:hidden"
                            aria-label="Lukk meny"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleNavClick}
                            className={cn("sidebar-nav-item", isActive && "active")}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
                {children}
            </nav>

            <div className="p-5 border-t border-[var(--glass-border)]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 shadow-[0_0_8px_var(--primary-glow)]">
                        <User className="text-[var(--primary-light)] w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {profileLoading ? 'Laster...' : (profile?.name || 'Bruker')}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                            {profile?.email || ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--error)] font-medium py-1.5 rounded-lg hover:bg-[var(--error-subtle)] transition-colors cursor-pointer"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Logg ut
                </button>
            </div>
        </>
    );

    return (
        <>
            {isMobile && !sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-50 p-2.5 glass-card rounded-lg lg:hidden cursor-pointer"
                    aria-label="Åpne meny"
                >
                    <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
            )}

            {!isMobile && (
                <aside className="w-72 glass-sidebar h-full flex flex-col shrink-0">
                    {sidebarContent}
                </aside>
            )}

            {isMobile && (
                <>
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
                            onClick={() => setSidebarOpen(false)}
                            aria-hidden="true"
                        />
                    )}
                    <aside
                        ref={sidebarRef}
                        className={cn(
                            "fixed inset-y-0 left-0 z-40 w-72 glass-sidebar flex flex-col transform transition-transform duration-300 ease-in-out",
                            sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigasjonsmeny"
                    >
                        {sidebarContent}
                    </aside>
                </>
            )}

            {showLogoutConfirm && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="glass-card-elevated p-6 max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            Logg ut
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Er du sikker på at du vil logge ut?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="glass-btn-secondary flex-1 !text-sm !py-2.5"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 bg-[var(--error)] hover:bg-red-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                            >
                                Logg ut
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
