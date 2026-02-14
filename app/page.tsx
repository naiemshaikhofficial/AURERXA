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

async function NewReleasesSection() {
  const newReleases = await getNewReleases()
  return <NewReleases products={newReleases} />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Heritage />
      <TrustBar />
      <CategoryBrowsing />
      <ShopByGender />
      <OccasionBrowsing />
      <ConciergeServices />
      <ServicesSection />

      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/20" />}>
        <NewReleasesSection />
      </Suspense>

      <GoldRateCard />
      <FeaturedCollections />
      <Bestsellers />

      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/20" />}>
        <CraftsmanshipStory />
      </Suspense>

      <CustomOrderForm />
      <Newsletter />
      <FloatingConcierge />
      <Footer />
    </div>
  )
}
