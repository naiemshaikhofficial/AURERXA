'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'aurerxa_recently_viewed'
const MAX_ITEMS = 6

interface Product {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    slug: string
    purity?: string
    weight_grams?: number
    categories?: { name: string }
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

function RecentlyViewedCard({ product, idx }: { product: Product; idx: number }) {
    const { addItem } = useCart()
    const router = useRouter()
    const [isAdding, setIsAdding] = useState(false)
    const [isBuying, setIsBuying] = useState(false)

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsAdding(true)
        await addItem(product.id, 'Standard', 1, product)
        setIsAdding(false)
    }

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsBuying(true)
        await addItem(product.id, 'Standard', 1, product)
        router.push('/checkout')
    }

    return (
        <div
            className="group relative animate-in fade-in slide-in-from-bottom-6 duration-700 bg-neutral-900 border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col"
            style={{ animationDelay: `${idx * 100}ms` }}
        >
            <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-neutral-900 block group/img">
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    unoptimized
                />
                <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500" />
            </Link>

            <div className="p-3 space-y-1.5 bg-black flex-1 flex flex-col">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[8px] text-amber-500 font-premium-sans tracking-widest uppercase">
                            {product.categories?.name || 'Exclusive'}
                        </p>
                        {product.purity && (
                            <span className="px-1 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[6px] uppercase tracking-wider text-amber-500 font-bold">
                                {product.purity}
                            </span>
                        )}
                        {product.weight_grams && (
                            <span className="px-1 py-0.5 border border-white/10 text-[6px] uppercase tracking-wider text-white/40">
                                {product.weight_grams}g
                            </span>
                        )}
                    </div>
                    <Link href={`/products/${product.slug}`}>
                        <h3 className="text-sm font-serif text-white font-medium group-hover:text-amber-400 transition-colors leading-tight truncate">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm font-light text-white/90">
                        ₹{product.price.toLocaleString()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 pt-1">
                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="bg-neutral-800 border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 h-6 text-[6px] uppercase font-bold tracking-widest rounded-none px-1"
                    >
                        {isAdding ? '...' : 'Add'}
                    </Button>
                    <Button
                        onClick={handleBuyNow}
                        disabled={isBuying}
                        className="bg-amber-500 text-black hover:bg-amber-400 transition-all duration-300 h-6 text-[6px] uppercase font-bold tracking-widest rounded-none px-1"
                    >
                        {isBuying ? '...' : 'Buy'}
                    </Button>
                </div>
                <div className="w-full h-[1px] bg-white/10 group-hover:bg-amber-500/50 transition-colors mt-auto" />
            </div>
        </div>
    )
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
                        <RecentlyViewedCard key={product.id} product={product} idx={idx} />
                    ))}
                </div>
            </div>
        </section>
    )
}
