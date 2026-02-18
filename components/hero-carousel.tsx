'use client'

import { useState, useEffect, useRef } from 'react'
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
    const containerRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

    // Auto-advance
    useEffect(() => {
        if (isHovered) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [isHovered, slides.length])

    const nextSlide = (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = (e?: React.MouseEvent) => {
        e?.preventDefault()
        e?.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    }

    if (!slides || slides.length === 0) return null

    const currentSlide = slides[currentIndex]

    return (
        <section
            ref={containerRef}
            className="relative h-[50vh] md:h-[75vh] w-full overflow-hidden bg-background group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={currentSlide.cta_link || '/collections'} className="block w-full h-full cursor-pointer">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {/* Parallax Background Image */}
                        <motion.div style={{ y: yParallax }} className="relative w-full h-[120%] -top-[10%]">
                            <Image
                                src={currentSlide.image_url}
                                alt={currentSlide.title}
                                fill
                                priority={currentIndex === 0}
                                className="object-cover object-center hidden md:block"
                                sizes="100vw"
                            />
                            <Image
                                src={currentSlide.mobile_image_url || currentSlide.image_url}
                                alt={currentSlide.title}
                                fill
                                priority={currentIndex === 0}
                                className="object-cover object-center md:hidden"
                                sizes="100vw"
                            />
                        </motion.div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center">
                            <div className="max-w-7xl mx-auto px-6 w-full">
                                <div className="max-w-xl space-y-4 md:space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                    >
                                        {currentSlide.subtitle && (
                                            <p className="text-amber-200/90 font-premium-sans text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2 md:mb-4">
                                                {currentSlide.subtitle}
                                            </p>
                                        )}
                                        <h2 className="text-3xl md:text-6xl font-serif font-medium text-white leading-tight drop-shadow-md">
                                            {currentSlide.title}
                                        </h2>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                    >
                                        <div className="inline-flex items-center gap-2 text-white border-b border-white/50 pb-1 hover:border-white transition-colors">
                                            <span className="font-premium-sans text-[10px] md:text-xs tracking-[0.2em] uppercase">
                                                {currentSlide.cta_text || 'Explore'}
                                            </span>
                                            <ChevronRight size={14} />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </Link>

            {/* Navigation Controls - Prevent bubbling to Link */}
            <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 flex items-center gap-4 z-20 pointer-events-auto">
                <button
                    onClick={prevSlide}
                    className="p-2 md:p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex gap-2">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-[2px] transition-all duration-500 ${idx === currentIndex ? 'w-6 md:w-8 bg-white' : 'w-3 md:w-4 bg-white/30'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={nextSlide}
                    className="p-2 md:p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    aria-label="Next Slide"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </section>
    )
}
