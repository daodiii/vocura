import Link from "next/link";
import { Mic, ArrowLeft, Shield, FileText, AlertTriangle, Scale } from "lucide-react";

export const metadata = {
  title: "Bruksvilkår | Vocura AI",
  description: "Les bruksvilkårene for Vocura AI-plattformen.",
};

export default function TermsPage() {
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
          <Link href="/" className="text-[#8B8B8B] hover:text-[#EDEDED] hover:bg-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 transition-colors text-sm inline-flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(94,106,210,0.1)] text-[#5E6AD2] text-sm font-medium gap-2 mb-6">
            <Scale className="w-4 h-4" />
            <span>Juridisk</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Bruksvilkår
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          {/* 1. About the service */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <FileText className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Om tjenesten
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Vocura AI er et verktøy for tale-til-tekst og medisinsk dokumentasjon utviklet for norske helsepersonell. Tjenesten bruker kunstig intelligens for å transkribere konsultasjoner og generere strukturerte journalnotater. Ved å bruke tjenesten aksepterer du disse vilkårene.
            </p>
          </section>

          {/* 2. Use of the service */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Shield className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Bruk av tjenesten
            </h2>
            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              Du forplikter deg til å:
            </p>
            <ul className="space-y-2 text-[#8B8B8B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Bruke tjenesten i samsvar med gjeldende helselovgivning, herunder helsepersonelloven og pasient- og brukerrettighetsloven</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Innhente gyldig samtykke fra pasienter før opptak av konsultasjoner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Kontrollere og verifisere alt AI-generert innhold før klinisk bruk</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Behandle personopplysninger i henhold til GDPR og norsk personvernlovgivning</span>
              </li>
            </ul>
          </section>

          {/* 3. AI disclaimer */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <AlertTriangle className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              3. AI-generert innhold — ansvarsfraskrivelse
            </h2>
            <div className="p-4 rounded-lg mb-4 bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]">
              <p className="text-sm font-medium text-[#F59E0B]">
                Vocura AI er et hjelpeverktøy. Alt AI-generert innhold (transkripsjoner, journalnotater, diagnosekoder) skal alltid gjennomgås og godkjennes av kvalifisert helsepersonell før klinisk bruk.
              </p>
            </div>
            <ul className="space-y-2 text-[#8B8B8B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>AI-transkripsjoner kan inneholde feil, spesielt med bakgrunnsstøy eller dialekter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Foreslåtte diagnosekoder (ICPC-2/ICD-10) er veiledende og skal bekreftes av behandler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Behandleren beholder fullt klinisk og juridisk ansvar for all dokumentasjon</span>
              </li>
            </ul>
          </section>

          {/* 4. Data processing */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              4. Databehandling
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Behandling av personopplysninger er beskrevet i vår{" "}
              <Link href="/personvern" className="text-[#7B89DB] cursor-pointer">personvernerklæring</Link>.
              Lydopptak behandles av OpenAI Whisper API og slettes umiddelbart etter transkripsjon.
              Pasientdata, journalnotater, transkripsjoner og skjemainnsendinger lagres i vår sikre database i henhold til helsepersonelloven og pasientjournalforskriften.
              Klinisk tekst kan også sendes til OpenAI for AI-assistert strukturering, oppsummering og diagnosekodeforslag.
            </p>
          </section>

          {/* 5. Intellectual property */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              5. Immaterielle rettigheter
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Vocura AI-plattformen, inkludert design, kode og maler, er beskyttet av opphavsrett. Du beholder eierskapet til alt innhold du oppretter ved hjelp av tjenesten, inkludert transkripsjoner og journalnotater.
            </p>
          </section>

          {/* 6. Availability */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              6. Tilgjengelighet og ansvarsbegrensning
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Vocura tilstreber høy oppetid, men garanterer ikke uavbrutt tilgjengelighet. Tjenesten leveres &ldquo;som den er&rdquo;. Vocura er ikke ansvarlig for tap som følge av nedetid, feil i transkripsjoner, eller manglende AI-ytelse. Brukeren har alltid ansvar for å verifisere innholdet.
            </p>
          </section>

          {/* 7. Termination */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              7. Oppsigelse
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Du kan slutte å bruke tjenesten når som helst. For å slette din konto og tilhørende data, kontakt oss via personvern@vocura.no. Merk at journalopplysninger kan være underlagt lovpålagte oppbevaringskrav og kan ikke alltid slettes umiddelbart. Vocura kan avslutte eller begrense tilgangen til tjenesten ved brudd på disse vilkårene.
            </p>
          </section>

          {/* 8. Changes */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              8. Endringer i vilkårene
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Vi kan oppdatere disse vilkårene fra tid til annen. Vesentlige endringer varsles via plattformen. Fortsatt bruk etter endringer innebærer aksept av de oppdaterte vilkårene.
            </p>
          </section>

          {/* 9. Governing law */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              9. Gjeldende lov
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal søkes løst gjennom forhandlinger, og dersom dette ikke fører frem, avgjøres av norske domstoler med Oslo tingrett som verneting.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap gap-4">
          <Link href="/" className="text-sm inline-flex items-center gap-1 cursor-pointer text-[#7B89DB]">
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>
          <Link href="/ai-styring" className="text-sm text-[#5E6AD2] hover:underline">AI-styring</Link>
          <Link href="/sikkerhet" className="text-sm text-[#5E6AD2] hover:underline">Sikkerhet</Link>
          <Link href="/sikkerhetsdokumentasjon" className="text-sm text-[#5E6AD2] hover:underline">All dokumentasjon</Link>
        </div>
      </main>
    </div>
  );
}
