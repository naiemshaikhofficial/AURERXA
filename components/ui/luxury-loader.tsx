'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LuxuryLoaderProps {
    className?: string
    variant?: 'product' | 'collection' | 'generic'
}

export function LuxuryLoader({ className, variant = 'generic' }: LuxuryLoaderProps) {
    return (
        <div className={cn("relative w-full h-full min-h-[200px] flex items-center justify-center overflow-hidden bg-neutral-950", className)}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            {/* Shimmering Core */}
            <div className="relative group">
                <motion.div
                    animate={{
                        scale: [0.95, 1.05, 0.95],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 blur-3xl bg-amber-500/10 rounded-full"
                />

                {/* The "Masterpiece" Silhouette */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                    {variant === 'product' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-32 h-32 relative"
                        >
                            {/* Abstract Ring/Necklace Silhouette */}
                            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/20">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.2" />
                            </svg>
                            <motion.div
                                animate={{
                                    rotate: 360
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute inset-0 border border-amber-500/5 rounded-full"
                            />
                        </motion.div>
                    )}

                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            animate={{
                                backgroundPosition: ['200% 0', '-200% 0'],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                backgroundImage: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)',
                                backgroundSize: '200% 100%',
                            }}
                            className="h-px w-32 md:w-48 bg-white/5"
                        />
                        <p className="text-[9px] uppercase tracking-[0.4em] text-amber-500/40 font-bold animate-pulse">
                            Revealing Excellence
                        </p>
                    </div>
                </div>
            </div>

            {/* Edge Shimmers */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    )
}

export function ProductSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6 md:p-12 min-h-screen bg-background">
            <div className="aspect-square bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                <LuxuryLoader variant="product" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
            </div>
            <div className="space-y-8 py-8">
                <div className="space-y-4">
                    <div className="h-4 w-24 bg-white/5 animate-pulse" />
                    <div className="h-12 w-full max-w-md bg-white/5 animate-pulse" />
                    <div className="h-6 w-32 bg-white/5 animate-pulse" />
                </div>
                <div className="space-y-4 pt-8">
                    <div className="h-20 w-full bg-white/5 animate-pulse" />
                    <div className="h-20 w-full bg-white/5 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-8">
                    <div className="h-14 bg-white/5 animate-pulse" />
                    <div className="h-14 bg-white/5 animate-pulse" />
                </div>
            </div>
        </div>
    )
}
