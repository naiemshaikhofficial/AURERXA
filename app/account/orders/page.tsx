'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getOrders } from '@/app/actions'
import { Loader2, Package, ChevronRight } from 'lucide-react'

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const data = await getOrders()
            setOrders(data)
            setLoading(false)
        }
        load()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-emerald-400 bg-emerald-500/10'
            case 'shipped': return 'text-blue-400 bg-blue-500/10'
            case 'confirmed': return 'text-primary bg-primary/10'
            case 'cancelled': return 'text-destructive bg-destructive/10'
            default: return 'text-muted-foreground bg-muted'
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

            <main className="pt-16 md:pt-24 pb-24 min-h-[70vh]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                        <Link href="/account" className="hover:text-primary">Account</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-foreground">Orders</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-center">My Orders</h1>
                    <p className="text-muted-foreground text-center mb-12">{orders.length} orders placed</p>

                    {orders.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground/20" />
                            <p className="text-xl text-muted-foreground mb-8">No orders yet</p>
                            <Link href="/collections" className="text-primary hover:text-primary/80">
                                Start Shopping →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/account/orders/${order.id}`}
                                    className="block bg-card border border-border p-6 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Order #{order.order_number}</p>
                                            <p className="text-xs text-muted-foreground/80">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-primary">₹{order.total.toLocaleString('en-IN')}</p>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
