'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ProductCard, Product } from '@/components/product-card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PREMIUM_EASE } from '@/lib/animation-constants'
import { sanitizeImagePath, cn } from '@/lib/utils'

interface MaterialShowcaseProps {
    title: string
    subtitle: string
    products: Product[]
    materialType: string
    accentColor: string
}

function SectionRow({ title, subtitle, products, materialType, accentColor }: MaterialShowcaseProps) {
    const sectionRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const yHeader = useTransform(smoothProgress, [0, 1], [50, -50])

    return (
        <section ref={sectionRef} className="relative py-12 md:py-24 overflow-hidden bg-neutral-950">
            {/* Background Accent Blur */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none ${accentColor}`} />

            <div className="max-w-[1800px] mx-auto px-6">
                {/* Header */}
                <motion.div
                    style={{ y: yHeader }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-16"
                >
                    <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 md:w-12 bg-amber-500/40" />
                            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">{subtitle}</span>
                        </div>
                        <h2 className="text-3xl md:text-7xl font-serif text-white/90 leading-none tracking-tight italic">
                            {title}
                        </h2>
                    </div>

                    <Link
                        href={`/collections?material_type=${materialType}`}
                        className="group flex items-center gap-3 py-3 px-6 md:py-4 md:px-8 border border-white/5 hover:bg-white hover:text-black transition-all duration-500 rounded-full w-fit"
                    >
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold">Explore Collection</span>
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Horizontal Scroll Area */}
                <div className="relative">
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-10 md:pb-12 no-scrollbar snap-x snap-proximity">
                        {products.map((product, idx) => (
                            <div key={product.id} className="w-[60vw] md:w-[400px] flex-shrink-0 snap-start">
                                <ProductCard
                                    product={product}
                                    index={idx}
                                    className="border-none bg-neutral-900/40 shadow-none hover:shadow-2xl hover:shadow-black/50"
                                />
                            </div>
                        ))}

                        {/* Final "View All" Card */}
                        <Link
                            href={`/collections?material_type=${materialType}`}
                            className="w-[60vw] md:w-[400px] flex-shrink-0 aspect-[4/5] md:aspect-auto border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-4 md:gap-6 group snap-start min-h-[300px] md:min-h-[400px]"
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white/40 group-hover:text-white" />
                            </div>
                            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white/30 group-hover:text-white font-bold">View Entire Series</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export function MaterialShowcase({
    realGoldProducts,
    goldPlatedProducts,
    bentexProducts
}: {
    realGoldProducts: Product[],
    goldPlatedProducts: Product[],
    bentexProducts: Product[]
}) {
    return (
        <div className="space-y-0">
            {/* Branding Header */}
            <div className="bg-neutral-950 pt-16 md:pt-24 px-6 md:px-12 text-center space-y-4 md:space-y-6">
                <h2 className="text-3xl md:text-9xl font-serif font-black italic text-white tracking-tighter leading-none">
                    Discovery by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Material.</span>
                </h2>
                <p className="max-w-xl mx-auto text-white/40 text-[9px] md:text-sm font-light tracking-[0.2em] uppercase leading-loose italic">
                    Each piece is a testament to our legacy of precision, crafted from the world's most precious elements.
                </p>
            </div>

            {realGoldProducts && realGoldProducts.length > 0 && (
                <SectionRow
                    title="The Fine Jewelry"
                    subtitle="Authentic 22K Hallmarked Masterpieces"
                    products={realGoldProducts}
                    materialType="real_gold"
                    accentColor="bg-amber-500"
                />
            )}
            {goldPlatedProducts && goldPlatedProducts.length > 0 && (
                <SectionRow
                    title="The Guilded Era"
                    subtitle="Premium Gold Plated Collections"
                    products={goldPlatedProducts}
                    materialType="gold_plated"
                    accentColor="bg-orange-500"
                />
            )}
            {bentexProducts && bentexProducts.length > 0 && (
                <SectionRow
                    title="Artisanal Fashion"
                    subtitle="High-Octane Bentex & Imitation Series"
                    products={bentexProducts}
                    materialType="bentex"
                    accentColor="bg-slate-500"
                />
            )}
        </div>
    )
}
