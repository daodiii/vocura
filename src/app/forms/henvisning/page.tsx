'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, Send, AlertCircle, Info, FileText, Plus, Trash2, Paperclip, Loader2 } from 'lucide-react';
import { cn, validateFnr } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function HenvisningForm() {
    const { profile } = useUserProfile();
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'henvisning' });
    const [fnrError, setFnrError] = useState('');
    const [formData, setFormData] = useState({
        // Referring doctor (read-only)
        legeNavn: '',
        legeHPR: '9876543',
        legeAdresse: 'Storgata 1, 0182 Oslo',
        legeTelefon: '22 33 44 55',
        // Patient
        patientNavn: '',
        patientFnr: '',
        patientAdresse: '',
        patientTelefon: '',
        // Urgency
        hastegrad: 'normal',
        // Referral to
        spesialistType: '',
        institusjon: '',
        spesifikkLege: '',
        // Clinical info
        kodesystem: 'ICPC-2',
        diagnoseKode: '',
        diagnoseBeskrivelse: '',
        sykehistorie: '',
        medisiner: '',
        undersokelseFunn: '',
        // Purpose
        formaal: [] as string[],
        spesifikkeSporsmal: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, legeNavn: profile.name }));
        }
    }, [profile]);

    const [vedlegg, setVedlegg] = useState<string[]>([]);
    const [nyttVedlegg, setNyttVedlegg] = useState('');
    const updateField = (field: string, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        saveAsDraft(formData as unknown as Record<string, unknown>);
    };

    const handleSubmit = () => {
        // Trim diagnosis codes and patient ID to avoid matching issues from trailing spaces
        const trimmedData = {
            ...formData,
            patientFnr: formData.patientFnr.trim(),
            diagnoseKode: formData.diagnoseKode.trim(),
        };
        submitForm(trimmedData as unknown as Record<string, unknown>);
    };

    const toggleFormaal = (item: string) => {
        setFormData(prev => ({
            ...prev,
            formaal: prev.formaal.includes(item)
                ? prev.formaal.filter(f => f !== item)
                : [...prev.formaal, item],
        }));
    };

    const addVedlegg = () => {
        if (nyttVedlegg.trim()) {
            setVedlegg(prev => [...prev, nyttVedlegg.trim()]);
            setNyttVedlegg('');
        }
    };

    const removeVedlegg = (index: number) => {
        setVedlegg(prev => prev.filter((_, i) => i !== index));
    };

    // Common ICPC-2 codes for referrals
    const commonCodes = [
        { code: 'L03', label: 'Korsryggsymptomer' },
        { code: 'K86', label: 'Hypertensjon' },
        { code: 'D12', label: 'Forstoppelse' },
        { code: 'L84', label: 'Ryggsyndrom uten utstråling' },
        { code: 'T90', label: 'Diabetes type 2' },
        { code: 'K77', label: 'Hjertesvikt' },
        { code: 'N87', label: 'Basalganglielidelse/Parkinsonisme' },
        { code: 'L86', label: 'Ryggsyndrom med utstråling' },
    ];

    const formaalOptions = [
        'Vurdering',
        'Utredning',
        'Behandling',
        'Operasjon',
        'Second opinion',
    ];

    return (
        <div className="min-h-screen bg-[#F5F2ED]">
            <AppHeader />

            {/* Action Bar */}
            <div className="sticky top-14 z-40 bg-[#FFFDF9] border-b border-[#DDD7CE]">
                <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between">
                    <Link href="/forms" className="flex items-center gap-2 text-[#5E5549] hover:text-[#1E1914] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Tilbake til skjemaer</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-ghost text-xs flex items-center gap-1.5 !py-2"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5 text-[#3D8B6E]" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                        </button>
                        <button
                            onClick={() => exportPdf(formData as unknown as Record<string, unknown>, 'Henvisning til spesialist', formData.legeNavn)}
                            className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !!fnrError}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5",
                                submitted ? "bg-[#3D8B6E] text-white rounded-lg font-semibold" : "btn-primary"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {submitted ? 'Henvisning sendt' : submitting ? 'Sender...' : 'Send henvisning'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#F5EDE6] rounded-xl flex items-center justify-center">
                            <Send className="w-5 h-5 text-[#A0714F]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "'Georgia', serif" }}>
                        Henvisning til spesialist
                    </h1>
                    <p className="text-[#7D7267] mt-1">Henvisningsskjema fra fastlege til spesialisthelsetjenesten</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                            Henvisning sendt
                        </h2>
                        <p className="text-[#7D7267] mb-6">Henvisningen er sendt til spesialisthelsetjenesten.</p>
                        <p className="text-sm font-mono text-[#9E958C] mb-8">Referanse: HEN-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/forms" className="btn-secondary inline-flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til skjemaer
                            </Link>
                            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
                                Ny konsultasjon
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section 1: Referring Doctor */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Henvisende lege</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om henvisende behandler</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Legens navn</label>
                                    <input
                                        type="text"
                                        value={formData.legeNavn}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">HPR-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.legeHPR}
                                        className="input-field !text-sm bg-[#F5F2ED] font-mono"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.legeAdresse}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Telefon</label>
                                    <input
                                        type="text"
                                        value={formData.legeTelefon}
                                        className="input-field !text-sm bg-[#F5F2ED]"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Patient Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Pasientopplysninger</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Informasjon om pasienten som henvises</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label form-required">Fullt navn</label>
                                    <input
                                        type="text"
                                        value={formData.patientNavn}
                                        onChange={(e) => updateField('patientNavn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Ola Nordmann"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Fodselsnummer (11 siffer)</label>
                                    <input
                                        type="text"
                                        value={formData.patientFnr}
                                        onChange={(e) => updateField('patientFnr', e.target.value)}
                                        onBlur={() => setFnrError(validateFnr(formData.patientFnr) || '')}
                                        className="input-field !text-sm font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                    {fnrError && <p className="text-[#EF4444] text-xs mt-1">{fnrError}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.patientAdresse}
                                        onChange={(e) => updateField('patientAdresse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Storgata 1, 0182 Oslo"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.patientTelefon}
                                        onChange={(e) => updateField('patientTelefon', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="412 34 567"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Urgency */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Hastegrad</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Angi prioritet for henvisningen</p>

                            <div className="space-y-3">
                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.hastegrad === 'normal'
                                        ? "border-[#3D8B6E] bg-[#E8F5EE]/30"
                                        : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="hastegrad"
                                        value="normal"
                                        checked={formData.hastegrad === 'normal'}
                                        onChange={() => updateField('hastegrad', 'normal')}
                                        className="mt-0.5 w-5 h-5 text-[#3D8B6E] focus:ring-[#3D8B6E]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[#1E1914] block">Normal</span>
                                        <span className="text-xs text-[#7D7267] mt-1 block">Standard ventetid (4-12 uker)</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.hastegrad === 'haster'
                                        ? "border-[#C8842B] bg-[#FEF3C7]/30"
                                        : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="hastegrad"
                                        value="haster"
                                        checked={formData.hastegrad === 'haster'}
                                        onChange={() => updateField('hastegrad', 'haster')}
                                        className="mt-0.5 w-5 h-5 text-[#C8842B] focus:ring-[#C8842B]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[#1E1914] block">Haster</span>
                                        <span className="text-xs text-[#7D7267] mt-1 block">Prioritert vurdering (1-4 uker)</span>
                                    </div>
                                </label>

                                <label className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    formData.hastegrad === 'akutt'
                                        ? "border-[#C44536] bg-[#FAEAE8]/30"
                                        : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                )}>
                                    <input
                                        type="radio"
                                        name="hastegrad"
                                        value="akutt"
                                        checked={formData.hastegrad === 'akutt'}
                                        onChange={() => updateField('hastegrad', 'akutt')}
                                        className="mt-0.5 w-5 h-5 text-[#C44536] focus:ring-[#C44536]"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-[#1E1914] block">Akutt</span>
                                        <span className="text-xs text-[#7D7267] mt-1 block">Umiddelbar vurdering nodvendig</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Section 4: Referral To */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Send className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Henvist til</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Spesialist eller institusjon det henvises til</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Spesialitet</label>
                                    <select
                                        value={formData.spesialistType}
                                        onChange={(e) => updateField('spesialistType', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg spesialitet...</option>
                                        <option value="Ortoped">Ortoped</option>
                                        <option value="Kardiolog">Kardiolog</option>
                                        <option value="Nevrolog">Nevrolog</option>
                                        <option value="Revmatolog">Revmatolog</option>
                                        <option value="Psykiater">Psykiater</option>
                                        <option value="ONH-spesialist">ONH-spesialist</option>
                                        <option value="Radiologi">Radiologi</option>
                                        <option value="Gastroenterolog">Gastroenterolog</option>
                                        <option value="Urolog">Urolog</option>
                                        <option value="Gynekolog">Gynekolog</option>
                                        <option value="Oyelege">Oyelege</option>
                                        <option value="Hudlege">Hudlege</option>
                                        <option value="Annen">Annen</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Institusjon / sykehus</label>
                                        <input
                                            type="text"
                                            value={formData.institusjon}
                                            onChange={(e) => updateField('institusjon', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="F.eks. Oslo universitetssykehus"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Spesifikk lege (valgfritt)</label>
                                        <input
                                            type="text"
                                            value={formData.spesifikkLege}
                                            onChange={(e) => updateField('spesifikkLege', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="Navn på spesialist"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Clinical Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Klinisk informasjon</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Relevant medisinsk informasjon</p>

                            {/* Diagnosis code system toggle */}
                            <div className="mb-4">
                                <label className="form-label">Kodesystem</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="kodesystem"
                                            value="ICPC-2"
                                            checked={formData.kodesystem === 'ICPC-2'}
                                            onChange={() => updateField('kodesystem', 'ICPC-2')}
                                            className="text-[#A0714F]"
                                        />
                                        <span className="text-sm text-[#3E4C59] font-medium">ICPC-2 (Fastlege)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="kodesystem"
                                            value="ICD-10"
                                            checked={formData.kodesystem === 'ICD-10'}
                                            onChange={() => updateField('kodesystem', 'ICD-10')}
                                            className="text-[#A0714F]"
                                        />
                                        <span className="text-sm text-[#3E4C59] font-medium">ICD-10 (Spesialist)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Diagnosis code and description */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Diagnosekode</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseKode}
                                        onChange={(e) => updateField('diagnoseKode', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="L03"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="form-label form-required">Diagnosebeskrivelse</label>
                                    <input
                                        type="text"
                                        value={formData.diagnoseBeskrivelse}
                                        onChange={(e) => updateField('diagnoseBeskrivelse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Korsryggsymptomer"
                                    />
                                </div>
                            </div>

                            {/* Quick code suggestions */}
                            <div className="p-3 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6] mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-3.5 h-3.5 text-[#A0714F]" />
                                    <span className="text-xs font-semibold text-[#A0714F]">Vanlige ICPC-2-koder for henvisning</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {commonCodes.map((item) => (
                                        <button
                                            key={item.code}
                                            onClick={() => {
                                                updateField('diagnoseKode', item.code);
                                                updateField('diagnoseBeskrivelse', item.label);
                                            }}
                                            className={cn(
                                                "text-xs px-2.5 py-1 rounded-full border transition-all",
                                                formData.diagnoseKode === item.code
                                                    ? "bg-[#A0714F] text-white border-[#A0714F]"
                                                    : "bg-[#FFFDF9] text-[#5E5549] border-[#DDD7CE] hover:border-[#A0714F] hover:text-[#A0714F]"
                                            )}
                                        >
                                            <span className="font-mono font-semibold">{item.code}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clinical text fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label form-required">Sykehistorie og aktuell problemstilling</label>
                                    <textarea
                                        value={formData.sykehistorie}
                                        onChange={(e) => updateField('sykehistorie', e.target.value)}
                                        className="input-field !text-sm min-h-[100px] resize-y"
                                        placeholder="Relevant sykehistorie og nåværende problemstilling..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Nåværende medikamenter</label>
                                    <textarea
                                        value={formData.medisiner}
                                        onChange={(e) => updateField('medisiner', e.target.value)}
                                        className="input-field !text-sm min-h-[60px] resize-y"
                                        placeholder="Nåværende medikamenter og dosering..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Undersøkelsesfunn</label>
                                    <textarea
                                        value={formData.undersokelseFunn}
                                        onChange={(e) => updateField('undersokelseFunn', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Relevante funn fra undersøkelse..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Purpose */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Formål med henvisningen</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Hva ønskes utført av spesialisten</p>

                            <div className="space-y-3 mb-4">
                                {formaalOptions.map((option) => (
                                    <label
                                        key={option}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                                            formData.formaal.includes(option)
                                                ? "border-[#A0714F] bg-[#F5FAFF]"
                                                : "border-[#DDD7CE] hover:border-[#A0714F]/30"
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.formaal.includes(option)}
                                            onChange={() => toggleFormaal(option)}
                                            className="mt-0.5 w-5 h-5 rounded border-[#CBD2D9] text-[#A0714F] focus:ring-[#A0714F]"
                                        />
                                        <span className="text-sm font-semibold text-[#1E1914]">{option}</span>
                                    </label>
                                ))}
                            </div>

                            <div>
                                <label className="form-label">Spesifikke spørsmål til spesialisten</label>
                                <textarea
                                    value={formData.spesifikkeSporsmal}
                                    onChange={(e) => updateField('spesifikkeSporsmal', e.target.value)}
                                    className="input-field !text-sm min-h-[100px] resize-y"
                                    placeholder="Spesifikke spørsmål til spesialisten..."
                                />
                            </div>
                        </div>

                        {/* Section 7: Attachments */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Paperclip className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Vedlegg</h2>
                            </div>
                            <p className="text-xs text-[#9E958C] mb-4 ml-6">Legg til beskrivelse av vedlagte dokumenter</p>

                            {/* Attachment list */}
                            {vedlegg.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {vedlegg.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="w-3.5 h-3.5 text-[#A0714F]" />
                                                <span className="text-sm text-[#3E4C59]">{item}</span>
                                            </div>
                                            <button
                                                onClick={() => removeVedlegg(index)}
                                                className="p-1 text-[#9E958C] hover:text-[#C44536] transition-colors rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add attachment input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={nyttVedlegg}
                                    onChange={(e) => setNyttVedlegg(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addVedlegg();
                                        }
                                    }}
                                    className="input-field !text-sm flex-1"
                                    placeholder="F.eks. Blodprøvesvar, røntgenbilde, EKG..."
                                />
                                <button
                                    onClick={addVedlegg}
                                    disabled={!nyttVedlegg.trim()}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        nyttVedlegg.trim()
                                            ? "bg-[#A0714F] text-white hover:bg-[#0052A3]"
                                            : "bg-[#DDD7CE] text-[#9E958C] cursor-not-allowed"
                                    )}
                                >
                                    <Plus className="w-4 h-4" />
                                    Legg til
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-[#FAEAE8] border border-[#C44536]/20 rounded-lg text-sm text-[#C44536]">
                                {error}
                            </div>
                        )}

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3D8B6E]" />
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel innsending</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {saving ? 'Lagrer...' : saved ? 'Lagret!' : 'Lagre utkast'}
                                </button>
                                <button onClick={handleSubmit} disabled={submitting || !!fnrError} className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {submitting ? 'Sender...' : 'Send henvisning'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
