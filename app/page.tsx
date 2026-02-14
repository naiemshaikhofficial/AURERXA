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
const HeritageHighlights = dynamic(() => import('@/components/heritage-highlights').then(mod => mod.HeritageHighlights))
const NewReleases = dynamic(() => import('@/components/new-releases').then(mod => mod.NewReleases))
const GoldRateCard = dynamic(() => import('@/components/gold-rate-card').then(mod => mod.GoldRateCard))

// New content sections
const WhyChooseUs = dynamic(() => import('@/components/why-choose-us').then(mod => mod.WhyChooseUs))
const CraftsmanshipStory = dynamic(() => import('@/components/craftsmanship-story').then(mod => mod.CraftsmanshipStory))
const OurStory = dynamic(() => import('@/components/testimonials-luxury').then(mod => mod.OurStory))
const PricingTransparency = dynamic(() => import('@/components/pricing-transparency').then(mod => mod.PricingTransparency))
const InstagramFeed = dynamic(() => import('@/components/instagram-feed').then(mod => mod.InstagramFeed))
const FAQLuxury = dynamic(() => import('@/components/faq-luxury').then(mod => mod.FAQLuxury))

async function NewReleasesSection() {
  const newReleases = await getNewReleases()
  return <NewReleases products={newReleases} />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />
      
      {/* Heritage & Trust */}
      <Heritage />
      <TrustBar />
      
      {/* PRODUCTS - Featured Early for Visibility */}
      {/* New Releases */}
      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/20" />}>
        <NewReleasesSection />
      </Suspense>
      
      {/* Featured Products */}
      <FeaturedCollections />
      <Bestsellers />
      
      {/* Browse Collections */}
      <CategoryBrowsing />
      <ShopByGender />
      <OccasionBrowsing />
      
      {/* Gold Rate */}
      <GoldRateCard />
      
      {/* Why Choose AURERXA - NEW */}
      <WhyChooseUs />
      
      {/* Craftsmanship Story - NEW */}
      <CraftsmanshipStory />
      
      {/* Services */}
      <ServicesSection />

      {/* Heritage Highlights */}
      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted/20" />}>
        <HeritageHighlights />
      </Suspense>

      {/* Our Story - NEW */}
      <OurStory />
      
      {/* Pricing Transparency - NEW */}
      <PricingTransparency />
      
      {/* Instagram Feed - NEW */}
      <InstagramFeed />
      
      {/* FAQ Section - NEW */}
      <FAQLuxury />
      
      {/* Custom Order & Newsletter */}
      <CustomOrderForm />
      <Newsletter />
      
      {/* Footer & Floating Elements */}
      <FloatingConcierge />
      <Footer />
    </div>
  )
}
