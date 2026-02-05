'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

export function Heritage() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })

    const yBg = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

    return (
        <section ref={ref} className="relative h-screen overflow-hidden flex items-center justify-center">
            {/* Background Image with Parallax */}
            <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
                <Image
                    src="/heritage-rings.jpg"
                    alt="Heritage Background"
                    fill
                    className="object-cover scale-110"
                    priority
                />
            </motion.div>

            {/* Strong Dark Overlay */}
            <div className="absolute inset-0 z-[1] bg-black/70" />

            {/* Content */}
            <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
                {/* Top Decorative Line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="w-32 h-px mx-auto mb-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                />

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    viewport={{ once: true }}
                >
                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, letterSpacing: '0.3em' }}
                        whileInView={{ opacity: 1, letterSpacing: '0.5em' }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-sm md:text-base font-light uppercase mb-8 text-amber-400"
                    >
                        A Legacy of Excellence
                    </motion.p>

                    {/* Main Title - SINCE 1989 */}
                    <div className="mb-8">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight leading-none text-amber-300"
                        >
                            SINCE 1989
                        </motion.h2>
                    </div>

                    {/* Decorative Diamond */}
                    <motion.div
                        initial={{ scale: 0, rotate: 45 }}
                        whileInView={{ scale: 1, rotate: 45 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="w-2 h-2 bg-amber-400 mx-auto mb-8"
                    />

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        viewport={{ once: true }}
                        className="text-lg md:text-xl font-light max-w-2xl mx-auto text-white leading-relaxed tracking-wide"
                    >
                        For over three decades, AURERXA has defined the pinnacle of luxury.
                        <br className="hidden md:block" />
                        <span className="text-amber-400 font-medium">Precision. Passion. Perfection.</span>
                    </motion.p>
                </motion.div>

                {/* Bottom Decorative Line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="w-32 h-px mx-auto mt-12 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                />
            </div>

            {/* Subtle Corner Decorations */}
            <div className="absolute top-12 left-12 w-12 h-12 border-l border-t border-amber-400/40 z-10" />
            <div className="absolute top-12 right-12 w-12 h-12 border-r border-t border-amber-400/40 z-10" />
            <div className="absolute bottom-12 left-12 w-12 h-12 border-l border-b border-amber-400/40 z-10" />
            <div className="absolute bottom-12 right-12 w-12 h-12 border-r border-b border-amber-400/40 z-10" />
        </section>
    )
}
