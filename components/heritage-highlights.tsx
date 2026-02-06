'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ParallaxScroll } from './parallax-scroll'

export function HeritageHighlights() {
    return (
        <section className="py-24 md:py-48 bg-black relative overflow-hidden border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
                    <div className="order-2 lg:order-1 relative">
                        <div className="grid grid-cols-2 gap-8 md:gap-12">
                            <div className="space-y-8 md:space-y-12">
                                <div className="relative aspect-[2/3] overflow-hidden border border-amber-500/10 group shadow-2xl">
                                    <ParallaxScroll offset={15} className="h-full w-full">
                                        <Image
                                            src="/451c3977-ad4e-4b7d-a918-730286647544.jpg"
                                            alt="Senior Artist Bapan Hembromb"
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 object-center scale-105"
                                        />
                                    </ParallaxScroll>
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                                    <div className="absolute bottom-4 left-4 right-4 text-left">
                                        <p className="text-amber-500/80 text-[8px] uppercase tracking-[0.3em] font-bold">Senior Artist</p>
                                        <p className="text-white font-serif text-sm italic">Bapan Hembromb</p>
                                    </div>
                                </div>
                                <div className="relative aspect-[2/3] overflow-hidden border border-amber-500/10 group shadow-2xl">
                                    <ParallaxScroll offset={-10} className="h-full w-full">
                                        <Image
                                            src="/photo_6066572646712807069_y.jpg"
                                            alt="Master Artisan"
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 object-center scale-105"
                                        />
                                    </ParallaxScroll>
                                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                                </div>
                            </div>
                            <div className="pt-16 space-y-8 md:space-y-12">
                                <div className="relative aspect-[2/3] overflow-hidden border border-amber-500/10 group shadow-2xl">
                                    <ParallaxScroll offset={20} className="h-full w-full">
                                        <Image
                                            src="/832831ea-66ff-4efd-8186-4b4f69e1094d.jpg"
                                            alt="Forging Gold"
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 object-center scale-105"
                                        />
                                    </ParallaxScroll>
                                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                                </div>
                                <div className="relative aspect-[2/3] overflow-hidden border border-amber-500/20 group font-serif p-8 bg-neutral-900/80 flex flex-col justify-center text-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] border-dashed">
                                    <span className="text-amber-500 text-4xl md:text-6xl font-bold italic drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">1000+</span>
                                    <span className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.3em] mt-3 font-bold">Master Artisans</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2 }}
                        className="order-1 lg:order-2 space-y-8 md:space-y-12"
                    >
                        <div className="space-y-4 md:space-y-6">
                            <span className="text-amber-500 text-xs tracking-[0.5em] font-bold uppercase">The Scale of Respect</span>
                            <h2 className="text-4xl md:text-7xl font-serif font-black italic text-white tracking-tighter leading-[0.9]">
                                Millions of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Masterpieces.</span>
                            </h2>
                        </div>

                        <div className="space-y-6 md:space-y-8 text-lg md:text-xl text-white/50 font-light leading-relaxed italic">
                            <p>
                                What started as a child's dream in 1989 has grown into a family of
                                <span className="text-white"> over a thousand master craftsmen.</span> Together, we have
                                meticulously handcrafted millions of jewelry pieces, each carrying a promise of fair pay and absolute integrity.
                            </p>
                            <p className="text-base md:text-lg border-l border-amber-500/30 pl-6">
                                Rooted in a 50-year heritage of resilience. We don't just sell jewelry; we honor the legacy of those who make it.
                            </p>
                        </div>

                        <div className="pt-8">
                            <button className="px-8 py-4 border border-amber-500/30 text-amber-500 text-xs uppercase tracking-[0.3em] font-bold hover:bg-amber-500 hover:text-black transition-all duration-500">
                                Discover Our Story
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
