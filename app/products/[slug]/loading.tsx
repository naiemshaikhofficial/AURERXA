import { Skeleton } from '@/components/skeletons'

export default function Loading() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-4 md:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Gallery Skeleton */}
                    <div className="aspect-[4/5] w-full bg-muted/30">
                        <Skeleton className="h-full w-full" />
                    </div>

                    {/* Details Skeleton */}
                    <div className="flex flex-col space-y-8">
                        <div className="space-y-4">
                            <Skeleton className="h-2 w-20" />
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/4" />
                        </div>

                        <div className="space-y-4 pt-12">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
