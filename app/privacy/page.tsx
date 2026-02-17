'use client'

import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Shield, Eye, Lock, RefreshCw } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <PolicyLayout
            title="Privacy Policy"
            description="How AURERXA handles your personal data and verification records for high-value transactions."
        >
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
                <section>
                    <p className="text-muted-foreground text-sm italic">Last updated: February 17, 2026</p>
                    <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
                        Your privacy is of paramount importance to AURERXA. This policy outlines how we collect, use, and safeguard your data, including specialized verification data required for high-value jewelry transactions.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <Eye className="w-5 h-5 text-primary" />
                        1. Verification Data Collection
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        In addition to standard personal information (Name, Address, Email), for security and authenticity purposes, we collect:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li><strong className="text-foreground">CCTV Recordings:</strong> We record the packing of your order and the unpacking of any returns for verification and evidence in case of disputes.</li>
                        <li><strong className="text-foreground">Authentication IDs:</strong> Hallmarking (HUID) and certificate IDs associated with your purchase.</li>
                        <li><strong className="text-foreground">Identity Verification:</strong> For high-value transactions exceeding ₹2,00,000 (PMLA guidelines), we are required to collect and verify your <strong className="text-foreground">PAN Card</strong> and/or other government-issued ID proofs.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <Lock className="w-5 h-5 text-primary" />
                        2. Data Security & Storage
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We implement bank-grade encryption for all transactions. Personal data and verification recordings are stored on secure, encrypted servers.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li>Access to CCTV and high-value transaction data is restricted to authorized security personnel only.</li>
                        <li><strong className="text-foreground">Data Retention:</strong> Verification videos are retained for a period of 90 days or until the legal return window expires. In case of a dispute or detected fraud, data will be retained for up to 5 years or until legal proceedings are concluded.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        3. Use of Information
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We use your data strictly for:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li>Processing and delivering your order securely.</li>
                        <li>Verifying authenticity and preventing fraudulent return attempts.</li>
                        <li>Complying with legal requirements (PMLA/KYC) for high-value asset sales in India.</li>
                        <li>Reporting suspicious transactions to the <strong className="text-foreground">Financial Intelligence Unit (FIU-IND)</strong>.</li>
                    </ul>
                </section>

                <section className="space-y-4 border-t border-border pt-6">
                    <h2 className="text-xl font-serif font-medium text-foreground">4. Disclosure to Third Parties & Law Enforcement</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We do not sell your personal information. Data is only shared with:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li><strong className="text-foreground">Secure Logistics Partners</strong> (for insured delivery).</li>
                        <li><strong className="text-foreground">Law Enforcement Agencies (LEA):</strong> In cases of suspected fraud, weight tampering, or payment cheating, we will share all captured evidence (CCTV, logs, metadata) with relevant authorities for investigation and filing of an FIR.</li>
                        <li><strong className="text-foreground">Regulatory Bodies:</strong> For PMLA compliance audits.</li>
                        <li><strong className="text-foreground">Certified Laboratories:</strong> For authenticity cross-verification.</li>
                    </ul>
                </section>
            </div>
        </PolicyLayout>
    )
}
