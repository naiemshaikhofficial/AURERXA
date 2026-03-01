'use client'

import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Disable Lenis for Admin routes to ensure native scroll reliability
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            return
        }

        const lenis = new Lenis({
            duration: 1.0, // Snappier response
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.0, // Reverted to standard to avoid jitter
            infinite: false,
            syncTouch: false, // CRITICAL: Disable to prevent click masking on mobile
            lerp: 0.1,
        })

        let rafId: number

        function raf(time: number) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [])

    return <>{children}</>
}
