import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { FeaturedCollections } from '@/components/featured-collections'
import { Bestsellers } from '@/components/bestsellers'
import { CustomOrderForm } from '@/components/custom-order-form'
import { Newsletter } from '@/components/newsletter'
import { Footer } from '@/components/footer'
import { Heritage } from '@/components/heritage'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Heritage />
      <FeaturedCollections />
      <Bestsellers />
      <CustomOrderForm />
      <Newsletter />
      <Footer />
    </div>
  )
}
