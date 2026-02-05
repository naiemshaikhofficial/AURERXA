import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata = {
    title: 'Privacy Policy | AURERXA',
    description: 'Learn how we collect, use, and protect your personal information.'
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Privacy Policy</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-4" />
                    <p className="text-center text-white/50 mb-12 text-sm">Last updated: February 2026</p>

                    <div className="prose prose-invert prose-amber max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">1. Information We Collect</h2>
                            <p className="text-white/70 leading-relaxed">
                                We collect information you provide directly to us, including:
                            </p>
                            <ul className="text-white/60 space-y-2 mt-4">
                                <li>• Name, email address, phone number, and shipping address</li>
                                <li>• Payment information (processed securely through payment partners)</li>
                                <li>• Order history and preferences</li>
                                <li>• Communications with our customer service team</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">2. How We Use Your Information</h2>
                            <p className="text-white/70 leading-relaxed">
                                We use the information we collect to:
                            </p>
                            <ul className="text-white/60 space-y-2 mt-4">
                                <li>• Process and fulfill your orders</li>
                                <li>• Send order confirmations and shipping updates</li>
                                <li>• Respond to your comments and questions</li>
                                <li>• Send promotional communications (with your consent)</li>
                                <li>• Improve our products and services</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">3. Information Sharing</h2>
                            <p className="text-white/70 leading-relaxed">
                                We do not sell, trade, or rent your personal information to third parties. We may share
                                your information only with:
                            </p>
                            <ul className="text-white/60 space-y-2 mt-4">
                                <li>• Shipping partners to deliver your orders</li>
                                <li>• Payment processors to complete transactions</li>
                                <li>• Service providers who assist in our operations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">4. Data Security</h2>
                            <p className="text-white/70 leading-relaxed">
                                We implement appropriate security measures to protect your personal information against
                                unauthorized access, alteration, disclosure, or destruction. All payment transactions
                                are encrypted using SSL technology.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">5. Your Rights</h2>
                            <p className="text-white/70 leading-relaxed">
                                You have the right to:
                            </p>
                            <ul className="text-white/60 space-y-2 mt-4">
                                <li>• Access the personal information we hold about you</li>
                                <li>• Request correction of inaccurate information</li>
                                <li>• Request deletion of your personal information</li>
                                <li>• Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-amber-400 mb-4">6. Contact Us</h2>
                            <p className="text-white/70 leading-relaxed">
                                For any privacy-related questions or concerns, please contact us at:
                                <br /><br />
                                <a href="mailto:privacy@aurerxa.com" className="text-amber-500 hover:text-amber-400">privacy@aurerxa.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
