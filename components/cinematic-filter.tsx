'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Check, ChevronDown, SlidersHorizontal, Diamond, Gem, LayoutGrid, List } from 'lucide-react'
import { useUserPreferences } from '@/context/user-preferences-context'
import { cn, sanitizeImagePath } from '@/lib/utils'
import Image from 'next/image'

export type FilterState = {
    category: string
    sub_category: string
    tag?: string
    occasion: string
    type: string
    gender: string
    material_type: string
    priceRange: { label: string, min: number, max: number | null }
    sortBy: string
    search?: string
}

export const PRODUCT_TYPES = [
    { label: 'All Jewelry', value: 'all', iconId: 'aCPWW0PJ102K' },
    { label: 'Rings', value: 'Ring', iconId: '5z5Rvj2F4jZB' },
    { label: 'Necklaces', value: 'Necklace', iconId: '19731' },
    { label: 'Earrings', value: 'Earring', iconId: 'ksXSIChGyK69' },
    { label: 'Bracelets', value: 'Bracelet', iconId: 'McP6FpfdzPWM' },
    { label: 'Bangles', value: 'Bangle', iconId: '8YdZOEMppFxv' },
    { label: 'Pendants', value: 'Pendant', iconId: '110325' },
    { label: 'Chains', value: 'Chain', iconId: 'FWr93WQ0Gm9Q' },
    { label: 'Mangalsutras', value: 'Mangalsutra', iconId: '/947771-200.png' },
    { label: 'Kids', value: 'Kids', iconId: 'J2uuDL01xwUL' },
]

export const GENDERS = [

    { label: 'All Genders', value: 'all' },
    { label: 'Women', value: 'Women' },
    { label: 'Men', value: 'Men' },
    { label: 'Kids', value: 'Kids' },
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

export const MATERIAL_TYPES = [
    { label: 'All Materials', value: 'all', dot: 'bg-white/30' },
    { label: '22K Real Gold', value: 'real_gold', dot: 'bg-amber-400' },
    { label: 'Gold Plated', value: 'gold_plated', dot: 'bg-orange-400' },
    { label: 'Fashion / Bentex', value: 'bentex', dot: 'bg-slate-400' },
    { label: 'Silver', value: 'silver', dot: 'bg-blue-300' },
    { label: 'Diamond', value: 'diamond', dot: 'bg-cyan-400' },
]

interface CinematicFilterProps {
    categories: any[]
    tags: string[]
    initialFilters: FilterState
    onFiltersChange: (filters: FilterState) => void
    productCount: number
}

export function CinematicFilter({
    categories,
    tags,
    initialFilters,
    onFiltersChange,
    productCount
}: CinematicFilterProps) {
    const router = useRouter()
    const { viewMode, setViewMode } = useUserPreferences()
    const [isOpen, setIsOpen] = useState(false)
    const [filters, setFilters] = useState<FilterState>(initialFilters)
    const [activeTab, setActiveTab] = useState<'type' | 'gender' | 'price' | 'sort' | 'material' | 'tags'>('type')

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

    // Handle Sub-category Change (Horizontal Scroll)
    const handleHorizontalChange = (slug: string) => {
        router.push(`/collections/${slug}`)
    }

    // Handle Drill-down Filters
    const handleFilterUpdate = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const clearFilters = () => {
        const newFilters = {
            ...filters,
            type: 'all',
            gender: 'all',
            material_type: 'all',
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
        filters.priceRange.min > 0,
        filters.material_type && filters.material_type !== 'all',
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
                    <div
                        className="w-full md:w-auto overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x flex items-center gap-1 p-1 order-2 md:order-1"
                        data-lenis-prevent
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => handleHorizontalChange(cat.slug)}
                                className={cn(
                                    "px-6 py-3 rounded-full text-[9px] uppercase tracking-[0.2em] font-premium-sans whitespace-nowrap transition-all duration-300",
                                    filters.sub_category === cat.slug
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

                        <div className="flex items-center gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex bg-muted p-1 rounded-full border border-border mr-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "p-2 rounded-full transition-all duration-300",
                                        viewMode === 'grid' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="Grid View"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "p-2 rounded-full transition-all duration-300",
                                        viewMode === 'list' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    title="List View"
                                >
                                    <List className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsOpen(true)}
                                className="group flex items-center gap-2 px-6 py-3 bg-muted border border-border rounded-full hover:bg-foreground hover:text-background hover:border-foreground transition-all active:scale-95"
                            >
                                <div className="relative w-4 h-4 transition-all duration-300 group-hover:invert group-hover:rotate-180 opacity-60 group-hover:opacity-100">
                                    <Image
                                        src="https://img.icons8.com/?size=100&id=82746&format=png&color=FFFFFF"
                                        alt="Filter"
                                        fill
                                        className="object-contain dark:invert-0 invert"
                                    />
                                </div>
                                <span className="text-[9px] font-premium-sans text-foreground group-hover:text-background tracking-[0.2em] uppercase">Refine</span>
                                {activeFilterCount > 0 && (
                                    <span className="ml-1 w-4 h-4 flex items-center justify-center bg-primary text-primary-foreground text-[8px] font-bold rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
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
                            <div className="flex items-center justify-between px-8 pt-10 pb-6 md:p-8 border-b border-border">
                                <h2 className="text-lg md:text-2xl font-serif text-foreground font-medium italic">Refine Collection</h2>
                                <div className="flex items-center gap-4 md:gap-6">
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="group flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em] border-b border-border pb-px"
                                        >
                                            <div className="relative w-3 h-3 group-hover:rotate-180 transition-transform duration-500">
                                                <Image
                                                    src="https://img.icons8.com/?size=100&id=13054&format=png&color=BF9B65"
                                                    alt="Reset"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 transition-colors group tactile-press"
                                    >
                                        <X className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Sidebar Tabs */}
                                <div className="w-1/3 md:w-1/4 bg-card border-r border-border flex flex-col">
                                    {[
                                        { id: 'type', label: 'Type' },
                                        { id: 'tags', label: 'Style' },
                                        { id: 'material', label: 'Material' },
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
                                            {activeTab === 'tags' && (
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        onClick={() => handleFilterUpdate('tag', undefined)}
                                                        className={cn(
                                                            "px-6 py-4 rounded-none border text-[10px] uppercase tracking-[0.2em] transition-all",
                                                            !filters.tag
                                                                ? "bg-foreground text-background border-foreground font-bold"
                                                                : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        All Styles
                                                    </button>
                                                    {tags.map((tag) => (
                                                        <button
                                                            key={tag}
                                                            onClick={() => handleFilterUpdate('tag', tag)}
                                                            className={cn(
                                                                "px-6 py-4 rounded-none border text-[10px] uppercase tracking-[0.2em] transition-all",
                                                                filters.tag === tag
                                                                    ? "bg-foreground text-background border-foreground font-bold shadow-lg"
                                                                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                                                            )}
                                                        >
                                                            {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'type' && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {PRODUCT_TYPES.map((type) => (
                                                        <button
                                                            key={type.value}
                                                            onClick={() => {
                                                                if (type.value === 'Kids') {
                                                                    handleFilterUpdate('gender', 'Kids')
                                                                } else {
                                                                    handleFilterUpdate('type', type.value)
                                                                }
                                                            }}
                                                            className={cn(
                                                                "h-32 rounded-none border flex flex-col items-center justify-center gap-4 transition-all duration-500 group relative overflow-hidden",
                                                                (type.value === 'Kids' ? filters.gender === 'Kids' : filters.type === type.value)
                                                                    ? "bg-foreground text-background border-foreground"
                                                                    : "bg-transparent border-border hover:border-foreground/30 hover:bg-muted"
                                                            )}
                                                        >
                                                            <div className="relative w-8 h-8 transition-all duration-500 group-hover:scale-110">
                                                                <Image
                                                                    src={type.iconId.startsWith('/')
                                                                        ? type.iconId
                                                                        : `https://img.icons8.com/?size=100&id=${type.iconId}&format=png&color=${(type.value === 'Kids' ? filters.gender === 'Kids' : filters.type === type.value) ? '000000' : 'BF9B65'}`
                                                                    }
                                                                    alt={type.label}
                                                                    fill
                                                                    className={cn(
                                                                        "object-contain transition-all duration-500",
                                                                        !(type.value === 'Kids' ? filters.gender === 'Kids' : filters.type === type.value) && "opacity-90"
                                                                    )}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] uppercase tracking-[0.2em]">{type.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {activeTab === 'material' && (
                                                <div className="space-y-4">
                                                    {MATERIAL_TYPES.map((mat) => (
                                                        <button
                                                            key={mat.value}
                                                            onClick={() => handleFilterUpdate('material_type', mat.value)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-6 rounded-none border transition-all",
                                                                filters.material_type === mat.value
                                                                    ? "bg-foreground text-background border-foreground"
                                                                    : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-2 h-2 rounded-full ${mat.dot} ${filters.material_type === mat.value ? 'opacity-0' : ''}`} />
                                                                <span className="text-xs uppercase tracking-[0.2em]">{mat.label}</span>
                                                            </div>
                                                            {filters.material_type === mat.value && (
                                                                <Check className="w-4 h-4" />
                                                            )}
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
                            <div className="p-6 md:p-8 pb-14 md:pb-8 border-t border-border bg-background">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-5 bg-foreground text-background font-premium-sans font-bold uppercase tracking-[0.3em] rounded-none hover:bg-foreground/90 transition-colors shadow-2xl tactile-press"
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
