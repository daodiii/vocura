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
    { id: '1', name: 'Pasientregistrering', description: 'Førstegangsregistrering for nye pasienter med demografiske data og medisinsk historikk.', category: 'inntak', profession: ['lege', 'tannlege', 'psykolog', 'fysioterapeut'], icon: UserPlus, color: 'var(--primary)' },
    { id: '2', name: 'SOAP Journalnotat', description: 'Standardisert klinisk dokumentasjon (Subjektiv, Objektiv, Analyse, Plan).', category: 'klinisk', profession: ['lege', 'psykolog', 'fysioterapeut'], icon: Stethoscope, color: 'var(--primary)' },
    { id: '3', name: 'Samtykke til helsehjelp', description: 'GDPR-kompatibelt samtykkeformular i henhold til Pasient- og brukerrettighetsloven.', category: 'samtykke', profession: ['lege', 'tannlege', 'psykolog', 'fysioterapeut'], authority: 'Helsedirektoratet', icon: Shield, color: 'var(--success)' },
    { id: '4', name: 'Sykemelding', description: 'Elektronisk sykemelding for innsending til NAV. Dokumenterer medisinsk årsak og arbeidsevne.', category: 'sykemelding', profession: ['lege'], authority: 'NAV', icon: FileCheck, color: 'var(--warning)' },
    { id: '5', name: 'Henvisning til spesialist', description: 'Henvisningsskjema fra fastlege til spesialisthelsetjenesten.', category: 'henvisning', profession: ['lege', 'psykolog'], icon: ChevronRight, color: 'var(--primary)' },
    { id: '6', name: 'HELFO Refusjonskrav', description: 'Skjema for refusjonskrav fra HELFO for utført behandling.', category: 'helfo', profession: ['lege', 'tannlege', 'fysioterapeut'], authority: 'HELFO', icon: Building2, color: 'var(--primary)' },
    { id: '7', name: 'Behandlingsplan', description: 'Strukturert behandlingsplan med mål, tiltak og oppfølgingsplan.', category: 'behandling', profession: ['lege', 'tannlege', 'psykolog', 'fysioterapeut'], icon: Heart, color: 'var(--error)' },
    { id: '8', name: 'Tannkart og behandlingsplan', description: 'Visuelt tannkart med behandlingsplanlegging og kostnadsoverslag.', category: 'tannhelse', profession: ['tannlege'], icon: FileText, color: 'var(--primary)' },
    { id: '9', name: 'HELFO tannlegerefusjon', description: 'Refusjonskrav for tannbehandling gjennom HELFO-ordningen.', category: 'tannhelse', profession: ['tannlege'], authority: 'HELFO', icon: Building2, color: 'var(--primary)' },
    { id: '10', name: 'Inntaksnotat (psykisk helse)', description: 'Strukturert inntaksnotat for første konsultasjon med vurdering av psykisk helsetilstand.', category: 'psykisk', profession: ['psykolog'], icon: Brain, color: 'var(--primary)' },
    { id: '11', name: 'Suicidalvurdering', description: 'Strukturert vurdering av suicidalrisiko med handlingsplan.', category: 'psykisk', profession: ['psykolog'], authority: 'Helsedirektoratet', icon: AlertTriangle, color: 'var(--error)' },
    { id: '12', name: 'Funksjonsvurdering (ICF)', description: 'Funksjonsvurdering basert på WHO sitt ICF-rammeverk.', category: 'fysioterapi', profession: ['fysioterapeut'], icon: Activity, color: 'var(--primary)' },
    { id: '13', name: 'Opptreningsplan', description: 'Detaljert opptreningsplan med øvelser, mål og progresjon.', category: 'fysioterapi', profession: ['fysioterapeut'], icon: Activity, color: 'var(--primary)' },
    { id: '14', name: 'HELFO fysioterapirefusjon', description: 'Refusjonskrav for fysioterapibehandling til HELFO.', category: 'fysioterapi', profession: ['fysioterapeut'], authority: 'HELFO', icon: Building2, color: 'var(--primary)' },
    { id: '15', name: 'Aktivitetskrav erklæring (8 uker)', description: 'Erklæring om aktivitetskrav ved sykemelding over 8 uker.', category: 'sykemelding', profession: ['lege'], authority: 'NAV', icon: FileCheck, color: 'var(--warning)' },
    { id: '16', name: 'Smertekart / Kroppskart', description: 'Interaktivt kroppskart for dokumentasjon av smerteområder med NPRS-skala.', category: 'fysioterapi', profession: ['fysioterapeut'], icon: Activity, color: 'var(--primary)' },
    { id: '17', name: 'PHQ-9 Depresjonsskala', description: 'Standardisert screeningverktøy for vurdering av depresjonssymptomer.', category: 'psykisk', profession: ['psykolog', 'lege'], icon: Brain, color: 'var(--primary)' },
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
        <div className="flex h-screen bg-[var(--bg-deep)] overflow-hidden">
            <AppSidebar />

            {/* Category Sidebar */}
            <aside className="w-56 glass-sidebar flex flex-col shrink-0">
                <div className="p-4 border-b border-[var(--glass-border)]">
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">Kategorier</h2>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    {FORM_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={cn(
                                    "glass-nav-item w-full cursor-pointer",
                                    activeCategory === category.id && "active"
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
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="px-8 py-5 border-b border-[var(--glass-border)] glass-header flex items-center justify-between">
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
                                className="glass-input !pl-10 !py-2.5"
                                placeholder="Søk i skjemaer..."
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
                                    <Link key={form.id} href={FORM_ROUTES[form.id] || '#'} className="glass-card p-5 group flex flex-col cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--primary-subtle)]">
                                                <Icon className="w-5 h-5" style={{ color: form.color }} />
                                            </div>
                                            {form.authority && (
                                                <span className={cn(
                                                    "glass-badge",
                                                    form.authority === 'NAV' ? "glass-badge-warning" : "glass-badge-primary"
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
                                                    <span key={prof} className="glass-badge glass-badge-primary !text-[10px] !px-2 !py-0.5 capitalize">
                                                        {prof}
                                                    </span>
                                                ))}
                                                {form.profession.length > 3 && (
                                                    <span className="glass-badge !text-[10px] !px-2 !py-0.5 bg-[var(--glass-bg)] text-[var(--text-muted)] border border-[var(--glass-border)]">
                                                        +{form.profession.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-[var(--primary-light)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-1">
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
