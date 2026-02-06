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
}

interface DeliveryCheckerProps {
    productPrice?: number
    compact?: boolean
}

export function DeliveryChecker({ productPrice = 0, compact = false }: DeliveryCheckerProps) {
    const [pincode, setPincode] = useState('')
    const [loading, setLoading] = useState(false)
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)
    const [error, setError] = useState<string | null>(null)

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
            setDeliveryInfo(result)
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

    const freeShipping = productPrice >= 50000

    return (
        <div className={`relative overflow-hidden ${compact ? '' : 'rounded-sm'}`}>
            {/* Premium Background with Gradient */}
            <div className={`relative ${compact ? '' : 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-700/50 p-6'}`}>

                {/* Subtle Gold Accent Line */}
                {!compact && (
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                )}

                {/* Header with Icon */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30">
                            <MapPin className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                            Delivery Availability
                        </h4>
                        <p className="text-[10px] text-white/40 mt-0.5">Check delivery to your location</p>
                    </div>
                </div>

                {/* Premium Input Row */}
                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        {/* Input Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 rounded-sm opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
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
                            className="relative w-full bg-neutral-950/80 border border-neutral-600/50 text-white h-12 px-4 text-sm font-light
                                       placeholder:text-white/25 focus:outline-none focus:border-amber-500/60 focus:bg-neutral-950
                                       transition-all duration-300 rounded-sm tracking-wide"
                            maxLength={6}
                        />
                        {pincode && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-amber-400 transition-colors duration-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => handleCheck()}
                        disabled={loading || pincode.length !== 6}
                        className="group relative px-6 h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-xs font-bold uppercase tracking-wider
                                   hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed 
                                   transition-all duration-300 rounded-sm overflow-hidden"
                    >
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="relative">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                        </span>
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300
                                    bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-light">{error}</span>
                    </div>
                )}

                {/* Delivery Info */}
                {deliveryInfo && deliveryInfo.success && (
                    <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Not Serviceable State */}
                        {deliveryInfo.available === false ? (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <span className="text-sm text-red-300 font-light">
                                    {deliveryInfo.error || 'Sorry, we do not deliver to this pincode currently.'}
                                </span>
                            </div>
                        ) : (
                            <>
                                {/* Estimated Delivery - Premium Card */}
                                <div className="relative bg-gradient-to-br from-neutral-800/80 to-neutral-800/40 border border-neutral-700/50 rounded-sm p-4 overflow-hidden">
                                    {/* Card Accent */}
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600" />

                                    <div className="flex items-start gap-4 pl-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 flex-shrink-0">
                                            <Clock className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-light tracking-wide">
                                                Get it by <span className="text-amber-500 font-bold">{deliveryInfo.estimatedDelivery?.from}</span> - <span className="text-amber-500 font-bold">{deliveryInfo.estimatedDelivery?.to}</span>
                                            </p>
                                            <p className="text-white/40 text-[10px] mt-1 uppercase tracking-widest font-medium">
                                                Estimated {deliveryInfo.deliveryDays?.min}-{deliveryInfo.deliveryDays?.max} business days
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Badges - Premium Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Express Badge */}
                                    {deliveryInfo.expressAvailable && (
                                        <div className="group flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-none px-4 py-3 hover:border-amber-500/30 transition-all duration-500">
                                            <Zap className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] text-white/70 font-bold uppercase tracking-[0.2em]">
                                                Express
                                            </span>
                                        </div>
                                    )}

                                    {/* Free Shipping Badge */}
                                    {freeShipping && (
                                        <div className="group flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-none px-4 py-3 hover:border-amber-500/30 transition-all duration-500">
                                            <Truck className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] text-white/70 font-bold uppercase tracking-[0.2em]">
                                                Free Ship
                                            </span>
                                        </div>
                                    )}

                                    {/* Insured Shipping */}
                                    <div className="group flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-none px-4 py-3 hover:border-amber-500/30 transition-all duration-500">
                                        <Package className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] text-white/70 font-bold uppercase tracking-[0.2em]">
                                            Insured
                                        </span>
                                    </div>

                                    {/* Authenticity Certified */}
                                    <div className="group flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-none px-4 py-3 hover:border-amber-500/30 transition-all duration-500">
                                        <Shield className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] text-white/70 font-bold uppercase tracking-[0.2em]">
                                            Certified
                                        </span>
                                    </div>

                                    {/* Easy Returns */}
                                    <div className="group flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-none px-4 py-3 hover:border-amber-500/30 transition-all duration-500 col-span-2">
                                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-180 transition-transform duration-700" />
                                        <span className="text-[9px] text-white/70 font-bold uppercase tracking-[0.2em]">
                                            7-Day Easy Returns
                                        </span>
                                    </div>
                                </div>

                                {/* Zone Info - Premium Footer */}
                                {deliveryInfo.zone && (
                                    <div className="flex items-center justify-between pt-3 border-t border-neutral-700/50">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-amber-500/60" />
                                            <span className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-medium">
                                                {deliveryInfo.message}
                                            </span>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider text-amber-500/60 font-medium bg-amber-500/10 px-2 py-0.5 rounded-sm">
                                            {deliveryInfo.zone === 'metro' && 'Metro City'}
                                            {deliveryInfo.zone === 'tier2' && 'Tier-2 City'}
                                            {deliveryInfo.zone === 'other' && 'Remote Area'}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Hint when empty - Premium */}
                {!deliveryInfo && !error && !loading && (
                    <div className="mt-4 flex items-center gap-2 text-white/25">
                        <Sparkles className="w-3 h-3 text-amber-500/40" />
                        <p className="text-[11px] font-light tracking-wide">
                            Enter your pincode to see delivery options
                        </p>
                    </div>
                )}

                {/* Bottom Accent */}
                {!compact && (
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
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
        <div className="flex items-center gap-3 py-3 border-t border-neutral-700/50">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex-1">
                <p className="text-sm text-white/70 font-light">
                    Delivery by <span className="text-amber-400 font-medium">{deliveryInfo.estimatedDelivery?.from} - {deliveryInfo.estimatedDelivery?.to}</span>
                </p>
            </div>
        </div>
    )
}
