'use client'

import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Defer smooth scroll initialization until after first paint
        // to avoid contributing to TBT during initial load
        const initTimeout = setTimeout(() => {
            const lenis = new Lenis({
                duration: 1, // Shorter duration for tighter response
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 1.2,
                infinite: false,
                syncTouch: true,
                lerp: 0.1, // Added lerp for smoother release
            })

            let rafId: number

            function raf(time: number) {
                lenis.raf(time)
                rafId = requestAnimationFrame(raf)
            }

            rafId = requestAnimationFrame(raf)

                // Store cleanup reference
                ; (window as any).__lenisCleanup = () => {
                    cancelAnimationFrame(rafId)
                    lenis.destroy()
                }
        }, 100) // Short delay to let critical paint finish

        return () => {
            clearTimeout(initTimeout)
            if ((window as any).__lenisCleanup) {
                (window as any).__lenisCleanup()
                delete (window as any).__lenisCleanup
            }
        }
    }, [])

    return <>{children}</>
}
