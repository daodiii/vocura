'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings,
    Plug,
    User,
    Shield,
    Loader2,
    CheckCircle2,
    XCircle,
    Trash2,
    X,
    ExternalLink,
    Clock,
} from 'lucide-react';
import { cn, fetchWithTimeout } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import { useUserProfile } from '@/hooks/useUserProfile';

type EpjSystem = 'dips' | 'eg-pasientsky' | 'pridok';

interface EpjStatus {
    isConnected: boolean;
    epjSystem?: string;
    careUnitId?: string;
    connectedAt?: string;
    lastTestedAt?: string;
    testOk?: boolean;
}

const EPJ_OPTIONS: { value: EpjSystem; label: string }[] = [
    { value: 'dips', label: 'DIPS' },
    { value: 'eg-pasientsky', label: 'EG Pasientsky' },
    { value: 'pridok', label: 'Pridok' },
];

function formatDateTime(iso: string): string {
    try {
        return new Date(iso).toLocaleString('nb-NO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

export default function SettingsPage() {
    const { profile, loading: profileLoading } = useUserProfile();

    // EPJ Connection state
    const [epjStatus, setEpjStatus] = useState<EpjStatus | null>(null);
    const [epjLoading, setEpjLoading] = useState(true);
    const [epjSystem, setEpjSystem] = useState<EpjSystem>('dips');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [careUnitId, setCareUnitId] = useState('');
    const [testLoading, setTestLoading] = useState(false);
    const [testError, setTestError] = useState<string | null>(null);
    const [testSuccess, setTestSuccess] = useState(false);
    const [disconnectLoading, setDisconnectLoading] = useState(false);

    // Delete data modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Retention settings state
    const [retentionHours, setRetentionHours] = useState(48);
    const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true);
    const [retentionLoading, setRetentionLoading] = useState(true);
    const [retentionSaving, setRetentionSaving] = useState(false);

    const fetchEpjStatus = useCallback(async () => {
        try {
            setEpjLoading(true);
            const res = await fetchWithTimeout('/api/user/epj-integration');
            if (res.ok) {
                const data: EpjStatus = await res.json();
                setEpjStatus(data);
                if (data.epjSystem) {
                    setEpjSystem(data.epjSystem as EpjSystem);
                }
                if (data.careUnitId) {
                    setCareUnitId(data.careUnitId);
                }
            }
        } catch (err) {
            console.error('Kunne ikke hente EPJ-status:', err);
            setTestError('Kunne ikke hente EPJ-tilkoblingsstatus. Sjekk internettforbindelsen.');
        } finally {
            setEpjLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEpjStatus();
    }, [fetchEpjStatus]);

    useEffect(() => {
        async function fetchRetention() {
            try {
                const res = await fetchWithTimeout('/api/retention/settings');
                if (res.ok) {
                    const data = await res.json();
                    setRetentionHours(data.textRetentionHours ?? 48);
                    setAutoDeleteEnabled(data.autoDeleteEnabled ?? true);
                }
            } catch (err) {
                console.error('Kunne ikke hente oppbevaringsinnstillinger:', err);
                // Bruker standardverdier ved feil
            } finally {
                setRetentionLoading(false);
            }
        }
        fetchRetention();
    }, []);

    const handleSaveRetention = async () => {
        setRetentionSaving(true);
        try {
            await fetchWithTimeout('/api/retention/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ textRetentionHours: retentionHours, autoDeleteEnabled }),
            });
        } catch (err) {
            console.error('Kunne ikke lagre oppbevaringsinnstillinger:', err);
            alert('Kunne ikke lagre oppbevaringsinnstillinger. Sjekk internettforbindelsen og prøv igjen.');
        } finally {
            setRetentionSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTestLoading(true);
        setTestError(null);
        setTestSuccess(false);

        try {
            const res = await fetchWithTimeout('/api/user/epj-integration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    epjSystem,
                    clientId,
                    clientSecret,
                    careUnitId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    setTestError('Økten din har utløpt. Logg inn på nytt og prøv igjen.');
                } else {
                    setTestError(data.error || 'Tilkoblingen til EPJ-systemet feilet. Sjekk at Client ID og Client Secret er korrekte.');
                }
                return;
            }

            if (data.testOk) {
                setTestSuccess(true);
                setClientId('');
                setClientSecret('');
                await fetchEpjStatus();
            } else {
                setTestError(data.testError || 'Tilkoblingstesten feilet. Verifiser at legitimasjon og behandlingsenhet-ID er korrekte.');
            }
        } catch (err) {
            console.error('EPJ test error:', err);
            setTestError('Kunne ikke nå EPJ-tjenesten. Sjekk internettforbindelsen og prøv igjen.');
        } finally {
            setTestLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setDisconnectLoading(true);
        try {
            const res = await fetchWithTimeout('/api/user/epj-integration', {
                method: 'DELETE',
            });
            if (res.ok) {
                setEpjStatus({ isConnected: false });
                setClientId('');
                setClientSecret('');
                setCareUnitId('');
                setTestSuccess(false);
                setTestError(null);
            }
        } catch (err) {
            console.error('Disconnect error:', err);
            setTestError('Kunne ikke koble fra EPJ. Sjekk internettforbindelsen og prøv igjen.');
        } finally {
            setDisconnectLoading(false);
        }
    };

    return (
        <AppSidebar>
            <div className="p-6 max-w-3xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2.5 mb-1">
                        <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
                        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">
                            Innstillinger
                        </h1>
                    </div>
                    <p className="text-[13px] text-[var(--text-secondary)]">
                        Administrer EPJ-tilkobling, profil og personvern.
                    </p>
                </div>

                {/* Section 1: EPJ-tilkobling */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Plug className="w-4 h-4 text-[var(--accent-primary)]" />
                        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                            EPJ-tilkobling
                        </h2>
                    </div>

                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6">
                        {epjLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
                            </div>
                        ) : (
                            <>
                                {/* Connection Status */}
                                {epjStatus?.isConnected && (
                                    <div className="mb-6 p-4 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                                            <span className="text-[13px] font-medium text-[var(--color-success)]">
                                                Tilkoblet
                                            </span>
                                        </div>
                                        <div className="space-y-1.5 text-[12px] text-[var(--text-secondary)]">
                                            <p>
                                                <span className="text-[var(--text-muted)]">System:</span>{' '}
                                                {EPJ_OPTIONS.find((o) => o.value === epjStatus.epjSystem)?.label || epjStatus.epjSystem}
                                            </p>
                                            <p>
                                                <span className="text-[var(--text-muted)]">Behandlingsenhet:</span>{' '}
                                                {epjStatus.careUnitId}
                                            </p>
                                            {epjStatus.connectedAt && (
                                                <p>
                                                    <span className="text-[var(--text-muted)]">Tilkoblet:</span>{' '}
                                                    {formatDateTime(epjStatus.connectedAt)}
                                                </p>
                                            )}
                                            {epjStatus.lastTestedAt && (
                                                <p>
                                                    <span className="text-[var(--text-muted)]">Sist testet:</span>{' '}
                                                    {formatDateTime(epjStatus.lastTestedAt)}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleDisconnect}
                                            disabled={disconnectLoading}
                                            className="mt-4 text-[12px] font-medium text-[var(--color-error)] hover:underline cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {disconnectLoading ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3 h-3" />
                                            )}
                                            Koble fra
                                        </button>
                                    </div>
                                )}

                                {!epjStatus?.isConnected && (
                                    <div className="mb-6 p-4 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)]">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-[var(--color-error)]" />
                                            <span className="text-[13px] font-medium text-[var(--color-error)]">
                                                Ikke tilkoblet
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Connection Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase block mb-1.5">
                                            EPJ-system
                                        </label>
                                        <select
                                            value={epjSystem}
                                            onChange={(e) => setEpjSystem(e.target.value as EpjSystem)}
                                            className="w-full text-[13px] px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        >
                                            {EPJ_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase block mb-1.5">
                                            Client ID
                                        </label>
                                        <input
                                            type="text"
                                            value={clientId}
                                            onChange={(e) => setClientId(e.target.value)}
                                            placeholder="Skriv inn Client ID"
                                            className="w-full text-[13px] px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase block mb-1.5">
                                            Client Secret
                                        </label>
                                        <input
                                            type="password"
                                            value={clientSecret}
                                            onChange={(e) => setClientSecret(e.target.value)}
                                            placeholder="Skriv inn Client Secret"
                                            className="w-full text-[13px] px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase block mb-1.5">
                                            Behandlingsenhet-ID
                                        </label>
                                        <input
                                            type="text"
                                            value={careUnitId}
                                            onChange={(e) => setCareUnitId(e.target.value)}
                                            placeholder="Skriv inn behandlingsenhet-ID"
                                            className="w-full text-[13px] px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                        />
                                    </div>

                                    {/* Error / Success Messages */}
                                    {testError && (
                                        <div className="p-3 rounded-md bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
                                            <p className="text-[12px] text-[var(--color-error)]">{testError}</p>
                                        </div>
                                    )}
                                    {testSuccess && (
                                        <div className="p-3 rounded-md bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)]">
                                            <p className="text-[12px] text-[var(--color-success)]">
                                                Tilkobling vellykket! EPJ-integrasjonen er aktiv.
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleTestConnection}
                                        disabled={testLoading || !clientId || !clientSecret || !careUnitId}
                                        className={cn(
                                            'w-full flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer',
                                            'bg-[var(--accent-primary)] hover:opacity-90 text-white',
                                            'disabled:opacity-50 disabled:cursor-not-allowed'
                                        )}
                                    >
                                        {testLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plug className="w-4 h-4" />
                                        )}
                                        Test tilkobling
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Section 2: Profil */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-4 h-4 text-[var(--accent-primary)]" />
                        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                            Profil
                        </h2>
                    </div>

                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6">
                        {profileLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
                            </div>
                        ) : profile ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase mb-1">
                                        Navn
                                    </p>
                                    <p className="text-[13px] text-[var(--text-primary)]">
                                        {profile.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase mb-1">
                                        Profesjon
                                    </p>
                                    <p className="text-[13px] text-[var(--text-primary)]">
                                        {profile.role || 'Ikke angitt'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase mb-1">
                                        HPR-nummer
                                    </p>
                                    <p className="text-[13px] text-[var(--text-primary)] font-mono">
                                        {profile.hprNumber || 'Ikke angitt'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[13px] text-[var(--text-muted)]">
                                Kunne ikke laste profilen din. Sjekk internettforbindelsen eller prøv å laste siden på nytt.
                            </p>
                        )}
                    </div>
                </section>

                {/* Section 3: Dataoppbevaring */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
                        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                            Dataoppbevaring
                        </h2>
                    </div>
                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6">
                        {retentionLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                                    Etter overføring til EPJ slettes notater automatisk fra Vocura. Vocura er et følgeverktøy, ikke et journalsystem.
                                </p>
                                <div>
                                    <label className="text-[11px] font-medium tracking-wider text-[var(--text-muted)] uppercase block mb-1.5">
                                        Oppbevaringstid etter EPJ-overføring
                                    </label>
                                    <select
                                        value={retentionHours}
                                        onChange={(e) => setRetentionHours(Number(e.target.value))}
                                        className="w-full text-[13px] px-3 py-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                                    >
                                        <option value={24}>24 timer</option>
                                        <option value={48}>48 timer</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[13px] font-medium text-[var(--text-primary)]">
                                            Automatisk sletting
                                        </p>
                                        <p className="text-[11px] text-[var(--text-muted)]">
                                            Slett notater automatisk etter oppbevaringstiden
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setAutoDeleteEnabled(!autoDeleteEnabled)}
                                        className={cn(
                                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
                                            autoDeleteEnabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-overlay)]'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                                autoDeleteEnabled ? 'translate-x-6' : 'translate-x-1'
                                            )}
                                        />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSaveRetention}
                                    disabled={retentionSaving}
                                    className={cn(
                                        'w-full flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-md transition-colors cursor-pointer',
                                        'bg-[var(--accent-primary)] hover:opacity-90 text-white',
                                        'disabled:opacity-50 disabled:cursor-not-allowed'
                                    )}
                                >
                                    {retentionSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Lagre innstillinger
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 4: Personvern */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
                        <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">
                            Personvern
                        </h2>
                    </div>

                    <div className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                                    Vocura behandler personopplysninger i samsvar med GDPR og norsk
                                    helselovgivning. Lydopptak og transkripsjoner behandles i sanntid
                                    og lagres ikke permanent med mindre du eksplisitt velger det.
                                    Alle data krypteres i transit og i hvile.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href="/personvern"
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent-primary)] hover:underline"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Les personvernerklaering
                                </a>
                                <a
                                    href="/vilkar"
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent-primary)] hover:underline"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Vilkar for bruk
                                </a>
                                <a
                                    href="/sikkerhet"
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent-primary)] hover:underline"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Sikkerhet og tillit
                                </a>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-default)]">
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-error)] hover:underline cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Slett mine data
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Delete Data Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-[var(--overlay-bg)] z-50 flex items-center justify-center"
                    onClick={() => setShowDeleteModal(false)}
                >
                    <div
                        className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-6 max-w-sm w-full mx-4"
                        style={{ boxShadow: 'var(--shadow-overlay)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-[var(--text-primary)]">
                                Slett mine data
                            </h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[13px] text-[var(--text-secondary)] mb-4 leading-relaxed">
                            For a slette alle dine data, vennligst kontakt oss pa{' '}
                            <a
                                href="mailto:personvern@vocura.no"
                                className="text-[var(--accent-primary)] hover:underline font-medium"
                            >
                                personvern@vocura.no
                            </a>
                            . Vi behandler foresporselen innen 30 dager i henhold til GDPR.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="w-full text-sm font-medium py-2 px-4 rounded-md border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors cursor-pointer"
                        >
                            Lukk
                        </button>
                    </div>
                </div>
            )}
        </AppSidebar>
    );
}
