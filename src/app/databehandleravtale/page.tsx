import Link from "next/link";
import { Mic, ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Databehandleravtale | Vocura AI",
  description: "Databehandleravtale for Vocura AI-plattformen.",
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
            Avtale om behandling av personopplysninger.
          </p>
        </div>

        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-xl shadow-lg p-8 text-center">
          <FileText className="w-12 h-12 text-[#5E6AD2] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#EDEDED] mb-2">
            Under utarbeidelse
          </h2>
          <p className="text-[#8B8B8B] max-w-md mx-auto">
            Databehandleravtalen er under utarbeidelse og vil bli tilgjengelig snart. Kontakt oss på{" "}
            <a href="mailto:personvern@vocura.no" className="text-[#7B89DB] cursor-pointer">personvern@vocura.no</a>{" "}
            for å motta avtalen direkte.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
          <Link href="/" className="text-sm inline-flex items-center gap-1 cursor-pointer text-[#7B89DB]">
            <ArrowLeft className="w-4 h-4" />
            Tilbake til forsiden
          </Link>
        </div>
      </main>
    </div>
  );
}
