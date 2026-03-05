'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, sanitizeImagePath } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useSiteConfig } from '@/context/site-config-context'

const DEFAULT_CATEGORIES = [
    { label: 'All Jewelry', href: '/collections', iconId: 'aCPWW0PJ102K' },
    { label: 'Silver', href: '/collections/silver', iconId: '16356' },
    { label: 'Kids', href: '/collections/kids', iconId: 'J2uuDL01xwUL' },
    { label: 'Earrings', href: '/collections/earrings', iconId: 'ksXSIChGyK69' },
    { label: 'Rings', href: '/collections/rings', iconId: '5z5Rvj2F4jZB' },
    { label: 'Daily Wear', href: '/collections/daily', iconId: '9960' },
    { label: 'Collections', href: '/collections', iconId: '121367' },
    { label: 'Wedding', href: '/collections/wedding', iconId: 'GUr9QmddhC6I' },
    { label: 'Gifting', href: '/collections/gift', iconId: '337' },
]

export function CategoryNav() {
    const pathname = usePathname()
    const { categories: dynamicCategories } = useSiteConfig()
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [isInteracting, setIsInteracting] = useState(false)

    // Map dynamic categories to nav items, or fallback to defaults
    const navItems = dynamicCategories.length > 0
        ? dynamicCategories.map((cat: any) => ({
            label: cat.name,
            href: `/collections/${cat.slug}`,
            iconId: DEFAULT_CATEGORIES.find((d: any) => d.label === cat.name)?.iconId || '82711'
        }))
        : DEFAULT_CATEGORIES

    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY

                    if (isInteracting) {
                        setIsVisible(true)
                        ticking = false
                        return
                    }

                    // More stable thresholds to prevent jitter
                    if (currentScrollY < 10) {
                        setIsVisible(true)
                    } else if (Math.abs(currentScrollY - lastScrollY) > 5) { // Add delta threshold
                        if (currentScrollY > lastScrollY && currentScrollY > 150) {
                            setIsVisible(false)
                        } else if (currentScrollY < lastScrollY - 20) {
                            setIsVisible(true)
                        }
                    }

                    setLastScrollY(currentScrollY)
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [lastScrollY, isInteracting])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setIsInteracting(true)}
                    onMouseLeave={() => setIsInteracting(false)}
                    onTouchStart={() => setIsInteracting(true)}
                    onTouchEnd={() => setIsInteracting(false)}
                    className="w-full relative z-40 bg-background/95 backdrop-blur-md border-b border-border/40 h-16 md:h-20 flex items-center overflow-hidden"
                >
                    <div
                        className="w-full overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x"
                        data-lenis-prevent
                    >
                        <div className="flex items-center justify-start gap-4 md:gap-8 px-4 md:px-8 mx-auto w-max min-w-full lg:justify-center">
                            {navItems.map((cat: any) => {
                                const isActive = pathname === cat.href || (cat.href !== '/collections' && pathname.startsWith(cat.href))

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
                                            <Image
                                                src={sanitizeImagePath(`https://img.icons8.com/?size=100&id=${cat.iconId}&format=png&color=${isActive ? 'BF9B65' : '999999'}`)}
                                                alt={cat.label}
                                                width={32}
                                                height={32}
                                                className={cn(
                                                    "w-6 h-6 md:w-8 md:h-8 transition-all duration-500 dark:invert-0 pointer-events-auto",
                                                    !isActive && "opacity-60"
                                                )}
                                                loading="lazy"
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
