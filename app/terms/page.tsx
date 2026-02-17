'use client'

import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { ShieldCheck, Scale, Gavel, Landmark } from 'lucide-react'

export default function TermsPage() {
    return (
        <PolicyLayout
            title="Terms & Conditions"
            description="The legal agreement between you and AURERXA regarding the purchase and use of our high-value jewelry."
        >
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
                <section>
                    <p className="text-muted-foreground text-sm italic">Last updated: February 17, 2026</p>
                    <div className="mt-6 flex items-start gap-4 p-4 bg-muted/30 border border-border/50">
                        <Landmark className="w-5 h-5 text-primary mt-1" />
                        <p className="text-sm text-foreground leading-relaxed">
                            By accessing AURERXA, you agree to be bound by these Terms and Conditions. As we deal in high-value precious metals and jewelry, these terms include strict anti-fraud measures and special governing laws for authenticity and returns.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        1. Authenticity & Hallmarking
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Every piece of jewelry sold on AURERXA is guaranteed to be authentic. We comply strictly with <strong className="text-foreground">BIS (Bureau of Indian Standards)</strong> regulations.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li>All gold jewelry is BIS Hallmarked and carries a unique <strong className="text-foreground">HUID (Hallmark Unique Identification)</strong>.</li>
                        <li>Silver products carry appropriate purity stamps (e.g., 925).</li>
                        <li><strong className="text-foreground">Product Category Clarification:</strong> Please note that BIS Hallmarking is applicable only to 14K, 18K, 20K, 22K, 23K, and 24K Gold and certain Silver articles as per government norms. <strong className="text-foreground">Gold-plated, Bentex, Artificial jewelry, and fashion accessories do not carry a BIS Hallmark</strong> as they are not made entirely of precious metals.</li>
                        <li>Each product is accompanied by our official AURERXA Purity Certificate and/or independent laboratory certification (GIA, IGI, etc.) where applicable.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <Landmark className="w-5 h-5 text-primary" />
                        2. Compliance with PMLA (Anti-Money Laundering)
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        In accordance with the <strong className="text-foreground">Prevention of Money Laundering Act (PMLA), 2002</strong>, and Government of India guidelines for the jewelry sector:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li>For transactions exceeding ₹2,00,000 (Two Lakhs), submission of a copy of the customer&apos;s <strong className="text-foreground">PAN Card</strong> is mandatory.</li>
                        <li>We reserve the right to request identity and address proof for any high-value transaction to ensure compliance with KYC (Know Your Customer) norms.</li>
                        <li>AURERXA is legally obligated to report suspicious transactions to the Financial Intelligence Unit (FIU-IND) where required by law.</li>
                    </ul>
                </section>

                <section className="space-y-4 font-sans">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <Scale className="w-5 h-5 text-primary" />
                        3. Anti-Fraud & Weight Verification
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        To protect against the high risk of fraud in jewelry e-commerce, AURERXA implements a multi-stage verification process:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li><strong className="text-foreground">CCTV Documentation:</strong> All packing and unpacking processes are recorded under 24/7 CCTV surveillance to document the condition and presence of the product.</li>
                        <li><strong className="text-foreground">Weight Recording:</strong> Products are weighed at 0.01g precision. This digital weight is recorded on all shipping documents and is non-negotiable for return verification.</li>
                        <li><strong className="text-destructive">Legal Prosecution:</strong> Any attempt to return tampered, substituted, or weight-reduced items will be treated as <strong className="text-destructive">Criminal Breach of Trust (IPC Section 406)</strong> and <strong className="text-destructive">Cheating (IPC Section 420)</strong>. AURERXA will pursue maximum legal penalties and civil damages for any such attempts.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <Gavel className="w-5 h-5 text-primary" />
                        4. Governing Law & Electronic Record
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        This document is an <strong className="text-foreground">electronic record</strong> in terms of the <strong className="text-foreground">Information Technology Act, 2000</strong> and rules thereunder as applicable. This electronic record is generated by a computer system and does not require any physical or digital signatures.
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the <strong className="text-foreground">exclusive jurisdiction of the courts in Mumbai, India</strong>.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground border-b border-border pb-2">5. Force Majeure & Artisanal Delivery</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        AURERXA shall not be liable for any delay or failure in performance resulting from causes beyond its reasonable control, including but not limited to raw material shortages (gold/silver price volatility or availability), government regulations, weather conditions, or transportation delays.
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        <strong className="text-foreground italic underline">Artisanal Nature & Delivery Timelines:</strong> Most AURERXA products are <strong className="text-foreground">handcrafted and involve intricate manual labor</strong>. By purchasing from us, you acknowledge that delivery timelines are <strong className="text-foreground">estimates only</strong> and "time is not of the essence" for delivery. We prioritize quality and craftsmanship over speed, and late delivery shall not entitle the customer to any compensation, damages, or cancellation beyond the standard 6-hour window.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground border-b border-border pb-2">6. Jewelry Care & Disclaimer</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Jewelry, especially handcrafted and plated items, require specific care. AURERXA is not liable for damage (such as tarnishing, stone fallout, or color change) resulting from:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li>Exposure to chemicals, perfumes, hairsprays, or detergents.</li>
                        <li>Improper storage or physical impact (drops/scratches).</li>
                        <li>Natural wear and tear of plating over time.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground border-b border-border pb-2">7. Intellectual Property</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        All designs, photographs, graphics, and brand identifiers on this website are the exclusive property of AURERXA. Any unauthorized reproduction, copying, or distribution of our unique jewelry designs or digital assets is strictly prohibited and will attract <strong className="text-foreground">legal action under the Copyright Act, 1957 and Design Act, 2000</strong>.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground border-b border-border pb-2">8. Payments & Financial Security</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We prioritize your financial security. All payments are processed through secure, RBI-authorized third-party payment gateways (Razorpay, Cashfree, etc.).
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li><strong className="text-foreground">Third-Party Liability:</strong> AURERXA is not liable for any payment failures, data breaches, or technical errors occurring on the third-party payment gateway&apos;s interface.</li>
                        <li><strong className="text-foreground">Transaction Charges:</strong> In the event of an approved cancellation or refund (customer-side), any <strong className="text-foreground">non-refundable payment gateway fees</strong> (typically 2-3%) charged by our service providers will be deducted from the final refund amount.</li>
                        <li><strong className="text-foreground">Price Volatility:</strong> Since the price of gold and silver fluctuates daily, the price at the moment of order placement is final. We will not honor refund requests based on subsequent price drops.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground border-b border-border pb-2">9. Right to Modify Policies</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        AURERXA reserves the <strong className="text-foreground">absolute right to update, change, or replace any part of these Terms and Conditions or our website policies at any time</strong>.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li>Changes will be effective immediately upon being posted on the website. </li>
                        <li>It is your responsibility to check our website periodically for changes. </li>
                        <li>Your continued use of or access to our website following the posting of any changes constitutes acceptance of those changes, <strong className="text-foreground">with or without specific notice to you</strong>.</li>
                    </ul>
                </section>

                <section className="bg-primary/5 border border-primary/20 p-6 mt-12">
                    <h2 className="text-lg font-serif font-bold mb-4">Grievance Officer</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        In accordance with the <strong className="text-foreground">Consumer Protection (E-Commerce) Rules, 2020</strong>, the name and contact details of the Grievance Officer are provided below:
                    </p>
                    <div className="mt-4 text-sm text-foreground space-y-1">
                        <p><strong>Name:</strong> [Anisur Rehman Shaikh]</p>
                        <p><strong>Designation:</strong> Legal Compliance Officer</p>
                        <p><strong>Email:</strong> compliance@aurerxa.com</p>
                        <p><strong>Address:</strong> Mumbai, Maharashtra, India</p>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    )
}
