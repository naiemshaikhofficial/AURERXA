'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getOrderById } from '@/app/actions'
import { Loader2, Package, ChevronRight, CheckCircle, Truck, MapPin, CreditCard } from 'lucide-react'

export default function OrderDetailPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const isSuccess = searchParams.get('success') === 'true'
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (params.id) {
                const data = await getOrderById(params.id as string)
                setOrder(data)
            }
            setLoading(false)
        }
        load()
    }, [params.id])

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 0
            case 'confirmed': return 1
            case 'shipped': return 2
            case 'delivered': return 3
            default: return 0
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center">
                <p className="text-xl mb-4">Order not found</p>
                <Link href="/account/orders" className="text-amber-500 hover:text-amber-400">
                    ← Back to Orders
                </Link>
            </div>
        )
    }

    const statusStep = getStatusStep(order.status)
    const steps = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered']

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-16 md:pt-24 pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-white/50 mb-8">
                        <Link href="/account" className="hover:text-amber-400">Account</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/account/orders" className="hover:text-amber-400">Orders</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">{order.order_number}</span>
                    </div>

                    {/* Success Banner */}
                    {isSuccess && (
                        <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/30 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                            <h2 className="text-2xl font-serif font-bold mb-2">Order Placed Successfully!</h2>
                            <p className="text-white/60">Thank you for your order. We'll notify you when it ships.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Order Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Header */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-xl font-serif font-bold">Order #{order.order_number}</h1>
                                        <p className="text-sm text-white/50">
                                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs uppercase tracking-wider ${order.status === 'delivered' ? 'text-emerald-400 bg-emerald-500/10' :
                                            order.status === 'shipped' ? 'text-blue-400 bg-blue-500/10' :
                                                order.status === 'cancelled' ? 'text-red-400 bg-red-500/10' :
                                                    'text-amber-400 bg-amber-500/10'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Status Timeline */}
                                {order.status !== 'cancelled' && (
                                    <div className="flex items-center justify-between mt-8">
                                        {steps.map((step, i) => (
                                            <div key={step} className="flex-1 flex flex-col items-center relative">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${i <= statusStep ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-800 text-white/30'
                                                    }`}>
                                                    {i < statusStep ? <CheckCircle className="w-4 h-4" /> :
                                                        i === 1 ? <Package className="w-4 h-4" /> :
                                                            i === 2 ? <Truck className="w-4 h-4" /> :
                                                                <CheckCircle className="w-4 h-4" />}
                                                </div>
                                                <p className={`text-xs mt-2 text-center ${i <= statusStep ? 'text-white' : 'text-white/30'}`}>
                                                    {step}
                                                </p>
                                                {i < steps.length - 1 && (
                                                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < statusStep ? 'bg-amber-500' : 'bg-neutral-800'
                                                        }`} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <h2 className="font-serif text-lg font-medium mb-4">Order Items</h2>
                                <div className="space-y-4">
                                    {order.order_items?.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 border-b border-neutral-800 pb-4 last:border-0 last:pb-0">
                                            <div className="relative w-20 h-20 bg-neutral-800 flex-shrink-0">
                                                {item.product_image && (
                                                    <Image
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.product_name}</p>
                                                {item.size && <p className="text-sm text-white/50">Size: {item.size}</p>}
                                                <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-amber-400">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Summary */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Payment Summary */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <h2 className="font-serif text-lg font-medium mb-4">Payment Summary</h2>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-white/70">
                                        <span>Subtotal</span>
                                        <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Shipping</span>
                                        <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                                    </div>
                                    <div className="border-t border-neutral-800 pt-2 flex justify-between font-medium text-lg">
                                        <span>Total</span>
                                        <span className="text-amber-400">₹{order.total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-2 text-sm text-white/50">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6">
                                <h2 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-amber-500" />
                                    Shipping Address
                                </h2>
                                {order.shipping_address && (
                                    <div className="text-sm text-white/70 space-y-1">
                                        <p className="font-medium text-white">{order.shipping_address.full_name}</p>
                                        <p>{order.shipping_address.street_address}</p>
                                        <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
                                        <p className="text-white/50">Phone: {order.shipping_address.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
