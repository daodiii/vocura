'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Send,
    Search,
    Loader2,
    RefreshCw,
    Plug,
    Inbox,
} from 'lucide-react';
import { cn, fetchWithTimeout } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';

interface ActivityEntry {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    createdAt: string;
}

const ENTITY_TYPE_CONFIG: Record<string, { label: string; icon: typeof Send; color: string }> = {
    epj_push: {
        label: 'EPJ Push',
        icon: Send,
        color: 'text-[var(--accent-primary)] bg-[var(--accent-bg)]',
    },
    patient_context_import: {
        label: 'Pasient-sok',
        icon: Search,
        color: 'text-[var(--color-warning)] bg-[rgba(245,158,11,0.08)]',
    },
    epj_integration: {
        label: 'Integrasjon',
        icon: Plug,
        color: 'text-[var(--color-success)] bg-[rgba(16,185,129,0.08)]',
    },
};

function formatTimestamp(iso: string): string {
    try {
        return new Date(iso).toLocaleString('nb-NO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    } catch {
        return iso;
    }
}

function truncateId(id: string, maxLength = 12): string {
    if (id.length <= maxLength) return id;
    return id.slice(0, maxLength) + '\u2026';
}

const REFRESH_INTERVAL = 30_000; // 30 seconds

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const fetchActivities = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        setError(null);

        try {
            const res = await fetchWithTimeout('/api/activity?limit=50');
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 401) {
                    setError('Økten din har utløpt. Logg inn på nytt for å se aktivitetsloggen.');
                } else {
                    setError(data.error || `Kunne ikke hente aktivitetslogg (feilkode ${res.status}). Prøv igjen.`);
                }
                return;
            }
            const data = await res.json();
            setActivities(data.activities || []);
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Activity fetch error:', err);
            setError('Kunne ikke nå serveren. Sjekk internettforbindelsen din og prøv igjen.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities(true);
    }, [fetchActivities]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchActivities(false);
        }, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchActivities]);

    // Filter activities to today only for the primary display
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayActivities = activities.filter(
        (a) => new Date(a.createdAt) >= todayStart
    );
    const olderActivities = activities.filter(
        (a) => new Date(a.createdAt) < todayStart
    );

    return (
        <AppSidebar>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
                            <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">
                                EPJ-aktivitet
                            </h1>
                        </div>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                            Oversikt over notat sendt til EPJ i dag.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {lastRefresh && (
                            <span className="text-[11px] text-[var(--text-muted)]">
                                Sist oppdatert: {lastRefresh.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <button
                            onClick={() => fetchActivities(true)}
                            disabled={loading}
                            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer disabled:opacity-50"
                            title="Oppdater"
                        >
                            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 rounded-md bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
                        <p className="text-[13px] text-[var(--color-error)]">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && activities.length === 0 && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && activities.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center mb-4">
                            <Inbox className="w-6 h-6 text-[var(--text-muted)]" />
                        </div>
                        <p className="text-[14px] font-medium text-[var(--text-primary)] mb-1">
                            Ingen EPJ-aktivitet i dag
                        </p>
                        <p className="text-[13px] text-[var(--text-muted)] max-w-xs">
                            Start en diktering for a komme i gang.
                        </p>
                    </div>
                )}

                {/* Today's Activities */}
                {todayActivities.length > 0 && (
                    <section className="mb-8">
                        <p className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase mb-3">
                            I dag
                        </p>
                        <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg overflow-hidden">
                            <div className="divide-y divide-[var(--border-default)]">
                                {todayActivities.map((activity) => (
                                    <ActivityRow key={activity.id} activity={activity} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Older Activities */}
                {olderActivities.length > 0 && (
                    <section>
                        <p className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase mb-3">
                            Tidligere
                        </p>
                        <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg overflow-hidden">
                            <div className="divide-y divide-[var(--border-default)]">
                                {olderActivities.map((activity) => (
                                    <ActivityRow key={activity.id} activity={activity} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </AppSidebar>
    );
}

function ActivityRow({ activity }: { activity: ActivityEntry }) {
    const config = ENTITY_TYPE_CONFIG[activity.entityType] || {
        label: activity.entityType,
        icon: Activity,
        color: 'text-[var(--text-muted)] bg-[var(--surface-overlay)]',
    };
    const Icon = config.icon;

    return (
        <div className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface-overlay)] transition-colors">
            {/* Icon */}
            <div className={cn('w-8 h-8 rounded-md flex items-center justify-center shrink-0', config.color)}>
                <Icon className="w-4 h-4" />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">
                        {config.label}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--surface-overlay)]">
                        {activity.action}
                    </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5 truncate">
                    {truncateId(activity.entityId)}
                </p>
            </div>

            {/* Timestamp */}
            <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                {formatTimestamp(activity.createdAt)}
            </span>
        </div>
    );
}
