'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, PlusCircle, Star, ArrowRight, Trash2, Loader2, Stethoscope, Brain, Smile, Activity, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';
import { SkeletonCard } from '@/components/Skeleton';

interface Template {
    id: string;
    userId: string | null;
    name: string;
    profession: string;
    content: string;
    category: string;
    isDefault: boolean;
    isFavorite: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

type FilterTab = 'all' | 'popular' | 'recent' | 'favorites';

const SPECIALTIES = [
    { name: 'Allmennmedisin', icon: Stethoscope, category: 'allmennmedisin' },
    { name: 'Tannhelse', icon: Smile, category: 'tannhelse' },
    { name: 'Psykoterapi', icon: Brain, category: 'psykoterapi' },
    { name: 'Kirurgi', icon: Heart, category: 'kirurgi' },
    { name: 'Fysioterapi', icon: Activity, category: 'fysioterapi' },
];

const CATEGORY_COLORS: Record<string, string> = {
    allmennmedisin: 'var(--primary)',
    tannhelse: 'var(--success)',
    psykoterapi: 'var(--accent)',
    kirurgi: 'var(--warning)',
    fysioterapi: 'var(--primary-light)',
};

function getColorForTemplate(template: Template): string {
    return CATEGORY_COLORS[template.category?.toLowerCase()] || 'var(--primary)';
}

function formatUsage(template: Template): string {
    if (template.usageCount === 0) return 'Aldri brukt';
    if (template.usageCount === 1) return 'Brukt 1 gang';
    return `Brukt ${template.usageCount} ganger`;
}

export default function Templates() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm.trim()) {
                params.set('search', searchTerm.trim());
            }
            if (activeTab === 'popular') {
                params.set('sort', 'popular');
            } else if (activeTab === 'recent') {
                params.set('sort', 'recent');
            }

            const queryString = params.toString();
            const url = `/api/templates${queryString ? `?${queryString}` : ''}`;
            const res = await fetch(url);

            if (res.ok) {
                const data: Template[] = await res.json();
                setTemplates(data);
            } else {
                console.error('Failed to fetch templates:', res.status);
                setTemplates([]);
            }
        } catch (err) {
            console.error('Error fetching templates:', err);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, activeTab]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTemplates();
        }, 300);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleToggleFavorite = async (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/templates/${template.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFavorite: !template.isFavorite }),
            });
            if (res.ok) {
                setTemplates((prev) =>
                    prev.map((t) =>
                        t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t
                    )
                );
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    const handleDelete = async (template: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Er du sikker på at du vil slette malen "${template.name}"?`)) return;
        try {
            const res = await fetch(`/api/templates/${template.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setTemplates((prev) => prev.filter((t) => t.id !== template.id));
            }
        } catch (err) {
            console.error('Failed to delete template:', err);
        }
    };

    const handlePreview = (template: Template) => {
        router.push(`/editor?templateId=${template.id}`);
    };

    const handleCreateTemplate = () => {
        router.push('/editor?mode=template');
    };

    // Client-side filtering for favorites and specialty
    const displayedTemplates = templates.filter((t) => {
        if (activeTab === 'favorites' && !t.isFavorite) return false;
        if (activeSpecialty && t.category?.toLowerCase() !== activeSpecialty) return false;
        return true;
    });

    const tabs: { id: FilterTab; label: string }[] = [
        { id: 'all', label: 'Alle maler' },
        { id: 'popular', label: 'Mest brukte' },
        { id: 'recent', label: 'Siste' },
        { id: 'favorites', label: 'Favoritter' },
    ];

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
            <AppSidebar>
                {/* Specialty filters inside AppSidebar children slot */}
                <div className="mt-6 px-2">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--text-secondary)' }}>Spesialiteter</p>
                    <div className="space-y-1">
                        {SPECIALTIES.map((specialty) => {
                            const Icon = specialty.icon;
                            const isActive = activeSpecialty === specialty.category;
                            return (
                                <button
                                    key={specialty.name}
                                    onClick={() =>
                                        setActiveSpecialty(isActive ? null : specialty.category)
                                    }
                                    className={cn(
                                        'sidebar-nav-item w-full cursor-pointer',
                                        isActive && 'active'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{specialty.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </AppSidebar>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <header className="glass-header sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Mal-bibliotek</h2>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                className="glass-input !pl-10 !py-2.5"
                                placeholder="Søk i maler..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreateTemplate}
                        className="glass-btn-primary text-sm !py-2.5 flex items-center gap-2 cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Opprett egen mal
                    </button>
                </header>

                <div className="p-8 max-w-6xl mx-auto w-full">
                    {/* Filter Tabs */}
                    <div className="flex items-center justify-between mb-8 animate-fade-in">
                        <div className="glass-pill-group">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'glass-pill cursor-pointer',
                                        activeTab === tab.id && 'active'
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span>
                                {displayedTemplates.length} mal{displayedTemplates.length !== 1 ? 'er' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" role="status">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} className="h-[280px]" />
                            ))}
                            <span className="sr-only">Laster maler...</span>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && displayedTemplates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                            <FileText className="w-12 h-12 mb-4" style={{ color: 'var(--text-muted)' }} />
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                Ingen maler funnet
                            </h3>
                            <p className="text-sm mb-6 text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
                                {searchTerm
                                    ? `Ingen resultater for "${searchTerm}". Prøv et annet søkeord.`
                                    : activeTab === 'favorites'
                                        ? 'Du har ingen favorittmaler ennå. Klikk på stjernen for å legge til favoritter.'
                                        : 'Kom i gang ved å opprette din første mal.'}
                            </p>
                            <button
                                onClick={handleCreateTemplate}
                                className="glass-btn-primary text-sm !py-2.5 flex items-center gap-2 cursor-pointer"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Opprett egen mal
                            </button>
                        </div>
                    )}

                    {/* Template Grid */}
                    {!loading && displayedTemplates.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in stagger-1">
                            {displayedTemplates.map((template) => {
                                const color = getColorForTemplate(template);
                                return (
                                    <div
                                        key={template.id}
                                        className="glass-card p-6 flex flex-col h-[280px] group cursor-pointer"
                                        onClick={() => handlePreview(template)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                                            >
                                                <FileText className="w-5 h-5" style={{ color }} />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {/* Delete button - visible on hover */}
                                                {!template.isDefault && (
                                                    <button
                                                        onClick={(e) => handleDelete(template, e)}
                                                        className="transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                                                        style={{ color: 'var(--text-muted)' }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error)')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                                                        title="Slett mal"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleToggleFavorite(template, e)}
                                                    className={cn(
                                                        'transition-colors p-1 cursor-pointer',
                                                        template.isFavorite
                                                            ? 'text-[var(--warning)]'
                                                            : 'hover:text-[var(--warning)]'
                                                    )}
                                                    style={!template.isFavorite ? { color: 'var(--text-muted)' } : undefined}
                                                    title={template.isFavorite ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
                                                >
                                                    <Star className={cn('w-5 h-5', template.isFavorite && 'fill-current')} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                            {template.name}
                                        </h3>
                                        <p className="text-sm mb-5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                            {template.content
                                                ? template.content.replace(/<[^>]*>/g, '').slice(0, 100) + (template.content.length > 100 ? '...' : '')
                                                : template.profession || 'Ingen beskrivelse'}
                                        </p>

                                        {/* Content Preview - skeleton lines */}
                                        <div className="flex-1 rounded-lg p-4 mb-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                                            <div className="space-y-2">
                                                <div className="h-1.5 w-3/4 rounded-full" style={{ background: 'var(--glass-border-hover)' }} />
                                                <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--glass-border-hover)' }} />
                                                <div className="h-1.5 w-1/2 rounded-full" style={{ background: 'var(--glass-border-hover)' }} />
                                                <div className="h-1.5 w-5/6 rounded-full" style={{ background: 'var(--glass-border-hover)' }} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                                {formatUsage(template)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePreview(template);
                                                }}
                                                className="text-sm font-semibold transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                                                style={{ color: 'var(--primary-light)' }}
                                            >
                                                Forhåndsvis <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Create Custom Template */}
                            <div
                                onClick={handleCreateTemplate}
                                className="rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer transition-all h-[280px]"
                                style={{
                                    border: '2px dashed var(--glass-border-hover)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.background = 'var(--primary-subtle)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors" style={{ background: 'var(--glass-bg)' }}>
                                    <PlusCircle className="w-6 h-6 transition-colors" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Egendefinert mal</h3>
                                <p className="text-sm max-w-[200px]" style={{ color: 'var(--text-muted)' }}>Design en spesialisert struktur skreddersydd for din arbeidsflyt.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
