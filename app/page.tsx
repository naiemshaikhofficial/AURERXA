import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { FeaturedCollections } from '@/components/featured-collections'
import { Bestsellers } from '@/components/bestsellers'
import { CustomOrderForm } from '@/components/custom-order-form'
import { Newsletter } from '@/components/newsletter'
import { Footer } from '@/components/footer'
import { Heritage } from '@/components/heritage'
import { NewReleases } from '@/components/new-releases'
import { HeritageHighlights } from '@/components/heritage-highlights'
import { CategoryBrowsing } from '@/components/category-browsing'
import { ShopByGender } from '@/components/shop-by-gender'
import { TrustBar } from '@/components/trust-bar'
import { GoldRateCard } from '@/components/gold-rate-card'
import { OccasionBrowsing } from '@/components/occasion-browsing'
import { ConciergeServices, FloatingConcierge } from '@/components/concierge'
import { getNewReleases } from './actions'

export default async function HomePage() {
  const newReleases = await getNewReleases()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
