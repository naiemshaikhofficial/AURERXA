import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export const metadata = {
    title: 'Returns & Refunds | AURERXA',
    description: 'Our hassle-free return and refund policy for your peace of mind.'
}

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Returns & Refunds</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-12" />

                    <div className="space-y-12">
                        {/* Important Note */}
                        <section className="bg-destructive/10 border border-destructive/20 p-6 text-center">
                            <p className="text-destructive font-bold uppercase tracking-widest text-sm">
                                NOTE: DO NOT ACCEPT PARCELS IF THE SEAL IS BROKEN.
                            </p>
                        </section>

                        {/* Intro */}
                        <section className="prose prose-invert max-w-none text-muted-foreground">
                            <p>
                                At AURERXA, we are dedicated to offering our customers the best products. Each item is thoroughly inspected, checked for defects, and packaged with utmost care to ensure you love our products. However, there may be times when we do not have the product(s) you choose in stock or face inventory and quality check issues. In such cases, we may have to cancel your order. You will be notified in advance to avoid any inconvenience. If you have purchased via online payment (not Cash on Delivery), you will be refunded once our team confirms your request.
                            </p>
                        </section>

                        {/* Order Cancellation */}
                        <section className="bg-card border border-border p-8">
                            <h2 className="text-xl font-serif font-medium mb-4">Order Cancellation</h2>
                            <div className="space-y-4">
                                <h3 className="font-medium text-foreground">Physical Products</h3>
                                <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                                    <li>Orders can be cancelled only before the item is shipped</li>
                                    <li>Orders already shipped cannot be cancelled</li>
                                </ul>
                            </div>
                        </section>

                        {/* Refund Policy */}
                        <section className="bg-card border border-border p-8">
                            <h2 className="text-xl font-serif font-medium mb-4">Refund Policy</h2>

                            <div className="mb-6">
                                <h3 className="font-medium text-foreground mb-2">No-Refund Policy</h3>
                                <p className="text-muted-foreground mb-4">
                                    We maintain a strict no-refund policy for all products. However, we may make exceptions in the following cases:
                                </p>
                                <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                                    <li>Product Not Received</li>
                                    <li>If the product is lost in transit</li>
                                    <li>If the wrong product is delivered (Unboxing Video Required)</li>
                                    <li>If the product is damaged during shipping (Unboxing Video Required)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-foreground mb-2">Refund Process (When Applicable)</h3>
                                <p className="text-muted-foreground">
                                    If any refund is approved, the amount will be credited back in the form of Credit Note within 7-14 business days.
                                </p>
                            </div>
                        </section>

                        {/* Refund/Return Not Applicable */}
                        <section className="bg-card border border-border p-8">
                            <h2 className="text-xl font-serif font-medium mb-4">Refund/Return Not Applicable</h2>
                            <p className="text-muted-foreground">
                                Refund and Returns are not applicable on silver Coins and Rakhis.
                            </p>
                        </section>

                        {/* Return Policy */}
                        <section className="bg-card border border-border p-8">
                            <h2 className="text-xl font-serif font-medium mb-4">Return Policy</h2>
                            <p className="text-muted-foreground mb-6">
                                We are committed to ensuring customer satisfaction and stand by the quality of our products. Below is our return policy to guide you through the return and replacement process:
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Eligibility for Return</h3>
                                    <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                                        <li>Returns are accepted only for defective, damaged, or incorrect products received.</li>
                                        <li>The return request must be initiated within 24 hours of receiving the product.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-medium text-foreground mb-2">Return Process</h3>
                                    <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                                        <li>If your return request is approved, the replacement process will be initiated within 2-3 business days.</li>
                                        <li>Once the replacement is dispatched, it is expected to be delivered within 4-7 business days.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Important Notes */}
                        <section className="bg-card border border-border p-8">
                            <h2 className="text-xl font-serif font-medium mb-4">Important Notes</h2>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                                <li>Delivery timelines may be affected by delays from the transport company, adverse weather conditions, or other unforeseen circumstances.</li>
                                <li>We are not responsible for delays caused by external factors beyond our control.</li>
                            </ul>
                        </section>

                        <section className="text-center pt-8 border-t border-border">
                            <p className="text-muted-foreground">
                                We aim to make the return and replacement process as seamless as possible.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
