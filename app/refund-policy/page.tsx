import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { RefreshCcw, Package, Ban, Truck, AlertTriangle, Gavel, Phone, Clock } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | Returns & Exchanges | AURERXA',
    description: 'Read the complete Refund and Return Policy for AURERXA (Legal Entity: Naiemoddin Nijamoddin Shaikh). Return guidelines, refund timelines, and exchange process.',
    keywords: ['Refund Policy', 'Return Policy', 'Jewelry Refund', 'AURERXA Returns', 'Order Cancellation', 'Exchange Policy']
}

export default function RefundPolicyPage() {
    return (
        <PolicyLayout
            title="Refund & Cancellation Policy"
            description="Legal Entity: Naiemoddin Nijamoddin Shaikh"
        >
            <div className="space-y-12">
                {/* Intro */}
                <section className="prose prose-invert max-w-none text-muted-foreground">
                    <p className="text-sm leading-relaxed">
                        Thank you for shopping with <strong className="text-foreground">AURERXA</strong> (Legal Entity: <strong className="text-foreground">Naiemoddin Nijamoddin Shaikh</strong>). We value your satisfaction and strive to provide quality handcrafted jewelry. Please review our refund and return policy below.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 1. Returns */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Package className="w-6 h-6 text-primary" />
                        1. Returns
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We accept returns of products within <strong className="text-foreground">7 days</strong> of delivery.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-2 leading-relaxed">
                        <li>Items must be unused, in their original AURERXA packaging, and in the same condition as received.</li>
                        <li>To complete your return, we require a receipt or proof of purchase (invoice/order ID).</li>
                        <li>A mandatory <strong className="text-foreground">uncut, unboxing video</strong> is required for all return claims.</li>
                    </ul>

                    <div className="bg-card border border-border p-6 space-y-3">
                        <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
                            <Ban className="w-4 h-4 text-primary" />
                            Non-Returnable Items
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            The following items are non-returnable:
                        </p>
                        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1 leading-relaxed">
                            <li>Customized or bespoke jewelry (made-to-order pieces with personalized engravings or custom designs).</li>
                            <li>Items that have been resized, altered, or modified after delivery.</li>
                            <li>Items damaged due to misuse, regular wear and tear, or improper storage.</li>
                            <li>Items where the HUID, hallmark, or AURERXA insignia has been tampered with.</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-border" />

                {/* 2. Refunds */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <RefreshCcw className="w-6 h-6 text-primary" />
                        2. Refunds
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Once we receive and inspect your return, we will notify you of the approval or rejection of your refund.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-3 leading-relaxed">
                        <li>Approved refunds will be processed within <strong className="text-foreground">5 to 7 business days</strong> to the original payment method.</li>
                        <li>A partial refund may be issued at our discretion for items that are not in their original condition, are damaged, or have missing parts for reasons not due to our error.</li>
                        <li>Refunds will be issued through the same payment method used for the original purchase (Credit/Debit Card, UPI, Net Banking).</li>
                    </ul>

                    <div className="bg-primary/5 border border-primary/20 p-6">
                        <h3 className="font-medium text-primary text-sm flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4" />
                            Cancellation Window
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Orders can be cancelled within <strong className="text-foreground">6 hours</strong> of placement or before the status changes to &quot;Packed&quot;, whichever is earlier. Once an order is shipped or customized work has begun, it <strong className="text-destructive">cannot be cancelled</strong>. For approved cancellations, a 100% refund will be processed within 5-7 business days.
                        </p>
                    </div>
                </section>

                <hr className="border-border" />

                {/* 3. Exchanges */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <RefreshCcw className="w-6 h-6 text-primary" />
                        3. Exchanges
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        To initiate a return or exchange, please contact our customer support at <a href="mailto:support@aurerxa.com" className="text-primary underline">support@aurerxa.com</a> or <a href="tel:+919391032677" className="text-primary underline">+91 93910 32677</a>, or visit our <Link href="/help" className="text-primary underline">Help Center</Link>. Our team will guide you through the process and provide necessary instructions.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 4. Shipping Returns */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Truck className="w-6 h-6 text-primary" />
                        4. Shipping Returns
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        For eligible returns, AURERXA will arrange an insured reverse pickup at no additional cost. All return shipments must be securely packaged in the original AURERXA tamper-evident box. Shipping costs for returns initiated by the customer (e.g., change of mind) may be deducted from the refund amount.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 5. Force Majeure */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                        5. Force Majeure / Exceptional Circumstances
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We are not liable for any delays in processing returns, exchanges, or refunds caused by circumstances beyond our reasonable control, including but not limited to natural disasters, strikes, government actions, or disruptions in transport or payment systems.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 6. Governing Law */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Gavel className="w-6 h-6 text-primary" />
                        6. Governing Law
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This Refund and Cancellation Policy shall be governed by and construed in accordance with the laws of India, including the <strong className="text-foreground">Consumer Protection Act, 2019</strong>, and other applicable laws. Any disputes arising under or in connection with this policy shall be subject to the exclusive jurisdiction of the courts located in <strong className="text-foreground">Sangamner, Maharashtra</strong>, India.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 7. Contact Us */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Phone className="w-6 h-6 text-primary" />
                        7. Contact Us
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        For questions or concerns regarding this policy, please contact us at:
                    </p>
                    <div className="bg-card border border-border p-6 space-y-2">
                        <p className="text-sm text-foreground"><strong>Legal Entity:</strong> Naiemoddin Nijamoddin Shaikh</p>
                        <p className="text-sm text-foreground"><strong>Brand:</strong> AURERXA</p>
                        <p className="text-sm text-foreground"><strong>Email:</strong> <a href="mailto:support@aurerxa.com" className="text-primary underline">support@aurerxa.com</a></p>
                        <p className="text-sm text-foreground"><strong>Phone:</strong> <a href="tel:+919391032677" className="text-primary underline">+91 93910 32677</a></p>
                        <p className="text-sm text-foreground"><strong>Address:</strong> Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605, India</p>
                    </div>
                </section>

                {/* Support Links */}
                <section className="text-center pt-8 border-t border-border">
                    <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                        <span>Need assistance with a return or refund?</span>
                        <div className="flex gap-4">
                            <Link href="/help" className="px-6 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all">
                                Open Help Center
                            </Link>
                            <Link href="/account/orders" className="px-6 py-2 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">
                                View My Orders
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    )
}
