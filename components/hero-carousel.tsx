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
    const containerRef = useRef<HTMLElement>(null)

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

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
        }, 6000)
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
            ref={containerRef}
            className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden bg-background group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
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
                                    scale: isMain ? 0.8 : 0.6,
                                    z: isMain ? 0 : -500,
                                    x: offset * 100 + "%",
                                    rotateY: offset * 45
                                }}
                                animate={{
                                    opacity: isMain ? 1 : 0.4,
                                    scale: isMain ? 1 : 0.8,
                                    z: isMain ? 0 : -200,
                                    x: offset * 60 + "%", // Overlap side slides
                                    rotateY: offset * -15, // Subtle tilt for depth
                                    filter: isMain ? "blur(0px)" : "blur(4px)",
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                    z: -500,
                                    x: (offset - direction) * 100 + "%",
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: PREMIUM_EASE,
                                }}
                                className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none ${isMain ? 'z-10 pointer-events-auto' : 'z-0'}`}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <Link
                                    href={slide.cta_link || '/collections'}
                                    className="relative w-[90%] md:w-[85%] h-[80%] md:h-[90%] rounded-2xl overflow-hidden shadow-2xl block border border-white/10"
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
                                        <div className="absolute inset-0 flex items-end p-8 md:p-16">
                                            <div className="max-w-2xl space-y-4">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                                                >
                                                    {slide.subtitle && (
                                                        <p className="text-amber-200/90 font-premium-sans text-[10px] md:text-sm tracking-[0.4em] uppercase mb-2">
                                                            {slide.subtitle}
                                                        </p>
                                                    )}
                                                    <h2 className="text-3xl md:text-6xl font-serif font-medium text-white leading-tight drop-shadow-lg">
                                                        {slide.title}
                                                    </h2>
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.6, delay: 0.5 }}
                                                >
                                                    <div className="inline-flex items-center gap-3 text-white bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-300">
                                                        <span className="font-premium-sans text-[10px] md:text-xs tracking-[0.2em] uppercase">
                                                            {slide.cta_text || 'Explore Now'}
                                                        </span>
                                                        <ChevronRight size={14} />
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

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30">
                <button
                    onClick={prevSlide}
                    className="p-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all duration-500 group/btn"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft size={20} className="group-hover/btn:-translate-x-0.5 transition-transform" />
                </button>

                <div className="flex gap-3 items-center">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1)
                                setCurrentIndex(idx)
                            }}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="p-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all duration-500 group/btn"
                    aria-label="Next Slide"
                >
                    <ChevronRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </section>
    )
}
