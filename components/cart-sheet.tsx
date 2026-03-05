'use client'

import React, { useMemo } from 'react'
import { useCart } from '@/context/cart-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatePresence } from 'framer-motion'
import { CartItem } from './cart/cart-item'
import { CartEmptyState } from './cart/cart-empty-state'
import { CartFooter } from './cart/cart-footer'

export function CartSheet() {
    const {
        items,
        savedItems,
        isCartOpen,
        closeCart,
        updateQuantity,
        removeItem,
        cartCount,
        saveForLater,
        moveToCart,
        removeSavedItem
    } = useCart()

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
                        <SheetDescription className="sr-only">
                            Review your selected items and proceed to checkout.
                        </SheetDescription>
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
                    {items.length === 0 && savedItems.length === 0 ? (
                        <CartEmptyState closeCart={closeCart} />
                    ) : (
                        <div className="p-6 space-y-8">
                            {/* Active Items */}
                            {items.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">In Your Cart</h4>
                                    </div>
                                    <AnimatePresence mode="popLayout">
                                        {items.map((item) => (
                                            <CartItem
                                                key={item.id}
                                                item={item}
                                                removeItem={removeItem}
                                                updateQuantity={updateQuantity}
                                                closeCart={closeCart}
                                                saveForLater={saveForLater}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Saved Items */}
                            {savedItems.length > 0 && (
                                <div className="pt-8 border-t border-border/40 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Saved for Later</h4>
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full">
                                            {savedItems.length} {savedItems.length === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </div>
                                    <AnimatePresence mode="popLayout">
                                        {savedItems.map((item) => (
                                            <CartItem
                                                key={`saved-${item.id}`}
                                                item={item}
                                                removeItem={() => removeSavedItem(item.product_id, item.size)}
                                                updateQuantity={() => { }}
                                                closeCart={closeCart}
                                                isSaved={true}
                                                moveToCart={moveToCart}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Show empty cart state but with saved items below */}
                            {items.length === 0 && savedItems.length > 0 && (
                                <div className="pt-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-4 font-light">Your cart is empty, but you have items saved.</p>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {items.length > 0 && (
                    <CartFooter
                        subtotal={subtotal}
                        cartCount={cartCount}
                        closeCart={closeCart}
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}
