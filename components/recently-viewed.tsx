'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard, Product } from '@/components/product-card'
import { Sparkles, Trash2, Clock } from 'lucide-react'

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
        <section className="py-24 bg-neutral-950 border-t border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-amber-200/60" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Your Journey</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">
                            Recently <span className="italic text-amber-200/60">Viewed</span>
                        </h2>
                    </div>

                    <button
                        onClick={() => {
                            localStorage.removeItem(STORAGE_KEY)
                            setProducts([])
                        }}
                        className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all pb-1 border-b border-transparent hover:border-white/20"
                    >
                        <Trash2 className="w-3 h-3 group-hover:text-red-400 transition-colors" />
                        Clear History
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-12">
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
