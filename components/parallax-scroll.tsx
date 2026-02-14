'use client'

import { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

interface ParallaxScrollProps {
    children: ReactNode
    offset?: number // Distance to move in pixels
    direction?: 'up' | 'down'
    className?: string
    stiffness?: number
    damping?: number
    scaleOffset?: number // Amount to scale (e.g., 0.1 for 10%)
    opacityOffset?: number // Amount to fade (e.g., 0.5 for 50%)
    rotateOffset?: number // Amount to rotate in degrees
    blur?: boolean // Add blur effect
}

export function ParallaxScroll({
    children,
    offset = 50,
    direction = 'up',
    className = '',
    stiffness = 100,
    damping = 30,
    scaleOffset = 0,
    opacityOffset = 0,
    rotateOffset = 0,
    blur = false
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

    // Rotation transform
    const rotateValue = useTransform(scrollYProgress, [0, 0.5, 1], [-rotateOffset, 0, rotateOffset])

    // Blur transform
    const blurValue = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [blur ? 5 : 0, 0, 0, blur ? 5 : 0])

    // Apply spring for smoothness - optimized config
    // Removed springs for performance - using raw transforms is much faster
    // const springConfig = { stiffness: 100, damping: 30, mass: 0.5, restDelta: 0.001 }
    // const y = useSpring(yValue, springConfig)
    // const scale = useSpring(scaleValue, springConfig)
    // const opacity = useSpring(opacityValue, springConfig)
    // const rotate = useSpring(rotateValue, springConfig)

    // Create filter string for blur
    const filter = useTransform(blurValue, (value) => `blur(${value}px)`)

    return (
        <motion.div
            ref={ref}
            style={{
                y: yValue,
                scale: scaleValue,
                opacity: opacityValue,
                rotate: rotateValue,
                filter: blur ? filter : undefined,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
            }}
            className={`${className} will-change-transform`}
        >
            {children}
        </motion.div>
    )
}
