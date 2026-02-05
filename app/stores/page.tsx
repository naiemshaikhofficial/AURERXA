'use client'

import { useRef } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MapPin, Phone, Mail, Clock, Navigation, Sparkles } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function StoresPage() {
    const store = {
        name: "Nijam Gold Works",
        address: "Captain Lakshmi Chowk, Rangargalli Near Sikchi Hospital Sangamner, Maharashtra 422605",
        phone: "+91 93910 32677",
        email: "hello@aurerxa.com",
        hours: "Mon-Sat: 11AM-9PM",
        mapLink: "https://www.google.com/maps/place/Nijam+Gold+works/data=!4m2!3m1!1s0x0:0xe8958ae639e82931?sa=X&ved=1t:2428&ictx=111",
        lat: 19.5761,
        lng: 74.2058
    }

    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    })

    const yMap = useTransform(scrollYProgress, [0, 1], [-50, 50])

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Global Atmosphere - REMOVED */}

            <main className="pt-40 pb-40">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    {/* Header */}
                    <div className="text-center mb-32 relative">
                        <div className="space-y-6">
                            <p className="text-amber-500/80 text-[10px] tracking-[0.8em] font-premium-sans uppercase flex items-center justify-center gap-4">
                                <Sparkles className="w-3 h-3" />
                                Flagship Presence
                                <Sparkles className="w-3 h-3" />
                            </p>
                            <div className="w-16 h-[1px] bg-amber-500/30 mx-auto" />
                        </div>

                        <h1 className="mt-12 text-5xl md:text-8xl font-serif font-bold tracking-tight text-white italic">
                            Our <span className="text-amber-500">Boutique</span>
                        </h1>

                        <p className="mt-12 text-sm md:text-base text-white/40 max-w-2xl mx-auto font-light leading-loose tracking-widest italic">
                            A sanctuary of excellence situated in the heart of Sangamner, where legacy meets the art of fine jewelry.
                        </p>
                    </div>

                    <motion.div
                        ref={containerRef}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="group bg-neutral-950 border border-white/5 hover:border-amber-500/20 transition-all duration-1000 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 h-full">
                                {/* Visual Showcase */}
                                <div className="md:col-span-1 lg:col-span-2 relative min-h-[500px] bg-neutral-900 overflow-hidden">
                                    {/* Cinematic Shutter Reveal */}
                                    <motion.div
                                        initial={{ clipPath: 'inset(100% 0 0 0)' }}
                                        whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute inset-0 bg-black z-10 pointer-events-none"
                                    />

                                    {/* Rolex-style placeholder visual */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#004028]/40 via-black to-black z-0" />
                                    <motion.div style={{ y: yMap }} className="absolute inset-0 flex items-center justify-center">
                                        <MapPin className="w-24 h-24 text-white/5 group-hover:text-amber-500/10 transition-colors duration-1000" />
                                    </motion.div>
                                    <div className="absolute bottom-12 left-12 z-20 space-y-4">
                                        <p className="text-[9px] font-premium-sans tracking-[0.4em] text-amber-500 uppercase">Sangamner Boutique</p>
                                        <h2 className="font-serif text-3xl md:text-4xl text-white italic tracking-wide">
                                            {store.name}
                                        </h2>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/5 m-8" />
                                </div>

                                {/* Boutique Info */}
                                <div className="md:col-span-1 lg:col-span-3 p-12 md:p-20 flex flex-col justify-center space-y-16">
                                    <div className="space-y-12">
                                        <div className="flex items-start gap-8 group/item">
                                            <div className="p-4 border border-white/5 group-hover/item:border-amber-500/30 transition-colors duration-500">
                                                <MapPin className="w-5 h-5 text-amber-500/60" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-amber-500/40 text-[9px] uppercase tracking-[0.4em] font-premium-sans">The Address</p>
                                                <span className="text-white/60 font-light text-xs leading-[2] tracking-widest italic block">{store.address}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-8 group/item">
                                            <div className="p-4 border border-white/5 group-hover/item:border-amber-500/30 transition-colors duration-500">
                                                <Clock className="w-5 h-5 text-amber-500/60" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-amber-500/40 text-[9px] uppercase tracking-[0.4em] font-premium-sans">Operating Hours</p>
                                                <span className="text-white/60 font-light text-xs tracking-widest italic block">{store.hours}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-8 group/item">
                                            <div className="p-4 border border-white/5 group-hover/item:border-amber-500/30 transition-colors duration-500">
                                                <Phone className="w-5 h-5 text-amber-500/60" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-amber-500/40 text-[9px] uppercase tracking-[0.4em] font-premium-sans">Private Line</p>
                                                <a href={`tel:${store.phone}`} className="text-white/60 hover:text-white transition-colors text-xs tracking-[0.2em] block">
                                                    {store.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <a
                                        href={store.mapLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-4 w-full py-6 bg-white text-black text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-amber-500 hover:text-white transition-all duration-700 shadow-2xl"
                                    >
                                        <Navigation className="w-3.5 h-3.5" />
                                        Plan Your Visit
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Royal Appointment CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-40 max-w-5xl mx-auto overflow-hidden relative group"
                    >
                        <div className="bg-[#004028] px-12 py-24 md:py-32 text-center relative overflow-hidden">
                            {/* Decorative Grid Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:50px_50px]" />
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                            <div className="relative z-10 space-y-12">
                                <div className="space-y-4">
                                    <p className="text-amber-500/80 text-[10px] tracking-[0.8em] uppercase font-premium-sans">
                                        Bespoke Service
                                    </p>
                                    <div className="w-12 h-[1px] bg-amber-500/30 mx-auto" />
                                </div>

                                <h3 className="text-4xl md:text-7xl font-serif font-bold text-white tracking-tight italic">
                                    Private <span className="text-amber-500">Consultation</span>
                                </h3>

                                <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto font-light leading-relaxed tracking-widest italic">
                                    Experience personalized attention with our master jewelry curators in a setting designed for absolute privacy and discretion.
                                </p>

                                <a
                                    href="mailto:hello@aurerxa.com?subject=Private Boutique Consultation"
                                    className="inline-block px-16 py-6 border border-white/20 hover:bg-white hover:text-black transition-all duration-700 text-[10px] font-premium-sans tracking-[0.5em] uppercase text-white"
                                >
                                    Request Appointment
                                </a>
                            </div>

                            {/* Corner Flourishes */}
                            <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-white/5 m-12" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-white/5 m-12" />
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
