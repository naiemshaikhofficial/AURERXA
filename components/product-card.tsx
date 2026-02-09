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

    return (
        <motion.div
            layout={viewMode !== 'list'}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.05, ease: [0.21, 0.45, 0.27, 0.9] }} // Luxury ease
            className={cn(
                "group relative bg-neutral-950 border border-white/5 transition-all duration-700 overflow-hidden flex flex-col",
                viewMode === 'list' ? 'md:flex-row md:items-center' : '',
                className
            )}
        >
            <div className={cn(
                "relative overflow-hidden group/img bg-neutral-900/20",
                viewMode === 'grid' ? 'aspect-[4/5] w-full' : 'aspect-square md:aspect-[3/4] md:w-1/3' // Portfolio aspect ratio
            )}>
                <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 block" onClick={onClose} />
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    unoptimized
                />
                {/* Matte overlay instead of gradient */}
                <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
            </div>

            {/* Product Info - Minimalist Editorial Style */}
            <div className={cn(
                "p-5 space-y-3 relative z-10 bg-neutral-950 flex-1 flex flex-col",
                viewMode === 'list' ? 'md:p-8 md:justify-center' : ''
            )}>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1 opacity-60">
                        <p className="text-[9px] text-white font-premium-sans tracking-[0.2em] uppercase truncate">
                            {product.categories?.name || 'Collection'}
                        </p>
                    </div>

                    <Link href={`/products/${product.slug}`} onClick={onClose}>
                        <h3 className="text-base font-serif text-white/90 font-medium group-hover:text-amber-200 transition-colors duration-500 leading-snug">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-light text-white/80">
                            ₹{product.price.toLocaleString()}
                        </span>
                        {product.weight_grams && (
                            <span className="text-[9px] text-white/30 uppercase tracking-wider">
                                {product.weight_grams}g
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons - Revealed on Hover with Matte Style */}
                <div className="hidden md:grid grid-cols-2 gap-px bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 mt-auto pt-4">
                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="w-full bg-transparent text-white hover:bg-white hover:text-neutral-950 transition-colors duration-300 h-9 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-t border-r border-white/5"
                    >
                        {isAdding ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button
                        onClick={handleBuyNow}
                        disabled={isBuying}
                        className="w-full bg-white/5 text-white hover:bg-primary hover:text-neutral-950 transition-colors duration-300 h-9 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-t border-white/5"
                    >
                        {isBuying ? 'Processing...' : 'Buy Now'}
                    </Button>
                </div>

                {/* Mobile Button (Always Visible) */}
                <div className="md:hidden mt-auto pt-3">
                    <Button
                        onClick={handleBuyNow}
                        className="w-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all h-10 text-[10px] uppercase font-premium-sans tracking-widest"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
