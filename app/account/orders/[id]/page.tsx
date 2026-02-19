'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import supabaseLoader from '@/lib/supabase-loader'
import { getOrderById, getOrderTracking, verifyPayment, getOrderPaymentSession, initiatePayment, requestReturn, getReturnByOrderId } from '@/app/actions'
import { Loader2, Package, ChevronRight, CheckCircle, Truck, MapPin, CreditCard, Gift, Clock, AlertCircle, RefreshCw, FileText, Printer, ShieldAlert, Gavel, Scale, PlayCircle, LifeBuoy, RotateCcw, ExternalLink, ShoppingBag, PackageCheck, HelpCircle, XCircle } from 'lucide-react'
import { InvoiceTemplate } from '@/components/invoice-template'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { OrderCancellationDialog } from '@/components/order-cancellation-dialog'
import { ShipmentTimeline } from '@/components/shipment-timeline'
import { DigitalCertificate } from '@/components/digital-certificate'

export default function OrderDetailPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const isSuccess = searchParams.get('success') === 'true'
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState(false)
    const [trackingData, setTrackingData] = useState<any>(null)
    const [isPrinting, setIsPrinting] = useState(false)
    const [isCancellationOpen, setIsCancellationOpen] = useState(false)
    const [retryingPayment, setRetryingPayment] = useState(false)
    const [isExpired, setIsExpired] = useState(false)
    const [timeLeft, setTimeLeft] = useState<string>('')
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const [isReturnOpen, setIsReturnOpen] = useState(false)
    const [returnSubmitting, setReturnSubmitting] = useState(false)
    const [returnForm, setReturnForm] = useState({
        reason: '',
        issueType: '' as 'defective' | 'wrong_product' | 'damaged_in_transit' | '',
        description: ''
    })
    const [activeCertificate, setActiveCertificate] = useState<any>(null)
    const [isCertPrinting, setIsCertPrinting] = useState(false)
    const [returnRequest, setReturnRequest] = useState<any>(null)

    useEffect(() => {
        async function load() {
            if (params.id) {
                const data = await getOrderById(params.id as string)
                if (data) {
                    setOrder(data)

                    // Auto-verify if payment success param is present
                    const paymentStatus = searchParams.get('payment')
                    if (paymentStatus === 'success' && data.status === 'pending' && data.payment_method === 'online') {
                        setVerifying(true)
                        const verifyResult = await verifyPayment(params.id as string)
                        if (verifyResult.success) {
                            // Refresh order data
                            const updatedData = await getOrderById(params.id as string)
                            setOrder(updatedData)
                        }
                        setVerifying(false)
                    }

                    // Fetch tracking if available
                    if (data.tracking_number) {
                        const tracking = await getOrderTracking(data.tracking_number)
                        if (tracking.success) {
                            setTrackingData(tracking)
                        }
                    }

                    // Fetch return request if any
                    const ret = await getReturnByOrderId(params.id as string)
                    if (ret) setReturnRequest(ret)
                }
            }
            setLoading(false)
        }
        load()
    }, [params.id, searchParams])

    // Countdown Timer Logic
    useEffect(() => {
        if (order?.status === 'pending' && order?.created_at) {
            const calculateTime = () => {
                const start = new Date(order.created_at).getTime()
                const now = new Date().getTime()
                const expiry = start + (30 * 60 * 1000)
                const diff = expiry - now

                if (diff <= 0) {
                    setIsExpired(true)
                    setTimeLeft('00:00')
                    if (timerRef.current) clearInterval(timerRef.current)
                    return
                }

                const minutes = Math.floor(diff / (60 * 1000))
                const seconds = Math.floor((diff % (60 * 1000)) / 1000)
                setTimeLeft(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
            }

            calculateTime()
            timerRef.current = setInterval(calculateTime, 1000)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [order])

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 0
            case 'confirmed': return 1
            case 'packed': return 2
            case 'shipped': return 3
            case 'delivered': return 4
            default: return 0
        }
    }

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'pending':
                return order.payment_error_reason
                    ? `Payment Failed: ${order.payment_error_reason}. You can retry the payment within the time limit.`
                    : 'Awaiting payment confirmation. Complete your payment to proceed.'
            case 'confirmed': return 'Your order is confirmed and being prepared for shipment.'
            case 'packed': return 'Your order has been carefully packed and is ready for dispatch.'
            case 'shipped': return 'Your order is on the way! Track it using the tracking number above.'
            case 'delivered': return 'Your order has been delivered successfully. We hope you love your purchase!'
            case 'cancelled': return 'This order has been cancelled.'
            default: return ''
        }
    }

    const handleReturnRequest = async () => {
        if (!returnForm.issueType || !returnForm.reason.trim() || !returnForm.description.trim()) {
            toast.error('Please fill in all fields')
            return
        }
        setReturnSubmitting(true)
        try {
            const result = await requestReturn(order.id, {
                reason: returnForm.reason,
                issueType: returnForm.issueType as any,
                description: returnForm.description
            })
            if (result.success) {
                toast.success(result.message)
                setIsReturnOpen(false)
                setReturnForm({ reason: '', issueType: '', description: '' })
                // Refresh return status
                const ret = await getReturnByOrderId(order.id)
                if (ret) setReturnRequest(ret)
            } else {
                toast.error(result.error)
            }
        } catch {
            toast.error('An unexpected error occurred')
        } finally {
            setReturnSubmitting(false)
        }
    }

    const handlePrint = () => {
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setIsPrinting(false)
        }, 800)
    }

    const handlePrintCertificate = (item: any) => {
        setActiveCertificate(item)
        setIsCertPrinting(true)
        setTimeout(() => {
            window.print()
            setIsCertPrinting(false)
        }, 800)
    }

    const handleRetryPayment = async () => {
        if (isExpired) {
            toast.error('Payment window has expired')
            return
        }

        setRetryingPayment(true)
        router.push(`/checkout/payment-retry/${order.id}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
                <p className="text-xl mb-4">Order not found</p>
                <Link href="/account/orders" className="text-primary hover:text-primary/80">
                    ← Back to Orders
                </Link>
            </div>
        )
    }

    const statusStep = getStatusStep(order.status)
    const steps = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered']
    const stepIcons = [CheckCircle, PackageCheck, Package, Truck, CheckCircle]

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-16 md:pt-24 pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                        <Link href="/account" className="hover:text-primary">Account</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/account/orders" className="hover:text-primary">Orders</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-foreground">{order.order_number}</span>
                    </div>

                    {/* Verifying Overlay */}
                    {verifying && (
                        <div className="mb-8 p-6 bg-primary/10 border border-primary/30 text-center animate-in fade-in duration-500">
                            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                            <h2 className="text-xl font-serif font-bold mb-2">Verifying Payment...</h2>
                            <p className="text-muted-foreground text-sm">Please do not refresh or close this page.</p>
                        </div>
                    )}

                    {/* Success Banner */}
                    {isSuccess && (
                        <div className="mb-8 p-6 bg-primary/10 border border-primary/30 text-center animate-in fade-in zoom-in duration-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                            <h2 className="text-2xl font-serif font-bold mb-2">Order Placed Successfully!</h2>
                            <p className="text-muted-foreground">Thank you for your order. We'll notify you when it ships.</p>
                        </div>
                    )}

                    {/* Payment SDKs */}
                    <Script
                        src="https://checkout.razorpay.com/v1/checkout.js"
                        strategy="afterInteractive"
                    />
                    <Script
                        src="https://sdk.cashfree.com/js/v3/cashfree.js"
                        strategy="afterInteractive"
                    />

                    {/* Pending Payment Advisory (Amazon-style) */}
                    {order.status === 'pending' && (
                        <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-500/20 rounded-full">
                                    <Clock className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                        <h2 className="text-xl font-bold text-foreground">Action Required: Payment Pending</h2>
                                        {timeLeft && !isExpired && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Time Left:</span>
                                                <span className="text-sm font-mono font-bold text-amber-600">{timeLeft}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Your payment session was not completed. To secure your luxury pieces, please complete the payment within 30 minutes.
                                        <strong> Orders not paid in time will be automatically cancelled.</strong>
                                    </p>
                                    {!isExpired ? (
                                        <button
                                            onClick={handleRetryPayment}
                                            disabled={retryingPayment}
                                            className="px-8 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                        >
                                            {retryingPayment ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4" />
                                                    Complete Payment Now
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold uppercase tracking-widest text-center">
                                            Payment Window Expired
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Return Journey Timeline */}
                    {returnRequest && (() => {
                        const STATUS_STEPS = [
                            {
                                key: 'requested',
                                label: 'Return Requested',
                                icon: RotateCcw,
                                desc: 'Your return request has been received and is under review.',
                            },
                            {
                                key: 'approved',
                                label: 'Request Approved',
                                icon: CheckCircle,
                                desc: 'Our team has approved your return request.',
                            },
                            {
                                key: 'pickup_scheduled',
                                label: 'Pickup Scheduled',
                                icon: Clock,
                                desc: 'Delhivery reverse pickup has been scheduled.',
                            },
                            {
                                key: 'picked_up',
                                label: 'Item Picked Up',
                                icon: PackageCheck,
                                desc: 'The courier has collected your item.',
                            },
                            {
                                key: 'received',
                                label: 'Received at Warehouse',
                                icon: Package,
                                desc: 'We have received the returned item at our facility.',
                            },
                            {
                                key: 'inspected',
                                label: 'Quality Inspection',
                                icon: ShieldAlert,
                                desc: 'Our experts are inspecting the returned item.',
                            },
                            {
                                key: 'refunded',
                                label: 'Refund Processed',
                                icon: CreditCard,
                                desc: 'Refund has been initiated to your original payment method.',
                            },
                        ]

                        const rejectedFlow = returnRequest.status === 'rejected'
                        const ORDER = STATUS_STEPS.map(s => s.key)
                        const currentIdx = ORDER.indexOf(returnRequest.status)

                        const colorMap: Record<string, string> = {
                            requested: 'text-amber-400',
                            approved: 'text-emerald-400',
                            pickup_scheduled: 'text-sky-400',
                            picked_up: 'text-blue-400',
                            received: 'text-violet-400',
                            inspected: 'text-orange-400',
                            refunded: 'text-emerald-400',
                            rejected: 'text-red-400',
                        }
                        const bgMap: Record<string, string> = {
                            requested: 'bg-amber-400/10 border-amber-400/30',
                            approved: 'bg-emerald-400/10 border-emerald-400/30',
                            pickup_scheduled: 'bg-sky-400/10 border-sky-400/30',
                            picked_up: 'bg-blue-400/10 border-blue-400/30',
                            received: 'bg-violet-400/10 border-violet-400/30',
                            inspected: 'bg-orange-400/10 border-orange-400/30',
                            refunded: 'bg-emerald-400/10 border-emerald-400/30',
                            rejected: 'bg-red-400/10 border-red-400/30',
                        }

                        const activeColor = colorMap[returnRequest.status] || 'text-primary'
                        const activeBg = bgMap[returnRequest.status] || 'bg-primary/10 border-primary/30'
                        const formattedDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

                        return (
                            <div className={`mb-8 border ${activeBg} overflow-hidden`}>
                                {/* Header */}
                                <div className="p-6 border-b border-white/5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-full ${activeBg}`}>
                                                <RotateCcw className={`w-5 h-5 ${activeColor}`} />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-foreground text-lg">
                                                    {rejectedFlow ? 'Return Not Approved' : `Return ${returnRequest.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}`}
                                                </h2>
                                                <p className="text-xs text-muted-foreground">
                                                    Ref #{returnRequest.id.split('-')[0].toUpperCase()} · Submitted {formattedDate(returnRequest.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        {returnRequest.tracking_number && (
                                            <div className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${activeBg} ${activeColor}`}>
                                                <Truck className="w-3.5 h-3.5" />
                                                Tracking: {returnRequest.tracking_number}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Message */}
                                {returnRequest.admin_notes && (
                                    <div className="px-6 py-4 bg-background/30 border-b border-white/5">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Message from AURERXA:</p>
                                        <p className="text-sm italic text-foreground/80">"{returnRequest.admin_notes}"</p>
                                    </div>
                                )}

                                {/* Timeline */}
                                {!rejectedFlow ? (
                                    <div className="p-6">
                                        <div className="space-y-0">
                                            {STATUS_STEPS.map((step, idx) => {
                                                const isCompleted = currentIdx > idx
                                                const isCurrent = currentIdx === idx
                                                const isPending = currentIdx < idx
                                                const StepIcon = step.icon

                                                return (
                                                    <div key={step.key} className="flex gap-4">
                                                        {/* Icon + Line */}
                                                        <div className="flex flex-col items-center">
                                                            <div className={cn(
                                                                'w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all',
                                                                isCompleted ? 'bg-emerald-500/20 border-emerald-500/50' :
                                                                    isCurrent ? `${activeBg} border-current` :
                                                                        'bg-white/5 border-white/10'
                                                            )}>
                                                                {isCompleted
                                                                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                                    : <StepIcon className={cn('w-4 h-4', isCurrent ? activeColor : 'text-white/20', isCurrent && 'animate-pulse')} />
                                                                }
                                                            </div>
                                                            {idx < STATUS_STEPS.length - 1 && (
                                                                <div className={`w-0.5 flex-1 my-1 ${isCompleted ? 'bg-emerald-500/40' : 'bg-white/10'}`} style={{ minHeight: '24px' }} />
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className={`pb-5 flex-1 ${idx < STATUS_STEPS.length - 1 ? '' : ''}`}>
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                                <p className={cn(
                                                                    'text-sm font-bold',
                                                                    isCompleted ? 'text-emerald-400' :
                                                                        isCurrent ? activeColor :
                                                                            'text-white/25'
                                                                )}>
                                                                    {step.label}
                                                                </p>
                                                                {isCurrent && (
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {formattedDate(returnRequest.updated_at)}
                                                                    </span>
                                                                )}
                                                                {isCompleted && idx === 0 && (
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {formattedDate(returnRequest.created_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {(isCurrent || isCompleted) && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                                                            )}
                                                            {/* Refund details */}
                                                            {step.key === 'refunded' && isCurrent && (
                                                                <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                                                                    Refund of ₹{Number(order?.total || 0).toLocaleString('en-IN')} will be credited within 5–7 business days to your original payment method.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    /* Rejected state — simple message */
                                    <div className="p-6">
                                        <div className="flex items-start gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <div className="p-2 bg-red-500/20 rounded-lg">
                                                <XCircle className="w-6 h-6 text-red-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-base font-bold text-red-400 mb-1">Return Not Approved</p>

                                                {returnRequest.admin_notes ? (
                                                    <div className="mb-4">
                                                        <p className="text-[10px] uppercase tracking-widest font-bold text-red-400/60 mb-1">Rejection Reason:</p>
                                                        <p className="text-sm text-foreground/90 font-medium py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                            "{returnRequest.admin_notes}"
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        Your return request could not be approved based on the information provided.
                                                    </p>
                                                )}

                                                <div className="space-y-3">
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        If you believe this is incorrect, please contact our support team. Make sure you have your <strong>unboxing video</strong> and order details ready for review.
                                                    </p>
                                                    <a href="/help" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 px-5 py-2.5 hover:bg-primary/10 transition-all rounded-lg">
                                                        <LifeBuoy className="w-3.5 h-3.5" />
                                                        Contact Support →
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })()}


                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Order Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Header */}
                            <div className="bg-card border border-border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-xl font-serif font-bold">Order #{order.order_number}</h1>
                                        <p className="text-sm text-muted-foreground">
                                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 text-xs uppercase tracking-wider ${order.status === 'delivered' ? 'text-primary bg-primary/20' :
                                            order.status === 'shipped' ? 'text-foreground/80 bg-muted' :
                                                order.status === 'cancelled' ? 'text-destructive bg-destructive/10' :
                                                    'text-primary bg-primary/10'
                                            }`}>
                                            {order.status}
                                        </span>
                                        {/* Hide Invoice for Pending Orders */}
                                        {order.status !== 'pending' && order.status !== 'cancelled' && (
                                            <button
                                                onClick={handlePrint}
                                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-colors"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                Print Invoice
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Tracking & Delivery Info - Only if NOT pending/cancelled */}
                                {order.status !== 'cancelled' && order.status !== 'pending' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted/50 border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <Truck className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Estimated Delivery</p>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {trackingData?.estimatedDelivery ?
                                                            new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) :
                                                            new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Package className="w-5 h-5 text-primary" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Tracking Number</p>
                                                    <p className="text-sm font-family-mono text-foreground/80">
                                                        {order.tracking_number || 'Pending Assignment'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Live Tracking Timeline */}
                                        {trackingData && trackingData.scans && (
                                            <div className="border border-border bg-card p-6">
                                                <h3 className="text-sm font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    Live Shipment Tracking
                                                </h3>

                                                <ShipmentTimeline
                                                    scans={trackingData.scans}
                                                    currentStatus={order.status}
                                                    estimatedDelivery={trackingData.estimatedDelivery}
                                                />

                                                <div className="mt-8 pt-4 border-t border-border/50 text-center">
                                                    <a
                                                        href={`https://www.delhivery.com/track/package/${order.tracking_number}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[10px] text-muted-foreground hover:text-primary uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors group"
                                                    >
                                                        Detailed History on Delhivery
                                                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Order Policy & Legal Advisory - Hide for Pending */}
                                {order.status !== 'pending' && (
                                    <div className="mt-8 p-6 bg-muted/30 border border-border space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-5 h-5 text-primary" />
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Terms of Possession</h3>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-primary">
                                                <Scale className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-tighter">Return Policy</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                Return only accepted on defective product. Email us at <a href="mailto:support@aurerxa.com" className="hover:text-primary underline">support@aurerxa.com</a> or visit our <Link href="/policies/refund-policy" className="hover:text-primary underline">refund or return policy</Link>.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Cancellation Option - Restricted by Status */}
                                {order.status === 'confirmed' ? (
                                    <div className="mt-6 p-6 border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <p className="text-foreground text-sm font-bold uppercase tracking-tight">Active Cancellation Window</p>
                                            </div>
                                            <p className="text-muted-foreground text-xs">This order can still be cancelled before it enters the shipping phase.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsCancellationOpen(true)}
                                            className="w-full md:w-auto px-6 py-2.5 bg-background text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all border border-primary/30"
                                        >
                                            Request Cancellation
                                        </button>
                                    </div>
                                ) : order.status === 'cancelled' ? (
                                    <div className="mt-6 p-6 border border-destructive/20 bg-destructive/5 text-center">
                                        <p className="text-destructive text-sm font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Order Cancelled
                                        </p>
                                        <div className="space-y-2">
                                            {order.cancellation_reason && (
                                                <p className="text-muted-foreground text-xs italic">Reason: {order.cancellation_reason}</p>
                                            )}
                                            <p className="text-foreground text-[11px] font-medium py-2 px-4 bg-background border border-border inline-block">
                                                If any amount was debited, it will be credited within 5-7 days to your original payment method.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 p-6 border border-border bg-muted/20 text-center">
                                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                                            {order.status === 'pending'
                                                ? 'Complete payment at the top of the page to finalize your order.'
                                                : `The cancellation window for this order has closed as it is already ${order.status}.`}
                                        </p>
                                    </div>
                                )}

                                {/* Status Timeline */}
                                {order.status !== 'cancelled' && (
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center justify-between">
                                            {steps.map((step, i) => {
                                                const StepIcon = stepIcons[i]
                                                return (
                                                    <div key={step} className="flex-1 flex flex-col items-center relative">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${i <= statusStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                            {i < statusStep ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                                                        </div>
                                                        <p className={`text-[10px] sm:text-xs mt-2 text-center ${i <= statusStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                            {step}
                                                        </p>
                                                        {i < steps.length - 1 && (
                                                            <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < statusStep ? 'bg-primary' : 'bg-muted'}`} />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {/* Status Description */}
                                        <div className="p-3 bg-muted/30 border border-border/50 text-center">
                                            <p className="text-xs text-muted-foreground">{getStatusDescription(order.status)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="bg-card border border-border p-6">
                                <h2 className="font-serif text-lg font-medium mb-4">Order Items</h2>
                                <div className="space-y-4">
                                    {order.order_items?.map((item: any) => {
                                        const productSlug = item.products?.slug
                                        const productLink = productSlug ? `/product/${productSlug}` : null

                                        return (
                                            <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                                                {productLink ? (
                                                    <Link href={productLink} className="relative w-20 h-20 bg-muted flex-shrink-0 group/img">
                                                        {item.product_image && (
                                                            <Image
                                                                src={item.product_image}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover group-hover/img:opacity-80 transition-opacity"
                                                                loader={supabaseLoader}
                                                            />
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <div className="relative w-20 h-20 bg-muted flex-shrink-0">
                                                        {item.product_image && (
                                                            <Image
                                                                src={item.product_image}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover"
                                                                loader={supabaseLoader}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    {productLink ? (
                                                        <Link href={productLink} className="font-medium hover:text-primary transition-colors">
                                                            {item.product_name}
                                                        </Link>
                                                    ) : (
                                                        <p className="font-medium">{item.product_name}</p>
                                                    )}
                                                    {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-2">
                                                    <p className="font-medium text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                    {order.status === 'delivered' && (
                                                        <button
                                                            onClick={() => setActiveCertificate(item)}
                                                            className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors border border-border px-2 py-1 hover:border-primary/30"
                                                            title="Digital Authenticity Certificate"
                                                        >
                                                            <ShieldAlert className="w-3 h-3" />
                                                            Certificate
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary + Quick Actions */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Additional Services Info */}
                            {(order.gift_wrap || order.delivery_time_slot) && (
                                <div className="bg-card border border-border p-6">
                                    <h2 className="font-serif text-lg font-medium mb-4">Order Services</h2>
                                    <div className="space-y-4">
                                        {/* Gift Wrap Badge */}
                                        {order.gift_wrap && (
                                            <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20">
                                                <Gift className="w-5 h-5 text-primary mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-primary">Premium Gift Wrapping</p>
                                                    {order.gift_message && (
                                                        <div className="mt-2 text-xs text-muted-foreground italic relative pl-2 border-l-2 border-primary/30">
                                                            "{order.gift_message}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Delivery Slot Badge */}
                                        {order.delivery_time_slot && (
                                            <div className="flex items-start gap-3 p-3 bg-muted/50 border border-border">
                                                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Preferred Delivery Slot</p>
                                                    <p className="text-sm font-medium text-foreground capitalize">
                                                        {order.delivery_time_slot.replace('-', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Summary */}
                            <div className="bg-card border border-border p-6">
                                <h2 className="font-serif text-lg font-medium mb-4">Payment Summary</h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {order.coupon_discount > 0 && (
                                        <div className="flex justify-between text-primary">
                                            <span>Discount ({order.coupon_code || 'Privilege'})</span>
                                            <span>-₹{order.coupon_discount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                                        <span>Shipping</span>
                                        <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                                    </div>
                                    {/* Calculated gift wrap cost if not explicitly stored */}
                                    {order.gift_wrap && (order.total - order.subtotal - order.shipping + (order.coupon_discount || 0)) > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Gift Wrapping</span>
                                            <span>₹199</span>
                                        </div>
                                    )}
                                    <div className="border-t border-border pt-2 flex justify-between font-medium text-lg">
                                        <span>Total</span>
                                        <span className="text-primary">₹{order.total.toLocaleString('en-IN')}</span>
                                    </div>
                                    {order.payment_id && (
                                        <div className="pt-2 text-xs text-muted-foreground flex justify-between items-center group">
                                            <span>Transaction ID</span>
                                            <span className="font-mono text-xs select-all bg-muted/50 px-1.5 py-0.5 rounded ml-2 max-w-[140px] truncate group-hover:max-w-none transition-all" title={order.payment_id}>
                                                {order.payment_id}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="capitalize">
                                        {order.payment_method === 'cod' ? 'Cash on Delivery' :
                                            order.payment_method === 'online' ? 'Paid Online' :
                                                order.payment_method}
                                    </span>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-card border border-border p-6">
                                <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Shipping Address
                                </h2>
                                {order.shipping_address && (
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p className="font-medium text-foreground">{order.shipping_address.full_name}</p>
                                        <p>{order.shipping_address.street_address}</p>
                                        <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
                                        <p className="text-muted-foreground">Phone: {order.shipping_address.phone}</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions Card */}
                            <div className="bg-card border border-border p-6">
                                <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-primary" />
                                    Need Help?
                                </h2>
                                <div className="space-y-2">
                                    {/* Contextual actions based on order status */}
                                    {order.status === 'shipped' && order.tracking_number && (
                                        <a
                                            href={`https://www.delhivery.com/track/package/${order.tracking_number}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border hover:border-primary/30 transition-all group"
                                        >
                                            <Truck className="w-4 h-4 text-primary" />
                                            <span className="flex-1 text-foreground group-hover:text-primary transition-colors">Track Package</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                        </a>
                                    )}

                                    {order.status === 'delivered' && !returnRequest && (
                                        <button
                                            onClick={() => setIsReturnOpen(true)}
                                            className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border hover:border-primary/30 transition-all group"
                                        >
                                            <RotateCcw className="w-4 h-4 text-primary" />
                                            <span className="flex-1 text-foreground group-hover:text-primary transition-colors">Request Return</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                    )}
                                    {returnRequest && (
                                        <div className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border">
                                            <RotateCcw className="w-4 h-4 text-primary" />
                                            <span className="flex-1 text-foreground">Return Status</span>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5",
                                                returnRequest.status === 'requested' ? "text-amber-500 bg-amber-500/10" :
                                                    returnRequest.status === 'approved' ? "text-emerald-500 bg-emerald-500/10" :
                                                        returnRequest.status === 'rejected' ? "text-red-500 bg-red-500/10" :
                                                            "text-primary bg-primary/10"
                                            )}>
                                                {returnRequest.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    )}

                                    {order.status === 'cancelled' && (
                                        <Link
                                            href="/collections"
                                            className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border hover:border-primary/30 transition-all group"
                                        >
                                            <ShoppingBag className="w-4 h-4 text-primary" />
                                            <span className="flex-1 text-foreground group-hover:text-primary transition-colors">Shop Again</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        </Link>
                                    )}

                                    {order.status !== 'pending' && order.status !== 'cancelled' && (
                                        <button
                                            onClick={handlePrint}
                                            className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border hover:border-primary/30 transition-all group"
                                        >
                                            <FileText className="w-4 h-4 text-primary" />
                                            <span className="flex-1 text-foreground group-hover:text-primary transition-colors">Download Invoice</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                    )}

                                    <Link
                                        href={`/help`}
                                        className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border hover:border-primary/30 transition-all group"
                                    >
                                        <LifeBuoy className="w-4 h-4 text-primary" />
                                        <span className="flex-1 text-foreground group-hover:text-primary transition-colors">Contact Support</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Link>

                                    <Link
                                        href="/returns"
                                        className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border hover:border-primary/30 transition-all group"
                                    >
                                        <Scale className="w-4 h-4 text-primary" />
                                        <span className="flex-1 text-foreground group-hover:text-primary transition-colors">Return & Refund Policy</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Hidden Printing Template Container */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1cm; size: portrait; }
                    body > *:not(#print-root) { display: none !important; }
                    #print-root { 
                        display: block !important;
                        width: 100% !important;
                        background: white !important;
                        opacity: 1 !important;
                    }
                }
            `}} />

            {/* The actual Printable Content - Hidden from screen but visible to print engine */}
            {isPrinting && typeof document !== 'undefined' && createPortal(
                <div id="print-root" className="fixed left-[-9999px] top-0 z-[99999] pointer-events-none overflow-hidden print:left-0 print:static print:w-full print:opacity-100">
                    <div className="flex flex-col items-center justify-start">
                        <div className="w-full max-w-[800px] bg-white">
                            <InvoiceTemplate order={order} type="customer" />
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isCertPrinting && activeCertificate && typeof document !== 'undefined' && createPortal(
                <div id="print-root" className="fixed left-[-9999px] top-0 z-[99999] pointer-events-none overflow-hidden print:left-0 print:static print:w-full print:opacity-100">
                    <div className="flex flex-col items-center justify-start bg-white min-h-screen pt-12">
                        <DigitalCertificate
                            orderNumber={order.order_number}
                            productName={activeCertificate.product_name}
                            purity={activeCertificate.products?.purity || '18K Gold'}
                            weight={activeCertificate.products?.weight_grams?.toString()}
                            purchaseDate={order.created_at}
                            customerId={order.user_id}
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* Certificate Preview Modal */}
            {activeCertificate && !isCertPrinting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 px-4 py-8 overflow-y-auto">
                    <div className="relative w-full max-w-4xl min-h-full flex flex-col items-center">
                        <div className="w-full flex justify-end mb-4">
                            <button
                                onClick={() => setActiveCertificate(null)}
                                className="text-white/60 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
                            >
                                Close Preview ✕
                            </button>
                        </div>

                        <div className="bg-white p-4 shadow-2xl relative group">
                            <DigitalCertificate
                                orderNumber={order.order_number}
                                productName={activeCertificate.product_name}
                                purity={activeCertificate.products?.purity || '18K Gold'}
                                weight={activeCertificate.products?.weight_grams?.toString()}
                                purchaseDate={order.created_at}
                                customerId={order.user_id}
                            />

                            {/* Hover Print Overlay (Desktop) */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <div className="bg-white text-slate-900 px-8 py-4 shadow-xl flex items-center gap-3 font-bold uppercase tracking-widest text-sm">
                                    <Printer className="w-5 h-5" />
                                    Digital Authenticity Link Verified
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row gap-4 w-full justify-center pb-12">
                            <button
                                onClick={() => handlePrintCertificate(activeCertificate)}
                                className="px-12 py-4 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl flex items-center justify-center gap-3"
                            >
                                <Printer className="w-4 h-4" />
                                Download / Print Certificate
                            </button>
                            <button
                                onClick={() => setActiveCertificate(null)}
                                className="px-12 py-4 bg-white/10 text-white text-xs font-bold uppercase tracking-[0.2em] border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                            >
                                Back to Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Dialog */}
            <OrderCancellationDialog
                isOpen={isCancellationOpen}
                onClose={() => setIsCancellationOpen(false)}
                orderId={order.id}
                orderNumber={order.order_number}
                onSuccess={async () => {
                    const updatedData = await getOrderById(order.id)
                    setOrder(updatedData)
                }}
            />

            {/* Return Request Dialog */}
            {isReturnOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
                    <div className="bg-card border border-border w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-serif font-bold text-foreground">Request Return</h2>
                            <button onClick={() => setIsReturnOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>

                        <div className="space-y-4">
                            {/* Issue Type */}
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-2">Type of Issue</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'defective', label: 'Defective Product' },
                                        { value: 'wrong_product', label: 'Wrong Product' },
                                        { value: 'damaged_in_transit', label: 'Damaged in Transit' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setReturnForm({ ...returnForm, issueType: opt.value as any })}
                                            className={`text-left px-3 py-2 text-[11px] border transition-all ${returnForm.issueType === opt.value
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary/50 text-muted-foreground'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-2">Reason</label>
                                <input
                                    type="text"
                                    value={returnForm.reason}
                                    onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                                    placeholder="e.g., Product has a scratch on the surface"
                                    className="w-full p-3 bg-background border border-input text-foreground text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] block mb-2">Detailed Description</label>
                                <textarea
                                    value={returnForm.description}
                                    onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                                    placeholder="Please describe the issue in detail. Include when you noticed it, and attach unboxing video if available."
                                    rows={4}
                                    className="w-full p-3 bg-background border border-input text-foreground text-sm focus:outline-none focus:border-primary resize-none placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Policy & Anti-Fraud Reminder */}
                            <div className="p-3 bg-destructive/5 border border-destructive/20 space-y-2">
                                <p className="text-[10px] text-destructive font-bold uppercase tracking-widest">⚠️ Mandatory Requirements</p>
                                <ul className="text-[10px] text-muted-foreground space-y-1 list-disc pl-4 leading-snug">
                                    <li><strong className="text-foreground">Unboxing Video:</strong> A continuous, uncut video from parcel receipt to product inspection is mandatory. Edited or partial videos will be rejected.</li>
                                    <li><strong className="text-foreground">Weight Verification:</strong> Every returned product will be weighed and inspected. If the weight is less than what was dispatched, the return will be rejected.</li>
                                    <li><strong className="text-destructive">Anti-Fraud Warning:</strong> Any tampering, substitution, fake packaging, counterfeit labels, or weight manipulation will result in rejection of the return and may lead to legal action under IPC Section 420.</li>
                                    <li>Product must be in original AURERXA packaging with all seals, tags, and certificates intact.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                            <button
                                onClick={() => setIsReturnOpen(false)}
                                className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                                disabled={returnSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturnRequest}
                                disabled={returnSubmitting || !returnForm.issueType || !returnForm.reason.trim() || !returnForm.description.trim()}
                                className="px-6 py-2 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {returnSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    )
}
