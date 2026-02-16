'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DOMPurify from 'dompurify';
import { Mic, BookOpen, PlusCircle, Search, Calendar, Clock, CheckCircle, Edit3, Trash2, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import { SkeletonList } from '@/components/Skeleton';
import { useUserProfile } from '@/hooks/useUserProfile';

interface JournalEntry {
    id: string;
    userId: string;
    patientId: string | null;
    patientName: string | null;
    title: string;
    content: string;
    template: string | null;
    status: string;
    diagnosisCodes: unknown;
    recordingId: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function Journal() {
    const router = useRouter();
    const { profile } = useUserProfile();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEntries = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`/api/journal?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
                if (data.length > 0 && !selectedEntry) {
                    setSelectedEntry(data[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch journal entries:', err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleApprove = async () => {
        if (!selectedEntry) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/journal/${selectedEntry.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' }),
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedEntry(updated);
                setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
            }
        } catch (err) {
            console.error('Failed to approve entry:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEntry) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/journal/${selectedEntry.id}`, { method: 'DELETE' });
            if (res.ok) {
                setEntries(prev => prev.filter(e => e.id !== selectedEntry.id));
                setSelectedEntry(null);
                setShowDeleteConfirm(false);
            }
        } catch (err) {
            console.error('Failed to delete entry:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('nb-NO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-screen bg-[var(--bg-deep)] overflow-hidden">
            <AppSidebar />

            {/* Left Panel - Entry List */}
            <aside className="w-80 glass-sidebar flex flex-col shrink-0">
                {/* Header */}
                <div className="p-5 border-b border-[var(--glass-border)]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Journal</h2>
                        <Link href="/editor" className="glass-btn-primary text-xs !py-2 !px-3 flex items-center gap-1.5 cursor-pointer">
                            <PlusCircle className="w-3.5 h-3.5" />
                            Ny oppføring
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Søk i journaloppføringer..."
                            className="glass-input glass-input-sm !pl-9"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="glass-pill-group">
                        {[
                            { value: '', label: 'Alle' },
                            { value: 'draft', label: 'Utkast' },
                            { value: 'approved', label: 'Ferdigstilt' },
                        ].map(f => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={cn(
                                    "glass-pill cursor-pointer",
                                    statusFilter === f.value && "active"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Entry List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="px-5 py-4">
                            <SkeletonList count={5} />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12 px-5">
                            <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                            <p className="text-sm text-[var(--text-secondary)]">Ingen journaloppføringer ennå</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Opprett en ny oppføring for å komme i gang</p>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => setSelectedEntry(entry)}
                                className={cn(
                                    "w-full text-left p-5 border-b border-[var(--glass-border)] hover:bg-[var(--glass-hover)] transition-colors cursor-pointer",
                                    selectedEntry?.id === entry.id && "bg-[var(--glass-hover)] border-l-3 border-l-[var(--primary)]"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono text-[var(--primary-light)] font-medium">
                                        {entry.patientName || entry.patientId || 'Ukjent pasient'}
                                    </span>
                                    <span className={cn(
                                        "glass-badge",
                                        entry.status === 'approved' ? "glass-badge-success" : "glass-badge-warning"
                                    )}>
                                        {entry.status === 'approved' ? 'Ferdigstilt' : 'Utkast'}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-[var(--text-primary)] mb-1 line-clamp-2">{entry.title}</p>
                                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(entry.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(entry.createdAt)}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Right Panel - Entry Detail */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {selectedEntry ? (
                    <>
                        {/* Detail Header */}
                        <div className="p-6 border-b border-[var(--glass-border)] glass-header flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-mono text-[var(--primary-light)] font-semibold">
                                        {selectedEntry.patientName || selectedEntry.patientId || 'Ukjent pasient'}
                                    </span>
                                    <span className={cn(
                                        "glass-badge",
                                        selectedEntry.status === 'approved' ? "glass-badge-success" : "glass-badge-warning"
                                    )} aria-live="polite">
                                        {selectedEntry.status === 'approved' ? 'Ferdigstilt' : 'Utkast'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(selectedEntry.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {formatTime(selectedEntry.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-4 h-4" />
                                        {profile?.name || 'Lege'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/editor?id=${selectedEntry.id}`}
                                    className="glass-btn-ghost text-sm flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Edit3 className="w-4 h-4" /> Rediger
                                </Link>
                                {selectedEntry.status === 'draft' && (
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="glass-btn-primary text-sm !py-2 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Ferdigstill
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="glass-btn-ghost text-sm flex items-center gap-1.5 text-[var(--error)] hover:text-[var(--error)] cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Entry Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-3xl animate-fade-in">
                                {/* Template badge */}
                                {selectedEntry.template && (
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="glass-badge glass-badge-primary">
                                            {selectedEntry.template}
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <div className="mb-8">
                                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Tittel</h3>
                                    <p className="text-lg text-[var(--text-primary)] font-medium">
                                        {selectedEntry.title}
                                    </p>
                                </div>

                                {/* Full Content */}
                                <div className="mb-8">
                                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Journalnotat</h3>
                                    <div className="p-6 glass-card-static rounded-xl">
                                        <div
                                            className="text-[var(--text-secondary)] leading-relaxed prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEntry.content) }}
                                        />
                                    </div>
                                </div>

                                {/* Quick Dictation */}
                                <div className="glass-card-static p-5">
                                    <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Legg til med diktering</h3>
                                    <Link href="/dictation" className="flex items-center gap-3 p-4 glass-card rounded-lg group cursor-pointer">
                                        <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                                            <Mic className="w-5 h-5 text-[var(--primary-light)] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">Start diktering</p>
                                            <p className="text-xs text-[var(--text-muted)]">Snakk fritt for å legge til mer tekst</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center animate-fade-in">
                            <BookOpen className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                            <p className="text-lg text-[var(--text-secondary)]">
                                {entries.length === 0 ? 'Ingen oppføringer ennå' : 'Velg en oppføring for å se detaljer'}
                            </p>
                            {entries.length === 0 && (
                                <Link href="/editor" className="glass-btn-primary mt-4 inline-flex items-center gap-2 cursor-pointer">
                                    <PlusCircle className="w-4 h-4" />
                                    Opprett første oppføring
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="glass-card-elevated p-6 max-w-sm w-full mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            Slett oppføring
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Er du sikker på at du vil slette denne journaloppføringen? Denne handlingen kan ikke angres.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="glass-btn-secondary flex-1 !text-sm !py-2.5 cursor-pointer">
                                Avbryt
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 bg-[var(--error)] hover:bg-red-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Slett
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
