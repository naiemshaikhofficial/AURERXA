import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact AURERXA - Get In Touch | Customer Support & Inquiries',
    description: 'Contact AURERXA for jewelry inquiries, custom orders, or support. Reach us via email, phone, or visit our flagship boutique in Sangamner, Maharashtra. We respond within 24 hours.',
    keywords: ['Contact AURERXA', 'Jewelry Store Contact', 'AURERXA Customer Support', 'Jewelry Inquiry', 'AURERXA Phone Number'],
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
