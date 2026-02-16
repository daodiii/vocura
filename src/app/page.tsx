import Link from "next/link";
import { Mic, FileText, Shield, ClipboardList, BookOpen, ChevronRight, CheckCircle2, Stethoscope, Brain, Smile, Activity, ArrowRight, Star, Zap, Clock, Globe, Server, Eye } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#B8860B] to-[#FFD700] rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold gradient-text">Aurelius</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#funksjoner" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Funksjoner</a>
            <a href="#spesialiteter" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Spesialiteter</a>
            <a href="#sikkerhet" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Databehandling</a>
            <a href="#priser" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Priser</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block cursor-pointer">
              Logg inn
            </Link>
            <Link
              href="/login"
              className="glass-btn-primary text-sm !py-2.5 !px-5 inline-flex items-center gap-2 cursor-pointer"
            >
              Start gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(184,134,11,0.10)] border border-[rgba(255,215,0,0.25)] rounded-full mb-8 animate-fade-in">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-white">Ny</span>
            <span className="text-sm text-[#DAA520] font-medium">AI-drevet dokumentasjon for helsepersonell</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-[var(--text-primary)] animate-slide-up stagger-1">
            Dokumentasjon som jobber
            <span className="gradient-text-lg"> for deg</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in stagger-2">
            Aurelius AI transkriberer pasientkonsultasjoner i sanntid, genererer profesjonelle journalnotater og fyller ut norske helseskjemaer automatisk.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in stagger-3">
            <Link
              href="/login"
              className="glass-btn-primary text-base !py-3.5 !px-8 inline-flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
            >
              <Mic className="w-5 h-5" />
              Prøv Aurelius gratis
            </Link>
            <a
              href="#funksjoner"
              className="glass-btn-secondary text-base !py-3.5 !px-8 inline-flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
            >
              Se hvordan det fungerer
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mock UI Preview */}
          <div className="glass-card-elevated p-2 max-w-3xl mx-auto animate-slide-up stagger-4">
            <div className="glass-card-static rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                <span className="text-xs text-[var(--text-muted)] ml-4 font-mono">Aurelius AI Dashboard</span>
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-[var(--primary-subtle)] rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-[var(--primary-light)]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Direkte transkripsjon</div>
                      <div className="text-xs text-[var(--success)] font-medium">Aktiv</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[var(--glass-border)] rounded-full w-full" />
                    <div className="h-2 bg-[var(--glass-border)] rounded-full w-4/5" />
                    <div className="h-2 bg-[var(--primary-subtle)] rounded-full w-3/5" />
                  </div>
                </div>
                <div className="flex-1 glass-card-static rounded-lg p-4">
                  <div className="text-xs font-semibold text-[var(--primary-light)] uppercase tracking-wider mb-2">SOAP-notat</div>
                  <div className="space-y-1.5">
                    <div className="h-2 bg-[var(--glass-border)] rounded w-full" />
                    <div className="h-2 bg-[var(--glass-border)] rounded w-5/6" />
                    <div className="h-2 bg-[var(--glass-border)] rounded w-4/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-[var(--glass-border)] py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Eye className="w-5 h-5 text-[var(--success)]" />
                <span className="text-2xl font-bold text-[var(--text-primary)]">Personvern</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">Transparent databehandling</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Server className="w-5 h-5 text-[var(--primary-light)]" />
                <span className="text-2xl font-bold text-[var(--text-primary)]">Minimal lagring</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">Kun midlertidig prosessering</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-2xl font-bold text-[var(--text-primary)]">Medisinsk</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">Optimalisert for norsk terminologi</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-[var(--warning)]" />
                <span className="text-2xl font-bold text-[var(--text-primary)]">AI-assistert</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">Effektiv dokumentasjon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funksjoner" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Alt du trenger, ett sted
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Fra konsultasjon til ferdig journal — Aurelius effektiviserer hele dokumentasjonsprosessen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card p-8 group cursor-pointer">
              <div className="w-12 h-12 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[var(--primary)] transition-colors">
                <Mic className="w-6 h-6 text-[var(--primary-light)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Sanntids transkripsjon</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                AI-drevet tale-til-tekst som forstår medisinsk terminologi på norsk. Transkriber konsultasjoner direkte.
              </p>
            </div>

            <div className="glass-card p-8 group cursor-pointer">
              <div className="w-12 h-12 bg-[var(--success-subtle)] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[var(--success)] transition-colors">
                <BookOpen className="w-6 h-6 text-[var(--success)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Journalføring</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Dikter notater etter konsultasjoner. AI-en omformer tale til profesjonelle journalnotater automatisk.
              </p>
            </div>

            <div className="glass-card p-8 group cursor-pointer">
              <div className="w-12 h-12 bg-[var(--warning-subtle)] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[var(--warning)] transition-colors">
                <ClipboardList className="w-6 h-6 text-[var(--warning)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Norske helseskjemaer</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Fyll ut NAV-skjemaer, HELFO-refusjoner, henvisninger og samtykkeformularer — direkte fra plattformen.
              </p>
            </div>

            <div className="glass-card p-8 group cursor-pointer">
              <div className="w-12 h-12 bg-[var(--primary-subtle)] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[var(--primary)] transition-colors">
                <FileText className="w-6 h-6 text-[var(--primary-light)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Profesjonelle maler</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                SOAP-notater, epikriser, behandlingsplaner og mer — tilpasset din profesjon og spesialitet.
              </p>
            </div>

            <div className="glass-card p-8 group cursor-pointer">
              <div className="w-12 h-12 bg-[var(--accent-glow)] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[var(--accent)] transition-colors">
                <Zap className="w-6 h-6 text-[var(--accent)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">AI-diktering</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Snakk fritt — AI-en forstår konteksten og lager strukturert, formelt tekst som er klar til bruk.
              </p>
            </div>

            <div className="glass-card p-8 group cursor-pointer">
              <div className="w-12 h-12 bg-[var(--success-subtle)] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[var(--success)] transition-colors">
                <Shield className="w-6 h-6 text-[var(--success)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Transparent databehandling</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Samtykkebasert opptak med eksplisitt bekreftelse. Midlertidige filer slettes umiddelbart etter prosessering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Tre enkle steg
            </h2>
            <p className="text-lg text-[var(--text-muted)]">
              Fra konsultasjon til ferdig dokument på sekunder.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-gold" style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)' }}>
                <Mic className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-bold text-[#DAA520] uppercase tracking-wider mb-2">Steg 1</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Ta opp</h3>
              <p className="text-[var(--text-secondary)]">Start opptak under konsultasjonen. Aurelius lytter og transkriberer i sanntid.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-gold" style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)' }}>
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-bold text-[#DAA520] uppercase tracking-wider mb-2">Steg 2</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">AI behandler</h3>
              <p className="text-[var(--text-secondary)]">AI-en analyserer transkripsjonen og genererer et profesjonelt, strukturert dokument.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-gold" style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)' }}>
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="text-sm font-bold text-[#DAA520] uppercase tracking-wider mb-2">Steg 3</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">Ferdig journal</h3>
              <p className="text-[var(--text-secondary)]">Gjennomgå, rediger og eksporter til EPJ. Klar for signering og arkivering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="spesialiteter" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Skreddersydd for din profesjon
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Spesialiserte maler, skjemaer og arbeidsflyter for ulike helsefaglige roller.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center group cursor-pointer">
              <div className="w-14 h-14 bg-[var(--primary-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--primary)] transition-colors">
                <Stethoscope className="w-7 h-7 text-[var(--primary-light)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Lege / Spesialist</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">SOAP-notater, epikriser, sykemeldinger, henvisninger, resepter</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="glass-badge glass-badge-primary">NAV</span>
                <span className="glass-badge glass-badge-primary">HELFO</span>
                <span className="glass-badge glass-badge-primary">ICD-10</span>
              </div>
            </div>

            <div className="glass-card p-6 text-center group cursor-pointer">
              <div className="w-14 h-14 bg-[var(--primary-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--primary)] transition-colors">
                <Smile className="w-7 h-7 text-[var(--primary-light)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Tannlege</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Tannkart, behandlingsplaner, HELFO-refusjoner, akutt-konsultasjoner</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="glass-badge glass-badge-primary">HELFO</span>
                <span className="glass-badge glass-badge-primary">Tannkart</span>
              </div>
            </div>

            <div className="glass-card p-6 text-center group cursor-pointer">
              <div className="w-14 h-14 bg-[var(--primary-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--primary)] transition-colors">
                <Brain className="w-7 h-7 text-[var(--primary-light)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Psykolog / Psykiater</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Inntaksnotater, terapinotater, suicidalvurderinger, epikriser</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="glass-badge glass-badge-primary">HoNOSCA</span>
                <span className="glass-badge glass-badge-primary">CGAS</span>
              </div>
            </div>

            <div className="glass-card p-6 text-center group cursor-pointer">
              <div className="w-14 h-14 bg-[var(--primary-subtle)] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--primary)] transition-colors">
                <Activity className="w-7 h-7 text-[var(--primary-light)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Fysioterapeut</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">Funksjonsvurderinger, opptreningsplaner, HELFO-refusjoner</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="glass-badge glass-badge-primary">ICF</span>
                <span className="glass-badge glass-badge-primary">HELFO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="sikkerhet" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Slik behandler vi data
            </h2>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Vi er åpne om hvordan Aurelius håndterer data. Ingen skjulte prosesser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card-elevated p-8">
              <Globe className="w-8 h-8 text-[var(--primary-light)] mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Ekstern prosessering</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">Lydopptak sendes til OpenAI Whisper API for transkripsjon. Midlertidige filer slettes umiddelbart etter prosessering.</p>
            </div>
            <div className="glass-card-elevated p-8">
              <Shield className="w-8 h-8 text-[var(--primary-light)] mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Samtykkebasert</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">Opptak krever eksplisitt samtykke. Ingen pasientdata lagres permanent på våre servere. Alt forblir i din nettleser-sesjon.</p>
            </div>
            <div className="glass-card-elevated p-8">
              <Server className="w-8 h-8 text-[var(--primary-light)] mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Minimal datalagring</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">Transkripsjoner eksisterer kun i nettleseren din og forsvinner når du lukker fanen. Lydopptak lagres midlertidig på serveren under prosessering og slettes automatisk umiddelbart etterpå.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="priser" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Enkel og transparent prising
            </h2>
            <p className="text-lg text-[var(--text-muted)]">
              Start gratis. Oppgrader når du er klar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-8 text-center">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Prøveperiode</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[var(--text-primary)]">Gratis</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-6">14 dager, ingen kort nødvendig</p>
              <ul className="text-sm text-[var(--text-secondary)] space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> 30 transkripsjoner</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Alle maler inkludert</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Grunnleggende skjemaer</li>
              </ul>
              <Link href="/login" className="glass-btn-secondary w-full inline-flex items-center justify-center gap-2 cursor-pointer">
                Start gratis
              </Link>
            </div>

            <div className="glass-card-elevated p-8 text-center relative glow-gold">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)' }}>Mest populær</span>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Profesjonell</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[var(--text-primary)]">799</span>
                <span className="text-[var(--text-muted)] text-sm"> kr/mnd</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-6">Per bruker, fakturert årlig</p>
              <ul className="text-sm text-[var(--text-secondary)] space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Ubegrenset transkripsjoner</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Alle maler og skjemaer</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> AI-diagnosekoder (ICPC-2/ICD-10)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> NAV/HELFO-integrasjon</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Prioritert support</li>
              </ul>
              <Link href="/login" className="glass-btn-primary w-full inline-flex items-center justify-center gap-2 cursor-pointer">
                Start prøveperiode
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="glass-card p-8 text-center">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Klinikk</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[var(--text-primary)]">Tilpasset</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-6">For klinikker og avdelinger</p>
              <ul className="text-sm text-[var(--text-secondary)] space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Alt i Profesjonell</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> EPJ-integrasjon</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Kvalitetsdashboard</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" /> Dedikert kontaktperson</li>
              </ul>
              <a href="#" className="glass-btn-secondary w-full inline-flex items-center justify-center gap-2 cursor-pointer">
                Kontakt salg
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card-elevated p-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-gold" style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)' }}>
              <Star className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Klar til å spare tid?
            </h2>
            <p className="text-lg text-[var(--text-muted)] mb-8 max-w-lg mx-auto">
              Prøv Aurelius gratis i 14 dager og opplev forskjellen i din dokumentasjonshverdag.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="glass-btn-primary text-base !py-3.5 !px-8 inline-flex items-center gap-2 cursor-pointer"
              >
                Start gratis prøveperiode
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#funksjoner" className="glass-btn-ghost text-base inline-flex items-center gap-2 cursor-pointer">
                <Clock className="w-4 h-4" />
                Se demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#B8860B] to-[#FFD700] rounded-lg flex items-center justify-center">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold gradient-text">Aurelius</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                AI-drevet medisinsk dokumentasjon for norske helsepersonell.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Produkt</h4>
              <ul className="space-y-3">
                <li><a href="#funksjoner" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Funksjoner</a></li>
                <li><Link href="/templates" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Maler</Link></li>
                <li><Link href="/forms" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Skjemaer</Link></li>
                <li><a href="#priser" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Priser</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Informasjon</h4>
              <ul className="space-y-3">
                <li><a href="#sikkerhet" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Databehandling</a></li>
                <li><Link href="/personvern" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Personvern</Link></li>
                <li><Link href="/vilkar" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Vilkår</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">Kontakt</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Support</a></li>
                <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Salg</a></li>
                <li><a href="#" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Om oss</a></li>
              </ul>
            </div>
          </div>

          <div className="section-divider pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-muted)]">&copy; 2026 Aurelius Technologies AS. Alle rettigheter reservert.</p>
            <div className="flex items-center gap-4">
              <Link href="/personvern" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Personvern</Link>
              <Link href="/vilkar" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary-light)] transition-colors cursor-pointer">Vilkår</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
