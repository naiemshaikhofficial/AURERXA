'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Search } from 'lucide-react'
import { Footer } from '@/components/footer'
import { useSearch } from '@/context/search-context'
import { getFilteredProducts } from '@/app/actions'
import { HeritageHighlights } from '@/components/heritage-highlights'
import { CinematicFilter, FilterState, PRICE_RANGES } from '@/components/cinematic-filter'
import { ProductCard, Product } from '@/components/product-card'
import { cn } from '@/lib/utils'

interface CollectionsClientProps {
    initialProducts: Product[]
    categories: any[]
    initialFilters: FilterState
}

export function CollectionsClient({ initialProducts, categories, initialFilters }: CollectionsClientProps) {
    const { openSearch } = useSearch()
    const [viewMode] = useState<'grid' | 'list'>('grid')
    const [filters, setFilters] = useState<FilterState>(initialFilters)
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>(initialProducts)
    const [searchQuery, setSearchQuery] = useState(initialFilters.search || '')

    // Filters are initialized from props, no need for effect on mount

    const handleFilterChange = async (newFilters: FilterState) => {
        setFilters(newFilters)
        setLoading(true)
        try {
            const data = await getFilteredProducts({
                sortBy: newFilters.sortBy,
                category: newFilters.category === 'all' ? undefined : newFilters.category,
                sub_category: newFilters.sub_category === 'all' ? undefined : newFilters.sub_category,
                tag: newFilters.tag || undefined,
                occasion: newFilters.occasion === 'all' ? undefined : newFilters.occasion,
                gender: newFilters.gender === 'all' ? undefined : newFilters.gender,
                type: newFilters.type === 'all' ? undefined : newFilters.type,
                minPrice: newFilters.priceRange.min,
                maxPrice: newFilters.priceRange.max || undefined,
                search: newFilters.search || undefined
            })
            // Cast through unknown to resolve type overlap issue
            setProducts(data as unknown as Product[])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                handleFilterChange({ ...filters, search: searchQuery })
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            {/* Hero Header - Matte Luxury Edition */}
            <div className="relative pt-10 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-background z-0" />

                <div className="relative z-10 max-w-7xl mx-auto text-center space-y-10">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
                        <div className="inline-flex items-center gap-6 mb-8 opacity-60">
                            <div className="h-[1px] w-16 bg-foreground/20" />
                            <span className="text-foreground font-premium-sans text-[10px] tracking-[0.4em] uppercase">
                                {filters.tag ? 'The Collection' : 'The Archive'}
                            </span>
                            <div className="h-[1px] w-16 bg-foreground/20" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-serif font-medium text-foreground/90 tracking-tight leading-none mb-4 uppercase">
                            {filters.tag
                                ? `${filters.tag} Collection`
                                : filters.category !== 'all'
                                    ? categories.find(c => c.slug === filters.category)?.name || 'Collections'
                                    : 'Collections'}
                        </h1>
                        <p className="max-w-xl mx-auto text-muted-foreground font-light text-sm tracking-widest uppercase leading-loose">
                            {filters.tag
                                ? `Curated pieces from our ${filters.tag} series.`
                                : 'Curated masterpieces for the modern connoisseur.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-32 relative z-10">
                <h2 className="sr-only">Product Catalog</h2>
                <CinematicFilter
                    categories={categories}
                    initialFilters={filters}
                    onFiltersChange={handleFilterChange}
                    productCount={products.length}
                />

                {/* In-Page Search Bar */}
                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH WITHIN COLLECTION..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card/40 border border-border focus:border-primary/50 rounded-full py-4 pl-12 pr-4 text-[10px] font-premium-sans tracking-[0.2em] outline-none transition-all placeholder:text-muted-foreground/20 uppercase"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                            >
                                <Loader2 className={cn("w-3 h-3 text-muted-foreground/40", loading && "animate-spin")} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Product Grid */}
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
                            // Reset to default state
                            onClick={() => {
                                setSearchQuery('')
                                handleFilterChange({
                                    category: 'all',
                                    sub_category: 'all',
                                    type: 'all',
                                    gender: 'all',
                                    tag: undefined, // Added tag reset
                                    occasion: 'all',
                                    priceRange: { label: 'All Prices', min: 0, max: null },
                                    sortBy: 'newest',
                                    search: ''
                                })
                            }}
                            className="text-muted-foreground/40 underline underline-offset-8 hover:text-foreground transition-colors text-xs uppercase tracking-widest"
                        >
                            Clear Filters
                        </button>
                        <div className="pt-4">
                            <button
                                onClick={openSearch}
                                className="flex items-center gap-3 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all group"
                            >
                                <Search className="w-3.5 h-3.5 text-primary/60" />
                                <span className="text-[10px] font-premium-sans tracking-[0.2em] uppercase">Search All Heritage</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
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
                                // Prioritize the first few images for LCP
                                priority={i < 4}
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
