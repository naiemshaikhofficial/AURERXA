'use client'

import { useRef, ReactNode, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface ScrollRevealProps {
    children: ReactNode
    animation?: 'fade' | 'slide-up' | 'slide-right' | 'slide-left' | 'scale' | 'rotate' | 'blur'
    delay?: number
    duration?: number
    className?: string
    once?: boolean
    threshold?: number
}

const animationVariants = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    },
    'slide-up': {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    },
    'slide-right': {
        hidden: { opacity: 0, x: -15 },
        visible: { opacity: 1, x: 0 }
    },
    'slide-left': {
        hidden: { opacity: 0, x: 15 },
        visible: { opacity: 1, x: 0 }
    },
    scale: {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    },
    rotate: {
        hidden: { opacity: 0, rotate: -3, scale: 0.97 },
        visible: { opacity: 1, rotate: 0, scale: 1 }
    },
    blur: {
        hidden: { opacity: 0, filter: 'blur(4px)' },
        visible: { opacity: 1, filter: 'blur(0px)' }
    }
}

export function ScrollReveal({
    children,
    animation = 'fade',
    delay = 0,
    duration = 0.4,
    className = '',
    once = true,
    threshold = 0.15
}: ScrollRevealProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, amount: threshold })

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={animationVariants[animation]}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1] // Smoother easing
            }}
            className={`${className} gpu-accelerated`}
        >
            {children}
        </motion.div>
    )
}

// Staggered children animation
interface ScrollRevealStaggerProps {
    children: ReactNode[]
    animation?: 'fade' | 'slide-up' | 'slide-right' | 'slide-left' | 'scale'
    staggerDelay?: number
    className?: string
    once?: boolean
}

export function ScrollRevealStagger({
    children,
    animation = 'slide-up',
    staggerDelay = 0.05,
    className = '',
    once = true
}: ScrollRevealStaggerProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once, amount: 0.15 })

    return (
        <div ref={ref} className={className}>
            {children.map((child, index) => (
                <motion.div
                    key={index}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={animationVariants[animation]}
                    transition={{
                        duration: 0.4,
                        delay: index * staggerDelay,
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="gpu-accelerated"
                >
                    {child}
                </motion.div>
            ))}
        </div>
    )
}
