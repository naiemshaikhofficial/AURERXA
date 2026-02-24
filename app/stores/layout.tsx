import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'AURERXA Boutique - Visit Our Flagship Jewelry Store in Sangamner',
    description: 'Visit the AURERXA flagship boutique at Captain Lakshmi Chowk, Sangamner, Maharashtra. Experience luxury jewelry shopping with personalized service. Book a private consultation today.',
    keywords: ['AURERXA Store', 'Jewelry Store Sangamner', 'AURERXA Boutique', 'Best Jewelry Shop Maharashtra', 'Visit AURERXA', 'Luxury Jewelry Store Near Me'],
}

export default function StoresLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
