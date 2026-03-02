import React from 'react'
import { PolicyLayout } from '@/components/policy-layout'
import { Landmark, Scale, ShieldCheck, AlertTriangle, Users, Globe, FileText, Lock, BookOpen, Gavel, Phone } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms & Conditions | Legal Compliance | AURERXA',
    description: 'Read the complete Terms & Conditions for AURERXA (Legal Entity: Naiemoddin Nijamoddin Shaikh). Governing laws, acceptable use, IP rights, and more.',
    keywords: ['Terms and Conditions', 'AURERXA Legal', 'Jewelry Terms of Use', 'User Agreement', 'India Jewelry E-Commerce']
}

export default function TermsPage() {
    return (
        <PolicyLayout
            title="Terms & Conditions"
            description="Legal Entity: Naiemoddin Nijamoddin Shaikh"
        >
            <div className="space-y-12">
                {/* Electronic Record Notice */}
                <section className="bg-primary/5 border border-primary/20 p-6 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        This document is an electronic record generated under the provisions of the <strong className="text-foreground">Information Technology Act, 2000</strong> and the applicable rules, including any amendments. This document is published in line with Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011, which mandates the publication of the website&apos;s terms of use, privacy policy, and rules for user access and interaction on <Link href="https://www.aurerxa.com" className="text-primary underline">www.aurerxa.com</Link>.
                    </p>
                </section>

                {/* 1. Introduction */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-primary" />
                        1. Introduction
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        These terms and conditions shall govern your use of our website.
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-3 leading-relaxed">
                        <li>By using our website, you accept these terms and conditions in full; accordingly, if you disagree with these terms and conditions or any part of these terms and conditions, you must not use our website.</li>
                        <li>If you register with our website, submit any material to our website, or use any of our website services, we will ask you to expressly agree to these terms and conditions.</li>
                        <li>By using our website or agreeing to these terms and conditions, you warrant and represent to us that you are at least <strong className="text-foreground">18 years of age</strong>.</li>
                        <li>Our website uses cookies; by using our website or agreeing to these terms and conditions, you consent to our use of cookies in accordance with the terms of our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                {/* 2. Acceptable Use */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        2. Acceptable Use
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">You must not:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-3 leading-relaxed">
                        <li>Use our website in any way or take any action that causes, or may cause, damage to the website or impairment of the performance, availability, or accessibility of the website.</li>
                        <li>Use our website in any way that is unlawful, illegal, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.</li>
                        <li>Use our website to copy, store, host, transmit, send, use, publish, or distribute any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, keystroke logger, rootkit, or other malicious computer software.</li>
                        <li>Conduct any systematic or automated data collection activities (including without limitation scraping, data mining, data extraction, and data harvesting) on or in relation to our website without our express written consent.</li>
                        <li>Access or otherwise interact with our website using any robot, spider, or other automated means except for the purpose of search engine indexing.</li>
                        <li>Use data collected from our website for any direct marketing activity (including without limitation email marketing, SMS marketing, telemarketing, and direct mailing).</li>
                        <li>You must ensure that all the information you supply to us through our website, or in relation to our website, is true, accurate, current, complete, and non-misleading.</li>
                        <li>You agree to use this website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the site. Prohibited behaviour includes transmitting offensive or unlawful content or disrupting the normal operation of the site.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                {/* 3. User Accounts */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary" />
                        3. User Accounts
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account details and are fully responsible for all activities that occur under your account. We may:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-2 leading-relaxed">
                        <li>Suspend your account;</li>
                        <li>Cancel your account; and/or</li>
                        <li>Edit your account details</li>
                    </ul>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        at any time in our sole discretion without notice or explanation. You may cancel your account on our website using your account control panel.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 4. Product & Service Information */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        4. Product & Service Information
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We aim to provide accurate descriptions and pricing of our products and services on the website. However, we do not guarantee that the information, including availability and pricing, is always accurate, complete, or current. We reserve the right to correct errors and update information without prior notice.
                    </p>
                    <div className="bg-card border border-border p-6 space-y-3">
                        <h3 className="font-medium text-foreground text-sm">Jewelry-Specific Disclosures</h3>
                        <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-2 leading-relaxed">
                            <li>All gold jewelry is BIS Hallmarked with a unique <strong className="text-foreground">HUID (Hallmark Unique ID)</strong> as mandated by the Government of India.</li>
                            <li>Weights displayed are approximate. Final weight and pricing are confirmed at dispatch after multi-stage quality checks.</li>
                            <li>Product images are for illustrative purposes. Handcrafted pieces may have slight variations that reflect their artisanal nature.</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-border" />

                {/* 5. Third-Party Links */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Globe className="w-6 h-6 text-primary" />
                        5. Third-Party Links
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Our website may contain links to third-party websites that are not under our control. We are not responsible for the content, policies, or practices of these external sites. Accessing third-party links is at your own risk.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 6. Intellectual Property Rights */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Lock className="w-6 h-6 text-primary" />
                        6. Intellectual Property Rights
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        All content on this site — including text, images, graphics, logos, and software — is owned or licensed by <strong className="text-foreground">AURERXA (Naiemoddin Nijamoddin Shaikh)</strong> and protected by applicable intellectual property laws. You may not reproduce, distribute, or use our content without our prior written consent.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 7. Limitation of Liability */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-primary" />
                        7. Limitation of Liability
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        To the extent permitted by law, <strong className="text-foreground">AURERXA (Naiemoddin Nijamoddin Shaikh)</strong> shall not be liable for any indirect, incidental, or consequential damages arising out of or related to your use of the website, including but not limited to damages for loss of profits, data, or other intangible losses.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 8. Disclaimer of Warranties */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Scale className="w-6 h-6 text-primary" />
                        8. Disclaimer of Warranties
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This website is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind, either express or implied. We do not guarantee that the site will always be available, secure, or free from errors or viruses.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 9. Indemnity */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        9. Indemnity
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You agree to indemnify, defend, and hold harmless <strong className="text-foreground">AURERXA (Naiemoddin Nijamoddin Shaikh)</strong> and its affiliates, directors, officers, employees, and agents from and against all claims, liabilities, damages, losses, or expenses, including reasonable legal fees, arising out of your use of the website or your violation of these Terms & Conditions.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 10. Changes to Terms */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        10. Changes to Terms
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We reserve the right to modify or update these Terms & Conditions at any time without prior notice. Changes will be effective once posted on this page. We recommend checking this page periodically for updates.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 11. Governing Law */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Gavel className="w-6 h-6 text-primary" />
                        11. Governing Law
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India, without regard to its conflict of law principles. Any disputes arising from or relating to these terms, your use of the website, or our services shall be subject to the exclusive jurisdiction of the courts located in <strong className="text-foreground">Sangamner, Maharashtra</strong>, India.
                    </p>
                </section>

                <hr className="border-border" />

                {/* 12. Contact Us */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
                        <Phone className="w-6 h-6 text-primary" />
                        12. Contact Us
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        If you have any questions or concerns about these Terms & Conditions, please contact us at:
                    </p>
                    <div className="bg-card border border-border p-6 space-y-2">
                        <p className="text-sm text-foreground"><strong>Legal Entity:</strong> Naiemoddin Nijamoddin Shaikh</p>
                        <p className="text-sm text-foreground"><strong>Brand:</strong> AURERXA</p>
                        <p className="text-sm text-foreground"><strong>Email:</strong> <a href="mailto:support@aurerxa.com" className="text-primary underline">support@aurerxa.com</a></p>
                        <p className="text-sm text-foreground"><strong>Phone:</strong> <a href="tel:+919391032677" className="text-primary underline">+91 93910 32677</a></p>
                        <p className="text-sm text-foreground"><strong>Address:</strong> Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605, India</p>
                    </div>
                </section>

                {/* Grievance Officer */}
                <section className="bg-primary/5 border border-primary/20 p-6 space-y-4">
                    <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-primary" />
                        Grievance Officer
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        In accordance with the <strong className="text-foreground">Consumer Protection (E-Commerce) Rules, 2020</strong>, the name and contact details of the Grievance Officer are provided below:
                    </p>
                    <div className="text-sm text-foreground space-y-1">
                        <p><strong>Legal Entity:</strong> Naiemoddin Nijamoddin Shaikh</p>
                        <p><strong>Grievance Officer:</strong> Anisur Rehman Shaikh</p>
                        <p><strong>Designation:</strong> Legal Compliance Officer</p>
                        <p><strong>Email:</strong> <a href="mailto:compliance@aurerxa.com" className="text-primary underline">compliance@aurerxa.com</a></p>
                        <p><strong>Address:</strong> Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605, India</p>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    )
}
