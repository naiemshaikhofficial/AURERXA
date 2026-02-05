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
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 0.6])

    return (
        <section ref={ref} className="relative h-[80vh] overflow-hidden flex items-center justify-center">
            <motion.div style={{ y: yBg }} className="absolute inset-0 z-0">
                <Image
                    src="/heritage-rings.jpg"
                    alt="Heritage Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/60" />
            </motion.div>

            <div className="relative z-10 text-center text-white px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-xl md:text-2xl font-light tracking-[0.5em] uppercase mb-4 text-white drop-shadow-lg">
                        Crafting Excellence
                    </h2>
                    <div className="overflow-hidden">
                        <motion.h3
                            initial={{ y: "100%" }}
                            whileInView={{ y: 0 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            viewport={{ once: true }}
                            className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white tracking-tight drop-shadow-2xl"
                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
                        >
                            SINCE 1989
                        </motion.h3>
                    </div>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-8"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-8 text-lg md:text-xl font-light max-w-2xl mx-auto text-white leading-relaxed drop-shadow-lg"
                    >
                        For over three decades, AURERXA has defined the standard of luxury.
                        A legacy built on precision, passion, and the eternal pursuit of perfection.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    )
}
