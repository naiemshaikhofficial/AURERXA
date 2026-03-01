'use client'

import React from 'react'
import { Send, Loader2 } from 'lucide-react'

interface BulkItem {
    retailPrice: number
    quantity: number
}

interface BulkOrderSummaryProps {
    itemsCount: number
    totalItems: number
    totalRetailValue: number
    isSubmitting: boolean
    handleSubmit: () => void
}

export function BulkOrderSummary({
    itemsCount,
    totalItems,
    totalRetailValue,
    isSubmitting,
    handleSubmit
}: BulkOrderSummaryProps) {
    return (
        <div className="lg:sticky lg:top-28 space-y-6">
            <div className="bg-card/30 border border-border p-6 md:p-8 rounded-sm">
                <h2 className="text-[10px] font-premium-sans text-primary/80 tracking-[0.2em] mb-6">
                    ORDER SUMMARY
                </h2>

                {itemsCount > 0 ? (
                    <>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Designs</span>
                                <span className="text-foreground font-serif italic">{itemsCount} Designs</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Total Pieces</span>
                                <span className="text-foreground tabular-nums">{totalItems.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="h-px bg-border/40" />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Retail Value</span>
                                <span className="text-foreground font-semibold tabular-nums">₹{totalRetailValue.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Wholesale Discount Banner */}
                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm mb-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-premium-sans tracking-wider text-primary mb-1">
                                WHOLESALE PRICING
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Our team will provide exclusive wholesale rates based on your order volume.
                                Expect <span className="text-primary font-bold">15-25% off</span> retail pricing.
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="text-[10px] text-muted-foreground text-center py-8 uppercase tracking-widest opacity-40">
                        Select artifacts to refine summary
                    </p>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || itemsCount === 0}
                    className={`w-full py-4 text-[10px] font-premium-sans tracking-[0.3em] uppercase transition-all duration-500 flex items-center justify-center gap-3 rounded-sm ${itemsCount > 0
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10'
                        : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>PROCESSING...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-3 h-3" />
                            <span>SUBMIT BULK INQUIRY</span>
                        </>
                    )}
                </button>

                <p className="text-[8px] text-muted-foreground/40 text-center mt-6 leading-relaxed uppercase tracking-widest">
                    Inquiries are processed within 24 business hours. Exclusive pricing subject to verification.
                </p>
            </div>

            {/* Trust Signals */}
            <div className="bg-card/30 border border-border p-6 rounded-sm space-y-5">
                <h3 className="text-[9px] font-premium-sans text-primary/80 tracking-[0.3em] uppercase">The AURERXA Promise</h3>
                {[
                    { title: 'Exclusive Wholesale Rates', desc: 'Volume-based pricing with significant savings' },
                    { title: 'Quality Guaranteed', desc: 'Same premium quality as retail, BIS hallmarked' },
                    { title: 'Flexible MOQ', desc: 'Minimum 10 pieces per design selection' },
                    { title: 'Custom Engraving', desc: 'Available for curated corporate gifting' },
                ].map(trust => (
                    <div key={trust.title} className="flex items-start gap-3">
                        <div className="w-1 h-1 bg-primary/40 rounded-full mt-1.5 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">{trust.title}</p>
                            <p className="text-[10px] text-muted-foreground italic leading-relaxed">{trust.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
