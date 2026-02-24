import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Custom Jewelry Design - Bespoke Handcrafted Pieces | AURERXA',
    description: 'Design your dream jewelry with AURERXA. Our master artisans create bespoke gold, diamond, and gemstone pieces tailored to your vision. Custom engagement rings, bridal sets, and personalized gifts.',
    keywords: ['Custom Jewelry Design', 'Bespoke Jewelry', 'Custom Engagement Ring', 'Personalized Jewelry India', 'Custom Gold Jewelry', 'Made to Order Jewelry'],
}

export default function CustomJewelryLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
