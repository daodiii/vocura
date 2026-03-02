'use client';
import { useAccentTheme, type AccentTheme } from '@/hooks/useAccentTheme';
import { cn } from '@/lib/utils';

const ACCENTS: { key: AccentTheme; label: string; colors: [string, string] }[] = [
  { key: 'red', label: 'Rod', colors: ['#EC4899', '#F97316'] },
  { key: 'blue', label: 'Bla', colors: ['#06B6D4', '#3B82F6'] },
  { key: 'purple', label: 'Lilla', colors: ['#8B5CF6', '#EC4899'] },
];

export default function AccentThemeSelector({ className }: { className?: string }) {
  const { accent, setAccent, mounted } = useAccentTheme();
  if (!mounted) return null;

  return (
    <div className={cn('flex items-center gap-1.5', className)} role="radiogroup" aria-label="Aksentfarge">
      {ACCENTS.map((a) => (
        <button
          key={a.key}
          role="radio"
          aria-checked={accent === a.key}
          aria-label={a.label}
          onClick={() => setAccent(a.key)}
          className={cn(
            'w-4 h-4 rounded-full cursor-pointer transition-all duration-200',
            accent === a.key
              ? 'ring-2 ring-offset-1 ring-offset-[var(--surface-primary)] scale-110'
              : 'opacity-50 hover:opacity-100'
          )}
          style={{
            background: `linear-gradient(135deg, ${a.colors[0]}, ${a.colors[1]})`,
            ...(accent === a.key ? { boxShadow: `0 0 0 2px var(--surface-primary), 0 0 0 4px ${a.colors[0]}` } : {}),
          }}
          title={a.label}
        />
      ))}
    </div>
  );
}
