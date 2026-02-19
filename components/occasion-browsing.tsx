'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { sanitizeImagePath } from '@/lib/utils'

const occasions = [
    {
        name: 'Wedding',
        slug: 'wedding',
        image: '/pexels-vikashkr50-27155546.jpg',
        title: 'Grandeur for the Big Day'
    },
    {
        name: 'Daily Wear',
        slug: 'daily',
        image: '/sama-hosseini-mSaYvzTy4-0-unsplash.jpg',
        title: 'Everyday Luxury'
    },
    {
        name: 'Celebrate',
        slug: 'occasions',
        image: '/valentines-day-still-life-design_23-2149246309.avif',
        title: 'Celebrate Every Occasion'
    }
]

export function OccasionBrowsing() {
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

    const yHeader = useTransform(smoothProgress, [0, 1], [80, -80])
    const opacityHeader = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section ref={sectionRef} className="py-24 md:py-48 bg-background overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    style={{ y: yHeader, opacity: opacityHeader }}
                    className="text-center mb-16 md:mb-32 space-y-4"
                >
                    <span className="text-primary text-xs tracking-[0.5em] font-bold uppercase block">Life's Milestones</span>
                    <h2 className="text-4xl md:text-8xl font-serif font-black italic text-foreground tracking-tighter leading-none mb-4">
                        Celebrate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/60 to-primary">Every Occasion.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {occasions.map((occ, idx) => {
                        const yCard = useTransform(smoothProgress, [0, 1], [120 * (idx + 1), -120 * (idx + 1)])
                        const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.95, 1, 0.95])

                        return (
                            <motion.div
                                key={occ.name}
                                style={{ y: yCard, scale }}
                                className="relative group aspect-[16/10] md:aspect-[4/5] overflow-hidden border border-border bg-card shadow-2xl"
                            >
                                <Image
                                    src={sanitizeImagePath(occ.image)}
                                    alt={occ.name}
                                    fill
                                    className="object-cover transition-transform duration-1000 scale-100 group-hover:scale-115"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-700" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <Link href={`/collections/${occ.slug}`} className="space-y-4">
                                        <h3 className="text-white font-serif text-3xl md:text-5xl italic tracking-tight group-hover:text-primary transition-colors duration-500">
                                            {occ.name}
                                        </h3>
                                        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold group-hover:text-white/70 transition-colors">
                                            {occ.title}
                                        </p>
                                    </Link>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
