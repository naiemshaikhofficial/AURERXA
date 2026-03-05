'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { getProductBySlug, addToWishlist, checkPendingOrder, getReviewStats } from '@/app/actions'
import { addToRecentlyViewed } from '@/components/recently-viewed'
import {
    Heart, Shield, Truck, RefreshCw, ZoomIn, Loader2, ArrowLeft, ArrowRight, Share2,
    Maximize2, RotateCcw, Play, Ruler, ShoppingBag, ShieldAlert, Star, ChevronRight, Check, ExternalLink
} from 'lucide-react'
import { useUserPreferences } from '@/context/user-preferences-context'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'
import { DeliveryChecker } from '@/components/delivery-checker'
import { cn, sanitizeImagePath } from '@/lib/utils'
import supabaseLoader from '@/lib/supabase-loader'
import dynamic from 'next/dynamic'
import { formatPurity, formatWeight, formatDimensions } from '@/lib/material-intelligence'

// Dynamic Imports for modular components
const VTOModal = dynamic(() => import('@/components/vto-modal').then(mod => mod.VTOModal), { ssr: false })
const ProductActions = dynamic(() => import('@/components/product/product-actions').then(mod => mod.ProductActions), { ssr: false })
const ProductHighlights = dynamic(() => import('@/components/product/product-highlights').then(mod => mod.ProductHighlights), { ssr: false })
const ProductSpecs = dynamic(() => import('@/components/product/product-specs').then(mod => mod.ProductSpecs), { ssr: false })
const PairItWith = dynamic(() => import('@/components/pair-it-with').then(mod => mod.PairItWith), { ssr: false })
const ProductReviewsSection = dynamic(() => import('@/components/product/product-reviews-section').then(mod => mod.ProductReviewsSection), { ssr: false })
const RecentlyViewedComp = dynamic(() => import('@/components/recently-viewed').then(mod => ({ default: mod.RecentlyViewed })), { ssr: false })
const SizeGuide = dynamic(() => import('@/components/size-guide').then(mod => mod.SizeGuide), { ssr: false })

interface ProductClientProps {
    product: any
    related?: any[]
    isWishlisted?: boolean
}

const MATERIAL_CONFIG: Record<string, { label: string, color: string, video: string }> = {
    '18k-gold': { label: '18K Solid Gold', color: '#D4AF37', video: '/videos/gold-shimmer.mp4' },
    'sterling-silver': { label: '925 Sterling Silver', color: '#C0C0C0', video: '/videos/silver-shimmer.mp4' },
    'rose-gold': { label: '18K Rose Gold', color: '#B76E79', video: '/videos/rose-shimmer.mp4' }
}

// ============================================
// CACHED VIDEO COMPONENT
// ============================================
function CachedVideo({ src, isShort }: { src: string, isShort: boolean }) {
    return (
        <video autoPlay loop muted playsInline className={cn("absolute inset-0 w-full h-full object-cover", isShort ? "" : "mix-blend-overlay opacity-20")}>
            <source src={src} type="video/mp4" />
        </video>
    )
}

// ============================================
// ZOOMABLE IMAGE COMPONENT
// ============================================
function ZoomableImage({ src, alt }: { src: string, alt: string }) {
    const [scale, setScale] = useState(1)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setScale(1)
        x.set(0)
        y.set(0)
    }, [src, x, y])

    useEffect(() => {
        if (scale === 1) {
            x.set(0)
            y.set(0)
        }
    }, [scale, x, y])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || Math.abs(e.deltaY) > 2) {
                e.preventDefault()
                e.stopPropagation()

                const zoomSpeed = 0.005
                const delta = -e.deltaY * zoomSpeed
                const nextScale = Math.min(Math.max(1, scale + delta), 4)

                if (nextScale !== scale) {
                    const rect = container.getBoundingClientRect()
                    const mouseX = e.clientX - rect.left
                    const mouseY = e.clientY - rect.top
                    const rx = (mouseX / rect.width) - 0.5
                    const ry = (mouseY / rect.height) - 0.5

                    if (nextScale > 1) {
                        const scaleChange = nextScale - scale
                        x.set(x.get() - (rect.width * rx * scaleChange))
                        y.set(y.get() - (rect.height * ry * scaleChange))
                    }
                    setScale(nextScale)
                }
            }
        }

        container.addEventListener('wheel', onWheel, { passive: false })
        return () => container.removeEventListener('wheel', onWheel)
    }, [scale, x, y])

    const toggleZoom = (e: React.MouseEvent) => {
        if (scale > 1) {
            setScale(1)
            x.set(0)
            y.set(0)
        } else {
            const rect = containerRef.current?.getBoundingClientRect()
            if (rect) {
                const rx = ((e.clientX - rect.left) / rect.width) - 0.5
                const ry = ((e.clientY - rect.top) / rect.height) - 0.5
                setScale(2.5)
                x.set(-rect.width * rx * 1.5)
                y.set(-rect.height * ry * 1.5)
            }
        }
    }

    const getConstraints = () => {
        if (!containerRef.current) return { left: 0, right: 0, top: 0, bottom: 0 }
        const { width, height } = containerRef.current.getBoundingClientRect()
        const xLimit = Math.max(0, (width * scale - width) / 2)
        const yLimit = Math.max(0, (height * scale - height) / 2)
        return { left: -xLimit, right: xLimit, top: -yLimit, bottom: yLimit }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-neutral-950 select-none cursor-zoom-in group/zoom isolate"
            style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
            onDoubleClick={toggleZoom}
        >
            <motion.div
                className="w-full h-full flex items-center justify-center origin-center"
                style={{ scale, x, y, cursor: scale > 1 ? 'grab' : 'zoom-in' }}
                drag={scale > 1}
                dragConstraints={getConstraints()}
                dragElastic={0.1}
                dragMomentum={false}
                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            >
                <div className="relative w-full h-full pointer-events-none">
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-contain p-8 lg:p-24"
                        priority
                        sizes="(max-width: 768px) 100vw, 800px"
                        draggable={false}
                        loader={supabaseLoader}
                    />
                </div>
            </motion.div>
        </div>
    )
}

export function ProductClient({ product: initialProduct, related, isWishlisted }: ProductClientProps) {
    const router = useRouter()
    const { addItem } = useCart()
    const { user } = useAuth()
    const { isInWishlist, toggleWishlist, setMetalPreference, ringSize, setRingSize, trackEngagement } = useUserPreferences()

    // SWR for Background Revalidation (Static + SWR Pattern)
    const { data: freshProduct } = useSWR(
        ['product', initialProduct.slug],
        () => getProductBySlug(initialProduct.slug),
        {
            fallbackData: initialProduct,
            revalidateOnFocus: false,
            dedupingInterval: 60000
        }
    )

    // Use fresh data if available, otherwise fall back to initial
    const product = freshProduct || initialProduct

    // track initial view
    useEffect(() => {
        if (product && product.material_type) {
            trackEngagement('material', product.material_type)
        }
        if (product && product.categories?.slug) {
            trackEngagement('category', product.categories.slug)
        }
    }, [product?.id, product?.material_type, product?.categories?.slug, trackEngagement])

    // State
    const [selectedSize, setSelectedSize] = useState<string>(ringSize || product.sizes?.[0] || '')
    const [customSizeInput, setCustomSizeInput] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [addingToCart, setAddingToCart] = useState(false)
    const inWishlist = isInWishlist(product.id)
    const [message, setMessage] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [isVTOOpen, setIsVTOOpen] = useState(false)
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [shippingCharge, setShippingCharge] = useState<number | null>(null)
    const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })

    // Dynamic State based on Selected Size OR Length
    const dynamicData = useMemo(() => {
        if (!product) return { price: 0, weight: 0 }

        if (product.fixed_price_override) {
            return {
                price: product.fixed_price_override,
                weight: product.weight_grams,
                dimensions: formatDimensions(product.dimensions_length, product.dimensions_width, product.dimensions_height, product.dimensions_unit || 'cm'),
                metalCost: undefined,
                makingCost: undefined,
                baseCost: undefined,
            }
        }

        if (!product.dynamicPricingMap) {
            return {
                price: product.price,
                weight: product.weight_grams,
                dimensions: formatDimensions(product.dimensions_length, product.dimensions_width, product.dimensions_height, product.dimensions_unit || 'cm'),
                metalCost: undefined,
                makingCost: undefined,
                baseCost: undefined,
            }
        }

        const lookupKey = selectedSize && selectedSize !== 'Custom' ? selectedSize : 'default'
        const data = product.dynamicPricingMap?.[lookupKey]

        if (data) {
            return {
                price: Number(data.price) || (Number(product.price) || 0),
                weight: Number(data.weight) || (Number(product.weight_grams) || 0),
                dimensions: data.dimensions,
                width: data.width,
                diameter: data.diameter,
                circumference: data.circumference,
                metalCost: data.metalCost,
                makingCost: data.makingCost,
                baseCost: data.baseCost,
            }
        }

        return {
            price: Number(product.price) || 0,
            weight: Number(product.weight_grams) || 0,
            dimensions: formatDimensions(product.dimensions_length, product.dimensions_width, product.dimensions_height, product.dimensions_unit || 'cm'),
            metalCost: undefined,
            makingCost: undefined,
            baseCost: undefined,
        }
    }, [selectedSize, product])

    // Handle scroll for sticky bar
    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const shouldBeScrolled = window.scrollY > 600
                    setScrolled(prev => prev !== shouldBeScrolled ? shouldBeScrolled : prev)
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Memoize image array
    const allImages = useMemo(() => {
        if (!product) return []
        const mainImage = product.image_url
        const result: string[] = []
        if (mainImage) result.push(mainImage)
        const imgs = product.images
        if (Array.isArray(imgs)) {
            imgs.forEach(img => { if (typeof img === 'string' && img.trim()) result.push(img.trim()) })
        } else if (typeof imgs === 'string' && imgs.trim()) {
            try {
                const parsed = JSON.parse(imgs)
                if (Array.isArray(parsed)) parsed.forEach(img => { if (typeof img === 'string' && img.trim()) result.push(img.trim()) })
            } catch (e) {
                const parts = imgs.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
                result.push(...parts)
            }
        }
        return Array.from(new Set(result))
    }, [product])

    // Load Review Stats
    useEffect(() => {
        if (product.id) {
            getReviewStats(product.id).then(setReviewStats)
        }
    }, [product.id])

    // Add to recently viewed on mount
    useEffect(() => {
        if (product && product.id) {
            addToRecentlyViewed(product)
        }
    }, [product?.id])

    const handleAddToCart = async () => {
        if (!product) return
        let finalSize = selectedSize
        if (selectedSize === 'Custom') {
            if (!customSizeInput.trim()) {
                setMessage('Please enter custom size')
                setTimeout(() => setMessage(null), 3000)
                return
            }
            finalSize = `Custom: ${customSizeInput}`
        }
        setAddingToCart(true)
        try {
            const hasPending = await checkPendingOrder(product.id)
            if (hasPending) {
                setAddingToCart(false)
                if (confirm("Active Order Found!\n\nYou already have this item in an active order. duplicates are restricted to ensure fair access.\n\nWould you like to view your existing order?")) {
                    router.push('/account/orders')
                }
                return
            }
        } catch (e) { }

        const cartProduct = {
            id: product.id,
            name: product.name,
            price: dynamicData.price,
            image_url: product.image_url,
            slug: product.slug,
            purity: product.purity,
            weight_grams: dynamicData.weight
        }

        await addItem(product.id, finalSize || 'One Size', quantity, cartProduct)
        setMessage('Added to your cart')
        setAddingToCart(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleBuyNow = async () => {
        if (!product) return
        let finalSize = selectedSize
        if (selectedSize === 'Custom') {
            if (!customSizeInput.trim()) {
                setMessage('Please enter custom size')
                setTimeout(() => setMessage(null), 3000)
                return
            }
            finalSize = `Custom: ${customSizeInput}`
        }
        setAddingToCart(true)
        try {
            const hasPending = await checkPendingOrder(product.id)
            if (hasPending) {
                setAddingToCart(false)
                if (confirm("Active Order Found!\n\nYou already have this item in an active order. duplicates are restricted to ensure fair access.\n\nWould you like to view your existing order?")) {
                    router.push('/account/orders')
                }
                return
            }
        } catch (e) { }

        const cartProduct = {
            id: product.id,
            name: product.name,
            price: dynamicData.price,
            image_url: product.image_url,
            slug: product.slug,
            purity: product.purity,
            weight_grams: dynamicData.weight
        }

        await addItem(product.id, finalSize || 'One Size', 1, cartProduct)
        setAddingToCart(false)
        router.push('/checkout')
    }

    const handleAddToWishlist = async () => {
        if (!product) return
        if (!user) {
            toast.error('Please login to wishlist items')
            router.push('/login')
            return
        }
        try {
            toggleWishlist(product.id)
            const result = await addToWishlist(product.id)
            if (result.success) {
                setMessage('Added to wishlist!')
                if (product.material_type) setMetalPreference(product.material_type)
            } else {
                toggleWishlist(product.id)
                setMessage(result.error || 'Failed to add')
            }
        } catch (error) {
            toggleWishlist(product.id)
            setMessage('Error adding to wishlist')
        }
        setTimeout(() => setMessage(null), 3000)
    }

    const handleShare = async () => {
        const shareData = {
            title: product.name,
            text: `Check out this exquisite piece at AURERXA: ${product.name}`,
            url: typeof window !== 'undefined' ? window.location.href : '',
        }
        try {
            if (navigator.share) await navigator.share(shareData)
            else {
                await navigator.clipboard.writeText(window.location.href)
                setMessage('Legacy Link Copied to Clipboard')
            }
        } catch (err) { }
    }

    if (!product) return null

    return (
        <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30 relative">
            <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="pt-8 lg:pt-8 min-h-screen flex flex-col lg:flex-row relative z-10 items-start">
                {/* LEFT: Image Gallery */}
                <div className="w-full lg:w-[55%] lg:sticky lg:top-[160px] lg:h-[calc(100vh-160px)] p-0 lg:p-6 flex flex-col min-h-0">
                    <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:flex-1 bg-neutral-900/20 border border-white/5 overflow-hidden group min-h-0">
                        <motion.div
                            key={selectedImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 z-10"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(_, info) => {
                                if (allImages.length <= 1) return
                                const swipeThreshold = 50
                                if (info.offset.x < -swipeThreshold) setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
                                else if (info.offset.x > swipeThreshold) setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
                            }}
                        >
                            <ZoomableImage src={sanitizeImagePath(allImages[selectedImage])} alt={product.name} />
                        </motion.div>

                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-neutral-950/80 backdrop-blur-md border border-white/5 rounded-full flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 duration-500"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-neutral-950/80 backdrop-blur-md border border-white/5 rounded-full flex items-center justify-center text-white/50 hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 duration-500"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        <div className="absolute top-6 right-6 z-20">
                            <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white transition-all transform hover:rotate-12">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {allImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar px-6 lg:px-2 scroll-smooth snap-x border-t border-white/5 bg-white/[0.01] flex-shrink-0">
                            {allImages.map((img: string, i: number) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedImage(i)}
                                    className={cn(
                                        "relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 transition-all duration-500 snap-center overflow-hidden",
                                        selectedImage === i ? "ring-1 ring-amber-200/40 opacity-100 grayscale-0" : "opacity-30 grayscale hover:opacity-100 hover:grayscale-0"
                                    )}
                                >
                                    <Image src={sanitizeImagePath(img)} alt={`${product.name} v${i}`} fill className="object-cover" sizes="80px" loader={supabaseLoader} />
                                    {selectedImage === i && <motion.div layoutId="thumb-border" className="absolute inset-0 border border-amber-200/20 z-10" />}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Product Details */}
                <div className="w-full lg:w-[45%] p-6 lg:p-12 lg:pr-24 flex flex-col justify-center pb-32 bg-neutral-950/50 backdrop-blur-3xl">
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Link href={`/collections?category=${product.categories?.slug}`} className="text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase hover:text-white transition-colors">
                                    {product.categories?.name || 'Collection'}
                                </Link>
                                <div className="flex flex-wrap gap-2">
                                    {product.gender && <span className="px-3 py-1 border border-white/5 text-[9px] uppercase tracking-widest text-white/40">{product.gender}</span>}
                                    {product.purity && <span className="px-3 py-1 bg-amber-900/10 border border-amber-500/10 text-[9px] uppercase tracking-widest text-amber-500/80">{product.purity}</span>}
                                    {product.stock === 0 && <span className="px-4 py-1.5 bg-neutral-900/40 border border-white/10 text-[8px] font-black uppercase tracking-[0.4em] text-white/30">Sold Out</span>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-8xl font-serif text-white/90 leading-[0.85] tracking-tighter">
                                    {product.name}
                                </motion.h1>
                                {reviewStats.total > 0 && (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(reviewStats.average) ? 'fill-amber-200 text-amber-200' : 'text-white/5'}`} />)}
                                            </div>
                                            <span className="text-[10px] text-white/60">{reviewStats.average}</span>
                                        </div>
                                        <button className="text-[9px] text-white/40 uppercase tracking-widest border-b border-white/10">{reviewStats.total} Reviews</button>
                                    </div>
                                )}
                            </div>

                            <p className="text-3xl font-light text-amber-100/80 font-serif italic mb-6">₹{dynamicData.price.toLocaleString('en-IN')}</p>

                            <ProductActions
                                product={product}
                                dynamicData={dynamicData}
                                selectedSize={selectedSize}
                                setSelectedSize={(size) => { setSelectedSize(size); setRingSize(size); }}
                                setCustomSizeInput={setCustomSizeInput}
                                handleAddToCart={handleAddToCart}
                                handleBuyNow={handleBuyNow}
                                handleAddToWishlist={handleAddToWishlist}
                                addingToCart={addingToCart}
                                inWishlist={inWishlist}
                                setIsSizeGuideOpen={setIsSizeGuideOpen}
                            />
                        </div>

                        <ProductHighlights product={product} setIsVTOOpen={setIsVTOOpen} CachedVideo={CachedVideo} MATERIAL_CONFIG={MATERIAL_CONFIG} formatPurity={formatPurity} />
                        <ProductSpecs product={product} dynamicData={dynamicData} />
                        <DeliveryChecker product={product} onShippingUpdate={setShippingCharge} />
                    </div>
                </div>
            </div>

            {/* STICKY ACTION BAR */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-t border-white/5 p-4">
                        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 border border-white/5 overflow-hidden">
                                    <Image src={sanitizeImagePath(product.image_url)} alt={product.name} width={100} height={100} className="w-full h-full object-cover" loader={supabaseLoader} />
                                </div>
                                <div className="hidden sm:block">
                                    <h4 className="text-xs font-serif italic text-white">{product.name}</h4>
                                    <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">₹{dynamicData.price.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0} className="hidden md:flex bg-transparent border border-white/20 text-[10px] h-12 px-8 uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-black rounded-none">
                                    {product.stock === 0 ? 'Out of Stock' : (addingToCart ? <Loader2 className="animate-spin w-3 h-3" /> : 'Add to Bag')}
                                </Button>
                                <Button onClick={handleBuyNow} disabled={addingToCart || product.stock === 0} className="bg-white text-black h-12 px-10 uppercase tracking-[0.3em] text-[10px] font-bold rounded-none">
                                    {product.stock === 0 ? 'Sold Out' : 'Buy It Now'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PairItWith productId={product.id} />
            <ProductReviewsSection productId={product.id} />
            <RecentlyViewedComp />

            {message && (
                <div className="fixed bottom-8 right-8 z-50 bg-neutral-900 border border-white/10 text-white px-8 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
                    <span className="w-1 h-1 bg-amber-200 rounded-full" />
                    <p className="text-[10px] uppercase tracking-[0.2em]">{message}</p>
                </div>
            )}

            <VTOModal isOpen={isVTOOpen} onClose={() => setIsVTOOpen(false)} productImage={product.image_url} productName={product.name} />
            <AnimatePresence>{isSizeGuideOpen && <SizeGuide category={product.categories?.name} onClose={() => setIsSizeGuideOpen(false)} />}</AnimatePresence>
        </div>
    )
}
