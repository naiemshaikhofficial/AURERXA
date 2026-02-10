'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const timelineEvents = [
    {
        year: '1989',
        title: 'The Inception',
        description: 'Founded in a small atelier in Jaipur, AURERXA began with a singular vision: to craft jewelry that transcends time. Our first collection was a tribute to the royal heritage of Rajasthan, reimagined for the modern era.',
    },
    {
        year: '1995',
        title: 'Global Recognition',
        description: 'Our signature "Celestial" collection debuted in Paris, marking our entry into the international luxury market. The use of rare, ethically sourced gemstones set a new standard for craftsmanship.',
    },
    {
        year: '2008',
        title: 'Sustainable Luxury',
        description: 'Pioneering a new path, we committed to 100% conflict-free diamonds and recycled gold. We believe true luxury lies in responsibility towards our planet and its people.',
    },
    {
        year: '2015',
        title: 'The Digital Atelier',
        description: 'Bringing the bespoke experience online. We launched our virtual consultation service, allowing clients from around the world to co-create their dream pieces with our master artisans.',
    },
    {
        year: '2024',
        title: 'A New Era',
        description: 'Rebranding to "Techtread Enterprises" while keeping the soul of AURERXA alive. Embracing technology with AI-driven design and blockchain authentication for every piece.',
    },
]

export function Timeline() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    return (
        <div ref={containerRef} className="relative py-20 md:py-40 overflow-hidden">
            {/* Central Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2">
                <motion.div
                    className="absolute top-0 left-0 right-0 bg-primary w-full origin-top"
                    style={{ scaleY: scrollYProgress, height: '100%' }}
                />
            </div>

            <div className="container mx-auto px-4 relative">
                {timelineEvents.map((event, index) => (
                    <TimelineItem key={index} event={event} index={index} />
                ))}
            </div>
        </div>
    )
}

function TimelineItem({ event, index }: { event: typeof timelineEvents[0]; index: number }) {
    const isEven = index % 2 === 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`relative flex flex-col md:flex-row items-start md:items-center mb-16 md:mb-32 ${isEven ? 'md:flex-row-reverse' : ''
                }`}
        >
            {/* Date/Year - Opposite Side */}
            <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-start pl-8' : 'md:justify-end pr-8'} mb-2 md:mb-0`}>
                <span className="text-6xl md:text-8xl font-serif font-bold text-muted-foreground/10 select-none">
                    {event.year}
                </span>
            </div>

            {/* Center Dot */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-background border-2 border-primary rounded-full z-10 top-8 md:top-1/2 md:-translate-y-1/2 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />

            {/* Content */}
            <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                <h3 className="text-2xl font-serif text-foreground mb-3">{event.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                    {event.description}
                </p>
            </div>
        </motion.div>
    )
}
