'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { sanitizeImagePath, cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

const occasions = [
    {
        name: 'Party Wear',
        slug: 'party',
        image: '/portrait-woman-wearing-corset-posing-outdoors.jpg',
        subtitle: 'Night Editions'
    },
    {
        name: 'Day Out',
        slug: 'day-out',
        image: '/kateryna-hliznitsova-ceSCZzjTReg-unsplash.jpg',
        subtitle: 'Brunch & Beyond'
    },
    {
        name: 'Date Night',
        slug: 'date-night',
        image: '/smiling-woman-presenting-gift-box-with-ring-man.jpg',
        subtitle: 'Romantic Series'
    },
    {
        name: 'Wedding Wear',
        slug: 'wedding',
        image: '/pexels-vikashkr50-27155546.jpg',
        subtitle: 'Bridal Series'
    },
    {
        name: 'Office Wear',
        slug: 'office',
        image: '/young-beautiful-smiling-brunette-female-nice-trendy-black-business-suit_158538-19399.jpg',
        subtitle: 'Executive Suite',
        position: '20% center'
    },
    {
        name: 'Daily Wear',
        slug: 'daily',
        image: '/sama-hosseini-mSaYvzTy4-0-unsplash.jpg',
        subtitle: 'Minimalist Series'
    }
]

function OccasionCard({ occ, index }: { occ: typeof occasions[0] & { position?: string }, index: number }) {
    const cardRef = useRef<HTMLDivElement>(null)
    const { scrollXProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "end start"]
    })

    // Parallax logic
    const xImage = useTransform(scrollXProgress, [0, 1], ["12%", "-12%"])

    // Staggered layout logic - tighter for smaller cards
    const isEven = index % 2 === 0
    const yOffset = useTransform(scrollXProgress, [0, 1], [isEven ? -20 : 20, isEven ? 20 : -20])

    return (
        <motion.div
            ref={cardRef}
            style={{ y: yOffset }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 w-[48vw] md:w-[40vw] lg:w-[28vw] aspect-[2/3] relative group overflow-hidden snap-start bg-neutral-900"
        >
            <Link href={`/collections?occasion=${occ.slug}`} className="block h-full w-full">
                {/* Parallax Image Container */}
                <div className="absolute inset-0 w-full h-full">
                    <motion.div style={{ x: xImage }} className="absolute inset-0 w-[124%] -left-[12%] h-full">
                        <Image
                            src={sanitizeImagePath(occ.image)}
                            alt={occ.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                            style={{ objectPosition: occ.position || 'center' }}
                            sizes="(max-width: 768px) 48vw, 40vw"
                        />
                    </motion.div>
                </div>

                {/* Elegant Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />

                {/* Bold Content at Bottom Center */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 flex flex-col justify-end items-center text-center">
                    <div className="space-y-1 md:space-y-4 w-full">
                        <span className="text-primary/60 text-[7px] md:text-[10px] uppercase tracking-[0.6em] font-medium block translate-y-4 group-hover:translate-y-0 transition-transform duration-700 opacity-0 group-hover:opacity-100">
                            {occ.subtitle}
                        </span>
                        <h3 className="text-white text-base md:text-6xl font-serif italic tracking-tighter leading-none group-hover:text-primary transition-colors duration-500">
                            {occ.name}
                        </h3>
                        {/* Decorative Line */}
                        <div className="pt-2 md:pt-6 flex justify-center">
                            <div className="h-px w-0 group-hover:w-24 bg-primary transition-all duration-700 ease-out" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export function OccasionBrowsing() {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const { scrollXProgress } = useScroll({
        container: scrollContainerRef
    })

    const scaleX = useSpring(scrollXProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return
        const { scrollLeft, clientWidth } = scrollContainerRef.current
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.4 : scrollLeft + clientWidth * 0.4
        scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }

    return (
        <section className="py-12 md:py-48 bg-background overflow-hidden relative">
            <div className="max-w-[1920px] mx-auto">
                {/* Minimalist Header */}
                <div className="px-6 md:px-12 mb-10 md:mb-20 flex flex-col items-center text-center">
                    <div className="flex items-center gap-4 md:gap-6 mb-3 md:mb-6">
                        <div className="h-px w-8 md:w-12 bg-primary/30" />
                        <span className="text-primary/60 text-[8px] md:text-[10px] uppercase tracking-[0.8em] font-medium">FOR EVERY YOU</span>
                        <div className="h-px w-8 md:w-12 bg-primary/30" />
                    </div>
                    <h2 className="text-2xl md:text-8xl font-serif text-foreground leading-none tracking-tighter uppercase italic opacity-90">
                        Shop <span className="opacity-40">By</span> Occasion.
                    </h2>
                </div>

                {/* Slider Environment */}
                <div className="relative group/container">
                    {/* Floating Controls */}
                    <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-20 flex items-center justify-between px-4 md:px-12">
                        <button
                            onClick={() => scroll('left')}
                            className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 rounded-full bg-background/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/container:opacity-100 transition-all duration-700 hover:bg-primary hover:text-black hover:scale-110"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="pointer-events-auto w-10 h-10 md:w-14 md:h-14 rounded-full bg-background/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover/container:opacity-100 transition-all duration-700 hover:bg-primary hover:text-black hover:scale-110"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Staggered Scroll Container - Reduced padding for better touch initiation */}
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 md:gap-24 pb-16 md:pb-32 px-6 md:px-[10vw] no-scrollbar snap-x snap-proximity pt-8 md:pt-20"
                    >
                        {occasions.map((occ, idx) => (
                            <OccasionCard key={occ.name} occ={occ} index={idx} />
                        ))}

                        {/* End Experience Card */}
                        <div className="flex-shrink-0 w-[48vw] md:w-[40vw] lg:w-[28vw] aspect-[2/3] snap-start">
                            <Link
                                href="/collections"
                                className="h-full w-full border border-white/5 bg-neutral-900/50 flex flex-col items-center justify-center gap-4 md:gap-8 group hover:bg-primary transition-all duration-1000 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="z-10 w-12 h-12 md:w-24 md:h-24 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:border-black/20 group-hover:text-black transition-all duration-700">
                                    <ArrowRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform duration-700" />
                                </div>
                                <div className="z-10 text-center space-y-1 md:space-y-2">
                                    <span className="text-[7px] md:text-[10px] uppercase tracking-[0.5em] font-medium text-white/40 group-hover:text-black/40">Discover more</span>
                                    <h3 className="text-base md:text-3xl font-serif italic text-white group-hover:text-black transition-colors duration-700">The Full Series</h3>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Premium Progress Bar at Bottom */}
                <div className="max-w-md md:max-w-2xl mx-auto px-6 pt-0 md:pt-12">
                    <div className="relative h-px w-full bg-white/10">
                        <motion.div
                            style={{ scaleX, originX: 0 }}
                            className="absolute inset-0 h-full bg-primary"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
