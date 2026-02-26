import React from 'react'
import { DiamondSkeleton } from '@/components/diamond-skeleton'

export default function Loading() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-8">
                    <DiamondSkeleton className="w-48 h-48 rounded-full" variant="ring" />
                    <span className="text-[10px] font-premium-sans tracking-[0.4em] uppercase text-white/40 animate-pulse">Acquiring Masterpiece Details...</span>
                </div>
            </main>
        </div>
    )
}
