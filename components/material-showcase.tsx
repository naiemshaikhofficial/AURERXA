'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { ProductCard, Product } from '@/components/product-card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PREMIUM_EASE } from '@/lib/animation-constants'

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

    if (!products || products.length === 0) return null

    return (
        <section ref={sectionRef} className="relative py-24 overflow-hidden bg-neutral-950">
            {/* Background Accent Blur */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none ${accentColor}`} />

            <div className="max-w-[1800px] mx-auto px-6">
                {/* Header */}
                <motion.div
                    style={{ y: yHeader }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-amber-500/40" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">{subtitle}</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-serif text-white/90 leading-none tracking-tight">
                            {title}
                        </h2>
                    </div>

                    <Link
                        href={`/collections?material_type=${materialType}`}
                        className="group flex items-center gap-4 py-4 px-8 border border-white/5 hover:bg-white hover:text-black transition-all duration-500 rounded-full"
                    >
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Explore Collection</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Horizontal Scroll Area */}
                <div className="relative">
                    <div className="flex gap-6 overflow-x-auto pb-12 no-scrollbar snap-x snap-mandatory">
                        {products.map((product, idx) => (
                            <div key={product.id} className="w-[300px] md:w-[400px] flex-shrink-0 snap-start">
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
                            className="w-[300px] md:w-[400px] flex-shrink-0 aspect-[4/5] md:aspect-auto md:h-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-6 group snap-start"
                        >
                            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <ArrowRight className="w-6 h-6 text-white/40 group-hover:text-white" />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 group-hover:text-white font-bold">View Entire Series</span>
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
            <SectionRow
                title="The Fine Jewelry"
                subtitle="Authentic 22K Hallmarked Masterpieces"
                products={realGoldProducts}
                materialType="real_gold"
                accentColor="bg-amber-500"
            />
            <SectionRow
                title="The Guilded Era"
                subtitle="Premium Gold Plated Collections"
                products={goldPlatedProducts}
                materialType="gold_plated"
                accentColor="bg-orange-500"
            />
            <SectionRow
                title="Artisanal Fashion"
                subtitle="High-Octane Bentex & Imitation Series"
                products={bentexProducts}
                materialType="bentex"
                accentColor="bg-slate-500"
            />
        </div>
    )
}
