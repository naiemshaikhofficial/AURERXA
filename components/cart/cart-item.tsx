'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import supabaseLoader from '@/lib/supabase-loader'
import { sanitizeImagePath } from '@/lib/utils'

interface CartItemProps {
    item: any
    removeItem: (id: string) => void
    updateQuantity: (id: string, qty: number) => void
    closeCart: () => void
}

export function CartItem({ item, removeItem, updateQuantity, closeCart }: CartItemProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex gap-4 group"
        >
            <Link href={`/products/${item.products?.slug}`} onClick={closeCart} className="relative w-20 h-24 bg-muted flex-shrink-0 overflow-hidden rounded-sm border border-border/50">
                <Image
                    src={sanitizeImagePath(item.products?.image_url)}
                    alt={item.products?.name || 'Product'}
                    fill
                    className="object-cover"
                    sizes="80px"
                    loader={supabaseLoader}
                />
            </Link>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <Link href={`/products/${item.products?.slug}`} onClick={closeCart} className="text-sm font-medium hover:text-primary transition-colors line-clamp-2">
                            {item.products?.name}
                        </Link>
                        <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {item.products?.sku && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">SKU: {item.products.sku}</p>
                    )}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 bg-muted/50 rounded-sm border border-border/20 p-0.5">
                        <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 hover:text-primary transition-colors disabled:opacity-30"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-primary transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="text-sm font-serif italic text-foreground">
                        ₹{((item.products?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
