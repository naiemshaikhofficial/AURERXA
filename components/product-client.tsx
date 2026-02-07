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
            className="relative w-full h-full overflow-hidden cursor-zoom-in active:cursor-grabbing"
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
                    className="p-2 bg-black/60 text-white rounded-full hover:bg-amber-500 hover:text-black transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Hint only when not zoomed */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-[10px] text-white/80 uppercase tracking-widest pointer-events-none transition-opacity duration-300 ${scale === 1 ? 'opacity-100' : 'opacity-0'}`}>
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

    // Memoize image array to prevent re-calculations on every render
    const allImages = React.useMemo(() => {
        if (!product) return []
        const imgs = product.images
        let additional: string[] = []

        if (Array.isArray(imgs)) {
            additional = imgs
        } else if (typeof imgs === 'string' && imgs.startsWith('{')) {
            additional = imgs.slice(1, -1).split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
        }

        return [product.image_url, ...additional]
    }, [product])

    // Add to recently viewed on mount
    useEffect(() => {
        if (product) {
            addToRecentlyViewed({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                slug: product.slug
            })
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
            url: window.location.href,
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
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            <Navbar />

            <div className="pt-20 lg:pt-24 min-h-screen flex flex-col lg:flex-row relative z-10">
                {/* LEFT: Image Gallery */}
                <div className="w-full lg:w-[55%] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 p-6 flex flex-col gap-6">
                    {/* Main Image */}
                    <div className="relative w-full aspect-[4/5] lg:aspect-auto flex-1 bg-neutral-900 border border-white/5 overflow-hidden group">
                        <div className="absolute inset-0 z-10">
                            <ZoomableImage src={allImages[selectedImage]} alt={product.name} />
                        </div>

                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 duration-300"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 duration-300"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        {/* Share Button */}
                        <div className="absolute top-4 right-4 z-20">
                            <button className="w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>


                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {allImages.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`relative w-24 h-24 flex-shrink-0 border transition-all duration-300 ${selectedImage === i ? 'border-amber-500 opacity-100' : 'border-white/10 opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} view ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Product Details Scroll - Added safe bottom padding */}
                <div className="w-full lg:w-[45%] p-6 lg:p-12 lg:pr-24 flex flex-col justify-center pb-32">
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Link href={`/collections?category=${product.categories?.slug}`} className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase hover:underline underline-offset-4">
                                    {product.categories?.name || 'Collection'}
                                </Link>
                                <div className="flex flex-wrap gap-2">
                                    {product.gender && (
                                        <span className="px-2 py-0.5 border border-white/10 text-[10px] uppercase tracking-wider text-white/60">
                                            {product.gender}
                                        </span>
                                    )}
                                    {product.purity && (
                                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[10px] uppercase tracking-wider text-amber-500 font-medium">
                                            {product.purity}
                                        </span>
                                    )}
                                    {product.weight_grams && (
                                        <span className="px-2 py-0.5 border border-white/10 text-[10px] uppercase tracking-wider text-white/60">
                                            {product.weight_grams} g
                                        </span>
                                    )}
                                    {product.stock < 5 && product.stock > 0 && (
                                        <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-1 uppercase tracking-widest font-bold border border-red-500/20">
                                            Low Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[0.9] tracking-tight">
                                {product.name}
                            </h1>

                            <p className="text-3xl font-light text-white/90">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="h-[1px] w-full bg-white/10" />

                        {/* Description */}
                        <div className="prose prose-invert prose-sm max-w-none text-white/60 font-light leading-relaxed">
                            <p>{product.description}</p>
                            <ul className="list-none pl-0 space-y-2 mt-4 text-[11px] uppercase tracking-wider text-white/40">
                                <li className="flex items-center gap-3"><Shield className="w-3 h-3 text-amber-500" /> Authenticity Certified</li>
                                <li className="flex items-center gap-3"><Truck className="w-3 h-3 text-amber-500" /> Premium Insured Shipping</li>
                                <li className="flex items-center gap-3"><RefreshCw className="w-3 h-3 text-amber-500" /> Lifetime Maintenance</li>
                            </ul>
                        </div>

                        {/* Delivery Check */}
                        {/* Product Specifications Section */}
                        {(product.dimensions_width || product.dimensions_height || product.dimensions_length) && (
                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Specifications</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {product.dimensions_width && (
                                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-4 text-center">
                                            <p className="text-[8px] text-amber-500/60 uppercase tracking-widest mb-1">Width</p>
                                            <p className="text-sm font-serif italic">{product.dimensions_width}{product.dimensions_unit || 'mm'}</p>
                                        </div>
                                    )}
                                    {product.dimensions_height && (
                                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-4 text-center">
                                            <p className="text-[8px] text-amber-500/60 uppercase tracking-widest mb-1">Height</p>
                                            <p className="text-sm font-serif italic">{product.dimensions_height}{product.dimensions_unit || 'mm'}</p>
                                        </div>
                                    )}
                                    {product.dimensions_length && (
                                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-4 text-center">
                                            <p className="text-[8px] text-amber-500/60 uppercase tracking-widest mb-1">Length</p>
                                            <p className="text-sm font-serif italic">{product.dimensions_length}{product.dimensions_unit || 'mm'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <DeliveryChecker productPrice={product.price} />


                        {/* Selectors */}
                        <div className="space-y-6 pt-4">
                            {/* Sizes */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="space-y-3">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Select Size</span>
                                    <div className="flex flex-wrap gap-3">
                                        {product.sizes.map((size: string) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`min-w-[3rem] px-3 h-12 flex items-center justify-center text-xs font-bold border transition-all ${selectedSize === size
                                                    ? 'bg-amber-500 text-black border-amber-500'
                                                    : 'border-white/20 text-white hover:border-white'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                        {/* Custom Size Option */}
                                        <button
                                            onClick={() => setSelectedSize('Custom')}
                                            className={`px-4 h-12 flex items-center justify-center text-xs font-bold border transition-all ${selectedSize === 'Custom'
                                                ? 'bg-amber-500 text-black border-amber-500'
                                                : 'border-white/20 text-white hover:border-white'
                                                }`}
                                        >
                                            Custom Size
                                        </button>
                                    </div>

                                    {/* Custom Size Input */}
                                    {selectedSize === 'Custom' && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <input
                                                type="text"
                                                placeholder="Enter your size (e.g., US 7.5, 18mm)"
                                                className="w-full h-12 bg-transparent border border-amber-500/50 text-white px-4 text-xs tracking-wider focus:outline-none focus:border-amber-500 placeholder:text-white/20"
                                                onChange={(e) => setCustomSizeInput(e.target.value)}
                                            />
                                            <div className="mt-2 space-y-1">
                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Shield className="w-3 h-3" /> Custom size will not be returnable
                                                </p>
                                                <p className="text-[9px] text-amber-500/60 uppercase tracking-wider">* We will contact you to confirm details</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    className="flex-1 bg-neutral-900 border border-white/20 text-white h-14 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white hover:text-black transition-all rounded-none"
                                >
                                    {addingToCart ? <Loader2 className="animate-spin" /> : 'Add to Cart'}
                                </Button>

                                <button
                                    onClick={handleAddToWishlist}
                                    className={`w-14 h-14 flex items-center justify-center border transition-all ${inWishlist
                                        ? 'bg-red-500/10 border-red-500 text-red-500'
                                        : 'border-white/20 text-white hover:border-amber-500 hover:text-amber-500'
                                        }`}
                                >
                                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            <Button
                                onClick={handleBuyNow}
                                disabled={addingToCart || product.stock === 0}
                                className="w-full bg-amber-500 text-black h-14 uppercase tracking-[0.2em] text-sm font-bold hover:bg-amber-400 rounded-none shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse hover:animate-none"
                            >
                                Buy Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products - Cinematic Strip */}
            {related.length > 0 && (
                <div className="py-32 border-t border-white/5 relative bg-neutral-950">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col items-center mb-16 text-center">
                            <span className="text-amber-500 text-[10px] uppercase tracking-[0.4em] mb-4">Complete Your Look</span>
                            <h2 className="text-3xl md:text-5xl font-serif text-white">Curated Pairings</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {related.map((item) => (
                                <Link key={item.id} href={`/products/${item.id}`} className="group block">
                                    <div className="aspect-[3/4] bg-neutral-900 relative overflow-hidden border border-white/5 group-hover:border-amber-500/30 transition-colors">
                                        <Image
                                            src={item.image_url}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105 contrast-125"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors duration-500" />
                                        <div className="absolute bottom-0 inset-x-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <p className="text-white font-serif text-lg">{item.name}</p>
                                            <p className="text-amber-500 text-sm mt-1">₹{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {message && (
                <div className="fixed bottom-8 right-8 z-50 bg-neutral-900 border border-amber-500/50 text-white px-6 py-4 flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <p className="text-xs uppercase tracking-widest">{message}</p>
                </div>
            )}

            <Footer />
        </div>
    )
}
