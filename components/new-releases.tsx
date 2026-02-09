'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'

// This would typically be a server component, but we need client-side animation
// We'll accept data as props or fetch in a wrapper
export function NewReleases({ products }: { products: any[] }) {
    const containerRef = useRef<HTMLDivElement>(null)

    if (!products || products.length === 0) return null

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4">
                        <span className="text-primary text-xs tracking-[0.3em] uppercase font-premium-sans">
                            Just Arrived
                        </span>
                        <h2 className="text-4xl md:text-6xl font-serif text-foreground italic">
                            New <span className="text-foreground/20">Editions</span>
                        </h2>
                    </div>
                    <Link href="/collections?sort=newest" className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="text-xs tracking-widest uppercase">View All</span>
                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-foreground/40 transition-colors">
                            <Plus size={14} />
                        </div>
                    </Link>
                </div>

                {/* Horizontal Scroll Carousel */}
                <div className="flex overflow-x-auto pb-8 gap-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                    {products.map((product, i) => (
                        <Link
                            href={`/products/${product.slug}`}
                            key={product.id}
                            className="flex-shrink-0 w-[280px] md:w-[320px] snap-center group relative cursor-pointer"
                        >
                            <div className="aspect-[4/5] relative overflow-hidden bg-card border border-border group-hover:border-primary/30 transition-colors duration-500">
                                {/* Image */}
                                <Image
                                    src={product.image_url || '/placeholder.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    unoptimized
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Badge */}
                                <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                                    New
                                </div>

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <p className="text-primary text-xs uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        {product.categories?.name}
                                    </p>
                                    <h3 className="text-xl text-white font-serif italic mb-2 leading-none">
                                        {product.name}
                                    </h3>
                                    <p className="text-white/60 text-sm font-premium-sans">
                                        ₹{product.price.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
