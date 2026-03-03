'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, PlusCircle, Star, ArrowRight, Trash2, Stethoscope, Brain, Smile, Activity, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { csrfHeaders } from '@/lib/csrf-client';
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
    allmennmedisin: '#5E6AD2',
    tannhelse: '#10B981',
    psykoterapi: '#5E6AD2',
    kirurgi: '#F59E0B',
    fysioterapi: '#7B89DB',
};

function getColorForTemplate(template: Template): string {
    return CATEGORY_COLORS[template.category?.toLowerCase()] || '#5E6AD2';
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
                headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
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
                headers: csrfHeaders(),
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
        <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
            <AppSidebar>
                {/* Specialty filters inside AppSidebar children slot */}
                <div className="mt-6 px-2">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-2 text-[#8B8B8B]">
                        Spesialiteter
                    </p>
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
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 cursor-pointer w-full',
                                        isActive
                                            ? 'bg-[rgba(94,106,210,0.1)] text-[#7B89DB]'
                                            : 'text-[#8B8B8B] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#EDEDED]'
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
                {/* Header */}
                <header className="bg-[#111111]/80 border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-10 px-8 py-5 flex items-center justify-between backdrop-blur-sm">
                    <div className="flex items-center gap-6 flex-1">
                        <h2 className="text-2xl font-bold text-[#EDEDED]">
                            Mal-bibliotek
                        </h2>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5C5C5C]" />
                            <input
                                className="bg-[#222222] border border-[rgba(255,255,255,0.06)] rounded-lg text-[#EDEDED] pl-10 pr-3 py-2.5 text-sm w-full focus:outline-none focus:border-[#5E6AD2] placeholder:text-[#5C5C5C] transition-colors duration-150"
                                placeholder="Sok i maler..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreateTemplate}
                        className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2.5 transition-colors duration-150 text-sm flex items-center gap-2 cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Opprett egen mal
                    </button>
                </header>

                <div className="p-8 max-w-6xl mx-auto w-full">
                    {/* Filter Tabs */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-1 bg-[#191919] p-1 rounded-lg">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer',
                                        activeTab === tab.id
                                            ? 'bg-[#5E6AD2] text-white'
                                            : 'text-[#8B8B8B] hover:text-[#EDEDED]'
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#8B8B8B]">
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
                        <div className="flex flex-col items-center justify-center py-24">
                            <FileText className="w-12 h-12 mb-4 text-[#5C5C5C]" />
                            <h3 className="text-lg font-semibold mb-2 text-[#EDEDED]">
                                Ingen maler funnet
                            </h3>
                            <p className="text-sm mb-6 text-center max-w-sm text-[#5C5C5C]">
                                {searchTerm
                                    ? `Ingen resultater for "${searchTerm}". Prov et annet sokeord.`
                                    : activeTab === 'favorites'
                                        ? 'Du har ingen favorittmaler enna. Klikk pa stjernen for a legge til favoritter.'
                                        : 'Kom i gang ved a opprette din forste mal.'}
                            </p>
                            <button
                                onClick={handleCreateTemplate}
                                className="bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-2.5 transition-colors duration-150 text-sm flex items-center gap-2 cursor-pointer"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Opprett egen mal
                            </button>
                        </div>
                    )}

                    {/* Template Grid */}
                    {!loading && displayedTemplates.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {displayedTemplates.map((template) => {
                                const color = getColorForTemplate(template);
                                return (
                                    <div
                                        key={template.id}
                                        className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[rgba(255,255,255,0.10)] transition-all duration-200 p-6 flex flex-col h-[280px] group cursor-pointer hover:scale-[1.01]"
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
                                                        className="transition-all duration-200 opacity-0 group-hover:opacity-100 p-1 cursor-pointer text-[#5C5C5C] hover:text-[#EF4444]"
                                                        title="Slett mal"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleToggleFavorite(template, e)}
                                                    className={cn(
                                                        'transition-colors duration-150 p-1 cursor-pointer',
                                                        template.isFavorite
                                                            ? 'text-[#F59E0B]'
                                                            : 'text-[#5C5C5C] hover:text-[#F59E0B]'
                                                    )}
                                                    title={template.isFavorite ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
                                                >
                                                    <Star className={cn('w-5 h-5', template.isFavorite && 'fill-current')} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 text-[#EDEDED]">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm mb-5 line-clamp-2 text-[#8B8B8B]">
                                            {template.content
                                                ? template.content.replace(/<[^>]*>/g, '').slice(0, 100) + (template.content.length > 100 ? '...' : '')
                                                : template.profession || 'Ingen beskrivelse'}
                                        </p>

                                        {/* Content Preview - skeleton lines */}
                                        <div className="flex-1 rounded-lg p-4 mb-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                                            <div className="space-y-2">
                                                <div className="h-1.5 w-3/4 rounded-full bg-[rgba(255,255,255,0.10)]" />
                                                <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.10)]" />
                                                <div className="h-1.5 w-1/2 rounded-full bg-[rgba(255,255,255,0.10)]" />
                                                <div className="h-1.5 w-5/6 rounded-full bg-[rgba(255,255,255,0.10)]" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-xs font-medium text-[#5C5C5C]">
                                                {formatUsage(template)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePreview(template);
                                                }}
                                                className="text-sm font-semibold transition-all duration-200 flex items-center gap-1 opacity-0 group-hover:opacity-100 cursor-pointer text-[#7B89DB] hover:text-[#5E6AD2]"
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
                                className="rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer transition-all duration-200 h-[280px] border-2 border-dashed border-[rgba(255,255,255,0.10)] hover:border-[#5E6AD2] hover:bg-[rgba(94,106,210,0.08)]"
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-200 bg-[rgba(255,255,255,0.03)] group-hover:bg-[rgba(94,106,210,0.15)]">
                                    <PlusCircle className="w-6 h-6 transition-colors duration-200 text-[#5C5C5C] group-hover:text-[#7B89DB]" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-[#EDEDED]">
                                    Egendefinert mal
                                </h3>
                                <p className="text-sm max-w-[200px] text-[#5C5C5C]">
                                    Design en spesialisert struktur skreddersydd for din arbeidsflyt.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
