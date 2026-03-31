/**
 * Skeleton loader for station detail page.
 * Mirrors the hero stage → tags → about layout.
 */
export default function Loading() {
  return (
    <main className="min-h-screen dark:bg-surface-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Nav row */}
        <div className="flex justify-between items-center mb-5">
          <div className="h-8 w-20 rounded-xl bg-white/[0.06] animate-pulse" />
          <div className="h-8 w-28 rounded-xl bg-white/[0.06] animate-pulse" />
        </div>

        {/* Hero stage */}
        <div className="rounded-3xl overflow-hidden mb-5 bg-white/[0.04] border border-white/[0.05]">
          <div className="flex flex-col items-center text-center px-6 pt-12 pb-10 gap-5">
            <div className="w-28 h-28 rounded-2xl bg-white/[0.08] animate-pulse" />
            <div className="h-10 w-64 rounded-xl bg-white/[0.07] animate-pulse" />
            <div className="flex items-center gap-5">
              <div className="h-3.5 w-20 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-3.5 w-16 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-3.5 w-14 rounded bg-white/[0.06] animate-pulse" />
            </div>
            <div className="space-y-2 w-full max-w-xs">
              <div className="h-3 w-full rounded bg-white/[0.05] animate-pulse" />
              <div className="h-3 w-4/5 mx-auto rounded bg-white/[0.05] animate-pulse" />
            </div>
            <div className="h-14 w-full max-w-xs rounded-2xl bg-white/[0.07] animate-pulse" />
          </div>
        </div>

        {/* Tags row */}
        <div className="flex gap-2 mb-8">
          {[60, 48, 72, 52].map((w, i) => (
            <div
              key={i}
              className="h-7 rounded-lg bg-white/[0.05] animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* About section */}
        <div className="h-6 w-48 rounded-lg bg-white/[0.07] animate-pulse mb-4" />
        <div className="space-y-2.5">
          <div className="h-3 w-full rounded bg-white/[0.05] animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-white/[0.05] animate-pulse" />
          <div className="h-3 w-4/6 rounded bg-white/[0.05] animate-pulse" />
        </div>
      </div>
    </main>
  )
}
