'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getOrders, initiatePayment, verifyPayment, getOrderById } from '@/app/actions'
import { Loader2, Package, ChevronRight, Search, Filter, X, Clock, CreditCard, RefreshCw } from 'lucide-react'
import supabaseLoader from '@/lib/supabase-loader'
import { toast } from 'sonner'

// Small sub-component for the live countdown timer
function CountdownTimer({ createdAt, onExpire }: { createdAt: string, onExpire?: () => void }) {
    const [timeLeft, setTimeLeft] = useState<string>('')
    const [isExpired, setIsExpired] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const calculateTime = () => {
            const start = new Date(createdAt).getTime()
            const now = new Date().getTime()
            const expiry = start + (30 * 60 * 1000)
            const diff = expiry - now

            if (diff <= 0) {
                setIsExpired(true)
                setTimeLeft('00:00')
                if (timerRef.current) clearInterval(timerRef.current)
                if (onExpire) onExpire()
                return
            }

            const minutes = Math.floor(diff / (60 * 1000))
            const seconds = Math.floor((diff % (60 * 1000)) / 1000)
            setTimeLeft(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`)
        }

        calculateTime()
        timerRef.current = setInterval(calculateTime, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [createdAt, onExpire])

    if (isExpired) return <span className="text-destructive font-bold text-[10px] uppercase tracking-widest">Expired</span>

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-mono font-bold text-amber-600">
            <Clock className="w-3 h-3" />
            <span>{timeLeft || '--:--'}</span>
        </div>
    )
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [verifying, setVerifying] = useState(false)
    const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null)

    async function loadOrders() {
        const data = await getOrders()
        setOrders(data)
        setLoading(false)
    }

    useEffect(() => {
        loadOrders()
    }, [])

    const handleRetryPayment = async (orderId: string) => {
        setRetryingOrderId(orderId)
        try {
            const paymentResult = await initiatePayment(orderId)

            if (!paymentResult.success) {
                toast.error(paymentResult.error || 'Failed to initiate payment')
                setRetryingOrderId(null)
                return
            }

            if (paymentResult.gateway === 'razorpay') {
                const rp = paymentResult as any
                if (!(window as any).Razorpay) {
                    toast.error('Payment connection is slow. Please wait...')
                    setRetryingOrderId(null)
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
                        const verifyResult = await verifyPayment(orderId, response)
                        if (verifyResult.success) {
                            toast.success('Payment successful!')
                            // Refresh list
                            const data = await getOrders()
                            setOrders(data)
                        } else {
                            toast.error(verifyResult.error || 'Verification failed')
                        }
                        setVerifying(false)
                        setRetryingOrderId(null)
                    },
                    prefill: {
                        name: rp.customer.name,
                        email: rp.customer.email,
                        contact: rp.customer.contact
                    },
                    theme: { color: "#D4AF37" },
                    modal: {
                        ondismiss: function () {
                            setRetryingOrderId(null)
                        }
                    }
                }
                const rzp = new (window as any).Razorpay(options)
                rzp.open()
            } else if (paymentResult.gateway === 'cashfree') {
                const cf = paymentResult as any
                if (!(window as any).Cashfree) {
                    toast.error('Payment system loading...')
                    setRetryingOrderId(null)
                    return
                }

                const cashfree = (window as any).Cashfree({
                    mode: cf.mode || "sandbox"
                })

                cashfree.checkout({
                    paymentSessionId: cf.paymentSessionId,
                    redirectTarget: "_self",
                })
            }
        } catch (error) {
            console.error('Retry Payment Error:', error)
            toast.error('An error occurred. Please try again.')
            setRetryingOrderId(null)
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.order_items?.some((item: any) =>
                item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
            )

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-emerald-500'
            case 'shipped': return 'text-blue-500'
            case 'confirmed': return 'text-primary'
            case 'cancelled': return 'text-destructive'
            case 'pending': return 'text-amber-500'
            default: return 'text-muted-foreground'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Payment SDKs */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />
            <Script
                src="https://sdk.cashfree.com/js/v3/cashfree.js"
                strategy="afterInteractive"
            />

            {/* Verifying Overlay */}
            {verifying && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <RefreshCw className="w-12 h-12 mb-4 text-primary animate-spin" />
                    <h2 className="text-2xl font-serif font-bold mb-2">Verifying Payment...</h2>
                    <p className="text-muted-foreground">Please do not refresh or close this page.</p>
                </div>
            )}

            <main className="pt-20 md:pt-28 pb-24 min-h-[70vh]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mb-8">
                        <Link href="/account" className="hover:text-primary">Account</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground">Your Orders</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-3xl font-serif font-bold mb-2">Your Orders</h1>
                            <p className="text-muted-foreground text-sm">Review, track, and manage your acquisitions.</p>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by Order # or Product"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-card border border-border text-sm focus:border-primary transition-all outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-10 pr-8 py-2 bg-card border border-border text-sm focus:border-primary transition-all outline-none cursor-pointer"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-border bg-card/50">
                            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-lg font-medium text-foreground">No orders matching your criteria</p>
                            <button
                                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                                className="mt-4 text-sm text-primary hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="bg-card border border-border overflow-hidden group hover:border-primary/20 transition-all">
                                    {/* Order Header (Amazon-style) */}
                                    <div className="bg-muted/30 px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex gap-10">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Order Placed</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total</p>
                                                <p className="text-sm font-medium text-primary">₹{order.total.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Payment</p>
                                                <p className="text-sm font-medium capitalize">
                                                    {order.payment_method === 'cod' ? 'COD' :
                                                        order.payment_method === 'online' ? 'Online' :
                                                            order.payment_method}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col items-end min-w-[120px]">
                                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Order # {order.order_number}</p>
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    href={`/account/orders/${order.id}`}
                                                    className="text-[11px] uppercase tracking-widest font-bold text-primary hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                                {/* Hide Invoice for Pending Orders */}
                                                {order.status !== 'pending' && (
                                                    <>
                                                        <span className="text-border">|</span>
                                                        <Link
                                                            href={`/account/orders/${order.id}`}
                                                            className="text-[11px] uppercase tracking-widest font-bold text-primary hover:underline"
                                                        >
                                                            Invoice
                                                        </Link>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items Body */}
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-8">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                                                        <h3 className={`text-base font-bold uppercase tracking-tight ${getStatusColor(order.status)}`}>
                                                            {order.status === 'pending' ? 'Payment Pending' : order.status}
                                                        </h3>
                                                    </div>
                                                    {/* Timer for Pending Orders */}
                                                    {order.status === 'pending' && (
                                                        <CountdownTimer
                                                            createdAt={order.created_at}
                                                            onExpire={() => loadOrders()}
                                                        />
                                                    )}
                                                </div>

                                                {order.order_items?.map((item: any, i: number) => {
                                                    const productSlug = item.products?.slug
                                                    const productLink = productSlug ? `/product/${productSlug}` : `/account/orders/${order.id}`

                                                    return (
                                                        <div key={i} className="flex gap-4 group/item">
                                                            <Link href={productLink} className="relative w-20 h-20 bg-muted flex-shrink-0 border border-border group-hover/item:border-primary/30 transition-colors">
                                                                {item.product_image && (
                                                                    <Image
                                                                        src={item.product_image}
                                                                        alt={item.product_name}
                                                                        fill
                                                                        className="object-cover"
                                                                        loader={supabaseLoader}
                                                                    />
                                                                )}
                                                            </Link>
                                                            <div className="flex-1">
                                                                <Link href={productLink} className="text-sm font-medium hover:text-primary transition-colors block mb-1">
                                                                    {item.product_name}
                                                                </Link>
                                                                <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div className="flex flex-col gap-2 min-w-[180px]">
                                                {order.status === 'pending' ? (
                                                    (() => {
                                                        const isExpired = new Date(order.created_at).getTime() + (30 * 60 * 1000) < Date.now()
                                                        if (isExpired) return (
                                                            <div className="w-full py-3 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] text-center border border-border">
                                                                Session Expired
                                                            </div>
                                                        )
                                                        return (
                                                            <button
                                                                onClick={() => handleRetryPayment(order.id)}
                                                                disabled={retryingOrderId === order.id}
                                                                className="w-full py-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                                            >
                                                                {retryingOrderId === order.id ? (
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CreditCard className="w-3.5 h-3.5" />
                                                                        Complete Payment
                                                                    </>
                                                                )}
                                                            </button>
                                                        )
                                                    })()
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={`/account/orders/${order.id}`}
                                                            className="w-full py-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] text-center hover:bg-primary/90 transition-all"
                                                        >
                                                            Track Package
                                                        </Link>
                                                        <Link
                                                            href={`/account/orders/${order.id}`}
                                                            className="w-full py-2 bg-card border border-border text-foreground text-[10px] font-bold uppercase tracking-[0.2em] text-center hover:bg-muted transition-all"
                                                        >
                                                            Return Items
                                                        </Link>
                                                    </>
                                                )}
                                                <Link
                                                    href={`/account/orders/${order.id}`}
                                                    className="w-full py-2 bg-card border border-border text-foreground text-[10px] font-bold uppercase tracking-[0.2em] text-center hover:bg-muted transition-all"
                                                >
                                                    View Detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
