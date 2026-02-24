'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Activity,
    Mic,
    LayoutDashboard,
    PenLine,
    ClipboardList,
    LayoutGrid,
    Sparkles,
    LogOut,
    Menu,
    X,
    Search,
    FlaskConical,
    Bot,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from '@/components/ThemeToggle';
import AccentThemeSelector from '@/components/AccentThemeSelector';

const NAV_SECTIONS = [
    {
        label: 'Arbeidsflyt',
        items: [
            { href: '/dashboard', label: 'Oversikt', icon: LayoutDashboard },
            { href: '/dictation', label: 'Diktering', icon: Mic },
            { href: '/activity', label: 'EPJ-aktivitet', icon: Activity },
            { href: '/editor', label: 'Editor', icon: PenLine },
        ],
    },
    {
        label: 'Verktoy',
        items: [
            { href: '/forms', label: 'Skjemaer', icon: ClipboardList },
            { href: '/templates', label: 'Maler', icon: LayoutGrid },
            { href: '/summary', label: 'Oppsummering', icon: Sparkles },
        ],
    },
    {
        label: 'Referanse',
        items: [
            { href: '/lab', label: 'Laboratorium', icon: FlaskConical },
            { href: '/felleskatalogen', label: 'Felleskatalogen', icon: Bot },
        ],
    },
];

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

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
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, sidebarOpen]);

    const handleNavClick = useCallback(() => {
        if (isMobile) setSidebarOpen(false);
    }, [isMobile]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const displayName = profileLoading ? 'Laster...' : (profile?.name || 'Bruker');
    const displayRole = profile?.role || '';
    const initials = profileLoading ? '...' : getInitials(profile?.name || 'B');

    const sidebarContent = (
        <>
            {/* Brand */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 group"
                    onClick={handleNavClick}
                >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[var(--surface-overlay)]">
                        <Activity className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                    </div>
                    <span className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">
                        Vocura
                    </span>
                </Link>
                <div className="flex items-center gap-0.5">
                    <AccentThemeSelector />
                    <ThemeToggle />
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1.5 rounded-md text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors lg:hidden"
                            aria-label="Lukk meny"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Cmd+K Search Trigger */}
            <div className="px-3 pb-2">
                <button
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-[var(--text-secondary)] bg-[var(--surface-overlay)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                    onClick={() => {
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                    }}
                    type="button"
                >
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 text-left">Hurtigsok...</span>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium font-sans bg-[var(--surface-overlay)] text-[var(--text-muted)]">
                        <span className="text-[11px]">&#8984;</span>K
                    </kbd>
                </button>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 px-3 pb-2 overflow-y-auto">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label} className="mb-3">
                        <p className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] font-sans px-2.5 mb-1 select-none">
                            {section.label}
                        </p>
                        <div className="space-y-px">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== '/dashboard' &&
                                        pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={handleNavClick}
                                        className={cn(
                                            'group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 border-l-2',
                                            isActive
                                                ? 'bg-[var(--surface-overlay)] text-[var(--text-primary)] border-[var(--accent-primary)] shadow-[inset_2px_0_8px_var(--accent-bg)]'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] border-transparent hover:border-[var(--accent-primary)] hover:shadow-[inset_2px_0_8px_var(--accent-bg)]'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'w-4 h-4 shrink-0',
                                                isActive
                                                    ? 'text-[var(--accent-primary)]'
                                                    : 'text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]'
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {children}
            </nav>

            {/* User Profile */}
            <div className="px-3 py-3 border-t border-[var(--border-default)]">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-[var(--accent-bg)] text-[var(--accent-text)] text-[11px] font-semibold select-none">
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-[var(--text-primary)] truncate leading-tight">
                            {displayName}
                        </p>
                        {displayRole && (
                            <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
                                {displayRole}
                            </p>
                        )}
                    </div>
                    <Link
                        href="/settings"
                        onClick={handleNavClick}
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer"
                        aria-label="Innstillinger"
                        title="Innstillinger"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </Link>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer"
                        aria-label="Logg ut"
                        title="Logg ut"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-full">
            {/* Mobile hamburger */}
            {isMobile && !sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[var(--surface-primary)] border border-[var(--border-default)] lg:hidden cursor-pointer"
                    aria-label="Apne meny"
                >
                    <Menu className="w-4 h-4 text-[var(--text-primary)]" />
                </button>
            )}

            {/* Desktop sidebar */}
            {!isMobile && (
                <aside className="w-[240px] bg-[var(--surface-primary)] border-r border-[var(--border-default)] h-full flex flex-col shrink-0">
                    {sidebarContent}
                </aside>
            )}

            {/* Mobile drawer */}
            {isMobile && (
                <>
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 bg-[var(--overlay-bg)] z-30 transition-opacity"
                            onClick={() => setSidebarOpen(false)}
                            aria-hidden="true"
                        />
                    )}
                    <aside
                        ref={sidebarRef}
                        className={cn(
                            'fixed inset-y-0 left-0 z-40 w-[240px] bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col transform transition-transform duration-300 ease-in-out',
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        )}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigasjonsmeny"
                    >
                        {sidebarContent}
                    </aside>
                </>
            )}

            {/* Main content area */}
            <main className="flex-1 min-w-0 h-full overflow-auto">
                {children}
            </main>

            {/* Logout confirmation modal */}
            {showLogoutConfirm && (
                <div
                    className="fixed inset-0 bg-[var(--overlay-bg)] z-50 flex items-center justify-center"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6 max-w-sm w-full mx-4"
                        style={{ boxShadow: 'var(--shadow-overlay)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                            Logg ut
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Er du sikker pa at du vil logge ut?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 text-sm font-medium py-2 px-4 rounded-md border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer"
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 bg-[var(--color-error)] hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
                            >
                                Logg ut
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
