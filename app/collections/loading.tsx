import { SectionSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-32 px-4 md:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Header Skeleton */}
        <div className="text-center space-y-6">
          <div className="h-2 w-24 bg-muted animate-pulse mx-auto" />
          <div className="h-12 md:h-24 w-3/4 bg-muted animate-pulse mx-auto" />
          <div className="h-4 w-1/2 bg-muted animate-pulse mx-auto" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="h-16 w-full bg-muted/20 animate-pulse border border-border" />

        {/* Products Grid Skeleton */}
        <SectionSkeleton type="product" rows={3} columns={4} />
      </div>
    </div>
  )
}
