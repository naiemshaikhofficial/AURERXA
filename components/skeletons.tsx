'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse bg-muted/40 relative overflow-hidden", className)}
            {...props}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    )
}

export function LuxuryProductSkeleton() {
    return (
        <div className="group relative bg-card border border-border overflow-hidden flex flex-col">
            {/* Image Area */}
            <div className="relative aspect-[4/5] w-full bg-muted/30">
                <Skeleton className="h-full w-full" />
            </div>

            {/* Info Area */}
            <div className="p-4 md:p-5 space-y-3">
                <div className="space-y-2">
                    {/* Category */}
                    <Skeleton className="h-2 w-16" />
                    {/* Name */}
                    <Skeleton className="h-4 w-3/4" />
                    {/* Price */}
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
        </div>
    )
}

export function LuxuryCollectionSkeleton() {
    return (
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/30 border border-border">
            <Skeleton className="h-full w-full" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end space-y-4">
                <Skeleton className="h-2 w-12" />
                <Skeleton className="h-8 w-1/2" />
            </div>
        </div>
    )
}

export function LuxuryBlogSkeleton() {
    return (
        <div className="flex flex-col">
            <div className="relative aspect-[16/10] bg-muted/30 border border-border mb-6">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    )
}

export function SectionSkeleton({
    rows = 1,
    columns = 4,
    type = 'product'
}: {
    rows?: number,
    columns?: number,
    type?: 'product' | 'collection' | 'blog'
}) {
    const Skele = type === 'product'
        ? LuxuryProductSkeleton
        : type === 'collection'
            ? LuxuryCollectionSkeleton
            : LuxuryBlogSkeleton

    return (
        <div className={cn(
            "grid gap-4 md:gap-10",
            columns === 4 ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
        )}>
            {Array.from({ length: rows * columns }).map((_, i) => (
                <Skele key={i} />
            ))}
        </div>
    )
}
