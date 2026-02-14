'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, ShoppingBag, X } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animation-constants'
import { useCart } from '@/context/cart-context'

interface Hotspot {
    id: string
    x: number
    y: number
    productId: string
    productName: string
    productPrice: number
    productSlug: string
}

interface LookbookItem {
    id: string
    image: string
    title: string
    hotspots: Hotspot[]
    className?: string
}

const LOOKBOOK_DATA: LookbookItem[] = [
    {
        id: '1',
        image: '/pexels-the-glorious-studio-3584518-29245554.webp',
        title: 'Editorial Noir',
        className: 'md:col-span-2 md:row-span-2',
        hotspots: [
            {
                id: 'hs1',
                x: 45,
                y: 35,
                productId: 'necklace-1',
                productName: 'Aurerxa Signature Solitaire',
                productPrice: 125000,
                productSlug: 'necklace-1'
            }
        ]
    },
    {
        id: '2',
        image: '/pexels-the-glorious-studio-3584518-29245554.webp',
        title: 'The Solitaire Edit',
        className: 'md:col-span-1 md:row-span-1',
        hotspots: [
            {
                id: 'hs2',
                x: 60,
                y: 40,
                productId: 'ring-1',
                productName: 'Hand-Crafted Band',
                productPrice: 45000,
                productSlug: 'ring-1'
            }
        ]
    },
    {
        id: '3',
        image: '/pexels-the-glorious-studio-3584518-29245554.webp',
        title: 'Bridal Glimmer',
        className: 'md:col-span-1 md:row-span-1',
        hotspots: []
    }
]

function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
    const [isOpen, setIsOpen] = useState(false)
    const { addItem } = useCart()
    const [isAdding, setIsAdding] = useState(false)

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsAdding(true)
        await addItem(hotspot.productId, 'Standard', 1, {
            id: hotspot.productId,
            name: hotspot.productName,
            price: hotspot.productPrice,
            image_url: '',
            slug: hotspot.productSlug
        } as any)
        setIsAdding(false)
        setIsOpen(false)
    }

    return (
        <div
            className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full group transition-all hover:bg-white hover:text-black"
                aria-label="Shop this item"
            >
                <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 bg-neutral-900 border border-border p-4 shadow-2xl backdrop-blur-xl z-50"
                    >
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">In the Look</p>
                                <h4 className="text-xs font-serif text-white line-clamp-2">{hotspot.productName}</h4>
                                <p className="text-xs font-light text-neutral-400">₹{hotspot.productPrice.toLocaleString()}</p>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    href={`/products/${hotspot.productSlug}`}
                                    className="flex-1 py-2 text-[8px] uppercase tracking-widest text-center border border-neutral-700 text-white hover:bg-white hover:text-black transition-colors"
                                >
                                    Details
                                </Link>
                                <button
                                    onClick={handleAdd}
                                    disabled={isAdding}
                                    className="flex-1 py-2 text-[8px] uppercase tracking-widest bg-amber-600 text-white hover:bg-amber-500 transition-colors flex items-center justify-center gap-1"
                                >
                                    <ShoppingBag className="w-3 h-3" />
                                    {isAdding ? 'Wait' : 'Add'}
                                </button>
                            </div>
                        </div>
                        {/* Notch */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 border-r border-b border-border rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function Lookbook() {
    return (
        <section className="py-24 md:py-40 px-4 md:px-6 lg:px-12 bg-background">
            <div className="max-w-7xl mx-auto space-y-24">
                {/* Header */}
                <motion.div
                    className="text-center space-y-6"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <span className="text-primary/60 text-[10px] tracking-[0.8em] font-bold uppercase block">Life in Brilliance</span>
                    <h2 className="text-4xl md:text-7xl font-serif font-black italic text-foreground tracking-tighter leading-none mb-6">
                        The Shoppable <span className="text-gradient-gold">Lookbook.</span>
                    </h2>
                    <p className="text-muted-foreground text-[10px] md:text-xs font-light tracking-[0.4em] uppercase italic max-w-2xl mx-auto leading-relaxed">
                        Witness the confluence of craftsmanship and lifestyle.
                    </p>
                </motion.div>

                {/* Masonry Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[300px]"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {LOOKBOOK_DATA.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={fadeInUp}
                            className={`relative group overflow-hidden border border-border ${item.className || ''}`}
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-[3s] group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 transition-opacity duration-700 group-hover:bg-black/10" />

                            {/* Overlay Content */}
                            <div className="absolute bottom-8 left-8 z-10">
                                <p className="text-white text-[10px] uppercase font-bold tracking-[0.3em] font-premium-sans">{item.title}</p>
                            </div>

                            {/* Hotspots */}
                            {item.hotspots.map((hs) => (
                                <HotspotMarker key={hs.id} hotspot={hs} />
                            ))}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
