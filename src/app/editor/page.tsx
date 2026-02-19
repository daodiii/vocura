'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor as TiptapEditor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { FileText, Save, CheckCircle, Download, User, PenLine, PlusCircle, Printer, Mic, Shield, Lock, Bold, Italic, UnderlineIcon, List, ListOrdered, Heading2, Undo2, Redo2, Type, Sparkles, Copy, Check, Clock, Tag, Loader2, Bot, X, Send, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import Toast from '@/components/Toast';
import { useUserProfile } from '@/hooks/useUserProfile';

const TEMPLATES: Record<string, string[]> = {
    'lege': ['SOAP Journalnotat', 'Sykemelding', 'Henvisning', 'Resept / E-resept', 'Epikrise'],
    'tannlege': ['Status Presens', 'Behandlingsplan', 'HELFO-refusjon', 'Akutt Konsultasjon', 'Overslag'],
    'psykolog': ['Inntaksnotat', 'Suicidalvurdering', 'Terapinotat (SOAP)', 'Epikrise', 'Henvisning'],
    'fysioterapeut': ['Funksjonsvurdering', 'Opptreningsplan', 'Epikrise', '6-ukers Kontroll', 'ADL-kartlegging'],
    'default': ['Notat', 'Brev', 'Oppsummering']
};

const TEMPLATE_CONTENT: Record<string, string> = {
    'SOAP Journalnotat': `<h2>Subjektivt</h2><p>Pasient 45 år, kommer til kontroll for hypertensjon. Rapporterer ingen bivirkninger av medikasjon. Føler seg generelt bra, men nevner økt tretthet de siste ukene.</p><h2>Objektivt</h2><p>Blodtrykk: 140/90 mmHg. Puls: 72/min, regelmessig. Generelt upåfallende organstatus. Ingen perifere ødemer.</p><h2>Analyse</h2><p>Hypertensjon, utilstrekkelig kontrollert. Trøtthet kan være relatert til medikasjon eller andre faktorer.</p><h2>Plan</h2><p>Fortsetter nåværende dose. Blodprøver for kontroll av elektrolytter og nyrefunksjon. Ny kontroll om 6 måneder. Vurderer dosejustering ved neste kontroll dersom BT fortsatt over mål.</p>`,
    'Sykemelding': `<h2>Pasientinformasjon</h2><p>Navn: [Pasientnavn]<br>Fødselsnummer: [Fødselsnr]<br>Arbeidsgiver: [Arbeidsgiver]</p><h2>Diagnose</h2><p>Hoveddiagnose (ICPC-2): [Kode] - [Beskrivelse]<br>Bidiagnose: [Eventuell bidiagnose]</p><h2>Funksjonsnedsettelse</h2><p>Beskriv hvordan sykdommen påvirker arbeidsevnen:</p><h2>Sykmeldingsperiode</h2><p>Fra: [Dato]<br>Til: [Dato]<br>Grad: [100% / Gradert %]</p><h2>Aktivitetskrav</h2><p>Er det medisinske grunner til at arbeidsrelatert aktivitet ikke er mulig? [Ja/Nei]<br>Begrunnelse:</p>`,
    'Henvisning': `<h2>Henvisning til spesialist</h2><h2>Pasient</h2><p>Navn: [Pasientnavn]<br>Fødselsnummer: [Fødselsnr]</p><h2>Henvisende lege</h2><p>[Lege]<br>Allmennmedisin</p><h2>Problemstilling</h2><p>Beskriv aktuell problemstilling og kliniske funn:</p><h2>Ønsket utredning/behandling</h2><p>Angi hva som ønskes fra spesialisten:</p><h2>Relevante prøvesvar</h2><p>Tidligere relevante utredninger og funn:</p><h2>Hastegrad</h2><p>[Øyeblikkelig hjelp / Haster / Vanlig]</p>`,
    'Inntaksnotat': `<h2>Inntaksnotat - Psykisk helsevern</h2><h2>Identifiserende opplysninger</h2><p>Navn: [Pasientnavn]<br>Alder: [Alder]<br>Sivilstand: [Status]<br>Henvisningsgrunn: [Grunn]</p><h2>Aktuell situasjon</h2><p>Beskriv pasientens nåværende symptomer og funksjonsnivå:</p><h2>Tidligere psykisk helse</h2><p>Tidligere behandling, innleggelser, medikamentbruk:</p><h2>Rusanamnese</h2><p>Alkohol, medikamenter, rusmidler:</p><h2>Suicidalvurdering</h2><p>Aktuelle tanker, tidligere forsøk, risikovurdering:</p><h2>Foreløpig vurdering</h2><p>Diagnostisk vurdering og behandlingsplan:</p>`,
    'Funksjonsvurdering': `<h2>Funksjonsvurdering (ICF-rammeverk)</h2><h2>Pasientinformasjon</h2><p>Navn: [Pasientnavn]<br>Fødselsdato: [Dato]<br>Henvisningsdiagnose: [Diagnose]</p><h2>Aktivitet og deltakelse</h2><p>Beskriv pasientens funksjonsnivå i daglige aktiviteter:</p><h2>Kroppsfunksjoner</h2><p>ROM, styrke, sensibilitet, smerte (NPRS: /10):</p><h2>Kroppsstrukturer</h2><p>Relevante strukturelle funn:</p><h2>Miljøfaktorer</h2><p>Arbeidssituasjon, hjemmeforhold, hjelpemidler:</p><h2>Personlige faktorer</h2><p>Motivasjon, mestring, forventninger:</p><h2>Mål og plan</h2><p>Kortsiktige og langsiktige behandlingsmål:</p>`,
    'Status Presens': `<h2>Status Presens - Tannhelse</h2><h2>Pasientinformasjon</h2><p>Navn: [Pasientnavn]<br>Fødselsnummer: [Fødselsnr]</p><h2>Anamnese</h2><p>Hovedklage: [Klage]<br>Allmennsykdommer: [Sykdommer]<br>Medikamenter: [Medikamenter]<br>Allergier: [Allergier]</p><h2>Ekstraoral undersøkelse</h2><p>Ansikt, kjeveledd (TMJ), lymfeknuter:</p><h2>Intraoral undersøkelse</h2><p>Slimhinner, tunge, munnbunn:</p><h2>Tannstatus</h2><p>Karies, fyllinger, manglende tenner, periodontal status:</p><h2>Røntgen</h2><p>Funn fra røntgenundersøkelse:</p><h2>Diagnose og plan</h2><p>Diagnose og anbefalt behandling:</p>`,
};

const PROFESSION_LABELS: Record<string, string> = {
    'lege': 'Lege / Spesialist',
    'tannlege': 'Tannlege',
    'psykolog': 'Psykolog',
    'fysioterapeut': 'Fysioterapeut / Manuellterapeut',
    'default': 'Generell Praksis'
};

function MenuBar({ editor }: { editor: TiptapEditor | null }) {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-1 p-2 border-b border-[rgba(255,255,255,0.06)] bg-[#111111]/80 flex-wrap">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer", editor.isActive('bold') && "bg-[rgba(94,106,210,0.08)] text-[#7B89DB]")}
                title="Fet (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer", editor.isActive('italic') && "bg-[rgba(94,106,210,0.08)] text-[#7B89DB]")}
                title="Kursiv (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn("p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer", editor.isActive('underline') && "bg-[rgba(94,106,210,0.08)] text-[#7B89DB]")}
                title="Understreking (Ctrl+U)"
            >
                <UnderlineIcon className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-[rgba(255,255,255,0.06)] mx-1" />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer", editor.isActive('heading', { level: 2 }) && "bg-[rgba(94,106,210,0.08)] text-[#7B89DB]")}
                title="Overskrift"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer", editor.isActive('bulletList') && "bg-[rgba(94,106,210,0.08)] text-[#7B89DB]")}
                title="Punktliste"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer", editor.isActive('orderedList') && "bg-[rgba(94,106,210,0.08)] text-[#7B89DB]")}
                title="Nummerert liste"
            >
                <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-[rgba(255,255,255,0.06)] mx-1" />

            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 disabled:opacity-30 cursor-pointer"
                title="Angre (Ctrl+Z)"
            >
                <Undo2 className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 disabled:opacity-30 cursor-pointer"
                title="Gjenta (Ctrl+Shift+Z)"
            >
                <Redo2 className="w-4 h-4" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-2 text-xs text-white">
                <Type className="w-3.5 h-3.5" />
                <span>{editor.storage.characterCount?.characters?.() || editor.getText().length} tegn</span>
                <span className="text-[rgba(255,255,255,0.06)]">|</span>
                <span>{editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length} ord</span>
            </div>
        </div>
    );
}

function EditorContent_() {
    const { profile } = useUserProfile();
    const searchParams = useSearchParams();
    const professionParam = searchParams.get('profession') || 'default';
    const entryId = searchParams.get('id');
    const transcriptParam = searchParams.get('transcript');
    const patientNameParam = searchParams.get('patientName');

    const [activeTemplate, setActiveTemplate] = useState('');
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [approved, setApproved] = useState(false);
    const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);
    const [journalEntryId, setJournalEntryId] = useState<string | null>(entryId);
    const [patientName, setPatientName] = useState(patientNameParam || '');
    const [loadedFromApi, setLoadedFromApi] = useState(false);

    // AI suggested codes state
    const [suggestedCodes, setSuggestedCodes] = useState<Array<{ code: string; system: string; label: string; confidence: number }>>([]);
    const [loadingCodes, setLoadingCodes] = useState(false);

    // AI structure note state
    const [structuring, setStructuring] = useState(false);

    // Content hash for digital fingerprint
    const [contentHash, setContentHash] = useState('');

    // Debounce timer ref for auto-fetching codes
    const codesFetchTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save state
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);

    // FK panel state
    const [fkPanelOpen, setFkPanelOpen] = useState(false);
    const [fkInput, setFkInput] = useState('');
    const [fkMessages, setFkMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; sources?: Array<{ drugName: string; section: string; url: string }> }>>([]);
    const [fkLoading, setFkLoading] = useState(false);

    // Workflow toast state
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [showApproveToast, setShowApproveToast] = useState(false);
    const [showTranscriptBanner, setShowTranscriptBanner] = useState(!!transcriptParam);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Placeholder.configure({
                placeholder: 'Begynn å skrive eller diktere...',
            }),
            Underline,
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-6 py-4 text-white leading-relaxed',
            },
        },
    });

    // Load existing entry from API if id param is present
    useEffect(() => {
        if (entryId && editor) {
            fetch(`/api/journal/${entryId}`)
                .then(res => res.ok ? res.json() : null)
                .then(entry => {
                    if (entry) {
                        editor.commands.setContent(entry.content);
                        setTimeout(() => editor.chain().focus('start').run(), 100);
                        setActiveTemplate(entry.template || '');
                        setSelectedCodes(entry.diagnosisCodes || []);
                        setApproved(entry.status === 'approved');
                        setPatientName(entry.patientName || '');
                        setJournalEntryId(entry.id);
                        setLoadedFromApi(true);
                    }
                })
                .catch(err => {
                    console.error('Failed to load journal entry:', err);
                });
        }
    }, [entryId, editor]);

    // Set default template from profession (only if not loaded from API)
    useEffect(() => {
        if (loadedFromApi) return;
        const templates = TEMPLATES[professionParam] || TEMPLATES['default'];
        if (templates.length > 0) {
            setActiveTemplate(templates[0]);
        }
    }, [professionParam, loadedFromApi]);

    // Load template content when template changes (only if not loaded from API)
    useEffect(() => {
        if (loadedFromApi) return;
        if (editor && activeTemplate) {
            const content = TEMPLATE_CONTENT[activeTemplate];
            if (content) {
                editor.commands.setContent(content);
            } else {
                editor.commands.setContent(`<h2>${activeTemplate}</h2><p>Begynn å dokumentere her...</p>`);
            }
            editor.chain().focus('start').run();
            setSaved(false);
            setApproved(false);
        }
    }, [activeTemplate, editor, loadedFromApi]);

    // Compute content hash for digital fingerprint
    useEffect(() => {
        if (!editor) return;
        const updateHash = async () => {
            const text = editor.getHTML();
            const msgUint8 = new TextEncoder().encode(text);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setContentHash(hashHex);
        };
        editor.on('update', updateHash);
        updateHash();
        return () => { editor.off('update', updateHash); };
    }, [editor]);

    // Auto-fetch AI codes on content change (debounced, 5 seconds idle)
    useEffect(() => {
        if (!editor) return;
        const handleUpdate = () => {
            if (codesFetchTimerRef.current) {
                clearTimeout(codesFetchTimerRef.current);
            }
            codesFetchTimerRef.current = setTimeout(() => {
                if (editor.getText().length >= 20) {
                    fetchSuggestedCodes();
                }
            }, 5000);
        };
        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
            if (codesFetchTimerRef.current) {
                clearTimeout(codesFetchTimerRef.current);
            }
        };
    }, [editor]);

    // Fetch AI-suggested diagnosis codes
    const fetchSuggestedCodes = useCallback(async () => {
        if (!editor || editor.getText().length < 20) return;
        setLoadingCodes(true);
        try {
            const res = await fetch('/api/ai/suggest-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editor.getText(), profession: professionParam }),
            });
            if (res.ok) {
                const data = await res.json();
                setSuggestedCodes(data.codes || []);
            }
        } catch (err) {
            console.error('Failed to fetch codes:', err);
        } finally {
            setLoadingCodes(false);
        }
    }, [editor, professionParam]);

    // AI structure note from transcription
    const handleStructureNote = useCallback(async () => {
        if (!editor || !transcriptParam) return;
        setStructuring(true);
        try {
            const res = await fetch('/api/ai/structure-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: transcriptParam,
                    templateType: activeTemplate || 'SOAP Journalnotat',
                    profession: professionParam,
                    patientName: patientName || undefined,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.content) {
                    editor.commands.setContent(data.content);
                    setTimeout(() => editor.chain().focus('end').run(), 100);
                    setSaved(false);
                    setApproved(false);
                }
            }
        } catch (err) {
            console.error('Failed to structure note:', err);
        } finally {
            setStructuring(false);
        }
    }, [editor, transcriptParam, activeTemplate, professionParam, patientName]);

    // Real save handler
    const handleSave = useCallback(async () => {
        if (!editor) return;
        setSaving(true);
        try {
            const content = editor.getHTML();
            const body = {
                title: activeTemplate || 'Journalnotat',
                content,
                template: activeTemplate || null,
                status: 'draft',
                diagnosisCodes: selectedCodes,
                patientName: patientNameParam || patientName || null,
            };

            let res;
            if (journalEntryId) {
                // Update existing
                res = await fetch(`/api/journal/${journalEntryId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            } else {
                // Create new
                res = await fetch('/api/journal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            }

            if (res.ok) {
                const data = await res.json();
                setJournalEntryId(data.id);
                setSaved(true);
                setHasUnsavedChanges(false);
                setAutoSaveStatus('idle');
                localStorage.removeItem('vocura_editor_backup');
                setTimeout(() => setSaved(false), 2000);
                setShowSaveToast(true);
            }
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    }, [editor, activeTemplate, selectedCodes, journalEntryId, patientNameParam, patientName]);

    // Real approve handler
    const handleApprove = useCallback(async () => {
        if (!editor) return;
        // Save first if not saved
        if (!journalEntryId) {
            await handleSave();
        }
        const currentId = journalEntryId;
        if (currentId) {
            const res = await fetch(`/api/journal/${currentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' }),
            });
            if (res.ok) {
                setApproved(true);
                setShowApproveToast(true);
            }
        } else {
            // Save and approve in one go
            setSaving(true);
            try {
                const content = editor.getHTML();
                const body = {
                    title: activeTemplate || 'Journalnotat',
                    content,
                    template: activeTemplate || null,
                    status: 'approved',
                    diagnosisCodes: selectedCodes,
                    patientName: patientNameParam || patientName || null,
                };
                const res = await fetch('/api/journal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (res.ok) {
                    const data = await res.json();
                    setJournalEntryId(data.id);
                    setApproved(true);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                    setShowApproveToast(true);
                }
            } catch (err) {
                console.error('Approve failed:', err);
            } finally {
                setSaving(false);
            }
        }
    }, [editor, journalEntryId, activeTemplate, selectedCodes, patientNameParam, patientName, handleSave]);

    // Export handler
    const handleExport = useCallback(async () => {
        if (!editor) return;
        try {
            const res = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: editor.getHTML(),
                    title: activeTemplate || 'Journalnotat',
                    type: 'journal',
                    author: profile?.name || 'Lege',
                }),
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${activeTemplate || 'journalnotat'}-${new Date().toISOString().split('T')[0]}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Export failed:', err);
        }
    }, [editor, activeTemplate, profile]);

    // Auto-save: backup to localStorage on every change, API save after 30s idle
    useEffect(() => {
        if (!editor) return;
        const handleUpdate = () => {
            // Skip the initial load / template set
            if (isInitialLoadRef.current) {
                isInitialLoadRef.current = false;
                return;
            }
            setHasUnsavedChanges(true);
            setAutoSaveStatus('idle');

            // Backup to localStorage immediately
            try {
                const backup = {
                    content: editor.getHTML(),
                    template: activeTemplate,
                    patientName,
                    timestamp: Date.now(),
                };
                localStorage.setItem('vocura_editor_backup', JSON.stringify(backup));
            } catch { /* localStorage full or unavailable */ }

            // Debounced API auto-save (30 seconds idle)
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = setTimeout(async () => {
                if (!editor || editor.getText().trim().length < 5) return;
                setAutoSaveStatus('saving');
                try {
                    const content = editor.getHTML();
                    const body = {
                        title: activeTemplate || 'Journalnotat',
                        content,
                        template: activeTemplate || null,
                        status: 'draft',
                        diagnosisCodes: selectedCodes,
                        patientName: patientNameParam || patientName || null,
                    };

                    let res;
                    if (journalEntryId) {
                        res = await fetch(`/api/journal/${journalEntryId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                        });
                    } else {
                        res = await fetch('/api/journal', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                        });
                    }

                    if (res.ok) {
                        const data = await res.json();
                        if (!journalEntryId) setJournalEntryId(data.id);
                        setHasUnsavedChanges(false);
                        setAutoSaveStatus('saved');
                        localStorage.removeItem('vocura_editor_backup');
                        setTimeout(() => setAutoSaveStatus('idle'), 3000);
                    }
                } catch {
                    setAutoSaveStatus('idle');
                }
            }, 30_000);
        };
        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [editor, activeTemplate, patientName, patientNameParam, selectedCodes, journalEntryId]);

    // Restore from localStorage backup on mount
    useEffect(() => {
        if (!editor || entryId || loadedFromApi) return;
        try {
            const raw = localStorage.getItem('vocura_editor_backup');
            if (raw) {
                const backup = JSON.parse(raw);
                // Only restore if less than 24 hours old
                if (backup.content && Date.now() - backup.timestamp < 24 * 60 * 60 * 1000) {
                    editor.commands.setContent(backup.content);
                    setTimeout(() => editor.chain().focus('end').run(), 100);
                    if (backup.template) setActiveTemplate(backup.template);
                    if (backup.patientName) setPatientName(backup.patientName);
                    setHasUnsavedChanges(true);
                }
            }
        } catch { /* ignore parse errors */ }
    }, [editor, entryId, loadedFromApi]);

    // Warn on close with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleApprove();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, handleApprove]);

    const sendFkMessage = async (text: string) => {
        if (!text.trim() || fkLoading) return;
        const history = fkMessages.map((m) => ({ role: m.role, content: m.content }));
        setFkMessages((prev) => [...prev, { role: 'user', content: text }]);
        setFkInput('');
        setFkLoading(true);
        try {
            const res = await fetch('/api/felleskatalogen/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history }),
            });
            const data = await res.json();
            setFkMessages((prev) => [...prev, {
                role: 'assistant',
                content: res.ok ? data.answer : (data.error || 'Noe gikk galt.'),
                sources: res.ok ? data.sources : undefined,
            }]);
        } catch {
            setFkMessages((prev) => [...prev, { role: 'assistant', content: 'Nettverksfeil.' }]);
        } finally {
            setFkLoading(false);
        }
    };

    const handleCopy = useCallback(() => {
        if (editor) {
            navigator.clipboard.writeText(editor.getText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [editor]);

    const toggleCode = (code: string) => {
        setSelectedCodes(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const handleTemplateChange = (template: string) => {
        setLoadedFromApi(false);
        setActiveTemplate(template);
    };

    const availableTemplates = TEMPLATES[professionParam] || TEMPLATES['default'];
    const professionLabel = PROFESSION_LABELS[professionParam] || PROFESSION_LABELS['default'];

    // Compute transcript word count
    const transcriptWordCount = transcriptParam ? transcriptParam.split(/\s+/).filter(Boolean).length : 0;

    return (
        <div className="flex flex-col h-screen bg-[#0A0A0A] overflow-hidden">
            {/* App Header */}
            <AppHeader />

            {/* Editor Action Bar */}
            <div className="h-12 flex items-center justify-between px-6 border-b border-[rgba(255,255,255,0.06)] bg-[#111111]/80 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(16,185,129,0.08)] text-[#10B981] text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Sikker kanal</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFkPanelOpen((o) => !o)}
                        className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                            fkPanelOpen
                                ? 'bg-[rgba(94,106,210,0.15)] text-[var(--accent-primary)]'
                                : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white'
                        )}
                        title="Felleskatalogen (legemiddelassistent)"
                    >
                        <Bot className="w-3.5 h-3.5" />
                        FK
                    </button>
                    <div aria-live="polite" aria-atomic="true">
                        {hasUnsavedChanges && autoSaveStatus === 'idle' && (
                            <span className="text-[11px] text-[#F59E0B] font-medium mr-1">Ulagrede endringer</span>
                        )}
                        {autoSaveStatus === 'saving' && (
                            <span className="text-[11px] text-white font-medium mr-1 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Autolagrer...
                            </span>
                        )}
                        {autoSaveStatus === 'saved' && (
                            <span className="text-[11px] text-[#10B981] font-medium mr-1 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Autolagret
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-white hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        title="Lagre utkast (Ctrl+S)"
                    >
                        {saving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : saved ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        ) : (
                            <Save className="w-3.5 h-3.5" />
                        )}
                        {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={saving}
                        className={cn(
                            "text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer rounded-lg font-medium transition-colors duration-150",
                            approved
                                ? "bg-[#10B981] text-white font-semibold"
                                : "bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white"
                        )}
                        title="Godkjenn (Ctrl+Enter)"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {approved ? 'Godkjent' : 'Godkjenn'}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="border border-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Kopier tekst"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Kopiert!' : 'Kopier'}
                    </button>
                    <button
                        onClick={handleExport}
                        className="border border-[rgba(255,255,255,0.06)] text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 transition-colors duration-150 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" /> Eksport (EPJ)
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <main className="flex flex-1 w-full overflow-hidden">
                {/* Sidebar - Templates */}
                <aside className="w-60 flex flex-col bg-[#111111] border-r border-[rgba(255,255,255,0.06)] shrink-0">
                    <div className="p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Maler ({professionLabel})</h3>
                        <div className="space-y-1">
                            {availableTemplates.map((template) => (
                                <button
                                    key={template}
                                    onClick={() => handleTemplateChange(template)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 text-sm cursor-pointer border-l-2",
                                        activeTemplate === template
                                            ? "bg-[rgba(94,106,210,0.08)] text-[#7B89DB] font-semibold border-[#5E6AD2] shadow-[inset_2px_0_8px_rgba(94,106,210,0.2)]"
                                            : "text-white hover:bg-[rgba(255,255,255,0.05)] hover:text-white border-transparent hover:border-white hover:shadow-[inset_2px_0_8px_rgba(255,255,255,0.12)]"
                                    )}
                                >
                                    <FileText className={cn("w-4 h-4 shrink-0", activeTemplate === template ? "text-[#7B89DB]" : "text-white")} />
                                    <span className="truncate">{template}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Diagnosis Code Suggestions */}
                    <div className="px-5 pb-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">AI-foreslåtte koder</h3>
                            <button
                                onClick={fetchSuggestedCodes}
                                disabled={loadingCodes}
                                className="ml-auto text-[10px] px-2 py-0.5 rounded text-white hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                                title="Foreslå koder basert på innhold"
                            >
                                {loadingCodes ? 'Laster...' : 'Foreslå koder'}
                            </button>
                        </div>
                        <div className="space-y-1.5" aria-live="polite" aria-atomic="true">
                            {loadingCodes && suggestedCodes.length === 0 && (
                                <div className="flex items-center justify-center py-4" role="status">
                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                    <span className="sr-only">Laster kodeforslag...</span>
                                </div>
                            )}
                            {!loadingCodes && suggestedCodes.length === 0 && (
                                <p className="text-[11px] text-white italic py-2">
                                    Skriv journalnotat for å få kodeforslag
                                </p>
                            )}
                            {suggestedCodes.map((item) => (
                                <button
                                    key={item.code}
                                    onClick={() => toggleCode(item.code)}
                                    className={cn(
                                        "w-full text-left p-2.5 rounded-lg border transition-all duration-150 text-xs cursor-pointer",
                                        selectedCodes.includes(item.code)
                                            ? "bg-[rgba(94,106,210,0.08)] border-[#5E6AD2] text-[#7B89DB]"
                                            : "bg-[#191919] border-[rgba(255,255,255,0.06)] text-white hover:border-[#5E6AD2]"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-mono font-semibold">{item.code}</span>
                                        <div className="flex items-center gap-1.5">
                                            {item.confidence != null && (
                                                <>
                                                    <div className="w-12 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-[#5E6AD2]"
                                                            style={{ width: `${Math.round(item.confidence * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-white">
                                                        {Math.round(item.confidence * 100)}%
                                                    </span>
                                                </>
                                            )}
                                            <span className={cn(
                                                "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium",
                                                item.system === 'ICPC-2'
                                                    ? "bg-[rgba(94,106,210,0.1)] text-[#7B89DB]"
                                                    : "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]"
                                            )}>
                                                {item.system}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-white">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto p-5 border-t border-[rgba(255,255,255,0.06)]">
                        <div className="p-3 rounded-lg bg-[#191919] border border-[rgba(255,255,255,0.06)]">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-white mb-1.5">Systemstatus</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.03)] rounded-full overflow-hidden">
                                    <div className="w-[98%] h-full bg-[#10B981] rounded-full"></div>
                                </div>
                                <span className="text-[11px] font-semibold text-[#10B981]">Klar</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Dictation Panel */}
                <section className="flex flex-col w-[32%] min-w-[280px] bg-[#111111] border-r border-[rgba(255,255,255,0.06)] shrink-0 animate-fade-in">
                    <div className="p-5 border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Innspilt diktering</h3>
                        {transcriptParam && (
                            <span className="text-[11px] font-mono text-white">TRANSKRIPSJON</span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {transcriptParam ? (
                            <>
                                <div className="p-4 bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl">
                                    <p className="text-sm leading-relaxed text-white border-l-3 border-[#5E6AD2] pl-4">
                                        {transcriptParam}
                                    </p>
                                    <div className="flex gap-2 mt-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(94,106,210,0.1)] text-[#7B89DB]">Ord: {transcriptWordCount}</span>
                                        {patientName && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(94,106,210,0.1)] text-[#7B89DB]">Pasient: {patientName}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Time saved indicator */}
                                <div className="mt-4 p-3 rounded-lg bg-[rgba(16,185,129,0.08)] text-[#10B981]">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Tid spart: ~{Math.max(1, Math.round(transcriptWordCount * 0.2))} minutter</span>
                                    </div>
                                    <p className="text-[11px] opacity-80 mt-1">Basert på manuell dokumentasjonstid</p>
                                </div>

                                {/* AI Structure Note button */}
                                <button
                                    onClick={handleStructureNote}
                                    disabled={structuring}
                                    aria-live="polite"
                                    className="mt-4 w-full bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium rounded-lg px-4 py-3 transition-colors duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {structuring ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Strukturerer notat...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            AI Strukturer journalnotat
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Mic className="w-10 h-10 text-white mb-3" />
                                <p className="text-sm text-white font-medium">Ingen diktering tilknyttet</p>
                                <p className="text-xs text-white mt-1">Start en diktering fra dashbordet</p>
                            </div>
                        )}

                        {/* Selected diagnosis codes */}
                        {selectedCodes.length > 0 && (
                            <div className="mt-4 p-3 bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag className="w-3.5 h-3.5 text-[#7B89DB]" />
                                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Valgte diagnosekoder</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedCodes.map(code => {
                                        const codeInfo = suggestedCodes.find(c => c.code === code);
                                        return (
                                            <span key={code} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(94,106,210,0.1)] text-[#7B89DB]">
                                                {code}
                                                <button onClick={() => toggleCode(code)} className="ml-1 opacity-60 hover:opacity-100 cursor-pointer">&times;</button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </section>

                {/* Editor Area */}
                <section className="flex-1 flex flex-col overflow-hidden min-w-0 animate-fade-in stagger-1">
                    <div className="p-8 pb-5 flex justify-between items-end border-b border-[rgba(255,255,255,0.06)]">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Klinisk journal</h2>
                            <div className="mt-2 flex items-center gap-3 text-sm text-white">
                                <span className="font-medium text-[#7B89DB]">{activeTemplate}</span>
                                <span className="w-1 h-1 rounded-full bg-[#5C5C5C]" />
                                <span>{professionLabel}</span>
                                {patientName && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-[#5C5C5C]" />
                                        <span className="text-white font-medium">{patientName}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="text-right text-sm text-white">
                            <p>Tidspunkt: Nå</p>
                            <p>Ansvarlig: {profile?.name || 'Lege'}</p>
                        </div>
                    </div>

                    {/* Transcript workflow banner */}
                    {showTranscriptBanner && transcriptParam && (
                        <div className="px-8 py-3 bg-[rgba(94,106,210,0.08)] border-b border-[rgba(94,106,210,0.2)] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Mic className="w-4 h-4 text-[#7B89DB]" />
                                <p className="text-sm text-white">
                                    Du har et diktat klart. Klikk <strong className="text-white">&quot;AI Strukturer journalnotat&quot;</strong> i sidepanelet for å strukturere det.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTranscriptBanner(false)}
                                className="text-white hover:text-white p-1 cursor-pointer transition-colors duration-150"
                                aria-label="Lukk banner"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Tiptap Toolbar */}
                    <MenuBar editor={editor} />

                    {/* Rich Text Editor */}
                    <div className="flex-1 overflow-y-auto bg-[#111111]">
                        <div className="max-w-none">
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[#111111]/80 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-white block">Digitalt fingeravtrykk</span>
                                <span className="text-[11px] font-mono text-white">
                                    {contentHash ? `SHA256: ${contentHash.slice(0, 4)}...${contentHash.slice(-4)}` : 'SHA256: beregner...'}
                                </span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(16,185,129,0.08)] text-[#10B981] text-xs font-medium">
                                <Shield className="w-4 h-4" />
                                <span className="text-[11px] font-semibold uppercase tracking-wider">GDPR-samsvar</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => window.print()} className="text-white hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg p-2 transition-colors duration-150 cursor-pointer" title="Skriv ut">
                                <Printer className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Felleskatalogen Panel */}
                {fkPanelOpen && (
                    <div className="w-[380px] shrink-0 border-l border-[rgba(255,255,255,0.06)] flex flex-col bg-[#111111]">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                            <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-[#7B89DB]" />
                                <span className="text-sm font-semibold text-white">Felleskatalogen</span>
                            </div>
                            <button
                                onClick={() => setFkPanelOpen(false)}
                                className="p-1 rounded-md text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {fkMessages.length === 0 && (
                                <p className="text-xs text-[rgba(255,255,255,0.4)] text-center mt-8">
                                    Still spørsmål om legemidler i dette notatet
                                </p>
                            )}
                            {fkMessages.map((msg, i) => (
                                <div key={i} className={cn('text-sm', msg.role === 'user' ? 'text-right' : '')}>
                                    {msg.role === 'user' ? (
                                        <span className="inline-block px-3 py-2 rounded-xl bg-[#5E6AD2] text-white text-xs">
                                            {msg.content}
                                        </span>
                                    ) : (
                                        <div className="p-3 rounded-lg bg-[#191919] border border-[rgba(255,255,255,0.06)]">
                                            <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap gap-1">
                                                    {msg.sources.map((s, j) => (
                                                        <a
                                                            key={j}
                                                            href={s.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[10px] text-[rgba(255,255,255,0.4)] hover:text-[#7B89DB] transition-colors"
                                                        >
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                            {s.drugName}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (editor) {
                                                        editor.chain().focus().insertContent(`\n\n${msg.content}`).run();
                                                    }
                                                }}
                                                className="mt-2 text-[10px] text-[rgba(255,255,255,0.4)] hover:text-[#7B89DB] transition-colors"
                                            >
                                                Sett inn i notat
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {fkLoading && <Loader2 className="w-4 h-4 animate-spin text-[rgba(255,255,255,0.4)] mx-auto" />}
                        </div>
                        <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
                            <div className="flex gap-2 items-end">
                                <textarea
                                    value={fkInput}
                                    onChange={(e) => setFkInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFkMessage(fkInput); } }}
                                    placeholder="Spør om et legemiddel..."
                                    rows={1}
                                    className="flex-1 bg-[#191919] rounded-lg px-3 py-2 text-xs text-white placeholder:text-[rgba(255,255,255,0.3)] border border-[rgba(255,255,255,0.06)] focus:outline-none focus:border-[#5E6AD2] resize-none"
                                />
                                <button
                                    onClick={() => sendFkMessage(fkInput)}
                                    disabled={fkLoading || !fkInput.trim()}
                                    className="h-8 w-8 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5ABF] flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Workflow toasts */}
            {showSaveToast && (
                <Toast
                    message="Utkast lagret!"
                    type="success"
                    action={{ label: 'Se i journal', href: '/journal' }}
                    onDismiss={() => setShowSaveToast(false)}
                    autoDismissMs={3000}
                />
            )}
            {showApproveToast && (
                <Toast
                    message="Notat godkjent og lagret!"
                    type="success"
                    action={{ label: 'Se i journal', href: '/journal' }}
                    onDismiss={() => setShowApproveToast(false)}
                    autoDismissMs={8000}
                />
            )}
        </div>
    );
}

export default function Editor() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-white">Laster editor...</p>
                </div>
            </div>
        }>
            <EditorContent_ />
        </Suspense>
    );
}
