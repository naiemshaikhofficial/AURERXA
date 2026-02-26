'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DiamondSkeletonProps {
    className?: string
    variant?: 'ring' | 'pendant' | 'bangle'
}

export function DiamondSkeleton({ className, variant = 'ring' }: DiamondSkeletonProps) {
    return (
        <div className={cn("relative flex items-center justify-center bg-muted/30 overflow-hidden", className)}>
            {/* Shimmer Light Sweep */}
            <motion.div
                initial={{ x: '-150%', skewX: -20 }}
                animate={{ x: '250%' }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent w-full h-full z-10"
            />

            {/* Geometry Outline */}
            <div className="relative opacity-20">
                {variant === 'ring' && (
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-[10px] border-white/20" />
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rotate-45 border-4 border-white/30 bg-white/5 backdrop-blur-sm" />
                    </div>
                )}

                {variant === 'pendant' && (
                    <div className="w-20 h-28 rounded-t-full border-4 border-white/20 relative">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rotate-45 border-4 border-white/30" />
                    </div>
                )}

                {variant === 'bangle' && (
                    <div className="w-32 h-16 rounded-[50%] border-8 border-white/20" />
                )}
            </div>

            {/* Sparkle Points */}
            <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 0.8, 0],
                            scale: [0, 1.2, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            delay: i * 0.5,
                            repeat: Infinity,
                        }}
                        className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
                        style={{
                            top: `${30 + Math.random() * 40}%`,
                            left: `${30 + Math.random() * 40}%`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
