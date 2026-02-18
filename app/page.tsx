import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Hero } from '@/components/hero'
import { getNewReleases } from './actions'

// Lazy load ALL below-hero components to reduce initial JS bundle and TBT
const Heritage = dynamic(() => import('@/components/heritage').then(mod => mod.Heritage))
const TrustBar = dynamic(() => import('@/components/trust-bar').then(mod => mod.TrustBar))
const CategoryBrowsing = dynamic(() => import('@/components/category-browsing').then(mod => mod.CategoryBrowsing))
const ShopByGender = dynamic(() => import('@/components/shop-by-gender').then(mod => mod.ShopByGender))
const OccasionBrowsing = dynamic(() => import('@/components/occasion-browsing').then(mod => mod.OccasionBrowsing))
const ConciergeServices = dynamic(() => import('@/components/concierge').then(mod => mod.ConciergeServices))
const FloatingConcierge = dynamic(() => import('@/components/concierge').then(mod => mod.FloatingConcierge))
const ServicesSection = dynamic(() => import('@/components/services-section').then(mod => mod.ServicesSection))
const FeaturedCollections = dynamic(() => import('@/components/featured-collections').then(mod => mod.FeaturedCollections))
const Bestsellers = dynamic(() => import('@/components/bestsellers').then(mod => mod.Bestsellers))
const CustomOrderForm = dynamic(() => import('@/components/custom-order-form').then(mod => mod.CustomOrderForm))
const Newsletter = dynamic(() => import('@/components/newsletter').then(mod => mod.Newsletter))
const Footer = dynamic(() => import('@/components/footer').then(mod => mod.Footer))
const CraftsmanshipStory = dynamic(() => import('@/components/craftsmanship-story').then(mod => mod.CraftsmanshipStory))
const NewReleases = dynamic(() => import('@/components/new-releases').then(mod => mod.NewReleases))
const GoldRateCard = dynamic(() => import('@/components/gold-rate-card').then(mod => mod.GoldRateCard))
import { SectionSkeleton } from '@/components/skeletons'

async function NewReleasesSection() {
  const { getNewReleases } = await import('./actions')
  const newReleases = await getNewReleases()
  return <NewReleases products={newReleases} />
}

async function BestsellersSection() {
  const { getBestsellers } = await import('./actions')
  const bestsellers = await getBestsellers()
  return <Bestsellers products={bestsellers as any} />
}

async function FeaturedCollectionsSection() {
  const { getCategories } = await import('./actions')
  const categories = await getCategories()
  return <FeaturedCollections categories={categories} />
}

async function HeroCarouselSection() {
  const { getHeroSlides } = await import('./actions')
  const { HeroCarousel } = await import('@/components/hero-carousel')
  const slides = await getHeroSlides()
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

      <TrustBar />
      <CategoryBrowsing />
      <ShopByGender />
      <OccasionBrowsing />
      <ConciergeServices />
      <ServicesSection />

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

      <Suspense fallback={<div className="py-12 px-6 max-w-7xl mx-auto"><SectionSkeleton type="blog" columns={3} /></div>}>
        <CraftsmanshipStory />
      </Suspense>

      <CustomOrderForm />
      <Newsletter />
      <FloatingConcierge />
      <Footer />
    </div>
  )
}
