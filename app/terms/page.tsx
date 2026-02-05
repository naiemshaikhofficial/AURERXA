import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata = {
    title: 'Terms & Conditions | AURERXA',
    description: 'Terms and conditions for using our website and services.'
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Terms & Conditions</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-4" />
                    <p className="text-center text-white/50 mb-12 text-sm">Last updated: February 2026</p>

                    <div className="prose prose-invert prose-amber max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-white/70 leading-relaxed">
                                By accessing and using the AURERXA website, you accept and agree to be bound by these
                                Terms and Conditions and our Privacy Policy. If you do not agree to these terms,
                                please do not use our website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">2. Products and Pricing</h2>
                            <p className="text-white/70 leading-relaxed">
                                All products are subject to availability. Prices are displayed in Indian Rupees (₹)
                                and are subject to change without notice. We reserve the right to modify or discontinue
                                any product at any time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">3. Orders and Payment</h2>
                            <p className="text-white/70 leading-relaxed">
                                By placing an order, you are making an offer to purchase. We reserve the right to
                                accept or decline any order. Payment must be received in full before order processing.
                                We accept major credit cards, debit cards, UPI, and Cash on Delivery.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">4. Authenticity Guarantee</h2>
                            <p className="text-white/70 leading-relaxed">
                                All jewelry sold on AURERXA is guaranteed to be authentic and comes with appropriate
                                certification and hallmarking as per BIS (Bureau of Indian Standards) regulations.
                                Each piece is accompanied by a certificate of authenticity.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">5. Intellectual Property</h2>
                            <p className="text-white/70 leading-relaxed">
                                All content on this website, including images, text, logos, and designs, is the
                                property of AURERXA and is protected by intellectual property laws. You may not
                                reproduce, distribute, or use any content without our written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">6. Limitation of Liability</h2>
                            <p className="text-white/70 leading-relaxed">
                                AURERXA shall not be liable for any indirect, incidental, special, or consequential
                                damages arising from the use of our website or products. Our total liability shall
                                not exceed the amount paid for the specific product in question.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">7. Governing Law</h2>
                            <p className="text-white/70 leading-relaxed">
                                These terms shall be governed by and construed in accordance with the laws of India.
                                Any disputes arising shall be subject to the exclusive jurisdiction of the courts
                                in Mumbai, India.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">8. Contact</h2>
                            <p className="text-white/70 leading-relaxed">
                                For any questions regarding these terms, please contact us at:
                                <br /><br />
                                <a href="mailto:legal@aurerxa.com" className="text-amber-500 hover:text-amber-400">legal@aurerxa.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
