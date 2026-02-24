'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ChevronDown } from 'lucide-react'

const faqs = [
    {
        category: 'Ordering & Customization',
        questions: [
            {
                q: 'How do I place a custom (Bespoke) jewelry order?',
                a: 'At AURERXA, we specialize in bringing your vision to life. You can visit our "Custom Jewelry" page and fill out the design form with your requirements. Our master artisans will review the design and contact you with a feasibility report and quote within 24-48 hours.'
            },
            {
                q: 'Can I cancel my order?',
                a: 'Orders can be cancelled only within 6 hours of placement or before the status changes to "Packed", whichever is earlier. Once an order is shipped or artisanal work has begun on a custom piece, it cannot be cancelled.'
            },
            {
                q: 'What happens if my order is cancelled by AURERXA?',
                a: 'AURERXA reserves the right to cancel orders that do not pass our rigorous multi-stage Quality Check (QC) or due to unexpected inventory errors. In such cases, a 100% refund is issued to your original payment method immediately.'
            }
        ]
    },
    {
        category: 'Shipping & Secure Delivery',
        questions: [
            {
                q: 'What are the shipping charges?',
                a: 'We offer FREE Insured Shipping on all orders above ₹50,000 across India. For orders below this amount, a flat insurance and handling fee of ₹500 applies to ensure your luxury item is protected during transit.'
            },
            {
                q: 'What is the "Broken Seal" policy?',
                a: 'AURERXA parcels are shipped in tamper-evident luxury boxes with a brand seal. DO NOT accept the parcel if the seal is broken or tampered with. Refuse the delivery immediately and contact our support team.'
            },
            {
                q: 'How long will my delivery take?',
                a: 'Standard delivery typically takes 3-5 business days for metros and 5-10 business days for other locations across India, but since most AURERXA pieces are handcrafted masterpieces, intricate designs may require additional time for artisanal perfection and rigorous quality checks.'
            },
            {
                q: 'Why does handcrafted jewelry take longer to deliver?',
                a: 'Unlike mass-produced items, every AURERXA masterpiece is hand-forged and meticulously detailed by our master artisans. This slow, artisanal process ensures your jewelry is a unique work of art. Quality takes time, and we never rush perfection.'
            },
            {
                q: 'What happens if I refuse to accept my delivery (RTO)?',
                a: 'If a parcel is rejected without a valid reason (like a broken seal), AURERXA will deduct all logistics costs—including premium packaging, high-value transit insurance, and forward/return shipping fees—from your refund amount.'
            },
            {
                q: 'Are the shipments insured?',
                a: 'Yes, 100%. Every shipment is fully insured by AURERXA. We partner with premium high-value logistics like Delhivery, Bluedart, and Sequel to ensure secure door-to-door delivery with a mandatory signature.'
            }
        ]
    },
    {
        category: 'Quality, Purity & Verification',
        questions: [
            {
                q: 'How do I know my gold jewelry is authentic?',
                a: 'All our gold jewelry (14K to 24K) is BIS Hallmarked and carries a unique HUID (Hallmark Unique ID). You can verify this using the "BIS Care" app. Each piece also carries the AURERXA brand stamp.'
            },
            {
                q: 'Does all jewelry carry a Hallmark?',
                a: 'BIS Hallmarking is applicable only to precious gold (14K-24K) and certain silver items. Gold-plated, Bentex, and artificial fashion accessories do not carry a BIS Hallmark as they are not made entirely of solid precious metals.'
            },
            {
                q: 'How are product rates calculated?',
                a: 'Our rates are a combination of the global live spot price, a local Mumbai/Nashik market calibration factor, and a small luxury markup. This ensures you get fair, real-time pricing for premium craftsmanship.'
            },
            {
                q: 'What is the "Anti-Fraud Weight Check"?',
                a: 'To prevent fraud, we record the weight of every product at 0.01g precision during packing. This weight is documented on your invoice. For any return claim, the product weight must match our dispatch records exactly.'
            }
        ]
    },
    {
        category: 'Returns & Unboxing Protocols',
        questions: [
            {
                q: 'What is the Mandatory Unboxing Protocol?',
                a: 'For any claim regarding damage or a wrong product, a continuous, uncut unboxing video is MANDATORY. The video must show the sealed parcel, the shipping label, and the unboxing process without any edits. Without this, claims are automatically rejected.'
            },
            {
                q: 'What is your return policy?',
                a: 'Due to the high intrinsic value of jewelry, we maintain a Strict No-Refund Policy. Returns are only considered for verifiable manufacturing defects or wrong items received, which must be reported within 24 hours of delivery with a valid unboxing video.'
            },
            {
                q: 'How are refunds processed for cancellations?',
                a: 'For approved cancellations within the 6-hour window, the refund is processed within 5-7 business days. Please note that non-refundable payment gateway fees (typically 2-3%) charged by service providers may be deducted.'
            }
        ]
    },
    {
        category: 'Trust, Heritage & Authenticity',
        questions: [
            {
                q: 'Why should I trust AURERXA?',
                a: 'AURERXA is built on a 50-year legacy of trust and craftsmanship. We are an established boutique jewelry house with a physical presence. Every high-value shipment is insured, hallmarked, and triple-checked for quality before it leaves our heritage workshops.'
            },
            {
                q: 'How can I verify the HUID of my jewelry?',
                a: 'You can verify the authenticity of your gold jewelry using the "BIS Care" mobile app. Simply enter the 6-digit HUID code stamped on your jewelry to see the hallmarking details and purity records issued by the Government of India.'
            },
            {
                q: 'Are my diamonds certified?',
                a: 'Yes, all our diamond jewelry comes with world-renowned IGI (International Gemological Institute) or GIA (Gemological Institute of America) certification, ensuring you receive only the highest quality natural diamonds.'
            }
        ]
    },
    {
        category: 'Store & Boutique Visits',
        questions: [
            {
                q: 'Can I pick up my order from the store?',
                a: 'Yes, we offer a "Store Pickup" option. You can place your order online and select pickup at our Sangamner boutique. Please bring a valid government ID and your order confirmation for verification during pickup.'
            },
            {
                q: 'Where is your physical boutique located?',
                a: 'Our main heritage boutique is located at Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605. We invite you to visit us and experience our collections in person.'
            },
            {
                q: 'Can I see a piece virtually before buying?',
                a: 'Absolutely! We offer virtual try-ons and WhatsApp video calls. Our concierge team can show you the jewelry in detail under natural lighting to help you make an informed decision.'
            }
        ]
    },
    {
        category: 'Gifting & Packaging',
        questions: [
            {
                q: 'Do you offer gift wrapping?',
                a: 'Every AURERXA order arrives in our signature premium luxury packaging, designed for gifting. You can also add a personalized gift message during checkout, which we will print on a high-quality keepsake card.'
            },
            {
                q: 'Will the invoice be included in a gift order?',
                a: 'For gift orders, we can exclude the physical invoice from the parcel if requested. However, as per Indian laws, a digital invoice will always be sent to the registered email and may be required for insurance/returns.'
            }
        ]
    },
    {
        category: 'Jewelry Sizing & Fit',
        questions: [
            {
                q: 'How do I find my ring size?',
                a: 'We have a detailed Size Guide available on our website. You can use our printable sizer or measure an existing ring. If you are still unsure, we recommend visiting a local jeweler for professional measurement before placing a high-value order.'
            },
            {
                q: 'What if the bangle or ring I ordered doesn\'t fit?',
                a: 'Since most of our pieces are handcrafted to order, we highly recommend double-checking sizes. While we offer a return policy for defects, size-related exchanges are handled on a case-by-case basis and may incur additional artisanal/shipping charges.'
            }
        ]
    },
    {
        category: 'Jewelry Care & Maintenance',
        questions: [
            {
                q: 'How should I care for my AURERXA jewelry?',
                a: 'Store jewelry in the original AURERXA box provided. Avoid contact with perfumes, hairsprays, detergents, and water. For gold-plated items, natural wear and tear of plating is expected over time and is not considered a defect.'
            },
            {
                q: 'Do you offer professional cleaning services?',
                a: 'Yes, we offer professional cleaning and polishing for all AURERXA gold and diamond products. Please contact our support team to schedule a maintenance service for your jewelry.'
            }
        ]
    }
]

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null)

    const toggleQuestion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id)
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Frequently Asked Questions</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-12" />

                    <div className="space-y-12">
                        {faqs.map((category, catIndex) => (
                            <section key={catIndex}>
                                <h2 className="text-lg font-serif font-medium text-primary mb-4">{category.category}</h2>
                                <div className="space-y-2">
                                    {category.questions.map((item, qIndex) => {
                                        const id = `${catIndex}-${qIndex}`
                                        const isOpen = openIndex === id
                                        return (
                                            <div key={id} className="border border-border bg-card">
                                                <button
                                                    onClick={() => toggleQuestion(id)}
                                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                                                >
                                                    <span className="font-medium pr-4">{item.q}</span>
                                                    <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-6 pb-4 text-muted-foreground leading-relaxed border-t border-border pt-4">
                                                        {item.a}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-16 text-center p-8 bg-card border border-border">
                        <h3 className="font-serif text-xl font-medium mb-3">Still have questions?</h3>
                        <p className="text-muted-foreground mb-6">Our customer support team is here to help</p>
                        <Link href="/contact" className="inline-block px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium uppercase tracking-widest text-sm transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
