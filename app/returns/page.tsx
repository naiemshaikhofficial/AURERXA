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
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Returns & Refunds</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-12" />

                    <div className="space-y-12">
                        {/* Cancellation Policy */}
                        <section className="bg-neutral-900 border border-neutral-800 p-8">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Cancellation Policy</h2>
                                    <p className="text-white/60 leading-relaxed">
                                        You can cancel your order <span className="text-amber-400 font-medium">only before it has been shipped</span>. Once the order is marked as 'Shipped', it cannot be cancelled.
                                    </p>
                                    <p className="text-white/60 leading-relaxed mt-2">
                                        To cancel, visit your <Link href="/account/orders" className="text-amber-500 hover:text-amber-400 underline">Order History</Link> and select "Cancel Order" if eligible.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Return Policy */}
                        <section className="bg-neutral-900 border border-neutral-800 p-8">
                            <div className="flex items-start gap-4">
                                <RefreshCw className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">15-Day Returns</h2>
                                    <p className="text-white/60 leading-relaxed">
                                        We offer a <span className="text-amber-400 font-medium">15-day return policy</span> on all purchases.
                                        If you're not completely satisfied with your purchase, you may return it within 15 days
                                        of delivery for a full refund or exchange.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Conditions */}
                        <section className="bg-neutral-900 border border-neutral-800 p-8">
                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Return Conditions</h2>
                                    <ul className="text-white/60 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Item must be unused and in original condition
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Original packaging, tags, and certificates must be intact
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Authenticity certificate and invoice must be included
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Customized or personalized items cannot be returned
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Refund Timeline */}
                        <section className="bg-neutral-900 border border-neutral-800 p-8">
                            <div className="flex items-start gap-4">
                                <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Refund Timeline</h2>
                                    <ul className="text-white/60 space-y-3">
                                        <li className="flex justify-between border-b border-neutral-800 pb-2">
                                            <span>Quality Check</span>
                                            <span className="text-white">2-3 business days</span>
                                        </li>
                                        <li className="flex justify-between border-b border-neutral-800 pb-2">
                                            <span>Refund Processing</span>
                                            <span className="text-white">3-5 business days</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Bank Credit (varies by bank)</span>
                                            <span className="text-white">5-7 business days</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Anti-Fraud & Weight Verification */}
                        <section className="bg-neutral-900 border border-red-900/30 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertCircle className="w-24 h-24 text-red-500" />
                            </div>
                            <div className="flex items-start gap-4 relative z-10">
                                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3 text-red-400">Anti-Fraud & Weight Verification</h2>
                                    <div className="space-y-4 text-white/70 leading-relaxed text-sm">
                                        <p>
                                            <strong className="text-white">High Value Item Protection:</strong> To prevent fraudulent claims and "loss in weight" scams, all our shipments are video-recorded during packing.
                                        </p>
                                        <p>
                                            <strong className="text-white">Delivery Protocol:</strong> You strictly must verify the package weight and temper-proof seal <strong>before accepting delivery</strong>. Open delivery is recommended where available.
                                        </p>
                                        <p>
                                            <strong className="text-white">No Post-Delivery Weight Claims:</strong> Once the package is accepted and signed for, we <strong>do not accept</strong> any claims regarding missing items, empty boxes, or weight discrepancies (loss in weight).
                                        </p>
                                        <p className="text-xs text-white/50 italic border-t border-white/5 pt-2 mt-2">
                                            * Any attempt to return counterfeit items or tampered products will result in immediate legal action under applicable fraud laws.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Non-Returnable */}
                        <section className="bg-neutral-900 border border-neutral-800 p-8">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h2 className="text-xl font-serif font-medium mb-3">Non-Returnable Items</h2>
                                    <ul className="text-white/60 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Custom-made or personalized jewelry
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Items with engraving or special modifications
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-500">•</span>
                                            Items showing signs of wear or damage
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <p className="text-center text-white/50 text-sm">
                            To initiate a return, please contact us at <a href="mailto:returns@aurerxa.com" className="text-amber-500 hover:text-amber-400">returns@aurerxa.com</a>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
