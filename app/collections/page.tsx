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

// Premium Dropdown Component
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

  const categoryParam = searchParams.get('category') || searchParams.get('material') || ''
  const { addItem } = useCart()
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
    getCategories().then(data => {
      const formatted = data.map((c: any) => ({ label: c.name, value: c.slug }))
      setCategories(formatted)
    })
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

  const handleAddToCart = async (product: Product) => {
    setLoadingId(product.id)
    try {
      await addItem(product.id, 'Standard', 1, product)
      setMessage('Added to your cart')
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
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 to-neutral-900 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-amber-500 text-xs tracking-[0.4em] uppercase mb-4 font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            Heritage & Craft
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            {categoryTitle}
          </h1>
          <div className="w-20 h-px mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-6" />
          <p className="text-white/40 max-w-xl mx-auto font-light text-sm md:text-base animate-in fade-in slide-in-from-bottom-8 duration-700">
            Displaying {products.length} exclusive pieces from our master craftsmen
          </p>
        </div>
      </section>

      {/* Premium Filters Bar */}
      <section className="sticky top-[40px] md:top-[80px] z-40 bg-neutral-950/80 backdrop-blur-xl border-y border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-4 md:gap-8">

            {/* Left: Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 px-5 py-2.5 bg-neutral-900 border border-neutral-800 text-sm font-medium text-white hover:border-amber-500 transition-all md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              Filter By
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Middle: Desktop Filters with Premium Dropdowns */}
            <div className="hidden md:flex items-center gap-6">
              <FilterDropdown
                label="Category"
                value={selectedCategory}
                options={[{ label: 'All Categories', value: '' }, ...categories]}
                onChange={setSelectedCategory}
              />

              <FilterDropdown
                label="Price Range"
                value={selectedPriceRange}
                options={priceRanges.map((r, i) => ({ label: r.label, value: i }))}
                onChange={setSelectedPriceRange}
              />

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="group flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/50 hover:text-red-400 transition-all ml-2"
                >
                  <div className="p-1 rounded-full border border-neutral-800 group-hover:border-red-400/30 transition-all">
                    <X className="w-3 h-3" />
                  </div>
                  Reset Filters
                </button>
              )}
            </div>

            {/* Right: Sort Dropdown */}
            <div className="w-full md:w-auto ml-auto">
              <FilterDropdown
                label="Sort By"
                value={selectedSort}
                options={sortOptions}
                onChange={setSelectedSort}
              />
            </div>
          </div>

          {/* Mobile Filters Panel (Accordion style) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-800 md:hidden space-y-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] px-1">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'All', value: '' }, ...categories].map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-4 py-3 text-sm text-left border transition-all ${selectedCategory === cat.value
                          ? 'border-amber-500 bg-amber-500/5 text-amber-400'
                          : 'border-neutral-800 bg-neutral-900/50 text-white/60'
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-white/30 uppercase tracking-[0.2em] px-1">Price Range</label>
                  <div className="grid grid-cols-1 gap-2">
                    {priceRanges.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPriceRange(i)}
                        className={`px-4 py-3 text-sm text-left border transition-all ${selectedPriceRange === i
                          ? 'border-amber-500 bg-amber-500/5 text-amber-400'
                          : 'border-neutral-800 bg-neutral-900/50 text-white/60'
                          }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full py-4 border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-none h-14 uppercase tracking-[0.2em] text-xs"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full" />
                <div className="absolute inset-0 border-2 border-transparent border-t-amber-500 rounded-full animate-spin" />
              </div>
              <p className="text-amber-500/50 text-xs uppercase tracking-[0.3em] font-light">Loading Collection</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 animate-in fade-in duration-700">
              <div className="mb-6 inline-flex p-6 rounded-full bg-neutral-900 border border-neutral-800">
                <SlidersHorizontal className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-serif text-white mb-2">No masterpieces found</h3>
              <p className="text-white/40 mb-8 max-w-sm mx-auto">Try adjusting your filters or search criteria to explore other parts of our heritage collection.</p>
              <button
                onClick={clearFilters}
                className="text-amber-500 hover:text-amber-400 border-b border-amber-500/30 pb-1 text-sm tracking-widest uppercase transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group animate-in fade-in slide-in-from-bottom-6 duration-700"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                    <Link href={`/products/${product.id}`} className="block h-full">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500" />

                      {/* Floating Info Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <div className="w-full bg-neutral-950/80 backdrop-blur-md p-4 border border-amber-500/20 text-center">
                          <p className="text-[10px] text-amber-500 uppercase tracking-widest mb-1">View Piece</p>
                          <p className="text-xs text-white uppercase tracking-widest font-light">AURERXA Heritage</p>
                        </div>
                      </div>
                    </Link>

                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                        Rare Acquisition
                      </div>
                    )}
                  </div>

                  <div className="mt-6 text-center">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-base font-serif text-white hover:text-amber-400 transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-center gap-4 mt-2 mb-4">
                      <div className="w-4 h-px bg-neutral-800" />
                      <span className="text-amber-500 font-serif text-lg">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <div className="w-4 h-px bg-neutral-800" />
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={loadingId !== null || product.stock === 0}
                      className={`w-full font-medium uppercase tracking-[0.2em] h-12 text-[10px] transition-all duration-500 rounded-none border ${product.stock === 0
                        ? 'bg-transparent border-neutral-800 text-white/20'
                        : 'bg-transparent border-neutral-800 text-white hover:bg-white hover:text-neutral-950 hover:border-white'
                        }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : (
                        loadingId === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : 'Add to Cart'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
              <div className="bg-amber-500 text-neutral-950 px-8 py-4 font-bold uppercase tracking-[0.2em] text-xs shadow-2xl">
                {message}
              </div>
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
