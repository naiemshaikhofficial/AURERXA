'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { fadeInUp, PREMIUM_EASE } from '@/lib/animation-constants'

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
    priority?: boolean
}

export function ProductCard({ product, viewMode = 'grid', index = 0, className, onClose, priority = false }: ProductCardProps) {
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
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: index * 0.05, ease: PREMIUM_EASE }}
            className={cn(
                "group relative bg-card border border-border overflow-hidden flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 will-change-transform",
                viewMode === 'list' ? 'md:flex-row md:items-center' : '',
                className
            )}
        >
            <div className={cn(
                "relative overflow-hidden group/img bg-muted",
                viewMode === 'grid' ? 'aspect-[4/5] w-full' : 'aspect-square md:aspect-[3/4] md:w-1/3' // Portfolio aspect ratio
            )}>
                <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 block" onClick={onClose} />
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    priority={priority || index < 4}
                />
                {/* Matte overlay instead of gradient */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
            </div>

            {/* Product Info - Minimalist Editorial Style */}
            <div className={cn(
                "p-5 space-y-3 relative z-10 bg-card flex-1 flex flex-col",
                viewMode === 'list' ? 'md:p-8 md:justify-center' : ''
            )}>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1 opacity-60">
                        <p className="text-[9px] text-muted-foreground font-premium-sans tracking-[0.2em] uppercase truncate">
                            {product.categories?.name || 'Collection'}
                        </p>
                    </div>

                    <Link href={`/products/${product.slug}`} onClick={onClose}>
                        <h3 className="text-base font-serif text-foreground/90 font-medium group-hover:text-primary transition-colors duration-500 leading-snug">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-light text-foreground/80">
                            ₹{product.price.toLocaleString()}
                        </span>
                        {product.weight_grams && (
                            <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">
                                {product.weight_grams}g
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons - Revealed on Hover with Matte Style */}
                <div className="hidden md:grid grid-cols-2 gap-px bg-border opacity-0 group-hover:opacity-100 transition-all duration-500 mt-auto pt-4">
                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="w-full bg-background text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 h-9 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-t border-r border-border"
                    >
                        {isAdding ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button
                        onClick={handleBuyNow}
                        disabled={isBuying}
                        className="w-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300 h-9 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-t border-border"
                    >
                        {isBuying ? 'Processing...' : 'Buy Now'}
                    </Button>
                </div>

                {/* Mobile Button (Always Visible) */}
                <div className="md:hidden mt-auto pt-3">
                    <Button
                        onClick={handleBuyNow}
                        className="w-full bg-muted border border-border text-foreground hover:bg-foreground hover:text-background transition-all h-10 text-[10px] uppercase font-premium-sans tracking-widest"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
