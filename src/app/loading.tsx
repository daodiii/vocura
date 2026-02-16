export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
      <div className="animate-fade-in w-full max-w-2xl px-6">
        {/* Glass skeleton screens */}
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
                <div className="h-3 w-1/2 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card-static p-6 space-y-4">
              <div className="h-4 w-2/3 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-3 w-full rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-3 w-5/6 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-3 w-3/4 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-20 w-full rounded-xl glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
            </div>
            <div className="glass-card-static p-6 space-y-4">
              <div className="h-4 w-1/2 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-3 w-full rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-3 w-4/5 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-3 w-2/3 rounded-full glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
              <div className="h-20 w-full rounded-xl glass-shimmer" style={{ background: 'var(--glass-bg)' }} />
            </div>
          </div>

          {/* Loading indicator */}
          <p className="text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Laster...
          </p>
        </div>
      </div>
    </div>
  );
}
