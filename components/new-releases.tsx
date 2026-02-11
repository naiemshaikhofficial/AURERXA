'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { fadeInUp, staggerContainer } from '@/lib/animation-constants'
import { ProductCard } from '@/components/product-card'

// This would typically be a server component, but we need client-side animation
// We'll accept data as props or fetch in a wrapper
export function NewReleases({ products }: { products: any[] }) {
    const containerRef = useRef<HTMLDivElement>(null)

    if (!products || products.length === 0) return null

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <motion.div variants={fadeInUp} className="space-y-4">
                            <span className="text-primary text-xs tracking-[0.3em] uppercase font-premium-sans">
                                Just Arrived
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif text-foreground italic">
                                New <span className="text-foreground/20">Editions</span>
                            </h2>
                        </motion.div>
                        <motion.div variants={fadeInUp}>
                            <Link href="/collections?sort=newest" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                <span className="text-xs tracking-widest uppercase">View All</span>
                                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground/40 transition-colors">
                                    <Plus size={14} />
                                </div>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Horizontal Scroll Carousel */}
                    <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                        {products.map((product, i) => (
                            <div key={product.id} className="flex-shrink-0 w-[280px] md:w-[320px] snap-center">
                                <ProductCard
                                    product={product}
                                    index={i}
                                    className="h-full border-white/5 bg-neutral-900/40"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
