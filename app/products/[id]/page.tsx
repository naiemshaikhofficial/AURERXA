'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getProductById, getRelatedProducts, addToWishlist, isInWishlist } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { addToRecentlyViewed } from '@/components/recently-viewed'
import { ParallaxScroll } from '@/components/parallax-scroll'
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Loader2, Check, Truck, Shield, RefreshCw, ZoomIn, X } from 'lucide-react'

export default function ProductPage() {
    const params = useParams()
    const router = useRouter()
    const { addItem } = useCart()
    const [product, setProduct] = useState<any>(null)
    const [related, setRelated] = useState<any[]>([])
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [addingToCart, setAddingToCart] = useState(false)
    const [inWishlist, setInWishlist] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    // Image gallery state
    const [selectedImage, setSelectedImage] = useState(0)
    const [zoomed, setZoomed] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
    const imageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function loadProduct() {
            if (params.id) {
                const data = await getProductById(params.id as string)
                setProduct(data)
                if (data) {
                    setSelectedSize(data.sizes?.[0] || '')
                    const relatedData = await getRelatedProducts(data.category_id, data.id)
                    setRelated(relatedData)
                    const wishlistStatus = await isInWishlist(data.id)
                    setInWishlist(wishlistStatus)
                    // Add to recently viewed
                    addToRecentlyViewed({
                        id: data.id,
                        name: data.name,
                        price: data.price,
                        image_url: data.image_url
                    })
                }
                setLoading(false)
            }
        }
        loadProduct()
    }, [params.id])

    const handleAddToCart = async () => {
        if (!product) return
        setAddingToCart(true)
        await addItem(product.id, selectedSize, quantity, product)
        setMessage('Added to your cart')
        setAddingToCart(false)
        setTimeout(() => setMessage(null), 3000)
    }

    const handleBuyNow = async () => {
        if (!product) return
        setAddingToCart(true)
        await addItem(product.id, selectedSize, quantity, product)
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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return
        const rect = imageRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setZoomPosition({ x, y })
    }

    // Get all images
    const allImages = product ? [product.image_url, ...(product.images || [])] : []

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                    <span className="text-amber-500/50 text-xs font-premium-sans tracking-[0.5em] animate-pulse">ACQUIRING ASSET...</span>
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
                <h1 className="text-4xl font-serif mb-4">Content Unavailable</h1>
                <Link href="/collections" className="text-amber-500 hover:text-white transition-colors">Return to Collection</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            <Navbar />

            {/* Global Atmosphere - REMOVED for clean premium look */}

            <div className="pt-20 lg:pt-24 min-h-screen flex flex-col lg:flex-row relative z-10">
                {/* LEFT: Cinematic Sticky Gallery */}
                <div className="w-full lg:w-[55%] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 p-6 flex flex-col gap-6">
                    <div
                        ref={imageRef}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setZoomed(true)}
                        onMouseLeave={() => setZoomed(false)}
                        className="relative flex-1 w-full bg-neutral-900 border border-white/5 overflow-hidden group cursor-crosshair"
                    >
                        {/* Product "Blueprint" BG details REMOVED */}

                        <Image
                            src={allImages[selectedImage]}
                            alt={product.name}
                            fill
                            className="object-contain p-8 lg:p-16 transition-transform duration-500"
                            style={{
                                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                transform: zoomed ? 'scale(2)' : 'scale(1)'
                            }}
                            priority
                        />

                        {/* Zoom Hint */}
                        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur px-3 py-1 flex items-center gap-2 border border-white/10">
                            <ZoomIn className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] text-white uppercase tracking-widest">Zoom Enabled</span>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`relative w-20 h-20 flex-shrink-0 border transition-all ${selectedImage === i
                                        ? 'border-amber-500 grayscale-0'
                                        : 'border-white/10 grayscale hover:border-white/30'
                                        }`}
                                >
                                    <Image src={img} alt="Thumbnail" fill className="object-cover p-1" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Product Details Scroll */}
                <div className="w-full lg:w-[45%] p-6 lg:p-12 lg:pr-24 flex flex-col justify-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Link href={`/collections?material=${product.category_id}`} className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase hover:underline underline-offset-4">
                                    {product.category_id || 'Collection'}
                                </Link>
                                <div className="flex items-center gap-2">
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
                                                className={`w-12 h-12 flex items-center justify-center text-xs font-bold border transition-all ${selectedSize === size
                                                    ? 'bg-amber-500 text-black border-amber-500'
                                                    : 'border-white/20 text-white hover:border-white'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <div className="hidden">
                                    {/* Quantity Hidden for Luxury simplicity unless needed */}
                                </div>

                                <Button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    className="flex-1 bg-white text-black h-14 uppercase tracking-[0.2em] text-xs font-bold hover:bg-amber-500 hover:text-black transition-all rounded-none border-none"
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
                                className="w-full bg-neutral-900 border border-white/20 text-white h-12 uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-800 rounded-none"
                            >
                                Secure Checkout
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
