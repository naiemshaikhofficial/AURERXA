import { AboutClient } from './AboutClient'

export const metadata = {
    title: 'About Us - Our Legacy, Craftsmanship & Heritage | AURERXA',
    description: 'Discover the story behind AURERXA — founded by Naiem Shaikh, a luxury jewelry brand built on 50+ years of artisan heritage. Handcrafted masterpieces, ethical practices, and a commitment to integrity in every piece.',
    keywords: ['About AURERXA', 'Naiem Shaikh', 'AURERXA Founder', 'Luxury Jewelry Brand Story', 'Indian Jewelry Heritage', 'Artisan Craftsmanship', 'Ethical Jewelry Brand', 'Handcrafted Jewelry India'],
}

export const revalidate = 3600 // revalidate every hour

export default function AboutPage() {
    return <AboutClient />
}
