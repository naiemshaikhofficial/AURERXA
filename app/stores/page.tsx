'use client'

import { useRef } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MapPin, Phone, Mail, Clock, Navigation, Sparkles } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function StoresPage() {
    const store = {
        name: "Aurerxa | Nijam Gold Works",
        address: "Jedhe Colony, Rangargalli, Sangamner, Maharashtra 422605",
        phone: "+91 93910 32677",
        email: "Contact@aurerxa.com",
        hours: "Mon-Sat: 10AM-8PM",
        mapLink: "https://maps.app.goo.gl/PdTNoNuey3ecsxkt6",
        lat: 19.5673515,
        lng: 74.207201
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
                            <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                                {/* Map iframe Integration */}
                                <div className="lg:col-span-3 relative min-h-[500px] bg-neutral-900 overflow-hidden group/map">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.400120661953!2d74.207201!3d19.567351499999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdd01d03a70e915%3A0xe8958ae639e82931!2sAurerxa%20%7C%20Nijam%20Gold%20Works!5e0!3m2!1sen!2sin!4v1771769037819!5m2!1sen!2sin"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) contrast(1.2) grayscale(0.2)' }}
                                        allowFullScreen={true}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="absolute inset-0 transition-all duration-1000 grayscale-[0.5] group-hover/map:grayscale-0 brightness-[0.8] group-hover/map:brightness-100"
                                    />
                                    <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/10 m-8 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-white/10 m-8 pointer-events-none" />

                                    {/* Direct Map Button for better usability */}
                                    <div className="absolute bottom-6 right-6 opacity-0 group-hover/map:opacity-100 transition-opacity duration-300">
                                        <a
                                            href={store.mapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-white text-black text-[9px] uppercase tracking-widest font-bold shadow-2xl hover:bg-amber-500 hover:text-white transition-colors"
                                        >
                                            Direct Link →
                                        </a>
                                    </div>
                                </div>

                                {/* Boutique Info */}
                                <div className="lg:col-span-2 p-12 md:p-16 flex flex-col justify-center space-y-12">
                                    <div className="space-y-10">
                                        <div className="space-y-2">
                                            <p className="text-amber-500/40 text-[9px] uppercase tracking-[0.4em] font-premium-sans">Heritage House</p>
                                            <h2 className="font-serif text-3xl text-white italic tracking-wide">{store.name}</h2>
                                        </div>

                                        <div className="flex items-start gap-6 group/item">
                                            <div className="p-3 border border-white/5 group-hover/item:border-amber-500/30 transition-colors duration-500">
                                                <MapPin className="w-4 h-4 text-amber-500/60" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-amber-500/40 text-[8px] uppercase tracking-[0.4em] font-premium-sans">Location</p>
                                                <span className="text-white/60 font-light text-xs leading-[1.8] tracking-widest italic block">{store.address}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 group/item">
                                            <div className="p-3 border border-white/5 group-hover/item:border-amber-500/30 transition-colors duration-500">
                                                <Clock className="w-4 h-4 text-amber-500/60" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-amber-500/40 text-[8px] uppercase tracking-[0.4em] font-premium-sans">Visit Us</p>
                                                <span className="text-white/60 font-light text-xs tracking-widest italic block">{store.hours}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-6 group/item">
                                            <div className="p-3 border border-white/5 group-hover/item:border-amber-500/30 transition-colors duration-500">
                                                <Phone className="w-4 h-4 text-amber-500/60" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-amber-500/40 text-[8px] uppercase tracking-[0.4em] font-premium-sans">Concierge</p>
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
                                        className="inline-flex items-center justify-center gap-4 w-full py-5 bg-white text-black text-[9px] uppercase tracking-[0.4em] font-bold hover:bg-amber-500 hover:text-white transition-all duration-700 shadow-2xl"
                                    >
                                        <Navigation className="w-3 h-3" />
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
                                    href="mailto:Contact@aurerxa.com?subject=Private Boutique Consultation"
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
