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
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Hero Header - Matte Luxury Edition */}
      <div className="relative pt-10 pb-20 px-6 overflow-hidden">
        {/* Removed Image Background for PURE MATTE feel or kept very subtle */}
        <div className="absolute inset-0 bg-background z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 bg-repeat pointer-events-none mix-blend-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-6 mb-8 opacity-60">
              <div className="h-[1px] w-16 bg-foreground/20" />
              <span className="text-foreground font-premium-sans text-[10px] tracking-[0.4em] uppercase">The Archive</span>
              <div className="h-[1px] w-16 bg-foreground/20" />
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-medium text-foreground/90 tracking-tight leading-none mb-4">
              COLLECTIONS
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground font-light text-sm tracking-widest uppercase leading-loose">
              Curated masterpieces for the modern connoisseur.
            </p>
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
            <Loader2 className="w-8 h-8 text-muted-foreground/20 animate-spin" />
            <span className="text-[10px] font-premium-sans text-muted-foreground/30 tracking-[0.3em] animate-pulse">ACQUIRING DATA...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 opacity-50">
            <span className="text-6xl text-muted-foreground/5 font-serif">Empty</span>
            <p className="text-xs text-muted-foreground/30 font-premium-sans tracking-widest uppercase">No artifacts found in this specific curation.</p>
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
              className="text-muted-foreground/40 underline underline-offset-8 hover:text-foreground transition-colors text-xs uppercase tracking-widest"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-4 md:gap-px bg-card/5 border border-border p-px ${viewMode === 'grid'
              ? 'grid-cols-2 lg:grid-cols-3'
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
