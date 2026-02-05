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
        <section ref={ref} className="relative min-h-[80vh] md:h-screen overflow-hidden flex items-center justify-center bg-black">
            {/* Cinematic Shutter Reveal */}
            <motion.div
                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-neutral-950 z-20 pointer-events-none"
            />

            {/* Background Image with Cinematic Parallax */}
            <motion.div style={{ y: yBg, scale: scaleBg, opacity: opacityBg }} className="absolute inset-0 z-0">
                <Image
                    src="/heritage-rings.jpg"
                    alt="Heritage Background"
                    fill
                    className="object-cover grayscale contrast-125 brightness-50"
                    priority
                />
            </motion.div>

            {/* Precision "Black Edition" Vignette */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/90 via-transparent to-black/90" />
            <div className="absolute inset-0 z-[1] bg-black/20" />

            {/* Content */}
            <div className="relative z-10 text-center text-white px-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="space-y-16"
                >
                    {/* Subtitle */}
                    <div className="space-y-6 flex flex-col items-center">
                        <span className="px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md text-[10px] md:text-xs font-premium-sans text-white/80 uppercase tracking-[0.3em]">
                            The Legacy
                        </span>
                    </div>

                    {/* Main Title - SINCE 1989 - BOLD */}
                    <h2 className="text-8xl md:text-[12rem] leading-none font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 italic drop-shadow-2xl">
                        1989
                    </h2>

                    {/* Description */}
                    <div className="max-w-3xl mx-auto space-y-12 border-l-4 border-amber-500 pl-8 md:pl-12 text-left bg-gradient-to-r from-black/50 to-transparent p-8 backdrop-blur-sm">
                        <p className="text-lg md:text-2xl font-medium text-white/90 leading-relaxed tracking-wide">
                            "We don't just craft jewelry. We forge <span className="text-amber-500">identity</span>."
                        </p>
                        <p className="text-sm md:text-base font-light text-white/50 leading-loose tracking-widest italic">
                            For over three decades, AURERXA has defined the pinnacle of luxury.
                            From the dust of the workshop to the glare of the spotlight.
                        </p>
                    </div>
                </motion.div>
            </div>

        </section>
    )
}
