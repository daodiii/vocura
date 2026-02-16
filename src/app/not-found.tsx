import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-deep)' }}>
      <div className="animated-bg">
        <div className="animated-bg-blob-3" />
      </div>

      <div className="relative z-10 text-center max-w-md animate-fade-in">
        <div className="glass-card-elevated p-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--primary-subtle)' }}>
            <FileQuestion className="w-10 h-10" style={{ color: 'var(--primary)' }} />
          </div>

          <h1 className="text-6xl font-bold gradient-text-lg mb-4">
            404
          </h1>

          <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Siden finnes ikke
          </h2>

          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Vi fant ikke siden du leter etter. Den kan ha blitt flyttet eller slettet.
          </p>

          <Link
            href="/"
            className="glass-btn-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Gå til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}
