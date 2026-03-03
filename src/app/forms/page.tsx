'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, FileText, Shield, Search, ChevronRight, UserPlus, Stethoscope, FileCheck, Heart, Brain, Activity, AlertTriangle, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';

interface FormTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    profession: string[];
    authority?: string;
    icon: React.ElementType;
    color: string;
}

const FORM_CATEGORIES = [
    { id: 'alle', name: 'Alle skjemaer', icon: ClipboardList },
    { id: 'inntak', name: 'Inntak og registrering', icon: UserPlus },
    { id: 'klinisk', name: 'Klinisk vurdering', icon: Stethoscope },
    { id: 'samtykke', name: 'Samtykke', icon: Shield },
    { id: 'sykemelding', name: 'Sykemelding (NAV)', icon: FileCheck },
    { id: 'henvisning', name: 'Henvisning', icon: ChevronRight },
    { id: 'helfo', name: 'HELFO-refusjon', icon: Building2 },
    { id: 'behandling', name: 'Behandlingsplan', icon: Heart },
    { id: 'tannhelse', name: 'Tannhelse', icon: FileText },
    { id: 'psykisk', name: 'Psykisk helse', icon: Brain },
    { id: 'fysioterapi', name: 'Fysioterapi', icon: Activity },
];

const FORMS: FormTemplate[] = [
    { id: '1', name: 'Pasientregistrering', description: 'Førstegangsregistrering for nye pasienter med demografiske data og medisinsk historikk.', category: 'inntak', profession: ['lege', 'tannlege', 'psykolog', 'fysioterapeut'], icon: UserPlus, color: '#5E6AD2' },
    { id: '2', name: 'SOAP Journalnotat', description: 'Standardisert klinisk dokumentasjon (Subjektiv, Objektiv, Analyse, Plan).', category: 'klinisk', profession: ['lege', 'psykolog', 'fysioterapeut'], icon: Stethoscope, color: '#14B8A6' },
    { id: '3', name: 'Samtykke til helsehjelp', description: 'GDPR-kompatibelt samtykkeformular i henhold til Pasient- og brukerrettighetsloven.', category: 'samtykke', profession: ['lege', 'tannlege', 'psykolog', 'fysioterapeut'], authority: 'Helsedirektoratet', icon: Shield, color: '#10B981' },
    { id: '4', name: 'Sykemelding', description: 'Elektronisk sykemelding for innsending til NAV. Dokumenterer medisinsk årsak og arbeidsevne.', category: 'sykemelding', profession: ['lege'], authority: 'NAV', icon: FileCheck, color: '#F59E0B' },
    { id: '5', name: 'Henvisning til spesialist', description: 'Henvisningsskjema fra fastlege til spesialisthelsetjenesten.', category: 'henvisning', profession: ['lege', 'psykolog'], icon: ChevronRight, color: '#EC4899' },
    { id: '6', name: 'HELFO Refusjonskrav', description: 'Skjema for refusjonskrav fra HELFO for utført behandling.', category: 'helfo', profession: ['lege', 'tannlege', 'fysioterapeut'], authority: 'HELFO', icon: Building2, color: '#3B82F6' },
    { id: '7', name: 'Behandlingsplan', description: 'Strukturert behandlingsplan med mål, tiltak og oppfølgingsplan.', category: 'behandling', profession: ['lege', 'tannlege', 'psykolog', 'fysioterapeut'], icon: Heart, color: '#EF4444' },
    { id: '8', name: 'Tannkart og behandlingsplan', description: 'Visuelt tannkart med behandlingsplanlegging og kostnadsoverslag.', category: 'tannhelse', profession: ['tannlege'], icon: FileText, color: '#F97316' },
    { id: '9', name: 'HELFO tannlegerefusjon', description: 'Refusjonskrav for tannbehandling gjennom HELFO-ordningen.', category: 'tannhelse', profession: ['tannlege'], authority: 'HELFO', icon: Building2, color: '#3B82F6' },
    { id: '10', name: 'Inntaksnotat (psykisk helse)', description: 'Strukturert inntaksnotat for første konsultasjon med vurdering av psykisk helsetilstand.', category: 'psykisk', profession: ['psykolog'], icon: Brain, color: '#8B5CF6' },
    { id: '11', name: 'Suicidalvurdering', description: 'Strukturert vurdering av suicidalrisiko med handlingsplan.', category: 'psykisk', profession: ['psykolog'], authority: 'Helsedirektoratet', icon: AlertTriangle, color: '#EF4444' },
    { id: '12', name: 'Funksjonsvurdering (ICF)', description: 'Funksjonsvurdering basert på WHO sitt ICF-rammeverk.', category: 'fysioterapi', profession: ['fysioterapeut'], icon: Activity, color: '#06B6D4' },
    { id: '13', name: 'Opptreningsplan', description: 'Detaljert opptreningsplan med øvelser, mål og progresjon.', category: 'fysioterapi', profession: ['fysioterapeut'], icon: Activity, color: '#14B8A6' },
    { id: '14', name: 'HELFO fysioterapirefusjon', description: 'Refusjonskrav for fysioterapibehandling til HELFO.', category: 'fysioterapi', profession: ['fysioterapeut'], authority: 'HELFO', icon: Building2, color: '#3B82F6' },
    { id: '15', name: 'Aktivitetskrav erklæring (8 uker)', description: 'Erklæring om aktivitetskrav ved sykemelding over 8 uker.', category: 'sykemelding', profession: ['lege'], authority: 'NAV', icon: FileCheck, color: '#F59E0B' },
    { id: '16', name: 'Smertekart / Kroppskart', description: 'Interaktivt kroppskart for dokumentasjon av smerteområder med NPRS-skala.', category: 'fysioterapi', profession: ['fysioterapeut'], icon: Activity, color: '#F97316' },
    { id: '17', name: 'PHQ-9 Depresjonsskala', description: 'Standardisert screeningverktøy for vurdering av depresjonssymptomer.', category: 'psykisk', profession: ['psykolog', 'lege'], icon: Brain, color: '#8B5CF6' },
];

const FORM_ROUTES: Record<string, string> = {
    '1': '/forms/pasientregistrering',
    '2': '/forms/soap',
    '3': '/forms/samtykke',
    '4': '/forms/sykemelding',
    '5': '/forms/henvisning',
    '6': '/forms/helfo-refusjon',
    '7': '/forms/behandlingsplan',
    '8': '/forms/tannkart',
    '9': '/forms/helfo-tannlege',
    '10': '/forms/inntak-psykisk',
    '11': '/forms/suicidalvurdering',
    '12': '/forms/funksjonsvurdering',
    '13': '/forms/opptreningsplan',
    '14': '/forms/helfo-fysioterapi',
    '15': '/forms/aktivitetskrav',
    '16': '/forms/body-diagram',
    '17': '/forms/phq9',
};

export default function Forms() {
    const [activeCategory, setActiveCategory] = useState('alle');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredForms = FORMS.filter(form => {
        const matchesCategory = activeCategory === 'alle' || form.category === activeCategory;
        const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            form.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex h-screen bg-[var(--surface-deep)] overflow-hidden">
            <AppSidebar />

            {/* Category Sidebar */}
            <aside className="w-56 bg-[var(--surface-primary)] border-r border-[var(--border-default)] flex flex-col shrink-0">
                <div className="p-4 border-b border-[var(--border-default)]">
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">Kategorier</h2>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Skjemakategorier">
                    {FORM_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                aria-current={activeCategory === category.id ? 'true' : undefined}
                                aria-label={`Filtrer: ${category.name}`}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150 w-full cursor-pointer",
                                    activeCategory === category.id
                                        ? "bg-[var(--accent-bg)] text-[var(--text-primary)]"
                                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-sm">{category.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
                <header className="px-8 py-5 border-b border-[var(--border-default)] bg-[var(--surface-primary)]/80 flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                            {FORM_CATEGORIES.find(c => c.id === activeCategory)?.name || 'Skjemaer'}
                        </h2>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[var(--surface-hover)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] placeholder:text-[var(--text-muted)] pl-10 py-2.5 w-full"
                                placeholder="Søk i skjemaer..." aria-label="Søk i skjemaer"
                            />
                        </div>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">{filteredForms.length} skjemaer</span>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredForms.map((form) => {
                                const Icon = form.icon;
                                return (
                                    <Link key={form.id} href={FORM_ROUTES[form.id] || '#'} className="bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-xl p-5 group flex flex-col cursor-pointer hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${form.color}14` }}
                                            >
                                                <Icon className="w-5 h-5" style={{ color: form.color }} />
                                            </div>
                                            {form.authority && (
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium",
                                                    form.authority === 'NAV'
                                                        ? "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]"
                                                        : "bg-[var(--accent-bg)] text-[var(--accent-secondary)]"
                                                )}>
                                                    {form.authority}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">
                                            {form.name}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)] mb-4 flex-1">{form.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                {form.profession.slice(0, 3).map((prof) => (
                                                    <span key={prof} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--accent-bg)] text-[var(--accent-text)] capitalize">
                                                        {prof}
                                                    </span>
                                                ))}
                                                {form.profession.length > 3 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--surface-overlay)] text-[var(--text-muted)] border border-[var(--border-default)]">
                                                        +{form.profession.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-[var(--accent-secondary)] group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1">
                                                Fyll ut <ChevronRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {filteredForms.length === 0 && (
                            <div className="text-center py-16 animate-fade-in">
                                <ClipboardList className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-lg text-[var(--text-secondary)]">Ingen skjemaer funnet</p>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Prøv å justere søket eller velg en annen kategori</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
