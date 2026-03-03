import Link from "next/link";
import { Mic, ArrowLeft, ShieldAlert, Bell, Search, Wrench, Clock, Mail } from "lucide-react";

export const metadata = {
  title: "Hendelseshåndtering — Vocura",
  description: "Vocuras beredskapsplan for sikkerhetshendelser og databrudd.",
};

export default function IncidentResponsePage() {
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
            <ShieldAlert className="w-4 h-4" />
            <span>Beredskap</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Hendelseshåndtering
          </h1>
          <p className="text-[#8B8B8B]">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="max-w-none space-y-10">
          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Bell className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              1. Varsling og oppdagelse
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-3">
              Hendelser oppdages gjennom flere kanaler:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 text-sm">
              <li>Sentry-overvåking for feil og ytelsesavvik</li>
              <li>Anomalier i revisjonslogger og autentiseringslogger</li>
              <li>Brukerrapporter via sikkerhet@vocura.no</li>
              <li>Automatiske varsler ved mistenkelige innloggingsforsøk</li>
            </ul>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Search className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              2. Klassifisering
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Alle hendelser klassifiseres etter alvorlighetsgrad:
            </p>
            <div className="space-y-3">
              <div className="bg-[#0F1629] border border-[rgba(239,68,68,0.3)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span className="font-semibold text-[#EF4444] text-sm">Kritisk</span>
                </div>
                <p className="text-sm text-[#8B8B8B]">Databaseksponering, uautorisert tilgang til helsedata, aktiv utnyttelse av sårbarhet</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(245,158,11,0.3)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span className="font-semibold text-[#F59E0B] text-sm">Høy</span>
                </div>
                <p className="text-sm text-[#8B8B8B]">Tjenesteutfall, vedvarende autentiseringsfeil, mistenkelig datatilgang</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(59,130,246,0.3)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  <span className="font-semibold text-[#3B82F6] text-sm">Middels</span>
                </div>
                <p className="text-sm text-[#8B8B8B]">Ytelsesforringelse, ikke-kritiske feil, enkeltbrukerpåvirkning</p>
              </div>
              <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#8B8B8B]" />
                  <span className="font-semibold text-[#8B8B8B] text-sm">Lav</span>
                </div>
                <p className="text-sm text-[#8B8B8B]">Kosmetiske feil, dokumentasjonsmangler, forbedringspunkter</p>
              </div>
            </div>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Wrench className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              3. Responsprosess
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center text-[#5E6AD2] text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-[#EDEDED] mb-1">Begrens</h3>
                  <p className="text-sm text-[#8B8B8B]">Isoler berørt system for å forhindre videre skade. Deaktiver tilgang ved behov.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center text-[#5E6AD2] text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-[#EDEDED] mb-1">Vurder</h3>
                  <p className="text-sm text-[#8B8B8B]">Kartlegg omfang, berørte data og potensielle konsekvenser for pasienter og brukere.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center text-[#5E6AD2] text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-[#EDEDED] mb-1">Varsle</h3>
                  <p className="text-sm text-[#8B8B8B]">Informer berørte kunder og myndigheter i henhold til frister (se nedenfor).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center text-[#5E6AD2] text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-[#EDEDED] mb-1">Utbedr</h3>
                  <p className="text-sm text-[#8B8B8B]">Fiks rotårsak, gjenopprett tjeneste, og dokumenter hendelsesforløpet.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Clock className="w-6 h-6 shrink-0 text-[#F59E0B]" />
              4. Varslingsfrister
            </h2>
            <div className="space-y-4">
              <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Kunder (klinikker)</h3>
                <p className="text-[#8B8B8B] text-sm">Varsles innen <strong className="text-[#F59E0B]">24 timer</strong> etter bekreftet brudd via e-post.</p>
              </div>
              <div className="bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded-lg p-4">
                <h3 className="font-semibold text-[#EDEDED] mb-1">Datatilsynet</h3>
                <p className="text-[#8B8B8B] text-sm">Varsles innen <strong className="text-[#F59E0B]">72 timer</strong> i henhold til GDPR artikkel 33.</p>
              </div>
            </div>
          </section>

          <section className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-[#EDEDED]">
              <Mail className="w-6 h-6 shrink-0 text-[#5E6AD2]" />
              5. Rapporter en hendelse
            </h2>
            <p className="leading-relaxed text-[#8B8B8B] mb-4">
              Oppdager du en sikkerhetssvakhet eller mistenkelig aktivitet? Kontakt oss umiddelbart.
            </p>
            <div className="bg-[#0F1629] border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
              <p className="text-sm text-[#8B8B8B]">
                <strong className="text-[#EDEDED]">Sikkerhet:</strong>{" "}
                <a href="mailto:sikkerhet@vocura.no" className="text-[#7B89DB]">sikkerhet@vocura.no</a>
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
