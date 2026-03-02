import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Truck, Clock, MapPin, Phone, ShieldAlert, Scale, Video, Ban, Gem, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Returns & Shipping Policy | Insured Delivery & Anti-Fraud | AURERXA',
    description: 'Guidelines on luxury jewelry delivery, automated reverse pickups, mandatory unboxing protocols, and anti-fraud measures for your peace of mind.',
    keywords: ['Jewelry Returns', 'Insured Shipping India', 'Free Shipping Jewelry', 'Reverse Pickup Logistics', 'Unboxing Protocol', 'Anti-Fraud Jewelry Policy']
}

export default function ReturnsShippingPage() {
    return (
        <PolicyLayout
            title="Returns & Shipping Policy"
            description="Our guidelines on delivery, returns, and anti-fraud measures for high-value jewelry by AURERXA (Legal Entity: Naiemoddin Nijamoddin Shaikh)."
        >
            <div className="space-y-12">
                {/* Content Advisory */}
                <section className="bg-primary/5 border border-primary/20 p-6 text-center space-y-2">
                    <p className="text-primary font-bold uppercase tracking-widest text-sm">
                        Verification of Seal Integrity
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                        To ensure the pristine condition of your AURERXA masterpiece, we advise inspecting the tamper-evident seal upon arrival. Should you notice any compromise in the packaging, we recommend declining the handover and notifying our concierge. Refer to our <Link href="/shipping" className="underline">Shipping Policy</Link> for detailed delivery standards.
                    </p>
                </section>

                <hr className="border-border" />

                {/* Cancellation Policy Section */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Ban className="w-6 h-6 text-primary" />
                        Order Cancellation Policy
                    </h2>

                    <div className="grid gap-6">
                        <div className="bg-card border border-border p-6">
                            <h3 className="font-medium text-foreground mb-3">Cancellation by Customer</h3>
                            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2 leading-relaxed">
                                <li>Orders can be cancelled <strong className="text-foreground">only within 6 hours</strong> of placement or before the status changes to "Packed", whichever is earlier.</li>
                                <li>Once an order is shipped or customized work has begun, it <strong className="text-destructive">cannot be cancelled</strong>.</li>
                                <li>For approved cancellations, the refund will be processed to the original payment method within 5-7 business days.</li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border p-6">
                            <h3 className="font-medium text-foreground mb-3 font-serif">Cancellation by AURERXA</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                We reserve the right to cancel any order for reasons including but not limited to:
                            </p>
                            <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-2">
                                <li>Product failing our final multi-stage <strong className="text-foreground">Quality Check (QC)</strong> before dispatch.</li>
                                <li>Unexpected inventory discrepancies or raw material availability.</li>
                                <li>Errors in pricing or product descriptions on the website.</li>
                                <li>Detection of suspicious or potentially fraudulent transaction patterns.</li>
                            </ul>
                            <p className="text-xs text-primary mt-4 italic">
                                * In such cases, a 100% refund will be issued to the original payment method immediately.
                            </p>
                        </div>
                    </div>
                </section>

                <hr className="border-border" />

                {/* Content Sections */}
                <section className="space-y-8">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                        Authenticity & Returns
                    </h2>

                    <div className="prose prose-invert max-w-none text-muted-foreground">
                        <p>
                            At AURERXA, every masterpiece is a symbol of our heritage, subjected to <strong className="text-foreground">rigorous multi-stage quality inspections</strong>. Given the high intrinsic value and handcrafted nature of our jewelry, returns are thoughtfully considered strictly for verified cases to ensure the integrity of our collections.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { title: 'Manufacturing Defect', desc: 'Identified and reported upon delivery.' },
                            { title: 'Order Discrepancy', desc: 'Item received does not match your specific order details.' },
                            { title: 'In-Transit Damage', desc: 'Verifiable damage sustained during secure transport.' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-muted/30 border border-border/50">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-sm">{i + 1}</div>
                                <div>
                                    <p className="font-medium text-foreground">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{item.desc} (Verified within 24 hours of arrival)</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 space-y-4">
                        <h3 className="font-medium text-primary flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Purity & Weight Verification
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            To maintain the AURERXA standard of excellence, every return undergoes a mandatory custodial inspection:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-2">
                            <li><strong className="text-foreground">Purity Audit:</strong> Verification of embossed AURERXA insignia, hallmark stamps, and <strong className="text-foreground">HUID (Hallmark Unique ID)</strong> records.</li>
                            <li><strong className="text-foreground">Verification Cross-Check:</strong> Any discrepancy in HUID or brand marking versus our dispatch records will result in the return being ineligible.</li>
                            <li><strong className="text-foreground">Weight Accuracy (Tolerance):</strong> We record weights at 0.01g precision. Any material discrepancy beyond standard artisanal tolerance will trigger an internal investigation.</li>
                            <li><strong className="text-foreground">Independent Inspection:</strong> In rare cases of discrepancy, AURERXA reserves the right to consult a government-approved gemological laboratory. The laboratory's technical assessment will be considered final.</li>
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
                    <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                        <span>Need assistance with a return? Visit our Help Center or contact support.</span>
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
