'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { addToCart, getFilteredProducts, getCategories } from '@/app/actions'
import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, SlidersHorizontal, X, ChevronDown, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  sizes?: string[]
  categories?: { name: string; slug: string }
}

const priceRanges = [
  { label: 'All Prices', min: 0, max: 0 },
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹50,000', min: 10000, max: 50000 },
  { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
  { label: 'Above ₹1,00,000', min: 100000, max: 0 },
]

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

function CollectionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const categoryParam = searchParams.get('category') || searchParams.get('material') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [selectedSort, setSelectedSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const priceRange = priceRanges[selectedPriceRange]
      const data = await getFilteredProducts({
        category: selectedCategory || undefined,
        minPrice: priceRange.min || undefined,
        maxPrice: priceRange.max || undefined,
        sortBy: selectedSort
      })
      setProducts(data as Product[])
      setLoading(false)
    }
    loadProducts()
  }, [selectedCategory, selectedPriceRange, selectedSort])

  const handleAddToCart = async (id: string, name: string) => {
    setLoadingId(id)
    try {
      const result = await addToCart(id, name)
      setMessage(result.message)
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoadingId(null)
    }
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedPriceRange(0)
    setSelectedSort('newest')
    router.push('/collections')
  }

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedPriceRange !== 0 ? 1 : 0)

  const categoryTitle = selectedCategory
    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection`
    : 'All Collections'

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 to-neutral-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Discover
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
            {categoryTitle}
          </h1>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-4" />
          <p className="text-white/50 max-w-xl mx-auto font-light">
            {products.length} products
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-[40px] md:top-[80px] z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-700 text-sm hover:border-amber-500 transition-colors md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-neutral-950 text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4">
              {/* Category */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-neutral-900 border border-neutral-700 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>

              {/* Price Range */}
              <div className="relative">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                  className="appearance-none bg-neutral-900 border border-neutral-700 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {priceRanges.map((range, i) => (
                    <option key={i} value={i}>{range.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              </div>

              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-amber-500 text-sm hover:text-amber-400 flex items-center gap-1">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none bg-neutral-900 border border-neutral-700 px-4 py-2 pr-10 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-800 md:hidden space-y-4">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-neutral-900 border border-neutral-700 px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                  className="w-full appearance-none bg-neutral-900 border border-neutral-700 px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {priceRanges.map((range, i) => (
                    <option key={i} value={i}>{range.label}</option>
                  ))}
                </select>
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="w-full py-2 border border-amber-500 text-amber-500 text-sm hover:bg-amber-500/10">
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-white/50 py-20">
              <p>No products found matching your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-amber-500 hover:text-amber-400">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all duration-500"
                >
                  <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />

                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-2 right-2 bg-red-900/80 text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                        Only {product.stock} Left
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-sm md:text-base font-serif font-medium mb-1 text-white line-clamp-1 hover:text-amber-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {product.categories?.name && (
                      <p className="text-xs text-white/40 mb-2">{product.categories.name}</p>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-lg font-serif font-bold text-amber-400">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product.id, product.name)}
                      disabled={loadingId !== null || product.stock === 0}
                      className={`w-full mt-3 font-medium uppercase tracking-wider h-9 text-xs transition-all duration-300 ${product.stock === 0
                          ? 'bg-neutral-800 text-white/30 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                        }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : (
                        loadingId === product.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : 'Add to Cart'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 text-center text-sm text-white fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
              {message}
            </div>
          )}
        </div>
      </section>

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
