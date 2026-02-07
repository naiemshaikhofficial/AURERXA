'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface Product {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    slug: string
    categories?: { name: string; slug: string }
    purity?: string
    weight_grams?: number
    gender?: string
    stock?: number
}

interface ProductCardProps {
    product: Product
    viewMode?: 'grid' | 'list' | 'compact'
    index?: number
    className?: string
    onClose?: () => void // For search modal etc
}

export function ProductCard({ product, viewMode = 'grid', index = 0, className, onClose }: ProductCardProps) {
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
        if (onClose) onClose()
        router.push('/checkout')
    }

    if (viewMode === 'compact') {
        return (
            <div
                className={cn(
                    "group relative bg-neutral-900 border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col",
                    className
                )}
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

                <div className="p-3 space-y-1.5 bg-black flex-1 flex flex-col">
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
                    </div>

                    <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-light text-white/90">
                            ₹{product.price.toLocaleString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 pt-1">
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

    return (
        <motion.div
            layout={viewMode !== 'list'}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn(
                "group relative bg-neutral-900 border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col",
                viewMode === 'list' ? 'md:flex-row md:items-center' : '',
                className
            )}
        >
            <div className={cn(
                "relative overflow-hidden group/img",
                viewMode === 'grid' ? 'aspect-square w-full' : 'aspect-video md:aspect-[21/9] md:w-1/2'
            )}>
                <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 block" />
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />
            </div>

            {/* Product Info */}
            <div className={cn(
                "p-4 space-y-2 relative z-10 bg-black flex-1 flex flex-col",
                viewMode === 'list' ? 'md:p-8' : ''
            )}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-[10px] text-amber-500 font-premium-sans tracking-widest uppercase truncate">
                                {product.categories?.name || 'EXCLUSIVE'}
                            </p>
                            {product.purity && (
                                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] uppercase tracking-wider text-amber-500 font-bold">
                                    {product.purity}
                                </span>
                            )}
                            {product.weight_grams && (
                                <span className="px-1.5 py-0.5 border border-white/10 text-[8px] uppercase tracking-wider text-white/40">
                                    {product.weight_grams}g
                                </span>
                            )}
                        </div>
                        <Link href={`/products/${product.slug}`}>
                            <h3 className="text-lg font-serif text-white font-medium group-hover:text-amber-500 transition-colors leading-tight">
                                {product.name}
                            </h3>
                        </Link>
                        {product.description && (
                            <p className="mt-1 text-[11px] text-white/30 font-light line-clamp-2 leading-tight">
                                {product.description}
                            </p>
                        )}
                    </div>
                    <span className="text-lg font-light text-white/90 whitespace-nowrap self-start">
                        ₹{product.price.toLocaleString()}
                    </span>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 overflow-hidden max-h-24 opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100 transition-all duration-500 ease-out pt-1">
                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="w-full bg-neutral-800 border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 h-8 text-[8px] uppercase font-bold tracking-widest rounded-none"
                    >
                        {isAdding ? '...' : 'Add'}
                    </Button>
                    <Button
                        onClick={handleBuyNow}
                        disabled={isBuying}
                        className="w-full bg-amber-500 text-black hover:bg-amber-400 transition-all duration-300 h-8 text-[8px] uppercase font-bold tracking-widest rounded-none shadow-lg"
                    >
                        {isBuying ? '...' : 'Buy'}
                    </Button>
                </div>

                <div className="w-full h-[1px] bg-white/10 group-hover:bg-amber-500/50 transition-colors mt-auto" />
            </div>
        </motion.div>
    )
}
