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
}

export function ParallaxScroll({
    children,
    offset = 50,
    direction = 'up',
    className = '',
    stiffness = 100,
    damping = 30
}: ParallaxScrollProps) {
    const ref = useRef(null)

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    })

    // Determine the movement range based on direction
    const range = direction === 'up' ? [-offset, offset] : [offset, -offset]

    const yValue = useTransform(scrollYProgress, [0, 1], range)

    // Apply spring for extra smoothness and premium feel
    const y = useSpring(yValue, {
        stiffness,
        damping,
        restDelta: 0.001
    })

    return (
        <motion.div
            ref={ref}
            style={{ y }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
