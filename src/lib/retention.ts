// src/lib/retention.ts

export function computeDeleteAfter(
  transferredAt: Date,
  retentionHours: number
): Date {
  return new Date(transferredAt.getTime() + retentionHours * 60 * 60 * 1000);
}

export function getRetentionBadgeText(deleteAfter: Date | null): {
  text: string;
  variant: 'gray' | 'amber' | 'red' | 'blue';
} {
  if (!deleteAfter) {
    return { text: 'Venter på EPJ-overf.', variant: 'gray' };
  }

  const now = Date.now();
  const remaining = deleteAfter.getTime() - now;

  if (remaining <= 0) {
    return { text: 'Slettes nå', variant: 'red' };
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours < 2) {
    return { text: 'Slettes snart', variant: 'red' };
  }

  return {
    text: `Slettes om ${hours}t ${minutes}m`,
    variant: 'amber',
  };
}

export function shouldAutoDelete(note: {
  epjTransferred: boolean;
  deleteAfter: Date | null;
}): boolean {
  if (!note.epjTransferred || !note.deleteAfter) return false;
  return new Date() >= note.deleteAfter;
}
