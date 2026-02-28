'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getOrderById, initiatePayment, verifyPayment } from '@/app/actions'
import { Loader2, ShieldCheck, ChevronRight, CreditCard, ArrowLeft, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentRetryPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = params.id as string
    const status = searchParams.get('status')
    const isFailure = status && status !== 'Success'

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [retrying, setRetrying] = useState(false)
    const [verifying, setVerifying] = useState(false)

    useEffect(() => {
        async function loadOrder() {
            if (!orderId) return
            const data = await getOrderById(orderId)
            if (data) {
                setOrder(data)
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
            const paymentResult = await initiatePayment(orderId)

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
                            setRetrying(false)
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
            } else if (paymentResult.gateway === 'ccavenue') {
                const cv = paymentResult as any;

                // Create hidden form and submit to CCAvenue
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = cv.actionUrl;

                const encRequestInput = document.createElement('input');
                encRequestInput.type = 'hidden';
                encRequestInput.name = 'encRequest';
                encRequestInput.value = cv.encRequest;
                form.appendChild(encRequestInput);

                const accessCodeInput = document.createElement('input');
                accessCodeInput.type = 'hidden';
                accessCodeInput.name = 'access_code';
                accessCodeInput.value = cv.accessCode;
                form.appendChild(accessCodeInput);

                const merchantIdInput = document.createElement('input');
                merchantIdInput.type = 'hidden';
                merchantIdInput.name = 'merchant_id';
                merchantIdInput.value = cv.merchantId;
                form.appendChild(merchantIdInput);

                document.body.appendChild(form);
                form.submit();
            } else if (paymentResult.gateway === 'free') {
                toast.success('Order confirmed! No payment required.')
                router.push(`/account/orders/${orderId}?success=true`)
            }
        } catch (err: any) {
            console.error('Retry Error:', err)
            toast.error('Could not initiate payment. Please try again later.')
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
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            <main className="pt-32 pb-24 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 mb-6 group">
                            {isFailure ? (
                                <RefreshCw className="w-10 h-10 text-destructive group-hover:rotate-180 transition-transform duration-700" />
                            ) : (
                                <ShieldCheck className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 italic tracking-tight text-white">
                            {isFailure ? 'Payment Unsuccessful' : 'Complete Your Purchase'}
                        </h1>
                        <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] md:text-xs">
                            {isFailure ? `Transaction ${status}` : 'Secure Payment Portal'} • Order #{order.order_number}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                        {/* Left: Info & Actions */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="bg-card/30 border border-white/5 p-8 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />

                                <h2 className="text-xl font-serif font-light mb-4 flex items-center gap-3 italic text-foreground">
                                    <ShieldCheck className="w-5 h-5 text-primary opacity-70" />
                                    Secure Payment Resolution
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    {isFailure
                                        ? "We encountered an issue while processing your payment. Don't worry, your order is saved. You can try completing the transaction again using the button on the right."
                                        : "Your order is ready for fulfillment. Please use our secure portal to complete your transaction and secure your heritage piece."
                                    }
                                </p>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-white/30">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                    <p className="text-[10px] uppercase tracking-widest leading-loose">
                                        256-bit SSL Encrypted • Insured Fulfillment
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <Link
                                    href={`/account/orders/${orderId}`}
                                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/30 hover:text-primary transition-all group"
                                >
                                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                                    Return to Order
                                </Link>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest hidden md:block italic">Verified Heritage Brand</p>
                            </div>
                        </div>

                        {/* Right: Summary & Pay */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white/[0.03] border border-white/5 p-8 backdrop-blur-sm sticky top-32">
                                <h3 className="text-lg font-serif italic mb-8 border-b border-white/5 pb-4 text-foreground/90">Order Summary</h3>

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
                                        <span className="text-xs uppercase tracking-[0.2em] font-premium-sans text-white/50">Payable</span>
                                        <span className="text-3xl font-serif text-primary italic">₹{Number(order.total).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRetry}
                                    disabled={retrying || verifying}
                                    className="w-full py-5 bg-primary text-black font-premium-sans uppercase tracking-[0.3em] text-sm hover:bg-white transition-all duration-700 disabled:opacity-50 disabled:grayscale relative overflow-hidden group shadow-2xl shadow-primary/20"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3 font-bold">
                                        {retrying || verifying ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                {verifying ? 'Verifying...' : 'Initializing...'}
                                            </>
                                        ) : (
                                            <>
                                                {isFailure ? 'Retry Payment' : 'Pay Securely'}
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>

                                <div className="mt-6 flex items-center justify-center gap-3 opacity-20 hover:opacity-100 transition-all duration-700">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/50">100% Secure Checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
