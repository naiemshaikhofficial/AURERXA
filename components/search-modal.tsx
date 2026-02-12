'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { searchProducts } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/context/search-context'

import { ProductCard } from '@/components/product-card'

export function SearchModal() {
    const { isSearchOpen: isOpen, closeSearch: onClose } = useSearch()
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
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            viewMode="compact"
                                            index={idx}
                                            onClose={onClose}
                                        />
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
