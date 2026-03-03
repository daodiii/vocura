// src/app/sikkerhet/page.tsx
import Link from "next/link";
import {
  Mic,
  ArrowLeft,
  Shield,
  Lock,
  Clock,
  FileCheck,
  Brain,
  Server,
  BadgeCheck,
  KeyRound,
  ArrowRight,
  Download,
  Globe,
} from "lucide-react";

export const metadata = {
  title: "Sikkerhet og Tillit | Vocura AI",
  description:
    "Les om hvordan Vocura AI beskytter pasientdata med BankID-autentisering, ende-til-ende-kryptering, automatisk datasletting og Normen-etterlevelse.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="bg-[#111111]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5E6AD2]">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#EDEDED]">Vocura</span>
          </div>
          <Link
            href="/"
            className="text-[#8B8B8B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors text-sm inline-flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(94,106,210,0.1)] text-[#5E6AD2] text-sm font-medium gap-2 mb-6">
            <Shield className="w-4 h-4" />
            <span>Sikkerhet</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Sikkerhet og Tillit
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert:{" "}
            {new Date().toLocaleDateString("nb-NO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          {/* 1. BankID */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <KeyRound className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. BankID/Buypass-autentisering
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vocura bruker BankID og Buypass for sterk identifisering av helsepersonell.
              Dette gir sikkerhetsnivå 4 — det høyeste nivået i norsk eID-infrastruktur.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Sikkerhetsnivå 4 (høyeste norske eID-nivå)</li>
              <li>Integrert via Criipto OIDC-leverandør</li>
              <li>E-post/passord tilgjengelig som alternativ innloggingsmetode</li>
            </ul>
          </section>

          {/* 2. E2E Encryption */}
          <section id="kryptering" className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Lock className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Ende-til-ende-kryptering
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Alle kliniske notater krypteres på din enhet før de sendes til serveren.
              Kun du kan dekryptere innholdet — selv ikke Vocura har tilgang.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>AES-256-GCM kryptering (militær standard)</li>
              <li>Nøkkel utledet fra din autentisering via PBKDF2</li>
              <li>Serveren lagrer kun kryptert data</li>
              <li>Krypteringsnøkkel slettes fra minnet ved inaktivitet</li>
            </ul>
          </section>

          {/* 3. Auto-delete */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Clock className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              3. Automatisk datasletting
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vocura er et følgeverktøy — ikke et journalsystem. Etter overføring til EPJ
              slettes data automatisk.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Lydopptak: slettes umiddelbart etter transkripsjon</li>
              <li>Notater: slettes automatisk innen 48 timer etter EPJ-overføring</li>
              <li>Konfigurerbart: velg 24 eller 48 timers oppbevaringstid</li>
              <li>Ikke-overførte notater slettes aldri automatisk</li>
            </ul>
          </section>

          {/* 4. Normen */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <FileCheck className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Normen-etterlevelse
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vocura følger Norm for informasjonssikkerhet og personvern i helse- og
              omsorgssektoren (Normen) og Helsedirektoratets anbefalinger.
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Tilgangskontroll: kun autentisert helsepersonell</li>
              <li>Revisjonslogg: alle handlinger logges med tidsstempel</li>
              <li>Automatisk sesjonsutløp etter 15 minutters inaktivitet</li>
              <li>Dataminimering: kun nødvendig informasjon behandles</li>
              <li>Kryptering i transit (TLS) og i hvile (AES-256)</li>
            </ul>
          </section>

          {/* 5. AI Pledge */}
          <section className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Brain className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              5. AI-treningsgaranti
            </h2>
            <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg p-4 mb-3">
              <p className="text-[#F59E0B] font-semibold text-lg">
                Vi bruker IKKE pasientdata til AI-trening.
              </p>
            </div>
            <p className="leading-relaxed text-[#8B8B8B]">
              Data sendt til OpenAI via Vocura brukes kun for å generere svar i sanntid.
              OpenAI lagrer ikke data fra API-kall for modelltrening. Vocura har en egen
              databehandleravtale med OpenAI som sikrer dette. Les mer om vår{" "}
              <Link href="/ai-styring" className="text-[#7B89DB] hover:underline">AI-styring</Link>.
            </p>
          </section>

          {/* 6. Infrastructure */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Server className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              6. Infrastruktur og sikkerhetstiltak
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>HTTPS overalt med HSTS og preload</li>
              <li>Content Security Policy (CSP) for XSS-beskyttelse</li>
              <li>Forespørselsbegrensning (rate limiting) på alle API-ruter</li>
              <li>Automatisk sesjonsutløp etter 15 minutter</li>
              <li>Database hostet i EU (Supabase)</li>
              <li>Inputvalidering på alle skjemaer (Zod)</li>
              <li>Referrer-Policy: strict-origin-when-cross-origin</li>
            </ul>
          </section>

          {/* 7. Data Flow */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <ArrowRight className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              7. Dataflyt
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Slik flyter data gjennom Vocura — fra mikrofon til journal:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(94,106,210,0.1)] flex items-center justify-center">
                  <Mic className="w-5 h-5 text-[#5E6AD2]" />
                </div>
                <div className="flex-1 bg-[#0F1629] rounded-lg p-3">
                  <p className="text-sm text-[#EDEDED] font-medium">Mikrofon</p>
                  <p className="text-xs text-[#8B8B8B]">Lydopptak i nettleseren</p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-px h-4 bg-[rgba(94,106,210,0.3)]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(94,106,210,0.1)] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#5E6AD2]" />
                </div>
                <div className="flex-1 bg-[#0F1629] rounded-lg p-3">
                  <p className="text-sm text-[#EDEDED] font-medium">Kryptert overføring (TLS 1.3)</p>
                  <p className="text-xs text-[#8B8B8B]">Lyd sendes til OpenAI API for transkripsjon</p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-px h-4 bg-[rgba(94,106,210,0.3)]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div className="flex-1 bg-[#0F1629] rounded-lg p-3">
                  <p className="text-sm text-[#EDEDED] font-medium">OpenAI API (transient)</p>
                  <p className="text-xs text-[#F59E0B]">Ingen lagring. Lyd slettes umiddelbart.</p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-px h-4 bg-[rgba(94,106,210,0.3)]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(94,106,210,0.1)] flex items-center justify-center">
                  <Server className="w-5 h-5 text-[#5E6AD2]" />
                </div>
                <div className="flex-1 bg-[#0F1629] rounded-lg p-3">
                  <p className="text-sm text-[#EDEDED] font-medium">Supabase EU (Frankfurt)</p>
                  <p className="text-xs text-[#8B8B8B]">Kryptert lagring. Kun legen har tilgang.</p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-px h-4 bg-[rgba(94,106,210,0.3)]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(16,185,129,0.1)] flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="flex-1 bg-[#0F1629] rounded-lg p-3">
                  <p className="text-sm text-[#EDEDED] font-medium">Kun legen (BankID)</p>
                  <p className="text-xs text-[#10B981]">Dekryptert og vist kun for autorisert lege.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Sub-processors */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Globe className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              8. Underleverandører
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Vocura bruker følgende underleverandører for å levere tjenesten:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left py-3 pr-4 text-[#EDEDED] font-semibold">Tjeneste</th>
                    <th className="text-left py-3 pr-4 text-[#EDEDED] font-semibold">Formål</th>
                    <th className="text-left py-3 pr-4 text-[#EDEDED] font-semibold">Databehandling</th>
                    <th className="text-left py-3 text-[#EDEDED] font-semibold">Region</th>
                  </tr>
                </thead>
                <tbody className="text-[#8B8B8B]">
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">OpenAI</td>
                    <td className="py-3 pr-4">Transkripsjon, AI-strukturering</td>
                    <td className="py-3 pr-4">API-kall, ingen lagring</td>
                    <td className="py-3">USA (EU SCCs)</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Supabase</td>
                    <td className="py-3 pr-4">Database, autentisering</td>
                    <td className="py-3 pr-4">Kryptert lagring</td>
                    <td className="py-3">EU (Frankfurt)</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Criipto</td>
                    <td className="py-3 pr-4">BankID/Buypass</td>
                    <td className="py-3 pr-4">Identitetsverifisering</td>
                    <td className="py-3">EU</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Upstash</td>
                    <td className="py-3 pr-4">Hastighetsbegrensning</td>
                    <td className="py-3 pr-4">Kun tellere, ingen helsedata</td>
                    <td className="py-3">EU</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Sentry</td>
                    <td className="py-3 pr-4">Feilovervåking</td>
                    <td className="py-3 pr-4">Anonymisert, ingen PII</td>
                    <td className="py-3">EU</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 9. Trust Badges */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <BadgeCheck className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              9. Sertifiseringer og tillit
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/personvern" className="flex flex-col items-center gap-1 p-4 rounded-lg bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.1)] hover:border-[rgba(94,106,210,0.3)] transition-colors">
                <Shield className="w-6 h-6 text-[#5E6AD2]" />
                <span className="text-sm font-semibold text-[#EDEDED]">GDPR</span>
                <span className="text-xs text-[#5C5C5C]">Kompatibel</span>
              </Link>
              <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.1)]">
                <Shield className="w-6 h-6 text-[#5E6AD2]" />
                <span className="text-sm font-semibold text-[#EDEDED]">Normen</span>
                <span className="text-xs text-[#5C5C5C]">Etterlevelse</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.1)]">
                <Shield className="w-6 h-6 text-[#5E6AD2]" />
                <span className="text-sm font-semibold text-[#EDEDED]">BankID</span>
                <span className="text-xs text-[#5C5C5C]">Verifisert</span>
              </div>
              <Link href="#kryptering" className="flex flex-col items-center gap-1 p-4 rounded-lg bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.1)] hover:border-[rgba(94,106,210,0.3)] transition-colors">
                <Shield className="w-6 h-6 text-[#5E6AD2]" />
                <span className="text-sm font-semibold text-[#EDEDED]">E2E</span>
                <span className="text-xs text-[#5C5C5C]">Kryptert</span>
              </Link>
            </div>
          </section>

          {/* 10. Resources */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Download className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              10. Dokumentasjon og ressurser
            </h2>
            <div className="space-y-3">
              <Link href="/databehandleravtale" className="flex items-center justify-between p-3 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)] transition-colors group">
                <span className="text-sm text-[#EDEDED] group-hover:text-[#5E6AD2] transition-colors">Databehandleravtale (DPA)</span>
                <ArrowRight className="w-4 h-4 text-[#5C5C5C]" />
              </Link>
              <Link href="/pasientinformasjon" className="flex items-center justify-between p-3 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)] transition-colors group">
                <span className="text-sm text-[#EDEDED] group-hover:text-[#5E6AD2] transition-colors">Pasientinformasjon</span>
                <ArrowRight className="w-4 h-4 text-[#5C5C5C]" />
              </Link>
              <Link href="/dpia" className="flex items-center justify-between p-3 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)] transition-colors group">
                <span className="text-sm text-[#EDEDED] group-hover:text-[#5E6AD2] transition-colors">Personvernkonsekvensvurdering (DPIA)</span>
                <ArrowRight className="w-4 h-4 text-[#5C5C5C]" />
              </Link>
              <Link href="/hendelseshaandtering" className="flex items-center justify-between p-3 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)] transition-colors group">
                <span className="text-sm text-[#EDEDED] group-hover:text-[#5E6AD2] transition-colors">Hendelseshåndtering</span>
                <ArrowRight className="w-4 h-4 text-[#5C5C5C]" />
              </Link>
              <Link href="/ai-styring" className="flex items-center justify-between p-3 rounded-lg bg-[#0F1629] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(94,106,210,0.3)] transition-colors group">
                <span className="text-sm text-[#EDEDED] group-hover:text-[#5E6AD2] transition-colors">AI-styring</span>
                <ArrowRight className="w-4 h-4 text-[#5C5C5C]" />
              </Link>
              <Link href="/sikkerhetsdokumentasjon" className="flex items-center justify-between p-3 rounded-lg bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.15)] hover:border-[rgba(94,106,210,0.3)] transition-colors group">
                <span className="text-sm text-[#5E6AD2] font-medium">Se all sikkerhetsdokumentasjon</span>
                <ArrowRight className="w-4 h-4 text-[#5E6AD2]" />
              </Link>
            </div>
          </section>

          {/* Footer links */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <Link href="/personvern" className="text-sm text-[#5E6AD2] hover:underline">
              Personvernerklæring
            </Link>
            <Link href="/vilkar" className="text-sm text-[#5E6AD2] hover:underline">
              Vilkår for bruk
            </Link>
            <Link href="/databehandleravtale" className="text-sm text-[#5E6AD2] hover:underline">
              Databehandleravtale
            </Link>
            <Link href="/sikkerhetsdokumentasjon" className="text-sm text-[#5E6AD2] hover:underline">
              All dokumentasjon
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
