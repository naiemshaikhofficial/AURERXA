'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { fadeInUp, staggerContainer, PREMIUM_EASE } from '@/lib/animation-constants'
import { ArrowRight, Quote } from 'lucide-react'

export function DesignerPick() {
    return (
        <section className="py-24 md:py-40 px-4 md:px-6 lg:px-12 bg-neutral-950 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
                >
                    {/* Visual Side */}
                    <motion.div variants={fadeInUp} className="relative aspect-[4/5] group">
                        <div className="absolute inset-0 border border-amber-500/20 -translate-x-4 -translate-y-4 transition-transform duration-700 group-hover:translate-x-0 group-hover:translate-y-0" />
                        <div className="relative h-full w-full overflow-hidden border border-border">
                            <Image
                                src="/pexels-the-glorious-studio-3584518-29245554.webp"
                                alt="Designer's Pick"
                                fill
                                className="object-cover transition-transform [transition-duration:2s] group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                        </div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div variants={fadeInUp} className="space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-amber-500/60">
                                <Quote className="w-8 h-8 fill-current" />
                                <span className="text-[10px] uppercase tracking-[0.6em] font-bold">Curator's Masterpiece</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-serif font-black italic text-white leading-tight">
                                "Jewelry is the <span className="text-amber-500">silent authority</span> of a woman's presence."
                            </h2>
                        </div>

                        <div className="space-y-8">
                            <p className="text-neutral-400 font-light leading-relaxed max-w-lg text-sm md:text-base">
                                This season, we find our inspiration in the interplay of shadow and brilliance. Our master artisans spent over 240 hours hand-setting each solitaire to ensure it captures light from every conceivable angle. It's not just a piece; it's a legacy revived.
                            </p>

                            <div className="flex flex-col space-y-4">
                                <p className="text-amber-500/80 font-serif italic text-lg">— Naiem Shaikh, Lead Curator</p>
                                <div className="h-px w-12 bg-amber-500/40" />
                            </div>
                        </div>

                        <Link href="/collections" className="group inline-flex items-center gap-4 pt-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white border-b border-amber-500/20 pb-2 transition-all group-hover:border-amber-500">
                                Explore The Edit
                            </span>
                            <div className="w-10 h-10 rounded-full border border-amber-500/20 flex items-center justify-center transition-all group-hover:border-amber-500 group-hover:bg-amber-500/10">
                                <ArrowRight className="w-4 h-4 text-amber-500" />
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
