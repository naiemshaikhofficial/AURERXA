'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { addToWishlist, checkPendingOrder } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { addToRecentlyViewed } from '@/components/recently-viewed'
import { Heart, Shield, Truck, RefreshCw, ZoomIn, Loader2, ArrowLeft, ArrowRight, Share2, Maximize2, RotateCcw, Play, Ruler, ShoppingBag, ShieldAlert, Star } from 'lucide-react'
import { DeliveryChecker } from '@/components/delivery-checker'
import { cn, sanitizeImagePath } from '@/lib/utils'
import supabaseLoader from '@/lib/supabase-loader'
import dynamic from 'next/dynamic'
const VTOModal = dynamic(() => import('@/components/vto-modal').then(mod => mod.VTOModal), { ssr: false })
import { ProductCard } from '@/components/product-card'
import { SizeGuide } from '@/components/size-guide'
import { formatPurity, formatWeight, formatDimensions } from '@/lib/material-intelligence'
import { PairItWith } from '@/components/pair-it-with'
import { RecentlyViewed } from '@/components/recently-viewed'
import { MATERIAL_CONFIG, MaterialBadge } from '@/components/product-card'
import { getProductReviews, getReviewStats } from '@/app/actions'
import { ProductActions } from './product/product-actions'
import { ProductHighlights } from './product/product-highlights'
import { ProductReviewsSection } from './product/product-reviews-section'
import { ProductSpecs } from './product/product-specs'


interface ProductClientProps {
    product: any
    related?: any[]
    isWishlisted?: boolean
}

// ============================================
// CACHED VIDEO COMPONENT
// ============================================
function CachedVideo({ src, isShort }: { src: string; isShort: boolean }) {
    const [videoSrc, setVideoSrc] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        const CACHE_NAME = 'aurerxa-video-cache'

        async function initCache() {
            try {
                if (!('caches' in window)) {
                    setVideoSrc(src)
                    setLoading(false)
                    return
                }

                const cache = await caches.open(CACHE_NAME)
                const cachedResponse = await cache.match(src)

                if (cachedResponse) {
                    const blob = await cachedResponse.blob()
                    if (mounted) {
                        setVideoSrc(URL.createObjectURL(blob))
                        setLoading(false)
                    }
                    return
                }

                // Not in cache, fetch it
                const response = await fetch(src)
                if (!response.ok) throw new Error('Failed to fetch video')

                // We need a clone because response can only be used once
                const responseToCache = response.clone()
                await cache.put(src, responseToCache)

                const blob = await response.blob()
                if (mounted) {
                    setVideoSrc(URL.createObjectURL(blob))
                    setLoading(false)
                }

            } catch (error) {
                console.error('Video caching error:', error)
                if (mounted) {
                    setVideoSrc(src)
                    setLoading(false)
                }
            }
        }

        initCache()

        return () => {
            mounted = false
            if (videoSrc && videoSrc.startsWith('blob:')) {
                URL.revokeObjectURL(videoSrc)
            }
        }
    }, [src])

    if (loading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                <Loader2 className="w-8 h-8 text-amber-500/20 animate-spin" />
            </div>
        )
    }

    return (
        <video
            src={videoSrc || src}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
        >
            Your browser does not support the video tag.
        </video>
    )
}

function ZoomableImage({ src, alt }: { src: string, alt: string }) {
    const [scale, setScale] = useState(1)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // Reset on image change
    useEffect(() => {
        setScale(1)
        x.set(0)
        y.set(0)
    }, [src, x, y])

    // Reset position when scale returns to 1
    useEffect(() => {
        if (scale === 1) {
            x.set(0)
            y.set(0)
        }
    }, [scale, x, y])

    // We no longer lock the body scroll to prevent layout shift.
    // Instead, we use overscroll-behavior: contain and stopPropagation.

    // Native Wheel Listener for Center-to-Pointer Zoom
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
                    // Calculate zoom-to-pointer offset
                    const rect = container.getBoundingClientRect()
                    const mouseX = e.clientX - rect.left
                    const mouseY = e.clientY - rect.top

                    // Ratio of mouse position relative to container
                    const rx = (mouseX / rect.width) - 0.5
                    const ry = (mouseY / rect.height) - 0.5

                    // Adjust x and y based on the change in scale
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

    // Touch Handling (Pinch-to-Center)
    const touchStartDist = useRef<number>(0)
    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            touchStartDist.current = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
        }
    }

    const onTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault()
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            const delta = dist - touchStartDist.current
            const nextScale = Math.min(Math.max(1, scale + delta * 0.01), 4)

            if (nextScale !== scale) {
                setScale(nextScale)
            }
            touchStartDist.current = dist
        }
    }

    // Dynamic constraints
    const getConstraints = () => {
        if (!containerRef.current) return { left: 0, right: 0, top: 0, bottom: 0 }
        const { width, height } = containerRef.current.getBoundingClientRect()
        const xLimit = Math.max(0, (width * scale - width) / 2)
        const yLimit = Math.max(0, (height * scale - height) / 2)
        return {
            left: -xLimit,
            right: xLimit,
            top: -yLimit,
            bottom: yLimit
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-neutral-950 select-none cursor-zoom-in group/zoom isolate"
            style={{
                touchAction: 'none', // Critical for custom gestures
                contain: 'paint',
                overscrollBehavior: 'contain'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
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

            {/* Floating Reset Control */}
            <AnimatePresence>
                {scale > 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-6 right-6 flex flex-col gap-2 z-40"
                    >
                        <button
                            onClick={() => {
                                setScale(1)
                                x.set(0)
                                y.set(0)
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-neutral-900/80 backdrop-blur-xl text-white rounded-full hover:bg-white hover:text-black transition-all border border-white/10 shadow-2xl"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function ProductClient({ product, related, isWishlisted }: ProductClientProps) {
    const router = useRouter()
    const { addItem } = useCart()

    // State
    const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '')
    const [customSizeInput, setCustomSizeInput] = useState('') // New Feature: Custom Size State
    const [quantity, setQuantity] = useState(1)
    const [addingToCart, setAddingToCart] = useState(false)
    const [inWishlist, setInWishlist] = useState(!!isWishlisted)
    const [message, setMessage] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [isVTOOpen, setIsVTOOpen] = useState(false)
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)
    const [sortBy, setSortBy] = useState('Newest')
    const [isSortOpen, setIsSortOpen] = useState(false)
    const [shippingCharge, setShippingCharge] = useState<number | null>(null)

    // Dynamic State based on Selected Size OR Length
    const dynamicData = React.useMemo(() => {
        // Fixed price override: admin has locked a specific price
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

        // No pricing map available — return static data
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

        // Determine the lookup key: size (rings) or length (chains), or 'default' (fixed)
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
            width: undefined,
            diameter: undefined,
            circumference: undefined,
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
    const [reviews, setReviews] = useState<any[]>([])
    const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)

    // Memoize image array to prevent re-calculations on every render
    const allImages = React.useMemo(() => {
        if (!product) return []

        const mainImage = product.image_url
        const result: string[] = []

        if (mainImage) result.push(mainImage)

        // Robust parsing for 'images' field which could be JSONB array or string
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
                // Postgres array format {url1,url2}
                const parts = trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
                result.push(...parts)
            } else {
                // Fallback: splitting by comma
                const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean)
                result.push(...parts)
            }
        }

        // Deduplicate and filter valid images
        const final = Array.from(new Set(result))
        return final
    }, [product])

    // Load Reviews
    const loadReviews = async () => {
        if (!product.id) return
        const [fetchedReviews, fetchedStats] = await Promise.all([
            getProductReviews(product.id),
            getReviewStats(product.id)
        ])
        setReviews(fetchedReviews)
        setReviewStats(fetchedStats)
    }

    useEffect(() => {
        loadReviews()
    }, [product.id])

    // Add to recently viewed on mount
    useEffect(() => {
        if (product) {
            addToRecentlyViewed(product)
        }
    }, [product.id]) // Only depend on ID

    const handleAddToCart = async () => {
        if (!product) return

        // Validate Custom Size
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

        // CHECK FOR PENDING ORDERS
        try {
            const hasPending = await checkPendingOrder(product.id)
            if (hasPending) {
                // User has this item in a pending order!
                setAddingToCart(false)

                // Show specific message and redirect confirmation
                if (confirm("Active Order Found!\n\nYou already have this item in an active order. duplicates are restricted to ensure fair access.\n\nWould you like to view your existing order?")) {
                    router.push('/account/orders')
                }
                return
            }
        } catch (e) {
            console.error(e) // Fail safe: proceed if check fails
        }

        await addItem(product.id, finalSize || 'One Size', quantity, product)
        setMessage('Added to your cart')
        setAddingToCart(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleBuyNow = async () => {
        if (!product) return

        // Validate Custom Size
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

        // CHECK FOR PENDING ORDERS
        try {
            const hasPending = await checkPendingOrder(product.id)
            if (hasPending) {
                setAddingToCart(false)
                if (confirm("Active Order Found!\n\nYou already have this item in an active order. duplicates are restricted to ensure fair access.\n\nWould you like to view your existing order?")) {
                    router.push('/account/orders')
                }
                return
            }
        } catch (e) {
            console.error(e)
        }

        // Add to cart (handles guest/user automatically via CartContext)
        await addItem(product.id, finalSize || 'One Size', 1, product)

        setAddingToCart(false)

        // Redirect to checkout - the checkout page will handle login redirect if needed
        router.push('/checkout')
    }

    const handleAddToWishlist = async () => {
        if (!product) return
        const result = await addToWishlist(product.id)
        if (result.success) {
            setInWishlist(true)
            setMessage('Added to wishlist!')
        } else {
            setMessage(result.error || 'Failed to add')
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
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                setMessage('Legacy Link Copied to Clipboard')
            }
        } catch (err) {
            console.error('Share failed:', err)
        }
    }

    if (!product) return null // Should be handled by server page redirect or 404

    return (
        <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30 relative">
            {/* Ambient Noise Layer */}
            <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />

            {/* Cinematic Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />


            <div className="pt-8 lg:pt-8 min-h-screen flex flex-col lg:flex-row relative z-10 items-start">
                {/* LEFT: Image Gallery */}
                <div className="w-full lg:w-[55%] lg:sticky lg:top-[160px] lg:h-[calc(100vh-160px)] p-0 lg:p-6 flex flex-col min-h-0">
                    {/* Main Image - Adjustable aspect for landscape look on mobile */}
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
                                if (info.offset.x < -swipeThreshold) {
                                    setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
                                } else if (info.offset.x > swipeThreshold) {
                                    setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
                                }
                            }}
                        >
                            <ZoomableImage src={sanitizeImagePath(allImages[selectedImage])} alt={product.name} />
                        </motion.div>

                        {/* Navigation Arrows */}
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

                        {/* Share Button */}
                        <div className="absolute top-6 right-6 z-20">
                            <button
                                onClick={handleShare}
                                className="w-10 h-10 bg-transparent flex items-center justify-center text-white/30 hover:text-white transition-all transform hover:rotate-12"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Thumbnails - Refined luxury positioning */}
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
                                        selectedImage === i
                                            ? "ring-1 ring-amber-200/40 opacity-100 grayscale-0"
                                            : "opacity-30 grayscale hover:opacity-100 hover:grayscale-0"
                                    )}
                                >
                                    <Image
                                        src={sanitizeImagePath(img)}
                                        alt={`${product.name} view ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                        loader={supabaseLoader}
                                    />
                                    {selectedImage === i && (
                                        <motion.div
                                            layoutId="thumb-border"
                                            className="absolute inset-0 border border-amber-200/20 z-10"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Product Details Scroll - Added safe bottom padding */}
                <div className="w-full lg:w-[45%] p-6 lg:p-12 lg:pr-24 flex flex-col justify-center pb-32 bg-neutral-950/50 backdrop-blur-3xl">
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Link href={`/collections?category=${product.categories?.slug}`} className="text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase hover:text-white transition-colors">
                                    {product.categories?.name || 'Collection'}
                                </Link>
                                <div className="flex flex-wrap gap-2">
                                    {product.gender && (
                                        <span className="px-3 py-1 border border-white/5 text-[9px] uppercase tracking-widest text-white/40">
                                            {product.gender}
                                        </span>
                                    )}
                                    {product.purity && (
                                        <span className="px-3 py-1 bg-amber-900/10 border border-amber-500/10 text-[9px] uppercase tracking-widest text-amber-500/80">
                                            {product.purity}
                                        </span>
                                    )}
                                    {product.stock === 0 && (
                                        <span className="px-4 py-1.5 bg-neutral-900/40 border border-white/10 text-[8px] font-black uppercase tracking-[0.4em] text-white/30 backdrop-blur-xl shadow-2xl">
                                            Private Archive / Sold Out
                                        </span>
                                    )}
                                    {product.stock < 5 && product.stock > 0 && (
                                        <span className="px-3 py-1 border border-red-500/20 text-[9px] uppercase tracking-widest text-red-500/80 animate-pulse">
                                            Only {product.stock} left in stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-4xl md:text-6xl lg:text-8xl font-serif text-white/90 leading-[0.85] tracking-tighter"
                                >
                                    {product.name}
                                </motion.h1>
                                {reviewStats.total > 0 && (
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-2.5 h-2.5 stroke-[1.5] ${s <= Math.round(reviewStats.average) ? 'fill-amber-200 text-amber-200' : 'text-white/5'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-medium tracking-widest text-white/60">{reviewStats.average}</span>
                                        </div>
                                        <button
                                            onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="text-[9px] text-white/40 uppercase tracking-widest hover:text-amber-500 transition-colors border-b border-white/10"
                                        >
                                            {reviewStats.total} Reviews
                                        </button>
                                    </div>
                                )}
                            </div>

                            <p className="text-3xl font-light text-amber-100/80 font-serif italic mb-6">
                                ₹{dynamicData.price.toLocaleString('en-IN')}
                            </p>

                            {/* Product Actions (Modularized) */}
                            <ProductActions
                                product={product}
                                dynamicData={dynamicData}
                                selectedSize={selectedSize}
                                setSelectedSize={setSelectedSize}
                                setCustomSizeInput={setCustomSizeInput}
                                handleAddToCart={handleAddToCart}
                                handleBuyNow={handleBuyNow}
                                handleAddToWishlist={handleAddToWishlist}
                                addingToCart={addingToCart}
                                inWishlist={inWishlist}
                                setIsSizeGuideOpen={setIsSizeGuideOpen}
                            />
                        </div>

                        <div className="h-px w-24 bg-gradient-to-r from-amber-500/40 to-transparent" />

                        {/* Product Highlights (Modularized) */}
                        <ProductHighlights
                            product={product}
                            setIsVTOOpen={setIsVTOOpen}
                            CachedVideo={CachedVideo}
                            MATERIAL_CONFIG={MATERIAL_CONFIG}
                            formatPurity={formatPurity}
                        />

                        {/* Automatic Specifications Table */}
                        <ProductSpecs
                            product={product}
                            dynamicData={dynamicData}
                        />

                        <DeliveryChecker
                            product={product}
                            onShippingUpdate={(rate) => setShippingCharge(rate)}
                        />






                    </div>
                </div>
            </div>

            {/* STICKY ACTION BAR - Mirroring Palmonas Luxury UI */}
            <AnimatePresence>
                {scrolled && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-none overflow-hidden flex-shrink-0 border border-white/5">
                                    <Image
                                        src={sanitizeImagePath(product.image_url)}
                                        alt={product.name}
                                        width={100}
                                        height={100}
                                        className="w-full h-full object-cover"
                                        loader={supabaseLoader}
                                    />
                                </div>
                                <div className="hidden sm:block min-w-0">
                                    <h4 className="text-xs font-serif italic text-white truncate">{product.name}</h4>
                                    <p className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">₹{dynamicData.price.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-1 md:flex-none justify-end">
                                <div className="text-right mr-4 hidden md:block">
                                    <p className="text-lg font-serif text-white">₹{dynamicData.price.toLocaleString()}</p>
                                    <p className="text-[9px] text-amber-500/60 uppercase tracking-widest font-bold">
                                        {shippingCharge !== null ? (shippingCharge > 0 ? `+ ₹${shippingCharge} Shipping` : 'Free Shipping') : (product.price >= 50000 ? 'Free Shipping' : 'Standard Shipping')}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    className="hidden md:flex bg-transparent border border-white/20 text-white h-12 px-8 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white hover:text-black transition-all rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {product.stock === 0 ? 'Out of Stock' : (addingToCart ? <Loader2 className="animate-spin w-3 h-3" /> : 'Add to Bag')}
                                </Button>
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={addingToCart || product.stock === 0}
                                    className="flex-1 md:flex-none bg-white text-black h-12 px-10 md:px-12 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-neutral-200 transition-all rounded-none shadow-[0_4px_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {product.stock === 0 ? 'Sold Out' : 'Buy It Now'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Smart Recommendations - Curated Pairings */}
            <PairItWith productId={product.id} />

            {/* Review Section (Modularized) */}
            <ProductReviewsSection productId={product.id} />

            {/* Recently Viewed - User Journey */}
            <RecentlyViewed />

            {message && (
                <div className="fixed bottom-8 right-8 z-50 bg-neutral-900 border border-white/10 text-white px-8 py-4 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-5">
                    <span className="w-1 h-1 bg-amber-200 rounded-full" />
                    <p className="text-[10px] uppercase tracking-[0.2em]">{message}</p>
                </div>
            )}

            <VTOModal
                isOpen={isVTOOpen}
                onClose={() => setIsVTOOpen(false)}
                productImage={product.image_url}
                productName={product.name}
            />

            <AnimatePresence>
                {isSizeGuideOpen && (
                    <SizeGuide
                        category={product.categories?.name}
                        onClose={() => setIsSizeGuideOpen(false)}
                    />
                )}
            </AnimatePresence>

        </div>
    )
}
