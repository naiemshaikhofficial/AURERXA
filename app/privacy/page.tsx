import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Shield, Eye, Lock, RefreshCw } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy | Data Protection & Security | AURERXA',
    description: 'Learn how AURERXA protects your personal information, specialized verification data, and ensures high-value jewelry transaction security.',
    keywords: ['Privacy Policy', 'Data Security', 'Jewelry Transaction Security', 'KYC Guidelines India', 'PMLA Compliance', 'Secure Luxury Shopping']
}

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
                        <li>Complying with regulatory excellence standards (PMLA/KYC) for high-value asset acquisitions.</li>
                        <li>Fulfilling legal reporting obligations as mandated by national financial authorities.</li>
                    </ul>
                </section>

                <section className="space-y-4 border-t border-border pt-6">
                    <h2 className="text-xl font-serif font-medium text-foreground">4. Custodial Collaboration & Regulatory Compliance</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We respect your privacy and do not trade your personal information. Data is only shared with trusted entities to ensure the security of your purchase:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        <li><strong className="text-foreground">Premier Logistics Partners:</strong> For white-glove, insured delivery services.</li>
                        <li><strong className="text-foreground">Protective Authorities:</strong> In exceptional cases of material discrepancy or security concerns, we may share relevant custodial records (CCTV, logs) with authorized bodies to resolve the matter and preserve the integrity of our brand.</li>
                        <li><strong className="text-foreground">Regulatory Excellence:</strong> For professional audits and PMLA compliance.</li>
                        <li><strong className="text-foreground">Certified Laboratories:</strong> For technical authenticity cross-verification.</li>
                    </ul>
                </section>
            </div>
        </PolicyLayout>
    )
}
