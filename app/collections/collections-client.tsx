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

    // Filters are initialized from props, no need for effect on mount

    const handleFilterChange = async (newFilters: FilterState) => {
        setFilters(newFilters)
        setLoading(true)
        try {
            const data = await getFilteredProducts({
                sortBy: newFilters.sortBy,
                category: newFilters.category === 'all' ? undefined : newFilters.category,
                gender: newFilters.gender === 'all' ? undefined : newFilters.gender,
                type: newFilters.type === 'all' ? undefined : newFilters.type,
                minPrice: newFilters.priceRange.min,
                maxPrice: newFilters.priceRange.max || undefined
            })
            // Cast through unknown to resolve type overlap issue
            setProducts(data as unknown as Product[])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            {/* Hero Header - Matte Luxury Edition */}
            <div className="relative pt-10 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-background z-0" />

                <div className="relative z-10 max-w-7xl mx-auto text-center space-y-10">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
                        <div className="inline-flex items-center gap-6 mb-8 opacity-60">
                            <div className="h-[1px] w-16 bg-foreground/20" />
                            <span className="text-foreground font-premium-sans text-[10px] tracking-[0.4em] uppercase">The Archive</span>
                            <div className="h-[1px] w-16 bg-foreground/20" />
                        </div>
                        {/* H1 is critical LCP element, remove animation or use CSS */}
                        <h1 className="text-6xl md:text-8xl font-serif font-medium text-foreground/90 tracking-tight leading-none mb-4">
                            COLLECTIONS
                        </h1>
                        <p className="max-w-xl mx-auto text-muted-foreground font-light text-sm tracking-widest uppercase leading-loose">
                            Curated masterpieces for the modern connoisseur.
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
                            onClick={() => handleFilterChange({
                                category: 'all',
                                type: 'all',
                                gender: 'all',
                                priceRange: { label: 'All Prices', min: 0, max: null },
                                sortBy: 'newest'
                            })}
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
