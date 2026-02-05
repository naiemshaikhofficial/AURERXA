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

    // Deep "Black Edition" Parallax
    const yBg = useTransform(scrollYProgress, [0, 1], [0, 250])
    const yText = useTransform(scrollYProgress, [0, 1], [0, 100])
    const opacityFade = useTransform(scrollYProgress, [0, 0.6], [1, 0])
    const scaleHero = useTransform(scrollYProgress, [0, 1], [1, 1.1])

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/50">
            <Navbar />

            {/* Global Black Edition Overlay */}
            <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] bg-[url('/scanline.png')] bg-repeat mix-blend-overlay" />
            <div className="fixed inset-0 z-50 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />

            {/* Hero Section with Aggressive Parallax */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Layer (Deepest) */}
                <motion.div style={{ y: yBg, scale: scaleHero }} className="absolute inset-0 z-0">
                    <ParallaxScroll scaleOffset={0.2} opacityOffset={0.3} className="h-full w-full">
                        <Image
                            src="/heritage-rings.jpg"
                            alt="Heritage"
                            fill
                            className="object-cover opacity-40 grayscale contrast-125 brightness-50"
                            priority
                        />
                    </ParallaxScroll>
                    {/* Heavy Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
                </motion.div>

                {/* Particle Layer (Floating Dust) - Increased Density */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%'
                            }}
                            animate={{
                                opacity: [0, 0.6, 0],
                                y: [null, '-30%', '-60%'],
                                transition: {
                                    duration: 10 + Math.random() * 15,
                                    repeat: Infinity,
                                    ease: 'linear',
                                    delay: Math.random() * 5
                                }
                            }}
                            className="absolute w-[2px] h-[2px] bg-amber-500/60 rounded-full blur-[0.5px] shadow-[0_0_5px_#f59e0b]"
                        />
                    ))}
                </div>

                {/* Content Layer (Foreground) */}
                <motion.div
                    style={{ y: yText, opacity: opacityFade }}
                    className="relative z-20 text-center max-w-7xl px-6"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-10"
                    >
                        {/* Brand Tag */}
                        <div className="inline-flex items-center gap-4 justify-center mb-6">
                            <div className="h-[1px] w-12 bg-amber-500/50" />
                            <span className="text-amber-500 text-[10px] md:text-xs tracking-[0.5em] uppercase font-bold font-premium-sans">
                                The Origin Story
                            </span>
                            <div className="h-[1px] w-12 bg-amber-500/50" />
                        </div>

                        {/* Massive "Black Edition" Typography */}
                        <div className="relative">
                            <h1 className="text-7xl md:text-[10rem] font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10 italic leading-[0.85] drop-shadow-2xl">
                                FORGED<br />
                                <span className="text-stroke-1 text-transparent bg-clip-text bg-gradient-to-b from-amber-500 to-amber-900/50">IN FIRE</span>
                            </h1>
                        </div>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl font-light text-white/60 tracking-widest leading-relaxed border-l-2 border-amber-500 pl-6 text-left">
                            We don't tell stories. We craft legends from the dust of struggle and the glare of gold.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Narrative Sections with Scroll-Triggered Reveals */}
            <main className="relative z-10">
                {/* Section 1: Humble Beginnings */}
                <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    {/* Background Decorative Glow */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white italic">
                                Humble <br />
                                <span className="text-amber-500">Beginnings</span>
                            </h2>
                            <div className="w-12 h-[1px] bg-amber-500" />
                            <p className="text-lg text-white/70 leading-relaxed font-light italic tracking-wide">
                                We belong to a poor Bengali family who have been serving in the gold industry as workers for generations.
                            </p>
                        </motion.div>

                        <div className="relative aspect-[3/4] bg-neutral-900 border border-white/5 overflow-hidden group shadow-2xl">
                            <ParallaxScroll
                                offset={100}
                                scaleOffset={0.2}
                                opacityOffset={0.3}
                                className="relative h-full w-full"
                            >
                                <Image
                                    src="/pexels-vikashkr50-27155546.jpg"
                                    alt="Bengali Heritage"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 opacity-60 scale-105"
                                />
                            </ParallaxScroll>
                            <div className="absolute inset-0 border border-white/10 m-4 pointer-events-none" />
                        </div>
                    </div>
                </section>

                {/* Section 2: The Struggle */}
                <section className="py-32 px-4 sm:px-6 lg:px-8 bg-neutral-950/50">
                    <div className="max-w-3xl mx-auto text-center space-y-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5 }}
                            className="relative"
                        >
                            <p className="text-2xl md:text-3xl text-white/90 leading-relaxed font-light italic">
                                "My father’s hands were callous and scarred, stained with the polish and dust of gold that didn't belong to him."
                            </p>
                            <div className="mt-8 flex justify-center gap-4">
                                <div className="w-1 h-1 bg-amber-500 rounded-full" />
                                <div className="w-1 h-1 bg-amber-500/50 rounded-full" />
                                <div className="w-1 h-1 bg-amber-500/20 rounded-full" />
                            </div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 2 }}
                            className="text-lg text-white/50 leading-relaxed font-light max-w-2xl mx-auto italic tracking-widest"
                        >
                            Day after day, he would shape dreams for others, while our own home barely had a solid roof.
                            He taught me that gold isn't just a metal—it's patience, it's sacrifice, and it's art.
                        </motion.p>
                    </div>
                </section>

                {/* Section 2.5: The Process (Genuine Manufacturing) */}
                <section className="py-32 px-4 sm:px-6 lg:px-8 relative border-t border-white/5">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 relative aspect-square bg-neutral-900 border border-white/5 overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626947346165-4c2288cadec2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-60 hover:opacity-80 transition-opacity duration-700" />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute bottom-6 left-6 border-l-2 border-amber-500 pl-4">
                                <p className="text-white font-serif text-xl italic">Pure Manufacturing</p>
                                <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Scrap to Finish</p>
                            </div>
                        </div>

                        <motion.div
                            className="order-1 md:order-2 space-y-8"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white italic">
                                The <span className="text-amber-500">Genuine</span> Way
                            </h2>
                            <p className="text-lg text-white/70 leading-relaxed font-light tracking-wide">
                                We are not just a label. We are the <span className="text-white font-medium">manufacturers</span>.
                                Since 1989, we have been collecting raw scrap gold and transforming it into finished luxury ornaments,
                                delivering directly <span className="text-amber-500 font-medium">Shop-to-Shop</span>.
                            </p>
                            <p className="text-lg text-white/50 leading-relaxed font-light italic">
                                "Trust isn't bought. It's forged in the fire, one piece at a time.
                                When you buy from us, you buy directly from the hands that melted the gold."
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Section 3: Rising from the Shadows (Stuck & Scroll Layout) */}
                <section className="relative px-4 sm:px-6 lg:px-8 min-h-[150vh] flex flex-col md:flex-row items-start justify-between">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent pointer-events-none" />

                    {/* Sticky Content Side */}
                    <div className="w-full md:w-1/2 md:sticky md:top-0 md:h-screen flex flex-col justify-center py-20 z-20">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-md space-y-10"
                        >
                            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white italic leading-tight">
                                From Shadows to <br />
                                <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8 italic">Visionaries</span>
                            </h2>
                            <div className="w-20 h-px bg-amber-500/50" />
                            <p className="text-xl text-white/70 font-light leading-relaxed italic tracking-wide">
                                We watched the world sparkle from the shadows of small workshops.
                                But in those shadows, a fire was burning. We didn't just want to build the luxury;
                                we wanted to be the visionaries who defined it.
                            </p>
                        </motion.div>
                    </div>

                    {/* Scrolling/Scaling Image Side */}
                    <div className="w-full md:w-[45%] py-20 md:py-40">
                        <div className="relative aspect-[3/4] bg-neutral-900 border border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <ParallaxScroll
                                offset={150}
                                scaleOffset={0.3}
                                opacityOffset={0.2}
                                className="relative h-full w-full"
                            >
                                <Image
                                    src="/pexels-abhishek-saini-1415858-3847212.jpg"
                                    alt="Luxury Craftsmanship"
                                    fill
                                    className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-1000"
                                />
                            </ParallaxScroll>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                        </div>
                    </div>
                </section>

                {/* Section 4: The Culmination (Diamond) */}
                <section className="py-40 px-4 sm:px-6 lg:px-8 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-black to-[#001a0a]/30 -z-10" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2 }}
                        className="max-w-3xl mx-auto space-y-12"
                    >
                        <h2 className="text-5xl md:text-7xl font-serif font-bold text-white italic tracking-tighter">
                            The <span className="text-amber-500">Diamond</span>
                        </h2>
                        <div className="w-24 h-[1px] bg-amber-500 mx-auto" />
                        <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light italic max-w-2xl mx-auto">
                            AURERXA is the story of rising from the dust to craft the diamond.
                            A legacy forged in the fires of struggle, purely handmade with the soul of Bengal's finest craftsmanship.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1, duration: 1.5 }}
                            className="pt-12"
                        >
                            <p className="text-3xl md:text-4xl font-serif italic text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                                "We craft with our soul, because we know the value of every grain of gold."
                            </p>
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
