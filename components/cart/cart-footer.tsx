'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Truck, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CartFooterProps {
    subtotal: number
    cartCount: number
    closeCart: () => void
}

export function CartFooter({ subtotal, cartCount, closeCart }: CartFooterProps) {
    return (
        <div className="px-6 py-6 border-t border-border/40 bg-card/10 space-y-6">
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-2 italic">
                        Estimated Subtotal
                    </span>
                    <span className="text-lg font-serif italic text-foreground tracking-tight">
                        ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground italic leading-relaxed text-center">
                    Complimentary insured shipping & signature packaging included.
                    Prices are inclusive of all taxes.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <Button asChild className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.2em] rounded-none shadow-xl shadow-primary/10 group transition-all duration-300">
                    <Link href="/checkout" onClick={closeCart}>
                        <span className="flex items-center gap-3">
                            Proceed to Checkout
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>
                </Button>

                <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="flex flex-col items-center gap-1 px-2 py-3 bg-muted/30 border border-border/20 rounded-sm">
                        <Lock className="w-3 h-3 text-primary" strokeWidth={1.5} />
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 px-2 py-3 bg-muted/30 border border-border/20 rounded-sm">
                        <ShieldCheck className="w-3 h-3 text-primary" strokeWidth={1.5} />
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Authentic</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 px-2 py-3 bg-muted/30 border border-border/20 rounded-sm">
                        <Truck className="w-3 h-3 text-primary" strokeWidth={1.5} />
                        <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Insured</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
