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
                        <li>Each product is accompanied by our official AURERXA Purity Certificate and/or independent laboratory certification (GIA, IGI, etc.) where applicable.</li>
                    </ul>
                </section>

                <section className="space-y-4 font-sans">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <Scale className="w-5 h-5 text-primary" />
                        2. Anti-Fraud & Weight Verification
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
                        3. Governing Law & Jurisdiction
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or any purchase made through AURERXA shall be subject to the <strong className="text-foreground">exclusive jurisdiction of the courts in Mumbai, India</strong>.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground border-b border-border pb-2">4. Limitation of Liability</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        AURERXA&apos;s liability for any product purchase is strictly limited to the purchase price of that product. We are not liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products or services.
                    </p>
                </section>
            </div>
        </PolicyLayout>
    )
}
