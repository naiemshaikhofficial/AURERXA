'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard, Product } from '@/components/product-card'

const STORAGE_KEY = 'aurerxa_recently_viewed'
const MAX_ITEMS = 6

// Helper to get from localStorage
function getRecentlyViewed(): Product[] {
    if (typeof window === 'undefined') return []
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

// Helper to add to localStorage
export function addToRecentlyViewed(product: any) {
    if (typeof window === 'undefined') return
    try {
        let items = getRecentlyViewed()
        // Remove if already exists
        items = items.filter((p) => p.id !== product.id)

        // Prepare simplified product for storage
        const storedProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            slug: product.slug,
            purity: product.purity,
            weight_grams: product.weight_grams,
            categories: product.categories
        }

        // Add to beginning
        items.unshift(storedProduct)
        // Keep only max items
        items = items.slice(0, MAX_ITEMS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
        // ignore
    }
}

export function RecentlyViewed() {
    const [products, setProducts] = useState<Product[]>([])

    useEffect(() => {
        setProducts(getRecentlyViewed())
    }, [])

    if (products.length === 0) return null

    return (
        <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-950 border-t border-neutral-900 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="space-y-2 animate-in slide-in-from-left-8 duration-700">
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <img
                                src="https://img.icons8.com/?size=100&id=82711&format=png&color=F59E0B"
                                alt="Sparkles"
                                className="w-5 h-5"
                            />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Your Collection</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
                            Recently Viewed <span className="text-amber-500 italic">Pieces</span>
                        </h2>
                        <p className="text-white/40 font-light max-w-md">Continue exploring the heritage pieces that caught your eye.</p>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem(STORAGE_KEY)
                            setProducts([])
                        }}
                        className="group flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/30 hover:text-red-400 transition-all pb-1 border-b border-transparent hover:border-red-400/30"
                    >
                        <img
                            src="https://img.icons8.com/?size=100&id=82732&format=png&color=666666"
                            alt="Clear"
                            className="w-5 h-5 group-hover:rotate-90 transition-transform group-hover:brightness-150"
                        />
                        Clear History
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                    {products.map((product, idx) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            viewMode="compact"
                            index={idx}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
