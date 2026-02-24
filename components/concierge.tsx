'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Monitor, Gem, HeartHandshake } from 'lucide-react'

const services = [
    {
        icon: Monitor,
        title: 'Virtual Try-On',
        description: 'Experience our jewelry virtually from the comfort of your home.',
        cta: 'Try Now'
    },
    {
        icon: Gem,
        title: 'Gold Harvest',
        description: 'Join our exclusive gold saving scheme for your future milestones.',
        cta: 'Learn More'
    },
    {
        icon: HeartHandshake,
        title: 'Jewelry Care',
        description: 'Complimentary professional cleaning and inspection services.',
        cta: 'Book Care'
    },
    {
        icon: Calendar,
        title: 'Personalized Visit',
        description: 'Schedule a private consultation at our boutique with a jewelry expert.',
        cta: 'Book Appointment'
    }
]

export function ConciergeServices() {
    return (
        <section className="py-24 md:py-48 bg-background relative overflow-hidden border-y border-border">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-16 md:mb-32 space-y-4">
                    <span className="text-primary text-xs tracking-[0.5em] font-bold uppercase block">Bespoke Concierge</span>
                    <h2 className="text-4xl md:text-8xl font-serif font-black italic text-foreground tracking-tighter leading-none mb-4">
                        Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/60 to-primary">Experiences.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, idx) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-8 border border-border bg-card/30 hover:bg-card transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-primary transition-all duration-700" />

                            <service.icon className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors duration-500 mb-8" strokeWidth={1} />

                            <h3 className="text-foreground font-serif text-2xl italic tracking-tight mb-4 group-hover:text-primary transition-colors">
                                {service.title}
                            </h3>

                            <p className="text-muted-foreground text-xs font-light tracking-wide leading-relaxed mb-10">
                                {service.description}
                            </p>

                            <button className="text-[10px] text-primary uppercase tracking-[0.3em] font-bold border-b border-primary/20 pb-2 group-hover:border-primary transition-all" aria-label={service.cta}>
                                {service.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function FloatingConcierge() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-50"
        >
            <button className="relative group" aria-label="Book a concierge appointment">
                <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 group-hover:opacity-60 transition-opacity animate-pulse" />
                <div className="relative flex items-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 overflow-hidden">
                    <Calendar className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Concierge Appointment</span>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
                </div>
            </button>
        </motion.div>
    )
}
