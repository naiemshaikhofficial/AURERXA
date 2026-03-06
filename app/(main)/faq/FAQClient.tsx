'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
    q: string
    a: string
}

interface FAQCategory {
    category: string
    questions: FAQItem[]
}

export function FAQClient({ faqs }: { faqs: FAQCategory[] }) {
    const [openIndex, setOpenIndex] = useState<string | null>(null)

    const toggleQuestion = (id: string) => {
        setOpenIndex(openIndex === id ? null : id)
    }

    return (
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
    )
}
