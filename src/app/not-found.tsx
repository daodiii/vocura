import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0A0A]">
      <div className="text-center max-w-md">
        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-2xl p-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-[rgba(94,106,210,0.1)]">
            <FileQuestion className="w-10 h-10 text-[#5E6AD2]" />
          </div>

          <h1 className="text-6xl font-bold text-[#EDEDED] mb-4">
            404
          </h1>

          <h2 className="text-2xl font-semibold text-[#EDEDED] mb-3">
            Siden finnes ikke
          </h2>

          <p className="text-[#8B8B8B] mb-8">
            Vi fant ikke siden du leter etter. Den kan ha blitt flyttet eller slettet.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            Gå til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}
