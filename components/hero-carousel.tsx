'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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

    // Auto-advance
    useEffect(() => {
        if (isHovered) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length)
        }, 6000) // 6s per slide
        return () => clearInterval(timer)
    }, [isHovered, slides.length])

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slides.length)
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)

    if (!slides || slides.length === 0) return null

    return (
        <section
            className="relative h-[80vh] md:h-screen w-full overflow-hidden bg-background group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: PREMIUM_EASE }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="relative h-full w-full">
                        <Image
                            src={slides[currentIndex].image_url}
                            alt={slides[currentIndex].title}
                            fill
                            priority={currentIndex === 0}
                            className="object-cover object-center hidden md:block"
                            sizes="100vw"
                        />
                        <Image
                            src={slides[currentIndex].mobile_image_url || slides[currentIndex].image_url}
                            alt={slides[currentIndex].title}
                            fill
                            priority={currentIndex === 0}
                            className="object-cover object-center md:hidden"
                            sizes="100vw"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                        <div className="max-w-7xl mx-auto px-6 w-full">
                            <div className="max-w-xl space-y-6 md:space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5, ease: PREMIUM_EASE }}
                                >
                                    {slides[currentIndex].subtitle && (
                                        <p className="text-amber-200/80 font-premium-sans text-xs md:text-sm tracking-[0.3em] uppercase mb-4">
                                            {slides[currentIndex].subtitle}
                                        </p>
                                    )}
                                    <h2 className="text-4xl md:text-7xl font-serif font-medium text-white leading-tight">
                                        {slides[currentIndex].title}
                                    </h2>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.7, ease: PREMIUM_EASE }}
                                >
                                    <Link
                                        href={slides[currentIndex].cta_link || '/collections'}
                                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300"
                                    >
                                        <span className="text-white font-premium-sans text-xs tracking-[0.2em] uppercase">
                                            {slides[currentIndex].cta_text || 'Explore'}
                                        </span>
                                        <span className="w-8 h-[1px] bg-white/50 group-hover:w-12 transition-all duration-300" />
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute bottom-12 right-6 md:right-12 flex items-center gap-4 z-20">
                <button
                    onClick={prevSlide}
                    className="p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-[2px] transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/30'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={nextSlide}
                    className="p-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    aria-label="Next Slide"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </section>
    )
}
