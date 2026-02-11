'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { getAdminOrders, updateOrderStatus, exportOrdersCsv, deleteOrder, checkAdminRole } from '../actions'
import {
    Search, Filter, ChevronDown, Package, MapPin, CreditCard,
    Truck, Clock, CheckCircle, XCircle, X, Download, User as UserIcon, Trash2, ShieldAlert
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-400/10 text-amber-400',
    confirmed: 'bg-blue-400/10 text-blue-400',
    packed: 'bg-indigo-400/10 text-indigo-400',
    shipped: 'bg-sky-400/10 text-sky-400',
    delivered: 'bg-emerald-400/10 text-emerald-400',
    cancelled: 'bg-red-400/10 text-red-400',
}

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [trackingInput, setTrackingInput] = useState('')
    const [adminRole, setAdminRole] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        checkAdminRole().then(res => setAdminRole(res?.role || null))
    }, [])

    const loadOrders = useCallback(async () => {
        setLoading(true)
        const result = await getAdminOrders(statusFilter, undefined, undefined, search || undefined, page)
        setOrders(result.orders)
        setTotal(result.total)
        setLoading(false)
    }, [statusFilter, search, page])

    useEffect(() => { loadOrders() }, [loadOrders])

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`)) return
        setUpdatingStatus(true)
        await updateOrderStatus(orderId, newStatus, trackingInput || undefined)
        await loadOrders()
        if (selectedOrder?.id === orderId) {
            setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus, tracking_number: trackingInput || prev.tracking_number } : null)
        }
        setUpdatingStatus(false)
        setTrackingInput('')
    }

    const handleDelete = async () => {
        if (!selectedOrder || !confirm('Are you sure you want to PERMANENTLY delete this order? This action cannot be undone.')) return
        setIsDeleting(true)
        const res = await deleteOrder(selectedOrder.id)
        setIsDeleting(false)
        if (res.success) {
            setSelectedOrder(null)
            loadOrders()
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
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1) }}
                            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${statusFilter === s ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table/Cards */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
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
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${page === p ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
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
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-white/5 overflow-y-auto animate-in slide-in-from-right-full duration-300">
                        <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-[#D4AF37]">#{selectedOrder.order_number}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 space-y-5">
                            {/* Status */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-white/40 mb-2">Status</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                                            disabled={updatingStatus}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedOrder.status === s ? STATUS_COLORS[s] : 'bg-white/5 text-white/30 hover:bg-white/10'
                                                }`}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tracking */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><Truck className="w-3 h-3" /> Tracking</p>
                                {selectedOrder.tracking_number ? (
                                    <p className="text-sm text-white/70 font-mono">{selectedOrder.tracking_number}</p>
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
                                    <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Shipping Address</p>
                                    <div className="text-sm text-white/60 space-y-0.5">
                                        <p className="font-medium text-white/80">{selectedOrder.shipping_address.full_name || selectedOrder.shipping_address.name}</p>
                                        <p>{selectedOrder.shipping_address.street_address || selectedOrder.shipping_address.address}</p>
                                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}</p>
                                        {selectedOrder.shipping_address.phone && <p className="text-white/40">{selectedOrder.shipping_address.phone}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Payment */}
                            <div className="bg-white/5 rounded-xl p-4">
                                <p className="text-xs text-white/40 mb-2 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Payment</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-white/40">Method:</span> <span className="text-white/70">{selectedOrder.payment_method || 'N/A'}</span></div>
                                    <div><span className="text-white/40">Subtotal:</span> <span className="text-white/70">₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span></div>
                                    <div><span className="text-white/40">Shipping:</span> <span className="text-white/70">₹{Number(selectedOrder.shipping || 0).toLocaleString('en-IN')}</span></div>
                                    <div><span className="text-white/40">Total:</span> <span className="font-bold text-[#D4AF37]">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span></div>
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
        </div>
    )
}
