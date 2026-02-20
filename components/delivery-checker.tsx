'use client'

import { useState, useEffect } from 'react'
import { checkDeliveryAvailability } from '@/app/actions'
import { MapPin, Truck, Clock, Zap, Loader2, AlertCircle, X, Sparkles, Package, Shield, RefreshCw } from 'lucide-react'

interface DeliveryInfo {
    success: boolean
    available?: boolean
    pincode?: string
    zone?: 'metro' | 'tier2' | 'other'
    deliveryDays?: { min: number; max: number }
    estimatedDelivery?: {
        from: string
        to: string
        fromDate: string
        toDate: string
    }
    expressAvailable?: boolean
    codAvailable?: boolean
    message?: string
    error?: string
    location?: string
    city?: string
    state?: string
    shippingRate?: number
}

interface DeliveryCheckerProps {
    product?: any
    cartItems?: any[]
    subtotal?: number
    compact?: boolean
}

export function DeliveryChecker({ product, cartItems, subtotal, compact = false }: DeliveryCheckerProps) {
    const [pincode, setPincode] = useState('')
    const [loading, setLoading] = useState(false)
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)
    const [error, setError] = useState<string | null>(null)

    const displaySubtotal = subtotal || product?.price || 0

    // Load saved pincode from localStorage
    useEffect(() => {
        const savedPincode = localStorage.getItem('aurerxa_pincode')
        if (savedPincode && savedPincode.length === 6) {
            setPincode(savedPincode)
            handleCheck(savedPincode)
        }
    }, [])

    const handleCheck = async (pincodeToCheck?: string) => {
        const code = pincodeToCheck || pincode
        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit pincode')
            return
        }

        setLoading(true)
        setError(null)
        setDeliveryInfo(null)

        const result = await checkDeliveryAvailability(code)

        if (result.success) {
            // Calculate shipping rate for this specific product or cart
            const { calculateShippingRate } = await import('@/app/actions')
            const itemsToRate = cartItems || (product ? [{ products: product, quantity: 1 }] : [])
            const shippingRes = await calculateShippingRate(code, itemsToRate, false)

            setDeliveryInfo({
                ...result,
                shippingRate: shippingRes.success ? shippingRes.rate : undefined
            })
            localStorage.setItem('aurerxa_pincode', code)
        } else {
            setError(result.error || 'Unable to check delivery')
        }

        setLoading(false)
    }

    const handleClear = () => {
        setPincode('')
        setDeliveryInfo(null)
        setError(null)
        localStorage.removeItem('aurerxa_pincode')
    }

    const freeShipping = displaySubtotal >= 50000

    return (
        <div className={`relative overflow-hidden ${compact ? '' : ''}`}>
            {/* Premium Background */}
            <div className={`relative ${compact ? '' : 'bg-neutral-950 border border-white/5 p-6'}`}>

                {/* Header with Icon */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center border border-white/10">
                            <MapPin className="w-4 h-4 text-amber-500/80" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                            Delivery Availability
                        </h4>
                        <p className="text-[9px] text-white/30 mt-1 uppercase tracking-wider">Check delivery to your location</p>
                    </div>
                </div>

                {/* Premium Input Row */}
                <div className="flex gap-0 border border-white/10">
                    <div className="relative flex-1 group bg-neutral-900/50">
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                setPincode(value)
                                if (value.length === 6 && deliveryInfo) {
                                    setDeliveryInfo(null)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && pincode.length === 6) {
                                    handleCheck()
                                }
                            }}
                            placeholder="Enter 6-digit pincode"
                            className="relative w-full bg-transparent text-white h-12 px-4 text-xs font-light tracking-wider placeholder:text-white/20 focus:outline-none"
                            maxLength={6}
                        />
                        {pincode && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => handleCheck()}
                        disabled={loading || pincode.length !== 6}
                        className="group relative px-6 h-12 bg-white text-neutral-950 text-[10px] font-bold uppercase tracking-[0.2em]
                                   hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed 
                                   transition-all duration-300 border-l border-white/10"
                    >
                        <span className="relative">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                        </span>
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-500/80 text-xs animate-in fade-in slide-in-from-top-2 duration-300
                                    bg-red-500/5 border border-red-500/10 px-4 py-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="uppercase tracking-wider font-bold text-[9px]">{error}</span>
                    </div>
                )}

                {/* Delivery Info */}
                {deliveryInfo && deliveryInfo.success && (
                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Not Serviceable State */}
                        {deliveryInfo.available === false ? (
                            <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 px-4 py-3">
                                <AlertCircle className="w-4 h-4 text-red-500/60 flex-shrink-0" />
                                <span className="text-xs text-red-500/60 font-medium uppercase tracking-wider">
                                    {deliveryInfo.error || 'Currently Not Serviceable'}
                                </span>
                            </div>
                        ) : (
                            <>
                                {/* Estimated Delivery - Premium Card */}
                                <div className="relative bg-neutral-900/30 border border-white/5 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0">
                                            <Clock className="w-4 h-4 text-amber-200/60" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white/80 text-xs font-serif italic tracking-wide mb-1">
                                                Estimated Delivery to <span className="text-white font-bold">{deliveryInfo.location || `${deliveryInfo.city}${deliveryInfo.state ? `, ${deliveryInfo.state}` : ''}`.toUpperCase()}</span>
                                            </p>
                                            <p className="text-white text-sm">
                                                <span className="font-bold">{deliveryInfo.estimatedDelivery?.from}</span> - <span className="font-bold">{deliveryInfo.estimatedDelivery?.to}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Cost - Premium Info */}
                                <div className="mt-4 flex items-center justify-between border border-white/5 bg-white/[0.02] p-4">
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-4 h-4 text-white/40" />
                                        <span className="text-[10px] text-white/60 uppercase tracking-[0.2em]">Shipping Charge</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary tracking-widest">
                                        {freeShipping ? 'FREE' : deliveryInfo.shippingRate ? `₹${deliveryInfo.shippingRate}` : '₹90'}
                                    </span>
                                </div>

                                {/* Feature Badges - Text Only Grid */}
                                <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 mt-4">
                                    {/* Express Badge */}
                                    {deliveryInfo.expressAvailable && (
                                        <div className="bg-neutral-950 p-4 text-center">
                                            <Zap className="w-4 h-4 text-amber-500/60 mx-auto mb-2" />
                                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] block">
                                                Express
                                            </span>
                                        </div>
                                    )}

                                    {/* Free Shipping Badge */}
                                    {freeShipping && (
                                        <div className="bg-neutral-950 p-4 text-center">
                                            <Truck className="w-4 h-4 text-amber-500/60 mx-auto mb-2" />
                                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] block">
                                                Free Ship
                                            </span>
                                        </div>
                                    )}

                                    {/* Insured Shipping */}
                                    <div className="bg-neutral-950 p-4 text-center">
                                        <Package className="w-4 h-4 text-amber-500/60 mx-auto mb-2" />
                                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] block">
                                            Insured
                                        </span>
                                    </div>

                                    {/* Authenticity Certified */}
                                    <div className="bg-neutral-950 p-4 text-center">
                                        <Shield className="w-4 h-4 text-amber-500/60 mx-auto mb-2" />
                                        <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] block">
                                            Certified
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Compact version for checkout page - Premium Design
export function DeliveryEstimate({ pincode }: { pincode?: string }) {
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)

    useEffect(() => {
        if (pincode && pincode.length === 6) {
            checkDeliveryAvailability(pincode).then(setDeliveryInfo)
        }
    }, [pincode])

    if (!deliveryInfo || !deliveryInfo.success || !deliveryInfo.available) return null

    return (
        <div className="flex flex-col gap-2 py-4 border-t border-white/10">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Truck className="w-4 h-4 text-amber-200/60" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-0.5">
                        Estimated Delivery to <span className="text-white font-bold">{deliveryInfo.location || `${deliveryInfo.city}${deliveryInfo.state ? `, ${deliveryInfo.state}` : ''}`.toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-white uppercase tracking-wider font-bold">
                        {deliveryInfo.estimatedDelivery?.from} - {deliveryInfo.estimatedDelivery?.to}
                    </p>
                </div>
            </div>
            {deliveryInfo.message && (
                <p className="text-[9px] text-primary/60 text-right uppercase tracking-tighter italic">
                    {deliveryInfo.message}
                </p>
            )}
        </div>
    )
}
