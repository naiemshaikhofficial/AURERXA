'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { updateOrderStatus, exportOrdersCsv, deleteOrder, getShipmentLabel } from '../actions'
import { getOrderTracking } from '../../actions'
import {
    Search, Filter, ChevronDown, Package, MapPin, CreditCard,
    Truck, Clock, CheckCircle, XCircle, X, Download, User as UserIcon, Trash2, ShieldAlert, Copy, Check, Phone, FileText, Printer
} from 'lucide-react'
import { InvoiceTemplate } from '@/components/invoice-template'
import { InternalNotes } from '@/components/admin/internal-notes'

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-400/10 text-amber-400',
    confirmed: 'bg-blue-400/10 text-blue-400',
    packed: 'bg-indigo-400/10 text-indigo-400',
    shipped: 'bg-sky-400/10 text-sky-400',
    delivered: 'bg-emerald-400/10 text-emerald-400',
    cancelled: 'bg-red-400/10 text-red-400',
}

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

export function OrdersClient({ initialOrders, total, adminRole }: { initialOrders: any[], total: number, adminRole: string | null }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State from URL or local (for immediate feedback)
    const [orders, setOrders] = useState(initialOrders)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [trackingInput, setTrackingInput] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [copied, setCopied] = useState(false)
    const [trackingData, setTrackingData] = useState<any>(null)
    const [loadingTracking, setLoadingTracking] = useState(false)
    const [labelUrl, setLabelUrl] = useState<string | null>(null)
    const [printType, setPrintType] = useState<'customer' | 'shipping' | null>(null)

    // Sync Props when they change (Server Refetch)
    useEffect(() => {
        setOrders(initialOrders)
        if (selectedOrder) {
            const updated = (initialOrders || []).find((o: any) => o.id === selectedOrder.id)
            if (updated) setSelectedOrder(updated)
        }
    }, [initialOrders])

    // Fetch tracking and label when order is selected
    useEffect(() => {
        if (selectedOrder?.tracking_number) {
            fetchTracking(selectedOrder.tracking_number)
            fetchLabel(selectedOrder.tracking_number)
        } else {
            setTrackingData(null)
            setLabelUrl(null)
        }
    }, [selectedOrder])

    const fetchTracking = async (awb: string) => {
        setLoadingTracking(true)
        try {
            const res = await getOrderTracking(awb)
            if (res.success) setTrackingData(res)
        } finally {
            setLoadingTracking(false)
        }
    }

    const fetchLabel = async (awb: string) => {
        const url = await getShipmentLabel(awb)
        setLabelUrl(url)
    }
    // URL State Helpers
    const currentStatus = searchParams.get('status') || 'all'
    const currentSearch = searchParams.get('search') || ''
    const currentPage = Number(searchParams.get('page')) || 1

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        if (key !== 'page') params.set('page', '1') // Reset page on filter change
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`)) return
        setUpdatingStatus(true)
        await updateOrderStatus(orderId, newStatus, trackingInput || undefined)

        // Optimistic Update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, tracking_number: trackingInput || o.tracking_number } : o))
        if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus, tracking_number: trackingInput || prev.tracking_number } : null)
        }

        setUpdatingStatus(false)
        setTrackingInput('')
        router.refresh() // Sync with server
    }

    const handleDelete = async () => {
        if (!selectedOrder || !confirm('Are you sure you want to PERMANENTLY delete this order? This action cannot be undone.')) return
        setIsDeleting(true)
        const res = await deleteOrder(selectedOrder.id)
        setIsDeleting(false)
        if (res.success) {
            setSelectedOrder(null)
            router.refresh()
        } else {
            alert('Failed to delete: ' + res.error)
        }
    }

    const handleExport = async () => {
        const csv = await exportOrdersCsv()
        if (!csv) return
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handlePrint = (type: 'customer' | 'shipping') => {
        setPrintType(type)
        // Shorter timeout since we don't need the user to "see" a preview anymore
        setTimeout(() => {
            window.print()
            setPrintType(null)
        }, 800)
    }

    const totalPages = Math.ceil(total / 20)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-white/40 text-sm mt-1">{total} total orders</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl text-sm hover:bg-[#D4AF37]/20 transition">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by order number..."
                        defaultValue={currentSearch}
                        onKeyDown={e => e.key === 'Enter' && updateFilters('search', e.currentTarget.value)}
                        onBlur={e => updateFilters('search', e.currentTarget.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => updateFilters('status', s)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${currentStatus === s ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table/Cards */}
            {orders.length === 0 ? (
                <div className="text-center py-12 text-white/30">No orders found</div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Order</th>
                                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">User</th>
                                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Items</th>
                                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Amount</th>
                                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Status</th>
                                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Date</th>
                                    <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-[#D4AF37]">#{order.order_number}</p>
                                            <p className="text-xs text-white/30">{order.payment_method || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.user ? (
                                                <>
                                                    <p className="text-sm text-white/80">{order.user.full_name}</p>
                                                    <p className="text-xs text-white/30">{order.user.email}</p>
                                                </>
                                            ) : (
                                                <span className="text-xs text-white/20">Guest / Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-white/60">{order.order_items?.length || 0} items</td>
                                        <td className="px-4 py-3 text-sm font-medium">₹{Number(order.total).toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-white/10 text-white/50'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-white/40">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            <br />
                                            <span className="text-white/20">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={order.status}
                                                onClick={e => e.stopPropagation()}
                                                onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none"
                                            >
                                                {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                                                    <option key={s} value={s} className="bg-[#1a1a1a]">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {orders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-[#111111] border border-white/5 rounded-xl p-4 active:bg-white/[0.02] transition"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-[#D4AF37]">#{order.order_number}</p>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_COLORS[order.status] || ''}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold">₹{Number(order.total).toLocaleString('en-IN')}</p>
                                    <p className="text-[11px] text-white/30">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                                </div>
                                {order.user && (
                                    <div className="mt-2 pt-2 border-t border-white/5 text-xs text-white/40">
                                        {order.user.email}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => updateFilters('page', String(p))}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${currentPage === p ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Order Detail Drawer */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="absolute right-0 top-0 h-screen w-full max-w-lg bg-[#111111] border-l border-white/5 flex flex-col animate-in slide-in-from-right-full duration-300">
                        <div className="flex-none bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                            <div>
                                <h3 className="text-lg font-semibold text-[#D4AF37]">#{selectedOrder.order_number}</h3>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePrint('customer')}
                                    className="px-3 py-1.5 bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                >
                                    <FileText className="w-3 h-3" /> Invoice
                                </button>
                                <button
                                    onClick={() => handlePrint('shipping')}
                                    className="px-3 py-1.5 bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                >
                                    <Truck className="w-3 h-3" /> Shipping
                                </button>
                                {labelUrl && (
                                    <a
                                        href={labelUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                    >
                                        <Download className="w-3 h-3" /> Carrier Label
                                    </a>
                                )}
                                <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                            {/* Status & Reasons */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-xs text-white/40 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Order Status
                                </p>
                                <div className="flex items-center gap-2 flex-wrap mb-4">
                                    {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                                            disabled={updatingStatus}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${selectedOrder.status === s ? STATUS_COLORS[s] : 'bg-white/5 text-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                {selectedOrder.status === 'pending' && (
                                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Awaiting Payment</p>
                                        <p className="text-xs text-white/60 leading-relaxed italic">
                                            {selectedOrder.payment_error_reason || 'Customer has initiated but not yet completed the payment transaction.'}
                                        </p>
                                    </div>
                                )}

                                {(selectedOrder.status === 'cancelled' || selectedOrder.cancellation_reason) && (
                                    <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Cancellation Detail</span>
                                        </div>
                                        <p className="text-sm text-white/70 italic">"{selectedOrder.cancellation_reason || 'No reason provided'}"</p>
                                        {selectedOrder.cancelled_at && (
                                            <p className="text-[10px] text-white/20 mt-1">at {new Date(selectedOrder.cancelled_at).toLocaleString()}</p>
                                        )}
                                    </div>
                                )}

                                {(selectedOrder.status === 'return_requested' || selectedOrder.return_reason) && (
                                    <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Truck className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Return ({selectedOrder.return_status || 'requested'})</span>
                                        </div>
                                        <p className="text-sm text-white/70 italic">"{selectedOrder.return_reason || 'No reason provided'}"</p>
                                        {selectedOrder.returned_at && (
                                            <p className="text-[10px] text-white/20 mt-1">requested at {new Date(selectedOrder.returned_at).toLocaleString()}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tracking Timeline (NEW) */}
                            {selectedOrder.tracking_number && (
                                <div className="bg-white/5 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-white/40 flex items-center gap-1 uppercase tracking-widest px-1">
                                            <Package className="w-3 h-3 text-[#D4AF37]" /> Tracking Timeline
                                        </p>
                                        <span className="text-[10px] font-mono text-[#D4AF37]/60 px-2 py-0.5 bg-[#D4AF37]/5 rounded">{selectedOrder.tracking_number}</span>
                                    </div>

                                    {loadingTracking ? (
                                        <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
                                    ) : trackingData ? (
                                        <div className="space-y-5">
                                            <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/10 rounded-xl p-4">
                                                <p className="text-[10px] text-white/40 uppercase mb-1 flex items-center gap-2">
                                                    <CreditCard className="w-3 h-3 opacity-50" /> Latest Milestone
                                                </p>
                                                <p className="text-sm font-bold text-[#D4AF37] uppercase tracking-wide">{trackingData.status}</p>
                                                {trackingData.estimatedDelivery && (
                                                    <p className="text-[10px] text-white/30 mt-2 italic flex items-center gap-1">
                                                        <Clock className="w-3 h-3 opacity-40" /> Est. Arrival: {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                                {trackingData.scans?.slice(0, 5).map((scan: any, i: number) => (
                                                    <div key={i} className="relative group">
                                                        <div className={cn(
                                                            "absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#121212] transition-colors",
                                                            i === 0 ? "bg-[#D4AF37] ring-4 ring-[#D4AF37]/20" : "bg-white/20"
                                                        )} />
                                                        <div className="flex flex-col gap-1">
                                                            <p className={cn("text-xs font-semibold uppercase tracking-wide transition-colors", i === 0 ? "text-white/90" : "text-white/40 group-hover:text-white/60")}>
                                                                {scan.status}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-[10px] text-white/20">
                                                                <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 opacity-40" /> {scan.location}</span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5 opacity-40" /> {new Date(scan.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            {scan.instructions && <p className="text-[9px] text-[#D4AF37]/40 italic mt-0.5 line-clamp-1">{scan.instructions}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-white/2 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] italic">Awaiting carrier updates</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Manual Tracking Link (Fallback/Non-Auto) */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><Truck className="w-3 h-3" /> External Tracking</p>
                                {selectedOrder.tracking_number ? (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-white/70 font-mono">{selectedOrder.tracking_number}</p>
                                        <button
                                            onClick={() => copyToClipboard(selectedOrder.tracking_number)}
                                            className="text-[10px] text-[#D4AF37] uppercase font-bold"
                                        >
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={trackingInput}
                                            onChange={e => setTrackingInput(e.target.value)}
                                            placeholder="Enter tracking ID"
                                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                                            disabled={!trackingInput}
                                            className="px-3 py-2 bg-[#D4AF37] text-black rounded-lg text-xs font-medium disabled:opacity-30"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* User Details (NEW) */}
                            {selectedOrder.user && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><UserIcon className="w-3 h-3" /> Customer Profile</p>
                                    <div className="text-sm text-white/80 space-y-1">
                                        <p className="font-medium text-[#D4AF37]">{selectedOrder.user.full_name || 'No Name'}</p>
                                        <p>{selectedOrder.user.email}</p>
                                        {selectedOrder.user.phone_number && <p className="text-white/50">{selectedOrder.user.phone_number}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Address */}
                            {selectedOrder.shipping_address && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-white/40 flex items-center gap-1"><MapPin className="w-3 h-3" /> Shipping Address</p>
                                        <button
                                            onClick={() => {
                                                const addr = selectedOrder.shipping_address
                                                const text = `${addr.full_name || addr.name}\n${addr.street_address || addr.address}\n${addr.city}, ${addr.state} ${addr.pincode}\nPhone: ${addr.phone}`
                                                copyToClipboard(text)
                                            }}
                                            className="text-[10px] text-[#D4AF37] hover:text-[#D4AF37]/80 flex items-center gap-1 transition-colors"
                                        >
                                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="text-sm text-white/60 space-y-1">
                                        <p className="font-semibold text-white/80">{selectedOrder.shipping_address.full_name || selectedOrder.shipping_address.name}</p>
                                        <p className="leading-relaxed">{selectedOrder.shipping_address.street_address || selectedOrder.shipping_address.address}</p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/40">{selectedOrder.shipping_address.city}</span>
                                            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/40">{selectedOrder.shipping_address.state}</span>
                                            <span className="px-2 py-0.5 bg-[#D4AF37]/10 rounded text-[10px] text-[#D4AF37] font-mono">{selectedOrder.shipping_address.pincode}</span>
                                        </div>
                                        {selectedOrder.shipping_address.phone && (
                                            <p className="text-white/40 text-xs pt-1 flex items-center gap-1 overflow-hidden">
                                                <Phone className="w-2.5 h-2.5 opacity-40" /> {selectedOrder.shipping_address.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-white/40 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Payment & Security</p>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                                        selectedOrder.payment_status === 'paid' ? "bg-emerald-500/10 text-emerald-400" :
                                            selectedOrder.payment_status === 'flagged_mismatch' ? "bg-red-500 text-white animate-pulse" :
                                                selectedOrder.payment_status === 'awaiting_refund' ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-white/5 text-white/30"
                                    )}>
                                        {selectedOrder.payment_status || 'awaiting'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                    <div><span className="text-white/40">Method:</span> <span className="text-white/70">{selectedOrder.payment_method || 'N/A'}</span></div>
                                    <div><span className="text-white/40">Attempts:</span> <span className="text-white/70">{selectedOrder.payment_attempts || 0}</span></div>

                                    {selectedOrder.payment_gateway_order_id && (
                                        <div className="col-span-2 text-[10px] text-white/30 pt-1 flex items-center justify-between border-t border-white/5">
                                            <span className="uppercase tracking-widest font-mono">Gateway Order ID:</span>
                                            <span className="text-white/50 select-all font-mono">{selectedOrder.payment_gateway_order_id}</span>
                                        </div>
                                    )}

                                    {selectedOrder.payment_id && (
                                        <div className="col-span-2 text-[10px] text-white/30 flex items-center justify-between">
                                            <span className="uppercase tracking-widest font-mono">Gateway Txn ID:</span>
                                            <span className="text-white/50 select-all font-mono">{selectedOrder.payment_id}</span>
                                        </div>
                                    )}

                                    {selectedOrder.payment_error_reason && (
                                        <div className="col-span-2 p-2 bg-red-500/5 border border-red-500/10 rounded text-[10px] text-red-400/80 italic">
                                            Last Error: {selectedOrder.payment_error_reason}
                                        </div>
                                    )}

                                    <div className="col-span-2 grid grid-cols-4 gap-2 border-t border-white/5 pt-3 mt-1">
                                        <div className="flex flex-col"><span className="text-[10px] text-white/30 uppercase">Subtotal</span><span className="text-white/70 italic text-xs">₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span></div>
                                        <div className="flex flex-col"><span className="text-[10px] text-white/30 uppercase">Shipping</span><span className="text-white/70 italic text-xs">₹{Number(selectedOrder.shipping || 0).toLocaleString('en-IN')}</span></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/30 uppercase">Privilege</span>
                                            <span className="text-primary italic text-xs flex items-center gap-1">
                                                {selectedOrder.coupon_code ? (
                                                    <>
                                                        <span className="opacity-50 select-all font-mono ">{selectedOrder.coupon_code}</span>
                                                        <span>-₹{Number(selectedOrder.coupon_discount || 0).toLocaleString('en-IN')}</span>
                                                    </>
                                                ) : (
                                                    '₹0'
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex flex-col"><span className="text-[10px] text-white/30 uppercase">Total</span><span className="font-bold text-[#D4AF37]">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-white/40 mb-3 flex items-center gap-1"><Package className="w-3 h-3" /> Items ({selectedOrder.order_items?.length || 0})</p>
                                <div className="space-y-2">
                                    {selectedOrder.order_items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                                            <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.product_image ? (
                                                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20"><Package className="w-4 h-4" /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.product_name}</p>
                                                <p className="text-xs text-white/40">Qty: {item.quantity} • Size: {item.size || 'N/A'}</p>
                                            </div>
                                            <p className="text-sm font-medium">₹{Number(item.price).toLocaleString('en-IN')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div className="text-center text-xs text-white/20 pt-2 pb-6">
                                Order placed: {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                            </div>

                            {/* Internal Notes */}
                            <InternalNotes entityType="order" entityId={selectedOrder.id} />

                            {/* Danger Zone */}
                            {adminRole === 'main_admin' && (
                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition text-sm font-medium"
                                    >
                                        {isDeleting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        Delete Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Hidden Printing Template Container */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { 
                        margin: 0.5cm; 
                        size: ${printType === 'shipping' ? '100mm 100mm' : 'portrait'}; 
                    }
                    body > *:not(#print-root) { display: none !important; }
                    #print-root { 
                        display: block !important;
                        width: 100% !important;
                        background: white !important;
                    }
                }
            `}} />

            {/* The actual Printable Content - Using Portal to body for absolute print reliability */}
            {/* We keep this off-screen for the user but fully "visible" for the browser's print engine */}
            {printType && typeof document !== 'undefined' && createPortal(
                <div id="print-root" className="fixed left-[-9999px] top-0 z-[99999] pointer-events-none overflow-hidden print:left-0 print:static print:w-full print:opacity-100">
                    <div className="flex flex-col items-center justify-start">
                        <div className={cn(
                            "bg-white",
                            printType === 'shipping' ? "w-[100mm]" : "w-full max-w-[800px]"
                        )}>
                            <InvoiceTemplate order={selectedOrder} type={printType} />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
