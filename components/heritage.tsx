'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import Image from 'next/image'
import { fadeInUp, staggerContainer, PREMIUM_EASE } from '@/lib/animation-constants'

export function Heritage() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })

    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
    const yBg = useSpring(useTransform(scrollYProgress, [0, 1], ['-20%', '20%']), springConfig)
    const scaleBg = useSpring(useTransform(scrollYProgress, [0, 1], [1.1, 1.3]), springConfig)
    const opacityBg = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.6, 0.4]), springConfig)

    return (
        <section ref={ref} className="relative min-h-[50vh] md:h-screen overflow-hidden flex items-center justify-center bg-background py-12 md:py-0">

            {/* Background Image with Cinematic Parallax */}
            <motion.div style={{ y: yBg, scale: scaleBg, opacity: opacityBg }} className="absolute inset-0 z-0">
                <Image
                    src="/photo_6066572646712807057_y.jpg"
                    alt="Heritage Background"
                    fill
                    className="object-cover brightness-[0.4]"
                    priority
                    sizes="100vw"
                />
            </motion.div>

            {/* Precision Vignette - Always dark for text readability */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/90 via-transparent to-black/90" />
            <div className="absolute inset-0 z-[1] bg-black/20" />

            {/* Content */}
            <div className="relative z-10 text-center text-white px-6 max-w-7xl mx-auto">
                <div className="space-y-8 md:space-y-16">
                    {/* Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: PREMIUM_EASE }}
                        className="space-y-4 md:space-y-6 flex flex-col items-center"
                    >
                        <span className="px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md text-[10px] md:text-xs font-premium-sans text-white/80 uppercase tracking-[0.3em]">
                            The Legacy
                        </span>
                    </motion.div>

                    {/* Main Title - SINCE 1989 - BOLD */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2, ease: PREMIUM_EASE }}
                        className="text-6xl md:text-[12rem] leading-none font-serif font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 italic drop-shadow-2xl"
                    >
                        LEGACY
                    </motion.h2>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4, ease: PREMIUM_EASE }}
                        className="max-w-3xl mx-auto space-y-12 border-l-4 border-primary pl-8 md:pl-12 text-left bg-gradient-to-r from-black/50 to-transparent p-8 backdrop-blur-sm"
                    >
                        <p className="text-lg md:text-2xl font-medium text-white/90 leading-relaxed tracking-wide">
                            "We don't just craft jewelry. We forge <span className="text-primary">respect</span>."
                        </p>
                        <p className="text-sm md:text-base font-light text-white/50 leading-loose tracking-widest italic">
                            Born from a child's resilience. Starting at just 9 years old, my father mastered
                            the craft through 50 years of honest labor. We honor those hands today,
                            ensuring fairness for the makers and integrity for the wearers.
                            Every spark is rooted in respect.
                        </p>
                    </motion.div>
                </div>
            </div>

        </section>
    )
}
