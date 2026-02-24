'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ReviewSummaryProps {
    stats: {
        average: number
        total: number
        distribution: Record<number, number>
    }
}

export function ReviewSummary({ stats }: ReviewSummaryProps) {
    const { average, total, distribution } = stats

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-16 border-t border-white/5 mb-12">
            <div className="space-y-6">
                <div className="space-y-1">
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-medium">Customer Sentiment</p>
                    <h3 className="text-3xl font-serif text-white/90 italic">The AURERXA Standard</h3>
                </div>

                <div className="flex items-baseline gap-4">
                    <span className="text-8xl font-serif text-white/95 font-light leading-none">{average}</span>
                    <div className="space-y-1.5">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-4 h-4 stroke-[1.5] ${s <= Math.round(average) ? 'fill-amber-200 text-amber-200' : 'text-white/5'}`}
                                />
                            ))}
                        </div>
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-medium">Verified Experiences ({total})</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center gap-3.5">
                {[5, 4, 3, 2, 1].map((rating) => {
                    const count = distribution[rating as keyof typeof distribution] || 0
                    const percentage = total > 0 ? (count / total) * 100 : 0
                    return (
                        <div key={rating} className="flex items-center gap-6 group">
                            <span className="text-[9px] text-white/30 w-10 font-medium tracking-[0.2em]">{rating} Star</span>
                            <div className="flex-1 h-[2px] bg-white/5 overflow-hidden">
                                <Progress value={percentage} className="h-full bg-white/20 transition-all duration-1000" />
                            </div>
                            <span className="text-[9px] text-white/10 w-6 text-right font-medium tracking-widest">{count}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
