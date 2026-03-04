'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn, sanitizeImagePath } from '@/lib/utils'

interface Category {
    id: string
    name: string
    slug: string
    image_url: string | null
    description?: string
}

interface CategoryGridProps {
    categories: Category[]
    onCategorySelect: (slug: string) => void
}

export function CategoryGrid({ categories, onCategorySelect }: CategoryGridProps) {
    // Filter out 'all' category if it exists in the data
    const displayCategories = categories.filter(cat => cat.slug !== 'all')

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pb-32">
            {displayCategories.map((category, index) => (
                <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => onCategorySelect(category.slug)}
                    className="group cursor-pointer relative aspect-[4/5] overflow-hidden bg-muted/5 border border-border/50"
                >
                    {/* Image */}
                    <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                        {category.image_url ? (
                            <img
                                src={sanitizeImagePath(category.image_url)}
                                alt={category.name}
                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{category.name}</span>
                            </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                    </div>

                    {/* Label Ribbon */}
                    <div className="absolute bottom-6 left-0 right-0 px-4 transform transition-transform duration-500 group-hover:-translate-y-2">
                        <div className="bg-background/95 backdrop-blur-md py-4 px-6 shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-[0.3em] font-light mb-1">Explore</span>
                            <span className="text-sm md:text-lg font-serif italic text-foreground tracking-wider">{category.name}</span>
                        </div>
                    </div>

                    {/* Decorative Border */}
                    <div className="absolute inset-4 border border-white/0 group-hover:border-white/10 transition-all duration-700 pointer-events-none" />
                </motion.div>
            ))}
        </div>
    )
}
