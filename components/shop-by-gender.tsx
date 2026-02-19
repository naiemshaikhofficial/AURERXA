'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { sanitizeImagePath } from '@/lib/utils'

const genderCategories = [
    {
        name: 'Women',
        slug: 'women',
        image: '/ardy-arjun-fQtnMrW1NAQ-unsplash.jpg',
        description: 'Timeless elegance for the modern queen.'
    },
    {
        name: 'Men',
        slug: 'men',
        image: '/alberto-rodriguez-santana-EU-KuIDEbKU-unsplash.jpg',
        description: 'Refined craftsmanship for the classic gentleman.'
    },
    {
        name: 'Unisex',
        slug: 'unisex',
        image: '/Untitled_design_70.webp',
        description: 'Dainty treasures for our precious little ones.'
    }
]

export interface ShopByGenderProps {
    genderStats?: Record<string, number>
}

export function ShopByGender({ genderStats }: ShopByGenderProps) {
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const yHeader = useTransform(smoothProgress, [0, 1], [100, -100])
    const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section ref={sectionRef} className="py-24 md:py-48 bg-background overflow-hidden relative">
            {/* Background Accent for Vibrancy */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    style={{ y: yHeader, opacity }}
                    className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-32 gap-6"
                >
                    <div className="space-y-4">
                        <span className="text-primary text-xs tracking-[0.5em] font-bold uppercase block">Tailored Excellence</span>
                        <h2 className="text-5xl md:text-8xl font-serif font-black italic text-foreground tracking-tighter leading-none">
                            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/60 to-primary">Gender.</span>
                        </h2>
                    </div>
                    <p className="text-muted-foreground text-sm md:text-base font-light tracking-widest uppercase italic max-w-xs text-right">
                        Jewellery for every soul, crafted with absolute precision.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {genderCategories.map((gender, idx) => {
                        const yCard = useTransform(smoothProgress, [0, 1], [150 * (idx + 1), -150 * (idx + 1)])
                        const count = genderStats?.[gender.slug] || 0

                        return (
                            <motion.div
                                key={gender.name}
                                style={{ y: yCard }}
                            >
                                <Link
                                    href={`/collections/${gender.slug}`}
                                    className="group block relative"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden border border-border bg-card group-hover:border-primary/30 transition-colors duration-500 shadow-2xl">
                                        <Image
                                            src={sanitizeImagePath(gender.image)}
                                            alt={gender.name}
                                            fill
                                            className="object-cover transition-transform duration-1000 scale-105 group-hover:scale-115"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />

                                        {/* Luxury Overlays */}
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-700" />
                                        <div className="absolute inset-0 border border-border pointer-events-none" />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                        {/* Content Over Image */}
                                        <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-primary/80 text-[10px] uppercase tracking-[0.4em] font-bold opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                                    Explore Collection
                                                </span>
                                                {count > 0 && (
                                                    <span className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-light border border-white/10 px-2 py-1">
                                                        {count}+ Masterpieces
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-white font-serif text-4xl md:text-5xl italic tracking-tighter mb-4 group-hover:text-primary transition-colors duration-500">
                                                {gender.name}
                                            </h3>
                                            <p className="text-white/40 text-xs font-light tracking-wide leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                                                {gender.description}
                                            </p>
                                        </div>

                                        {/* Animated Corner Accent */}
                                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-primary/20 border-r-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
