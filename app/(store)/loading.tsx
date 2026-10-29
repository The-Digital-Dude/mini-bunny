export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-bunny-bg animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="w-full bg-[#F0F7FB]/70 border-b border-bunny-border/50 py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="h-4 w-40 bg-bunny-muted/60 rounded-full" />
          <div className="h-4 w-32 bg-bunny-muted/60 rounded-full hidden sm:block" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Hero Section Skeleton */}
        <div className="w-full aspect-[21/9] min-h-[220px] max-h-[460px] bg-gradient-to-r from-bunny-muted/60 via-bunny-muted/40 to-bunny-muted/60 rounded-3xl" />

        {/* Category Pills Skeleton */}
        <div className="flex gap-3 overflow-hidden py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-28 bg-bunny-muted/50 rounded-full shrink-0" />
          ))}
        </div>

        {/* Section Heading Skeleton */}
        <div className="space-y-2 text-center max-w-md mx-auto">
          <div className="h-6 w-48 bg-bunny-muted/70 rounded-full mx-auto" />
          <div className="h-4 w-72 bg-bunny-muted/40 rounded-full mx-auto" />
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/60 p-3 rounded-2xl border border-bunny-border/40 space-y-3">
              <div className="aspect-[3/4] w-full bg-bunny-muted/60 rounded-xl" />
              <div className="h-4 w-3/4 bg-bunny-muted/70 rounded-full" />
              <div className="h-4 w-1/3 bg-bunny-muted/50 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
