'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

export interface CategoryBrowsingProps {
    categories: any[]
}

export function CategoryBrowsing({ categories }: CategoryBrowsingProps) {
    const containerRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const yTitle = useTransform(smoothProgress, [0, 1], [150, 0])
    const ySubtitle = useTransform(smoothProgress, [0, 1], [80, 0])
    const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 0.4, 0.8, 1])

    return (
        <section ref={containerRef} className="py-24 md:py-48 bg-background text-foreground overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header with Parallax Blending */}
                <div className="text-center mb-24 md:mb-40 space-y-8">
                    <div className="space-y-6">
                        <motion.span
                            style={{ y: ySubtitle, opacity }}
                            className="text-primary/60 text-[10px] tracking-[0.8em] font-bold uppercase block"
                        >
                            Curated Selection
                        </motion.span>
                        <motion.h2
                            style={{ y: yTitle, opacity }}
                            className="text-5xl md:text-9xl font-serif font-black italic text-foreground tracking-tighter leading-none mb-6"
                        >
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/40 to-primary">Perfect Match.</span>
                        </motion.h2>
                    </div>

                    <Link href="/collections" className="group block">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground text-[10px] md:text-xs font-light tracking-[0.4em] uppercase italic group-hover:text-primary transition-colors inline-flex items-center gap-2"
                        >
                            Shop by Categories
                            <div className="w-8 h-[1px] bg-primary/30 group-hover:w-12 group-hover:bg-primary transition-all duration-700" />
                        </motion.div>
                    </Link>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                        >
                            <Link
                                href={`/collections/${cat.slug}`}
                                className="group block relative"
                            >
                                <div className="relative aspect-[4/5] overflow-hidden border border-border bg-card group-hover:border-primary/30 transition-[border-color,box-shadow] duration-700 shadow-2xl will-change-transform">
                                    <Image
                                        src={cat.image_url || '/placeholder.webp'}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 scale-105 group-hover:scale-110 will-change-transform"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />

                                    {/* Luxury Overlays */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
                                    <div className="absolute inset-0 border border-border pointer-events-none" />

                                    {/* Content Over Image */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <h3 className="text-white font-serif text-2xl italic tracking-tight group-hover:text-primary transition-colors duration-500 mb-2">
                                            {cat.name}
                                        </h3>
                                        <div className="w-0 group-hover:w-full h-[1px] bg-primary/50 transition-all duration-700" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {/* "+10 Categories" Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="hidden lg:block h-full"
                    >
                        <Link
                            href="/collections"
                            className="group block relative h-full"
                        >
                            <div className="relative aspect-[4/5] bg-card/40 border border-primary/20 border-dashed p-8 flex flex-col justify-center text-center transition-all duration-700 group-hover:bg-card group-hover:border-primary/40 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                                <span className="text-primary text-5xl md:text-7xl font-serif font-black italic drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform duration-700">10+</span>
                                <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-[0.4em] mt-6 font-bold group-hover:text-foreground transition-colors">
                                    Categories to <br /> Explore
                                </span>
                                <div className="mt-8 flex justify-center">
                                    <div className="w-12 h-[1px] bg-primary/30 group-hover:w-20 group-hover:bg-primary/70 transition-all duration-700" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
