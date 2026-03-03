import Link from "next/link";
import { Mic, ArrowLeft, Brain, Stethoscope, AlertTriangle, Database, Sparkles, Mail } from "lucide-react";

export const metadata = {
  title: "AI-styring — Vocura",
  description: "Hvordan Vocura bruker kunstig intelligens ansvarlig i medisinsk dokumentasjon.",
};

export default function AIGovernancePage() {
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
            <Brain className="w-4 h-4" />
            <span>AI-styring</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Ansvarlig bruk av AI
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Brain className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Bruk av AI
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Vocura bruker tre AI-funksjoner for å støtte helsepersonell:
            </p>
            <div className="space-y-3">
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Transkripsjon</h3>
                <p className="text-sm text-[#8B8B8B]">OpenAI Whisper konverterer tale til tekst med medisinsk presisjon. Lydopptaket slettes umiddelbart etter transkripsjon.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Journalstrukturering</h3>
                <p className="text-sm text-[#8B8B8B]">GPT-4o strukturerer transkripsjonen i SOAP-format (Subjektiv, Objektiv, Analyse, Plan) tilpasset norsk klinisk praksis.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Diagnosekodeforslag</h3>
                <p className="text-sm text-[#8B8B8B]">GPT-4o foreslår relevante ICPC-2- og ICD-10-koder med konfidensnivå. Legen velger og bekrefter endelige koder.</p>
              </div>
            </div>
          </section>

          <section className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Stethoscope className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              2. Klinisk ansvar
            </h2>
            <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg p-4 mb-4">
              <p className="text-[#F59E0B] font-semibold text-lg">
                AI er et støtteverktøy — ikke en erstatning for medisinsk skjønn.
              </p>
            </div>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Legen gjennomgår, redigerer og godkjenner alt AI-generert innhold</li>
              <li>Legen beholder fullt klinisk og juridisk ansvar for journalinnholdet</li>
              <li>AI-forslag skal alltid verifiseres mot klinisk vurdering</li>
              <li>Vocura erstatter ikke medisinsk utdanning eller erfaring</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <AlertTriangle className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              3. Begrensninger
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vi er åpne om begrensningene i AI-teknologien:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Transkripsjon kan inneholde feil, spesielt ved dialekter eller bakgrunnsstøy</li>
              <li>Diagnosekoder er forslag, ikke diagnoser — legen tar den endelige beslutningen</li>
              <li>Journalstrukturering kan tolke kontekst feil i komplekse konsultasjoner</li>
              <li>AI-modeller har iboende begrensninger og kan produsere unøyaktige resultater</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Database className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Databehandling
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Ingen pasientdata brukes til modelltrening</li>
              <li>API-kall til OpenAI er transiente — data lagres ikke hos OpenAI</li>
              <li>All kommunikasjon skjer via krypterte API-kall (TLS 1.3)</li>
              <li>Vocura har databehandleravtale med OpenAI som sikrer dette</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Sparkles className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              5. Kvalitetssikring
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Skreddersydde systemprompts for norsk medisinsk terminologi</li>
              <li>Temperaturkontroll for konsistente og forutsigbare resultater</li>
              <li>Konfidensnivåer vises for diagnosekodeforslag</li>
              <li>Kontinuerlig evaluering av AI-kvalitet mot kliniske forventninger</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Mail className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              6. Kontakt
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Har du spørsmål om vår bruk av AI?
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">AI-relatert:</strong>{" "}
                <a href="mailto:ai@vocura.no" className="text-[#7B89DB]">ai@vocura.no</a>
              </p>
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Personvern:</strong>{" "}
                <a href="mailto:personvern@vocura.no" className="text-[#7B89DB]">personvern@vocura.no</a>
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <Link href="/sikkerhet" className="text-sm text-[#5E6AD2] hover:underline">Sikkerhet</Link>
            <Link href="/vilkar" className="text-sm text-[#5E6AD2] hover:underline">Vilkår</Link>
            <Link href="/sikkerhetsdokumentasjon" className="text-sm text-[#5E6AD2] hover:underline">All dokumentasjon</Link>
            <Link href="/" className="text-sm text-[#5E6AD2] hover:underline">Tilbake til forsiden</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
