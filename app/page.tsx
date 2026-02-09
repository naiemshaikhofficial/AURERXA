import dynamic from 'next/dynamic'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Heritage } from '@/components/heritage'
import { TrustBar } from '@/components/trust-bar'
import { CategoryBrowsing } from '@/components/category-browsing'
import { ShopByGender } from '@/components/shop-by-gender'
import { OccasionBrowsing } from '@/components/occasion-browsing'
import { ConciergeServices, FloatingConcierge } from '@/components/concierge'
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

export default async function HomePage() {
  const newReleases = await getNewReleases()

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Heritage />
      <TrustBar />
      <CategoryBrowsing />
      <ShopByGender />
      <OccasionBrowsing />
      <ConciergeServices />
      <NewReleases products={newReleases} />
      <GoldRateCard />
      <FeaturedCollections />
      <Bestsellers />
      <HeritageHighlights />
      <div className="hidden md:block">
        <CustomOrderForm />
        <Newsletter />
      </div>
      <FloatingConcierge />
      <Footer />
    </div>
  )
}
