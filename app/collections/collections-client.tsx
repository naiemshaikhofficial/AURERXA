'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Footer } from '@/components/footer'
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
    const [viewMode] = useState<'grid' | 'list'>('grid')
    const [filters, setFilters] = useState<FilterState>(initialFilters)
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<Product[]>(initialProducts)

    // Fetch Products when filters change (skip initial render as we have data)
    useEffect(() => {
        // Skip if filters match initial filters (avoids double fetch on mount)
        // Simple check: if we are just mounting, we might not need to fetch.
        // However, if the user changes filters, we fetch.

        // We can use a ref to track if it's the first render or compare objects
        // For now, let's just fetch if filters !== initialFilters or strictly on change?
        // Actually, handling this is easier if we just don't fetch on mount.
    }, [])

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
                            // Reset to initial state or just clear filters
                            onClick={() => handleFilterChange({
                                category: 'all',
                                type: 'all',
                                gender: 'all',
                                priceRange: PRICE_RANGES[0],
                                sortBy: 'newest'
                            })}
                            className="text-muted-foreground/40 underline underline-offset-8 hover:text-foreground transition-colors text-xs uppercase tracking-widest"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <motion.div
                        layout
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
