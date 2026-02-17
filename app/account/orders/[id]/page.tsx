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
import { getOrderById, getOrderTracking, verifyPayment, getOrderPaymentSession, initiatePayment, requestReturn } from '@/app/actions'
import { Loader2, Package, ChevronRight, CheckCircle, Truck, MapPin, CreditCard, Gift, Clock, AlertCircle, RefreshCw, FileText, Printer, ShieldAlert, Gavel, Scale, PlayCircle, LifeBuoy, RotateCcw, ExternalLink, ShoppingBag, PackageCheck, HelpCircle } from 'lucide-react'
import { InvoiceTemplate } from '@/components/invoice-template'
import { toast } from 'sonner'
import { OrderCancellationDialog } from '@/components/order-cancellation-dialog'

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
            case 'pending': return 'Awaiting payment confirmation. Complete your payment to proceed.'
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

    const handleRetryPayment = async () => {
        if (isExpired) {
            toast.error('Payment window has expired')
            return
        }

        setRetryingPayment(true)
        try {
            const paymentResult = await initiatePayment(order.id)

            if (!paymentResult.success) {
                toast.error(paymentResult.error || 'Failed to initiate payment')
                setRetryingPayment(false)
                return
            }

            if (paymentResult.gateway === 'razorpay') {
                const rp = paymentResult as any
                if (!(window as any).Razorpay) {
                    toast.error('Payment connection is slow. Please wait...')
                    setRetryingPayment(false)
                    return
                }

                const options = {
                    key: rp.keyId,
                    amount: rp.amount,
                    currency: rp.currency,
                    name: "AURERXA",
                    description: rp.productName,
                    image: `${window.location.origin}/favicon 30x30.ico`,
                    order_id: rp.razorpayOrderId,
                    handler: async function (response: any) {
                        setVerifying(true)
                        const verifyResult = await verifyPayment(order.id, response)
                        if (verifyResult.success) {
                            toast.success('Payment successful!')
                            // Refresh page or update status
                            const updatedData = await getOrderById(order.id)
                            setOrder(updatedData)
                        } else {
                            toast.error(verifyResult.error || 'Verification failed')
                        }
                        setVerifying(false)
                        setRetryingPayment(false)
                    },
                    prefill: {
                        name: rp.customer.name,
                        email: rp.customer.email,
                        contact: rp.customer.contact
                    },
                    theme: { color: "#D4AF37" },
                    modal: {
                        ondismiss: function () {
                            setRetryingPayment(false)
                        }
                    }
                }
                const rzp = new (window as any).Razorpay(options)
                rzp.open()
            } else if (paymentResult.gateway === 'cashfree') {
                const cf = paymentResult as any
                if (!(window as any).Cashfree) {
                    toast.error('Payment system loading...')
                    setRetryingPayment(false)
                    return
                }

                const cashfree = (window as any).Cashfree({
                    mode: cf.mode || "sandbox"
                })

                cashfree.checkout({
                    paymentSessionId: cf.paymentSessionId,
                    redirectTarget: "_self", // Redirect back to this page
                })
            }
        } catch (error) {
            console.error('Retry Payment Error:', error)
            toast.error('An error occurred. Please try again.')
            setRetryingPayment(false)
        }
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
                                            <div className="border border-border bg-card p-4 rounded-sm">
                                                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    Live Tracking Updates
                                                </h3>
                                                <div className="space-y-6 relative pl-2">
                                                    {/* Vertical Line */}
                                                    <div className="absolute top-2 left-[11px] h-full w-[1px] bg-border" />

                                                    {trackingData.scans.slice(0, 3).map((scan: any, i: number) => (
                                                        <div key={i} className="relative pl-6">
                                                            <div className={`absolute left-[7px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background ${i === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                                                            <p className="text-sm font-medium text-foreground">{scan.status}</p>
                                                            <p className="text-xs text-muted-foreground">{scan.location}</p>
                                                            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                                                                {new Date(scan.timestamp).toLocaleString('en-IN')}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-border text-center">
                                                    <a href={`https://www.delhivery.com/track/package/${order.tracking_number}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:text-primary/80 uppercase tracking-wider">
                                                        View Full Tracking History
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
                                                <p className="font-medium text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
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
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Shipping</span>
                                        <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                                    </div>
                                    {order.coupon_discount > 0 && (
                                        <div className="flex justify-between text-primary">
                                            <span>Discount</span>
                                            <span>-₹{order.coupon_discount.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
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

                                    {order.status === 'delivered' && (
                                        <button
                                            onClick={() => setIsReturnOpen(true)}
                                            className="flex items-center gap-3 w-full p-3 text-left text-sm bg-muted/50 border border-border hover:border-primary/30 transition-all group"
                                        >
                                            <RotateCcw className="w-4 h-4 text-primary" />
                                            <span className="flex-1 text-foreground group-hover:text-primary transition-colors">Request Return</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
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
