'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    strength?: number
    onClick?: () => void
    disabled?: boolean
}

export function MagneticButton({ children, className, strength = 0.3, onClick, disabled }: MagneticButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return
        const { clientX, clientY } = e
        const { left, top, width, height } = buttonRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 }

        const x = clientX - (left + width / 2)
        const y = clientY - (top + height / 2)

        setPosition({ x: x * strength, y: y * strength })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }

    const { x, y } = position

    return (
        <motion.div
            ref={buttonRef}
            className={cn("relative z-10", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            <div
                onClick={onClick}
                className={cn(
                    "w-full h-full cursor-pointer",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                {children}
            </div>
        </motion.div>
    )
}
