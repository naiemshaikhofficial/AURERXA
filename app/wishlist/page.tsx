'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { getWishlist, removeFromWishlist } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react'

export default function WishlistPage() {
    const { addItem } = useCart()
    const [wishlist, setWishlist] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState<string | null>(null)

    useEffect(() => {
        loadWishlist()
    }, [])

    async function loadWishlist() {
        const data = await getWishlist()
        setWishlist(data)
        setLoading(false)
    }

    const handleRemove = async (productId: string) => {
        setActionId(productId)
        await removeFromWishlist(productId)
        await loadWishlist()
        setActionId(null)
    }

    const handleMoveToCart = async (productId: string, productData: any) => {
        setActionId(productId)
        await addItem(productId, 'Standard', 1, productData)
        await removeFromWishlist(productId)
        await loadWishlist()
        setActionId(null)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-16 md:pt-24 pb-24 min-h-[70vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-center">My Wishlist</h1>
                    <p className="text-white/50 text-center mb-12">{wishlist.length} items saved</p>

                    {wishlist.length === 0 ? (
                        <div className="text-center py-16">
                            <Heart className="w-16 h-16 mx-auto mb-6 text-white/20" />
                            <p className="text-xl text-white/50 mb-8">Your wishlist is empty</p>
                            <Link href="/collections">
                                <Button className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest">
                                    Explore Collections
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {wishlist.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all group"
                                >
                                    <Link href={`/products/${item.product_id}`} className="block relative aspect-square overflow-hidden">
                                        <Image
                                            src={item.products?.image_url || '/placeholder.jpg'}
                                            alt={item.products?.name || 'Product'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </Link>

                                    <div className="p-4">
                                        <Link href={`/products/${item.product_id}`}>
                                            <h3 className="font-serif text-sm mb-1 truncate hover:text-amber-400 transition-colors">
                                                {item.products?.name}
                                            </h3>
                                        </Link>
                                        <p className="text-amber-400 font-medium mb-4">
                                            ₹{(item.products?.price || 0).toLocaleString('en-IN')}
                                        </p>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleMoveToCart(item.product_id, item.products)}
                                                disabled={actionId === item.product_id}
                                                size="sm"
                                                className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs h-9"
                                            >
                                                {actionId === item.product_id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <ShoppingBag className="w-3 h-3 mr-1" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => handleRemove(item.product_id)}
                                                disabled={actionId === item.product_id}
                                                size="sm"
                                                variant="outline"
                                                className="border-neutral-700 hover:border-red-500 hover:text-red-400 h-9 w-9 p-0"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
