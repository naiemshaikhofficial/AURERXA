'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import supabaseLoader from '@/lib/supabase-loader'
import { Button } from '@/components/ui/button'
import { getWishlist, removeFromWishlist } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import { Heart, ShoppingBag, Trash2, Loader2, Search } from 'lucide-react'
import { useSearch } from '@/context/search-context'

export default function WishlistPage() {
    const { addItem } = useCart()
    const { openSearch } = useSearch()
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <main className="pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-center">My Wishlist</h1>
                    <p className="text-muted-foreground text-center mb-12">{wishlist.length} items saved</p>

                    {wishlist.length === 0 ? (
                        <div className="text-center py-16">
                            <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                            <p className="text-xl text-muted-foreground mb-8">Your wishlist is empty</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/collections">
                                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest h-12 px-8 rounded-none">
                                        Explore Collections
                                    </Button>
                                </Link>
                                <Button
                                    onClick={openSearch}
                                    variant="outline"
                                    className="w-full sm:w-auto border-border hover:bg-muted font-bold uppercase tracking-widest h-12 px-8 rounded-none flex items-center gap-3"
                                >
                                    <Search className="w-4 h-4 opacity-50" />
                                    Search
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {wishlist.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-card border border-border hover:border-primary/30 transition-all group"
                                >
                                    <Link href={`/products/${item.product_id}`} className="block relative aspect-square overflow-hidden">
                                        <Image
                                            src={item.products?.image_url || '/placeholder.jpg'}
                                            alt={item.products?.name || 'Product'}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 150px, 200px"
                                            loader={supabaseLoader}
                                        />
                                    </Link>

                                    <div className="p-4">
                                        <Link href={`/products/${item.product_id}`}>
                                            <h3 className="font-serif text-sm mb-1 truncate hover:text-primary transition-colors">
                                                {item.products?.name}
                                            </h3>
                                        </Link>
                                        <p className="text-primary font-medium mb-4">
                                            ₹{(item.products?.price || 0).toLocaleString('en-IN')}
                                        </p>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleMoveToCart(item.product_id, item.products)}
                                                disabled={actionId === item.product_id}
                                                size="sm"
                                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9"
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
                                                className="border-border hover:border-destructive hover:text-destructive h-9 w-9 p-0 bg-transparent"
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
