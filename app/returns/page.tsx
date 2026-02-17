'use client'

import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Truck, Clock, MapPin, Phone, ShieldAlert, Scale, Video, Ban, Gem, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ReturnsShippingPage() {
    return (
        <PolicyLayout
            title="Returns & Shipping Policy"
            description="Our guidelines on delivery, returns, and anti-fraud measures for high-value jewelry."
        >
            <div className="space-y-12">
                {/* Critical Warning */}
                <section className="bg-destructive/10 border border-destructive/20 p-6 text-center space-y-2">
                    <p className="text-destructive font-bold uppercase tracking-widest text-sm">
                        ⚠️ DO NOT ACCEPT PARCELS IF THE SEAL IS BROKEN.
                    </p>
                    <p className="text-xs text-destructive/80">
                        Broken seal = tampered product. Refuse delivery immediately and contact us.
                    </p>
                </section>

                {/* Shipping & Delivery Section */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Truck className="w-6 h-6 text-primary" />
                        Shipping & Delivery
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-card border border-border p-6 h-full">
                            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Secure Logistics
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Every AURERXA masterpiece is packaged in luxury tamper-evident boxes. All shipments are <strong className="text-foreground">fully insured</strong> and require a mandatory signature upon delivery. We ship globally with premium partners like Delhivery, Bluedart, and Sequel.
                            </p>
                        </div>
                        <div className="bg-card border border-border p-6 h-full">
                            <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Delivery Timelines
                            </h3>
                            <ul className="text-xs text-muted-foreground space-y-2">
                                <li className="flex justify-between border-b border-border pb-1">
                                    <span>Metro Cities</span>
                                    <span className="text-foreground">3-5 business days</span>
                                </li>
                                <li className="flex justify-between border-b border-border pb-1">
                                    <span>Tier-2 Cities</span>
                                    <span className="text-foreground">5-7 business days</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Other Locations</span>
                                    <span className="text-foreground">7-10 business days</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6">
                        <h3 className="font-medium text-foreground mb-2">Shipping Charges</h3>
                        <p className="text-sm text-muted-foreground">
                            We offer <span className="text-primary font-bold">FREE Insured Shipping</span> on all orders above ₹50,000. For orders below this amount, a flat fee of ₹500 applies to cover high-value transit insurance and secure handling.
                        </p>
                    </div>
                </section>

                <hr className="border-border" />

                {/* Returns & Refund Policy */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                        Returns & Refund Policy
                    </h2>

                    <div className="prose prose-invert max-w-none text-muted-foreground">
                        <p>
                            At AURERXA, every piece of jewelry undergoes <strong className="text-foreground">rigorous quality inspection</strong> before dispatch. Given the high intrinsic value of these products, we maintain a <strong className="text-destructive">Strict No-Refund Policy</strong>. Returns are only considered in the following 3 verifiable cases:
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { title: 'Defective Product', desc: 'Manufacturing defect identified upon delivery.' },
                            { title: 'Wrong Product', desc: 'Item received does not match your order details.' },
                            { title: 'Damaged in Transit', desc: 'Damaged during shipping despite secure packaging.' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 border border-border/50">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-sm">{i + 1}</div>
                                <div>
                                    <p className="font-medium text-foreground">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{item.desc} (Must report within 24 hours)</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-destructive/5 border border-destructive/20 p-6 space-y-4">
                        <h3 className="font-medium text-destructive flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Anti-Fraud Weight & Purity Check
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Every return is subjected to <strong className="text-foreground">mandatory physical inspection</strong> including:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-2">
                            <li><strong className="text-foreground">Purity Verification:</strong> We verify our embossed AURERXA logo, hallmark stamps, and HUID. Any alteration or missing stamp leads to immediate rejection.</li>
                            <li><strong className="text-foreground">Weight Accuracy (0.01g):</strong> If the returned weight is marginally less than the documented dispatch weight, it is treated as <strong className="text-destructive">criminal fraud</strong>.</li>
                            <li><strong className="text-foreground">Legal Action:</strong> Fraudulent activity will be prosecuted under <strong className="text-destructive">IPC Section 420</strong> (Cheating) and <strong className="text-destructive">IPC Section 406</strong> (Breach of Trust).</li>
                        </ul>
                    </div>
                </section>

                {/* Unboxing Protocol */}
                <section className="bg-card border border-border p-8 space-y-4">
                    <h2 className="text-xl font-serif font-bold flex items-center gap-3">
                        <Video className="w-6 h-6 text-primary" />
                        Mandatory Unboxing Video
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Without a <strong className="text-foreground">continuous, uncut unboxing video</strong>, return claims will be automatically rejected. The video must show:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-muted-foreground list-disc pl-5">
                        <li>The fully sealed parcel upon arrival</li>
                        <li>Clear view of the shipping labels & seal</li>
                        <li>The complete unboxing process (video must not be edited)</li>
                        <li>The AURERXA logo/purity stamp on the product</li>
                        <li>Invoice and certificates included in the box</li>
                        <li>Close-up of the reported defect or damage</li>
                    </ul>
                </section>

                {/* Support Cross-Link */}
                <section className="text-center pt-8 border-t border-border">
                    <p className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                        <span>Need assistance with a return? Visit our Help Center or contact support.</span>
                        <div className="flex gap-4">
                            <Link href="/help" className="px-6 py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all">
                                Open Help Center
                            </Link>
                            <Link href="/account/orders" className="px-6 py-2 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">
                                View My Orders
                            </Link>
                        </div>
                    </p>
                </section>
            </div>
        </PolicyLayout>
    )
}
