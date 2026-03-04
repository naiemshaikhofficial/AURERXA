'use client'

import React from 'react'
import { Star, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import supabaseLoader from '@/lib/supabase-loader'
import { motion } from 'framer-motion'

interface Review {
    id: string
    rating: number
    comment: string
    images: string[]
    is_verified: boolean
    created_at: string
    guest_name?: string
    profiles?: {
        full_name: string
    }
}

interface ReviewListProps {
    reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="py-20 text-center">
                <p className="text-sm text-white/30">No reviews yet. Be the first to share your experience.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all duration-300 group"
                >
                    {/* Header: Name + Badge + Date */}
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white/90 tracking-tight">
                                {review.profiles?.full_name || review.guest_name || 'Guest'}
                            </span>
                            {review.is_verified && (
                                <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                            )}
                        </div>
                    </div>

                    {/* Date */}
                    <p className="text-[11px] text-white/30 mb-2">
                        {format(new Date(review.created_at), 'dd/MM/yyyy')}
                    </p>

                    {/* Stars - Extreme Mechanical Assembly 3D */}
                    <div className="flex gap-2 mb-4 preserve-3d" style={{ perspective: "1000px" }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <motion.div
                                key={s}
                                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{
                                    delay: 0.1 + (s * 0.1),
                                    type: "spring",
                                    stiffness: 600,
                                    damping: 25
                                }}
                                className="relative w-5 h-5 flex items-center justify-center"
                            >
                                {/* Layered Mechanical Assembly */}
                                {[...Array(2)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`absolute w-full h-full transition-all duration-500 ${s <= review.rating
                                            ? 'fill-white text-white'
                                            : 'text-white/5 stroke-[0.5]'
                                            }`}
                                        style={{
                                            transform: `scale(${1 - (i * 0.2)}) rotate(${i * 45}deg)`,
                                            opacity: s <= review.rating ? 1 - (i * 0.3) : 0.1
                                        }}
                                    />
                                ))}

                                {/* Subtle Kinetic Shards on Mount */}
                                {s <= review.rating && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(4)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                                animate={{
                                                    scale: [0, 1, 0],
                                                    x: (Math.random() - 0.5) * 40,
                                                    y: (Math.random() - 0.5) * 40,
                                                    rotate: Math.random() * 360,
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.2 + (s * 0.1),
                                                    ease: "easeOut"
                                                }}
                                                className="absolute w-0.5 h-2 bg-white/20 left-1/2 top-1/2 origin-center"
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                        <p className="text-[13px] text-white/60 font-light leading-relaxed">
                            {review.comment}
                        </p>
                    )}

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {review.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/5 opacity-80 group-hover:opacity-100 transition-opacity"
                                >
                                    <Image
                                        src={img}
                                        alt={`Review image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                        loader={supabaseLoader}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
