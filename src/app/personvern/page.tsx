import Link from "next/link";
import { Mic, ArrowLeft, Shield, Server, Globe, Eye, Trash2, Download, UserCheck } from "lucide-react";

export const metadata = {
  title: "Personvernerklæring | MediScribe AI",
  description: "Les om hvordan MediScribe AI behandler personopplysninger i henhold til GDPR og norsk personvernlovgivning.",
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-4 h-4" />
            <span>Personvern</span>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Personvernerklæring
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10 animate-slide-up stagger-1">
          {/* 1. Introduction */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Eye className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              1. Behandlingsansvarlig
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              MediScribe Technologies AS er behandlingsansvarlig for personopplysninger som behandles gjennom MediScribe AI-plattformen. Vi er forpliktet til å beskytte ditt personvern i samsvar med den norske personopplysningsloven og EUs personvernforordning (GDPR).
            </p>
            <div className="info-card mt-4 p-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Kontakt:</strong> For spørsmål om personvern, ta kontakt via <a href="mailto:personvern@mediscribe.no" className="cursor-pointer" style={{ color: 'var(--primary-light)' }}>personvern@mediscribe.no</a>
              </p>
            </div>
          </section>

          {/* 2. Data we collect */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <UserCheck className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              2. Hvilke opplysninger vi behandler
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              MediScribe behandler følgende kategorier av personopplysninger:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Lydopptak</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Lydopptak fra konsultasjoner sendes til en ekstern tjeneste (OpenAI Whisper API) for transkripsjon. Lydfilen lagres midlertidig på serveren under prosessering og slettes umiddelbart etter at transkripsjonen er fullført.</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Pasientopplysninger i skjemaer</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Data du legger inn i skjemaer (som pasient-ID, navn, fødselsnummer, diagnoser og helseopplysninger) behandles kun i nettleseren din og sendes ikke til våre servere. Disse opplysningene forsvinner når du lukker fanen.</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Samtykkelogg</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Når du gir samtykke til opptak, lagres et tidsstempel og samtykketype lokalt i nettleseren din (localStorage) som en revisjonslogg. Denne loggen sendes ikke til våre servere.</p>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tekniske data</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Vi lagrer dine preferanser (som mørk modus) lokalt i nettleseren. Vi bruker ingen analyseverktøy, sporingspiksler eller tredjeparts cookies.</p>
              </div>
            </div>
          </section>

          {/* 3. Legal basis */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Shield className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              3. Rettslig grunnlag
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Behandlingen av personopplysninger skjer på følgende rettslige grunnlag (GDPR artikkel 6 og 9):
            </p>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Samtykke</strong> (Art. 6(1)(a) og Art. 9(2)(a)) — Du gir eksplisitt samtykke før opptak av konsultasjoner og bruk av AI-assistert dokumentasjon.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Helsepersonells dokumentasjonsplikt</strong> (Art. 9(2)(h)) — Behandling som er nødvendig for forebyggende medisin, medisinsk diagnostikk, eller behandling innen helsevesenet.</span>
              </li>
            </ul>
          </section>

          {/* 4. Third-party processing */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Globe className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              4. Tredjepartsbehandling og dataoverføring
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Lydopptak sendes til OpenAI (USA) for transkripsjon via deres Whisper API. Denne overføringen er regulert av:
            </p>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>En databehandleravtale (DPA) med OpenAI i henhold til GDPR artikkel 28</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>EU-standardkontraktsklausuler (SCCs) for overføring til tredjeland</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>OpenAIs forpliktelse om at API-data ikke brukes til å trene deres modeller</span>
              </li>
            </ul>
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--warning-subtle)', border: '1px solid rgba(245, 158, 11, 0.20)' }}>
              <p className="text-sm" style={{ color: 'var(--warning)' }}>
                <strong>Viktig:</strong> Ingen annen pasientdata enn lydopptaket sendes til tredjeparter. Skjemadata, journalnotater og transkripsjoner forblir i nettleseren din.
              </p>
            </div>
          </section>

          {/* 5. Data retention */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Server className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              5. Lagring og oppbevaring
            </h2>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Lydopptak:</strong> Lagres midlertidig på serveren under prosessering (typisk noen sekunder) og slettes automatisk umiddelbart etter transkripsjon.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Transkripsjoner og skjemadata:</strong> Lagres kun i nettleseren din (minne/DOM). Data forsvinner når du lukker fanen.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Samtykkelogg:</strong> Lagres i nettleserens localStorage til du aktivt sletter den.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>Preferanser:</strong> Mørk modus-innstilling lagres i localStorage til du sletter den.</span>
              </li>
            </ul>
          </section>

          {/* 6. Your rights */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <UserCheck className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
              6. Dine rettigheter
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              I henhold til GDPR har du følgende rettigheter:
            </p>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <Eye className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Rett til innsyn</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Du kan til enhver tid se hvilke data som er lagret i nettleseren din.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <Trash2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Rett til sletting</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Du kan slette alle lokalt lagrede data via innstillingene på dashbordet, eller ved å tømme nettleserdata.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <Download className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Rett til dataportabilitet</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Du kan eksportere skjemaer og dokumenter som PDF direkte fra plattformen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <Shield className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Rett til å trekke tilbake samtykke</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Du kan når som helst trekke tilbake ditt samtykke via avkryssningsboksen på opptakssiden. Tilbaketrekking påvirker ikke lovligheten av behandling som allerede er utført.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Cookies */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              7. Informasjonskapsler (cookies)
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              MediScribe bruker <strong style={{ color: 'var(--text-primary)' }}>ingen cookies</strong>. Vi bruker kun nettleserens localStorage for å lagre dine preferanser (mørk modus) og samtykkelogg. Disse dataene deles ikke med tredjeparter og sendes ikke over nettverket.
            </p>
          </section>

          {/* 8. Security */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              8. Sikkerhetstiltak
            </h2>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>All kommunikasjon mellom nettleseren og serveren skjer over HTTPS (kryptert forbindelse)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Midlertidige lydfiler på serveren slettes umiddelbart etter prosessering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>Ingen pasientdata lagres permanent på våre servere</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5" style={{ color: 'var(--primary)' }}>&#8226;</span>
                <span>API-nøkler og sensitive konfigurasjoner lagres sikkert som miljøvariabler</span>
              </li>
            </ul>
          </section>

          {/* 9. Contact & complaints */}
          <section className="glass-card-static p-6">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              9. Klagerett
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Dersom du mener at behandlingen av dine personopplysninger ikke er i samsvar med personvernregelverket, har du rett til å klage til Datatilsynet:
            </p>
            <div className="info-card p-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Datatilsynet</strong><br />
                Postboks 458 Sentrum, 0105 Oslo<br />
                Telefon: 22 39 69 00<br />
                E-post: <a href="mailto:postkasse@datatilsynet.no" className="cursor-pointer" style={{ color: 'var(--primary-light)' }}>postkasse@datatilsynet.no</a><br />
                Nettside: <a href="https://www.datatilsynet.no" className="cursor-pointer" style={{ color: 'var(--primary-light)' }} target="_blank" rel="noopener noreferrer">www.datatilsynet.no</a>
              </p>
            </div>
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
