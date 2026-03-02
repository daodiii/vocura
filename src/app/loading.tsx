export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-2xl px-6">
        {/* Skeleton screens */}
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E293B] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded-full bg-[#1E293B] animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-[#1E293B] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
              <div className="h-4 w-2/3 rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-3 w-full rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-3 w-5/6 rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-3 w-3/4 rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-20 w-full rounded-xl bg-[#1E293B] animate-pulse" />
            </div>
            <div className="bg-[#191919] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 space-y-4">
              <div className="h-4 w-1/2 rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-3 w-full rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-3 w-2/3 rounded-full bg-[#1E293B] animate-pulse" />
              <div className="h-20 w-full rounded-xl bg-[#1E293B] animate-pulse" />
            </div>
          </div>

          {/* Loading indicator */}
          <p className="text-center text-sm font-medium text-[#5C5C5C]">
            Laster...
          </p>
        </div>
      </div>
    </div>
  );
}
