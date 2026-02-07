'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { searchProducts } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'

function SearchResultCard({ product, idx, onClose }: { product: any; idx: number; onClose: () => void }) {
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
        onClose()
        router.push('/checkout')
    }

    return (
        <div
            className="group relative animate-in fade-in slide-in-from-bottom-6 duration-700 bg-neutral-900 border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col"
            style={{ animationDelay: `${idx * 50}ms` }}
        >
            <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="relative aspect-square overflow-hidden bg-neutral-900 block group/img"
            >
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    unoptimized
                />
                <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500" />
            </Link>

            <div className="p-3 space-y-1.5 bg-black flex-1 flex flex-col items-start text-left">
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[8px] text-amber-500 font-premium-sans tracking-widest uppercase truncate">
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
                    <Link href={`/products/${product.slug}`} onClick={onClose} className="w-full">
                        <h3 className="text-sm font-serif text-white font-medium group-hover:text-amber-400 transition-colors leading-tight truncate">
                            {product.name}
                        </h3>
                    </Link>
                    {product.description && (
                        <p className="text-[10px] text-white/30 font-light line-clamp-1 leading-tight">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-light text-white/90">
                        ₹{product.price.toLocaleString()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full opacity-100 transition-all duration-500 pt-1">
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

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        const handleSearch = async () => {
            if (query.trim().length < 2) {
                setResults([])
                return
            }
            setLoading(true)
            const data = await searchProducts(query)
            setResults(data)
            setLoading(false)
        }

        const debounce = setTimeout(handleSearch, 300)
        return () => clearTimeout(debounce)
    }, [query])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 md:pt-32 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl px-4 md:px-6">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-4 md:right-0 p-2 text-white/40 hover:text-amber-500 transition-colors"
                >
                    <img
                        src="https://img.icons8.com/?size=100&id=82732&format=png&color=999999"
                        alt="Close"
                        className="w-5 h-5"
                    />
                </button>

                {/* Search Header */}
                <div className="relative mb-12 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="flex items-center gap-6 border-b border-neutral-800 pb-4 group focus-within:border-amber-500 transition-colors">
                        <img
                            src="https://img.icons8.com/?size=100&id=VNGluvySmxmA&format=png&color=333333"
                            alt="Search"
                            className="w-5 h-5 group-focus-within:brightness-200 transition-all opacity-40 group-focus-within:opacity-100"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="SEARCH OUR HERITAGE..."
                            className="w-full bg-transparent border-none text-2xl md:text-5xl font-serif text-white placeholder:text-white/10 focus:outline-none uppercase tracking-widest"
                        />
                        {loading && (
                            <img
                                src="https://img.icons8.com/?size=100&id=82738&format=png&color=F59E0B"
                                alt="Loading"
                                className="w-6 h-6 animate-spin"
                            />
                        )}
                    </div>
                </div>

                {/* Results Area */}
                <div className="min-h-[200px]">
                    {query.trim().length >= 2 ? (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            {results.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.map((product, idx) => (
                                        <SearchResultCard key={product.id} product={product} idx={idx} onClose={onClose} />
                                    ))}
                                </div>
                            ) : !loading && (
                                <div className="text-center py-20 animate-in zoom-in-95 duration-300">
                                    <p className="text-white/20 text-lg md:text-2xl font-serif italic mb-2">No masterpieces found for "{query}"</p>
                                    <p className="text-white/40 text-sm tracking-widest uppercase font-light">Try exploring our collections instead</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-700">
                            {/* Popular Searches */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h4 className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-6">Popular Collections</h4>
                                    <div className="flex flex-col gap-4">
                                        {['Gold', 'Silver', 'Diamond', 'Platinum'].map((cat) => (
                                            <Link
                                                key={cat}
                                                href={`/collections?category=${cat.toLowerCase()}`}
                                                onClick={onClose}
                                                className="group flex items-center justify-between text-xl font-serif text-white/60 hover:text-white transition-all"
                                            >
                                                <span className="group-hover:translate-x-4 transition-transform duration-300 italic">{cat} Collection</span>
                                                <img
                                                    src="https://img.icons8.com/?size=100&id=82731&format=png&color=F59E0B"
                                                    alt="Arrow"
                                                    className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all"
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <h4 className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-6">Discovery</h4>
                                    <div className="p-8 bg-neutral-900 border border-neutral-800 text-center space-y-4">
                                        <p className="text-white font-serif text-lg italic">"Jewelry is more than art; it's heritage."</p>
                                        <Link
                                            href="/collections"
                                            onClick={onClose}
                                            className="inline-block text-[10px] text-amber-500 uppercase tracking-widest border-b border-amber-500/30 pb-1 hover:border-amber-500 transition-colors"
                                        >
                                            Explore Complete Vault
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
