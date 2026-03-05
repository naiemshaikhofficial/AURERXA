'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard, Product } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PREMIUM_EASE } from '@/lib/animation-constants'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface TopStylesClientProps {
    dataMap: Record<string, Product[]>
}

const FILTERS = [
    { label: 'ALL', slug: 'all' },
    { label: 'EARRINGS', slug: 'earrings' },
    { label: 'CHAINS', slug: 'chains' },
    { label: 'RINGS', slug: 'rings' },
    { label: 'BRACELETS', slug: 'bracelets' },
]

export function TopStylesClient({ dataMap }: TopStylesClientProps) {
    const [activeFilter, setActiveFilter] = useState(FILTERS[0])
    const currentProducts = dataMap[activeFilter.slug] || []

    const handleFilterChange = (filter: typeof FILTERS[0]) => {
        setActiveFilter(filter)
    }

    return (
        <section className="py-16 md:py-32 bg-background relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-12 space-y-4">
                    <h2 className="text-2xl md:text-5xl font-serif font-medium tracking-tight uppercase">
                        AURERXA <span className="italic">Top Styles</span>
                    </h2>
                    <div className="h-px w-16 bg-primary/40 mx-auto" />
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-16 px-4">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.slug}
                            onClick={() => handleFilterChange(filter)}
                            className={cn(
                                "px-5 md:px-7 py-2 md:py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-700 border",
                                activeFilter.slug === filter.slug
                                    ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                    : "bg-transparent text-foreground/40 border-white/5 hover:border-white/20 hover:text-foreground"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFilter.slug}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.02, y: -10 }}
                            transition={{ duration: 0.4, ease: PREMIUM_EASE }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
                        >
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product, index) => (
                                    <ProductCard
                                        key={`${activeFilter.slug}-${product.id}`}
                                        product={product}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-32 text-center">
                                    <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-foreground/20 font-bold italic">
                                        Curating Masterpieces...
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* View All Button */}
                <div className="mt-20 text-center">
                    <Link href={`/collections${activeFilter.slug !== 'all' ? `?search=${activeFilter.slug}` : ''}`}>
                        <Button
                            variant="outline"
                            className="px-10 py-7 border-border hover:border-primary hover:bg-primary/5 transition-all duration-700 rounded-none text-[10px] md:text-xs uppercase tracking-[0.4em] font-black group bg-transparent text-foreground/60 hover:text-foreground"
                        >
                            Explore Full Collection
                            <ChevronRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform duration-500 text-primary" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
