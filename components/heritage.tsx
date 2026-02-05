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

    const yBg = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
    const scaleBg = useTransform(scrollYProgress, [0, 1], [1.1, 1.3])
    const opacityBg = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.6, 0.4])

    return (
        <section ref={ref} className="relative min-h-[60vh] md:h-screen overflow-hidden flex items-center justify-center bg-black">
            {/* Cinematic Shutter Reveal */}
            <motion.div
                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-black z-10 pointer-events-none"
            />

            {/* Background Image with Cinematic Parallax */}
            <motion.div style={{ y: yBg, scale: scaleBg, opacity: opacityBg }} className="absolute inset-0 z-0">
                <Image
                    src="/heritage-rings.jpg"
                    alt="Heritage Background"
                    fill
                    className="object-cover grayscale-[0.5] transition-all duration-[2s]"
                    priority
                />
            </motion.div>

            {/* Precision Vignette Overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black via-transparent to-black" />
            <div className="absolute inset-0 z-[1] bg-black/40" />

            {/* Content */}
            <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="space-y-16"
                >
                    {/* Subtitle */}
                    <div className="space-y-6">
                        <p className="text-[10px] md:text-xs font-premium-sans tracking-[0.8em] uppercase text-amber-500/80">
                            A Legacy of Excellence
                        </p>
                        <div className="w-12 h-[1px] bg-amber-500/30 mx-auto" />
                    </div>

                    {/* Main Title - SINCE 1989 */}
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tight text-white/90 italic">
                        1989
                    </h2>

                    {/* Description */}
                    <div className="max-w-2xl mx-auto space-y-12">
                        <p className="text-sm md:text-base font-light text-white/50 leading-[2] tracking-widest italic">
                            For over three decades, AURERXA has defined the pinnacle of luxury, crafting stories that transcend time.
                        </p>

                        <div className="flex items-center justify-center gap-8">
                            <div className="h-[1px] w-12 bg-white/10" />
                            <span className="text-[9px] font-premium-sans tracking-[0.4em] text-amber-500 uppercase">Precision. Passion. Perfection.</span>
                            <div className="h-[1px] w-12 bg-white/10" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Minimalist Grid Corners */}
            <div className="absolute top-20 left-20 w-8 h-[1px] bg-white/10" />
            <div className="absolute top-20 left-20 w-[1px] h-8 bg-white/10" />
            <div className="absolute bottom-20 right-20 w-8 h-[1px] bg-white/10" />
            <div className="absolute bottom-20 right-20 w-[1px] h-8 bg-white/10" />
        </section>
    )
}
