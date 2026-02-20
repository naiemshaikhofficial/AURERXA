import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Hero } from '@/components/hero'
import { getNewReleases } from './actions'

// Lazy load ALL below-hero components to reduce initial JS bundle and TBT
const Heritage = dynamic(() => import('@/components/heritage').then(mod => mod.Heritage))

const NewReleases = dynamic(() => import('@/components/new-releases').then(mod => mod.NewReleases))
const CategoryBrowsing = dynamic<CategoryBrowsingProps>(() => import('@/components/category-browsing').then(mod => mod.CategoryBrowsing))
const ShopByGender = dynamic<ShopByGenderProps>(() => import('@/components/shop-by-gender').then(mod => mod.ShopByGender))
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
import type { CategoryBrowsingProps } from '@/components/category-browsing'
import type { ShopByGenderProps } from '@/components/shop-by-gender'

async function NewReleasesSection() {
  const { getNewReleases } = await import('./actions')
  const newReleases = await getNewReleases()
  return <NewReleases products={newReleases} />
}

async function CategoryBrowsingSection() {
  // Hardcoded curated categories as requested to restore original experience (Necklaces, Earrings, etc.)
  const categories = [
    {
      name: 'Necklaces',
      slug: 'necklaces',
      image_url: '/closeup-shot-female-wearing-beautiful-silver-necklace-with-pendant.jpg'
    },
    {
      name: 'Earrings',
      slug: 'earrings',
      image_url: '/long-earring-with-violet-precious-stones-hang-from-woman-s-ear.jpg'
    },
    {
      name: 'Rings',
      slug: 'rings',
      image_url: '/closeup-diamond-ring.jpg'
    },
    {
      name: 'Mangalsutra',
      slug: 'mangalsutra',
      image_url: '/mangalsutra-golden-necklace-worn-by-married-hindu-women-arranged-with-traditional-saree-with-huldi-kumkum-mogra-flowers-gajra-selective-focus_466689-60648 (2).avif'
    }
  ]
  return <CategoryBrowsing categories={categories} />
}

async function ShopByGenderSection() {
  const { getGenderStats } = await import('./actions')
  const stats = await getGenderStats()
  return <ShopByGender genderStats={stats} />
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

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AURERXA | Buy Premium Jewelry Online - Gold, Diamond, Bridal & Fashion Jewelry',
  description: 'Shop AURERXA for luxury handcrafted jewelry. Browse gold necklaces, diamond earrings, bridal sets, mangalsutra, rings & fashion accessories. Free shipping, easy returns, 100% certified. India\'s most trusted luxury jewelry brand.',
  keywords: [
    'Buy Jewelry Online India', 'Gold Jewelry Online Shopping', 'Diamond Jewelry Store',
    'Bridal Jewelry Sets Online', 'Fashion Jewelry India', 'Luxury Jewelry Brand',
    'AURERXA Official Store', 'Premium Handcrafted Jewelry'
  ],
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What type of jewelry does AURERXA sell?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AURERXA offers premium handcrafted luxury jewelry including gold necklaces, diamond earrings, mangalsutra, bridal sets, rings, bangles, and fashion accessories. We specialize in both traditional Indian jewelry and modern contemporary designs.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is AURERXA jewelry real gold?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, AURERXA offers authentic real gold jewelry (22K and 18K), as well as premium gold-plated and Bentex collections. Every piece comes with a certificate of authenticity.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does AURERXA offer free shipping?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, AURERXA provides free insured shipping across India on all orders. We ship via trusted partners like Delhivery with real-time tracking.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I customize jewelry at AURERXA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! AURERXA specializes in bespoke jewelry design. You can submit a custom order request through our website, and our master artisans will craft a unique piece tailored to your specifications.'
        }
      },
      {
        '@type': 'Question',
        name: 'Where is AURERXA located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AURERXA\'s flagship boutique is located at Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605. We also ship worldwide through our online store at aurerxa.com.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the return policy for AURERXA jewelry?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AURERXA offers a hassle-free return policy. If you are not satisfied with your purchase, you can initiate a return within the specified period through your account dashboard.'
        }
      }
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <Heritage />

      {/* Dynamic Hero Carousel (Bridal Series & More) */}
      <Suspense fallback={<div className="h-[80vh] w-full bg-background animate-pulse" />}>
        <HeroCarouselSection />
      </Suspense>


      <Suspense fallback={<div className="py-24 h-96 bg-background animate-pulse" />}>
        <CategoryBrowsingSection />
      </Suspense>
      <Suspense fallback={<div className="py-24 h-96 bg-background animate-pulse" />}>
        <ShopByGenderSection />
      </Suspense>
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
