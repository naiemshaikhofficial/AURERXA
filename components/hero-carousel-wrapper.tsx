'use client'

import { useSiteConfig } from '@/context/site-config-context'
import { HeroCarousel } from './hero-carousel'
import { Skeleton } from './ui/skeleton'

export function HeroCarouselWrapper() {
    const { heroSlides, loading } = useSiteConfig()

    if (loading && heroSlides.length === 0) {
        return (
            <div className="w-full aspect-[16/10] md:aspect-[21/9] max-h-[90vh] bg-muted animate-pulse rounded-[2rem] mx-auto w-[94%]" />
        )
    }

    // Default/Mock slides if none exist in DB/Cache
    const slides = heroSlides.length > 0 ? heroSlides : [
        {
            id: 'mock-1',
            image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop',
            title: 'The Bride Collection',
            subtitle: 'Where Tradition Meets Eternity',
            cta_text: 'Discover More',
            cta_link: '/collections/bride',
            text_color: '#FBBF24',
            button_bg: '#FFFFFF',
            button_text_color: '#000000',
            overlay_opacity: 0.4
        },
        {
            id: 'mock-2',
            image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000&auto=format&fit=crop',
            title: 'Midnight Elegance',
            subtitle: 'Nocturnal Brilliance',
            cta_text: 'Shop The Look',
            cta_link: '/collections/midnight',
            text_color: '#E5E7EB',
            button_bg: '#111827',
            button_text_color: '#FFFFFF',
            overlay_opacity: 0.6
        }
    ]

    // Map DB fields (link_url -> cta_link)
    const mappedSlides = slides.map((s: any) => ({
        ...s,
        cta_link: s.link_url || s.cta_link
    }))

    return <HeroCarousel slides={mappedSlides} />
}
