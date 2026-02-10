'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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

export function ShopByGender() {
    return (
        <section className="py-24 md:py-48 bg-background overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-32 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <span className="text-primary text-xs tracking-[0.5em] font-bold uppercase block">Tailored Excellence</span>
                        <h2 className="text-5xl md:text-8xl font-serif font-black italic text-foreground tracking-tighter leading-none">
                            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/60 to-primary">Gender.</span>
                        </h2>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-sm md:text-base font-light tracking-widest uppercase italic max-w-xs text-right"
                    >
                        Jewellery for every soul, crafted with absolute precision.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {genderCategories.map((gender, idx) => (
                        <motion.div
                            key={gender.name}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 1 }}
                        >
                            <Link
                                href={`/collections?gender=${gender.slug}`}
                                className="group block relative"
                            >
                                <div className="relative aspect-[3/4] overflow-hidden border border-border bg-card group-hover:border-primary/30 transition-all duration-1000">
                                    <Image
                                        src={gender.image}
                                        alt={gender.name}
                                        fill
                                        className="object-cover transition-all duration-1000 scale-105 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        unoptimized
                                    />

                                    {/* Luxury Overlays */}
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-700" />
                                    <div className="absolute inset-0 border border-border pointer-events-none" />
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                    {/* Content Over Image */}
                                    <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                        <span className="text-primary/80 text-[10px] uppercase tracking-[0.4em] font-bold mb-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                            Explore Collection
                                        </span>
                                        <h3 className="text-white font-serif text-4xl md:text-5xl italic tracking-tighter mb-4 group-hover:text-primary transition-colors duration-500">
                                            {gender.name}
                                        </h3>
                                        <p className="text-white/40 text-xs font-light tracking-wide leading-relaxed group-hover:text-white/70 transition-colors duration-500">
                                            {gender.description}
                                        </p>

                                        <div className="w-0 group-hover:w-full h-[1px] bg-gradient-to-r from-primary/50 to-transparent transition-all duration-1000 mt-6" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
