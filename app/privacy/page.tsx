import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata = {
    title: 'Privacy Policy | AURERXA',
    description: 'Learn how we collect, use, and protect your personal information.'
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Privacy Policy</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-4" />
                    <p className="text-center text-muted-foreground mb-12 text-sm">Last updated: February 2026</p>

                    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-serif font-medium text-primary mb-4">1. Information We Collect</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We collect information you provide directly to us, including:
                            </p>
                            <ul className="text-muted-foreground space-y-2 mt-4">
                                <li>• Name, email address, phone number, and shipping address</li>
                                <li>• Payment information (processed securely through payment partners)</li>
                                <li>• Order history and preferences</li>
                                <li>• Communications with our customer service team</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-primary mb-4">2. How We Use Your Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use the information we collect to:
                            </p>
                            <ul className="text-muted-foreground space-y-2 mt-4">
                                <li>• Process and fulfill your orders</li>
                                <li>• Send order confirmations and shipping updates</li>
                                <li>• Respond to your comments and questions</li>
                                <li>• Send promotional communications (with your consent)</li>
                                <li>• Improve our products and services</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-primary mb-4">3. Information Sharing</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We do not sell, trade, or rent your personal information to third parties. We may share
                                your information only with:
                            </p>
                            <ul className="text-muted-foreground space-y-2 mt-4">
                                <li>• Shipping partners to deliver your orders</li>
                                <li>• Payment processors to complete transactions</li>
                                <li>• Service providers who assist in our operations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-primary mb-4">4. Data Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We implement appropriate security measures to protect your personal information against
                                unauthorized access, alteration, disclosure, or destruction. All payment transactions
                                are encrypted using SSL technology.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-primary mb-4">5. Your Rights</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You have the right to:
                            </p>
                            <ul className="text-muted-foreground space-y-2 mt-4">
                                <li>• Access the personal information we hold about you</li>
                                <li>• Request correction of inaccurate information</li>
                                <li>• Request deletion of your personal information</li>
                                <li>• Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-serif font-medium text-primary mb-4">6. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For any privacy-related questions or concerns, please contact us at:
                                <br /><br />
                                <a href="mailto:privacy@aurerxa.com" className="text-primary hover:text-primary/80">privacy@aurerxa.com</a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
