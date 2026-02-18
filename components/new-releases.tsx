'use client'

import { useRef } from 'react'
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

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const yHeader = useTransform(smoothProgress, [0, 1], [100, -100])
    const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    if (!products || products.length === 0) return null

    return (
        <section ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <motion.div
                    style={{ y: yHeader, opacity }}
                    className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
                >
                    <div className="space-y-4">
                        <span className="text-primary text-xs tracking-[0.3em] uppercase font-premium-sans">
                            Just Arrived
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-foreground italic">
                            New <span className="text-foreground/20">Editions</span>
                        </h2>
                    </div>
                    <div>
                        <Link href="/collections?sort=newest" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <span className="text-xs tracking-widest uppercase">View All</span>
                            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground/40 transition-colors">
                                <Plus size={14} />
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Horizontal Scroll Carousel with slide animation */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: PREMIUM_EASE }}
                    className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
                >
                    {products.map((product, i) => (
                        <div key={product.id} className="flex-shrink-0 w-[280px] md:w-[320px] snap-center">
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
