'use client'

import React, { useRef } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Image from 'next/image'
import { ParallaxScroll } from '@/components/parallax-scroll'
import { motion, useScroll, useTransform } from 'framer-motion'

const FadeInScroll = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
        >
            {children}
        </motion.div>
    )
}

const GoldParticles = ({ count = 15 }: { count?: number }) => (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" style={{ transform: 'translateZ(0)' }}>
        {[...Array(count)].map((_, i) => (
            <motion.div
                key={i}
                initial={{
                    opacity: 0,
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                    opacity: [0, 0.3, 0],
                    y: [null, '-20%', '-40%'],
                    transition: {
                        duration: 12 + Math.random() * 10,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: Math.random() * 5
                    }
                }}
                className="absolute w-[1.2px] h-[1.2px] bg-amber-500/30 rounded-full blur-[0.3px]"
                style={{ willChange: 'transform, opacity' }}
            />
        ))}
    </div>
)

export default function AboutPage() {
    const heroRef = useRef(null)
    const { scrollYProgress: heroScroll } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start']
    })

    const yBg = useTransform(heroScroll, [0, 1], [0, 150])
    const yText = useTransform(heroScroll, [0, 1], [0, 80])
    const opacityFade = useTransform(heroScroll, [0, 0.8], [1, 0])
    const scaleHero = useTransform(heroScroll, [0, 1], [1, 1.05])

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-500/50 overflow-x-hidden">
            <Navbar />

            {/* Global Smoothness Overlays */}
            <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.02] bg-[url('/scanline.png')] bg-repeat" />
            <div className="fixed inset-0 z-50 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />

            {/* Hero Section */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden" style={{ transform: 'translateZ(0)' }}>
                <motion.div style={{ y: yBg, scale: scaleHero, willChange: 'transform' }} className="absolute inset-0 z-0">
                    <Image
                        src="/photo_6066572646712807057_y.jpg"
                        alt="Resting Hands"
                        fill
                        className="object-cover opacity-30 grayscale contrast-125 brightness-[0.4] object-top md:object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                </motion.div>

                <GoldParticles count={25} />

                <motion.div style={{ y: yText, opacity: opacityFade, willChange: 'transform, opacity' }} className="relative z-20 text-center max-w-7xl px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-6"
                    >
                        <span className="text-amber-500 text-[10px] md:text-xs tracking-[0.8em] uppercase font-bold block mb-4">
                            The AURERXA Legacy
                        </span>
                        <h1 className="text-6xl md:text-[10rem] font-serif font-black tracking-tighter leading-[0.8] italic">
                            BUILT ON <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700">CRAFT.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-white/40 text-xs md:text-sm tracking-[0.4em] font-light italic mt-10">
                            Rooted in respect. Forged in resilience.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            <main className="relative z-10">
                {/* Section 1: The Father's Journey */}
                <section className="py-24 md:py-40 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
                        <FadeInScroll>
                            <div className="space-y-8 md:space-y-12">
                                <h2 className="text-5xl md:text-7xl font-serif font-bold italic leading-tight tracking-tighter group">
                                    A Story of <br />
                                    <span className="text-amber-500 relative inline-block">
                                        Big Dreams.
                                        <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-700 group-hover:w-full" />
                                    </span>
                                </h2>
                                <div className="w-16 h-[1px] bg-amber-500/30" />
                                <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed italic border-l-2 border-amber-500/10 pl-8">
                                    Our story begins with a child forced to grow up too soon.
                                    At just **8 or 9 years old**, driven by the weight of poverty, he left home to find work.
                                    He mastered his art through 50 years of honest labor.
                                </p>
                            </div>
                        </FadeInScroll>

                        <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group border border-white/5 bg-neutral-900 shadow-2xl rounded-sm" style={{ transform: 'translateZ(0)' }}>
                            <ParallaxScroll offset={20} className="h-full w-full">
                                <Image
                                    src="/photo_6066572646712807064_y.jpg"
                                    alt="Senior Artist Bapan Hembromb"
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-90 group-hover:opacity-100 object-center scale-105"
                                />
                            </ParallaxScroll>
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-8 left-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                                <p className="text-amber-500 text-[10px] tracking-[0.5em] font-bold uppercase mb-1">Founding Artisan</p>
                                <h3 className="text-2xl font-serif italic font-bold">Bapan Hembromb</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: The Monopoly Struggle */}
                <section className="relative py-32 md:py-48 overflow-hidden bg-neutral-950/20">
                    <GoldParticles count={10} />
                    <div className="max-w-5xl mx-auto px-6 text-center relative z-20">
                        <FadeInScroll>
                            <div className="space-y-12 md:space-y-16">
                                <span className="text-amber-500/40 text-xs tracking-[1em] uppercase font-bold">The Industry Reality</span>
                                <p className="text-3xl md:text-5xl font-serif italic text-white/90 leading-tight tracking-tight">
                                    "For generations, traditional goldsmith shops held <span className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.1)]">strict monopolies</span>, forbidding Bengali artisans from selling directly to the world."
                                </p>
                                <div className="space-y-8 max-w-3xl mx-auto">
                                    <div className="w-px h-20 bg-gradient-to-b from-amber-500/30 to-transparent mx-auto" />
                                    <p className="text-lg md:text-xl text-white/40 font-light tracking-wide leading-relaxed italic">
                                        <span className="block text-white/80 mb-4 not-italic font-medium underline decoration-amber-500/10 underline-offset-8">"The creators were silenced."</span>
                                        Their hands created the beauty, but the system ensured they remained invisible.
                                    </p>
                                </div>
                            </div>
                        </FadeInScroll>
                    </div>
                </section>

                {/* Section 3: The Birth of AURERXA */}
                <section className="py-24 md:py-40 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
                        <div className="order-2 md:order-1 relative aspect-[3/4] md:aspect-square overflow-hidden group border border-white/5 bg-neutral-900 shadow-2xl rounded-sm" style={{ transform: 'translateZ(0)' }}>
                            <ParallaxScroll offset={30} direction="down" className="h-full w-full">
                                <Image
                                    src="/832831ea-66ff-4efd-8186-4b4f69e1094d.jpg"
                                    alt="Forging integrity"
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 brightness-75 opacity-90 group-hover:opacity-100 object-top scale-105"
                                />
                            </ParallaxScroll>
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-1000" />
                            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 p-6 md:p-10 bg-black/60 backdrop-blur-3xl border-l-4 border-amber-500">
                                <p className="text-white font-serif text-2xl md:text-3xl italic tracking-tighter leading-none">Handcrafted Honor.</p>
                                <p className="text-amber-500/60 text-[10px] uppercase tracking-[0.4em] font-bold mt-4">The Mission</p>
                            </div>
                        </div>

                        <FadeInScroll delay={0.1}>
                            <div className="order-1 md:order-2 space-y-8 md:space-y-12">
                                <h2 className="text-5xl md:text-7xl font-serif font-bold italic leading-tight tracking-tighter">
                                    Born to <br />
                                    <span className="text-amber-500">Change.</span>
                                </h2>
                                <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed italic border-l border-white/5 pl-8">
                                    AURERXA was born to change the status quo. We believe the person who creates beauty deserves honor,
                                    fair pay, and recognition. No exploitation.
                                </p>
                                <div className="space-y-6 pt-6">
                                    <p className="text-white/40 italic text-base leading-loose">
                                        Unlike brands that inflate costs for profit, we believe in fairness — for our craftsmen and our customers.
                                    </p>
                                </div>
                            </div>
                        </FadeInScroll>
                    </div>
                </section>

                {/* Section 4: Craftsmen are Family */}
                <section className="relative min-h-[80vh] flex items-center py-32 md:py-0 overflow-hidden" style={{ transform: 'translateZ(0)' }}>
                    <div className="absolute inset-0 z-0">
                        <ParallaxScroll offset={80} className="h-full w-full">
                            <Image
                                src="/35b9384a-ab6d-4958-a3aa-d7d5668b6137.jpg"
                                alt="Our Craftsmen"
                                fill
                                className="object-cover opacity-15 grayscale brightness-50 object-center scale-105"
                                style={{ willChange: 'transform' }}
                            />
                        </ParallaxScroll>
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
                        <GoldParticles count={15} />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <FadeInScroll>
                            <div className="h-fit bg-black/60 md:bg-black/40 backdrop-blur-2xl border border-white/5 p-10 md:p-14 space-y-10 shadow-3xl rounded-sm ring-1 ring-white/5">
                                <h2 className="text-5xl md:text-7xl font-serif font-black italic tracking-tighter leading-[0.9]">
                                    They are <br />
                                    <span className="text-amber-500">Family.</span>
                                </h2>
                                <div className="space-y-8">
                                    <p className="text-xl md:text-2xl text-white/80 font-light leading-snug italic">
                                        Worked with <span className="text-white font-medium">thousands of craftsmen</span>, together delivering <span className="text-white font-medium">millions of pieces</span>.
                                    </p>
                                    <div className="w-16 h-px bg-amber-500/30" />
                                    <p className="text-lg md:text-xl text-amber-500 font-medium italic tracking-tight leading-relaxed">
                                        "Most importantly, we do not see them as workers or employees. They are family."
                                    </p>
                                </div>
                            </div>
                        </FadeInScroll>

                        <div className="hidden lg:flex flex-col gap-12 justify-center py-10">
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="relative w-[450px] aspect-[2/3] overflow-hidden border border-white/5 group shadow-2xl mx-auto rounded-sm"
                                style={{ transform: 'translateZ(0)' }}
                            >
                                <ParallaxScroll offset={20} className="h-full w-full">
                                    <Image
                                        src="/451c3977-ad4e-4b7d-a918-730286647544.jpg"
                                        alt="Senior Artist Bapan Hembromb"
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-90 group-hover:opacity-100 object-center scale-105"
                                    />
                                </ParallaxScroll>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <p className="text-amber-500 text-[10px] tracking-[0.4em] font-bold uppercase mb-2">Senior Artist</p>
                                    <h3 className="text-3xl font-serif text-white font-black italic tracking-tighter">Bapan Hembromb</h3>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 5: The Visionary */}
                <section className="py-32 md:py-48 bg-neutral-950 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
                            <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden border border-white/5 shadow-2xl group rounded-sm" style={{ transform: 'translateZ(0)' }}>
                                <ParallaxScroll offset={20} className="h-full w-full">
                                    <Image
                                        src="/ceo.jpg"
                                        alt="Nijam Shaikh - Founder & CEO"
                                        fill
                                        className="object-cover object-top filter contrast-[1.1] grayscale transition-all duration-1000 scale-105 group-hover:scale-100 group-hover:grayscale-0"
                                    />
                                </ParallaxScroll>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/10 to-transparent pointer-events-none" />
                                <div className="absolute bottom-10 left-10 md:bottom-12 md:left-12">
                                    <p className="text-amber-500 text-xs tracking-[0.5em] font-bold uppercase mb-4">The Visionary</p>
                                    <h3 className="text-4xl md:text-5xl font-serif text-white font-black italic tracking-tighter leading-none">Nijam Shaikh</h3>
                                </div>
                            </div>

                            <FadeInScroll>
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <span className="text-amber-500/60 uppercase tracking-[0.5em] text-xs font-bold block">Foundation & Leadership</span>
                                        <h2 className="text-5xl md:text-7xl font-serif font-black italic tracking-tighter text-white leading-[0.8]">
                                            Founder <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-600">CEO.</span>
                                        </h2>
                                    </div>
                                    <div className="w-24 h-[1px] bg-amber-500/20" />
                                    <div className="space-y-10 text-xl text-white/70 font-light leading-relaxed italic">
                                        <p className="border-l-2 border-amber-500/10 pl-10">
                                            "My journey began not in a corporate office, but on the humble streets. Starting at just nine years old, I learned that the true value of gold lies not in its weight, but in the hands that shape it."
                                        </p>
                                        <div className="space-y-6 opacity-60 text-lg">
                                            <p>Today, Nijam Shaikh leads a family of thousands, bringing respect back to craftsmanship.</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeInScroll>
                        </div>
                    </div>
                </section>

                {/* Final Conclusion */}
                <section className="py-48 px-6 text-center relative overflow-hidden" style={{ transform: 'translateZ(0)' }}>
                    <GoldParticles count={20} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

                    <FadeInScroll>
                        <div className="max-w-4xl mx-auto space-y-12 relative z-20">
                            <div className="h-[1px] w-20 bg-amber-500/20 mx-auto" />
                            <h2 className="text-5xl md:text-8xl font-serif font-black text-white italic tracking-tighter leading-none">
                                Integrity in <br />
                                <span className="text-amber-500">Every Shine.</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light italic max-w-2xl mx-auto">
                                Every piece you wear carries decades of experience and a promise — that true luxury is not just about shine, but about integrity.
                            </p>

                            <div className="pt-24 space-y-6">
                                <p className="text-3xl md:text-5xl font-serif italic text-white tracking-widest opacity-80">
                                    Respect, Handcrafted.
                                </p>
                                <p className="text-amber-500 tracking-[0.8em] font-bold uppercase text-[10px]">
                                    — Team AURERXA —
                                </p>
                            </div>
                        </div>
                    </FadeInScroll>
                </section>
            </main>

            <Footer />
        </div>
    )
}
