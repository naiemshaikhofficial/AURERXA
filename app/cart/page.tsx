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

    const handleUpdateQuantity = async (cartId: string, newQuantity: number) => {
        await updateQuantity(cartId, newQuantity)
    }

    const handleRemove = async (cartId: string) => {
        await removeItem(cartId)
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
    const shipping = subtotal >= 50000 ? 0 : 90
    const total = subtotal + shipping

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <img
                    src="https://img.icons8.com/?size=100&id=82738&format=png&color=F59E0B"
                    alt="Loading"
                    className="w-8 h-8 animate-spin"
                />
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
                            <img
                                src="https://img.icons8.com/?size=100&id=Ot2P5D5MPltM&format=png&color=F59E0B"
                                alt="Empty Cart"
                                className="w-16 h-16 mx-auto mb-6 opacity-40"
                            />
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
                                        className="bg-neutral-900 border border-neutral-800/50 p-6 flex gap-6 hover:border-amber-500/30 transition-all duration-500 group"
                                    >
                                        <Link href={`/products/${item.products?.slug || item.product_id}`} className="relative w-28 h-28 flex-shrink-0 overflow-hidden bg-neutral-950">
                                            <Image
                                                src={item.products?.image_url || '/placeholder.jpg'}
                                                alt={item.products?.name || 'Product'}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                unoptimized
                                            />
                                        </Link>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-4">
                                                    <Link href={`/products/${item.products?.slug || item.product_id}`}>
                                                        <h3 className="font-serif text-lg font-medium tracking-wide hover:text-amber-500 transition-colors">
                                                            {item.products?.name}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-amber-500 font-medium">
                                                        ₹{(item.products?.price || 0).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                {item.size && (
                                                    <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">Size: {item.size}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center bg-neutral-950 border border-neutral-800 p-1">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        className="w-10 h-10 flex items-center justify-center hover:bg-neutral-900 transition-colors disabled:opacity-30 group"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <img
                                                            src="https://img.icons8.com/?size=100&id=82743&format=png&color=999999"
                                                            alt="Minus"
                                                            className="w-5 h-5 group-hover:scale-110"
                                                        />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="w-10 h-10 flex items-center justify-center hover:bg-neutral-900 transition-colors group"
                                                    >
                                                        <img
                                                            src="https://img.icons8.com/?size=100&id=82744&format=png&color=F59E0B"
                                                            alt="Plus"
                                                            className="w-5 h-5 group-hover:scale-110"
                                                        />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="text-[10px] uppercase tracking-widest text-white/30 hover:text-red-500 transition-all flex items-center gap-2 group/remove"
                                                >
                                                    <img
                                                        src="https://img.icons8.com/?size=100&id=82717&format=png&color=666666"
                                                        alt="Remove"
                                                        className="w-5 h-5 opacity-50 group-hover/remove:opacity-100 group-hover/remove:translate-y-[-1px] transition-all"
                                                    />
                                                    Remove
                                                </button>
                                            </div>
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
                                            <span>{subtotal >= 50000 ? 'FREE' : '₹90'}</span>
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
                                        <Button className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold uppercase tracking-widest h-12 group">
                                            Checkout
                                            <img
                                                src="https://img.icons8.com/?size=100&id=82731&format=png&color=000000"
                                                alt="Arrow"
                                                className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                                            />
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
