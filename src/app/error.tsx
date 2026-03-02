"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0A0A]">
      <div className="text-center max-w-md">
        <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-2xl p-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-[rgba(239,68,68,0.1)]">
            <AlertTriangle className="w-10 h-10 text-[#EF4444]" />
          </div>

          <h2 className="text-2xl font-semibold text-[#EDEDED] mb-3">
            Noe gikk galt
          </h2>

          <p className="text-[#8B8B8B] mb-2">
            En uventet feil oppstod. Vi beklager uleiligheten.
          </p>

          {error.digest && (
            <p className="text-xs font-mono text-[#5C5C5C] mb-6">
              Feil-ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5ABF] text-white font-medium cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Prøv igjen
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.06)] text-[#EDEDED] font-medium cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              Gå til forsiden
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
