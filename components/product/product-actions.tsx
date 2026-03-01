'use client'

import React from 'react'
import { Ruler, Loader2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductActionsProps {
    product: any
    dynamicData: any
    selectedSize: string
    setSelectedSize: (size: string) => void
    setCustomSizeInput: (val: string) => void
    handleAddToCart: () => void
    handleBuyNow: () => void
    handleAddToWishlist: () => void
    addingToCart: boolean
    inWishlist: boolean
    setIsSizeGuideOpen: (open: boolean) => void
}

export function ProductActions({
    product,
    dynamicData,
    selectedSize,
    setSelectedSize,
    setCustomSizeInput,
    handleAddToCart,
    handleBuyNow,
    handleAddToWishlist,
    addingToCart,
    inWishlist,
    setIsSizeGuideOpen
}: ProductActionsProps) {
    return (
        <div className="space-y-8">
            {/* Price section - Mobile/Desktop sync */}
            <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-serif text-white tracking-tight">₹{dynamicData.price.toLocaleString()}</span>
                    {product.original_price && (
                        <span className="text-sm text-white/30 line-through">₹{product.original_price.toLocaleString()}</span>
                    )}
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/60 font-medium">Incl. of all taxes</p>
            </div>

            {/* Variants / Sizes */}
            {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Select Size</span>
                        <button
                            onClick={() => setIsSizeGuideOpen(true)}
                            className="text-[9px] uppercase tracking-widest text-amber-500/60 hover:text-amber-500 transition-colors flex items-center gap-2"
                        >
                            <Ruler className="w-3 h-3" />
                            Indian Size Guide
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size: string) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`min-w-[3.5rem] px-4 h-12 flex items-center justify-center text-[10px] font-bold border transition-all duration-300 uppercase tracking-widest ${selectedSize === size
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedSize('Custom')}
                            className={`px-6 h-12 flex items-center justify-center text-[10px] font-bold border transition-all duration-300 uppercase tracking-widest ${selectedSize === 'Custom'
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                                }`}
                        >
                            Custom
                        </button>
                    </div>
                    {selectedSize === 'Custom' && (
                        <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                            <input
                                type="text"
                                placeholder="Enter size (e.g., 18mm)"
                                className="w-full h-12 bg-white/5 border border-white/10 text-white px-4 text-xs tracking-wider focus:outline-none focus:border-white/30 placeholder:text-white/20 transition-all mb-2"
                                onChange={(e) => setCustomSizeInput(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* CTA's */}
            <div className="flex flex-col gap-3">
                {product.stock > 0 ? (
                    <>
                        <Button
                            onClick={handleBuyNow}
                            disabled={addingToCart}
                            className="w-full bg-white text-black h-14 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-neutral-200 transition-all rounded-none"
                        >
                            Buy It Now
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="flex-[3] bg-transparent border border-white/20 text-white h-12 uppercase tracking-[0.2em] text-[9px] font-bold hover:bg-white hover:text-black transition-all rounded-none"
                            >
                                {addingToCart ? <Loader2 className="animate-spin w-3 h-3" /> : 'Add to Bag'}
                            </Button>
                            <button
                                onClick={handleAddToWishlist}
                                className={`flex-1 h-12 flex items-center justify-center border transition-all duration-300 ${inWishlist ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-transparent border-white/20 text-white hover:bg-white/5'}`}
                            >
                                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </>
                ) : (
                    <Button disabled className="w-full bg-neutral-900 text-white/40 h-14 uppercase tracking-[0.3em] text-[10px] font-bold border border-white/5 rounded-none">
                        Out of Stock
                    </Button>
                )}
            </div>
        </div>
    )
}
