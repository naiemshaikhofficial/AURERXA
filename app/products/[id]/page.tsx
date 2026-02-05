'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getProductById, getRelatedProducts, addToCart, addToWishlist, isInWishlist } from '@/app/actions'
import { addToRecentlyViewed } from '@/components/recently-viewed'
import { Heart, ShoppingBag, Minus, Plus, ChevronRight, Loader2, Check, Truck, Shield, RefreshCw, ZoomIn, X } from 'lucide-react'

export default function ProductPage() {
    const params = useParams()
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
        const result = await addToCart(product.id, selectedSize, quantity)
        if (result.success) {
            setMessage('Added to cart!')
        } else {
            setMessage(result.error || 'Failed to add')
        }
        setAddingToCart(false)
        setTimeout(() => setMessage(null), 3000)
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
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
                <p className="text-xl mb-4">Product not found</p>
                <Link href="/collections" className="text-amber-500 hover:text-amber-400">
                    ← Back to Collections
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-16 md:pt-24 pb-24">
                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-2 text-sm text-white/50">
                        <Link href="/" className="hover:text-amber-400">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/collections" className="hover:text-amber-400">Collections</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">{product.name}</span>
                    </nav>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div
                                ref={imageRef}
                                className="relative aspect-square bg-neutral-900 overflow-hidden cursor-zoom-in group"
                                onMouseMove={handleMouseMove}
                                onMouseEnter={() => setZoomed(true)}
                                onMouseLeave={() => setZoomed(false)}
                                onClick={() => setZoomed(!zoomed)}
                            >
                                <Image
                                    src={allImages[selectedImage] || product.image_url}
                                    alt={product.name}
                                    fill
                                    className={`object-cover transition-transform duration-200 ${zoomed ? 'scale-150' : ''}`}
                                    style={zoomed ? {
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                                    } : {}}
                                    priority
                                />

                                {/* Stock Badge */}
                                {product.stock <= 5 && product.stock > 0 && (
                                    <div className="absolute top-4 left-4 bg-amber-500 text-neutral-950 px-3 py-1 text-xs font-bold uppercase z-10">
                                        Only {product.stock} Left
                                    </div>
                                )}
                                {product.stock === 0 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-xs font-bold uppercase z-10">
                                        Out of Stock
                                    </div>
                                )}

                                {/* Zoom Hint */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-neutral-950/80 backdrop-blur-sm px-2 py-1 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ZoomIn className="w-3 h-3" />
                                    Hover to zoom
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={`relative w-16 h-16 flex-shrink-0 border-2 transition-all ${selectedImage === i
                                                    ? 'border-amber-500'
                                                    : 'border-neutral-700 hover:border-neutral-500'
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.name} ${i + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <p className="text-amber-400 text-sm uppercase tracking-[0.2em] mb-2">
                                {product.categories?.name}
                            </p>

                            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                                {product.name}
                            </h1>

                            <p className="text-3xl font-serif text-amber-400 mb-6">
                                ₹{product.price.toLocaleString('en-IN')}
                            </p>

                            <p className="text-white/60 leading-relaxed mb-8">
                                {product.description}
                            </p>

                            {/* Size Selector */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm uppercase tracking-wider text-white/80">Size</span>
                                        <Link href="/size-guide" className="text-xs text-amber-500 hover:text-amber-400">
                                            Size Guide
                                        </Link>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((size: string) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-12 h-12 border text-sm font-medium transition-all ${selectedSize === size
                                                    ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                                                    : 'border-neutral-700 text-white/70 hover:border-amber-500/50'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="mb-8">
                                <span className="text-sm uppercase tracking-wider text-white/80 block mb-3">Quantity</span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 border border-neutral-700 flex items-center justify-center hover:border-amber-500 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                                        className="w-10 h-10 border border-neutral-700 flex items-center justify-center hover:border-amber-500 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 mb-8">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock === 0}
                                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest h-14 text-sm"
                                >
                                    {addingToCart ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleAddToWishlist}
                                    variant="outline"
                                    className={`w-14 h-14 border-neutral-700 hover:border-amber-500 ${inWishlist ? 'bg-amber-500/10 border-amber-500' : ''}`}
                                >
                                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-amber-500 text-amber-500' : ''}`} />
                                </Button>
                            </div>

                            {/* Message */}
                            {message && (
                                <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center flex items-center justify-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {message}
                                </div>
                            )}

                            {/* Features */}
                            <div className="border-t border-neutral-800 pt-8 space-y-4">
                                <div className="flex items-center gap-4 text-sm text-white/60">
                                    <Truck className="w-5 h-5 text-amber-500" />
                                    <span>Free shipping on orders above ₹50,000</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-white/60">
                                    <Shield className="w-5 h-5 text-amber-500" />
                                    <span>Certified & Hallmarked Jewelry</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-white/60">
                                    <RefreshCw className="w-5 h-5 text-amber-500" />
                                    <span>15-Day Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {related.length > 0 && (
                        <section className="mt-24">
                            <h2 className="text-2xl font-serif font-bold mb-8 text-center">You May Also Like</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {related.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/products/${item.id}`}
                                        className="group bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all"
                                    >
                                        <div className="relative aspect-square overflow-hidden">
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-serif text-sm mb-1 truncate">{item.name}</h3>
                                            <p className="text-amber-400 font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
