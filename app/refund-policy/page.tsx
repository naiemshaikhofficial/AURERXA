import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Clock, RefreshCcw, ShieldCheck, Ban, CreditCard, Banknote } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | Transparent Returns | AURERXA',
    description: 'Detailed guidelines on order cancellations, refund processing timelines, and our commitment to fair jewelry exchange at AURERXA.',
    keywords: ['Jewelry Refund Policy', 'Order Cancellation', 'Money Back Guarantee', 'Refund Timelines', 'AURERXA Policies']
}

export default function RefundPolicyPage() {
    return (
        <PolicyLayout
            title="Refund & Cancellation Policy"
            description="Our commitment to transparency and fairness in every transaction."
        >
            <div className="space-y-12">
                {/* Introduction */}
                <section className="prose prose-invert max-w-none text-muted-foreground">
                    <p>
                        At <strong className="text-foreground">AURERXA</strong>, we understand that luxury is not just about the masterpiece you receive, but also the peace of mind throughout your journey. Our Refund & Cancellation policy is designed to be as refined and transparent as our jewelry.
                    </p>
                </section>

                <hr className="border-border" />

                {/* Cancellation Section */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Ban className="w-6 h-6 text-primary" />
                        Order Cancellation
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-card border border-border p-6 space-y-4">
                            <h3 className="font-medium text-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Standard Cancellation
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You may request a cancellation within <strong className="text-foreground">6 hours</strong> of placing your order. This window allows our artisans to halt the preparation process before your piece enters the final QC and packaging phase.
                            </p>
                            <p className="text-xs italic text-primary/70">
                                * Note: Once an order moves to "Shipped" status, it cannot be cancelled.
                            </p>
                        </div>

                        <div className="bg-card border border-border p-6 space-y-4">
                            <h3 className="font-medium text-foreground flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Custom Orders
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                For bespoke or customized designs, cancellations are only possible if production has not yet commenced. Once the crafting process begins, these orders are final and non-cancellable due to their uniquely personalized nature.
                            </p>
                        </div>
                    </div>
                </section>

                <hr className="border-border" />

                {/* Refund Section */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <RefreshCcw className="w-6 h-6 text-primary" />
                        Refund Processing
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-primary/5 border border-primary/20 p-6">
                            <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Refund Timelines
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Approved refunds are initiated immediately. The credit typically reflects in your original payment method within <strong className="text-foreground">5 to 7 business days</strong>, depending on your financial institution's processing cycles.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                {
                                    title: 'Prepaid Orders',
                                    desc: 'Refunded directly to the original source (Credit/Debit Card, UPI, or Net Banking).',
                                    icon: CreditCard
                                },
                                {
                                    title: 'Cancelled Orders',
                                    desc: 'Full 100% refund for cancellations verified within our policy window.',
                                    icon: Banknote
                                },
                                {
                                    title: 'Failed QC Refunds',
                                    desc: 'If a piece fails our multi-stage Quality Check before dispatch, a full refund is issued instantly.',
                                    icon: ShieldCheck
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 border border-border/50">
                                    <item.icon className="w-5 h-5 text-primary opacity-60" />
                                    <div>
                                        <p className="font-medium text-sm text-foreground">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Important Notes */}
                <section className="bg-card border border-border p-8 text-center space-y-4">
                    <h3 className="text-lg font-serif font-bold text-foreground">Non-Refundable Scenarios</h3>
                    <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Refunds are not applicable for items damaged due to misuse, regular wear and tear, or if the mandatory unboxing video is not provided. For hygiene reasons, certain categories may have specific restrictions as detailed in our <a href="/terms" className="text-primary underline">Terms & Conditions</a>.
                    </p>
                </section>
            </div>
        </PolicyLayout>
    )
}
