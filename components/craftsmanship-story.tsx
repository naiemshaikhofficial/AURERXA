'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Gem, Hammer, Hourglass } from 'lucide-react'

export function CraftsmanshipStory() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const yBackground = useTransform(scrollYProgress, [0, 1], [0, 150])
    const yHeader = useTransform(scrollYProgress, [0, 0.5], [50, -50])
    const yIcon1 = useTransform(scrollYProgress, [0.1, 0.4], [50, -50])
    const yIcon2 = useTransform(scrollYProgress, [0.3, 0.6], [50, -50])
    const yIcon3 = useTransform(scrollYProgress, [0.5, 0.8], [50, -50])

    return (
        <section ref={containerRef} className="bg-neutral-950 py-16 md:py-48 relative overflow-hidden">
            {/* Background Ambience with Parallax */}
            <motion.div
                style={{ y: yBackground }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-neutral-950 to-neutral-950 opacity-40 pointer-events-none"
            />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    style={{ y: yHeader }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-20 md:mb-32 space-y-4 md:space-y-6"
                >
                    <span className="text-amber-500/60 text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-medium">Why We Are Expensive</span>
                    <h2 className="text-3xl md:text-6xl font-serif text-white/90 italic">The Price of Perfection</h2>
                    <p className="text-white/40 max-w-lg mx-auto leading-relaxed font-light text-[10px] md:text-base">
                        Luxury is not a label. It is a promise of fairness, artistry, and time.
                    </p>
                </motion.div>

                {/* Story Chapters */}
                <div className="space-y-32">

                    {/* Chapter 1: Fair Pricing */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                        className="group flex flex-col md:flex-row gap-8 md:gap-16 items-start"
                    >
                        <motion.div style={{ y: yIcon1 }} className="md:w-1/3 pt-4">
                            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-amber-900/20 group-hover:border-amber-500/30 transition-all duration-700 relative z-10">
                                <Gem className="w-6 h-6 text-white/40 group-hover:text-amber-400 transition-colors duration-500" strokeWidth={1} />
                            </div>
                        </motion.div>
                        <div className="md:w-2/3 space-y-6">
                            <h3 className="text-2xl md:text-3xl font-serif text-white/80 italic">Fairness Rooted in Reality</h3>
                            <div className="space-y-4 text-white/50 font-light leading-relaxed">
                                <p>
                                    Our pricing is not arbitrary. It is a direct reflection of the current market value of gold and diamonds.
                                </p>
                                <p>
                                    We do not inflate costs for branding. Instead, we offer transparency—charging only for the precious materials you invest in and the skilled labor that shapes them. You pay for the asset, not the illusion.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chapter 2: Handcrafted */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                        className="group flex justify-end"
                    >
                        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                            <motion.div style={{ y: yIcon2 }} className="md:w-1/3 pt-4 md:order-last">
                                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-amber-900/20 group-hover:border-amber-500/30 transition-all duration-700 mx-auto md:ml-auto md:mr-0 relative z-10">
                                    <Hammer className="w-6 h-6 text-white/40 group-hover:text-amber-400 transition-colors duration-500" strokeWidth={1} />
                                </div>
                            </motion.div>
                            <div className="md:w-2/3 space-y-6 md:text-right">
                                <h3 className="text-2xl md:text-3xl font-serif text-white/80 italic">The Human Touch</h3>
                                <div className="space-y-4 text-white/50 font-light leading-relaxed">
                                    <p>
                                        Machines create copies; hands create souls.
                                    </p>
                                    <p>
                                        Every curve, every setting, and every polish is executed by the hands of master artisans. This human touch ensures that your piece is not just a product, but a unique work of art, carrying the warmth and dedication of its creator.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Chapter 3: Time */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.8 }}
                        className="group flex flex-col md:flex-row gap-8 md:gap-16 items-start"
                    >
                        <motion.div style={{ y: yIcon3 }} className="md:w-1/3 pt-4">
                            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-amber-900/20 group-hover:border-amber-500/30 transition-all duration-700 relative z-10">
                                <Hourglass className="w-6 h-6 text-white/40 group-hover:text-amber-400 transition-colors duration-500" strokeWidth={1} />
                            </div>
                        </motion.div>
                        <div className="md:w-2/3 space-y-6">
                            <h3 className="text-2xl md:text-3xl font-serif text-white/80 italic">The Gift of Time</h3>
                            <div className="space-y-4 text-white/50 font-light leading-relaxed">
                                <p>
                                    True luxury cannot be rushed.
                                </p>
                                <p>
                                    Weeks, sometimes months, of unseen effort go into a single creation. From the initial sketch to the final quality check, we invest time so that your piece stands the test of time. You are paying for the days of life our artisans dedicate to your excellence.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Footer seal */}
                <div className="mt-32 flex justify-center opacity-30">
                    <span className="text-[9px] uppercase tracking-[0.6em] text-white">Aurerxa Promise</span>
                </div>
            </div>
        </section>
    )
}
