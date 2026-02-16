'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Download, Shield, User, UserPlus, Phone, Mail, Heart, Activity, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';
import { useFormSubmission } from '@/hooks/useFormSubmission';

export default function PasientregistreringForm() {
    const { submissionId, saving, submitting, saved, submitted, error, saveAsDraft, submitForm, exportPdf } = useFormSubmission({ formType: 'pasientregistrering' });
    const [formData, setFormData] = useState({
        // Personal info
        fornavn: '',
        etternavn: '',
        fodselsdato: '',
        fnr: '',
        kjonn: '',
        adresse: '',
        postnummer: '',
        poststed: '',
        telefon: '',
        epost: '',
        // Emergency contact
        kontaktpersonNavn: '',
        kontaktpersonRelasjon: '',
        kontaktpersonTelefon: '',
        // GP
        fastlegeNavn: '',
        fastlegePraksis: '',
        fastlegeTelefon: '',
        // Insurance
        helfoNummer: '',
        forsikringsselskap: '',
        polisseNummer: '',
        // Medical history
        allergier: '',
        kroniskeSykdommer: '',
        fasteMedisiner: '',
        tidligereOperasjoner: '',
        // Family history
        familiehistorikk: '',
        // Lifestyle
        roykestatus: '',
        alkohol: '',
        trening: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        saveAsDraft(formData as unknown as Record<string, unknown>);
    };

    const handleSubmit = () => {
        submitForm(formData as unknown as Record<string, unknown>);
    };

    const handleExportPdf = () => {
        exportPdf(formData as unknown as Record<string, unknown>, 'Pasientregistrering', 'Kliniker');
    };

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
                        <button onClick={handleExportPdf} className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5">
                            <Download className="w-3.5 h-3.5" /> Last ned PDF
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className={cn(
                                "text-xs !py-2 !px-4 flex items-center gap-1.5",
                                submitted ? "bg-[#3D8B6E] text-white rounded-lg font-semibold" : "btn-primary"
                            )}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                            {submitting ? 'Registrerer...' : submitted ? 'Registrert' : 'Registrer pasient'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Form Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#F5EDE6] rounded-xl flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-[#A0714F]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1E1914]" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                        Pasientregistrering
                    </h1>
                    <p className="text-[#7D7267] mt-1">Førstegangsregistrering for nye pasienter</p>
                </div>

                {submitted ? (
                    <div className="card-base p-12 text-center">
                        <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#3D8B6E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1E1914] mb-3" style={{ fontFamily: "var(--font-serif), 'Georgia', serif" }}>
                            Pasient registrert
                        </h2>
                        <p className="text-[#7D7267] mb-6">Pasienten er registrert i systemet og klar for konsultasjon.</p>
                        <p className="text-sm font-mono text-[var(--medical-gray-400)] mb-8">Referanse: {submissionId || `MED-REG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`}</p>
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
                        {/* Section 1: Personal Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">1. Personopplysninger</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Grunnleggende informasjon om pasienten</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Fornavn</label>
                                    <input
                                        type="text"
                                        value={formData.fornavn}
                                        onChange={(e) => updateField('fornavn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Ola"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Etternavn</label>
                                    <input
                                        type="text"
                                        value={formData.etternavn}
                                        onChange={(e) => updateField('etternavn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Nordmann"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Fødselsdato</label>
                                    <input
                                        type="date"
                                        value={formData.fodselsdato}
                                        onChange={(e) => updateField('fodselsdato', e.target.value)}
                                        className="input-field !text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Fødselsnummer (11 siffer)</label>
                                    <input
                                        type="text"
                                        value={formData.fnr}
                                        onChange={(e) => updateField('fnr', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="01019012345"
                                        maxLength={11}
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Kjønn</label>
                                    <select
                                        value={formData.kjonn}
                                        onChange={(e) => updateField('kjonn', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="mann">Mann</option>
                                        <option value="kvinne">Kvinne</option>
                                        <option value="annet">Annet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="form-label form-required">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.adresse}
                                        onChange={(e) => updateField('adresse', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Storgata 1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label form-required">Postnummer</label>
                                        <input
                                            type="text"
                                            value={formData.postnummer}
                                            onChange={(e) => updateField('postnummer', e.target.value)}
                                            className="input-field !text-sm font-mono"
                                            placeholder="0182"
                                            maxLength={4}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label form-required">Poststed</label>
                                        <input
                                            type="text"
                                            value={formData.poststed}
                                            onChange={(e) => updateField('poststed', e.target.value)}
                                            className="input-field !text-sm"
                                            placeholder="Oslo"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label form-required">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.telefon}
                                        onChange={(e) => updateField('telefon', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="412 34 567"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">E-post</label>
                                    <input
                                        type="email"
                                        value={formData.epost}
                                        onChange={(e) => updateField('epost', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="ola@eksempel.no"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Emergency Contact */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Phone className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">2. Kontaktperson</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Nærmeste pårørende eller kontaktperson ved nødstilfelle</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label form-required">Navn</label>
                                    <input
                                        type="text"
                                        value={formData.kontaktpersonNavn}
                                        onChange={(e) => updateField('kontaktpersonNavn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Kari Nordmann"
                                    />
                                </div>
                                <div>
                                    <label className="form-label form-required">Relasjon</label>
                                    <select
                                        value={formData.kontaktpersonRelasjon}
                                        onChange={(e) => updateField('kontaktpersonRelasjon', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="ektefelle">Ektefelle/Partner</option>
                                        <option value="forelder">Forelder</option>
                                        <option value="barn">Barn</option>
                                        <option value="sosken">Søsken</option>
                                        <option value="annen">Annen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label form-required">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.kontaktpersonTelefon}
                                        onChange={(e) => updateField('kontaktpersonTelefon', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="987 65 432"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: GP Information */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <UserPlus className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">3. Fastlegeinformasjon</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Informasjon om pasientens fastlege</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">Fastlegens navn</label>
                                    <input
                                        type="text"
                                        value={formData.fastlegeNavn}
                                        onChange={(e) => updateField('fastlegeNavn', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Dr. Hansen"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Praksis</label>
                                    <input
                                        type="text"
                                        value={formData.fastlegePraksis}
                                        onChange={(e) => updateField('fastlegePraksis', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Sentrum legesenter"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Telefon</label>
                                    <input
                                        type="tel"
                                        value={formData.fastlegeTelefon}
                                        onChange={(e) => updateField('fastlegeTelefon', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="22 33 44 55"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Insurance and HELFO */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">4. Forsikring og HELFO</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Forsikrings- og refusjonsinformasjon</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">HELFO-nummer</label>
                                    <input
                                        type="text"
                                        value={formData.helfoNummer}
                                        onChange={(e) => updateField('helfoNummer', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="1234567890"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Forsikringsselskap</label>
                                    <input
                                        type="text"
                                        value={formData.forsikringsselskap}
                                        onChange={(e) => updateField('forsikringsselskap', e.target.value)}
                                        className="input-field !text-sm"
                                        placeholder="Gjensidige, If, osv."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Polissenummer</label>
                                    <input
                                        type="text"
                                        value={formData.polisseNummer}
                                        onChange={(e) => updateField('polisseNummer', e.target.value)}
                                        className="input-field !text-sm font-mono"
                                        placeholder="POL-123456"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Medical History */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">5. Medisinsk historikk</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Tidligere og nåværende helsetilstand</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Allergier</label>
                                    <textarea
                                        value={formData.allergier}
                                        onChange={(e) => updateField('allergier', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv kjente allergier (medikamenter, mat, annet)..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Kroniske sykdommer</label>
                                    <textarea
                                        value={formData.kroniskeSykdommer}
                                        onChange={(e) => updateField('kroniskeSykdommer', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv kroniske sykdommer (f.eks. diabetes, astma, hypertensjon)..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Faste medisiner</label>
                                    <textarea
                                        value={formData.fasteMedisiner}
                                        onChange={(e) => updateField('fasteMedisiner', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="List opp faste medisiner med dosering..."
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Tidligere operasjoner</label>
                                    <textarea
                                        value={formData.tidligereOperasjoner}
                                        onChange={(e) => updateField('tidligereOperasjoner', e.target.value)}
                                        className="input-field !text-sm min-h-[80px] resize-y"
                                        placeholder="Beskriv tidligere kirurgiske inngrep med årstall..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Family History */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">6. Familiehistorikk</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Arvelige sykdommer i familien</p>

                            <div>
                                <label className="form-label">Kjente arvelige sykdommer</label>
                                <textarea
                                    value={formData.familiehistorikk}
                                    onChange={(e) => updateField('familiehistorikk', e.target.value)}
                                    className="input-field !text-sm min-h-[80px] resize-y"
                                    placeholder="Beskriv kjente arvelige sykdommer i familien..."
                                />
                            </div>

                            <div className="mt-4 p-3 bg-[#F5FAFF] rounded-lg border border-[#F5EDE6]">
                                <div className="flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5 text-[#A0714F]" />
                                    <span className="text-xs font-semibold text-[#A0714F]">
                                        Registrer kjente arvelige sykdommer i familien (f.eks. diabetes, hjertesykdom, kreft)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 7: Lifestyle */}
                        <div className="form-section">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-[#A0714F]" />
                                <h2 className="form-section-title !mb-0 !pb-0 !border-0">7. Livsstil</h2>
                            </div>
                            <p className="text-xs text-[var(--medical-gray-400)] mb-4 ml-6">Levevaner og livsstilsinformasjon</p>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">Røykestatus</label>
                                    <select
                                        value={formData.roykestatus}
                                        onChange={(e) => updateField('roykestatus', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="aldri">Aldri røykt</option>
                                        <option value="tidligere">Tidligere røyker</option>
                                        <option value="daglig">Daglig røyker</option>
                                        <option value="avOgTil">Av og til</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Alkoholbruk</label>
                                    <select
                                        value={formData.alkohol}
                                        onChange={(e) => updateField('alkohol', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="aldri">Aldri</option>
                                        <option value="sjelden">Sjelden</option>
                                        <option value="ukentlig">Ukentlig</option>
                                        <option value="daglig">Daglig</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Trening</label>
                                    <select
                                        value={formData.trening}
                                        onChange={(e) => updateField('trening', e.target.value)}
                                        className="input-field !text-sm"
                                    >
                                        <option value="">Velg...</option>
                                        <option value="ingen">Ingen</option>
                                        <option value="1-2">1-2 ganger/uke</option>
                                        <option value="3-4">3-4 ganger/uke</option>
                                        <option value="5+">5+ ganger/uke</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer with GDPR badge */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#3D8B6E]" />
                                <span className="text-xs font-semibold text-[#3D8B6E]">GDPR-kompatibel pasientregistrering</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={saving} className="btn-secondary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {saving ? 'Lagrer...' : 'Lagre utkast'}
                                </button>
                                <button onClick={handleSubmit} disabled={submitting} className="btn-primary !py-2.5 !px-6 text-sm flex items-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    {submitting ? 'Registrerer...' : 'Registrer pasient'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
