'use client';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ConversationMockupProps {
  isRecording: boolean;
  recordingTime: number;
}

const MESSAGES = [
  { role: 'DR', text: 'Hvor lenge har disse symptomene pågått?', delay: 3 },
  { role: 'PA', text: 'Omtrent tre uker, verst om morgenen.', delay: 6 },
  { role: 'DR', text: 'Genererer SOAP-notat...', delay: 9, faded: true },
];

export default function ConversationMockup({ isRecording, recordingTime }: ConversationMockupProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setVisibleCount(0);
      return;
    }
    const count = MESSAGES.filter(m => recordingTime >= m.delay).length;
    setVisibleCount(count);
  }, [isRecording, recordingTime]);

  if (!isRecording || visibleCount === 0) return null;

  return (
    <div className="w-full max-w-md space-y-2.5 mt-4" aria-hidden="true">
      {MESSAGES.slice(0, visibleCount).map((msg, i) => (
        <div
          key={i}
          className={cn(
            'flex items-start gap-2',
            'animate-[fadeIn_300ms_ease-out_forwards]',
            msg.faded && 'opacity-50'
          )}
        >
          <span
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
              'bg-[var(--surface-overlay)] border border-[var(--border-default)]',
              msg.role === 'DR' ? 'text-[var(--accent-primary)]' : 'text-[var(--color-success)]'
            )}
          >
            {msg.role}
          </span>
          <div className="bg-[var(--surface-overlay)] border border-[var(--border-default)] rounded-xl px-3 py-2">
            <span className="text-[12px] text-[var(--text-secondary)]">{msg.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
