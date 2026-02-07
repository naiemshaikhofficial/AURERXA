'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, X, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'aurerxa_recently_viewed'
const MAX_ITEMS = 6

interface Product {
    id: string
    name: string
    price: number
    image_url: string
    slug: string
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
                    {products.map((product, idx) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group relative animate-in fade-in slide-in-from-bottom-6 duration-700"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 border border-neutral-800 group-hover:border-amber-500/30 transition-all duration-500">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500" />

                                {/* Quick View Hover */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                        <img
                                            src="https://img.icons8.com/?size=100&id=82708&format=png&color=FFFFFF"
                                            alt="View"
                                            className="w-4 h-4"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-center group-hover:-translate-y-1 transition-transform duration-300">
                                <h3 className="font-serif text-sm text-white/80 group-hover:text-amber-400 transition-colors truncate mb-1 italic">
                                    {product.name}
                                </h3>
                                <p className="text-amber-500 text-xs tracking-widest font-bold">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
