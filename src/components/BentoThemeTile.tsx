'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAccentTheme, type AccentTheme } from '@/hooks/useAccentTheme';
import { cn } from '@/lib/utils';

const DARK_MODE_KEY = 'vocura_dark_mode';

const ACCENTS: { key: AccentTheme; label: string; colors: [string, string] }[] = [
  { key: 'purple', label: 'Lilla', colors: ['#8B5CF6', '#EC4899'] },
  { key: 'red', label: 'Rod', colors: ['#EC4899', '#F97316'] },
  { key: 'blue', label: 'Bla', colors: ['#06B6D4', '#3B82F6'] },
];

export default function BentoThemeTile() {
  const { accent, setAccent, mounted } = useAccentTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const stored = localStorage.getItem(DARK_MODE_KEY);
    setDarkMode(stored === 'true');
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem(DARK_MODE_KEY, next.toString());
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted || !hasMounted) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Mini dashboard preview card */}
      <div
        className="rounded-lg border border-[rgba(255,255,255,0.06)] p-3 transition-all duration-300"
        style={{
          background: darkMode
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(0,0,0,0.03)',
        }}
      >
        {/* Accent bar at top */}
        <div
          className="h-1.5 rounded-full mb-3 transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))`,
          }}
        />
        {/* Skeleton text lines */}
        <div className="space-y-1.5">
          <div
            className="h-1.5 rounded w-full transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.06)',
            }}
          />
          <div
            className="h-1.5 rounded w-3/4 transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
            }}
          />
          <div
            className="h-1.5 rounded w-1/2 transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            }}
          />
        </div>
        {/* Accent pill badge */}
        <div className="mt-2.5 flex items-center gap-2">
          <span
            className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded transition-all duration-300"
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent-text)',
            }}
          >
            Aktiv
          </span>
          <div
            className="h-1 rounded-full flex-1 transition-colors duration-300"
            style={{
              background: darkMode
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
            }}
          />
        </div>
      </div>

      {/* Controls row: accent dots + dark mode toggle */}
      <div className="flex items-center justify-between">
        {/* Accent color dots */}
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Aksentfarge">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              role="radio"
              aria-checked={accent === a.key}
              aria-label={a.label}
              onClick={() => setAccent(a.key)}
              className={cn(
                'w-5 h-5 rounded-full cursor-pointer transition-all duration-200',
                accent === a.key
                  ? 'scale-110'
                  : 'opacity-40 hover:opacity-80'
              )}
              style={{
                background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`,
                ...(accent === a.key
                  ? { boxShadow: `0 0 0 2px var(--surface-primary, #111), 0 0 0 4px ${a.colors[0]}` }
                  : {}),
              }}
              title={a.label}
            />
          ))}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer',
            darkMode
              ? 'bg-[rgba(255,255,255,0.08)] text-[#F59E0B] hover:bg-[rgba(255,255,255,0.12)]'
              : 'bg-[rgba(0,0,0,0.04)] text-[#5C5C5C] hover:bg-[rgba(0,0,0,0.08)]'
          )}
          title={darkMode ? 'Lyst modus' : 'Morkt modus'}
          aria-label={darkMode ? 'Bytt til lyst modus' : 'Bytt til morkt modus'}
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
