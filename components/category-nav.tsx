'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const categories = [
    { label: 'All Jewellery', href: '/collections', iconId: 'aCPWW0PJ102K' }, // All
    { label: 'Gold', href: '/collections?material=gold', iconId: '16356' }, // Gold bar
    { label: 'Diamond', href: '/collections?material=diamond', iconId: 'FrcEOQDge9Hy' }, // Diamond
    { label: 'Kids', href: '/collections?gender=Kids', iconId: 'J2uuDL01xwUL' }, // Rocking Horse (Kids)
    { label: 'Earrings', href: '/collections?type=Earring', iconId: 'ksXSIChGyK69' }, // Earring
    { label: 'Rings', href: '/collections?type=Ring', iconId: '5z5Rvj2F4jZB' }, // Ring
    { label: 'Daily Wear', href: '/collections?occasion=daily', iconId: '9960' }, // Sparkle/Daily
    { label: 'Collections', href: '/collections', iconId: '121367' }, // Shop/Box
    { label: 'Wedding', href: '/collections?occasion=wedding', iconId: 'GUr9QmddhC6I' }, // Heart
    { label: 'Gifting', href: '/collections?occasion=gift', iconId: '337' }, // Star/Gift
]

export function CategoryNav() {
    const pathname = usePathname()
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout

        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Hide on scroll down, show on scroll up
            if (currentScrollY < 50) {
                setIsVisible(true)
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false)
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true)
            }

            setLastScrollY(currentScrollY)

            // Reveal instantly when scrolling stops
            clearTimeout(scrollTimeout)
            scrollTimeout = setTimeout(() => {
                setIsVisible(true)
            }, 50) // Very small delay for "instant" feel
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(scrollTimeout)
        }
    }, [lastScrollY])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed top-20 md:top-24 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 h-20 md:h-24 flex items-center overflow-hidden"
                >
                    <div className="max-w-7xl mx-auto px-4 md:px-6 w-full overflow-x-auto no-scrollbar">
                        <div className="flex items-center justify-between min-w-max md:min-w-0 gap-6 md:gap-8">
                            {categories.map((cat) => {
                                const isActive = pathname === cat.href

                                return (
                                    <Link
                                        key={cat.label}
                                        href={cat.href}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 group transition-all duration-500 min-w-[70px] md:min-w-[80px]",
                                            isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <div className="relative h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-all duration-500 group-hover:scale-110">
                                            <img
                                                src={`https://img.icons8.com/?size=100&id=${cat.iconId}&format=png&color=${isActive ? 'BF9B65' : '999999'}`}
                                                alt={cat.label}
                                                className={cn(
                                                    "w-6 h-6 md:w-8 md:h-8 transition-all duration-500 dark:invert-0",
                                                    !isActive && "opacity-60"
                                                )}
                                            />
                                            {isActive && (
                                                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-premium-sans font-medium text-center whitespace-nowrap transition-colors duration-500",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )}>
                                            {cat.label}
                                        </span>
                                    </Link>
                                )
                            })}

                            {/* More Button */}
                            <button className="flex flex-col items-center justify-center gap-2 group opacity-60 hover:opacity-100 transition-all duration-500 min-w-[70px] md:min-w-[80px]">
                                <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full transition-all duration-500 group-hover:rotate-180">
                                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </div>
                                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-premium-sans font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                    More
                                </span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
