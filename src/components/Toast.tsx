'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'info' | 'error';
    action?: { label: string; href: string };
    onDismiss: () => void;
    autoDismissMs?: number;
}

export default function Toast({ message, type, action, onDismiss, autoDismissMs = 5000 }: ToastProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
        }, autoDismissMs);
        return () => clearTimeout(timer);
    }, [autoDismissMs, onDismiss]);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 300);
    };

    const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;
    const iconColor = type === 'success' ? 'text-[var(--color-success)]' : type === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--accent-primary)]';
    const borderColor = type === 'success' ? 'border-l-[#10B981]' : type === 'error' ? 'border-l-[#EF4444]' : 'border-l-[var(--accent-primary)]';

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            role="status"
            aria-live="polite"
        >
            <div className={`bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-4 shadow-lg border-l-4 ${borderColor}`} style={{ boxShadow: 'var(--shadow-overlay)' }}>
                <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{message}</p>
                        {action && (
                            <Link
                                href={action.href}
                                className="inline-block mt-2 text-sm font-semibold text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                                onClick={handleDismiss}
                            >
                                {action.label} →
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-bg)] transition-colors shrink-0 cursor-pointer"
                        aria-label="Lukk"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
