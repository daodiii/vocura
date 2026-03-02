'use client';

interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

interface SkeletonCardProps {
    className?: string;
}

interface SkeletonListProps {
    count?: number;
    className?: string;
}

const WIDTH_PATTERN = ['w-3/4', 'w-full', 'w-1/2', 'w-5/6'];

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-3 rounded-xl bg-[var(--surface-primary)] animate-pulse ${WIDTH_PATTERN[i % WIDTH_PATTERN.length]}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
    return (
        <div
            className={`bg-[var(--surface-elevated)] border border-[var(--border-default)] rounded-lg p-5 ${className}`}
        >
            <div className="w-10 h-10 rounded-full bg-[var(--surface-primary)] animate-pulse mb-4" />
            <div className="space-y-3">
                <div className="h-3 rounded-xl bg-[var(--surface-primary)] animate-pulse w-3/4" />
                <div className="h-3 rounded-xl bg-[var(--surface-primary)] animate-pulse w-1/2" />
                <div className="h-3 rounded-xl bg-[var(--surface-primary)] animate-pulse w-5/6" />
            </div>
        </div>
    );
}

export function SkeletonList({ count = 5, className = '' }: SkeletonListProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-primary)] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 rounded-xl bg-[var(--surface-primary)] animate-pulse w-3/4" />
                        <div className="h-3 rounded-xl bg-[var(--surface-primary)] animate-pulse w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
