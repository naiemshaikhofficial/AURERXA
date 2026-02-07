'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    SlidersHorizontal,
    X,
    ChevronDown,
    Check,
    Sparkles,
    Filter,
    ArrowUpDown,
} from 'lucide-react'

// Types
interface Category {
    name: string
    slug: string
    image_url?: string
}

interface FilterState {
    category: string
    gender: string
    priceRange: { min: number; max: number; label: string }
    sortBy: string
}

interface PremiumFiltersProps {
    categories: Category[]
    initialFilters: FilterState
    onFiltersChange: (filters: FilterState) => void
    productCount: number
}

// Price Ranges
const priceRanges = [
    { label: 'All Prices', min: 0, max: 0 },
    { label: 'Under ₹10,000', min: 0, max: 10000 },
    { label: '₹10,000 - ₹50,000', min: 10000, max: 50000 },
    { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
    { label: 'Above ₹1,00,000', min: 100000, max: 0 },
]

// Sort Options
const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Popular', value: 'popular' },
]

// Gender Options
const genderOptions = [
    { label: 'All', value: 'all' },
    { label: 'Men', value: 'Men' },
    { label: 'Women', value: 'Women' },
    { label: 'Unisex', value: 'Unisex' },
]

// Premium Dropdown Component
function LuxuryDropdown({
    label,
    value,
    options,
    onChange,
    icon: Icon,
}: {
    label: string
    value: string
    options: { label: string; value: string }[]
    onChange: (val: string) => void
    icon?: React.ElementType
}) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOption = options.find(opt => opt.value === value) || options[0]

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between gap-4 px-5 py-3 bg-neutral-900/80 backdrop-blur-xl border transition-all duration-500 min-w-[180px] group rounded-lg ${isOpen
                    ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                    : 'border-white/10 hover:border-amber-500/50'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 text-amber-500/70" />}
                    <div className="flex flex-col items-start">
                        <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] leading-none mb-1">{label}</span>
                        <span className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                            {selectedOption.label}
                        </span>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="w-4 h-4 text-white/30" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[calc(100%+8px)] left-0 z-50 w-full min-w-[220px] bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg overflow-hidden"
                    >
                        {options.map((opt, i) => (
                            <motion.button
                                key={opt.value}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => {
                                    onChange(opt.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-all hover:bg-amber-500/10 ${value === opt.value
                                    ? 'text-amber-500 bg-amber-500/5'
                                    : 'text-white/70 hover:text-white'
                                    }`}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500 }}
                                    >
                                        <Check className="w-4 h-4" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Category Pills Component
function CategoryPills({
    categories,
    selected,
    onChange,
}: {
    categories: Category[]
    selected: string
    onChange: (slug: string) => void
}) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat, i) => (
                <motion.button
                    key={cat.slug}
                    onClick={() => onChange(cat.slug)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-6 py-3 text-xs uppercase tracking-[0.15em] font-bold transition-all duration-500 border rounded-full whitespace-nowrap ${selected === cat.slug
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                        : 'bg-neutral-900/50 backdrop-blur-xl text-white/60 border-white/10 hover:border-amber-500/50 hover:text-white'
                        }`}
                >
                    {selected === cat.slug && (
                        <motion.div
                            layoutId="category-glow"
                            className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl -z-10"
                        />
                    )}
                    {cat.name}
                </motion.button>
            ))}
        </div>
    )
}

// Active Filters Display
function ActiveFilters({
    filters,
    onClear,
    onClearAll,
}: {
    filters: FilterState
    onClear: (key: keyof FilterState) => void
    onClearAll: () => void
}) {
    const activeFilters: { key: keyof FilterState; label: string; value: string }[] = []

    if (filters.category !== 'all') {
        activeFilters.push({ key: 'category', label: 'Material', value: filters.category })
    }
    if (filters.gender !== 'all') {
        activeFilters.push({ key: 'gender', label: 'Gender', value: filters.gender })
    }
    if (filters.priceRange.min !== 0 || filters.priceRange.max !== 0) {
        activeFilters.push({ key: 'priceRange', label: 'Price', value: filters.priceRange.label })
    }

    if (activeFilters.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 pt-4"
        >
            <span className="text-[10px] text-white/40 uppercase tracking-widest mr-2">Active:</span>
            {activeFilters.map((filter) => (
                <motion.button
                    key={filter.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onClear(filter.key)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs rounded-full hover:bg-amber-500/20 transition-all group"
                >
                    <span className="capitalize">{filter.value}</span>
                    <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </motion.button>
            ))}
            <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onClearAll}
                className="text-[10px] text-white/40 hover:text-amber-500 uppercase tracking-widest underline underline-offset-4 transition-colors ml-2"
            >
                Clear All
            </motion.button>
        </motion.div>
    )
}

// Mobile Filter Sheet
function MobileFilterSheet({
    isOpen,
    onClose,
    categories,
    filters,
    onFiltersChange,
}: {
    isOpen: boolean
    onClose: () => void
    categories: Category[]
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
}) {
    const [localFilters, setLocalFilters] = useState(filters)

    useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    const handleApply = () => {
        onFiltersChange(localFilters)
        onClose()
    }

    const handleReset = () => {
        const resetFilters: FilterState = {
            category: 'all',
            gender: 'all',
            priceRange: priceRanges[0],
            sortBy: 'newest',
        }
        setLocalFilters(resetFilters)
        onFiltersChange(resetFilters)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 z-[101] bg-neutral-900 border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto"
                    >
                        {/* Handle */}
                        <div className="sticky top-0 bg-neutral-900 pt-4 pb-2 px-6 border-b border-white/5">
                            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-serif text-white">Filters</h3>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Material */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-bold">Material</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.slug}
                                            onClick={() => setLocalFilters({ ...localFilters, category: cat.slug })}
                                            className={`p-4 border rounded-lg text-sm transition-all ${localFilters.category === cat.slug
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                                : 'bg-neutral-800/50 border-white/10 text-white/70 hover:border-white/30'
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-bold">Gender</h4>
                                <div className="flex flex-wrap gap-2">
                                    {genderOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setLocalFilters({ ...localFilters, gender: opt.value })}
                                            className={`px-6 py-3 border rounded-full text-sm transition-all ${localFilters.gender === opt.value
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                                : 'bg-neutral-800/50 border-white/10 text-white/70 hover:border-white/30'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-bold">Price Range</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {priceRanges.map((range) => (
                                        <button
                                            key={range.label}
                                            onClick={() => setLocalFilters({ ...localFilters, priceRange: range })}
                                            className={`p-4 border rounded-lg text-sm text-left transition-all ${localFilters.priceRange.label === range.label
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                                : 'bg-neutral-800/50 border-white/10 text-white/70 hover:border-white/30'
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-bold">Sort By</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {sortOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setLocalFilters({ ...localFilters, sortBy: opt.value })}
                                            className={`p-4 border rounded-lg text-sm transition-all ${localFilters.sortBy === opt.value
                                                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                                                : 'bg-neutral-800/50 border-white/10 text-white/70 hover:border-white/30'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 p-6 bg-neutral-900 border-t border-white/5 flex gap-4">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-4 border border-white/20 text-white text-sm uppercase tracking-widest font-bold rounded-lg hover:border-white/40 transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 py-4 bg-amber-500 text-black text-sm uppercase tracking-widest font-bold rounded-lg hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Main Premium Filters Component
export function PremiumFilters({
    categories,
    initialFilters,
    onFiltersChange,
    productCount,
}: PremiumFiltersProps) {
    const { scrollY } = useScroll()
    const [filters, setFilters] = useState<FilterState>(initialFilters)
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

    // Parallax effect for the header
    const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8])
    const headerBlur = useTransform(scrollY, [0, 100], [0, 20])

    const handleFilterChange = useCallback((newFilters: FilterState) => {
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }, [onFiltersChange])

    const handleClearFilter = useCallback((key: keyof FilterState) => {
        const newFilters = { ...filters }
        if (key === 'category') newFilters.category = 'all'
        if (key === 'gender') newFilters.gender = 'all'
        if (key === 'priceRange') newFilters.priceRange = priceRanges[0]
        handleFilterChange(newFilters)
    }, [filters, handleFilterChange])

    const handleClearAll = useCallback(() => {
        handleFilterChange({
            category: 'all',
            gender: 'all',
            priceRange: priceRanges[0],
            sortBy: filters.sortBy,
        })
    }, [filters.sortBy, handleFilterChange])

    return (
        <>
            {/* Desktop Filters */}
            <motion.div
                style={{ opacity: headerOpacity }}
                className="sticky top-24 z-40 hidden lg:block"
            >
                <motion.div
                    style={{ backdropFilter: `blur(${headerBlur}px)` }}
                    className="bg-neutral-900/80 border border-white/5 rounded-2xl p-6 shadow-2xl"
                >
                    {/* Category Pills */}
                    <CategoryPills
                        categories={categories}
                        selected={filters.category}
                        onChange={(slug) => handleFilterChange({ ...filters, category: slug })}
                    />

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-white/5">
                        <div className="flex flex-wrap items-center gap-3">
                            <LuxuryDropdown
                                label="Gender"
                                value={filters.gender}
                                options={genderOptions}
                                onChange={(val) => handleFilterChange({ ...filters, gender: val })}
                                icon={Sparkles}
                            />
                            <LuxuryDropdown
                                label="Price"
                                value={filters.priceRange.label}
                                options={priceRanges.map(r => ({ label: r.label, value: r.label }))}
                                onChange={(val) => {
                                    const range = priceRanges.find(r => r.label === val) || priceRanges[0]
                                    handleFilterChange({ ...filters, priceRange: range })
                                }}
                                icon={Filter}
                            />
                            <LuxuryDropdown
                                label="Sort"
                                value={filters.sortBy}
                                options={sortOptions}
                                onChange={(val) => handleFilterChange({ ...filters, sortBy: val })}
                                icon={ArrowUpDown}
                            />
                        </div>

                        {/* Product Count */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white/40 text-sm"
                        >
                            <span className="text-amber-500 font-bold">{productCount}</span> masterpieces
                        </motion.div>
                    </div>

                    {/* Active Filters */}
                    <ActiveFilters
                        filters={filters}
                        onClear={handleClearFilter}
                        onClearAll={handleClearAll}
                    />
                </motion.div>
            </motion.div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden sticky top-24 z-40 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4 p-4 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                    <CategoryPills
                        categories={categories.slice(0, 4)}
                        selected={filters.category}
                        onChange={(slug) => handleFilterChange({ ...filters, category: slug })}
                    />

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMobileFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full text-xs uppercase tracking-widest font-bold"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                    </motion.button>
                </motion.div>
            </div>

            {/* Mobile Filter Sheet */}
            <MobileFilterSheet
                isOpen={mobileFilterOpen}
                onClose={() => setMobileFilterOpen(false)}
                categories={categories}
                filters={filters}
                onFiltersChange={handleFilterChange}
            />
        </>
    )
}

export { priceRanges, sortOptions, genderOptions }
export type { FilterState, Category }
