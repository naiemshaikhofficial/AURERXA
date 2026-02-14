'use client'

import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
    threshold?: number
    rootMargin?: string
    once?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
    const { threshold = 0.1, rootMargin = '0px', once = true } = options
    const ref = useRef<HTMLElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (once) {
                        observer.unobserve(element)
                    }
                } else if (!once) {
                    setIsVisible(false)
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(element)

        return () => {
            observer.disconnect()
        }
    }, [threshold, rootMargin, once])

    return { ref, isVisible }
}

// Hook for scroll progress
export function useScrollProgress() {
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = (window.scrollY / totalHeight) * 100
            setScrollProgress(progress)
        }

        // Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial call

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return scrollProgress
}

// Hook for element scroll progress
export function useElementScrollProgress(ref: React.RefObject<HTMLElement>) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const handleScroll = () => {
            const rect = element.getBoundingClientRect()
            const elementTop = rect.top
            const elementHeight = rect.height
            const windowHeight = window.innerHeight

            // Calculate progress (0 to 1)
            const scrolled = windowHeight - elementTop
            const total = windowHeight + elementHeight
            const progress = Math.max(0, Math.min(1, scrolled / total))

            setProgress(progress)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [ref])

    return progress
}
