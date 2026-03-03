import Link from "next/link";
import { Mic, ArrowLeft, Shield, Server, Globe, Eye, Trash2, Download, UserCheck, Database, Cookie } from "lucide-react";

export const metadata = {
  title: "Personvernerklæring | Vocura AI",
  description: "Les om hvordan Vocura AI behandler personopplysninger i henhold til GDPR og norsk personvernlovgivning.",
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-4 h-4" />
            <span>Personvern</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Personvernerklæring
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          {/* 1. Introduction */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Eye className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Behandlingsansvarlig
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Vocura Technologies AS er behandlingsansvarlig for personopplysninger som behandles gjennom Vocura AI-plattformen. Vi er forpliktet til å beskytte ditt personvern i samsvar med den norske personopplysningsloven og EUs personvernforordning (GDPR).
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg mt-4 p-4">
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Kontakt:</strong> For spørsmål om personvern, ta kontakt via <a href="mailto:personvern@vocura.no" className="cursor-pointer text-[#7B89DB]">personvern@vocura.no</a>
              </p>
            </div>
          </section>

          {/* 2. Data we collect */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Database className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Hvilke opplysninger vi behandler
            </h2>
            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              Vocura behandler følgende kategorier av personopplysninger. Opplysninger lagres i vår sikre database med mindre annet er angitt:
            </p>
            <div className="space-y-4">
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Brukerkontodata</h4>
                <p className="text-sm text-[#8B8B8B]">E-postadresse, navn, rolle og HPR-nummer lagres i vår database for autentisering og tilgangskontroll.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Pasientopplysninger</h4>
                <p className="text-sm text-[#8B8B8B]">Pasientnavn, fødselsdato, fødselsnummer, telefonnummer, e-postadresse, adresse og kliniske notater lagres i vår database knyttet til din brukerkonto. Disse opplysningene er nødvendige for å oppfylle helsepersonells dokumentasjonsplikt (helsepersonelloven §39-40).</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Journalnotater og transkripsjoner</h4>
                <p className="text-sm text-[#8B8B8B]">Transkripsjoner fra lydopptak og journalnotater (inkludert diagnosekoder) lagres i vår database. Disse oppbevares i henhold til kravene i pasientjournalforskriften.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Skjemainnsendinger</h4>
                <p className="text-sm text-[#8B8B8B]">Data fra medisinske skjemaer (sykemelding, PHQ-9, samtykke, henvisning, m.fl.) lagres i vår database med tilhørende status og eventuelle poengsummer.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Lydopptak</h4>
                <p className="text-sm text-[#8B8B8B]">Lydopptak fra konsultasjoner sendes til en ekstern tjeneste (OpenAI) for transkripsjon. Lydfilen lagres midlertidig på serveren under prosessering (typisk noen sekunder) og slettes automatisk umiddelbart etter at transkripsjonen er fullført. Metadata om opptaket (varighet, filstørrelse) lagres i databasen.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Revisjonslogg</h4>
                <p className="text-sm text-[#8B8B8B]">For å sikre sporbarhet og etterlevelse logges handlinger som opprettelse, endring og sletting av journalnotater. Loggen inkluderer bruker-ID, handlingstype, tidspunkt og IP-adresse.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Lokale data i nettleseren</h4>
                <p className="text-sm text-[#8B8B8B]">Dine preferanser (som mørk modus og fargetema) lagres lokalt i nettleserens localStorage. Vi bruker ingen analyseverktøy eller sporingspiksler.</p>
              </div>
            </div>
          </section>

          {/* 3. Legal basis */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Shield className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              3. Rettslig grunnlag
            </h2>
            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              Behandlingen av personopplysninger skjer på følgende rettslige grunnlag (GDPR artikkel 6 og 9):
            </p>
            <ul className="space-y-2 text-[#8B8B8B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Samtykke</strong> (Art. 6(1)(a) og Art. 9(2)(a)) — Du gir eksplisitt samtykke før opptak av konsultasjoner og bruk av AI-assistert dokumentasjon.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Helsepersonells dokumentasjonsplikt</strong> (Art. 9(2)(h)) — Behandling som er nødvendig for forebyggende medisin, medisinsk diagnostikk, eller behandling innen helsevesenet. Lagring av pasientjournaler er lovpålagt i henhold til helsepersonelloven §39-40.</span>
              </li>
            </ul>
          </section>

          {/* 4. Third-party processing */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Globe className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Tredjepartsbehandling og dataoverføring
            </h2>
            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              Vi benytter følgende tredjepartstjenester for å levere Vocura:
            </p>

            <div className="space-y-4 mb-4">
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">OpenAI (USA)</h4>
                <p className="text-sm text-[#8B8B8B] mb-2">Følgende data sendes til OpenAI for AI-behandling:</p>
                <ul className="text-sm text-[#8B8B8B] space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#5E6AD2]">&#8226;</span>
                    <span>Lydopptak for transkripsjon (via Whisper API)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5E6AD2]">&#8226;</span>
                    <span>Klinisk tekst for strukturering av journalnotater</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5E6AD2]">&#8226;</span>
                    <span>Klinisk tekst for generering av pasientvennlige oppsummeringer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#5E6AD2]">&#8226;</span>
                    <span>Klinisk tekst for forslag til diagnosekoder (ICPC-2/ICD-10)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-[#EDEDED]">Supabase (EU)</h4>
                <p className="text-sm text-[#8B8B8B]">Vår database og autentiseringstjeneste leveres av Supabase. All pasientdata, journalnotater, skjemainnsendinger og brukerkontoer lagres i en PostgreSQL-database hos Supabase.</p>
              </div>
            </div>

            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              Disse overføringene er regulert av:
            </p>
            <ul className="space-y-2 text-[#8B8B8B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Databehandleravtaler (DPA) med OpenAI og Supabase i henhold til GDPR artikkel 28</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>EU-standardkontraktsklausuler (SCCs) for overføring til tredjeland (OpenAI, USA)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>OpenAIs forpliktelse om at API-data ikke brukes til å trene deres modeller</span>
              </li>
            </ul>
            <div className="mt-4 p-4 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]">
              <p className="text-sm text-[#F59E0B]">
                <strong>Viktig:</strong> Klinisk tekst som sendes til OpenAI for AI-behandling lagres ikke av OpenAI og brukes ikke til modelltrening. Data behandles kun for å generere svar og slettes deretter.
              </p>
            </div>
          </section>

          {/* 5. Data retention */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Server className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              5. Lagring og oppbevaring
            </h2>
            <ul className="space-y-2 text-[#8B8B8B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Pasientjournaler og transkripsjoner:</strong> Lagres i vår database i henhold til pasientjournalforskriften. Journaler skal oppbevares i minimum 10 år etter siste innføring, med mindre lengre oppbevaringstid er påkrevd.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Skjemainnsendinger:</strong> Lagres i databasen så lenge de er relevante for pasientbehandlingen, i henhold til gjeldende oppbevaringsregler.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Lydopptak:</strong> Lagres midlertidig på serveren under prosessering (typisk noen sekunder) og slettes automatisk umiddelbart etter transkripsjon. Selve lydfilen oppbevares ikke.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Revisjonslogg:</strong> Lagres i databasen for sporbarhet og etterlevelse av Normen og helselovgivning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Brukerkonto:</strong> Lagres så lenge du har en aktiv konto. Ved sletting av konto fjernes kontodata, men journalopplysninger kan oppbevares i henhold til lovpålagte krav.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Lokale preferanser:</strong> Lagres i nettleserens localStorage til du aktivt sletter dem.</span>
              </li>
            </ul>
          </section>

          {/* 6. Your rights */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <UserCheck className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              6. Dine rettigheter
            </h2>
            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              I henhold til GDPR har du følgende rettigheter:
            </p>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg">
                <Eye className="w-5 h-5 shrink-0 mt-0.5 text-[#5E6AD2]" />
                <div>
                  <p className="font-semibold text-sm text-[#EDEDED]">Rett til innsyn</p>
                  <p className="text-sm text-[#8B8B8B]">Du kan be om innsyn i hvilke personopplysninger vi har lagret om deg og dine pasienter. Kontakt oss via personvern@vocura.no.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg">
                <Trash2 className="w-5 h-5 shrink-0 mt-0.5 text-[#5E6AD2]" />
                <div>
                  <p className="font-semibold text-sm text-[#EDEDED]">Rett til sletting</p>
                  <p className="text-sm text-[#8B8B8B]">Du kan be om sletting av dine personopplysninger. Merk at journalopplysninger kan være underlagt lovpålagte oppbevaringskrav og kan ikke alltid slettes umiddelbart.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg">
                <Download className="w-5 h-5 shrink-0 mt-0.5 text-[#5E6AD2]" />
                <div>
                  <p className="font-semibold text-sm text-[#EDEDED]">Rett til dataportabilitet</p>
                  <p className="text-sm text-[#8B8B8B]">Du kan eksportere skjemaer og dokumenter som PDF direkte fra plattformen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg">
                <Shield className="w-5 h-5 shrink-0 mt-0.5 text-[#5E6AD2]" />
                <div>
                  <p className="font-semibold text-sm text-[#EDEDED]">Rett til å trekke tilbake samtykke</p>
                  <p className="text-sm text-[#8B8B8B]">Du kan når som helst trekke tilbake ditt samtykke til opptak og AI-behandling via dashbordet. Tilbaketrekking påvirker ikke lovligheten av behandling som allerede er utført.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Cookies */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Cookie className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              7. Informasjonskapsler (cookies)
            </h2>
            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              Vocura bruker kun funksjonelle informasjonskapsler som er nødvendige for at tjenesten skal fungere:
            </p>
            <ul className="space-y-2 text-[#8B8B8B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Autentiseringscookies:</strong> Brukes for å opprettholde din innloggede sesjon. Disse settes av vår autentiseringstjeneste (Supabase) og er nødvendige for sikker tilgang til din konto.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span><strong className="text-[#EDEDED]">Ingen analyse- eller sporingscookies:</strong> Vi bruker ingen tredjeparts cookies, analyseverktøy eller sporingspiksler.</span>
              </li>
            </ul>
            <p className="leading-relaxed mt-4 text-[#8B8B8B]">
              I tillegg brukes nettleserens localStorage for å lagre dine preferanser (som mørk modus). Disse dataene deles ikke med tredjeparter og sendes ikke over nettverket.
            </p>
          </section>

          {/* 8. Security */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              8. Sikkerhetstiltak
            </h2>
            <ul className="space-y-2 text-[#8B8B8B]">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>All kommunikasjon mellom nettleseren og serveren skjer over HTTPS (kryptert forbindelse)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Midlertidige lydfiler på serveren slettes umiddelbart etter prosessering</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Pasientdata lagres i sikre databaser med tilgangskontroll — kun autoriserte brukere har tilgang til egne data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Revisjonslogging sporer all opprettelse, endring og sletting av journaldata</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>API-nøkler og sensitive konfigurasjoner lagres sikkert som miljøvariabler</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5 text-[#5E6AD2]">&#8226;</span>
                <span>Automatisk sesjonsutlogging etter 15 minutters inaktivitet for å beskytte mot uautorisert tilgang</span>
              </li>
            </ul>
          </section>

          {/* 9. Contact & complaints */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#EDEDED]">
              9. Klagerett
            </h2>
            <p className="leading-relaxed mb-4 text-[#8B8B8B]">
              Dersom du mener at behandlingen av dine personopplysninger ikke er i samsvar med personvernregelverket, har du rett til å klage til Datatilsynet:
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Datatilsynet</strong><br />
                Postboks 458 Sentrum, 0105 Oslo<br />
                Telefon: 22 39 69 00<br />
                E-post: <a href="mailto:postkasse@datatilsynet.no" className="cursor-pointer text-[#7B89DB]">postkasse@datatilsynet.no</a><br />
                Nettside: <a href="https://www.datatilsynet.no" className="cursor-pointer text-[#7B89DB]" target="_blank" rel="noopener noreferrer">www.datatilsynet.no</a>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap gap-4">
          <Link href="/" className="text-sm inline-flex items-center gap-1 cursor-pointer text-[#7B89DB]">
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>
          <Link href="/sikkerhet" className="text-sm text-[#5E6AD2] hover:underline">Sikkerhet og tillit</Link>
          <Link href="/dpia" className="text-sm text-[#5E6AD2] hover:underline">DPIA</Link>
          <Link href="/sikkerhetsdokumentasjon" className="text-sm text-[#5E6AD2] hover:underline">All dokumentasjon</Link>
        </div>
      </main>
    </div>
  );
}
