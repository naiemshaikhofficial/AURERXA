import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Shield, Database, Share2, Lock, Clock, RefreshCcw, UserCheck, Phone } from 'lucide-react'
import { Metadata } from 'next'

export const revalidate = 86400; // 24h

export const metadata: Metadata = {
    title: 'Privacy Policy | Data Protection & Security | AURERXA',
    description: 'Read the complete Privacy Policy for AURERXA (Legal Entity: Naiemoddin Nijamoddin Shaikh). How we collect, use, and safeguard your personal information.',
    keywords: ['Privacy Policy', 'Data Protection', 'AURERXA Privacy', 'Personal Data', 'IT Act 2000', 'Jewelry Privacy']
}

export default function PrivacyPage() {
    return (
        <PolicyLayout
            title="Privacy Policy"
            description="Legal Entity: Naiemoddin Nijamoddin Shaikh"
        >
            <div className="space-y-12">
                {/* Intro */}
                <section className="prose prose-invert max-w-none text-muted-foreground">
                    <p className="text-sm leading-relaxed">
                        <strong className="text-foreground">AURERXA</strong> (Legal Entity: <strong className="text-foreground">Naiemoddin Nijamoddin Shaikh</strong>) is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you visit our website <a href="https://www.aurerxa.com" className="text-primary underline">www.aurerxa.com</a> or use our services.
                    </p>
                    <p className="text-xs text-muted-foreground italic mt-2">Effective Date: March 1, 2026</p>
                </section>

                <hr className="border-border" />

                {/* 1. Information We Collect */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Database className="w-6 h-6 text-primary" />
                        1. Information We Collect
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">We may collect the following information:</p>
                    <div className="grid gap-4">
                        {[
                            {
                                title: 'Personal Information',
                                desc: 'Name, email address, phone number, shipping address, and other details you provide during checkout, account registration, or service requests.'
                            },
                            {
                                title: 'Payment Information',
                                desc: 'AURERXA does not store your payment card details. All payments are securely processed by our PCI-DSS compliant payment gateway partner, CCAvenue. We only receive transaction confirmation details.'
                            },
                            {
                                title: 'Usage Data',
                                desc: 'Information about how you use our website, including IP address, browser type, pages visited, and time spent on pages.'
                            },
                            {
                                title: 'Cookies',
                                desc: 'We use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings.'
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-card border border-border p-5">
                                <h3 className="font-medium text-foreground text-sm mb-2">{item.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-border" />

                {/* 2. How We Use Your Information */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Shield className="w-6 h-6 text-primary" />
                        2. How We Use Your Information
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">We use the collected information to:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-2 leading-relaxed">
                        <li>Process and fulfil orders and deliver services.</li>
                        <li>Communicate with you about your orders, inquiries, or other requests.</li>
                        <li>Improve our website and services.</li>
                        <li>Send promotional emails or newsletters, if you have opted in.</li>
                        <li>Verify identity for high-value jewelry transactions as required by applicable laws.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                {/* 3. Sharing Your Information */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Share2 className="w-6 h-6 text-primary" />
                        3. Sharing Your Information
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We do not sell or rent your personal information to third parties. We may share your information with:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-3 leading-relaxed">
                        <li><strong className="text-foreground">Service Providers:</strong> Third-party vendors who assist us in operating our website, conducting our business, or servicing you (e.g., shipping partners like Delhivery, Bluedart, and Sequel; payment processors like CCAvenue).</li>
                        <li><strong className="text-foreground">Legal Requirements:</strong> If required by law, we may disclose your information to comply with legal obligations or protect our rights.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                {/* 4. Data Security */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Lock className="w-6 h-6 text-primary" />
                        4. Data Security
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our website uses SSL encryption, and all payment transactions are handled by PCI-DSS compliant processors.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 5. Data Retention */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Clock className="w-6 h-6 text-primary" />
                        5. Data Retention
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We retain your personal information only as long as necessary to fulfil the purposes described in this policy or to comply with legal requirements. Afterward, data is securely deleted or anonymized.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 6. Changes to This Policy */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <RefreshCcw className="w-6 h-6 text-primary" />
                        6. Changes to This Policy
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We recommend checking this page periodically for updates.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 7. Your Rights */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <UserCheck className="w-6 h-6 text-primary" />
                        7. Your Rights
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at <a href="mailto:support@aurerxa.com" className="text-primary underline">support@aurerxa.com</a>. We will respond within <strong className="text-foreground">7 business days</strong>.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 8. Your Privacy Matters */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Phone className="w-6 h-6 text-primary" />
                        8. Your Privacy Matters to Us
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        In accordance with the <strong className="text-foreground">Information Technology Act, 2000</strong> and applicable rules, we are committed to addressing any concerns or feedback you may have regarding this Privacy Policy or the handling of your personal information.
                    </p>
                    <div className="bg-card border border-border p-6 space-y-2">
                        <p className="text-sm text-foreground"><strong>Legal Entity:</strong> Naiemoddin Nijamoddin Shaikh</p>
                        <p className="text-sm text-foreground"><strong>Brand:</strong> AURERXA</p>
                        <p className="text-sm text-foreground"><strong>Email:</strong> <a href="mailto:support@aurerxa.com" className="text-primary underline">support@aurerxa.com</a></p>
                        <p className="text-sm text-foreground"><strong>Phone:</strong> <a href="tel:+919391032677" className="text-primary underline">+91 93910 32677</a></p>
                        <p className="text-sm text-foreground"><strong>Address:</strong> Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605, India</p>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    )
}
