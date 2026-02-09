'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Check, ChevronDown, SlidersHorizontal, Diamond, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FilterState = {
    category: string
    type: string
    gender: string
    priceRange: { label: string, min: number, max: number | null }
    sortBy: string
}

export const PRODUCT_TYPES = [
    { label: 'All Jewelry', value: 'all', iconId: '82711' },
    { label: 'Rings', value: 'Ring', iconId: '5z5Rvj2F4jZB' },
    { label: 'Necklaces', value: 'Necklace', iconId: '19731' },
    { label: 'Earrings', value: 'Earring', iconId: 'ksXSIChGyK69' },
    { label: 'Bracelets', value: 'Bracelet', iconId: 'McP6FpfdzPWM' },
    { label: 'Bangles', value: 'Bangle', iconId: '8YdZOEMppFxv' },
    { label: 'Pendants', value: 'Pendant', iconId: '110325' },
    { label: 'Chains', value: 'Chain', iconId: 'FWr93WQ0Gm9Q' },
    { label: 'Mangalsutras', value: 'Mangalsutra', iconId: '/947771-200.png' },
]

export const GENDERS = [
    { label: 'All Genders', value: 'all' },
    { label: 'Women', value: 'Women' },
    { label: 'Men', value: 'Men' },
    { label: 'Unisex', value: 'Unisex' },
]

export const PRICE_RANGES = [
    { label: 'All Prices', min: 0, max: null },
    { label: 'Under ₹10k', min: 0, max: 10000 },
    { label: '₹10k - ₹30k', min: 10000, max: 30000 },
    { label: '₹30k - ₹50k', min: 30000, max: 50000 },
    { label: '₹50k - ₹1L', min: 50000, max: 100000 },
    { label: 'Above ₹1L', min: 100000, max: null },
]

export const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
]

interface CinematicFilterProps {
    categories: any[]
    initialFilters: FilterState
    onFiltersChange: (filters: FilterState) => void
    productCount: number
}

export function CinematicFilter({
    categories,
    initialFilters,
    onFiltersChange,
    productCount
}: CinematicFilterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [filters, setFilters] = useState<FilterState>(initialFilters)
    const [activeTab, setActiveTab] = useState<'type' | 'gender' | 'price' | 'sort'>('type')

    // Lock Body Scroll when Filter is Open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            // Aggressive lock for html element as well
            document.documentElement.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
        // Cleanup on unmount or when component disappears
        return () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
    }, [isOpen])

    // Handle Category Change (Material) - Horizontal Scroll
    const handleCategoryChange = (slug: string) => {
        const newFilters = { ...filters, category: slug }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    // Handle Drill-down Filters
    const handleFilterUpdate = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    // Clear All Non-Category Filters
    const clearFilters = () => {
        const newFilters = {
            ...filters,
            type: 'all',
            gender: 'all',
            priceRange: PRICE_RANGES[0],
            sortBy: 'newest'
        }
        setFilters(newFilters)
        onFiltersChange(newFilters)
        setIsOpen(false)
    }

    const activeFilterCount = [
        filters.type !== 'all',
        filters.gender !== 'all',
        filters.priceRange.min > 0
    ].filter(Boolean).length

    return (
        <div className="sticky top-20 z-40 w-full mb-12">
            {/* Main Bar */}
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-background/80 backdrop-blur-md border border-border rounded-none md:rounded-full shadow-none overflow-hidden flex flex-col md:flex-row items-center justify-between p-2"
                >
                    {/* Material/Collection Links (Horizontal Scroll) */}
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1 p-1 order-2 md:order-1">
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={cn(
                                    "px-6 py-3 rounded-full text-[9px] uppercase tracking-[0.2em] font-premium-sans whitespace-nowrap transition-all duration-300",
                                    filters.category === cat.slug
                                        ? "bg-foreground text-background font-bold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Filter Trigger Button */}
                    <div className="w-full md:w-auto flex items-center justify-between gap-4 p-1 order-1 md:order-2 border-b md:border-b-0 border-border md:pl-6 mb-2 md:mb-0">
                        <span className="text-muted-foreground text-[10px] font-premium-sans tracking-widest uppercase">
                            {productCount} Artifacts
                        </span>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="group flex items-center gap-2 px-6 py-3 bg-muted border border-border rounded-full hover:bg-foreground hover:text-background hover:border-foreground transition-all active:scale-95"
                        >
                            <img
                                src="https://img.icons8.com/?size=100&id=82746&format=png&color=FFFFFF"
                                alt="Filter"
                                className="w-4 h-4 transition-all duration-300 group-hover:invert group-hover:rotate-180 opacity-60 group-hover:opacity-100 dark:invert-0 invert"
                            />
                            <span className="text-[9px] font-premium-sans text-foreground group-hover:text-background tracking-[0.2em] uppercase">Refine</span>
                            {activeFilterCount > 0 && (
                                <span className="ml-1 w-4 h-4 flex items-center justify-center bg-primary text-primary-foreground text-[8px] font-bold rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Cinematic Filter Drawer/Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 h-[85vh] md:h-[70vh] bg-background border-t border-border z-[100] rounded-t-[2rem] overflow-hidden flex flex-col shadow-2xl"
                            // Prevent scroll event from bubbling to body even if body scroll isn't locked properly
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-8 border-b border-border">
                                <h2 className="text-2xl font-serif text-foreground font-medium italic">Refine Collection</h2>
                                <div className="flex items-center gap-6">
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em] border-b border-border pb-px"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-3 bg-muted rounded-full hover:bg-foreground hover:text-background transition-all group"
                                    >
                                        <X className="w-5 h-5 text-foreground group-hover:text-background transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Sidebar Tabs */}
                                <div className="w-1/3 md:w-1/4 bg-card border-r border-border flex flex-col">
                                    {[
                                        { id: 'type', label: 'Type' },
                                        { id: 'gender', label: 'Gender' },
                                        { id: 'price', label: 'Price Range' },
                                        { id: 'sort', label: 'Sort Order' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={cn(
                                                "w-full text-left px-8 py-6 text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden",
                                                activeTab === tab.id
                                                    ? "text-foreground bg-muted"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            {activeTab === tab.id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
                                            )}
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content - Added pb-safe to prevent cutoff */}
                                <div className="flex-1 overflow-y-auto p-8 md:p-12 pb-40 bg-background no-scrollbar overscroll-contain touch-pan-y">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                            className="h-full"
                                        >
                                            {activeTab === 'type' && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {PRODUCT_TYPES.map((type) => (
                                                        <button
                                                            key={type.value}
                                                            onClick={() => handleFilterUpdate('type', type.value)}
                                                            className={cn(
                                                                "h-32 rounded-none border flex flex-col items-center justify-center gap-4 transition-all duration-500 group relative overflow-hidden",
                                                                filters.type === type.value
                                                                    ? "bg-foreground text-background border-foreground"
                                                                    : "bg-transparent border-border hover:border-foreground/30 hover:bg-muted"
                                                            )}
                                                        >
                                                            <img
                                                                src={type.iconId.startsWith('/')
                                                                    ? type.iconId
                                                                    : `https://img.icons8.com/?size=100&id=${(type as any).iconId}&format=png&color=${filters.type === type.value ? '000000' : 'FFFFFF'}`
                                                                }
                                                                alt={type.label}
                                                                className={cn(
                                                                    "w-8 h-8 transition-all duration-500 group-hover:scale-110",
                                                                    filters.type === type.value ? 'invert-0' : 'dark:invert-0 invert',
                                                                    type.iconId.startsWith('/') && (filters.type !== type.value && "opacity-60")

                                                                )}
                                                            />
                                                            <span className="text-[10px] uppercase tracking-[0.2em]">{type.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'gender' && (
                                                <div className="space-y-4">
                                                    {GENDERS.map((gender) => (
                                                        <button
                                                            key={gender.value}
                                                            onClick={() => handleFilterUpdate('gender', gender.value)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-6 rounded-none border transition-all",
                                                                filters.gender === gender.value
                                                                    ? "bg-foreground text-background border-foreground"
                                                                    : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            <span className="text-xs uppercase tracking-[0.2em]">{gender.label}</span>
                                                            {filters.gender === gender.value && (
                                                                <Check className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'price' && (
                                                <div className="space-y-4">
                                                    {PRICE_RANGES.map((range) => (
                                                        <button
                                                            key={range.label}
                                                            onClick={() => handleFilterUpdate('priceRange', range)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-6 rounded-none border transition-all",
                                                                filters.priceRange.min === range.min && filters.priceRange.max === range.max
                                                                    ? "bg-foreground text-background border-foreground"
                                                                    : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            <span className="text-xs uppercase tracking-[0.2em]">{range.label}</span>
                                                            {filters.priceRange.min === range.min && filters.priceRange.max === range.max && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'sort' && (
                                                <div className="space-y-4">
                                                    {SORT_OPTIONS.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => handleFilterUpdate('sortBy', option.value)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-6 rounded-none border transition-all",
                                                                filters.sortBy === option.value
                                                                    ? "bg-foreground text-background border-foreground"
                                                                    : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            <span className="text-xs uppercase tracking-[0.2em]">{option.label}</span>
                                                            {filters.sortBy === option.value && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-8 pb-12 md:pb-8 border-t border-border bg-background">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-5 bg-foreground text-background font-premium-sans font-bold uppercase tracking-[0.3em] rounded-none hover:bg-foreground/90 transition-colors"
                                >
                                    View {productCount} Artifacts
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
