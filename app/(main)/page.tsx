export const revalidate = 3600; // Cache homepage for 1 hour to prevent excessive DB calls
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Hero } from '@/components/hero'
import { getNewReleases, getGoldRates } from '@/app/actions'
import type { CategoryBrowsingProps } from '@/components/category-browsing'
import type { ShopByGenderProps } from '@/components/shop-by-gender'
import { Metadata } from 'next'

import { NewReleases } from '@/components/new-releases'
import { CategoryBrowsing } from '@/components/category-browsing'
import { ShopByGender } from '@/components/shop-by-gender'
import { OccasionBrowsing } from '@/components/occasion-browsing'
import { FeaturedCollections } from '@/components/featured-collections'
import { Bestsellers } from '@/components/bestsellers'
import { Newsletter } from '@/components/newsletter'
import { RecentlyViewed } from '@/components/recently-viewed'
import { TopStyles } from '@/components/top-styles'

import { HeroCarousel } from '@/components/hero-carousel'

async function NewReleasesSection() {
  const { getNewReleases } = await import('../actions')
  const newReleases = await getNewReleases()
  return <NewReleases products={newReleases} />
}

async function CategoryBrowsingSection() {
  const categories = [
    { name: 'Necklaces', slug: 'necklaces', image_url: '/closeup-shot-female-wearing-beautiful-silver-necklace-with-pendant.jpg' },
    { name: 'Earrings', slug: 'earrings', image_url: '/long-earring-with-violet-precious-stones-hang-from-woman-s-ear.jpg' },
    { name: 'Rings', slug: 'rings', image_url: '/closeup-diamond-ring.jpg' },
    { name: 'Mangalsutra', slug: 'mangalsutra', image_url: '/mangalsutra-golden-necklace-worn-by-married-hindu-women-arranged-with-traditional-saree-with-huldi-kumkum-mogra-flowers-gajra-selective-focus_466689-60648 (2).avif' }
  ]
  return <CategoryBrowsing categories={categories} />
}

async function ShopByGenderSection() {
  const { getGenderStats } = await import('../actions')
  const stats = await getGenderStats()
  return <ShopByGender genderStats={stats} />
}

async function BestsellersSection() {
  const { getBestsellers } = await import('../actions')
  const bestsellers = await getBestsellers()
  return <Bestsellers products={bestsellers as any} />
}

async function FeaturedCollectionsSection() {
  const { getCategories } = await import('../actions')
  const categories = await getCategories()
  return <FeaturedCollections categories={categories} />
}

async function HeroCarouselSection() {
  const { getHeroSlides } = await import('../actions')
  let slides = await getHeroSlides()

  if (!slides || slides.length === 0) {
    slides = [
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
      },
      {
        id: 'mock-3',
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=2000&auto=format&fit=crop',
        title: 'Rose Gold Love',
        subtitle: 'Subtle. Sophisticated.',
        cta_text: 'View Collection',
        cta_link: '/collections/rose-gold',
        text_color: '#FDA4AF',
        button_bg: '#FDA4AF',
        button_text_color: '#FFFFFF',
        overlay_opacity: 0.3
      }
    ] as any[]
  }

  // Map DB fields to UI Component props (link_url -> cta_link)
  const mappedSlides = (slides as any[]).map(s => ({
    ...s,
    cta_link: s.link_url || s.cta_link
  }))

  return <HeroCarousel slides={mappedSlides as any} />
}

export const metadata: Metadata = {
  title: 'AURERXA | Buy Premium Silver Jewelry Online - Bridal & Fashion Jewelry',
  description: 'Shop AURERXA for luxury handcrafted silver jewelry. Browse silver necklaces, earrings, bridal sets, mangalsutra, rings & fashion accessories. Free shipping, easy returns, 100% certified. India\'s most trusted luxury jewelry brand.',
  keywords: [
    'Buy Silver Jewelry Online India', 'Silver Jewelry Online Shopping',
    'Bridal Jewelry Sets Online', 'Fashion Jewelry India', 'Luxury Jewelry Brand',
    'AURERXA Official Store', 'Premium Handcrafted Jewelry',
    'Gold Necklace for Women', 'Diamond Stud Earrings', 'Bespoke Design Jewelry',
    'Indian Heritage Jewelry', 'Certified 22K Gold Online', 'Free Insured Shipping'
  ],
  alternates: {
    canonical: '/',
  },
}

async function MaterialShowcaseSection() {
  const { getFilteredProducts } = await import('../actions')
  const [realGold, goldPlated, bentex] = await Promise.all([
    getFilteredProducts({ material_type: 'real_gold' }),
    getFilteredProducts({ material_type: 'gold_plated' }),
    getFilteredProducts({ material_type: 'bentex' })
  ])
  const { MaterialShowcase } = await import('@/components/material-showcase')
  return (
    <MaterialShowcase
      realGoldProducts={realGold as any}
      goldPlatedProducts={goldPlated as any}
      bentexProducts={bentex as any}
    />
  )
}

export default function HomePage() {
  getGoldRates().catch(err => console.error('Gold sync trigger error:', err));

  return (
    <div className="min-h-screen bg-background">
      <section id="boutique-hero">
        <Hero />
      </section>

      <section id="bridal-collections" className="bg-background">
        <HeroCarouselSection />
      </section>

      <CategoryBrowsingSection />
      <ShopByGenderSection />
      <OccasionBrowsing />
      <NewReleasesSection />
      <FeaturedCollectionsSection />
      <TopStyles />
      <BestsellersSection />
      <MaterialShowcaseSection />

      <RecentlyViewed />
      <Newsletter />
    </div>
  )
}
