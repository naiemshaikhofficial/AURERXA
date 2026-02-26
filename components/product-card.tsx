'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'
import { cn, sanitizeImagePath } from '@/lib/utils'
import supabaseLoader from '@/lib/supabase-loader'
import { fadeInUp, PREMIUM_EASE } from '@/lib/animation-constants'
import { formatWeight } from '@/lib/material-intelligence'

export type MaterialType = 'real_gold' | 'gold_plated' | 'bentex' | 'silver' | 'diamond' | null

export const MATERIAL_CONFIG: Record<string, { label: string; suffix: string; color: string; bg: string; dot: string; glow: string }> = {
    real_gold: { label: '22K Gold', suffix: 'Gold', color: 'text-amber-200', bg: 'bg-amber-500/10 border-amber-500/30', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]' },
    gold_plated: { label: 'Gold Plated', suffix: 'Plated', color: 'text-orange-200', bg: 'bg-orange-500/10 border-orange-500/30', dot: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]', glow: 'shadow-[0_0_15px_rgba(251,146,60,0.2)]' },
    bentex: { label: 'Handcrafted', suffix: 'Fashion', color: 'text-slate-200', bg: 'bg-slate-500/10 border-slate-500/30', dot: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]', glow: 'shadow-[0_0_15px_rgba(148,163,184,0.2)]' },
    silver: { label: '99.99 Silver', suffix: 'Silver', color: 'text-blue-100', bg: 'bg-blue-400/10 border-blue-400/30', dot: 'bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.6)]', glow: 'shadow-[0_0_15px_rgba(147,197,253,0.2)]' },
    diamond: { label: 'Lab Diamond', suffix: 'Diamond', color: 'text-cyan-200', bg: 'bg-cyan-500/10 border-cyan-500/30', dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]' },
}

export function MaterialBadge({ type, purity, materialName }: { type: MaterialType; purity?: string; materialName?: string }) {
    if (!type || !MATERIAL_CONFIG[type]) return null
    const cfg = MATERIAL_CONFIG[type]
    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-none border border-white/10 backdrop-blur-2xl transition-all duration-700",
            "text-[7px] font-black uppercase tracking-[0.3em] relative overflow-hidden group/badge",
            cfg.bg, cfg.color, "hover:border-white/30"
        )}>
            {/* Inner Etching */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

            <span className={cn("w-1 h-1 rounded-full animate-pulse", cfg.dot, cfg.glow)} />
            <span className="relative z-10">
                {purity ? (
                    purity.includes(cfg.label.split(' ')[0]) ? purity : `${purity} ${materialName || cfg.suffix}`
                ) : (materialName || cfg.label)}
            </span>

            {/* Subtle Shine Flare */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/badge:translate-x-full transition-transform duration-1000" />
        </div>
    )

}

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
    material_type?: MaterialType
    tags?: string[]
}

const QUALITY_TAG_CONFIG: Record<string, { label: string; color: string; bg: string; icon?: string }> = {
    'anti-tarnish': { label: 'Anti-Tarnish', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    'waterproof': { label: 'Waterproof', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    'lifetime-quality': { label: 'Lifetime Quality', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    'pvd-coating': { label: 'PVD Coated', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
}

function QualityBadge({ tags }: { tags?: string[] }) {
    if (!tags || tags.length === 0) return null

    // Sort to show important ones first
    const activeConfigs = tags
        .map(t => t.toLowerCase())
        .filter(t => QUALITY_TAG_CONFIG[t])
        .map(t => QUALITY_TAG_CONFIG[t])

    if (activeConfigs.length === 0) return null

    return (
        <div className="flex flex-wrap gap-1.5">
            {activeConfigs.slice(0, 2).map((cfg, i) => (
                <div
                    key={i}
                    className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded-sm border backdrop-blur-md",
                        "text-[7px] font-bold uppercase tracking-[0.1em]",
                        cfg.bg, cfg.color
                    )}
                >
                    {cfg.label}
                </div>
            ))}
        </div>
    )
}

interface ProductCardProps {
    product: Product
    viewMode?: 'grid' | 'list' | 'compact'
    index?: number
    className?: string
    onClose?: () => void // For search modal etc
    priority?: boolean
}


export const ProductCard = React.memo(({ product, viewMode = 'grid', index = 0, className, onClose, priority = false }: ProductCardProps) => {
    const { addItem } = useCart()
    const router = useRouter()
    const [isAdding, setIsAdding] = useState(false)
    const [isBuying, setIsBuying] = useState(false)

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.stock === 0) return
        setIsAdding(true)
        await addItem(product.id, 'Standard', 1, product)
        setIsAdding(false)
    }

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.stock === 0) return
        setIsBuying(true)
        await addItem(product.id, 'Standard', 1, product)
        if (onClose) onClose()
        router.push('/checkout')
    }


    const allImages = useMemo(() => {
        if (!product) return []

        const mainImage = product.image_url
        const result: string[] = []

        if (mainImage) result.push(mainImage)

        const imgs = product.images

        if (Array.isArray(imgs)) {
            imgs.forEach(img => {
                if (typeof img === 'string' && img.trim()) result.push(img.trim())
            })
        } else if (typeof imgs === 'string' && imgs.trim()) {
            const trimmed = imgs.trim()
            if (trimmed.startsWith('[')) {
                try {
                    const parsed = JSON.parse(trimmed)
                    if (Array.isArray(parsed)) {
                        parsed.forEach(img => {
                            if (typeof img === 'string' && img.trim()) result.push(img.trim())
                        })
                    }
                } catch (e) {
                    console.error('Failed to parse images JSON string', e)
                }
            } else if (trimmed.startsWith('{')) {
                const parts = trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
                result.push(...parts)
            } else {
                const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean)
                result.push(...parts)
            }
        }

        return Array.from(new Set(result))
    }, [product])

    // Scroll Parallax Logic Removed for Performance
    const containerRef = useRef<HTMLDivElement>(null)

    const [isHovered, setIsHovered] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // 3D Tilt Motion Values
    const x = useScroll().scrollX // Dummy to get motion values access if needed, though we use mouse
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useTransform(mouseY, [0, 400], [5, -5])
    const rotateY = useTransform(mouseX, [0, 400], [-5, 5])

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        mouseX.set(event.clientX - rect.left)
        mouseY.set(event.clientY - rect.top)
    }

    function handleMouseLeave() {
        setIsHovered(false)
        setCurrentImageIndex(0)
        mouseX.set(200) // Reset to center (vague)
        mouseY.set(200)
    }

    // Auto-Cycle Logic (Faster on hover)
    useEffect(() => {
        if (allImages.length <= 1) return

        const intervalTime = isHovered ? 1200 : 4000
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
        }, intervalTime + (index * 20))

        return () => clearInterval(interval)
    }, [allImages.length, index, isHovered])

    return (
        <motion.div
            ref={containerRef}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
                "group relative bg-card border border-border overflow-hidden flex flex-col hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] transition-all duration-700 will-change-transform",
                viewMode === 'list' ? 'md:flex-row md:items-center' : '',
                className
            )}
        >
            <div className={cn(
                "relative overflow-hidden group/img bg-muted shrink-0",
                viewMode === 'list' ? 'aspect-square w-full md:w-1/3' : 'aspect-square w-full'
            )}>
                <Link href={`/products/${product.slug}`} className="absolute inset-0 z-30 block" onClick={onClose} aria-label={`View details for ${product.name}`} />

                {/* Status Badges */}
                <div className="absolute top-2.5 left-2.5 z-40 flex flex-col gap-1.5">
                    {product.material_type && (
                        <MaterialBadge
                            type={product.material_type}
                            purity={product.purity}
                            materialName={product.categories?.name}
                        />
                    )}
                    <QualityBadge tags={product.tags} />
                    {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-md text-[7px] font-bold uppercase tracking-[0.1em] text-red-400 animate-pulse">
                            Only {product.stock} Left
                        </div>
                    )}
                    {product.stock === 0 && (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-sm border border-border bg-neutral-950/90 dark:bg-neutral-950/90 backdrop-blur-xl text-[8px] font-black uppercase tracking-[0.3em] text-foreground/40 shadow-2xl overflow-hidden relative group/sold">
                            <span className="relative z-10">Sold Out</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/sold:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </div>
                    )}
                </div>

                {/* Cinematic Shimmer Flare */}
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                    <motion.div
                        initial={false}
                        animate={isHovered ? { x: ['-100%', '200%'] } : { x: '-100%' }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent w-full skew-x-12"
                    />
                </div>

                {/* Progress Segments */}
                {allImages.length > 1 && (
                    <div className="absolute top-4 inset-x-4 z-40 flex gap-1 group-hover/img:opacity-100 opacity-0 transition-opacity duration-500">
                        {allImages.map((_, i) => (
                            <div key={i} className="h-[2px] flex-1 bg-white/10 overflow-hidden rounded-full">
                                <motion.div
                                    className="h-full bg-white/60"
                                    initial={false}
                                    animate={{
                                        width: currentImageIndex === i ? '100%' : '0%',
                                        opacity: currentImageIndex === i ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence initial={false}>
                    <motion.div
                        key={allImages[currentImageIndex]}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        className="absolute inset-0 overflow-hidden"
                    >
                        <motion.div
                            className="relative w-full h-full"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(_, info) => {
                                if (allImages.length <= 1) return
                                const swipeThreshold = 50
                                if (info.offset.x < -swipeThreshold) {
                                    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
                                } else if (info.offset.x > swipeThreshold) {
                                    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                                }
                            }}
                        >
                            <Image
                                src={sanitizeImagePath(allImages[currentImageIndex])}
                                alt={`${product.purity || ''} ${product.material_type ? MATERIAL_CONFIG[product.material_type].label : ''} ${product.name} - ${product.categories?.name || 'Jewellery'} by AURERXA`}
                                fill
                                priority={priority || index < 2}
                                loader={supabaseLoader}
                                className={cn(
                                    "object-cover transition-transform duration-700 will-change-transform",
                                    isHovered ? "scale-110" : "scale-100"
                                )}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                fetchPriority={priority || index < 2 ? "high" : "auto"}
                                unoptimized={allImages[currentImageIndex]?.startsWith('blob:') || allImages[currentImageIndex]?.includes('imageshack.com')}
                            />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Product Info - Minimalist Editorial Style */}
            <div className={cn(
                "p-3 md:p-4 space-y-2 relative z-10 bg-card flex-1 flex flex-col",
                viewMode === 'list' && 'md:p-8 md:justify-center',
                viewMode === 'compact' && 'p-2 md:p-3 space-y-1'
            )}>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1 opacity-70">
                        {product.material_type && (
                            <>
                                <p className="text-[8px] md:text-[9px] text-primary font-bold tracking-[0.2em] uppercase">
                                    {product.purity
                                        ? (product.purity.includes('99.99') ? '99.99 Silver' : `${product.purity} ${product.categories?.name || MATERIAL_CONFIG[product.material_type].suffix}`)
                                        : (product.categories?.name || MATERIAL_CONFIG[product.material_type].label)}
                                </p>
                                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                            </>
                        )}
                        <p className="text-[8px] md:text-[9px] text-muted-foreground font-premium-sans tracking-[0.2em] uppercase truncate">
                            {product.categories?.name || 'Collection'}
                        </p>
                    </div>

                    <Link href={`/products/${product.slug}`} onClick={onClose}>
                        <h3 className="text-sm md:text-lg font-serif text-foreground font-medium group-hover:text-primary transition-colors duration-700 leading-tight tracking-tight">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-[11px] md:text-sm font-light text-foreground/80">
                            ₹{product.price.toLocaleString()}
                        </span>
                        {product.weight_grams && (
                            <span className="text-[7px] md:text-[9px] text-muted-foreground/50 uppercase tracking-wider">
                                {formatWeight(product.weight_grams)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Modern Slide-up Buttons */}
                {viewMode !== 'compact' && (
                    <div className="hidden md:block absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] z-20">
                        <div className="grid grid-cols-2 gap-px bg-foreground/5 backdrop-blur-md border-t border-border">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isAdding || product.stock === 0}
                                aria-label={product.stock === 0 ? 'Out of stock' : `Add ${product.name} to cart`}
                                className="bg-transparent text-foreground hover:bg-white/10 transition-colors duration-300 h-11 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-0 focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {product.stock === 0 ? 'Out of Stock' : (isAdding ? 'Adding' : 'Add to Cart')}
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                disabled={isBuying || product.stock === 0}
                                aria-label={product.stock === 0 ? 'Out of stock' : `Buy ${product.name} now`}
                                className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-300 h-11 text-[9px] uppercase font-premium-sans tracking-[0.2em] rounded-none border-0 border-l border-white/10 focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {product.stock === 0 ? 'Sold' : (isBuying ? 'Wait' : 'Buy Now')}
                            </Button>
                        </div>
                    </div>
                )}

                {viewMode !== 'compact' && (
                    <div className="md:hidden mt-auto pt-2">
                        <Button
                            onClick={handleAddToCart}
                            disabled={isAdding || product.stock === 0}
                            aria-label={product.stock === 0 ? 'Out of stock' : `Add ${product.name} to cart`}
                            className="w-full bg-primary/5 border border-primary/10 text-primary/80 hover:bg-primary hover:text-black transition-all h-9 text-[7.5px] uppercase font-black tracking-wider rounded-none flex items-center justify-center focus-visible:ring-1 focus-visible:ring-primary overflow-hidden px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="whitespace-nowrap">{product.stock === 0 ? 'Sold Out' : (isAdding ? 'Adding...' : 'Add to Cart')}</span>
                        </Button>
                    </div>
                )}
            </div>
        </motion.div >
    )

})

ProductCard.displayName = 'ProductCard'
