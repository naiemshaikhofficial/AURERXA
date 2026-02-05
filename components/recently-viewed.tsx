'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, ChevronRight } from 'lucide-react'

const STORAGE_KEY = 'aurerxa_recently_viewed'
const MAX_ITEMS = 6

interface Product {
    id: string
    name: string
    price: number
    image_url: string
}

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
export function addToRecentlyViewed(product: Product) {
    if (typeof window === 'undefined') return
    try {
        let items = getRecentlyViewed()
        // Remove if already exists
        items = items.filter((p) => p.id !== product.id)
        // Add to beginning
        items.unshift(product)
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
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-950">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-serif font-bold flex items-center gap-2">
                        <Eye className="w-5 h-5 text-amber-500" />
                        Recently Viewed
                    </h2>
                    <button
                        onClick={() => {
                            localStorage.removeItem(STORAGE_KEY)
                            setProducts([])
                        }}
                        className="text-sm text-white/40 hover:text-white/60"
                    >
                        Clear
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="group bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all"
                        >
                            <div className="relative aspect-square overflow-hidden">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-3">
                                <h3 className="font-serif text-sm truncate mb-1">{product.name}</h3>
                                <p className="text-amber-400 text-sm font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
