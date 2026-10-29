export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-bunny-bg animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 items-center">
          <div className="h-3 w-12 bg-bunny-muted/60 rounded-full" />
          <div className="h-3 w-3 bg-bunny-muted/40 rounded-full" />
          <div className="h-3 w-16 bg-bunny-muted/60 rounded-full" />
          <div className="h-3 w-3 bg-bunny-muted/40 rounded-full" />
          <div className="h-3 w-36 bg-bunny-muted/70 rounded-full" />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left: Gallery Skeleton */}
          <div className="w-full lg:w-3/5 flex flex-col md:flex-row-reverse gap-4 md:gap-6">
            <div className="w-full flex-1 aspect-[3/4] md:aspect-[4/5] bg-bunny-muted/60 rounded-2xl" />
            <div className="flex md:flex-col gap-3 overflow-hidden shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] w-20 md:w-20 bg-bunny-muted/50 rounded-lg shrink-0" />
              ))}
            </div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="w-full lg:w-2/5 space-y-6 pt-4 lg:pt-8">
            <div className="h-4 w-24 bg-bunny-muted/50 rounded-full" />
            <div className="space-y-2">
              <div className="h-8 w-4/5 bg-bunny-muted/70 rounded-full" />
              <div className="h-8 w-3/5 bg-bunny-muted/60 rounded-full" />
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="h-4 w-28 bg-bunny-muted/40 rounded-full" />
            </div>

            <div className="h-10 w-36 bg-bunny-muted/80 rounded-xl" />

            {/* Sizes & Colors Skeleton */}
            <div className="space-y-3 pt-4 border-t border-bunny-border/50">
              <div className="h-4 w-20 bg-bunny-muted/60 rounded-full" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 w-16 bg-bunny-muted/50 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="space-y-3 pt-6">
              <div className="h-14 w-full bg-bunny-muted/70 rounded-2xl" />
              <div className="h-14 w-full bg-bunny-muted/50 rounded-2xl" />
            </div>

            {/* Delivery card skeleton */}
            <div className="h-24 w-full bg-white/50 border border-bunny-border/40 rounded-2xl p-4" />
          </div>

        </div>
      </div>
    </div>
  )
}
