import Link from "next/link";
import { Mic, ArrowLeft, Clock, Wrench, Headphones, Bell, CreditCard } from "lucide-react";

export const metadata = {
  title: "Tjenestenivåavtale (SLA) — Vocura",
  description: "Vocuras tjenestenivåavtale med oppetidsmål, vedlikeholdsrutiner og støttetider.",
};

export default function SLAPage() {
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
            <Clock className="w-4 h-4" />
            <span>SLA</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Tjenestenivåavtale
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Clock className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Tilgjengelighet
            </h2>
            <div className="bg-[#0F1629] border border-[rgba(94,106,210,0.2)] rounded-lg p-4 mb-4 text-center">
              <p className="text-3xl font-bold text-[#5E6AD2]">99,5 %</p>
              <p className="text-sm text-[#8B8B8B] mt-1">Oppetidsmål per måned</p>
            </div>
            <p className="text-sm text-[#8B8B8B]">
              Oppetid måles månedlig og ekskluderer planlagt vedlikehold. Beregning: (Total tid - Nedetid) / Total tid × 100.
            </p>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Wrench className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Planlagt vedlikehold
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Varsles minimum 48 timer i forkant via e-post</li>
              <li>Utføres utenfor arbeidstid: 18:00–06:00 CET</li>
              <li>Maksimalt 4 timer per vedlikeholdsvindu</li>
              <li>Helgevedlikehold ved større oppgraderinger, med ekstra forvarsel</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Headphones className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              3. Støtte og responstider
            </h2>
            <div className="space-y-3">
              <div className="bg-[#0F1629] border border-[rgba(239,68,68,0.3)] rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#EDEDED] text-sm">Kritisk / datahendelse</span>
                  <p className="text-xs text-[#8B8B8B]">Databaseksponering, uautorisert tilgang</p>
                </div>
                <span className="text-[#EF4444] font-bold text-sm">4 timer</span>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(245,158,11,0.3)] rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#EDEDED] text-sm">Tjenesteutfall</span>
                  <p className="text-xs text-[#8B8B8B]">Tjenesten er utilgjengelig</p>
                </div>
                <span className="text-[#F59E0B] font-bold text-sm">8 timer</span>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(59,130,246,0.3)] rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#EDEDED] text-sm">Ikke-kritisk</span>
                  <p className="text-xs text-[#8B8B8B]">Funksjonsfeil, ytelsesproblemerv</p>
                </div>
                <span className="text-[#3B82F6] font-bold text-sm">24 timer</span>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#EDEDED] text-sm">Generell henvendelse</span>
                  <p className="text-xs text-[#8B8B8B]">Spørsmål, tilbakemeldinger</p>
                </div>
                <span className="text-[#8B8B8B] font-bold text-sm">48 timer</span>
              </div>
            </div>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Bell className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Kommunikasjon
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Statusside for sanntidsoversikt planlegges</li>
              <li>E-postvarsling sendes til alle kunder ved driftsavbrudd</li>
              <li>Oppdateringer hver 2. time ved pågående hendelser</li>
              <li>Sluttrapport sendes etter løsning av hendelser</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <CreditCard className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              5. Kompensasjon
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Ved brudd på oppetidsmålet kan kunder kontakte oss for vurdering av servicekreditt. Kompensasjon beregnes basert på faktisk nedetid utover avtalt nivå og gjeldende abonnementsavtale.
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg mt-4 p-4">
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Kontakt:</strong>{" "}
                <a href="mailto:support@vocura.no" className="text-[#7B89DB]">support@vocura.no</a>
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
            <Link href="/sikkerhet" className="text-sm text-[#5E6AD2] hover:underline">Sikkerhet</Link>
            <Link href="/sikkerhetsdokumentasjon" className="text-sm text-[#5E6AD2] hover:underline">All dokumentasjon</Link>
            <Link href="/" className="text-sm text-[#5E6AD2] hover:underline">Tilbake til forsiden</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
