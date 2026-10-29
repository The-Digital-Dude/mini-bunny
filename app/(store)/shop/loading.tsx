export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-bunny-bg animate-pulse">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 items-center">
          <div className="h-3 w-12 bg-bunny-muted/60 rounded-full" />
          <div className="h-3 w-3 bg-bunny-muted/40 rounded-full" />
          <div className="h-3 w-16 bg-bunny-muted/60 rounded-full" />
        </div>

        {/* Shop Title & Subtitle */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-bunny-muted/70 rounded-full" />
          <div className="h-4 w-72 bg-bunny-muted/40 rounded-full" />
        </div>

        {/* Filter / Sort bar skeleton */}
        <div className="flex justify-between items-center py-3 border-y border-bunny-border/50">
          <div className="h-8 w-24 bg-bunny-muted/50 rounded-lg" />
          <div className="flex gap-3">
            <div className="h-8 w-28 bg-bunny-muted/50 rounded-lg hidden sm:block" />
            <div className="h-8 w-24 bg-bunny-muted/50 rounded-lg" />
          </div>
        </div>

        {/* Product Grid Skeleton (8 items) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/60 p-3 rounded-2xl border border-bunny-border/40 space-y-3">
              <div className="aspect-[3/4] w-full bg-bunny-muted/60 rounded-xl" />
              <div className="space-y-1.5 pt-1">
                <div className="h-4 w-5/6 bg-bunny-muted/70 rounded-full" />
                <div className="h-4 w-2/5 bg-bunny-muted/50 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
