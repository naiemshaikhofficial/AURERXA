'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <main className="pb-24 min-h-[70vh]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <h1 className="text-3xl md:text-5xl font-serif text-foreground tracking-tight">
                            Your <span className="text-primary/60 italic">Selection</span>
                        </h1>
                        <p className="text-primary/60 text-[10px] uppercase tracking-[0.3em] font-bold">
                            {cart.length} Artifacts
                        </p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-24 border-t border-b border-border">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-muted-foreground/20" />
                            </div>
                            <h2 className="text-2xl font-serif text-muted-foreground mb-6 italic">Your collection is currently empty</h2>
                            <Link href="/collections">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.2em] px-8 py-6 rounded-none transition-all">
                                    Explore Collections
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-0">
                                {cart.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`group py-8 flex gap-6 md:gap-8 border-t border-border ${index === cart.length - 1 ? 'border-b' : ''}`}
                                    >
                                        <Link href={`/products/${item.products?.slug || item.product_id}`} className="relative w-32 h-40 md:w-40 md:h-48 flex-shrink-0 bg-muted overflow-hidden">
                                            <Image
                                                src={item.products?.image_url || '/placeholder.jpg'}
                                                alt={item.products?.name || 'Product'}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                                unoptimized
                                            />
                                        </Link>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-4">
                                                    <Link href={`/products/${item.products?.slug || item.product_id}`}>
                                                        <h3 className="font-serif text-2xl font-light tracking-wide text-foreground hover:text-primary/80 transition-colors">
                                                            {item.products?.name}
                                                        </h3>
                                                    </Link>
                                                    <p className="font-premium-sans text-lg text-foreground/90">
                                                        ₹{(item.products?.price || 0).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                {item.size && (
                                                    <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.2em]">Size: <span className="text-foreground/60">{item.size}</span></p>
                                                )}
                                                {item.products?.purity && (
                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.2em]">Purity: <span className="text-foreground/60">{item.products.purity}</span></p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-6">
                                                <div className="flex items-center border border-border">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-20"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-medium text-foreground/80">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 hover:text-destructive transition-colors flex items-center gap-2 group/remove"
                                                >
                                                    <Trash2 className="w-3 h-3 opacity-50 group-hover/remove:opacity-100 transition-all" />
                                                    <span className="hidden sm:inline">Remove Artifact</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-card/30 border border-border p-8 sticky top-24 backdrop-blur-sm">
                                    <h2 className="font-serif text-2xl font-light mb-8 italic text-foreground/90">Order Summary</h2>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-sm text-muted-foreground font-light tracking-wide">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground font-light tracking-wide">
                                            <span>Shipping</span>
                                            <span className="font-medium text-foreground">{subtotal >= 50000 ? 'Complimentary' : '₹90'}</span>
                                        </div>
                                        {subtotal < 50000 && (
                                            <div className="py-3 px-4 bg-primary/5 border border-primary/10 mt-2">
                                                <p className="text-[10px] text-primary/80 uppercase tracking-wider text-center leading-relaxed">
                                                    Add <span className="font-bold text-primary">₹{(50000 - subtotal).toLocaleString('en-IN')}</span> more for complimentary insured shipping
                                                </p>
                                            </div>
                                        )}
                                        <div className="border-t border-border pt-4 mt-4 flex justify-between items-baseline">
                                            <span className="text-sm uppercase tracking-widest text-foreground/80">Total</span>
                                            <span className="font-serif text-2xl text-primary/80">₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest text-right">Including all taxes</p>
                                    </div>

                                    <Link href="/checkout" className="block">
                                        <Button className="w-full bg-foreground hover:bg-foreground/90 text-background font-bold uppercase tracking-[0.25em] py-7 text-xs rounded-none group transition-all">
                                            Proceed to Checkout
                                            <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>

                                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500">
                                        <img src="https://img.icons8.com/?size=100&id=13611&format=png&color=FFFFFF" alt="Visa" className="h-6 invert dark:invert-0" />
                                        <img src="/Mastercard-logo.svg" alt="Mastercard" className="h-6 invert dark:invert-0" />
                                        <img src="/upi-icon.svg" alt="UPI" className="h-6 invert dark:invert-0" />
                                        <img src="/Rupay-Logo.png" alt="RuPay" className="h-6" />
                                    </div>
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
