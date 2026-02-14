import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Truck, Clock, MapPin, Phone } from 'lucide-react'

export const metadata = {
    title: 'Shipping & Delivery | AURERXA',
    description: 'Learn about our shipping policies, delivery times, and free shipping offers.'
}

export const revalidate = 3600

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Shipping & Delivery</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-12" />

                    <div className="space-y-12">
                        {/* Free Shipping */}
                        <section className="bg-card border border-border p-8">
                            <div className="flex items-start gap-4">
                                <Truck className="w-8 h-8 text-primary flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Free Shipping</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Enjoy <span className="text-primary font-medium">FREE shipping</span> on all orders above ₹50,000.
                                        For orders below this amount, a flat shipping fee of ₹500 applies.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Delivery Time */}
                        <section className="bg-card border border-border p-8">
                            <div className="flex items-start gap-4">
                                <Clock className="w-8 h-8 text-primary flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Delivery Times</h2>
                                    <ul className="text-muted-foreground space-y-3">
                                        <li className="flex justify-between border-b border-border pb-2">
                                            <span>Metro Cities (Delhi, Mumbai, Bangalore, etc.)</span>
                                            <span className="text-foreground">3-5 business days</span>
                                        </li>
                                        <li className="flex justify-between border-b border-border pb-2">
                                            <span>Tier-2 Cities</span>
                                            <span className="text-foreground">5-7 business days</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Other Locations</span>
                                            <span className="text-foreground">7-10 business days</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Secure Packaging */}
                        <section className="bg-card border border-border p-8">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-8 h-8 text-primary flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Secure Packaging</h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Every piece is carefully packaged in our signature luxury box, wrapped securely to ensure
                                        your jewelry arrives in perfect condition. All shipments are insured and require signature upon delivery.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Contact */}
                        <section className="bg-card border border-border p-8">
                            <div className="flex items-start gap-4">
                                <Phone className="w-8 h-8 text-primary flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Track Your Order</h2>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Once your order is shipped, you will receive a tracking number via email and SMS.
                                        You can also track your order from your account dashboard.
                                    </p>
                                    <p className="text-muted-foreground">
                                        For shipping queries, contact us at <a href="mailto:shipping@aurerxa.com" className="text-primary hover:text-primary/80">shipping@aurerxa.com</a>
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
