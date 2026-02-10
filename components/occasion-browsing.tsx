'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
        name: 'Special Gift',
        slug: 'gift',
        image: '/valentines-day-still-life-design_23-2149246309.avif',
        title: 'Celebrate Every Moment'
    }
]

export function OccasionBrowsing() {
    return (
        <section className="py-24 md:py-48 bg-background overflow-hidden border-y border-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 md:mb-32 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <span className="text-primary text-xs tracking-[0.5em] font-bold uppercase block">Life's Milestones</span>
                        <h2 className="text-4xl md:text-8xl font-serif font-black italic text-foreground tracking-tighter leading-none mb-4">
                            Celebrate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/60 to-primary">Every Occasion.</span>
                        </h2>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {occasions.map((occ, idx) => (
                        <motion.div
                            key={occ.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 1 }}
                            className="relative group aspect-[16/10] md:aspect-[4/5] overflow-hidden border border-border bg-card shadow-2xl"
                        >
                            <Image
                                src={occ.image}
                                alt={occ.name}
                                fill
                                className="object-cover transition-all duration-1000 scale-100 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-500" />

                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <Link href={`/collections?occasion=${occ.slug}`} className="space-y-2">
                                    <h3 className="text-white font-serif text-3xl md:text-4xl italic tracking-tight group-hover:text-primary transition-colors">
                                        {occ.name}
                                    </h3>
                                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold group-hover:text-white/70">
                                        {occ.title}
                                    </p>
                                    <div className="w-12 h-[1px] bg-primary/50 group-hover:w-full transition-all duration-700 mt-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
