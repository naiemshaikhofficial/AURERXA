'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'
import { searchProducts } from '@/app/actions'

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
            if (query.length < 2) {
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
        <div className="fixed inset-0 z-[100] bg-neutral-950/90 backdrop-blur-md">
            <div className="max-w-2xl mx-auto pt-20 px-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for jewelry..."
                        className="w-full h-14 pl-12 pr-12 bg-neutral-900 border border-neutral-700 text-white text-lg focus:outline-none focus:border-amber-500"
                    />
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results */}
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                        </div>
                    )}

                    {!loading && query.length >= 2 && results.length === 0 && (
                        <p className="text-center text-white/50 py-8">No products found for "{query}"</p>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="space-y-2">
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-3 bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all"
                                >
                                    <div className="relative w-16 h-16 bg-neutral-800 flex-shrink-0">
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{product.name}</p>
                                        <p className="text-sm text-white/50">{product.categories?.name}</p>
                                    </div>
                                    <p className="text-amber-400 font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && query.length < 2 && (
                        <div className="text-center py-12 text-white/40">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Start typing to search products</p>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="mt-8 pt-6 border-t border-neutral-800">
                    <p className="text-sm text-white/40 mb-3">Popular Categories</p>
                    <div className="flex flex-wrap gap-2">
                        {['Gold', 'Silver', 'Diamond', 'Platinum'].map((cat) => (
                            <Link
                                key={cat}
                                href={`/collections?category=${cat.toLowerCase()}`}
                                onClick={onClose}
                                className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-sm hover:border-amber-500/50 transition-colors"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
