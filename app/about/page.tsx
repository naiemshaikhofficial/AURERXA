'use client'

import React, { useRef } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Image from 'next/image'
import { ParallaxScroll } from '@/components/parallax-scroll'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function AboutPage() {
    const heroRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    })

    // Deep "Black Edition" Parallax Transforms
    const yBg = useTransform(scrollYProgress, [0, 1], [0, 300])
    const yText = useTransform(scrollYProgress, [0, 1], [0, 150])
    const opacityFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
    const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 1.15])

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/50">
            <Navbar />

            {/* Global Black Edition Overlay */}
            <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] bg-[url('/scanline.png')] bg-repeat mix-blend-overlay" />
            <div className="fixed inset-0 z-50 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.95)]" />

            {/* Hero Section: Built on Craft */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div style={{ y: yBg, scale: scaleHero }} className="absolute inset-0 z-0">
                    <Image
                        src="/photo_6066572646712807057_y.jpg"
                        alt="Resting Hands"
                        fill
                        className="object-cover opacity-40 grayscale contrast-125 brightness-[0.3] object-top md:object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                </motion.div>

                {/* Floating Particles */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {[...Array(40)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
                            animate={{
                                opacity: [0, 0.4, 0],
                                y: [null, '-20%', '-40%'],
                                transition: { duration: 8 + Math.random() * 12, repeat: Infinity, ease: 'linear', delay: Math.random() * 5 }
                            }}
                            className="absolute w-[1.5px] h-[1.5px] bg-amber-500/40 rounded-full blur-[0.5px]"
                        />
                    ))}
                </div>

                <motion.div style={{ y: yText, opacity: opacityFade }} className="relative z-20 text-center max-w-7xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                    >
                        <span className="text-amber-500 text-[10px] md:text-xs tracking-[0.6em] uppercase font-bold block mb-4">
                            The AURERXA Legacy
                        </span>
                        <h1 className="text-6xl md:text-[11rem] font-serif font-black tracking-tighter leading-[0.85] italic">
                            BUILT ON <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-700">CRAFT.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-white/50 text-sm md:text-base tracking-[0.2em] font-light italic mt-8">
                            Rooted in respect. Forged in resilience.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Narrative Sections */}
            <main className="relative z-10">
                {/* Section 1: The Father's Journey */}
                <section className="py-20 md:py-40 px-6 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="space-y-6 md:space-y-8"
                        >
                            <h2 className="text-4xl md:text-6xl font-serif font-bold italic leading-tight">
                                A Story of <br />
                                <span className="text-amber-500">Big Dreams.</span>
                            </h2>
                            <div className="w-16 h-[1px] bg-amber-500/50" />
                            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
                                Our story begins with a child forced to grow up too soon.
                                My father came from an extremely humble background—a home where survival was the only priority.
                                At just **8 or 9 years old**, driven by the weight of poverty, he left home to find work.
                                He learned the craft from various places, picking up the art of jewelry making wherever he could,
                                mastering his art through 50 years of honest labor and dedication.
                            </p>
                        </motion.div>

                        <div className="relative aspect-[3/4] overflow-hidden group border border-white/5 bg-neutral-900 shadow-2xl">
                            <ParallaxScroll offset={50} scaleOffset={0.15} className="h-full w-full">
                                <Image
                                    src="/451c3977-ad4e-4b7d-a918-730286647544.jpg"
                                    alt="Artisan Craftsmanship"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 opacity-60 group-hover:opacity-100 object-top"
                                />
                            </ParallaxScroll>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </section>

                {/* Section 2: The Painful Reality (Scroll Break) */}
                <section className="py-24 md:py-32 bg-neutral-950/80 border-y border-white/5 relative">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="space-y-8 md:space-y-12"
                        >
                            <p className="text-2xl md:text-4xl font-serif italic text-white/90 leading-snug">
                                "Many small artisans — the true backbone of this industry — were rarely valued the way they deserved."
                            </p>
                            <p className="text-base md:text-lg text-white/50 font-light tracking-widest leading-loose max-w-2xl mx-auto">
                                Their hands created beauty, but their efforts were not always respected.
                                Their payments were often delayed or underpaid. We saw the pain behind the polish.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Section 3: The Birth of AURERXA */}
                <section className="py-20 md:py-40 px-6 relative">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
                        <div className="order-2 md:order-1 relative aspect-[4/5] md:aspect-square overflow-hidden group border border-white/5 bg-neutral-900">
                            <ParallaxScroll offset={60} direction="down" scaleOffset={0.1} className="h-full w-full">
                                <Image
                                    src="/832831ea-66ff-4efd-8186-4b4f69e1094d.jpg"
                                    alt="Forging integrity"
                                    fill
                                    className="object-cover grayscale brightness-75 opacity-70 object-center"
                                />
                            </ParallaxScroll>
                            <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 p-4 md:p-6 bg-black/40 backdrop-blur-xl border-l-2 border-amber-500">
                                <p className="text-white font-serif text-xl md:text-2xl italic tracking-tight">Handcrafted Honor.</p>
                                <p className="text-amber-500/60 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold mt-2">The Mission</p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            className="order-1 md:order-2 space-y-6 md:space-y-8"
                        >
                            <h2 className="text-4xl md:text-6xl font-serif font-bold italic leading-tight">
                                Born to <br />
                                <span className="text-amber-500">Change.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
                                AURERXA was born to change the status quo. We believe the person who creates beauty deserves honor,
                                fair pay, and recognition. Every artisan we work with receives the making charges they truly deserve
                                — no exploitation, no undervaluing talent.
                            </p>
                            <p className="text-white/40 italic text-sm md:text-base">
                                Unlike many brands that inflate making charges for profit, we believe in fairness — both for our
                                craftsmen and for our customers.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Section 4: Craftsmen are Family */}
                <section className="relative min-h-[70vh] md:min-h-screen flex items-center py-20 md:py-0">
                    <div className="absolute inset-0 z-0">
                        <ParallaxScroll offset={120} scaleOffset={0.2} className="h-full w-full">
                            <Image
                                src="/35b9384a-ab6d-4958-a3aa-d7d5668b6137.jpg"
                                alt="Our Craftsmen"
                                fill
                                className="object-cover opacity-20 grayscale brightness-50 object-top"
                            />
                        </ParallaxScroll>
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-black/95 md:bg-black/80 backdrop-blur-3xl border border-white/10 p-8 md:p-12 lg:p-20 space-y-8 md:space-y-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        >
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold italic tracking-tighter">
                                They are <br />
                                <span className="text-amber-500 underline decoration-amber-500/20 underline-offset-8">Family.</span>
                            </h2>
                            <p className="text-lg md:text-xl lg:text-2xl text-white/80 font-light leading-relaxed italic">
                                Over the decades, we have worked with <span className="text-white font-medium">thousands of craftsmen</span>, together delivering <span className="text-white font-medium">millions of pieces of jewelry</span> to the world.
                            </p>
                            <p className="text-base md:text-lg text-white/40 font-light italic tracking-widest leading-relaxed">
                                Most importantly, we do not see them as workers or employees. They are family. Because without them, there is no AURERXA.
                            </p>
                        </motion.div>

                        <div className="hidden lg:flex flex-col gap-6 justify-center">
                            <div className="relative h-72 aspect-[3/4] overflow-hidden border border-white/5">
                                <Image src="/ec354a72-24f4-415b-af0c-f96b278e43ae.jpg" alt="Hands" fill className="object-cover grayscale opacity-60 object-center" />
                            </div>
                            <div className="relative h-72 aspect-[3/4] overflow-hidden border border-white/5 ml-12">
                                <Image src="/e33d5d87-edcb-48b6-af62-978811e21455.jpg" alt="Machines" fill className="object-cover grayscale opacity-60 object-center" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: The Visionary - CEO Section */}
                <section className="py-24 md:py-48 bg-black relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                            <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden border border-white/10 shadow-2xl">
                                <ParallaxScroll offset={40} scaleOffset={0.05} className="h-full w-full">
                                    <Image
                                        src="/ceo.jpg"
                                        alt="Nijam Shaikh - Founder & CEO"
                                        fill
                                        className="object-cover object-top filter contrast-[1.1] grayscale hover:grayscale-0 transition-all duration-1000"
                                    />
                                </ParallaxScroll>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12">
                                    <p className="text-amber-500 text-sm md:text-base tracking-[0.4em] font-bold uppercase mb-2">The Visionary</p>
                                    <h3 className="text-3xl md:text-5xl font-serif text-white font-bold italic">Nijam Shaikh</h3>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5 }}
                                className="space-y-8 md:space-y-12"
                            >
                                <div className="space-y-4 md:space-y-6">
                                    <span className="text-amber-500/60 uppercase tracking-[0.5em] text-xs font-bold">Foundation & Leadership</span>
                                    <h2 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter text-white leading-[0.9]">
                                        Founder <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">& CEO.</span>
                                    </h2>
                                </div>
                                <div className="w-20 h-[2px] bg-amber-500" />
                                <div className="space-y-6 md:space-y-8 text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
                                    <p>
                                        "My journey began not in a corporate office, but on the humble streets where every rupee was earned with sweat.
                                        Starting at just nine years old, I learned that the true value of gold lies not in its weight,
                                        but in the hands that shape it."
                                    </p>
                                    <p className="text-base md:text-lg text-white/50 border-l border-amber-500/30 pl-6">
                                        Today, Nijam Shaikh leads a family of thousands, having overseen the creation of millions of handcrafted masterpieces.
                                        He leads AURERXA with the same resilience that defined his early years.
                                        His mission remains unchanged: to bring respect back to craftsmanship and to ensure
                                        that every piece carries the weight of integrity.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    {/* Background Decorative Element */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/[0.02] to-transparent pointer-events-none" />
                </section>

                {/* Conclusion: Handcrafted Respect */}
                <section className="py-40 md:py-60 px-6 text-center relative overflow-hidden">
                    {/* Atmospheric Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-amber-500/[0.03] rounded-full blur-[100px] md:blur-[150px] pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2 }}
                        className="max-w-3xl mx-auto space-y-8 md:space-y-12"
                    >
                        <div className="h-px w-20 bg-amber-500/50 mx-auto" />
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white italic tracking-tight">
                            Integrity in <br />
                            <span className="text-amber-500">Every Shine.</span>
                        </h2>
                        <p className="text-lg md:text-2xl text-white/70 leading-relaxed font-light italic">
                            Every piece you wear carries decades of experience, honest labor, and a promise —
                            that true luxury is not just about shine, but about integrity.
                        </p>

                        <div className="pt-12 md:pt-20 space-y-4 md:space-y-6">
                            <p className="text-2xl md:text-5xl font-serif italic text-white tracking-widest">
                                Respect, Handcrafted.
                            </p>
                            <p className="text-amber-500 tracking-[0.8em] font-bold uppercase text-[10px] md:text-sm">
                                — Team AURERXA
                            </p>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
