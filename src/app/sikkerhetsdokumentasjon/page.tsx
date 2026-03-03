import Link from "next/link";
import { Mic, ArrowLeft, FolderOpen, FileText, Eye, Shield, FileSearch, AlertTriangle, Brain, Clock, Users, Mail } from "lucide-react";

export const metadata = {
  title: "Sikkerhetsdokumentasjon — Vocura",
  description: "Samlet oversikt over Vocuras sikkerhets- og personverndokumentasjon for leverandørvurderinger.",
};

const documents = [
  { href: "/databehandleravtale", title: "Databehandleravtale", desc: "Avtale om behandling av personopplysninger", icon: "FileText" },
  { href: "/personvern", title: "Personvernerklæring", desc: "Hvordan vi behandler persondata", icon: "Eye" },
  { href: "/sikkerhet", title: "Sikkerhetstiltak", desc: "Tekniske og organisatoriske tiltak", icon: "Shield" },
  { href: "/dpia", title: "DPIA", desc: "Personvernkonsekvensvurdering", icon: "FileSearch" },
  { href: "/hendelseshaandtering", title: "Hendelseshåndtering", desc: "Vår beredskapsplan for sikkerhetshendelser", icon: "AlertTriangle" },
  { href: "/ai-styring", title: "AI-styring", desc: "Ansvarlig bruk av kunstig intelligens", icon: "Brain" },
  { href: "/sla", title: "Tjenestenivåavtale", desc: "Oppetidsmål, vedlikehold og støttetider", icon: "Clock" },
  { href: "/universell-utforming", title: "Universell utforming", desc: "Tilgjengelighetserklæring", icon: "Eye" },
  { href: "/pasientinformasjon", title: "Pasientinformasjon", desc: "Informasjon til pasienter om Vocura", icon: "Users" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Eye, Shield, FileSearch, AlertTriangle, Brain, Clock, Users,
};

export default function SecurityDocumentationPage() {
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
            <FolderOpen className="w-4 h-4" />
            <span>Dokumentasjon</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#EDEDED]">
            Sikkerhetsdokumentasjon
          </h1>
          <p className="text-[#8B8B8B]">
            Samlet oversikt over all sikkerhets- og personverndokumentasjon. Beregnet for klinikkledere, IT-ansvarlige og leverandørvurderinger.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {documents.map((doc) => {
            const Icon = iconMap[doc.icon] || Shield;
            return (
              <Link
                key={doc.href}
                href={doc.href}
                className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 hover:border-[rgba(94,106,210,0.3)] transition-colors group"
              >
                <Icon className="w-6 h-6 text-[#5E6AD2] mb-3" />
                <h3 className="text-[#EDEDED] font-semibold mb-1 group-hover:text-[#5E6AD2] transition-colors">
                  {doc.title}
                </h3>
                <p className="text-sm text-[#8B8B8B]">{doc.desc}</p>
              </Link>
            );
          })}
        </div>

        <section className="bg-[rgba(94,106,210,0.05)] border border-[rgba(94,106,210,0.15)] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-3 text-[#EDEDED]">
            <Mail className="w-5 h-5 text-[#5E6AD2]" />
            Trenger du mer informasjon?
          </h2>
          <p className="text-[#8B8B8B] mb-4">
            Kontakt oss for en komplett leverandørvurdering, signert databehandleravtale, eller andre sikkerhetsdokumenter.
          </p>
          <a
            href="mailto:sikkerhet@vocura.no"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4F5BC4] transition-colors"
          >
            <Mail className="w-4 h-4" />
            sikkerhet@vocura.no
          </a>
        </section>

        <div className="flex flex-wrap gap-4 pt-8 mt-8 border-t border-[rgba(255,255,255,0.06)]">
          <Link href="/sikkerhet" className="text-sm text-[#5E6AD2] hover:underline">Sikkerhet</Link>
          <Link href="/" className="text-sm text-[#5E6AD2] hover:underline">Tilbake til forsiden</Link>
        </div>
      </main>
    </div>
  );
}
