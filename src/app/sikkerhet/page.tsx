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
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
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
              databehandleravtale med OpenAI som sikrer dette.
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

          {/* 7. Trust Badges */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <BadgeCheck className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              7. Sertifiseringer og tillit
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'GDPR', desc: 'Kompatibel' },
                { label: 'Normen', desc: 'Etterlevelse' },
                { label: 'BankID', desc: 'Verifisert' },
                { label: 'E2E', desc: 'Kryptert' },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-1 p-4 rounded-lg bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.1)]"
                >
                  <Shield className="w-6 h-6 text-[#5E6AD2]" />
                  <span className="text-sm font-semibold text-[#EDEDED]">
                    {badge.label}
                  </span>
                  <span className="text-xs text-[#5C5C5C]">{badge.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Footer links */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <Link
              href="/personvern"
              className="text-sm text-[#5E6AD2] hover:underline"
            >
              Personvernerklæring
            </Link>
            <Link
              href="/vilkar"
              className="text-sm text-[#5E6AD2] hover:underline"
            >
              Vilkår for bruk
            </Link>
            <Link
              href="/databehandleravtale"
              className="text-sm text-[#5E6AD2] hover:underline"
            >
              Databehandleravtale
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
