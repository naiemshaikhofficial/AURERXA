'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { Minus, Plus, Trash2, ShoppingBag, Loader2, ArrowRight } from 'lucide-react'

export default function CartPage() {
    const { items: cart, loading, updateQuantity, removeItem } = useCart()
    const [updating, setUpdating] = useState<string | null>(null)

    const handleUpdateQuantity = async (cartId: string, newQuantity: number) => {
        setUpdating(cartId)
        await updateQuantity(cartId, newQuantity)
        setUpdating(null)
    }

    const handleRemove = async (cartId: string) => {
        setUpdating(cartId)
        await removeItem(cartId)
        setUpdating(null)
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
    const shipping = subtotal >= 50000 ? 0 : 500
    const total = subtotal + shipping

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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-center">Shopping Cart</h1>
                    <p className="text-white/50 text-center mb-12">{cart.length} items in your cart</p>

                    {cart.length === 0 ? (
                        <div className="text-center py-16">
                            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-white/20" />
                            <p className="text-xl text-white/50 mb-8">Your cart is empty</p>
                            <Link href="/collections">
                                <Button className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-neutral-900 border border-neutral-800 p-4 flex gap-4"
                                    >
                                        <Link href={`/products/${item.product_id}`} className="relative w-24 h-24 flex-shrink-0">
                                            <Image
                                                src={item.products?.image_url || '/placeholder.jpg'}
                                                alt={item.products?.name || 'Product'}
                                                fill
                                                className="object-cover"
                                            />
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <Link href={`/products/${item.product_id}`}>
                                                <h3 className="font-serif font-medium mb-1 truncate hover:text-amber-400 transition-colors">
                                                    {item.products?.name}
                                                </h3>
                                            </Link>
                                            {item.size && (
                                                <p className="text-sm text-white/50 mb-2">Size: {item.size}</p>
                                            )}
                                            <p className="text-amber-400 font-medium">
                                                ₹{(item.products?.price || 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={updating === item.id}
                                                    className="w-8 h-8 border border-neutral-700 flex items-center justify-center hover:border-amber-500 transition-colors disabled:opacity-50"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm">
                                                    {updating === item.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={updating === item.id}
                                                    className="w-8 h-8 border border-neutral-700 flex items-center justify-center hover:border-amber-500 transition-colors disabled:opacity-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                disabled={updating === item.id}
                                                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-neutral-900 border border-neutral-800 p-6 sticky top-24">
                                    <h2 className="font-serif text-lg font-medium mb-6">Order Summary</h2>

                                    <div className="space-y-3 mb-6 text-sm">
                                        <div className="flex justify-between text-white/70">
                                            <span>Subtotal</span>
                                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-white/70">
                                            <span>Shipping</span>
                                            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                        </div>
                                        {subtotal < 50000 && (
                                            <p className="text-xs text-amber-500">
                                                Add ₹{(50000 - subtotal).toLocaleString('en-IN')} more for free shipping
                                            </p>
                                        )}
                                        <div className="border-t border-neutral-800 pt-3 flex justify-between font-medium text-lg">
                                            <span>Total</span>
                                            <span className="text-amber-400">₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <Link href="/checkout">
                                        <Button className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest h-12">
                                            Checkout
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>

                                    <Link href="/collections" className="block text-center text-sm text-white/50 hover:text-amber-400 mt-4">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
