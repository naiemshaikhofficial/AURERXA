'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ParallaxSectionProps {
    imgUrl: string
    subheading: string
    heading: string
    children: React.ReactNode
    reverse?: boolean
}

function useParallax(value: MotionValue<number>, distance: number) {
    return useTransform(value, [0, 1], [-distance, distance])
}

export function ParallaxSection({ imgUrl, subheading, heading, children, reverse = false }: ParallaxSectionProps) {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({ target: ref })
    const y = useParallax(scrollYProgress, 300)

    return (
        <section className="min-h-screen flex items-center justify-center overflow-hidden py-24 relative">
            <div className={cn("container px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center gap-12 md:gap-24", reverse ? "md:flex-row-reverse" : "")}>

                {/* Image Container with Parallax */}
                <div className="w-full md:w-1/2 relative h-[60vh] md:h-[80vh] overflow-hidden rounded-sm" ref={ref}>
                    <motion.div style={{ y }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
                        <Image
                            src={imgUrl}
                            alt={heading}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                    </motion.div>
                </div>

                {/* Text Content */}
                <div className="w-full md:w-1/2 flex flex-col space-y-6 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        <span className="text-primary text-xs md:text-sm tracking-[0.3em] uppercase font-medium mb-4 block">
                            {subheading}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif font-light mb-6 text-foreground leading-tight">
                            {heading}
                        </h2>
                        <div className="w-12 h-0.5 bg-primary/40 mx-auto md:mx-0 mb-8" />
                        <div className="text-muted-foreground font-light leading-relaxed text-lg space-y-4">
                            {children}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
