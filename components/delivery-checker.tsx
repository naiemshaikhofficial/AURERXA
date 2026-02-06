'use client'

import { useState, useEffect } from 'react'
import { checkDeliveryAvailability } from '@/app/actions'
import { MapPin, Truck, Clock, CreditCard, Zap, Check, Loader2, AlertCircle, X } from 'lucide-react'

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
            // Auto-check on load
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
        <div className={`${compact ? '' : 'border border-neutral-800 bg-neutral-900/50 p-5'}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Check Delivery Availability
                </span>
            </div>

            {/* Input Row */}
            <div className="flex gap-2">
                <div className="relative flex-1">
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
                        className="w-full bg-neutral-950 border border-neutral-700 text-white h-11 px-4 text-sm 
                                   placeholder:text-white/30 focus:outline-none focus:border-amber-500/50
                                   transition-colors"
                        maxLength={6}
                    />
                    {pincode && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => handleCheck()}
                    disabled={loading || pincode.length !== 6}
                    className="px-5 h-11 bg-amber-500 text-neutral-950 text-xs font-bold uppercase tracking-wider
                               hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Delivery Info */}
            {deliveryInfo && deliveryInfo.success && (
                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Check if delivery is available or not */}
                    {deliveryInfo.available === false ? (
                        // Not Serviceable
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {deliveryInfo.error || 'Sorry, we do not deliver to this pincode currently.'}
                            </span>
                        </div>
                    ) : (
                        <>
                            {/* Delivery Available Badge */}
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Delivery available to {deliveryInfo.pincode}
                                </span>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="flex items-start gap-3 bg-neutral-950/50 border border-neutral-800 p-3">
                                <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-white text-sm font-medium">
                                        Get it by {deliveryInfo.estimatedDelivery?.from} - {deliveryInfo.estimatedDelivery?.to}
                                    </p>
                                    <p className="text-white/50 text-xs mt-0.5">
                                        {deliveryInfo.deliveryDays?.min}-{deliveryInfo.deliveryDays?.max} business days
                                    </p>
                                </div>
                            </div>

                            {/* Feature Badges */}
                            <div className="flex flex-wrap gap-2">
                                {/* Express Badge */}
                                {deliveryInfo.expressAvailable && (
                                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-xs text-amber-400 font-medium uppercase tracking-wider">
                                            Express Available
                                        </span>
                                    </div>
                                )}

                                {/* COD Badge */}
                                {deliveryInfo.codAvailable && (
                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                                        <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                                            COD Available
                                        </span>
                                    </div>
                                )}

                                {/* COD Not Available Warning */}
                                {deliveryInfo.codAvailable === false && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-xs text-orange-400 font-medium uppercase tracking-wider">
                                            Prepaid Only
                                        </span>
                                    </div>
                                )}

                                {/* Free Shipping Badge */}
                                {freeShipping && (
                                    <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5">
                                        <Truck className="w-3.5 h-3.5 text-violet-500" />
                                        <span className="text-xs text-violet-400 font-medium uppercase tracking-wider">
                                            Free Shipping
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Zone Info */}
                            {deliveryInfo.zone && (
                                <p className="text-[10px] uppercase tracking-widest text-white/40">
                                    {deliveryInfo.message}
                                    {deliveryInfo.zone === 'metro' && ' • Metro City'}
                                    {deliveryInfo.zone === 'tier2' && ' • Tier-2 City'}
                                    {deliveryInfo.zone === 'other' && ' • Remote Area'}
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}


            {/* Hint when empty */}
            {!deliveryInfo && !error && !loading && (
                <p className="mt-3 text-[11px] text-white/30">
                    Enter your pincode to see delivery options and estimated delivery date
                </p>
            )}
        </div>
    )
}

// Compact version for checkout page - just shows delivery estimate
export function DeliveryEstimate({ pincode }: { pincode?: string }) {
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)

    useEffect(() => {
        if (pincode && pincode.length === 6) {
            checkDeliveryAvailability(pincode).then(setDeliveryInfo)
        }
    }, [pincode])

    if (!deliveryInfo || !deliveryInfo.success) return null

    return (
        <div className="flex items-center gap-2 text-sm text-white/70 py-2 border-t border-neutral-800">
            <Truck className="w-4 h-4 text-amber-500" />
            <span>
                Estimated delivery: {deliveryInfo.estimatedDelivery?.from} - {deliveryInfo.estimatedDelivery?.to}
            </span>
        </div>
    )
}
