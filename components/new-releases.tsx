'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PREMIUM_EASE } from '@/lib/animation-constants'
import { ProductCard } from '@/components/product-card'

// This would typically be a server component, but we need client-side animation
// We'll accept data as props or fetch in a wrapper
export function NewReleases({ products }: { products: any[] }) {
    const sectionRef = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const yHeader = useTransform(smoothProgress, [0, 1], [isMobile ? 0 : 100, isMobile ? 0 : -100])
    const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    if (!products || products.length === 0) return null

    return (
        <section ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-16 gap-6">
                    <motion.div style={{ y: yHeader, opacity }} className="space-y-2 text-left">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 md:w-12 bg-primary/40" />
                            <span className="text-primary text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-bold">JUST ARRIVED</span>
                        </div>
                        <h2 className="text-3xl md:text-8xl font-serif font-black italic text-foreground tracking-tighter leading-none">
                            New <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/40 to-primary">Editions.</span>
                        </h2>
                    </motion.div>
                    <div className="md:opacity-100 opacity-80">
                        <Link href="/collections?sort=newest" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <span className="text-[10px] md:text-xs tracking-widest uppercase">View All</span>
                            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground/40 transition-colors">
                                <Plus size={14} />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Grid Layout (Replaces Horizontal Scroll on Mobile) - Tighter Spacing */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-8"
                >
                    {products.map((product, i) => (
                        <div key={product.id} className="w-full">
                            <ProductCard
                                product={product}
                                index={i}
                                className="h-full border-white/5 bg-neutral-900/40"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
