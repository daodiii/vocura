// src/components/RetentionBadge.tsx
'use client';

import { useEffect, useState } from 'react';
import { Clock, Trash2, AlertTriangle, Pause } from 'lucide-react';
import { getRetentionBadgeText } from '@/lib/retention';
import { cn } from '@/lib/utils';

interface RetentionBadgeProps {
  deleteAfter: Date | null;
  autoDeleteEnabled?: boolean;
  className?: string;
}

const VARIANT_STYLES = {
  gray: 'bg-[var(--surface-primary)] text-[var(--text-muted)] border-[var(--border-default)]',
  amber: 'bg-[rgba(245,158,11,0.08)] text-[#F59E0B] border-[rgba(245,158,11,0.2)]',
  red: 'bg-[rgba(239,68,68,0.08)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
  blue: 'bg-[rgba(94,106,210,0.08)] text-[#5E6AD2] border-[rgba(94,106,210,0.2)]',
};

const VARIANT_ICONS = {
  gray: Pause,
  amber: Clock,
  red: AlertTriangle,
  blue: Trash2,
};

export default function RetentionBadge({
  deleteAfter,
  autoDeleteEnabled = true,
  className,
}: RetentionBadgeProps) {
  const [badge, setBadge] = useState(() => getRetentionBadgeText(deleteAfter));

  useEffect(() => {
    if (!deleteAfter) return;
    const interval = setInterval(() => {
      setBadge(getRetentionBadgeText(deleteAfter));
    }, 60_000); // update every minute
    return () => clearInterval(interval);
  }, [deleteAfter]);

  if (!autoDeleteEnabled) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border',
          VARIANT_STYLES.blue,
          className
        )}
      >
        <Trash2 className="w-3 h-3" />
        Manuell sletting
      </span>
    );
  }

  const Icon = VARIANT_ICONS[badge.variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border',
        VARIANT_STYLES[badge.variant],
        badge.variant === 'red' && 'animate-pulse',
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {badge.text}
    </span>
  );
}
