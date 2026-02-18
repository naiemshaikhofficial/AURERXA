'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
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
    text_color?: string
    button_bg?: string
    button_text_color?: string
    overlay_opacity?: number
}

export function HeroCarousel({ slides }: { slides: Slide[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [direction, setDirection] = useState(0)
    const [isMounted, setIsMounted] = useState(false)
    const containerRef = useRef<HTMLElement>(null)

    useEffect(() => {
        setIsMounted(true)
        console.log('HeroCarousel mounted with slides:', slides?.length)
    }, [slides?.length])

    const { scrollYProgress } = useScroll({
        target: isMounted ? containerRef : undefined,
        offset: ["start start", "end start"]
    })

    // Low-pass filter for scroll noise (Anti-Jitter)
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        mass: 0.5,
        restDelta: 0.0001
    })

    const yParallax = useTransform(smoothProgress, [0, 1], ["0vh", "20vh"])

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
        if (isHovered || slides.length <= 1) return
        const timer = setInterval(() => {
            nextSlide()
        }, 5000)
        return () => clearInterval(timer)
    }, [isHovered, nextSlide, slides.length])

    if (!slides || slides.length === 0) {
        console.log('HeroCarousel: Render skipped (no slides)')
        return null
    }

    // Get indices for the stacked effect
    const getSlideIndex = (offset: number) => {
        return (currentIndex + offset + slides.length) % slides.length
    }

    const visibleIndices = [-1, 0, 1] // Previous, Current, Next

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '139, 0, 0';
    }

    return (
        <section
            ref={containerRef}
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
                                className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none ${isMain ? 'z-10 pointer-events-auto' : 'z-0'} will-change-transform`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <Link
                                    href={slide.cta_link || '/collections'}
                                    className={`relative w-[92%] md:w-[85%] h-[85%] md:h-[90%] rounded-[2rem] overflow-hidden block border border-white/20 ${isMain ? 'z-10' : ''}`}
                                    style={{
                                        boxShadow: isMain
                                            ? `0 50px 100px -20px rgba(${hexToRgb(slide.text_color || '#000000')}, 0.15), 0 0 80px -10px rgba(0,0,0,0.8)`
                                            : '0 20px 40px -10px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {/* Image Container with Parallax - Forced GPU Layer */}
                                    <motion.div
                                        style={{ y: isMain ? yParallax : 0, translateZ: 0 }}
                                        className="absolute inset-0 w-full h-[120%] -top-[10%] will-change-transform flex items-center justify-center overflow-hidden"
                                    >
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
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700"
                                        style={{ opacity: slide.overlay_opacity ?? 1 }}
                                    />

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
                                                        <p
                                                            className="font-premium-sans text-xs md:text-sm tracking-[0.5em] uppercase mb-2"
                                                            style={{ color: slide.text_color || 'rgba(251, 191, 36, 0.9)' }} // amber-200/90 default
                                                        >
                                                            {slide.subtitle}
                                                        </p>
                                                    )}
                                                    <h2
                                                        className="text-4xl md:text-7xl font-serif font-medium leading-tight drop-shadow-2xl"
                                                        style={{ color: slide.text_color || 'white' }}
                                                    >
                                                        {slide.title}
                                                    </h2>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.6, delay: 0.6 }}
                                                >
                                                    <div
                                                        className="inline-block px-12 py-4 font-semibold text-xs md:text-sm tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-500 shadow-xl border border-transparent hover:border-white"
                                                        style={{
                                                            backgroundColor: slide.button_bg || 'white',
                                                            color: slide.button_text_color || 'black'
                                                        }}
                                                    >
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
                                ? 'scale-125'
                                : 'bg-white/40 hover:bg-white/70'
                                }`}
                            style={{
                                backgroundColor: idx === currentIndex
                                    ? (slides[currentIndex].text_color || '#8B0000')
                                    : undefined,
                                boxShadow: idx === currentIndex
                                    ? `0 0 20px rgba(${hexToRgb(slides[currentIndex].text_color || '#8B0000')}, 0.5)`
                                    : undefined
                            }}
                        />
                    </button>
                ))}
            </div>

        </section>
    )
}
