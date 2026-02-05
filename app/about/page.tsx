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

    // Parallax transforms for hero layers
    const yBg = useTransform(scrollYProgress, [0, 1], [0, 200])
    const yText = useTransform(scrollYProgress, [0, 1], [0, -50])
    const opacityFade = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            <Navbar />

            {/* Hero Section with Deep Parallax */}
            <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Layer (Deepest) */}
                <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 scale-110">
                    <Image
                        src="/heritage-rings.jpg"
                        alt="Heritage"
                        fill
                        className="object-cover opacity-20 grayscale"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                </motion.div>

                {/* Particle Layer (Floating Dust) */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%'
                            }}
                            animate={{
                                opacity: [0, 0.4, 0],
                                y: [null, '-20%', '-50%'],
                                transition: {
                                    duration: 15 + Math.random() * 15,
                                    repeat: Infinity,
                                    ease: 'linear',
                                    delay: Math.random() * 10
                                }
                            }}
                            className="absolute w-[1.5px] h-[1.5px] bg-amber-500/50 rounded-full blur-[1px]"
                        />
                    ))}
                </div>

                {/* Content Layer (Foreground) */}
                <motion.div
                    style={{ y: yText, opacity: opacityFade }}
                    className="relative z-20 text-center max-w-4xl px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '4rem' }}
                                transition={{ delay: 0.5, duration: 1.5 }}
                                className="h-[1px] bg-amber-500/50"
                            />
                            <p className="text-amber-500 text-xs tracking-[0.6em] uppercase font-premium-sans">
                                The Legacy
                            </p>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-serif font-bold tracking-tighter text-white drop-shadow-2xl italic leading-none">
                            Our <span className="text-amber-500">Story</span>
                        </h1>
                        <p className="text-lg md:text-xl font-light text-white/40 tracking-[0.3em] uppercase italic">
                            Forged in struggle, polished to perfection
                        </p>
                    </motion.div>
                </motion.div>

                {/* Decorative Frame */}
                <div className="absolute inset-10 border border-white/5 pointer-events-none" />
            </section>

            {/* Narrative Sections with Scroll-Triggered Reveals */}
            <main className="relative z-10">
                {/* Section 1: Humble Beginnings */}
                <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
                    {/* Background Decorative Glow */}
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
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

                        <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden group">
                            <ParallaxScroll offset={60} className="relative h-full w-full">
                                <Image
                                    src="/heritage-rings.jpg"
                                    alt="Bengali Craftsmanship"
                                    fill
                                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-60"
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

                {/* Section 3: Rising from the Shadows */}
                <section className="py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    {/* Floating Parallax Line */}
                    <ParallaxScroll offset={100} direction="down" className="absolute top-0 right-10 w-[1px] h-96 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent">
                        <div className="w-full h-full" />
                    </ParallaxScroll>

                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                        <div className="order-2 md:order-1 relative aspect-square bg-neutral-900 border border-white/5">
                            <ParallaxScroll offset={40} className="relative h-full w-full">
                                <Image
                                    src="/heritage-rings.jpg"
                                    alt="Gold Workshop"
                                    fill
                                    className="object-cover opacity-40 grayscale"
                                />
                            </ParallaxScroll>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="order-1 md:order-2 space-y-10"
                        >
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white italic leading-tight">
                                From Shadows to <br />
                                <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8">Visionaries</span>
                            </h2>
                            <p className="text-lg text-white/60 font-light leading-relaxed italic tracking-wide">
                                We watched the world sparkle from the shadows of small workshops.
                                But in those shadows, a fire was burning. We didn't just want to build the luxury;
                                we wanted to be the visionaries who defined it.
                            </p>
                        </motion.div>
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
