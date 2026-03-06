'use client'

import React, { useState, useEffect, useRef } from 'react'

interface LazySectionProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    threshold?: number
    rootMargin?: string
}

import { motion, AnimatePresence } from 'framer-motion'

/**
 * ELITE PROGRESSIVE HYDRATION WRAPPER
 * post-hydrates heavy sections only when they enter or approach the viewport.
 */
export function LazySection({
    children,
    fallback = <div className="min-h-[400px]" />,
    threshold = 0.05,
    rootMargin = '400px' // Increased margin to hydrate earlier (smoother)
}: LazySectionProps) {
    const [shouldLoad, setShouldLoad] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            setShouldLoad(true)
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // ELITE: Use requestIdleCallback to hydrate when main thread is free
                    if ('requestIdleCallback' in window) {
                        (window as any).requestIdleCallback(() => setShouldLoad(true))
                    } else {
                        setTimeout(() => setShouldLoad(true), 100)
                    }
                    observer.disconnect()
                }
            },
            { threshold, rootMargin }
        )

        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [threshold, rootMargin])

    return (
        <div ref={ref} className="w-full relative min-h-[50px]">
            <AnimatePresence mode="wait">
                {!shouldLoad ? (
                    <motion.div
                        key="fallback"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {fallback}
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
