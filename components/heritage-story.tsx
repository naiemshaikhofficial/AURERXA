'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import Image from 'next/image'
import { PREMIUM_EASE } from '../lib/animation-constants'

const STORY_STAGES = [
    {
        title: "The Vision",
        subtitle: "Born from Resilience",
        description: "Starting at just 9 years old, our founder mastered the craft through 50 years of honest labor. Every piece carries the weight of that dedication.",
        image: "https://images.unsplash.com/photo-1544365558-da3989f6d494?q=80&w=2000&auto=format&fit=crop",
        align: "right"
    },
    {
        title: "The Craft",
        subtitle: "Precision in Every Spark",
        description: "We don't just set stones; we forge respect. Our artisans focus on the soul of the material, ensuring that every facet reflects perfection.",
        image: "https://images.unsplash.com/photo-1573408302185-1d6199320e8d?q=80&w=2000&auto=format&fit=crop",
        align: "left"
    },
    {
        title: "The Legacy",
        subtitle: "A Future of Honor",
        description: "We honor the hands that make, and the hearts that wear. Every spark is rooted in a heritage that spans half a century of excellence.",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop",
        align: "right"
    }
]

export function HeritageStory() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    return (
        <section ref={containerRef} className="relative bg-black">
            {STORY_STAGES.map((stage, idx) => (
                <StoryStage key={idx} stage={stage} index={idx} total={STORY_STAGES.length} />
            ))}
        </section>
    )
}

function StoryStage({ stage, index, total }: { stage: typeof STORY_STAGES[0], index: number, total: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    const y = useSpring(useTransform(scrollYProgress, [0, 1], [100, -100]), { stiffness: 100, damping: 30 })
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])

    return (
        <div ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Parallax */}
            <motion.div
                style={{ scale, opacity }}
                className="absolute inset-0 z-0"
            >
                <Image
                    src={stage.image}
                    alt={stage.title}
                    fill
                    className="object-cover brightness-[0.3]"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </motion.div>

            {/* Content Container */}
            <div className={`relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col ${stage.align === 'right' ? 'md:items-end text-right' : 'md:items-start text-left'}`}>
                <motion.div
                    style={{ y }}
                    className="max-w-2xl space-y-4 md:space-y-8"
                >
                    <div className="space-y-2">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: PREMIUM_EASE }}
                            className="inline-block text-[10px] md:text-xs font-premium-sans text-primary uppercase tracking-[0.4em]"
                        >
                            {stage.subtitle}
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2, ease: PREMIUM_EASE }}
                            className="text-4xl xs:text-5xl md:text-8xl font-serif font-medium text-white italic tracking-tighter"
                        >
                            {stage.title}
                        </motion.h2>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4, ease: PREMIUM_EASE }}
                        className="text-sm md:text-xl font-light text-white/60 leading-relaxed tracking-wide max-w-md md:max-w-none ml-auto"
                    >
                        {stage.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.6, ease: PREMIUM_EASE }}
                        className="pt-4"
                    >
                        <div className={`h-[1px] w-24 bg-primary/40 ${stage.align === 'right' ? 'ml-auto' : 'mr-auto'}`} />
                    </motion.div>
                </motion.div>
            </div>

            {/* Stage Counter */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <span className="text-[10px] font-premium-sans text-white/20 tracking-widest uppercase">
                    Chapter {index + 1}
                </span>
                <div className="flex gap-2">
                    {STORY_STAGES.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 transition-all duration-500 rounded-full ${i === index ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
