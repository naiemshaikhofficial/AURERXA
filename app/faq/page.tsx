'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ChevronDown } from 'lucide-react'

const faqs = [
    {
        category: 'Orders & Shipping',
        questions: [
            {
                q: 'How long does delivery take?',
                a: 'Delivery typically takes 3-5 business days for metro cities and 5-10 business days for other locations. You will receive a tracking number once your order is shipped.'
            },
            {
                q: 'Is shipping free?',
                a: 'Yes! We offer free shipping on all orders above ₹50,000. For orders below this amount, a flat shipping fee of ₹500 applies.'
            },
            {
                q: 'Can I track my order?',
                a: 'Absolutely! Once your order is shipped, you will receive a tracking link via email and SMS. You can also track from your account dashboard.'
            },
            {
                q: 'Do you ship internationally?',
                a: 'Currently, we only ship within India. International shipping will be available soon.'
            }
        ]
    },
    {
        category: 'Returns & Refunds',
        questions: [
            {
                q: 'What is your return policy?',
                a: 'We offer a 15-day return policy on all purchases. Items must be unused, in original condition with all packaging and certificates intact.'
            },
            {
                q: 'How do I initiate a return?',
                a: 'Contact our customer service at returns@aurerxa.com with your order number. We will arrange a pickup from your location.'
            },
            {
                q: 'How long does the refund take?',
                a: 'Refunds are processed within 10-15 business days after we receive and verify the returned item.'
            }
        ]
    },
    {
        category: 'Product & Quality',
        questions: [
            {
                q: 'Is your jewelry certified?',
                a: 'Yes, all our gold jewelry is BIS hallmarked and comes with a certificate of authenticity. Diamond jewelry comes with IGI/GIA certification.'
            },
            {
                q: 'What is the gold purity?',
                a: 'We offer 22K (916) and 18K (750) gold jewelry. The purity is clearly mentioned on each product page and stamped on the jewelry.'
            },
            {
                q: 'Do you offer customization?',
                a: 'Yes! We offer custom jewelry design services. Fill out our custom order form and our team will get in touch with you.'
            },
            {
                q: 'How do I care for my jewelry?',
                a: 'Store your jewelry in the box provided. Clean with a soft cloth. Avoid contact with perfumes, chemicals, and water. We recommend professional cleaning every 6 months.'
            }
        ]
    },
    {
        category: 'Payment & Security',
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery (COD) for orders up to ₹1,00,000.'
            },
            {
                q: 'Is my payment information secure?',
                a: 'Absolutely. All transactions are encrypted using SSL technology and processed through secure payment gateways. We never store your card details.'
            },
            {
                q: 'Can I pay in EMI?',
                a: 'Yes, we offer EMI options on select credit cards for orders above ₹25,000. EMI options will be shown at checkout.'
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
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-serif font-bold mb-4 text-center">Frequently Asked Questions</h1>
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-12" />

                    <div className="space-y-12">
                        {faqs.map((category, catIndex) => (
                            <section key={catIndex}>
                                <h2 className="text-lg font-serif font-medium text-amber-400 mb-4">{category.category}</h2>
                                <div className="space-y-2">
                                    {category.questions.map((item, qIndex) => {
                                        const id = `${catIndex}-${qIndex}`
                                        const isOpen = openIndex === id
                                        return (
                                            <div key={id} className="border border-neutral-800 bg-neutral-900">
                                                <button
                                                    onClick={() => toggleQuestion(id)}
                                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                                                >
                                                    <span className="font-medium pr-4">{item.q}</span>
                                                    <ChevronDown className={`w-5 h-5 text-amber-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-6 pb-4 text-white/60 leading-relaxed border-t border-neutral-800 pt-4">
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

                    <div className="mt-16 text-center p-8 bg-neutral-900 border border-neutral-800">
                        <h3 className="font-serif text-xl font-medium mb-3">Still have questions?</h3>
                        <p className="text-white/60 mb-6">Our customer support team is here to help</p>
                        <a href="mailto:support@aurerxa.com" className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium uppercase tracking-widest text-sm transition-colors">
                            Contact Us
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
