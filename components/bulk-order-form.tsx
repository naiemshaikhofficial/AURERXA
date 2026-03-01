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

import { BulkBusinessDetails } from './bulk-order/bulk-business-details'
import { BulkProductPicker } from './bulk-order/bulk-product-picker'
import { BulkOrderSummary } from './bulk-order/bulk-order-summary'

export function BulkOrderForm({
    products,
    initialProfile
}: {
    products: Product[],
    initialProfile?: { name?: string; email?: string; phone?: string } | null
}) {
    const [items, setItems] = useState<BulkItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Product[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [showProductPicker, setShowProductPicker] = useState(false)

    const { consentStatus, userDetails, updateUserDetails } = useConsent()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset
    } = useForm<BulkOrderValues>({
        resolver: zodResolver(bulkOrderSchema),
        defaultValues: {
            businessName: '',
            contactName: initialProfile?.name || userDetails.name || '',
            email: initialProfile?.email || userDetails.email || '',
            phone: initialProfile?.phone || userDetails.phone || '',
            gstNumber: '',
            message: '',
        }
    })

    // Pre-fill from consent or profile
    useEffect(() => {
        if (initialProfile) {
            if (initialProfile.name) setValue('contactName', initialProfile.name)
            if (initialProfile.email) setValue('email', initialProfile.email)
            if (initialProfile.phone) setValue('phone', initialProfile.phone)
        }
    }, [initialProfile, setValue])

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
    const onBulkSubmit = async (data: BulkOrderValues) => {
        if (isSubmitting) return

        if (items.length === 0) {
            toast.error('Please add at least one product')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await submitBulkOrder({
                ...data,
                items,
            })

            if (result.success) {
                setSubmitted(true)
                toast.success('Bulk order inquiry submitted!')

                // Persist details if consented
                if (consentStatus === 'granted') {
                    updateUserDetails({
                        name: data.contactName,
                        email: data.email,
                        phone: data.phone
                    })
                }
            } else {
                toast.error(result.error || 'Failed to submit')
                const { logError } = await import('@/lib/logger')
                await logError(new Error(result.error), { metadata: { form: 'BulkOrderForm' } })
            }
        } catch (err: any) {
            toast.error('Something went wrong. Please try again.')
            const { logError } = await import('@/lib/logger')
            await logError(err, { metadata: { form: 'BulkOrderForm' } })
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
                    <p className="text-[10px] font-premium-sans tracking-wider text-primary mb-2 uppercase">ORDER SUMMARY</p>
                    <p className="text-sm text-muted-foreground">{items.length} products • {totalItems} total pieces</p>
                    <p className="text-lg font-serif text-foreground mt-2">
                        Estimated Retail Value: ₹{totalRetailValue.toLocaleString('en-IN')}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSubmitted(false)
                        setItems([])
                        reset()
                    }}
                    className="text-xs font-premium-sans tracking-wider text-primary hover:text-primary/80 transition-colors uppercase"
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
                <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                    <BulkBusinessDetails register={register} errors={errors} />
                    <BulkProductPicker
                        items={items}
                        showProductPicker={showProductPicker}
                        setShowProductPicker={setShowProductPicker}
                        searchQuery={searchQuery}
                        handleSearch={handleSearch}
                        isSearching={isSearching}
                        displayProducts={displayProducts}
                        addProduct={addProduct}
                        updateQuantity={updateQuantity}
                        setQuantity={setQuantity}
                        removeProduct={removeProduct}
                    />
                </div>

                {/* RIGHT: Order Summary (Sticky) */}
                <div className="lg:col-span-2 animate-in fade-in slide-in-from-right-4 duration-700">
                    <BulkOrderSummary
                        itemsCount={items.length}
                        totalItems={totalItems}
                        totalRetailValue={totalRetailValue}
                        isSubmitting={isSubmitting}
                        handleSubmit={handleSubmit(onBulkSubmit)}
                    />
                </div>
            </div>
        </div>
    )
}
