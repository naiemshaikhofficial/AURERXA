'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import supabaseLoader from '@/lib/supabase-loader'
import { getOrderById, initiatePayment, verifyPayment } from '@/app/actions'
import { Loader2, AlertCircle, ChevronRight, CreditCard, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentRetryPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = params.id as string

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [retrying, setRetrying] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'cashfree'>('cashfree')

    useEffect(() => {
        async function loadOrder() {
            if (!orderId) return
            const data = await getOrderById(orderId)
            if (data) {
                setOrder(data)
                // Default to last attempted gateway or config default
                // For now we default to cashfree as per plan
            } else {
                toast.error('Order not found')
                router.push('/account/orders')
            }
            setLoading(false)
        }
        loadOrder()
    }, [orderId, router])

    const handleRetry = async () => {
        setRetrying(true)
        try {
            const paymentResult = await initiatePayment(orderId, selectedGateway)

            if (!paymentResult.success) {
                toast.error(paymentResult.error || 'Failed to initiate payment')
                setRetrying(false)
                return
            }

            if (paymentResult.gateway === 'razorpay') {
                const rp = paymentResult as any
                if (!(window as any).Razorpay) {
                    toast.error('Payment system loading. Please wait...')
                    setRetrying(false)
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
                            router.push(`/account/orders/${orderId}?success=true`)
                        } else {
                            toast.error(verifyResult.error || 'Verification failed')
                            setVerifying(false)
                        }
                    },
                    prefill: {
                        name: rp.customer.name,
                        email: rp.customer.email,
                        contact: rp.customer.contact
                    },
                    theme: { color: "#D4AF37" },
                    modal: {
                        ondismiss: function () {
                            setRetrying(false)
                            toast.info('Payment window closed.')
                        }
                    }
                }
                const rzp = new (window as any).Razorpay(options)
                rzp.open()
            } else if (paymentResult.gateway === 'cashfree') {
                const cf = paymentResult as any
                if (!(window as any).Cashfree) {
                    toast.error('Payment gateway loading...')
                    setRetrying(false)
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
            console.error('Retry Error:', error)
            toast.error('An unexpected error occurred')
            setRetrying(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!order) return null

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-primary/30">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />

            <Navbar />

            <main className="pt-32 pb-24 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 mb-6 group">
                            <ShieldCheck className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 italic tracking-tight">Complete Your Purchase</h1>
                        <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] md:text-xs">Secure Payment Portal • Order #{order.order_number}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Left: Selection */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-card/30 border border-white/5 p-8 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />

                                <h2 className="text-xl font-serif font-light mb-8 flex items-center gap-3 italic">
                                    <CreditCard className="w-5 h-5 text-primary opacity-70" />
                                    Choose Payment Method
                                </h2>

                                <div className="space-y-4">
                                    {/* Razorpay Option */}
                                    <label
                                        onClick={() => setSelectedGateway('razorpay')}
                                        className={`group relative flex flex-col p-6 border transition-all duration-500 cursor-pointer overflow-hidden ${selectedGateway === 'razorpay' ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                                            }`}>
                                        <div className="flex items-center justify-between z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500 ${selectedGateway === 'razorpay' ? 'border-primary bg-primary' : 'border-white/20'}`}>
                                                    {selectedGateway === 'razorpay' && <div className="w-2 h-2 rounded-full bg-black" />}
                                                </div>
                                                <div>
                                                    <p className={`font-premium-sans tracking-wide uppercase text-sm ${selectedGateway === 'razorpay' ? 'text-primary' : 'text-white/70'}`}>Razorpay Secure</p>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1 italic">UPI, Cards, Netbanking</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                                <img src="https://img.icons8.com/?size=100&id=D6nveVwN39k6&format=png&color=000000" alt="Razorpay" className="h-4 object-contain invert" />
                                            </div>
                                        </div>
                                        {selectedGateway === 'razorpay' && (
                                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-3xl opacity-50" />
                                        )}
                                    </label>

                                    {/* Cashfree Option */}
                                    <label
                                        onClick={() => setSelectedGateway('cashfree')}
                                        className={`group relative flex flex-col p-6 border transition-all duration-500 cursor-pointer overflow-hidden ${selectedGateway === 'cashfree' ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                                            }`}>
                                        <div className="flex items-center justify-between z-10">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-500 ${selectedGateway === 'cashfree' ? 'border-primary bg-primary' : 'border-white/20'}`}>
                                                    {selectedGateway === 'cashfree' && <div className="w-2 h-2 rounded-full bg-black" />}
                                                </div>
                                                <div>
                                                    <p className={`font-premium-sans tracking-wide uppercase text-sm ${selectedGateway === 'cashfree' ? 'text-primary' : 'text-white/70'}`}>Cashfree Payments</p>
                                                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1 italic">Fast & Reliable UPI, Cards</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                                <img src="https://img.icons8.com/?size=100&id=TgHJI44zOCgU&format=png&color=000000" alt="Cashfree" className="h-4 object-contain" />
                                            </div>
                                        </div>
                                        {selectedGateway === 'cashfree' && (
                                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-3xl opacity-50" />
                                        )}
                                    </label>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-white/30">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                    <p className="text-[10px] uppercase tracking-widest leading-loose">
                                        Your transactions are encrypted with 256-bit SSL security.
                                        AURERXA does not store your card details.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Link
                                    href={`/account/orders/${orderId}`}
                                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-primary transition-all group"
                                >
                                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                                    Return to Order
                                </Link>
                                <div className="flex items-center gap-4">
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest hidden md:block">Verified by Trusted Partners</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white/[0.03] border border-white/5 p-8 backdrop-blur-sm sticky top-32">
                                <h3 className="text-lg font-serif italic mb-8 border-b border-white/5 pb-4">Order Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40 uppercase tracking-wider text-[10px]">Order Value</span>
                                        <span className="text-white/80">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40 uppercase tracking-wider text-[10px]">Shipping</span>
                                        <span className={`uppercase tracking-widest text-[10px] ${order.shipping === 0 ? 'text-emerald-500 font-bold' : 'text-white/80'}`}>
                                            {order.shipping === 0 ? 'Free' : `₹${order.shipping}`}
                                        </span>
                                    </div>
                                    {order.coupon_discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-primary uppercase tracking-wider text-[10px]">Privilege Applied</span>
                                            <span className="text-primary">-₹{Number(order.coupon_discount).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-baseline mt-4">
                                        <span className="text-xs uppercase tracking-[0.2em] font-premium-sans text-white/50">Payable Amount</span>
                                        <span className="text-3xl font-serif text-primary italic">₹{Number(order.total).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRetry}
                                    disabled={retrying || verifying}
                                    className="w-full py-5 bg-primary text-black font-premium-sans uppercase tracking-[0.3em] text-sm hover:bg-white transition-all duration-700 disabled:opacity-50 disabled:grayscale relative overflow-hidden group shadow-2xl shadow-primary/20"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {retrying || verifying ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                {verifying ? 'Verifying...' : 'Initializing...'}
                                            </>
                                        ) : (
                                            <>
                                                Secure Payment
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>

                                <div className="mt-6 flex items-center justify-center gap-2 opacity-30 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-700">
                                    <div className="relative w-8 h-4">
                                        <Image src="/upi-icon.svg" alt="UPI" fill className="object-contain invert" unoptimized />
                                    </div>
                                    <div className="relative w-8 h-4">
                                        <Image src="/Mastercard-logo.svg" alt="Mastercard" fill className="object-contain" unoptimized />
                                    </div>
                                    <div className="relative w-8 h-4">
                                        <img src="https://img.icons8.com/?size=100&id=13611&format=png&color=FFFFFF" alt="Visa" className="h-full object-contain" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
