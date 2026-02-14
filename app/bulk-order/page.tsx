import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProducts } from '@/app/actions'
import { BulkOrderForm } from '@/components/bulk-order-form'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
    title: 'Bulk & Wholesale Orders | AURERXA',
    description: 'Order premium AURERXA jewelry in bulk at wholesale rates for your business. Minimum 10 pieces per design. Get exclusive wholesale pricing for retailers, resellers, and corporate gifting.',
}

async function BulkOrderContent() {
    const products = await getProducts()
    return <BulkOrderForm products={products || []} />
}

export default function BulkOrderPage() {
    return (
        <div className="min-h-screen bg-background pb-24">
            <Navbar />
            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-16 px-6 lg:px-12">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-primary/80 text-[10px] uppercase font-premium-sans tracking-[0.3em] mb-6">
                        Wholesale Partnership
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-foreground tracking-wide mb-6">
                        Bulk <span className="text-gradient-gold italic">Orders</span>
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-8">
                        Elevate your business with AURERXA&apos;s premium jewelry collection at exclusive wholesale rates.
                        Perfect for retailers, corporate gifting, and special occasions.
                    </p>

                    {/* Benefits Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        {[
                            { icon: '💎', label: 'Wholesale Rates', desc: 'Up to 25% off retail' },
                            { icon: '📦', label: 'Min 10 Pieces', desc: 'Per design' },
                            { icon: '🚚', label: 'Free Shipping', desc: 'On bulk orders' },
                            { icon: '🤝', label: 'Dedicated Support', desc: 'Personal concierge' },
                        ].map((benefit) => (
                            <div
                                key={benefit.label}
                                className="p-4 bg-card/50 border border-border rounded-sm text-center group hover:border-primary/30 transition-all duration-500"
                            >
                                <div className="text-2xl mb-2">{benefit.icon}</div>
                                <p className="text-[10px] font-premium-sans text-foreground tracking-wider">{benefit.label}</p>
                                <p className="text-[9px] text-muted-foreground mt-1">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent max-w-4xl mx-auto" />

            {/* Form Section */}
            <section className="pt-12 px-6 lg:px-12">
                <Suspense fallback={
                    <div className="max-w-5xl mx-auto text-center py-20">
                        <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-xs text-muted-foreground mt-4 font-premium-sans tracking-wider">Loading products...</p>
                    </div>
                }>
                    <BulkOrderContent />
                </Suspense>
            </section>

            <Footer />
        </div>
    )
}
