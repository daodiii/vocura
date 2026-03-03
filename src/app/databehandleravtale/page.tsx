import Link from "next/link";
import { Mic, ArrowLeft, FileText, Shield, Users, Database, Clock, AlertTriangle, Mail, Globe } from "lucide-react";

export const metadata = {
  title: "Databehandleravtale | Vocura AI",
  description: "Databehandleravtale (DPA) for Vocura AI-plattformen — avtale om behandling av personopplysninger.",
};

export default function DataProcessingAgreementPage() {
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
            <FileText className="w-4 h-4" />
            <span>Juridisk</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Databehandleravtale
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          {/* 1. Parties */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Users className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Parter
            </h2>
            <div className="space-y-3">
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Databehandler</h3>
                <p className="text-sm text-[#8B8B8B]">Vocura Technologies AS — utvikler og drifter Vocura AI-plattformen.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Behandlingsansvarlig</h3>
                <p className="text-sm text-[#8B8B8B]">Klinikken / helsepersonellet som bruker Vocura — ansvarlig for behandlingen av pasientopplysninger.</p>
              </div>
            </div>
          </section>

          {/* 2. Purpose */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <FileText className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Formål
            </h2>
            <p className="leading-relaxed text-[#8B8B8B]">
              Vocura behandler personopplysninger på vegne av behandlingsansvarlig for følgende formål: transkripsjon av konsultasjoner, AI-generering av strukturerte journalnotater (SOAP), forslag til diagnosekoder (ICPC-2/ICD-10), og midlertidig lagring inntil overføring til EPJ.
            </p>
          </section>

          {/* 3. Categories of data */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Database className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              3. Kategorier av personopplysninger
            </h2>
            <div className="space-y-3">
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Helseopplysninger (særlig kategori)</h3>
                <p className="text-sm text-[#8B8B8B]">Lydopptak av konsultasjoner, transkripsjoner, kliniske notater, diagnosekoder, medisinlister.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Identitetsopplysninger</h3>
                <p className="text-sm text-[#8B8B8B]">Pasientnavn, fødselsdato, fødselsnummer, kontaktinformasjon.</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Brukerdata</h3>
                <p className="text-sm text-[#8B8B8B]">Legens navn, e-post, HPR-nummer, BankID-verifisering, innloggingslogg.</p>
              </div>
            </div>
          </section>

          {/* 4. Security measures */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Shield className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              4. Sikkerhetstiltak
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Vocura implementerer tekniske og organisatoriske tiltak i henhold til GDPR art. 32:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Ende-til-ende-kryptering (AES-256-GCM)</li>
              <li>BankID-autentisering (sikkerhetsnivå 4)</li>
              <li>Automatisk sesjonsutløp etter 15 minutters inaktivitet</li>
              <li>Revisjonslogging av alle handlinger</li>
              <li>Tilgangskontroll basert på roller</li>
              <li>Kryptering i transit (TLS 1.3) og i hvile</li>
              <li>CSRF-beskyttelse og rate limiting</li>
            </ul>
            <p className="text-sm text-[#8B8B8B] mt-3">
              For fullstendig oversikt, se{" "}
              <Link href="/sikkerhet" className="text-[#7B89DB] hover:underline">Sikkerhet og Tillit</Link>.
            </p>
          </section>

          {/* 5. Sub-processors */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Globe className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              5. Underleverandører
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Vocura benytter følgende underleverandører. Behandlingsansvarlig godkjenner bruk av disse ved signering av avtalen:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left py-3 pr-4 text-[#EDEDED] font-semibold">Tjeneste</th>
                    <th className="text-left py-3 pr-4 text-[#EDEDED] font-semibold">Formål</th>
                    <th className="text-left py-3 text-[#EDEDED] font-semibold">Region</th>
                  </tr>
                </thead>
                <tbody className="text-[#8B8B8B]">
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">OpenAI</td>
                    <td className="py-3 pr-4">Transkripsjon og AI-strukturering</td>
                    <td className="py-3">USA (EU SCCs)</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Supabase</td>
                    <td className="py-3 pr-4">Database og autentisering</td>
                    <td className="py-3">EU (Frankfurt)</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Criipto</td>
                    <td className="py-3 pr-4">BankID/Buypass-verifisering</td>
                    <td className="py-3">EU</td>
                  </tr>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Upstash</td>
                    <td className="py-3 pr-4">Hastighetsbegrensning</td>
                    <td className="py-3">EU</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-[#EDEDED]">Sentry</td>
                    <td className="py-3 pr-4">Feilovervåking (anonymisert)</td>
                    <td className="py-3">EU</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Duration and deletion */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Clock className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              6. Varighet og sletting
            </h2>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Lydopptak slettes umiddelbart etter transkripsjon</li>
              <li>Journalnotater slettes automatisk 48 timer etter overføring til EPJ (konfigurerbart: 24 eller 48 timer)</li>
              <li>Ved opphør av avtalen slettes alle data innen 30 dager</li>
              <li>Behandlingsansvarlig kan til enhver tid be om sletting av data</li>
            </ul>
          </section>

          {/* 7. Breach notification */}
          <section className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <AlertTriangle className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              7. Brudd på personopplysningssikkerheten
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Ved brudd på personopplysningssikkerheten vil Vocura:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-2">
              <li>Varsle behandlingsansvarlig (klinikken) innen <strong className="text-[#F59E0B]">24 timer</strong></li>
              <li>Bistå behandlingsansvarlig med å varsle Datatilsynet innen <strong className="text-[#F59E0B]">72 timer</strong> (GDPR art. 33)</li>
              <li>Dokumentere hendelsen, inkludert omfang, konsekvenser og tiltak</li>
              <li>Gjennomføre tiltak for å begrense skade og forhindre gjentakelse</li>
            </ul>
            <p className="text-sm text-[#8B8B8B] mt-3">
              Se vår{" "}
              <Link href="/hendelseshaandtering" className="text-[#7B89DB] hover:underline">hendelsesplan</Link>{" "}
              for fullstendig responsprosess.
            </p>
          </section>

          {/* 8. Contact / CTA */}
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Mail className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              8. Kontakt
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              For spørsmål om databehandleravtalen eller for å motta en signerbar versjon:
            </p>
            <div className="space-y-3">
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <p className="text-sm text-[#8B8B8B]">
                  <strong className="text-[#EDEDED]">E-post:</strong>{" "}
                  <a href="mailto:personvern@vocura.no" className="text-[#7B89DB]">personvern@vocura.no</a>
                </p>
              </div>
              <a
                href="mailto:personvern@vocura.no?subject=Databehandleravtale%20-%20signering"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4F5BC4] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Kontakt oss for å signere
              </a>
            </div>
          </section>

          {/* Footer links */}
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
