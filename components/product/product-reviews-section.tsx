'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReviewList } from '@/components/review-list'
import { ReviewForm } from '@/components/review-form'
import { getProductReviews, getReviewStats } from '@/app/actions'

interface ProductReviewsSectionProps {
    productId: string
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
    const [reviews, setReviews] = useState<any[]>([])
    const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)
    const [isSortOpen, setIsSortOpen] = useState(false)
    const [sortBy, setSortBy] = useState('Featured')

    const loadReviews = useCallback(async () => {
        const [rData, sData] = await Promise.all([
            getProductReviews(productId),
            getReviewStats(productId)
        ])
        setReviews(rData)
        setReviewStats(sData)
    }, [productId])

    useEffect(() => {
        loadReviews()
    }, [loadReviews])

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (sortBy === 'Highest Ratings') return b.rating - a.rating
        if (sortBy === 'Lowest Ratings') return a.rating - b.rating
        return 0 // Featured (default)
    })

    return (
        <section id="reviews" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
            <div className="flex flex-col gap-12 mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    {/* Rating Breakdown Toggle */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                            className="flex items-center gap-4 group"
                        >
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-5 h-5 transition-all duration-300 ${s <= Math.round(reviewStats?.average || 0) ? 'fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-white/10'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-serif text-white">{(reviewStats?.average || 0).toFixed(1)}</span>
                                <span className="text-sm font-medium text-white/40 tracking-widest uppercase">
                                    {(reviewStats?.total || 0).toLocaleString()} Reviews
                                </span>
                                <motion.div
                                    animate={{ rotate: isBreakdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <svg className="w-4 h-4 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </motion.div>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isBreakdownOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-3 w-full max-w-sm">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const distribution = reviewStats?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                                            const counts = distribution[rating as keyof typeof distribution] || 0;
                                            const percentage = reviewStats.total > 0 ? (counts / reviewStats.total) * 100 : 0;
                                            return (
                                                <div key={rating} className="flex items-center gap-4 group">
                                                    <span className="text-[10px] font-bold text-white/40 w-4">{rating}</span>
                                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            className="h-full bg-white/80 rounded-full"
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-white/20 w-8">{counts}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions & Filters */}
                    <div className="flex items-center gap-3">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="h-12 px-6 flex items-center gap-3 border border-white/5 rounded-none bg-white/[0.02] hover:bg-white/[0.05] transition-all text-white/60 text-[10px] font-bold uppercase tracking-widest"
                            >
                                Sort: {sortBy}
                                <svg className={`w-3 h-3 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </button>

                            <AnimatePresence>
                                {isSortOpen && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setIsSortOpen(false)}
                                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-48 z-50 bg-neutral-900 border border-white/10 shadow-2xl py-2"
                                        >
                                            {['Featured', 'Newest', 'Highest Ratings', 'Lowest Ratings'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => {
                                                        setSortBy(option);
                                                        setIsSortOpen(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/5 ${sortBy === option ? 'text-white' : 'text-white/40'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <Button
                            onClick={() => setIsReviewFormOpen(true)}
                            className="bg-white text-black hover:bg-neutral-200 transition-all rounded-none font-bold text-[10px] uppercase tracking-[0.2em] h-12 px-10"
                        >
                            Write a review
                        </Button>
                    </div>
                </div>
            </div>

            <ReviewList reviews={sortedReviews} />

            <ReviewForm
                productId={productId}
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                onSuccess={() => {
                    loadReviews()
                }}
            />
        </section>
    )
}
