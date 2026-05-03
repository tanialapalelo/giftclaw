export default function GiftsLoading() {
  return (
    <div className="min-h-screen bg-gray-950 bg-pixel-grid">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-2 w-24 bg-white/10 rounded mx-auto animate-pulse" />
          <div className="h-4 w-48 bg-white/10 rounded mx-auto animate-pulse" />
        </div>

        {/* AI generating indicator */}
        <div className="rounded border border-yellow-400/20 bg-yellow-400/5 p-4 text-center">
          <p className="font-pixel text-[8px] text-yellow-400 animate-blink">
            ✦ AI ANALYZING PROFILE...
          </p>
          <p className="font-body text-xs text-gray-400 mt-2">
            Finding the perfect gifts for your friend
          </p>
          <div className="mt-3 h-2 w-full rounded bg-white/10 overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
        </div>

        {/* Skeleton cards */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded border border-white/10 bg-white/5 p-4 space-y-3"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded bg-white/10 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="h-2 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-2 w-1/2 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
