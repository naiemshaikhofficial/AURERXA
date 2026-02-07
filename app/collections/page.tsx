'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getFilteredProducts, getCategories } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HeritageHighlights } from '@/components/heritage-highlights'
import { CinematicFilter, FilterState, PRICE_RANGES } from '@/components/cinematic-filter'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  sizes?: string[]
  categories?: { name: string; slug: string }
  slug: string
  purity?: string
  weight_grams?: number
  gender?: string
}

function CollectionProductCard({ product, viewMode, index }: { product: Product, viewMode: 'grid' | 'list', index: number }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAdding(true)
    await addItem(product.id, 'Standard', 1, product)
    setIsAdding(false)
  }

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsBuying(true)
    await addItem(product.id, 'Standard', 1, product)
    router.push('/checkout')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`group relative bg-neutral-900 border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col ${viewMode === 'list' ? 'md:flex-row md:items-center' : ''}`}
    >
      <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'aspect-square w-full' : 'aspect-video md:aspect-[21/9] md:w-1/2'} group/img`}>
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 block" />

        {/* Image */}
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:contrast-125"
          unoptimized
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className={`p-4 space-y-2 relative z-10 bg-black flex-1 flex flex-col ${viewMode === 'list' ? 'md:p-8' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-[10px] text-amber-500 font-premium-sans tracking-widest uppercase truncate">
                {product.categories?.name || 'EXCLUSIVE'}
              </p>
              {product.purity && (
                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] uppercase tracking-wider text-amber-500 font-bold">
                  {product.purity}
                </span>
              )}
              {product.weight_grams && (
                <span className="px-1.5 py-0.5 border border-white/10 text-[8px] uppercase tracking-wider text-white/40">
                  {product.weight_grams}g
                </span>
              )}
            </div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-lg font-serif text-white font-medium group-hover:text-amber-500 transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>
            {product.description && (
              <p className="mt-1 text-[11px] text-white/30 font-light line-clamp-2 leading-tight">
                {product.description}
              </p>
            )}
          </div>
          <span className="text-lg font-light text-white/90 whitespace-nowrap self-start">
            ₹{product.price.toLocaleString()}
          </span>
        </div>

        {/* Buttons - Side by Side on Mobile, Grid on Desktop */}
        <div className="grid grid-cols-2 gap-2 overflow-hidden max-h-24 opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100 transition-all duration-500 ease-out pt-1">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-neutral-800 border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 h-8 text-[8px] uppercase font-bold tracking-widest rounded-none"
          >
            {isAdding ? '...' : 'Add'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isBuying}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 transition-all duration-300 h-8 text-[8px] uppercase font-bold tracking-widest rounded-none shadow-lg"
          >
            {isBuying ? '...' : 'Buy'}
          </Button>
        </div>

        {/* Hover Reveal Line */}
        <div className="w-full h-[1px] bg-white/10 group-hover:bg-amber-500/50 transition-colors mt-auto" />
      </div>
    </motion.div>
  )
}

function CollectionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    type: 'all',
    gender: 'all',
    priceRange: PRICE_RANGES[0],
    sortBy: 'newest'
  })

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
        <div className="absolute inset-0 bg-[url('/heritage-rings.jpg')] bg-cover bg-center opacity-20 grayscale brightness-50" />
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
              <CollectionProductCard
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
