'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: ReactNode }) {
    const pathname = usePathname()

    useEffect(() => {
        // Disable Lenis for Admin routes to ensure native scroll reliability
        if (pathname?.startsWith('/admin')) {
            return
        }

        const lenis = new Lenis({
            duration: 1.2, // Slightly more inertia for "Luxury" feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.1, // Slightly higher for responsiveness
            touchMultiplier: 1.2, // Improved touch feel
            infinite: false,
            syncTouch: false,
            lerp: 0.1,
            autoResize: true,
        })

        // Force a resize check when pathname changes or components hydrate
        const resizeInterval = setInterval(() => {
            lenis.resize()
        }, 1000)

        let rafId: number

        function raf(time: number) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            clearInterval(resizeInterval)
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [pathname])

    return <>{children}</>
}
