'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'vocura_dark_mode';

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'true';
}

export default function ThemeToggle({ className }: { className?: string }) {
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem(STORAGE_KEY, next.toString());
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className={cn(
        'p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-bg)] transition-all duration-200',
        className
      )}
      title={darkMode ? 'Bytt til lyst modus' : 'Bytt til mørkt modus'}
      aria-label={darkMode ? 'Bytt til lyst modus' : 'Bytt til mørkt modus'}
    >
      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
