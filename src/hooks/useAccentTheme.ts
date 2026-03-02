'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vocura_accent_theme';
export type AccentTheme = 'purple' | 'red' | 'blue';

export function useAccentTheme() {
  const [accent, setAccentState] = useState<AccentTheme>('purple');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as AccentTheme | null;
    const initial = stored && ['purple', 'red', 'blue'].includes(stored) ? stored : 'purple';
    setAccentState(initial);
    document.documentElement.setAttribute('data-accent', initial);
  }, []);

  const setAccent = useCallback((theme: AccentTheme) => {
    setAccentState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-accent', theme);
  }, []);

  return { accent, setAccent, mounted };
}
