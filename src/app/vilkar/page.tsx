import Link from "next/link";
import { Mic, ArrowLeft, Shield, FileText, AlertTriangle, Scale } from "lucide-react";

export const metadata = {
  title: "Bruksvilkår | MediScribe AI",
  description: "Les bruksvilkårene for MediScribe AI-plattformen.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold gradient-text">MediScribe</span>
          </div>
          <Link href="/" className="glass-btn-ghost text-sm inline-flex items-center gap-1 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12 animate-fade-in">
          <div className="glass-badge glass-badge-primary gap-2 mb-6">
            <Scale className="w-4 h-4" />
            <span>Juridisk</span>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Bruksvilkår
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10 animate-slide-up stagger-1">
          {/* 1. About the service */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <FileText className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              1. Om tjenesten
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              MediScribe AI er et verktøy for tale-til-tekst og medisinsk dokumentasjon utviklet for norske helsepersonell. Tjenesten bruker kunstig intelligens for å transkribere konsultasjoner og generere strukturerte journalnotater. Ved å bruke tjenesten aksepterer du disse vilkårene.
            </p>
          </section>

          {/* 2. Use of the service */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Shield className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              2. Bruk av tjenesten
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Du forplikter deg til å:
            </p>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Bruke tjenesten i samsvar med gjeldende helselovgivning, herunder helsepersonelloven og pasient- og brukerrettighetsloven</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Innhente gyldig samtykke fra pasienter før opptak av konsultasjoner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Kontrollere og verifisere alt AI-generert innhold før klinisk bruk</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Behandle personopplysninger i henhold til GDPR og norsk personvernlovgivning</span>
              </li>
            </ul>
          </section>

          {/* 3. AI disclaimer */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: 'var(--warning)' }} />
              3. AI-generert innhold — ansvarsfraskrivelse
            </h2>
            <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--warning-subtle)', border: '1px solid rgba(245, 158, 11, 0.20)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
                MediScribe AI er et hjelpeverktøy. Alt AI-generert innhold (transkripsjoner, journalnotater, diagnosekoder) skal alltid gjennomgås og godkjennes av kvalifisert helsepersonell før klinisk bruk.
              </p>
            </div>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>AI-transkripsjoner kan inneholde feil, spesielt med bakgrunnsstøy eller dialekter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Foreslåtte diagnosekoder (ICPC-2/ICD-10) er veiledende og skal bekreftes av behandler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Behandleren beholder fullt klinisk og juridisk ansvar for all dokumentasjon</span>
              </li>
            </ul>
          </section>

          {/* 4. Data processing */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              4. Databehandling
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Behandling av personopplysninger er beskrevet i vår{" "}
              <Link href="/personvern" className="cursor-pointer" style={{ color: 'var(--primary-light)' }}>personvernerklæring</Link>.
              Lydopptak behandles av OpenAI Whisper API og slettes umiddelbart etter transkripsjon.
              Skjemadata og transkripsjoner lagres kun i nettleseren din og sendes ikke til våre servere.
            </p>
          </section>

          {/* 5. Intellectual property */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              5. Immaterielle rettigheter
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              MediScribe AI-plattformen, inkludert design, kode og maler, er beskyttet av opphavsrett. Du beholder eierskapet til alt innhold du oppretter ved hjelp av tjenesten, inkludert transkripsjoner og journalnotater.
            </p>
          </section>

          {/* 6. Availability */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              6. Tilgjengelighet og ansvarsbegrensning
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              MediScribe tilstreber høy oppetid, men garanterer ikke uavbrutt tilgjengelighet. Tjenesten leveres &ldquo;som den er&rdquo;. MediScribe er ikke ansvarlig for tap som følge av nedetid, feil i transkripsjoner, eller manglende AI-ytelse. Brukeren har alltid ansvar for å verifisere innholdet.
            </p>
          </section>

          {/* 7. Termination */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              7. Oppsigelse
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Du kan slutte å bruke tjenesten når som helst. Siden data lagres lokalt i nettleseren, slettes alle data automatisk når du tømmer nettleserdataene. MediScribe kan avslutte eller begrense tilgangen til tjenesten ved brudd på disse vilkårene.
            </p>
          </section>

          {/* 8. Changes */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              8. Endringer i vilkårene
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Vi kan oppdatere disse vilkårene fra tid til annen. Vesentlige endringer varsles via plattformen. Fortsatt bruk etter endringer innebærer aksept av de oppdaterte vilkårene.
            </p>
          </section>

          {/* 9. Governing law */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              9. Gjeldende lov
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal søkes løst gjennom forhandlinger, og dersom dette ikke fører frem, avgjøres av norske domstoler med Oslo tingrett som verneting.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <Link href="/" className="text-sm inline-flex items-center gap-1 cursor-pointer" style={{ color: 'var(--primary-light)' }}>
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>
        </div>
      </main>
    </div>
  );
}
