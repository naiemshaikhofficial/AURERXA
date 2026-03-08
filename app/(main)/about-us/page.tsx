import { AboutClient } from './AboutClient'

export const metadata = {
    title: 'About AURERXA - 50 Years of Jewelry Heritage & Craftsmanship',
    description: 'Discover the story behind AURERXA — founded by Naiem Shaikh, a luxury jewelry brand built on 50+ years of artisan heritage. Handcrafted masterpieces, ethical practices, and a commitment to integrity in every piece.',
    keywords: ['About AURERXA', 'Naiem Shaikh', 'AURERXA Founder', 'Luxury Jewelry Brand Story', 'Indian Jewelry Heritage', 'Artisan Craftsmanship', 'Ethical Jewelry Brand', 'Handcrafted Jewelry India'],
}

export const revalidate = 3600 // revalidate every hour

export default function AboutPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        'mainEntity': {
            '@type': 'Person',
            'name': 'Naiem Shaikh',
            'jobTitle': 'Founder & Creative Director',
            'affiliation': {
                '@type': 'Organization',
                'name': 'AURERXA'
            },
            'sameAs': [
                'https://www.linkedin.com/in/naiemshaikhofficial',
                'https://www.instagram.com/naiemshaikhofficial'
            ],
            'description': 'Naiem Shaikh is the founder of AURERXA, a luxury jewelry boutique built on 50+ years of artisan heritage.'
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AboutClient />
        </>
    )
}
