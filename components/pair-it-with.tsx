'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { getRecommendedProducts } from '@/app/actions'
import { ProductCard } from '@/components/product-card'
import { PREMIUM_EASE } from '@/lib/animation-constants'

interface PairItWithProps {
    productId: string
}

export function PairItWith({ productId }: PairItWithProps) {
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRecommendations() {
            setLoading(true)
            try {
                const data = await getRecommendedProducts(productId)
                setRecommendations(data)
            } catch (error) {
                console.error('Failed to fetch recommendations:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchRecommendations()
    }, [productId])

    if (!loading && recommendations.length === 0) return null

    return (
        <section className="py-24 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-primary"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Curated Pairing</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-serif italic text-white/90"
                        >
                            Complete the Look
                        </motion.h2>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse" />
                        ))
                    ) : (
                        recommendations.map((product, idx) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={idx}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
