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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-deep)' }}>
      <div className="animated-bg">
        <div className="animated-bg-blob-3" />
      </div>

      <div className="relative z-10 text-center max-w-md animate-fade-in">
        <div className="glass-card-elevated glow-error p-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--error-subtle)' }}>
            <AlertTriangle className="w-10 h-10" style={{ color: 'var(--error)' }} />
          </div>

          <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Noe gikk galt
          </h2>

          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
            En uventet feil oppstod. Vi beklager uleiligheten.
          </p>

          {error.digest && (
            <p className="text-xs font-mono mb-6" style={{ color: 'var(--text-muted)' }}>
              Feil-ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              onClick={reset}
              className="glass-btn-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Prøv igjen
            </button>
            <Link
              href="/"
              className="glass-btn-secondary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
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
