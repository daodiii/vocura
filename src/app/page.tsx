import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  Mic,
  Pill,
  Shield,
} from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ThemeToggle from "@/components/ThemeToggle";
import BentoGrid from "@/components/BentoGrid";
import BentoThemeTile from "@/components/BentoThemeTile";

/* ------------------------------------------------------------------ */
/*  Inline mockup components (static JSX, no state)                    */
/* ------------------------------------------------------------------ */

function TranscriptionMockup() {
  return (
    <div className="mockup-shell">
      <div className="mockup-topbar">
        <div className="mockup-dots" />
        <span className="mockup-url">vocura.no/dashboard</span>
      </div>

      {/* Live recording badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#EF4444]">
          Live opptak
        </span>
        <span className="text-[10px] text-[#5C5C5C] ml-auto font-mono">
          03:24
        </span>
      </div>

      {/* Waveform bars */}
      <div className="flex items-end gap-[3px] mb-5 h-8">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="bento-waveform-bar w-[3px] rounded-full bg-gradient-to-t from-[#EC4899] to-[#F97316]"
            style={{
              height: `${12 + Math.sin(i * 0.7) * 10 + Math.cos(i * 1.3) * 6}px`,
              opacity: 0.6 + Math.sin(i * 0.5) * 0.4,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>

      {/* Transcript bubbles */}
      <div className="space-y-2.5">
        <div className="mockup-bubble">
          <span className="mockup-avatar text-[#7B89DB]">DR</span>
          <div className="mockup-bubble-text">
            Hvor lenge har disse symptomene pågått?
          </div>
        </div>
        <div className="mockup-bubble">
          <span className="mockup-avatar text-[#10B981]">PA</span>
          <div className="mockup-bubble-text">
            Omtrent tre uker, verst om morgenen.
          </div>
        </div>
        <div className="mockup-bubble">
          <span className="mockup-avatar text-[#7B89DB]">DR</span>
          <div className="mockup-bubble-text opacity-60">
            Genererer SOAP-notat...
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorMockup() {
  return (
    <div className="mockup-shell">
      <div className="mockup-topbar">
        <div className="mockup-dots" />
        <span className="mockup-url">vocura.no/editor</span>
      </div>

      <div className="flex gap-3 mt-1">
        {/* Main text editor area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider">
              SOAP Journalnotat
            </div>
            <span className="text-[8px] font-bold bg-[rgba(59,130,246,0.15)] text-[#3B82F6] px-1.5 py-0.5 rounded">
              AI
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold text-[#7B89DB]">
              Subjektiv
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.08)] rounded w-full" />
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded w-4/5" />
            <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded w-3/5" />

            <div className="text-[10px] font-semibold text-[#7B89DB] mt-3">
              Objektiv
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.08)] rounded w-full" />
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded w-3/5" />

            <div className="text-[10px] font-semibold text-[#7B89DB] mt-3">
              Analyse
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.08)] rounded w-4/5" />
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded w-2/3" />

            <div className="text-[10px] font-semibold text-[#7B89DB] mt-3">
              Plan
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.08)] rounded w-full" />
          </div>
        </div>

        {/* Diagnosis code panel */}
        <div className="w-24 shrink-0 border border-[rgba(59,130,246,0.2)] rounded-lg p-2.5 bg-[rgba(59,130,246,0.05)]">
          <div className="text-[9px] font-bold text-[#3B82F6] uppercase tracking-wider mb-2.5">
            ICPC-2
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-[rgba(59,130,246,0.15)] rounded text-[9px] text-[#3B82F6] font-mono">
                L03
              </span>
              <span className="text-[8px] text-[#5C5C5C]">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-[rgba(59,130,246,0.08)] rounded text-[9px] text-[#5C5C5C] font-mono">
                L84
              </span>
              <span className="text-[8px] text-[#5C5C5C]">74%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-[rgba(59,130,246,0.08)] rounded text-[9px] text-[#5C5C5C] font-mono">
                L18
              </span>
              <span className="text-[8px] text-[#5C5C5C]">61%</span>
            </div>
          </div>
          <div className="text-[9px] font-bold text-[#8B5CF6] uppercase tracking-wider mt-3 mb-2">
            ICD-10
          </div>
          <div className="space-y-1.5">
            <span className="px-1.5 py-0.5 bg-[rgba(139,92,246,0.1)] rounded text-[9px] text-[#8B5CF6] font-mono block w-fit">
              M54.5
            </span>
            <span className="px-1.5 py-0.5 bg-[rgba(139,92,246,0.06)] rounded text-[9px] text-[#5C5C5C] font-mono block w-fit">
              M47.8
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormsMockup() {
  const forms = [
    { name: "Sykemelding", icon: FileText, color: "#F59E0B", tag: "NAV" },
    { name: "SOAP Notat", icon: Mic, color: "#5E6AD2", tag: null },
    { name: "Samtykke", icon: CheckCircle2, color: "#10B981", tag: null },
    { name: "HELFO Krav", icon: Shield, color: "#3B82F6", tag: "HELFO" },
    { name: "PHQ-9", icon: Activity, color: "#8B5CF6", tag: null },
    { name: "Henvisning", icon: ArrowRight, color: "#EC4899", tag: null },
  ];
  return (
    <div className="mockup-shell">
      <div className="mockup-topbar">
        <div className="mockup-dots" />
        <span className="mockup-url">vocura.no/forms</span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold text-[#5C5C5C] uppercase tracking-wider">
          17 skjemaer
        </div>
        <div className="h-5 w-20 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {forms.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.name}
              className="rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] p-2 text-center hover:border-[rgba(255,255,255,0.12)] transition-colors"
            >
              <Icon
                className="w-4 h-4 mx-auto mb-1"
                style={{ color: f.color }}
              />
              <div className="text-[9px] font-medium text-[#8B8B8B] leading-tight">
                {f.name}
              </div>
              {f.tag && (
                <div
                  className="text-[8px] font-bold uppercase mt-0.5"
                  style={{ color: f.color }}
                >
                  {f.tag}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BentoFelleskatalogenMockup() {
  return (
    <div className="mt-3 space-y-2.5">
      {/* User message */}
      <div className="flex items-start gap-2">
        <span className="w-5 h-5 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-[8px] font-bold text-[#10B981] shrink-0">
          ?
        </span>
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5 text-[10px] text-[#8B8B8B]">
          Maksdose paracetamol voksne?
        </div>
      </div>
      {/* AI response */}
      <div className="flex items-start gap-2">
        <span className="w-5 h-5 rounded-full bg-[rgba(16,185,129,0.12)] flex items-center justify-center shrink-0">
          <Pill className="w-2.5 h-2.5 text-[#10B981]" />
        </span>
        <div className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)] rounded-lg px-2.5 py-1.5 text-[10px] text-[#8B8B8B] leading-relaxed">
          <span className="text-[#10B981] font-semibold">4g/24t.</span> Maks
          enkeltdose 1g. Minst 4-6 timers intervall mellom doser.
        </div>
      </div>
      <div className="text-[8px] text-[#5C5C5C] opacity-50 pl-7">
        Felleskatalogen RAG
      </div>
    </div>
  );
}

function BentoLabMockup() {
  const values = [
    { name: "Hb", value: "14.2", unit: "g/dL", pct: 70, color: "#10B981" },
    { name: "CRP", value: "48", unit: "mg/L", pct: 90, color: "#EF4444" },
    { name: "Glukose", value: "5.8", unit: "mmol/L", pct: 55, color: "#F59E0B" },
  ];
  return (
    <div className="mt-3 space-y-3">
      {values.map((v) => (
        <div key={v.name} className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#8B8B8B] w-12">
            {v.name}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${v.pct}%`, background: v.color }}
            />
          </div>
          <span
            className="text-[10px] font-mono font-semibold w-8 text-right"
            style={{ color: v.color }}
          >
            {v.value}
          </span>
          <span className="text-[8px] text-[#5C5C5C] w-10">{v.unit}</span>
        </div>
      ))}
    </div>
  );
}

function BentoSummaryMockup() {
  return (
    <div className="mt-3">
      {/* Language tabs */}
      <div className="flex gap-1 mb-3">
        {["Bokmål", "Nynorsk", "Enkelt"].map((lang, i) => (
          <span
            key={lang}
            className={`text-[8px] px-2 py-0.5 rounded-full font-medium ${
              i === 0
                ? "bg-[rgba(6,182,212,0.15)] text-[#06B6D4]"
                : "bg-[rgba(255,255,255,0.04)] text-[#5C5C5C]"
            }`}
          >
            {lang}
          </span>
        ))}
      </div>
      {/* Skeleton summary lines */}
      <div className="space-y-1.5">
        <div className="h-1.5 bg-[rgba(255,255,255,0.08)] rounded w-full" />
        <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded w-[85%]" />
        <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded w-[65%]" />
        <div className="h-1.5 bg-[rgba(255,255,255,0.04)] rounded w-[75%]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ======================== HEADER ======================== */}
      <header className="landing-header">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#5E6AD2]" />
            <span className="landing-logo">Vocura</span>
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-7">
            <a href="#produkt" className="landing-nav-link">Produkt</a>
            <a href="#sikkerhet" className="landing-nav-link">Sikkerhet</a>
            <a href="#priser" className="landing-nav-link">Priser</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="landing-theme-toggle hidden sm:flex" />
            <Link href="/login" className="landing-nav-link hidden sm:block">
              Logg inn
            </Link>
            <Link href="/login" className="landing-btn-primary">
              Kom i gang
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ======================== HERO ======================== */}
      <HeroSection />

      {/* ======================== TRUST BAR ======================== */}
      <div className="trust-marquee-bar">
        <div className="trust-marquee-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="contents">
              <span className="trust-marquee-item">Trygg</span>
              <span className="trust-marquee-separator">&middot;</span>
              <span className="trust-marquee-item">Presis</span>
              <span className="trust-marquee-separator">&middot;</span>
              <span className="trust-marquee-item">Rask</span>
              <span className="trust-marquee-separator">&middot;</span>
              <span className="trust-marquee-item">Automatisert</span>
              <span className="trust-marquee-separator">&middot;</span>
              <span className="trust-marquee-item">GDPR-kompatibel</span>
              <span className="trust-marquee-separator">&middot;</span>
              <span className="trust-marquee-item">Norsk</span>
              <span className="trust-marquee-separator">&middot;</span>
              <span className="trust-marquee-item">Kryptert</span>
              <span className="trust-marquee-separator">&middot;</span>
              <span className="trust-marquee-item">Sikker</span>
              <span className="trust-marquee-separator">&middot;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ======================== BENTO PLATFORM GRID ======================== */}
      <section id="produkt" className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="section-eyebrow">Plattformen</p>
            <h2 className="showcase-section-title">
              Alt du trenger for klinisk dokumentasjon
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto mt-4">
              Fra diktering til ferdig journal — ett verktøy for hele
              arbeidsflyten.
            </p>
          </div>

          <BentoGrid>
            {/* Tile 1: Diktering (hero, 2×2) */}
            <div
              className="bento-tile bento-tile--diktering bento-area-diktering"
              data-bento-index="0"
            >
              <span className="bento-tile-eyebrow text-[#EC4899]">
                Diktering
              </span>
              <h3 className="bento-tile-title">Dikter, ikke skriv</h3>
              <p className="bento-tile-desc">
                Ambient lytting transkriberer hele konsultasjonen med medisinsk
                presisjon — fra tale til strukturert tekst.
              </p>
              <div className="bento-tile-mockup">
                <TranscriptionMockup />
              </div>
            </div>

            {/* Tile 2: Journalføring (hero, 2×2) */}
            <div
              className="bento-tile bento-tile--journal bento-area-journal"
              data-bento-index="1"
            >
              <span className="bento-tile-eyebrow text-[#3B82F6]">
                Journalføring
              </span>
              <h3 className="bento-tile-title">AI-drevet journalføring</h3>
              <p className="bento-tile-desc">
                SOAP-notater og diagnosekoder genereres automatisk med
                konfidensnivå.
              </p>
              <div className="bento-tile-mockup">
                <EditorMockup />
              </div>
            </div>

            {/* Tile 3: Skjemaer (hero, 2×2) */}
            <div
              className="bento-tile bento-tile--skjemaer bento-area-skjemaer"
              data-bento-index="2"
            >
              <span className="bento-tile-eyebrow text-[#8B5CF6]">
                Skjemaer
              </span>
              <h3 className="bento-tile-title">17 ferdige helseskjemaer</h3>
              <p className="bento-tile-desc">
                Sykemelding, HELFO-refusjon, samtykke, PHQ-9 og mer — ferdig
                utfylte.
              </p>
              <div className="bento-tile-mockup">
                <FormsMockup />
              </div>
            </div>

            {/* Tile 4: Felleskatalogen (1×1) */}
            <div
              className="bento-tile bento-tile--felles bento-area-felles"
              data-bento-index="3"
            >
              <span className="bento-tile-eyebrow text-[#10B981]">
                Felleskatalogen
              </span>
              <h3 className="bento-tile-title-sm">
                Legemiddeloppslag med AI
              </h3>
              <BentoFelleskatalogenMockup />
            </div>

            {/* Tile 5: Lab (1×1) */}
            <div
              className="bento-tile bento-tile--lab bento-area-lab"
              data-bento-index="4"
            >
              <span className="bento-tile-eyebrow text-[#F59E0B]">Lab</span>
              <h3 className="bento-tile-title-sm">NOKLUS referanseverdier</h3>
              <BentoLabMockup />
            </div>

            {/* Tile 6: Pasientoppsummering (1×1) */}
            <div
              className="bento-tile bento-tile--summary bento-area-summary"
              data-bento-index="5"
            >
              <span className="bento-tile-eyebrow text-[#06B6D4]">
                Oppsummering
              </span>
              <h3 className="bento-tile-title-sm">
                Pasientvennlig sammendrag
              </h3>
              <BentoSummaryMockup />
            </div>

            {/* Tile 7: GDPR (security, 1×1) */}
            <div
              id="sikkerhet"
              className="bento-tile bento-tile--security bento-area-gdpr"
              data-bento-index="6"
            >
              <div className="bento-tile-icon-glow">
                <Shield className="w-5 h-5 text-[#5E6AD2]" />
              </div>
              <h3 className="bento-tile-title-sm">GDPR-kompatibel</h3>
              <p className="bento-tile-desc-sm">
                Full overholdelse av GDPR, norsk helselovgivning og Normen.
              </p>
            </div>

            {/* Tile 8: Kryptering (security, 1×1) */}
            <div
              className="bento-tile bento-tile--security bento-area-kryptering"
              data-bento-index="7"
            >
              <div className="bento-tile-icon-glow">
                <Lock className="w-5 h-5 text-[#5E6AD2]" />
              </div>
              <h3 className="bento-tile-title-sm">Ende-til-ende kryptering</h3>
              <p className="bento-tile-desc-sm">
                TLS 1.3 med strenge tilgangskontroller.
              </p>
            </div>

            {/* Tile 9: Sikker lagring (security, 1×2) */}
            <div
              className="bento-tile bento-tile--security bento-area-sikkerlag"
              data-bento-index="8"
            >
              <div className="bento-tile-icon-glow">
                <Shield className="w-5 h-5 text-[#5E6AD2]" />
              </div>
              <h3 className="bento-tile-title-sm">Sikker datalagring</h3>
              <p className="bento-tile-desc-sm">
                Revisjonlogget lagring med tilgangskontroll, i samsvar med
                helsepersonelloven og pasientjournalforskriften.
              </p>
            </div>

            {/* Tile 10: Tema (customization, 1×1) */}
            <div
              className="bento-tile bento-tile--tilpass bento-area-tilpass"
              data-bento-index="9"
            >
              <span className="bento-tile-eyebrow text-[#8B5CF6]">
                Tema
              </span>
              <h3 className="bento-tile-title-sm">Din stil</h3>
              <BentoThemeTile />
            </div>
          </BentoGrid>
        </div>
      </section>

      {/* ======================== PRICING ======================== */}
      <section id="priser" className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-eyebrow">Priser</p>
            <h2 className="section-title">Enkel, transparent prising</h2>
            <p className="section-subtitle">
              Start gratis. Oppgrader når du er klar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 — Prøvekonto */}
            <div className="pricing-card">
              <h3 className="text-lg font-semibold pricing-title mb-2">
                Prøvekonto
              </h3>
              <div className="mb-1">
                <span className="text-4xl font-bold pricing-amount">0</span>
                <span className="text-lg font-medium pricing-period ml-1">
                  kr
                </span>
              </div>
              <p className="text-sm pricing-description mb-6">
                14 dager, ingen kort nødvendig
              </p>
              <ul className="text-sm pricing-feature space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  30 transkripsjoner
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Alle maler inkludert
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Grunnleggende skjemaer
                </li>
              </ul>
              <Link
                href="/login"
                className="btn-ghost w-full inline-flex items-center justify-center gap-2"
              >
                Kom i gang
              </Link>
            </div>

            {/* Tier 2 — Profesjonell (highlighted) */}
            <div className="pricing-card pricing-card-highlighted relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6] text-white text-xs font-bold px-3 py-1 rounded-full">
                Mest populær
              </span>
              <h3 className="text-lg font-semibold pricing-title mb-2">
                Profesjonell
              </h3>
              <div className="mb-1">
                <span className="text-4xl font-bold pricing-amount">799</span>
                <span className="text-lg font-medium pricing-period ml-1">
                  kr/mnd
                </span>
              </div>
              <p className="text-sm pricing-description mb-6">
                Per bruker, fakturert årlig
              </p>
              <ul className="text-sm pricing-feature space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Ubegrenset transkripsjoner
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Alle maler og skjemaer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  AI-diagnosekoder (ICPC-2/ICD-10)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  NAV/HELFO-integrasjon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Ambient lytting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Prioritert support
                </li>
              </ul>
              <Link
                href="/login"
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                Kom i gang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tier 3 — Klinikk */}
            <div className="pricing-card">
              <h3 className="text-lg font-semibold pricing-title mb-2">
                Klinikk
              </h3>
              <div className="mb-1">
                <span className="text-4xl font-bold pricing-amount">
                  Tilpasset
                </span>
              </div>
              <p className="text-sm pricing-description mb-6">
                For klinikker og avdelinger
              </p>
              <ul className="text-sm pricing-feature space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Alt i Profesjonell
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  EPJ-integrasjon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Kvalitetsdashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Dedikert kontaktperson
                </li>
              </ul>
              <a
                href="mailto:hei@vocura.no"
                className="btn-ghost w-full inline-flex items-center justify-center gap-2"
              >
                Kontakt salg
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== CTA ======================== */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 landing-cta-gradient pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold cta-title tracking-tight mb-5 leading-tight">
            Klar til å transformere
            <br />
            dokumentasjonen?
          </h2>
          <p className="text-lg cta-subtitle max-w-xl mx-auto mb-10">
            Bli med tusenvis av helsepersonell som sparer 2+ timer daglig med
            Vocura. Prøv gratis i 14 dager.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="vocura-btn-cta-primary">
              Kom i gang gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:hei@vocura.no" className="vocura-btn-cta-secondary">
              Kontakt oss
            </a>
          </div>
        </div>
      </section>

      {/* ======================== FOOTER ======================== */}
      <footer className="py-12 px-6 landing-footer">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-[#5E6AD2]" />
                <span className="text-base font-semibold footer-brand-name tracking-tight">
                  Vocura
                </span>
              </div>
              <p className="text-xs footer-brand-description leading-relaxed">
                AI-drevet medisinsk dokumentasjon for norske helsepersonell.
              </p>
            </div>

            {/* Produkt */}
            <div>
              <h4 className="text-xs font-semibold footer-heading uppercase tracking-widest mb-4">
                Produkt
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#produkt"
                    className="text-sm footer-link"
                  >
                    Funksjoner
                  </a>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="text-sm footer-link"
                  >
                    Maler
                  </Link>
                </li>
                <li>
                  <a
                    href="#priser"
                    className="text-sm footer-link"
                  >
                    Priser
                  </a>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-sm footer-link"
                  >
                    Dokumentasjon
                  </Link>
                </li>
              </ul>
            </div>

            {/* Juridisk */}
            <div>
              <h4 className="text-xs font-semibold footer-heading uppercase tracking-widest mb-4">
                Juridisk
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/personvern"
                    className="text-sm footer-link"
                  >
                    Personvern
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vilkar"
                    className="text-sm footer-link"
                  >
                    Vilkår
                  </Link>
                </li>
                <li>
                  <Link
                    href="/databehandleravtale"
                    className="text-sm footer-link"
                  >
                    Databehandleravtale
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kontakt */}
            <div className="hidden md:block">
              <h4 className="text-xs font-semibold footer-heading uppercase tracking-widest mb-4">
                Kontakt
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:hei@vocura.no"
                    className="text-sm footer-link"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hei@vocura.no"
                    className="text-sm footer-link"
                  >
                    Salg
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-divider pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm footer-copyright">
              &copy; 2026 Vocura Technologies AS. Alle rettigheter reservert.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/personvern"
                className="text-sm footer-link"
              >
                Personvern
              </Link>
              <Link
                href="/vilkar"
                className="text-sm footer-link"
              >
                Vilkår
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
