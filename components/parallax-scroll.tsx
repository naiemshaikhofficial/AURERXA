'use client'

import { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface ParallaxScrollProps {
    children: ReactNode
    offset?: number // Distance to move in pixels
    direction?: 'up' | 'down'
    className?: string
    stiffness?: number
    damping?: number
    scaleOffset?: number // Amount to scale (e.g., 0.1 for 10%)
    opacityOffset?: number // Amount to fade (e.g., 0.5 for 50%)
}

export function ParallaxScroll({
    children,
    offset = 50,
    direction = 'up',
    className = '',
    stiffness = 100,
    damping = 30,
    scaleOffset = 0,
    opacityOffset = 0
}: ParallaxScrollProps) {
    const ref = useRef(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })

    // Movement transform
    const range = direction === 'up' ? [-offset, offset] : [offset, -offset]
    const yValue = useTransform(scrollYProgress, [0, 1], range)

    // Scale transform
    const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1 + scaleOffset, 1])

    // Opacity transform
    const opacityValue = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1 - opacityOffset, 1, 1, 1 - opacityOffset])

    // Apply spring for smoothness
    const springConfig = { stiffness: 45, damping: 35, mass: 1, restDelta: 0.001 }
    const y = useSpring(yValue, springConfig)
    const scale = useSpring(scaleValue, springConfig)
    const opacity = useSpring(opacityValue, springConfig)

    return (
        <motion.div
            ref={ref}
            style={{ y, scale, opacity }}
            className={`${className} will-change-transform`}
        >
            {children}
        </motion.div>
    )
}
