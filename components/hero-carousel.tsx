'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PREMIUM_EASE } from '@/lib/animation-constants'

interface Slide {
    id: string
    image_url: string
    mobile_image_url?: string
    title: string
    subtitle?: string
    cta_text?: string
    cta_link?: string
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [direction, setDirection] = useState(0) // -1 for prev, 1 for next
    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef ? { current: containerRef } : undefined,
        offset: ["start start", "end start"]
    })

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])

    const nextSlide = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, [slides.length])

    const prevSlide = useCallback((e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    }, [slides.length])

    // Auto-advance
    useEffect(() => {
        if (isHovered) return
        const timer = setInterval(() => {
            nextSlide()
        }, 4000) // Faster auto-advance
        return () => clearInterval(timer)
    }, [isHovered, nextSlide])

    if (!slides || slides.length === 0) return null

    // Get indices for the stacked effect
    const getSlideIndex = (offset: number) => {
        return (currentIndex + offset + slides.length) % slides.length
    }

    const visibleIndices = [-1, 0, 1] // Previous, Current, Next

    return (
        <section
            ref={(node) => setContainerRef(node)}
            className="relative h-[65vh] md:h-[90vh] w-full overflow-hidden bg-background group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full h-full flex items-center justify-center perspective-[3000px]">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    {visibleIndices.map((offset) => {
                        const index = getSlideIndex(offset)
                        const slide = slides[index]
                        const isMain = offset === 0

                        return (
                            <motion.div
                                key={`${index}-${offset}`}
                                custom={direction}
                                initial={{
                                    opacity: 0,
                                    scale: isMain ? 0.9 : 0.6,
                                    z: isMain ? 100 : -800,
                                    x: offset * 120 + "%",
                                    rotateY: offset * 45
                                }}
                                animate={{
                                    opacity: isMain ? 1 : 0.35,
                                    scale: isMain ? (isHovered ? 1.08 : 1.05) : 0.75,
                                    z: isMain ? (isHovered ? 200 : 100) : -400,
                                    x: offset * 65 + "%", // Overlap side slides
                                    rotateY: offset * -20, // Subtle tilt for depth
                                    y: isMain ? (isHovered ? -20 : 0) : 0, // Lift when hovered
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.6,
                                    z: -800,
                                    x: (offset - direction) * 120 + "%",
                                }}
                                transition={{
                                    duration: 0.9,
                                    ease: [0.33, 1, 0.68, 1], // Custom premium ease
                                }}
                                className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none ${isMain ? 'z-10 pointer-events-auto' : 'z-0'}`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <Link
                                    href={slide.cta_link || '/collections'}
                                    className={`relative w-[92%] md:w-[85%] h-[85%] md:h-[90%] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] block border border-white/20 transition-all duration-700 ${isMain ? 'shadow-amber-900/10' : ''}`}
                                >
                                    {/* Image Container with Parallax */}
                                    <motion.div style={{ y: isMain ? yParallax : 0 }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                                        <Image
                                            src={slide.image_url}
                                            alt={slide.title}
                                            fill
                                            priority={isMain}
                                            className="object-cover object-center hidden md:block"
                                            sizes="100vw"
                                        />
                                        <Image
                                            src={slide.mobile_image_url || slide.image_url}
                                            alt={slide.title}
                                            fill
                                            priority={isMain}
                                            className="object-cover object-center md:hidden"
                                            sizes="100vw"
                                        />
                                    </motion.div>

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Content (only for main slide) */}
                                    {isMain && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8 text-center bg-transparent">
                                            <div className="max-w-3xl space-y-6">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                                    className="space-y-4"
                                                >
                                                    {slide.subtitle && (
                                                        <p className="text-amber-200/90 font-premium-sans text-xs md:text-sm tracking-[0.5em] uppercase mb-2">
                                                            {slide.subtitle}
                                                        </p>
                                                    )}
                                                    <h2 className="text-4xl md:text-7xl font-serif font-medium text-white leading-tight drop-shadow-2xl">
                                                        {slide.title}
                                                    </h2>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.6, delay: 0.6 }}
                                                >
                                                    <div className="inline-block px-12 py-4 bg-white text-black font-semibold text-xs md:text-sm tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-500 shadow-xl border border-transparent hover:border-white">
                                                        {slide.cta_text || 'KNOW MORE'}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Navigation Indicators - Diamonds */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1)
                            setCurrentIndex(idx)
                        }}
                        className="group relative h-4 w-4 flex items-center justify-center"
                        aria-label={`Go to slide ${idx + 1}`}
                    >
                        <div
                            className={`h-2.5 w-2.5 rotate-45 transition-all duration-500 rounded-sm ${idx === currentIndex
                                ? 'bg-[#8B0000] scale-125 shadow-[0_0_10px_rgba(139,0,0,0.5)]'
                                : 'bg-white/40 hover:bg-white/70'
                                }`}
                        />
                    </button>
                ))}
            </div>
        </section>
    )
}
