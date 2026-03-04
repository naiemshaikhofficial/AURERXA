import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'FAQ - Frequently Asked Questions | AURERXA Jewelry',
    description: 'Find answers to common questions about AURERXA jewelry - shipping, returns, gold purity, customization, payment methods, and more. Everything you need to know before buying luxury jewelry online.',
    keywords: ['AURERXA FAQ', 'Jewelry FAQ', 'Gold Jewelry Questions', 'Jewelry Shipping India', 'Jewelry Return Policy', 'Custom Jewelry Questions'],
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
