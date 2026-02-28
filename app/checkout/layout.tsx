import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Secure Checkout | AURERXA Authentic Luxury',
    description: 'Complete your purchase of handcrafted luxury jewelry at AURERXA. Secure 256-bit encrypted checkout with white-glove delivery.',
    robots: 'noindex, nofollow', // Standard for checkout pages to prevent search engines from indexing user sessions
}

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
