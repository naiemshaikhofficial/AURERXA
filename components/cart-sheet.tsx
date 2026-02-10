'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Lock, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function CartSheet() {
    const { items, isCartOpen, closeCart, updateQuantity, removeItem, cartCount } = useCart()

    const subtotal = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0)
    }, [items])

    const freeShippingThreshold = 50000
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100)
    const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0)

    // Calculate free shipping width for animation
    const progressWidth = `${progress}%`

    return (
        <Sheet open={isCartOpen} onOpenChange={closeCart}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background border-l border-border/40">
                <SheetHeader className="px-6 py-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <SheetTitle className="font-serif text-2xl font-light italic text-foreground">Your Selection</SheetTitle>
                        <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                            {cartCount} Items
                        </span>
                    </div>
                </SheetHeader>

                {/* Free Shipping Meter */}
                <div className="px-6 py-4 bg-muted/30 border-b border-border/40">
                    <div className="flex justify-between text-xs mb-2 tracking-wide uppercase text-muted-foreground font-medium">
                        <span>Free Insured Shipping</span>
                        <span className={remainingForFreeShipping === 0 ? "text-primary font-bold" : ""}>
                            {remainingForFreeShipping === 0 ? 'Unlocked' : `₹${remainingForFreeShipping.toLocaleString('en-IN')} away`}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: progressWidth }}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {items.length === 0 ? (
                        <div className="h-[50vh] flex flex-col items-center justify-center space-y-6 opacity-60 px-6 text-center">
                            <div className="p-4 bg-muted rounded-full">
                                <ShoppingBag className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-serif text-xl italic text-foreground mb-2">Your collection is empty</p>
                                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Start filling it with timeless pieces crafted just for you.</p>
                            </div>
                            <Button variant="outline" onClick={closeCart} className="uppercase tracking-widest text-xs border-primary/20 hover:border-primary text-primary transition-colors">
                                Start Exploring
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-8">
                            <div className="space-y-6">
                                <AnimatePresence mode="popLayout">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex gap-4 group"
                                        >
                                            <Link href={`/products/${item.products?.slug}`} onClick={closeCart} className="relative w-20 h-24 bg-muted flex-shrink-0 overflow-hidden rounded-sm border border-border/50">
                                                <Image
                                                    src={item.products?.image_url || '/placeholder.jpg'}
                                                    alt={item.products?.name || 'Product'}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    sizes="80px"
                                                    unoptimized
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <Link href={`/products/${item.products?.slug}`} onClick={closeCart}>
                                                            <h4 className="font-serif text-base font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">
                                                                {item.products?.name}
                                                            </h4>
                                                        </Link>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 -mr-1"
                                                            aria-label="Remove item"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-semibold mt-1">₹{(item.products?.price || 0).toLocaleString('en-IN')}</p>
                                                    {item.size && <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Size: {item.size}</p>}
                                                </div>

                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center border border-border rounded-sm bg-background">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-medium tabular-nums">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Upsell / Urgency Section */}
                            <div className="pt-6 border-t border-dashed border-border/60">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Detailed Craftsmanship</p>
                                    <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded">Handmade</span>
                                </div>
                                <div className="p-4 bg-muted/20 rounded border border-border/40 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full -mr-8 -mt-8" />
                                    <p className="text-xs italic text-muted-foreground relative z-10">
                                        "True luxury lies in the details. Each piece is inspected 3 times before it reaches you."
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </ScrollArea>

                <div className="p-6 bg-background border-t border-border/40 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)] z-20 relative">
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground">Subtotal</span>
                            <span className="font-serif text-2xl text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/30 my-2">
                            <div className="flex flex-col items-center gap-1.5 text-center">
                                <ShieldCheck className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Authentic</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 text-center px-2 border-x border-border/30">
                                <Truck className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Insured</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 text-center">
                                <Lock className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Secure</span>
                            </div>
                        </div>

                        <Link href="/checkout" onClick={closeCart} className="block w-full">
                            <Button className="w-full h-12 rounded-sm bg-foreground text-background hover:bg-foreground/90 uppercase tracking-[0.2em] font-bold text-xs group transition-all relative overflow-hidden">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Checkout Securely
                                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </Button>
                        </Link>

                        <p className="text-[10px] text-center text-muted-foreground/50">
                            Taxes and shipping calculated at checkout
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
