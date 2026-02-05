'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getFilteredProducts, getCategories } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { useState, Suspense, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, SlidersHorizontal, X, ChevronDown, Eye, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ParallaxScroll } from '@/components/parallax-scroll'
import { motion } from 'framer-motion'

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
      <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'aspect-[3/4] w-full' : 'aspect-video md:aspect-[21/9] md:w-1/2'} group/img`}>
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-10 block" />

        {/* Image */}
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:contrast-125"
        />

        {/* Hover Flash Overlay - REMOVED for cleaner look */}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

        {/* Quick Actions Buttons - Removed from Image Overlay */}
      </div>

      {/* Product Info */}
      <div className={`p-6 space-y-4 relative z-10 bg-black flex-1 flex flex-col ${viewMode === 'list' ? 'md:p-8' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-amber-500 font-premium-sans tracking-widest mb-1 uppercase">
              {product.categories?.name || 'EXCLUSIVE'}
            </p>
            <Link href={`/products/${product.id}`}>
              <h3 className="text-xl font-serif text-white font-medium group-hover:text-amber-500 transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>
          <span className="text-lg font-light text-white/90">
            ₹{product.price.toLocaleString()}
          </span>
        </div>

        {/* Hover Reveal Buttons (Slide Down) */}
        <div className="grid grid-cols-2 gap-2 overflow-hidden max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 ease-out pt-2">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-neutral-800 border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 h-9 text-[9px] uppercase font-bold tracking-widest rounded-none"
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isBuying}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 transition-all duration-300 h-9 text-[9px] uppercase font-bold tracking-widest rounded-none shadow-lg"
          >
            {isBuying ? 'Loading...' : 'Buy Now'}
          </Button>
        </div>

        {/* Hover Reveal Line */}
        <div className="w-full h-[1px] bg-white/10 group-hover:bg-amber-500/50 transition-colors mt-auto" />
      </div>
    </motion.div>
  )
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  placeholder
}: {
  label: string,
  value: any,
  options: { label: string, value: any }[],
  onChange: (val: any) => void,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-4 px-5 py-2.5 bg-neutral-900/50 border transition-all duration-300 min-w-[180px] group ${isOpen ? 'border-amber-500 bg-neutral-900' : 'border-neutral-800 hover:border-neutral-700'
          }`}
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-white/40 uppercase tracking-widest leading-none mb-1">{label}</span>
          <span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full min-w-[220px] bg-neutral-900 border border-neutral-800 shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-all hover:bg-neutral-800 ${value === opt.value ? 'text-amber-500 bg-neutral-800/50' : 'text-white/70 hover:text-white'
                }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CollectionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])

  // States
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

  // Load Categories & Initial Filter from URL
  useEffect(() => {
    async function init() {
      const cats = await getCategories()
      setCategories([{ name: 'All Collections', slug: 'all' }, ...cats])

      const materialParam = searchParams.get('material')
      if (materialParam) setSelectedCategory(materialParam)
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
          sortBy: selectedSort,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          minPrice: selectedPriceRange.min,
          maxPrice: selectedPriceRange.max || undefined
        })
        setProducts(data as Product[])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategory, selectedSort, selectedPriceRange])

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />

      {/* Global Scanline Overlay - REMOVED */}

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
        {/* Cinematic Toolbar */}
        <div className="sticky top-24 z-40 mb-16 p-1 backdrop-blur-xl bg-neutral-900/80 border border-white/10 rounded-sm shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-4">
            {/* Scrollable Category Filter */}
            <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-6 py-3 text-xs uppercase tracking-widest font-bold transition-all duration-300 border ${selectedCategory === cat.slug
                    ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'bg-transparent text-white/50 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
              <FilterDropdown
                label="Sort By"
                value={selectedSort}
                options={sortOptions}
                onChange={setSelectedSort}
              />
              <div className="w-[1px] h-8 bg-white/10 hidden md:block" />

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-white/10 p-1 bg-neutral-900">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                    <div className="bg-current" />
                    <div className="bg-current" />
                    <div className="bg-current" />
                    <div className="bg-current" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                >
                  <div className="flex flex-col gap-0.5 w-4 h-[14px]">
                    <div className="h-full w-full bg-current" />
                    <div className="h-full w-full bg-current" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

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
              onClick={() => { setSelectedCategory('all'); setSelectedPriceRange(priceRanges[0]) }}
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
