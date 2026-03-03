import Link from "next/link";
import { Mic, ArrowLeft, FileSearch, Scale, ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Personvernkonsekvensvurdering (DPIA) — Vocura",
  description: "Sammendrag av Vocuras personvernkonsekvensvurdering (DPIA) for behandling av helseopplysninger.",
};

export default function DPIAPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="bg-[#111111]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5E6AD2]">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#EDEDED]">Vocura</span>
          </div>
          <Link href="/" className="text-[#8B8B8B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors text-sm inline-flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(94,106,210,0.1)] text-[#5E6AD2] text-sm font-medium gap-2 mb-6">
            <FileSearch className="w-4 h-4" />
            <span>DPIA</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Personvernkonsekvensvurdering
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <FileSearch className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Beskrivelse av behandlingen
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Vocura behandler helseopplysninger — inkludert lydopptak, transkripsjoner og journalnotater — på vegne av helsepersonell for å effektivisere medisinsk dokumentasjon.
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Rettslig grunnlag:</strong> GDPR art. 6(1)(b) — oppfyllelse av avtale mellom Vocura og helsepersonell
              </p>
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Særlige kategorier:</strong> GDPR art. 9(2)(h) — behandling for helseformål med taushetsplikt
              </p>
            </div>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Scale className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Nødvendighet og proporsjonalitet
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              AI-behandling er nødvendig for å redusere dokumentasjonsbyrden for helsepersonell, som bruker opptil 40 % av arbeidstiden på dokumentasjon. Vocura praktiserer streng dataminimering:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Kun nødvendige data samles inn for formålet</li>
              <li>Lydopptak slettes umiddelbart etter transkripsjon</li>
              <li>Journalnotater slettes automatisk etter overføring til EPJ (48 timer)</li>
              <li>Ingen data brukes til AI-trening eller sekundære formål</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <AlertTriangle className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              3. Risikovurdering
            </h2>
            <div className="space-y-4">
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-2">Uautorisert tilgang</h3>
                <p className="text-sm text-[#8B8B8B] mb-2"><strong className="text-[#F59E0B]">Risiko:</strong> Uvedkommende får tilgang til helsedata</p>
                <p className="text-sm text-[#8B8B8B]"><strong className="text-[#10B981]">Tiltak:</strong> BankID-autentisering (sikkerhetsnivå 4), ende-til-ende-kryptering (AES-256-GCM), automatisk sesjonsutløp etter 15 minutter</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-2">Databrudd</h3>
                <p className="text-sm text-[#8B8B8B] mb-2"><strong className="text-[#F59E0B]">Risiko:</strong> Helsedata eksponeres ved sikkerhetsbrudd</p>
                <p className="text-sm text-[#8B8B8B]"><strong className="text-[#10B981]">Tiltak:</strong> Automatisk sletting etter EPJ-overføring, revisjonslogging, kryptering i hvile, hendelsesplan med 24/72-timers varsling</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-2">AI-feil</h3>
                <p className="text-sm text-[#8B8B8B] mb-2"><strong className="text-[#F59E0B]">Risiko:</strong> Feil i transkripsjon eller diagnosekoder påvirker klinisk beslutning</p>
                <p className="text-sm text-[#8B8B8B]"><strong className="text-[#10B981]">Tiltak:</strong> Legen gjennomgår og godkjenner alt AI-generert innhold. Konfidensnivåer vises for diagnosekoder. AI erstatter ikke klinisk skjønn.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-2">Underleverandørrisiko</h3>
                <p className="text-sm text-[#8B8B8B] mb-2"><strong className="text-[#F59E0B]">Risiko:</strong> Underleverandører misbruker eller eksponerer data</p>
                <p className="text-sm text-[#8B8B8B]"><strong className="text-[#10B981]">Tiltak:</strong> Databehandleravtaler med alle underleverandører. OpenAI lagrer ingen data fra API-kall. Alle leverandører er i EU eller har EU SCCs.</p>
              </div>
            </div>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <ShieldCheck className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Tiltak
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              For fullstendig oversikt over implementerte sikkerhetstiltak, se vår{" "}
              <Link href="/sikkerhet" className="text-[#7B89DB] hover:underline">sikkerhetsside</Link>.
            </p>
          </section>

          <section className="bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.15)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <CheckCircle className="w-6 h-6 shrink-0 text-[#10B981]" />
              5. Konklusjon
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Basert på identifiserte risikoer og implementerte tiltak vurderer vi restrisikoen som akseptabel. DPIA gjennomgås årlig eller ved vesentlige endringer i behandlingen. Neste planlagte gjennomgang er Q1 2027.
            </p>
          </section>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <Link href="/personvern" className="text-sm text-[#5E6AD2] hover:underline">Personvern</Link>
            <Link href="/sikkerhet" className="text-sm text-[#5E6AD2] hover:underline">Sikkerhet</Link>
            <Link href="/sikkerhetsdokumentasjon" className="text-sm text-[#5E6AD2] hover:underline">All dokumentasjon</Link>
            <Link href="/" className="text-sm text-[#5E6AD2] hover:underline">Tilbake til forsiden</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
