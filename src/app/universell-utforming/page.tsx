import Link from "next/link";
import { Mic, ArrowLeft, Eye, CheckCircle, AlertTriangle, Calendar, Mail } from "lucide-react";

export const metadata = {
  title: "Universell utforming — Vocura",
  description: "Tilgjengelighetserklæring for Vocura AI-plattformen.",
};

export default function AccessibilityPage() {
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
            <Eye className="w-4 h-4" />
            <span>Tilgjengelighet</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Universell utforming
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Eye className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Vår forpliktelse
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Vocura jobber for at alle brukere skal kunne benytte tjenesten, uavhengig av funksjonsevne. Vi etterstreber WCAG 2.1 nivå AA som vår standard for tilgjengelighet. Denne erklæringen er en selvevaluering og oppdateres fortløpende.
            </p>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <CheckCircle className="w-6 h-6 shrink-0 text-[#10B981]" />
              2. Hva fungerer
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Tastaturnavigasjon — alle hovedfunksjoner er tilgjengelige via tastatur</li>
              <li>Mørk modus — reduserer øyebelastning og støtter brukere med lysfølsomhet</li>
              <li>Semantisk HTML — riktig bruk av overskrifter, lister og landemerker</li>
              <li>Skjermleserkompatible skjemaer — labels og ARIA-attributter på hovedelementer</li>
              <li>Responsivt design — fungerer på alle skjermstørrelser</li>
              <li>Tydelig visuelt hierarki — konsistent bruk av farger, størrelse og vekt</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <AlertTriangle className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              3. Kjente begrensninger
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Vi er åpne om områder der vi kan forbedre oss:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Noen fargekontraster i UI-elementer kan forbedres for å oppfylle WCAG AAA</li>
              <li>Enkelte komplekse skjemaer (f.eks. sykemelding) mangler fullstendig ARIA-merking</li>
              <li>Waveform-visualisering i opptaksmodulen er kun visuell og mangler tekstalternativ</li>
              <li>Noen tredjepartskomponenter har begrenset tilgjengelighet</li>
              <li>Hurtigtaster er ikke dokumentert for skjermleserbrukere</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Calendar className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Vår plan
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Gjennomføre ekstern WCAG 2.1 AA-revisjon</li>
              <li>Prioritere funn etter alvorlighetsgrad og brukereffekt</li>
              <li>Kjøre automatiserte tester med axe og Lighthouse som del av CI/CD</li>
              <li>Publisere oppdatert tilgjengelighetserklæring etter revisjon</li>
              <li>Etablere rutiner for tilgjengelighetstesting ved nye funksjoner</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Mail className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              5. Rapporter problemer
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Opplever du problemer med tilgjengeligheten? Vi setter pris på tilbakemeldinger.
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 space-y-2">
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Tilgjengelighet:</strong>{" "}
                <a href="mailto:tilgjengelighet@vocura.no" className="text-[#7B89DB]">tilgjengelighet@vocura.no</a>
              </p>
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Personvern:</strong>{" "}
                <a href="mailto:personvern@vocura.no" className="text-[#7B89DB]">personvern@vocura.no</a>
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
