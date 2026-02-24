'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getReturnRequests } from '@/app/actions'
import { Loader2, Package, ArrowLeft, Clock, CheckCircle, Truck, RefreshCw, AlertCircle, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ReturnsPortal() {
    const [returns, setReturns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const data = await getReturnRequests()
            setReturns(data)
            setLoading(false)
        }
        load()
    }, [])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'requested': return Clock
            case 'approved': return CheckCircle
            case 'pickup_scheduled': return Truck
            case 'picked_up': return Package
            case 'received': return RefreshCw
            case 'refunded': return CheckCircle
            case 'rejected': return AlertCircle
            default: return Clock
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'refunded': return 'text-emerald-500 bg-emerald-500/10'
            case 'rejected': return 'text-destructive bg-destructive/10'
            case 'requested': return 'text-amber-500 bg-amber-500/10'
            default: return 'text-primary bg-primary/10'
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

            <main className="pt-24 pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <Link href="/account" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-2 mb-4 transition-colors">
                                <ArrowLeft className="w-3 h-3" />
                                Back to Account
                            </Link>
                            <h1 className="text-4xl font-serif font-bold">Returns & Exchanges</h1>
                            <p className="text-muted-foreground mt-2">Track your return requests and pickup status.</p>
                        </div>
                        <Link
                            href="/account/orders"
                            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            Start a New Return
                        </Link>
                    </div>

                    {returns.length === 0 ? (
                        <div className="bg-card border border-border p-12 text-center rounded-sm">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-serif font-medium mb-2">No return requests found</h2>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                                Returns can be initiated from your order details page within 24 hours of delivery.
                            </p>
                            <Link href="/account/orders" className="text-primary hover:text-primary/80 text-sm font-bold uppercase tracking-widest border-b border-primary/30 pb-1">
                                View Your Orders
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {returns.map((ret, index) => {
                                const StatusIcon = getStatusIcon(ret.status)
                                return (
                                    <motion.div
                                        key={ret.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group bg-card border border-border overflow-hidden hover:border-primary/30 transition-all"
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${getStatusColor(ret.status)}`}>
                                                        <StatusIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order #{ret.orders.order_number}</span>
                                                            <span className="text-muted-foreground/30">•</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Requested {new Date(ret.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="text-lg font-serif font-bold text-foreground capitalize mt-1">
                                                            {ret.status.replace('_', ' ')}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {ret.tracking_number && (
                                                        <a
                                                            href={`https://www.delhivery.com/track/package/${ret.tracking_number}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="px-4 py-2 border border-border text-[10px] uppercase tracking-widest font-bold hover:bg-muted transition-colors flex items-center gap-2"
                                                        >
                                                            <Truck className="w-3.5 h-3.5" />
                                                            Track Pickup
                                                        </a>
                                                    )}
                                                    <Link
                                                        href={`/account/orders/${ret.order_id}`}
                                                        className="px-4 py-2 bg-muted text-foreground text-[10px] uppercase tracking-widest font-bold hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
                                                    >
                                                        Order Details
                                                        <ChevronRight className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Issue Type</p>
                                                    <p className="text-sm font-medium text-foreground capitalize">{ret.issue_type.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Reason</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-1" title={ret.reason}>{ret.reason}</p>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Return Value</p>
                                                    <p className="text-sm font-bold text-primary">₹{ret.orders.total.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            {ret.status === 'requested' && (
                                                <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-sm flex items-start gap-3">
                                                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        Our quality control team is currently reviewing your request. Once approved, we will automatically schedule a Delhivery reverse pickup.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    <div className="mt-16 p-8 border border-border bg-card/50 text-center">
                        <h2 className="text-xl font-serif font-medium mb-4 italic">The AURERXA Promise</h2>
                        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Every piece of AURERXA jewelry is a work of art. If there is a legitimate quality issue, we take full responsibility. Our automated return process is designed to be seamless, with priority pickups and instant quality inspection at our main facility.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
