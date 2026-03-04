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
  const { getNewReleases } = await import('@/app/actions')
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
  const { getGenderStats } = await import('@/app/actions')
  const stats = await getGenderStats()
  return <ShopByGender genderStats={stats} />
}

async function BestsellersSection() {
  const { getBestsellers } = await import('@/app/actions')
  const bestsellers = await getBestsellers()
  return <Bestsellers products={bestsellers as any} />
}

async function FeaturedCollectionsSection() {
  const { getCategories } = await import('@/app/actions')
  const categories = await getCategories()
  return <FeaturedCollections categories={categories} />
}

async function HeroCarouselSection() {
  const { getHeroSlides } = await import('@/app/actions')
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

async function MaterialShowcaseSection() {
  const { getFilteredProducts } = await import('@/app/actions')
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
      <MaterialShowcaseSection />

      <section id="brand-heritage" className="py-24 bg-card/30 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 italic">
            Aurerxa – Premium Gold & Silver <span className="text-primary">Jewellery Online</span> in India
          </h2>
          <div className="prose prose-sm md:prose-base prose-invert mx-auto text-muted-foreground font-light leading-relaxed mb-12">
            <p>
              Welcome to <strong className="text-foreground">Aurerxa</strong>, where elegance meets purity. We offer
              <strong className="text-foreground"> BIS hallmarked 22K gold jewellery</strong> and
              <strong className="text-foreground"> certified 925 silver jewellery</strong> crafted for modern women who value timeless style.
            </p>
            <p>
              Whether you are looking for <strong className="text-foreground">daily wear gold jewellery</strong>,
              lightweight gold earrings, elegant gold rings, or minimal silver jewellery, Aurerxa brings
              <strong className="text-foreground">premium craftsmanship with trusted quality</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
            {[
              { label: 'BIS Hallmarked Gold', icon: '✔' },
              { label: '925 Certified Silver', icon: '✔' },
              { label: 'Secure Payments', icon: '✔' },
              { label: 'Pan India Shipping', icon: '✔' },
              { label: 'Easy Returns', icon: '✔' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 bg-background/50 border border-border/50 rounded-sm">
                <span className="text-primary text-xl font-bold">{item.icon}</span>
                <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6 text-sm md:text-base text-muted-foreground font-light">
            <h3 className="text-xl font-serif font-semibold text-foreground italic">Why Choose Aurerxa?</h3>
            <p>
              Our collections are designed for everyday elegance, festive occasions, and meaningful gifting.
              Every piece is carefully crafted to ensure shine, durability, and purity. Explore our latest
              gold jewellery collection and discover timeless designs made for you.
            </p>
            <p className="font-serif italic text-primary text-lg pt-4">Shop confidently. Shine effortlessly. Choose Aurerxa.</p>
          </div>
        </div>
      </section>

      <RecentlyViewed />
      <Newsletter />
    </div>
  )
}
