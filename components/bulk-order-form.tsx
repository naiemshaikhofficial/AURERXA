'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { submitBulkOrder, searchProducts } from '@/app/actions'
import { toast } from 'sonner'
import {
    Package, Search, Plus, Minus, Trash2, Send,
    Building2, User, Mail, Phone, FileText, MessageSquare,
    CheckCircle2, ShoppingBag, X
} from 'lucide-react'
import { useConsent } from '@/context/consent-context'
import { useEffect } from 'react'

interface Product {
    id: string
    name: string
    price: number
    image_url: string
    images?: any
    slug: string
}

interface BulkItem {
    productId: string
    productName: string
    productImage: string
    retailPrice: number
    quantity: number
}

export function BulkOrderForm({
    products,
    initialProfile
}: {
    products: Product[],
    initialProfile?: { name?: string; email?: string; phone?: string } | null
}) {
    const [businessName, setBusinessName] = useState('')
    const [contactName, setContactName] = useState(initialProfile?.name || '')
    const [email, setEmail] = useState(initialProfile?.email || '')
    const [phone, setPhone] = useState(initialProfile?.phone || '')
    const [gstNumber, setGstNumber] = useState('')
    const [message, setMessage] = useState('')
    const [items, setItems] = useState<BulkItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [showProductPicker, setShowProductPicker] = useState(false)

    const { consentStatus, userDetails, updateUserDetails } = useConsent()

    // Pre-fill from consent context
    useEffect(() => {
        if (consentStatus === 'granted') {
            if (userDetails.name && !contactName) setContactName(userDetails.name)
            if (userDetails.email && !email) setEmail(userDetails.email)
            if (userDetails.phone && !phone) setPhone(userDetails.phone)
        }
    }, [consentStatus, userDetails, contactName, email, phone])

    // Search products
    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        try {
            const results = await searchProducts(query)
            setSearchResults(results || [])
        } catch {
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Displayed products (search results or all products)
    const displayProducts = searchQuery.length >= 2 ? searchResults : products.slice(0, 20)

    // Add product to bulk list
    const addProduct = (product: Product) => {
        if (items.find(i => i.productId === product.id)) {
            toast.error('Product already added')
            return
        }
        setItems(prev => [...prev, {
            productId: product.id,
            productName: product.name,
            productImage: product.image_url,
            retailPrice: product.price,
            quantity: 10, // minimum
        }])
        toast.success(`${product.name} added`)
    }

    // Update quantity
    const updateQuantity = (productId: string, delta: number) => {
        setItems(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(10, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    // Set quantity directly
    const setQuantity = (productId: string, qty: number) => {
        setItems(prev => prev.map(item => {
            if (item.productId === productId) {
                return { ...item, quantity: Math.max(10, qty) }
            }
            return item
        }))
    }

    // Remove product
    const removeProduct = (productId: string) => {
        setItems(prev => prev.filter(i => i.productId !== productId))
    }

    // Totals
    const totalRetailValue = useMemo(() =>
        items.reduce((sum, i) => sum + (i.retailPrice * i.quantity), 0), [items])
    const totalItems = useMemo(() =>
        items.reduce((sum, i) => sum + i.quantity, 0), [items])

    // Submit
    const handleSubmit = async () => {
        if (isSubmitting) return

        // Client-side validation
        if (!businessName.trim()) return toast.error('Please enter your business name')
        if (!contactName.trim()) return toast.error('Please enter your name')
        if (!email.trim() || !email.includes('@')) return toast.error('Please enter a valid email')
        if (!phone.trim() || phone.replace(/\D/g, '').length < 10) return toast.error('Please enter a valid phone number')
        if (items.length === 0) return toast.error('Please add at least one product')

        setIsSubmitting(true)
        try {
            const result = await submitBulkOrder({
                businessName,
                contactName,
                email,
                phone,
                gstNumber: gstNumber || undefined,
                message: message || undefined,
                items,
            })

            if (result.success) {
                setSubmitted(true)
                toast.success('Bulk order inquiry submitted!')

                // Persist details if consented
                if (consentStatus === 'granted') {
                    updateUserDetails({
                        name: contactName,
                        email: email,
                        phone: phone
                    })
                }
            } else {
                toast.error(result.error || 'Failed to submit')
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Success State
    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 px-6">
                <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-serif font-light text-foreground mb-4">
                    Inquiry <span className="text-gradient-gold italic">Received</span>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                    Thank you for your interest in bulk ordering from AURERXA. Our wholesale team will review your
                    requirements and contact you within 24 hours with exclusive pricing.
                </p>
                <div className="p-6 bg-card/50 border border-border rounded-sm mb-8">
                    <p className="text-[10px] font-premium-sans tracking-wider text-primary mb-2">ORDER SUMMARY</p>
                    <p className="text-sm text-muted-foreground">{items.length} products • {totalItems} total pieces</p>
                    <p className="text-lg font-serif text-foreground mt-2">
                        Estimated Retail Value: ₹{totalRetailValue.toLocaleString('en-IN')}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSubmitted(false)
                        setItems([])
                        setBusinessName('')
                        setContactName('')
                        setEmail('')
                        setPhone('')
                        setGstNumber('')
                        setMessage('')
                    }}
                    className="text-xs font-premium-sans tracking-wider text-primary hover:text-primary/80 transition-colors"
                >
                    Submit Another Inquiry →
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* LEFT: Business Details & Product Selection */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Business Details */}
                    <div className="bg-card/30 border border-border p-6 md:p-8 rounded-sm">
                        <h2 className="text-[10px] font-premium-sans text-primary/80 tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            BUSINESS DETAILS
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5">
                                    <Building2 className="w-3 h-3" /> BUSINESS NAME *
                                </label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={e => setBusinessName(e.target.value)}
                                    placeholder="Your Company Name"
                                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5">
                                    <User className="w-3 h-3" /> CONTACT PERSON *
                                </label>
                                <input
                                    type="text"
                                    value={contactName}
                                    onChange={e => {
                                        setContactName(e.target.value)
                                        if (consentStatus === 'granted') updateUserDetails({ name: e.target.value })
                                    }}
                                    placeholder="Full Name"
                                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5">
                                    <Mail className="w-3 h-3" /> EMAIL *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => {
                                        setEmail(e.target.value)
                                        if (consentStatus === 'granted') updateUserDetails({ email: e.target.value })
                                    }}
                                    placeholder="business@example.com"
                                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5">
                                    <Phone className="w-3 h-3" /> PHONE *
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => {
                                        setPhone(e.target.value)
                                        if (consentStatus === 'granted') updateUserDetails({ phone: e.target.value })
                                    }}
                                    placeholder="+91 9XXXXXXXXX"
                                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" /> GST NUMBER
                                </label>
                                <input
                                    type="text"
                                    value={gstNumber}
                                    onChange={e => setGstNumber(e.target.value)}
                                    placeholder="Optional"
                                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground font-premium-sans tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="w-3 h-3" /> NOTES
                                </label>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Special requirements..."
                                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors rounded-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="bg-card/30 border border-border p-6 md:p-8 rounded-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-premium-sans text-primary/80 tracking-[0.2em] flex items-center gap-2">
                                <Package className="w-4 h-4" />
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
                            <div className="mb-6 border border-border rounded-sm overflow-hidden">
                                {/* Search */}
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

                                {/* Product Grid */}
                                <div className="max-h-72 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {isSearching ? (
                                        <div className="col-span-full text-center py-8">
                                            <div className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        </div>
                                    ) : displayProducts.length === 0 ? (
                                        <div className="col-span-full text-center py-8">
                                            <p className="text-xs text-muted-foreground">No products found</p>
                                        </div>
                                    ) : displayProducts.map(product => {
                                        const isAdded = items.some(i => i.productId === product.id)
                                        return (
                                            <button
                                                key={product.id}
                                                onClick={() => !isAdded && addProduct(product)}
                                                disabled={isAdded}
                                                className={`flex items-center gap-3 p-3 rounded-sm border transition-all text-left ${isAdded
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
                                                    <p className="text-xs text-foreground truncate">{product.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">₹{product.price.toLocaleString('en-IN')}</p>
                                                </div>
                                                {isAdded ? (
                                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                                ) : (
                                                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Selected Items */}
                        {items.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-border rounded-sm">
                                <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-xs text-muted-foreground">No products selected</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">Click &quot;Add Products&quot; to select items for your bulk order</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map(item => (
                                    <div
                                        key={item.productId}
                                        className="flex items-center gap-4 p-4 bg-background/50 border border-border rounded-sm group hover:border-primary/20 transition-all"
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
                                            <p className="text-sm text-foreground truncate">{item.productName}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Retail: ₹{item.retailPrice.toLocaleString('en-IN')} each
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.productId, -10)}
                                                className="w-7 h-7 flex items-center justify-center border border-border rounded-sm hover:border-primary/30 transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => setQuantity(item.productId, parseInt(e.target.value) || 10)}
                                                min={10}
                                                className="w-16 text-center bg-background border border-border py-1 text-sm text-foreground focus:border-primary/50 focus:outline-none rounded-sm"
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.productId, 10)}
                                                className="w-7 h-7 flex items-center justify-center border border-border rounded-sm hover:border-primary/30 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <p className="text-sm font-medium text-foreground">
                                                ₹{(item.retailPrice * item.quantity).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeProduct(item.productId)}
                                            className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Order Summary (Sticky) */}
                <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-28 space-y-6">
                        <div className="bg-card/30 border border-border p-6 md:p-8 rounded-sm">
                            <h2 className="text-[10px] font-premium-sans text-primary/80 tracking-[0.2em] mb-6">
                                ORDER SUMMARY
                            </h2>

                            {items.length > 0 ? (
                                <>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Products</span>
                                            <span className="text-foreground">{items.length} designs</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total Pieces</span>
                                            <span className="text-foreground">{totalItems.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="h-px bg-border" />
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Retail Value</span>
                                            <span className="text-foreground font-medium">₹{totalRetailValue.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {/* Wholesale Discount Banner */}
                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm mb-6">
                                        <p className="text-[10px] font-premium-sans tracking-wider text-primary mb-1">
                                            WHOLESALE PRICING
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Our team will provide exclusive wholesale rates based on your order volume.
                                            Expect <span className="text-primary font-medium">15-25% off</span> retail pricing.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-4">
                                    Add products to see your order summary
                                </p>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || items.length === 0}
                                className={`w-full py-4 text-[10px] font-premium-sans tracking-[0.2em] uppercase transition-all duration-500 flex items-center justify-center gap-2 rounded-sm ${items.length > 0
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        Submit Bulk Inquiry
                                    </>
                                )}
                            </button>

                            <p className="text-[9px] text-muted-foreground/60 text-center mt-4 leading-relaxed">
                                Our wholesale team will review your inquiry and respond within 24 hours with customized pricing.
                            </p>
                        </div>

                        {/* Trust Signals */}
                        <div className="bg-card/30 border border-border p-6 rounded-sm space-y-4">
                            <h3 className="text-[10px] font-premium-sans text-primary/80 tracking-[0.2em]">WHY BULK ORDER</h3>
                            {[
                                { title: 'Exclusive Wholesale Rates', desc: 'Volume-based pricing with significant savings' },
                                { title: 'Quality Guaranteed', desc: 'Same premium quality as retail, BIS hallmarked' },
                                { title: 'Flexible MOQ', desc: 'Minimum 10 pieces per design' },
                                { title: 'Custom Engraving', desc: 'Available for corporate gifting orders' },
                            ].map(trust => (
                                <div key={trust.title} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-foreground">{trust.title}</p>
                                        <p className="text-[10px] text-muted-foreground">{trust.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
