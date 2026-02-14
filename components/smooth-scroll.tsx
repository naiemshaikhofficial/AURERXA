'use client'

import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: ReactNode }) {
    useEffect(() => {
        const initTimeout = setTimeout(() => {
            const lenis = new Lenis({
                duration: 0.8,
                easing: (t) => {
                    // Fast and smooth easing
                    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
                },
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1.2,
                touchMultiplier: 2,
                infinite: false,
                syncTouch: false,
                touchInertiaMultiplier: 35,
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
