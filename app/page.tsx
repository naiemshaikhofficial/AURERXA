import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Hero } from '@/components/hero'
import { getNewReleases } from './actions'

// Lazy load ALL below-hero components to reduce initial JS bundle and TBT
const Heritage = dynamic(() => import('@/components/heritage').then(mod => mod.Heritage))

const NewReleases = dynamic(() => import('@/components/new-releases').then(mod => mod.NewReleases))
const CategoryBrowsing = dynamic(() => import('@/components/category-browsing').then(mod => mod.CategoryBrowsing))
const ShopByGender = dynamic(() => import('@/components/shop-by-gender').then(mod => mod.ShopByGender))
const OccasionBrowsing = dynamic(() => import('@/components/occasion-browsing').then(mod => mod.OccasionBrowsing))
const FeaturedCollections = dynamic(() => import('@/components/featured-collections').then(mod => mod.FeaturedCollections))
const Bestsellers = dynamic(() => import('@/components/bestsellers').then(mod => mod.Bestsellers))
const CustomOrderForm = dynamic(() => import('@/components/custom-order-form').then(mod => mod.CustomOrderForm))
const Newsletter = dynamic(() => import('@/components/newsletter').then(mod => mod.Newsletter))
const Footer = dynamic(() => import('@/components/footer').then(mod => mod.Footer))
const CraftsmanshipStory = dynamic(() => import('@/components/craftsmanship-story').then(mod => mod.CraftsmanshipStory))
const GoldRateCard = dynamic(() => import('@/components/gold-rate-card').then(mod => mod.GoldRateCard))
const MaterialShowcase = dynamic(() => import('@/components/material-showcase').then(mod => mod.MaterialShowcase))
import { SectionSkeleton } from '@/components/skeletons'

async function NewReleasesSection() {
  const { getNewReleases } = await import('./actions')
  const newReleases = await getNewReleases()
  return <NewReleases products={newReleases} />
}

async function CategoryBrowsingSection() {
  const { getCategories } = await import('./actions')
  const categories = await getCategories()
  return <CategoryBrowsing categories={categories} />
}

async function BestsellersSection() {
  const { getBestsellers } = await import('./actions')
  const bestsellers = await getBestsellers()
  return <Bestsellers products={bestsellers as any} />
}

async function MaterialShowcaseSection() {
  const { getFilteredProducts } = await import('./actions')

  // Parallel fetch for grouped collections
  const [realGold, goldPlated, bentex] = await Promise.all([
    getFilteredProducts({ material_type: 'real_gold' }),
    getFilteredProducts({ material_type: 'gold_plated' }),
    getFilteredProducts({ material_type: 'bentex' })
  ])

  return (
    <MaterialShowcase
      realGoldProducts={realGold as any}
      goldPlatedProducts={goldPlated as any}
      bentexProducts={bentex as any}
    />
  )
}

async function FeaturedCollectionsSection() {
  const { getCategories } = await import('./actions')
  const categories = await getCategories()
  return <FeaturedCollections categories={categories} />
}

async function HeroCarouselSection() {
  const { getHeroSlides } = await import('./actions')
  const { HeroCarousel } = await import('@/components/hero-carousel')
  let slides = await getHeroSlides()

  if (!slides || slides.length === 0) {
    console.log('DEBUG: No hero slides found, providing mock data for verification')
    slides = [
      {
        id: 'mock-1',
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop',
        title: 'The Bride Collection',
        subtitle: 'Where Tradition Meets Eternity',
        cta_text: 'Discover More',
        cta_link: '/collections/bride',
        text_color: '#FBBF24', // Gold
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
        text_color: '#E5E7EB', // Silver
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
        text_color: '#FDA4AF', // Rose Pink
        button_bg: '#FDA4AF',
        button_text_color: '#FFFFFF',
        overlay_opacity: 0.3
      }
    ]
  } else {
    console.log(`DEBUG: Found ${slides.length} hero slides`)
  }

  return <HeroCarousel slides={slides} />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Heritage />

      {/* Dynamic Hero Carousel (Bridal Series & More) */}
      <Suspense fallback={<div className="h-[80vh] w-full bg-background animate-pulse" />}>
        <HeroCarouselSection />
      </Suspense>


      <Suspense fallback={<div className="py-24 h-96 bg-background animate-pulse" />}>
        <CategoryBrowsingSection />
      </Suspense>
      <ShopByGender />
      <OccasionBrowsing />

      <Suspense fallback={<div className="py-12 px-6 max-w-7xl mx-auto"><SectionSkeleton type="product" columns={4} /></div>}>
        <NewReleasesSection />
      </Suspense>

      <GoldRateCard />

      <Suspense fallback={<div className="py-12 px-6 max-w-7xl mx-auto"><SectionSkeleton type="collection" columns={4} /></div>}>
        <FeaturedCollectionsSection />
      </Suspense>

      <Suspense fallback={<div className="py-12 px-6 max-w-7xl mx-auto"><SectionSkeleton type="product" columns={4} /></div>}>
        <BestsellersSection />
      </Suspense>

      <Suspense fallback={<div className="h-screen w-full bg-neutral-950 animate-pulse" />}>
        <MaterialShowcaseSection />
      </Suspense>

      <Suspense fallback={<div className="py-12 px-6 max-w-7xl mx-auto"><SectionSkeleton type="blog" columns={3} /></div>}>
        <CraftsmanshipStory />
      </Suspense>

      <CustomOrderForm />
      <Newsletter />

      <Footer />
    </div>
  )
}
