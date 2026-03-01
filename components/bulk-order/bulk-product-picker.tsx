'use client'

import React from 'react'
import Image from 'next/image'
import { Search, Plus, X, CheckCircle2, ShoppingBag, Minus, Plus as PlusIcon, Trash2 } from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    image_url: string
    slug: string
}

interface BulkItem {
    productId: string
    productName: string
    productImage: string
    retailPrice: number
    quantity: number
}

interface BulkProductPickerProps {
    items: BulkItem[]
    showProductPicker: boolean
    setShowProductPicker: (show: boolean) => void
    searchQuery: string
    handleSearch: (query: string) => void
    isSearching: boolean
    displayProducts: Product[]
    addProduct: (product: Product) => void
    updateQuantity: (productId: string, delta: number) => void
    setQuantity: (productId: string, qty: number) => void
    removeProduct: (productId: string) => void
}

export function BulkProductPicker({
    items,
    showProductPicker,
    setShowProductPicker,
    searchQuery,
    handleSearch,
    isSearching,
    displayProducts,
    addProduct,
    updateQuantity,
    setQuantity,
    removeProduct
}: BulkProductPickerProps) {
    return (
        <div className="bg-card/30 border border-border p-6 md:p-8 rounded-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-premium-sans text-primary/80 tracking-[0.2em] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    SELECT PRODUCTS
                </h2>
                <button
                    onClick={() => setShowProductPicker(!showProductPicker)}
                    className="text-[10px] font-premium-sans tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                    {showProductPicker ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {showProductPicker ? 'CLOSE' : 'ADD PRODUCTS'}
                </button>
            </div>

            {/* Product Picker */}
            {showProductPicker && (
                <div className="mb-6 border border-border rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 bg-background/50 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                            />
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 custom-scrollbar">
                        {isSearching ? (
                            <div className="col-span-full text-center py-8">
                                <div className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : displayProducts.length === 0 ? (
                            <div className="col-span-full text-center py-8">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">No products found</p>
                            </div>
                        ) : displayProducts.map(product => {
                            const isAdded = items.some(i => i.productId === product.id)
                            return (
                                <button
                                    key={product.id}
                                    onClick={() => !isAdded && addProduct(product)}
                                    disabled={isAdded}
                                    className={`flex items-center gap-3 p-3 rounded-sm border transition-all text-left group ${isAdded
                                        ? 'border-primary/30 bg-primary/5 opacity-60 cursor-not-allowed'
                                        : 'border-border hover:border-primary/30 hover:bg-card/50 cursor-pointer'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-card rounded-sm overflow-hidden flex-shrink-0 relative">
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-foreground truncate font-medium">{product.name}</p>
                                        <p className="text-[10px] text-muted-foreground tracking-wider">₹{product.price.toLocaleString('en-IN')}</p>
                                    </div>
                                    {isAdded ? (
                                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                    ) : (
                                        <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Selected Items */}
            {items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-sm bg-muted/5">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">No products selected</p>
                    <p className="text-[9px] text-muted-foreground/40 mt-1 uppercase tracking-wider">Click &quot;Add Products&quot; to begin your collection</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        <div
                            key={item.productId}
                            className="flex items-center gap-4 p-4 bg-background/50 border border-border rounded-sm group hover:border-primary/20 transition-all animate-in fade-in duration-300"
                        >
                            <div className="w-14 h-14 bg-card rounded-sm overflow-hidden flex-shrink-0 relative">
                                <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-serif text-foreground truncate">{item.productName}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Retail: ₹{item.retailPrice.toLocaleString('en-IN')} each
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateQuantity(item.productId, -10)}
                                    className="w-8 h-8 flex items-center justify-center border border-border rounded-sm hover:border-primary/30 transition-colors disabled:opacity-20"
                                    disabled={item.quantity <= 10}
                                >
                                    <Minus className="w-3 mx-auto" />
                                </button>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => setQuantity(item.productId, parseInt(e.target.value) || 10)}
                                    min={10}
                                    className="w-14 text-center bg-background border border-border py-1.5 text-sm text-foreground focus:border-primary/50 focus:outline-none rounded-sm font-medium tabular-nums"
                                />
                                <button
                                    onClick={() => updateQuantity(item.productId, 10)}
                                    className="w-8 h-8 flex items-center justify-center border border-border rounded-sm hover:border-primary/30 transition-colors"
                                >
                                    <PlusIcon className="w-3 mx-auto" />
                                </button>
                            </div>
                            <div className="text-right min-w-[100px] hidden sm:block">
                                <p className="text-sm font-medium text-foreground tabular-nums">
                                    ₹{(item.retailPrice * item.quantity).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <button
                                onClick={() => removeProduct(item.productId)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-2"
                                aria-label="Remove item"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
