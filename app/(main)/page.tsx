export const revalidate = 86400; // Cache homepage for 24 hours to maximize performance and minimize DB/Vercel hits
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

import { HeroCarouselWrapper } from '@/components/hero-carousel-wrapper'
import { LazySection } from '@/components/lazy-section'

async function NewReleasesSection() {
  const { getNewReleases } = await import('@/app/actions')
  const newReleases = await getNewReleases()
  return (
    <LazySection fallback={<div className="min-h-[500px]" />}>
      <NewReleases products={newReleases} />
    </LazySection>
  )
}

async function CategoryBrowsingSection() {
  const categories = [
    { name: 'Necklaces', slug: 'necklaces', image_url: '/closeup-shot-female-wearing-beautiful-silver-necklace-with-pendant.jpg' },
    { name: 'Earrings', slug: 'earrings', image_url: '/long-earring-with-violet-precious-stones-hang-from-woman-s-ear.jpg' },
    { name: 'Rings', slug: 'rings', image_url: '/closeup-diamond-ring.jpg' },
    { name: 'Mangalsutra', slug: 'mangalsutra', image_url: '/mangalsutra-golden-necklace-worn-by-married-hindu-women-arranged-with-traditional-saree-with-huldi-kumkum-mogra-flowers-gajra-selective-focus_466689-60648 (2).avif' },
    { name: 'Bracelets', slug: 'bracelets', image_url: '/luxury-bracelet.png' },
    { name: 'Chains', slug: 'chains', image_url: '/luxury-chains.png' },
    { name: 'Bangles', slug: 'bangles', image_url: '/luxury-bangles.png' },
    { name: 'Pendants', slug: 'pendants', image_url: '/luxury-pendant.png' },
    { name: 'Nose Pins', slug: 'nose-pins', image_url: '/luxury-nose-pin.png' },
    { name: 'Anklets', slug: 'anklets', image_url: '/luxury-anklet.png' }
  ]
  return <CategoryBrowsing categories={categories} />
}

async function ShopByGenderSection() {
  const { getGenderStats } = await import('@/app/actions')
  const stats = await getGenderStats()
  return (
    <LazySection fallback={<div className="min-h-[400px]" />}>
      <ShopByGender genderStats={stats} />
    </LazySection>
  )
}

async function BestsellersSection() {
  const { getBestsellers } = await import('@/app/actions')
  const bestsellers = await getBestsellers()
  return (
    <LazySection fallback={<div className="min-h-[600px]" />}>
      <Bestsellers products={bestsellers as any} />
    </LazySection>
  )
}

async function FeaturedCollectionsSection() {
  const { getCategories } = await import('@/app/actions')
  const categories = await getCategories()
  return (
    <LazySection fallback={<div className="min-h-[400px]" />}>
      <FeaturedCollections categories={categories} />
    </LazySection>
  )
}

function HeroCarouselSection() {
  return (
    <LazySection fallback={<div className="aspect-[21/9] bg-neutral-900 animate-pulse" />}>
      <HeroCarouselWrapper />
    </LazySection>
  )
}

export const metadata: Metadata = {
  title: 'Aurerxa – BIS Hallmarked Gold & 925 Silver Jewellery Online India',
  description: 'Discover AURERXA for BIS Hallmarked gold and certified silver jewelry. Luxury bridal sets, mangalsutra, rings, and handcrafted necklaces with free insured shipping. India\'s trusted premium jewelry boutique.',
  keywords: [
    'Gold jewelry online India', 'Silver jewelry for women', '22k gold ring price',
    'Minimal jewelry brand India', 'Daily wear gold jewelry', 'Bespoke design jewelry',
    'Certified gold mangalsutra online', 'Jewelry shop in Nashik', 'Hallmarked gold jewelry India',
    'Buy luxury jewelry online', 'AURERXA Official Store'
  ],
  alternates: {
    canonical: '/',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  'name': 'AURERXA',
  'image': 'https://www.aurerxa.com/icon-512.png',
  '@id': 'https://www.aurerxa.com',
  'url': 'https://www.aurerxa.com',
  'telephone': '+91-9391032677',
  'priceRange': '₹₹₹',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': 'Captain Lakshmi Chowk, Rangargalli',
    'addressLocality': 'Sangamner',
    'addressRegion': 'Nashik, Maharashtra',
    'postalCode': '422605',
    'addressCountry': 'IN'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 19.575916,
    'longitude': 74.204618
  },
  'openingHoursSpecification': {
    '@type': 'OpeningHoursSpecification',
    'dayOfWeek': [
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    'opens': '11:00',
    'closes': '20:00'
  },
  'sameAs': [
    'https://www.instagram.com/aurerxa',
    'https://www.facebook.com/aurerxa'
  ]
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'AURERXA',
  'url': 'https://www.aurerxa.com',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': 'https://www.aurerxa.com/collections?search={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
}

async function MaterialShowcaseSection() {
  const { getFilteredProducts } = await import('@/app/actions')
  const [realGold, goldPlated, bentex] = await Promise.all([
    getFilteredProducts({ material_type: 'real_gold' }),
    getFilteredProducts({ material_type: 'gold_plated' }),
    getFilteredProducts({ material_type: 'bentex' })
  ])
  const { MaterialShowcase } = await import('@/components/material-showcase')
  return (
    <LazySection fallback={<div className="min-h-[500px]" />}>
      <MaterialShowcase
        realGoldProducts={realGold as any}
        goldPlatedProducts={goldPlated as any}
        bentexProducts={bentex as any}
      />
    </LazySection>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
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


      <RecentlyViewed />
      <Newsletter />
    </div>
  )
}
