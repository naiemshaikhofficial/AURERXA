'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getFilteredProducts, getCategories } from '@/app/actions'
import { HeritageHighlights } from '@/components/heritage-highlights'
import { CinematicFilter, FilterState, PRICE_RANGES } from '@/components/cinematic-filter'
import { ProductCard, Product } from '@/components/product-card'

function CollectionsContent() {
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<any[]>([])
  const [viewMode] = useState<'grid' | 'list'>('grid') // Defaulted to grid for now, can be stateful if needed

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    type: 'all',
    gender: 'all',
    priceRange: PRICE_RANGES[0],
    sortBy: 'newest'
  })

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

  // Load Categories & Initial Filter from URL
  useEffect(() => {
    async function init() {
      const cats = await getCategories()
      setCategories([{ name: 'All Collections', slug: 'all' }, ...cats])

      const materialParam = searchParams.get('material')
      if (materialParam) {
        setFilters(prev => ({ ...prev, category: materialParam }))
      }
    }
    init()
  }, [searchParams])

  // Fetch Products when filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      // Simulate "Heavy" Luxurious Loading delay
      await new Promise(r => setTimeout(r, 600))

      try {
        const data = await getFilteredProducts({
          sortBy: filters.sortBy,
          category: filters.category === 'all' ? undefined : filters.category,
          gender: filters.gender === 'all' ? undefined : filters.gender,
          type: filters.type === 'all' ? undefined : filters.type,
          minPrice: filters.priceRange.min,
          maxPrice: filters.priceRange.max || undefined
        })
        setProducts(data as Product[])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [filters])

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />

      {/* Hero Header - Black Edition */}
      <div className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 grayscale brightness-50" style={{ backgroundImage: "url('/heritage-rings.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-amber-500/50" />
              <span className="text-amber-500 font-premium-sans text-[10px] tracking-[0.4em] uppercase">Curated Excellence</span>
              <div className="h-[1px] w-12 bg-amber-500/50" />
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-black text-white tracking-tight uppercase italic drop-shadow-2xl">
              The <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-amber-700">Collection</span>
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-32 relative z-10">
        {/* Cinematic Filter Integration */}
        <CinematicFilter
          categories={categories}
          initialFilters={filters}
          onFiltersChange={setFilters}
          productCount={products.length}
        />

        {/* Product Grid - "Jyada Animative" */}
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <span className="text-xs font-premium-sans text-amber-500/50 animate-pulse tracking-[0.3em]">RETRIEVING ARTIFACTS...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 opacity-50">
            <span className="text-6xl text-white/10">∅</span>
            <h3 className="text-xl font-serif text-white/40">No Treasures Found</h3>
            <p className="text-sm text-white/30">Refine your search to uncover hidden gems.</p>
            <button
              onClick={() => {
                setFilters({
                  category: 'all',
                  type: 'all',
                  gender: 'all',
                  priceRange: PRICE_RANGES[0],
                  sortBy: 'newest'
                })
              }}
              className="text-amber-500 underline underline-offset-4 hover:text-amber-400"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-4 md:gap-8 ${viewMode === 'grid'
              ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              }`}
          >
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </div>
      <HeritageHighlights />
      <Footer />
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <Suspense>
      <CollectionsContent />
    </Suspense>
  )
}
