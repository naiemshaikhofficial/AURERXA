'use client'

import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: ReactNode }) {
    useEffect(() => {
        const initTimeout = setTimeout(() => {
            const lenis = new Lenis({
                duration: 0.5, // Very low duration for "almost native" feel but smooth enough for parallax
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1, // Standard speed
                touchMultiplier: 2,
                infinite: false,
                syncTouch: false,
                prevent: (node) => node.classList.contains('no-smooth-scroll'),
            })

            // Fast RAF
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
        }, 100)

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
