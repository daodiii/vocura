// src/components/EncryptionGate.tsx
'use client';

import { Shield, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function EncryptionGate() {
  const pathname = usePathname();

  const handleReAuth = () => {
    window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-[rgba(94,106,210,0.1)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-[var(--accent-primary)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Krypteringsnøkkel utløpt
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          For å beskytte pasientdata kreves ny autentisering for å dekryptere notater.
        </p>
        <button
          onClick={handleReAuth}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:opacity-90 text-white font-medium transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Logg inn på nytt
        </button>
      </div>
    </div>
  );
}
