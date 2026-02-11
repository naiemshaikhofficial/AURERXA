'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { addToWishlist } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { addToRecentlyViewed } from '@/components/recently-viewed'
import { Heart, Shield, Truck, RefreshCw, ZoomIn, Loader2, ArrowLeft, ArrowRight, Share2, Maximize2, RotateCcw } from 'lucide-react'
import { DeliveryChecker } from '@/components/delivery-checker'
import { motion, AnimatePresence } from 'framer-motion'
import { VTOModal } from '@/components/vto-modal'


interface ProductClientProps {
    product: any
    related: any[]
    isWishlisted: boolean
}

function ZoomableImage({ src, alt }: { src: string, alt: string }) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    // Reset zoom on image change
    useEffect(() => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }, [src])

    // Native Wheel Listener for non-passive behavior (prevents page scroll)
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            e.stopPropagation()

            const delta = -e.deltaY * 0.005

            setScale(prevScale => {
                const newScale = Math.min(Math.max(1, prevScale + delta), 4)
                if (newScale === 1) setPosition({ x: 0, y: 0 })
                return newScale
            })
        }

        container.addEventListener('wheel', onWheel, { passive: false })
        return () => container.removeEventListener('wheel', onWheel)
    }, [])

    const toggleZoom = () => {
        if (scale > 1) {
            setScale(1)
            setPosition({ x: 0, y: 0 })
        } else {
            setScale(2.5)
        }
    }

    // Pinch Zoom Logic (Basic)
    const touchStartDist = useRef<number>(0)

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            touchStartDist.current = dist
        }
    }

    const onTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            const delta = dist - touchStartDist.current
            // Sensitivity factor
            const newScale = Math.min(Math.max(1, scale + delta * 0.01), 4)
            setScale(newScale)
            touchStartDist.current = dist
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden cursor-zoom-in active:cursor-grabbing bg-neutral-950"
            style={{ touchAction: scale > 1 ? 'none' : 'pan-y' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onDoubleClick={toggleZoom}
        >
            <motion.div
                className="w-full h-full"
                animate={{ scale, x: position.x, y: position.y }}
                drag={scale > 1}
                dragConstraints={containerRef}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={(e, info) => {
                    // Update position state if needed or let framer handle it
                    setPosition({ x: info.point.x, y: info.point.y }) // Roughly
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain p-8 lg:p-16 pointer-events-none select-none"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    draggable={false}
                    unoptimized
                />
            </motion.div>

            {/* Floating Controls */}
            <div className={`absolute bottom-6 right-6 flex gap-2 transition-opacity duration-300 ${scale > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                    onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }) }}
                    className="p-3 bg-neutral-900/80 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-colors border border-white/10"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Hint only when not zoomed */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900/60 backdrop-blur-md rounded-full text-[10px] text-white/60 uppercase tracking-[0.2em] pointer-events-none transition-opacity duration-300 border border-white/5 ${scale === 1 ? 'opacity-100' : 'opacity-0'}`}>
                Pinch / Scroll to Zoom
            </div>
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
    const [inWishlist, setInWishlist] = useState(isWishlisted)
    const [message, setMessage] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [isVTOOpen, setIsVTOOpen] = useState(false)

    // Memoize image array to prevent re-calculations on every render
    const allImages = React.useMemo(() => {
        if (!product) return []
        const imgs = product.images
        let additional: string[] = []

        if (Array.isArray(imgs)) {
            additional = imgs
        } else if (typeof imgs === 'string') {
            // Handle Postgres Array format {img1,img2}
            if (imgs.startsWith('{')) {
                additional = imgs.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
            }
            // Handle JSON String format ["img1","img2"]
            else if (imgs.startsWith('[')) {
                try {
                    const parsed = JSON.parse(imgs)
                    if (Array.isArray(parsed)) additional = parsed
                } catch (e) {
                    console.error('Failed to parse images JSON', e)
                }
            }
        }

        // Deduplicate and filter valid images
        const uniqueImages = Array.from(new Set([product.image_url, ...additional].filter(Boolean)))
        return uniqueImages
    }, [product])

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
                // Shake effect or highlight input could be added here
                return
            }
            finalSize = `Custom: ${customSizeInput}`
        }

        setAddingToCart(true)
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
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-500/30">
            <Navbar />

            <div className="pt-20 lg:pt-24 min-h-screen flex flex-col lg:flex-row relative z-10">
                {/* LEFT: Image Gallery */}
                <div className="w-full lg:w-[55%] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 p-0 lg:p-6 flex flex-col gap-6">
                    {/* Main Image */}
                    <div className="relative w-full aspect-[4/5] lg:aspect-auto flex-1 bg-neutral-900/20 border border-white/5 overflow-hidden group">
                        <div className="absolute inset-0 z-10">
                            <ZoomableImage src={allImages[selectedImage]} alt={product.name} />
                        </div>

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

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-6 lg:px-0 scroll-smooth snap-x">
                            {allImages.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 border transition-all duration-300 snap-center ${selectedImage === i ? 'border-amber-200/40 opacity-100' : 'border-white/5 opacity-40 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} view ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 80px, 96px"
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Product Details Scroll - Added safe bottom padding */}
                <div className="w-full lg:w-[45%] p-6 lg:p-12 lg:pr-24 flex flex-col justify-center pb-32 bg-neutral-950">
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-1000">
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
                                    {product.stock < 5 && product.stock > 0 && (
                                        <span className="px-3 py-1 border border-red-500/20 text-[9px] uppercase tracking-widest text-red-500/80">
                                            Low Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white/90 leading-[0.9] tracking-tight">
                                {product.name}
                            </h1>

                            <p className="text-3xl font-light text-amber-100/80 font-serif italic">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="h-px w-24 bg-gradient-to-r from-amber-500/40 to-transparent" />

                        {/* Description */}
                        <div className="prose prose-invert prose-sm max-w-none text-white/50 font-light leading-relaxed tracking-wide">
                            <p>{product.description}</p>

                            {/* NEW: Virtual Try-On Trigger */}
                            <div className="mt-10">
                                <button
                                    onClick={() => setIsVTOOpen(true)}
                                    className="w-full relative group flex items-center justify-between bg-white/5 border border-white/5 p-6 overflow-hidden transition-all hover:bg-neutral-900"
                                >
                                    <div className="relative z-10 flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-full bg-neutral-950 border border-white/10 flex items-center justify-center text-amber-200/80 group-hover:scale-110 transition-transform duration-500">
                                            <Maximize2 className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-amber-200/60 font-bold uppercase tracking-[0.3em] mb-2">Interactive Mirror</p>
                                            <p className="text-lg font-serif italic text-white/90 group-hover:text-amber-100 transition-colors">Virtual Try-On Experience</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </button>
                            </div>

                            {/* Video Embed */}
                            {product.video_url && (
                                <div className="mt-10 space-y-4">
                                    <p className="text-[10px] text-amber-500/60 font-bold uppercase tracking-[0.3em] font-premium-sans">Visual Experience</p>
                                    <div className="relative w-full aspect-video bg-neutral-900 border border-white/5 overflow-hidden">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${(() => {
                                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                                const match = product.video_url.match(regExp);
                                                return (match && match[2].length === 11) ? match[2] : null;
                                            })()}?modestbranding=1&rel=0`}
                                            title={product.name}
                                            className="absolute inset-0 w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 py-8 border-t border-b border-white/5">
                                <div className="flex flex-col items-center text-center gap-3 group">
                                    <Shield className="w-6 h-6 text-white/20 group-hover:text-amber-200/60 transition-colors duration-500" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Authenticity Certified</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-3 group">
                                    <Truck className="w-6 h-6 text-white/20 group-hover:text-amber-200/60 transition-colors duration-500" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Insured Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-3 group">
                                    <RefreshCw className="w-6 h-6 text-white/20 group-hover:text-amber-200/60 transition-colors duration-500" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Lifetime Maintenance</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Check */}
                        {/* Product Specifications Section */}
                        {(product.dimensions_width || product.dimensions_height || product.dimensions_length) && (
                            <div className="space-y-6 pt-6">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Dimensions</h3>
                                <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/5">
                                    {product.dimensions_width && (
                                        <div className="bg-neutral-950 p-4 text-center">
                                            <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Width</p>
                                            <p className="text-sm font-serif italic text-white/80">{product.dimensions_width}{product.dimensions_unit || 'mm'}</p>
                                        </div>
                                    )}
                                    {product.dimensions_height && (
                                        <div className="bg-neutral-950 p-4 text-center">
                                            <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Height</p>
                                            <p className="text-sm font-serif italic text-white/80">{product.dimensions_height}{product.dimensions_unit || 'mm'}</p>
                                        </div>
                                    )}
                                    {product.dimensions_length && (
                                        <div className="bg-neutral-950 p-4 text-center">
                                            <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1">Length</p>
                                            <p className="text-sm font-serif italic text-white/80">{product.dimensions_length}{product.dimensions_unit || 'mm'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <DeliveryChecker productPrice={product.price} />


                        {/* Selectors */}
                        <div className="space-y-8 pt-4">
                            {/* Sizes */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="space-y-4">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-3">Select Size</span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((size: string) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[3.5rem] px-4 h-12 flex items-center justify-center text-[10px] font-bold border transition-all duration-300 uppercase tracking-widest ${selectedSize === size
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-transparent border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                        {/* Custom Size Option */}
                                        <button
                                            onClick={() => setSelectedSize('Custom')}
                                            className={`px-6 h-12 flex items-center justify-center text-[10px] font-bold border transition-all duration-300 uppercase tracking-widest ${selectedSize === 'Custom'
                                                ? 'bg-white text-black border-white'
                                                : 'bg-transparent border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                                                }`}
                                        >
                                            Custom
                                        </button>
                                    </div>

                                    {/* Custom Size Input */}
                                    {selectedSize === 'Custom' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                                            <input
                                                type="text"
                                                placeholder="Enter size (e.g., US 7.5, 18mm)"
                                                className="w-full h-12 bg-white/5 border border-white/10 text-white px-4 text-xs tracking-wider focus:outline-none focus:border-white/30 placeholder:text-white/20 transition-all mb-2"
                                                onChange={(e) => setCustomSizeInput(e.target.value)}
                                            />
                                            <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-wider">
                                                <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                                Our concierge will verify measurements
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-4 pt-6">
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={addingToCart || product.stock === 0}
                                    className="w-full bg-white text-neutral-950 h-16 uppercase tracking-[0.3em] text-xs font-bold hover:bg-neutral-200 transition-all rounded-none"
                                >
                                    Purchase Now
                                </Button>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart || product.stock === 0}
                                        className="flex-1 bg-transparent border border-white/20 text-white h-14 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-white hover:text-black transition-all rounded-none"
                                    >
                                        {addingToCart ? <Loader2 className="animate-spin w-4 h-4" /> : 'Add to Bag'}
                                    </Button>

                                    <button
                                        onClick={handleAddToWishlist}
                                        className={`w-14 h-14 flex items-center justify-center border transition-all duration-300 ${inWishlist
                                            ? 'bg-red-500/10 border-red-500/50 text-red-500'
                                            : 'bg-transparent border-white/20 text-white hover:border-white hover:bg-white hover:text-black'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${inWishlist && 'fill-current'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products - Cinematic Strip */}
            {related.length > 0 && (
                <div className="py-32 border-t border-white/5 relative bg-neutral-950">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-20 text-center">
                            <span className="text-amber-200/60 text-[9px] uppercase tracking-[0.4em] mb-6">Complete The Set</span>
                            <h2 className="text-4xl md:text-5xl font-serif text-white/90 italic">Curated Pairings</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                            {related.map((item) => (
                                <Link key={item.id} href={`/products/${item.id}`} className="group block">
                                    <div className="aspect-[3/4] bg-neutral-900/40 relative overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-700">
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                                        <div className="absolute bottom-8 left-8 right-8 text-center transform translate-y-4 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-700">
                                            <p className="text-white font-serif text-xl italic mb-2">{item.name}</p>
                                            <p className="text-white/60 text-xs tracking-widest uppercase">View Artifact</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
            <Footer />
        </div>
    )
}
