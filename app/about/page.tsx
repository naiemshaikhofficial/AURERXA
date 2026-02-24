import { AboutClient } from './AboutClient'

export const metadata = {
    title: 'About AURERXA - Our Legacy, Craftsmanship & Heritage | Luxury Jewelry Brand',
    description: 'Discover the story behind AURERXA - India\'s finest luxury jewelry brand. Learn about our heritage of handcrafted artisan jewelry, ethical practices, and commitment to creating timeless heirloom pieces.',
    keywords: ['About AURERXA', 'Luxury Jewelry Brand Story', 'Indian Jewelry Heritage', 'Artisan Craftsmanship', 'Ethical Jewelry Brand'],
}

export const revalidate = 3600 // revalidate every hour

export default function AboutPage() {
    return <AboutClient />
}
