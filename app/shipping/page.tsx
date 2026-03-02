import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Truck, MapPin, Clock } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy | Insured Worldwide Shipping | AURERXA',
    description: 'Learn about AURERXA luxury shipping standards, insured delivery timelines, and our partnership with premium logistics providers in India and abroad.',
    keywords: ['Shipping Policy', 'Jewelry Delivery India', 'Insured Shipping', 'Delhivery Partner', 'Tamper Evident Packaging', 'Mumbai Jewelry Shipping']
}

export default function ShippingPage() {
    return (
        <PolicyLayout
            title="Shipping & Delivery"
            description="Our standards for insured delivery and secure logistics of luxury jewelry."
        >
            <div className="space-y-12">
                <section className="bg-primary/5 border border-primary/20 p-6 text-center space-y-2">
                    <p className="text-primary font-bold uppercase tracking-widest text-sm">
                        Free Insured Shipping on All Orders Above ₹50,000
                    </p>
                </section>

                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Truck className="w-6 h-6 text-primary" />
                        Logistics & Insurance
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
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-primary" />
                        Secure Handover Protocol
                    </h2>
                    <div className="bg-primary/5 border border-primary/20 p-6 space-y-4 text-center">
                        <p className="text-primary font-bold uppercase tracking-widest text-sm italic">
                            Verification of Seal Integrity
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            For your protection, we recommend inspecting the tamper-evident seal upon handover. Should you notice any material discrepancy or compromise in the external packaging, we advise declining the delivery and notifying our concierge immediately. Your signature serves as confirmation of the parcel&apos;s external integrity.
                        </p>
                    </div>
                </section>

                <section className="bg-card border border-border p-8 space-y-4">
                    <h2 className="text-xl font-serif font-bold">The Art of Precision</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                        AURERXA masterpieces are meticulously hand-forged by master artisans. In the pursuit of absolute perfection and multi-stage purity certification, we prioritize artisanal excellence over standard logistics speed. Estimated timelines are provided as a commitment to quality, ensuring your piece arrives exactly as intended.
                    </p>
                </section>
            </div>
        </PolicyLayout>
    )
}

function ShieldAlert(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    )
}
