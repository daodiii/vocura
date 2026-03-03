import Link from "next/link";
import { Mic, ArrowLeft, Shield, Lock, Trash2, Brain, Eye, Mail, Users } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

export const metadata = {
  title: "Informasjon til pasienter — Vocura",
  description: "Informasjon om hvordan Vocura behandler helseopplysninger på vegne av din lege.",
};

export default function PatientInfoPage() {
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
            <Users className="w-4 h-4" />
            <span>Pasientinformasjon</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Informasjon til deg som pasient
          </h1>
          <p className="text-lg text-[#8B8B8B] mb-6">
            Her kan du lese om hvordan legen din bruker Vocura, og hva det betyr for deg.
          </p>
          <PrintButton />
        </div>

        <div className="max-w-none space-y-10">
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Mic className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Hva er Vocura?
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] text-lg">
              Vocura er et verktøy som hjelper legen din med å skrive journal. Når legen snakker med deg, kan Vocura lytte og lage et utkast til journalnotat. Legen leser alltid gjennom og godkjenner teksten før den lagres.
            </p>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Trash2 className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Hva skjer med opptaket?
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] text-lg">
              Lydopptaket brukes kun til å lage tekst. Lyden slettes umiddelbart etter at teksten er laget. Opptaket lagres aldri — verken hos oss eller hos noen andre.
            </p>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Lock className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              3. Hvem kan se journalen?
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] text-lg">
              Bare legen din. Journalen er kryptert slik at ingen andre kan lese den — heller ikke Vocura. Legen logger inn med BankID for å sikre at riktig person har tilgang.
            </p>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Brain className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Kan AI-selskapet se mine data?
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] text-lg">
              Nei. OpenAI, som leverer AI-tjenesten, har ingen tilgang til dine helseopplysninger. Data sendes kryptert og brukes kun for å lage tekst i sanntid. Ingen data lagres eller brukes til trening av AI.
            </p>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Eye className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              5. Dine rettigheter
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] text-lg mb-4">
              Du har rett til å:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2 text-lg">
              <li>Be om innsyn i hvilke opplysninger som er lagret om deg</li>
              <li>Be om at opplysninger rettes eller slettes</li>
              <li>Klage til Datatilsynet hvis du mener at personvernet ditt ikke er ivaretatt</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Mail className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              6. Kontakt
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] text-lg">
              Har du spørsmål om personvern eller Vocura? Ta kontakt med oss:
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg mt-4 p-4">
              <p className="text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">E-post:</strong>{" "}
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
