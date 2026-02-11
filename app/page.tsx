import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Heritage } from '@/components/heritage'
import { TrustBar } from '@/components/trust-bar'
import { CategoryBrowsing } from '@/components/category-browsing'
import { ShopByGender } from '@/components/shop-by-gender'
import { OccasionBrowsing } from '@/components/occasion-browsing'
import { ConciergeServices, FloatingConcierge } from '@/components/concierge'
import { ServicesSection } from '@/components/services-section'
import { getNewReleases } from './actions'

// Lazy load below-the-fold components
const FeaturedCollections = dynamic(() => import('@/components/featured-collections').then(mod => mod.FeaturedCollections))
const Bestsellers = dynamic(() => import('@/components/bestsellers').then(mod => mod.Bestsellers))
const CustomOrderForm = dynamic(() => import('@/components/custom-order-form').then(mod => mod.CustomOrderForm))
const Newsletter = dynamic(() => import('@/components/newsletter').then(mod => mod.Newsletter))
const Footer = dynamic(() => import('@/components/footer').then(mod => mod.Footer))
const HeritageHighlights = dynamic(() => import('@/components/heritage-highlights').then(mod => mod.HeritageHighlights))
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
        <HeritageHighlights />
      </Suspense>

      <div className="hidden md:block">
        <CustomOrderForm />
        <Newsletter />
      </div>
      <FloatingConcierge />
      <Footer />
    </div>
  )
}
