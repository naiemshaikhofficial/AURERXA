'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'
import { cn, sanitizeImagePath } from '@/lib/utils'
import { fadeInUp, PREMIUM_EASE } from '@/lib/animation-constants'

export interface Product {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    images?: string | string[]
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

    const allImages = useMemo(() => {
        const imgs = product.images
        let additional: string[] = []
        if (Array.isArray(imgs)) {
            additional = imgs
        } else if (typeof imgs === 'string') {
            if (imgs.startsWith('{')) {
                additional = imgs.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
            } else if (imgs.startsWith('[')) {
                try {
                    const parsed = JSON.parse(imgs)
                    if (Array.isArray(parsed)) additional = parsed
                } catch (e) {
                    console.error('Failed to parse images JSON', e)
                }
            }
        }

        // Deduplicate to ensure we don't show the same image twice in the carousel
        const unique = Array.from(new Set([product.image_url, ...additional].filter(Boolean)))
        return unique
    }, [product])

    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Scroll Parallax Logic
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    })
    const yParallax = useTransform(scrollYProgress, [0, 1], [-15, 15])

    useEffect(() => {
        if (allImages.length <= 1) return

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
        }, 4000 + (index * 300)) // Slower, more deliberate luxury timing

        return () => clearInterval(interval)
    }, [allImages, index])

    return (
        <motion.div
            ref={containerRef}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
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
                <Link href={`/products/${product.slug}`} className="absolute inset-0 z-30 block" onClick={onClose} />
                <AnimatePresence initial={false}>
                    <motion.div
                        key={allImages[currentImageIndex]}
                        initial={{ x: '100%', rotateY: 10, scale: 0.95, opacity: 0 }}
                        animate={{ x: 0, rotateY: 0, scale: 1, opacity: 1 }}
                        exit={{ x: '-100%', rotateY: -10, scale: 1.05, opacity: 0 }}
                        transition={{
                            duration: 1.4,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className="absolute inset-0 overflow-hidden"
                        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
                    >
                        <motion.div
                            initial={{ x: '-20%' }}
                            animate={{ x: '0%' }}
                            exit={{ x: '20%' }}
                            style={{ y: yParallax }}
                            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-[-8%] will-change-transform"
                        >
                            <Image
                                src={sanitizeImagePath(allImages[currentImageIndex])}
                                alt={product.name}
                                fill
                                className="object-cover opacity-90 group-hover:opacity-100 scale-110 transition-opacity duration-700"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                priority={priority || index < 2}
                                unoptimized
                            />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
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
                        <h3 className="text-sm md:text-base font-serif text-foreground/90 font-medium group-hover:text-primary transition-colors duration-500 leading-snug tracking-tight">
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

                {/* Modern Slide-up Buttons */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20">
                    <div className="grid grid-cols-2 gap-px bg-white/5 backdrop-blur-md border-t border-white/10">
                        <Button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="bg-transparent text-foreground hover:bg-white/10 transition-colors duration-300 h-11 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-0"
                        >
                            {isAdding ? 'Adding' : 'Add to Cart'}
                        </Button>
                        <Button
                            onClick={handleBuyNow}
                            disabled={isBuying}
                            className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-300 h-11 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-0 border-l border-white/10"
                        >
                            {isBuying ? 'Wait' : 'Buy Now'}
                        </Button>
                    </div>
                </div>

                {/* Mobile Button (Always Visible) */}
                <div className="md:hidden mt-auto pt-4">
                    <Button
                        onClick={handleBuyNow}
                        className="w-full bg-secondary/50 backdrop-blur-sm border border-border text-foreground hover:bg-foreground hover:text-background transition-all h-10 text-[10px] uppercase font-premium-sans tracking-widest rounded-none"
                    >
                        View Selection
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
