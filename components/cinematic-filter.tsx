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
    { label: 'Earrings', value: 'Earring', iconId: '82723' },
    { label: 'Bracelets', value: 'Bracelet', iconId: 'McP6FpfdzPWM' },
    { label: 'Bangles', value: 'Bangle', iconId: '82724' },
    { label: 'Pendants', value: 'Pendant', iconId: '82727' },
    { label: 'Chains', value: 'Chain', iconId: 'FWr93WQ0Gm9Q' },
    { label: 'Mangalsutras', value: 'Mangalsutra', iconId: 'OuxvP3GkXGOn' },
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
                    className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-2"
                >
                    {/* Material/Collection Links (Horizontal Scroll) */}
                    <div className="w-full md:w-auto overflow-x-auto no-scrollbar flex items-center gap-1 p-1 order-2 md:order-1">
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] font-premium-sans whitespace-nowrap transition-all duration-300",
                                    filters.category === cat.slug
                                        ? "bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Filter Trigger Button */}
                    <div className="w-full md:w-auto flex items-center justify-between gap-4 p-1 order-1 md:order-2 border-b md:border-b-0 border-white/5 md:pl-6 mb-2 md:mb-0">
                        <span className="text-white/40 text-xs font-serif italic">
                            {productCount} Artifacts
                        </span>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl hover:border-amber-500/50 transition-all active:scale-95"
                        >
                            <img
                                src="https://img.icons8.com/?size=100&id=82746&format=png&color=F59E0B"
                                alt="Filter"
                                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180"
                            />
                            <span className="text-xs font-premium-sans text-white tracking-widest">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="ml-1 w-5 h-5 flex items-center justify-center bg-amber-500 text-black text-[9px] font-bold rounded-full">
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 h-[85vh] md:h-[60vh] bg-neutral-950 border-t border-white/10 z-50 rounded-t-[2rem] overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
                            // Prevent scroll event from bubbling to body even if body scroll isn't locked properly
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-xl font-serif text-white italic">Refine Collection</h2>
                                <div className="flex items-center gap-4">
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <img
                                            src="https://img.icons8.com/?size=100&id=82732&format=png&color=FFFFFF"
                                            alt="Close"
                                            className="w-5 h-5"
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Sidebar Tabs */}
                                <div className="w-1/3 md:w-1/4 bg-neutral-900/50 border-r border-white/5 flex flex-col">
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
                                                "w-full text-left px-6 py-5 text-xs uppercase tracking-widest transition-all",
                                                activeTab === tab.id
                                                    ? "bg-amber-500/10 text-amber-500 border-l-2 border-amber-500"
                                                    : "text-white/40 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                                            )}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content - Added pb-safe to prevent cutoff */}
                                <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 bg-black/20 no-scrollbar overscroll-contain">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full"
                                        >
                                            {activeTab === 'type' && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {PRODUCT_TYPES.map((type) => (
                                                        <button
                                                            key={type.value}
                                                            onClick={() => handleFilterUpdate('type', type.value)}
                                                            className={cn(
                                                                "h-24 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 group",
                                                                filters.type === type.value
                                                                    ? "bg-amber-500 text-black border-amber-500"
                                                                    : "bg-white/5 border-white/5 hover:border-amber-500/50 hover:bg-white/10"
                                                            )}
                                                        >
                                                            <img
                                                                src={`https://img.icons8.com/?size=100&id=${(type as any).iconId}&format=png&color=${filters.type === type.value ? '000000' : 'F59E0B'}`}
                                                                alt={type.label}
                                                                className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                            <span className="text-[10px] uppercase tracking-widest">{type.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'gender' && (
                                                <div className="space-y-2">
                                                    {GENDERS.map((gender) => (
                                                        <button
                                                            key={gender.value}
                                                            onClick={() => handleFilterUpdate('gender', gender.value)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
                                                                filters.gender === gender.value
                                                                    ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                                                    : "bg-white/5 border-white/5 text-white/50 hover:border-white/20 hover:text-white"
                                                            )}
                                                        >
                                                            <span className="text-sm uppercase tracking-wider">{gender.label}</span>
                                                            {filters.gender === gender.value && (
                                                                <img
                                                                    src="https://img.icons8.com/?size=100&id=82736&format=png&color=F59E0B"
                                                                    alt="Selected"
                                                                    className="w-4 h-4"
                                                                />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'price' && (
                                                <div className="space-y-2">
                                                    {PRICE_RANGES.map((range) => (
                                                        <button
                                                            key={range.label}
                                                            onClick={() => handleFilterUpdate('priceRange', range)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
                                                                filters.priceRange.min === range.min && filters.priceRange.max === range.max
                                                                    ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                                                    : "bg-white/5 border-white/5 text-white/50 hover:border-white/20 hover:text-white"
                                                            )}
                                                        >
                                                            <span className="text-sm uppercase tracking-wider">{range.label}</span>
                                                            {filters.priceRange.min === range.min && filters.priceRange.max === range.max && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'sort' && (
                                                <div className="space-y-2">
                                                    {SORT_OPTIONS.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => handleFilterUpdate('sortBy', option.value)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
                                                                filters.sortBy === option.value
                                                                    ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                                                    : "bg-white/5 border-white/5 text-white/50 hover:border-white/20 hover:text-white"
                                                            )}
                                                        >
                                                            <span className="text-sm uppercase tracking-wider">{option.label}</span>
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
                            <div className="p-6 border-t border-white/10 bg-neutral-900">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 bg-amber-500 text-black font-premium-sans font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    Show {productCount} Results
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
