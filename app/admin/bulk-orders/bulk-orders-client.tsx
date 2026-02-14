'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
    Package, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle,
    MessageSquare, Trash2, Building2, Phone, Mail, FileText, RefreshCw
} from 'lucide-react'
import { updateBulkOrderStatus, deleteBulkOrder, getAdminBulkOrders } from '../actions'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <Clock className="w-3 h-3" /> },
    quoted: { label: 'Quoted', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: <MessageSquare className="w-3 h-3" /> },
    confirmed: { label: 'Confirmed', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle className="w-3 h-3" /> },
    rejected: { label: 'Rejected', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <XCircle className="w-3 h-3" /> },
}

export function BulkOrdersClient({
    initialOrders,
    total,
    adminRole
}: {
    initialOrders: any[]
    total: number
    adminRole: string | null
}) {
    const [orders, setOrders] = useState(initialOrders)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [loading, setLoading] = useState(false)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const refreshOrders = async (filter?: string) => {
        setLoading(true)
        try {
            const data = await getAdminBulkOrders(filter || statusFilter, 1)
            setOrders(data.orders)
        } catch {
            toast.error('Failed to refresh')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId)
        try {
            const result = await updateBulkOrderStatus(orderId, newStatus)
            if (result.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
                toast.success(`Status updated to ${newStatus}`)
            } else {
                toast.error(result.error || 'Failed to update')
            }
        } catch {
            toast.error('Failed to update status')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDelete = async (orderId: string) => {
        if (!confirm('Delete this bulk order inquiry?')) return
        try {
            const result = await deleteBulkOrder(orderId)
            if (result.success) {
                setOrders(prev => prev.filter(o => o.id !== orderId))
                toast.success('Deleted')
            } else {
                toast.error(result.error || 'Failed to delete')
            }
        } catch {
            toast.error('Failed to delete')
        }
    }

    const handleFilterChange = (filter: string) => {
        setStatusFilter(filter)
        refreshOrders(filter)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
                        <Package className="w-6 h-6 text-[#D4AF37]" />
                        Bulk Orders
                    </h1>
                    <p className="text-sm text-white/50 mt-1">{total} total inquiries</p>
                </div>
                <button
                    onClick={() => refreshOrders()}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'quoted', 'confirmed', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => handleFilterChange(s)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${statusFilter === s
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20'
                            : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                            }`}
                    >
                        {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 text-white/40">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No bulk order inquiries found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => {
                        const isExpanded = expandedId === order.id
                        const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                        const items = order.bulk_order_items || []
                        const totalRetail = items.reduce((sum: number, i: any) => sum + (Number(i.retail_price) * i.quantity), 0)
                        const totalPieces = items.reduce((sum: number, i: any) => sum + i.quantity, 0)

                        return (
                            <div key={order.id} className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
                                {/* Header Row */}
                                <div
                                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <Building2 className="w-4 h-4 text-[#D4AF37]" />
                                            <span className="text-sm font-medium text-white truncate">{order.business_name}</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${config.color}`}>
                                                {config.icon}
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[11px] text-white/40">
                                            <span>{order.contact_name}</span>
                                            <span>•</span>
                                            <span>{items.length} products</span>
                                            <span>•</span>
                                            <span>{totalPieces} pcs</span>
                                            <span>•</span>
                                            <span>₹{totalRetail.toLocaleString('en-IN')} retail</span>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-white/30 hidden sm:block">
                                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-white/5 p-4 space-y-5">
                                        {/* Contact Info */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="flex items-center gap-2 text-xs text-white/60">
                                                <Mail className="w-3.5 h-3.5 text-white/30" />
                                                <a href={`mailto:${order.email}`} className="hover:text-[#D4AF37] transition-colors">{order.email}</a>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-white/60">
                                                <Phone className="w-3.5 h-3.5 text-white/30" />
                                                <a href={`tel:${order.phone}`} className="hover:text-[#D4AF37] transition-colors">{order.phone}</a>
                                            </div>
                                            {order.gst_number && (
                                                <div className="flex items-center gap-2 text-xs text-white/60">
                                                    <FileText className="w-3.5 h-3.5 text-white/30" />
                                                    GST: {order.gst_number}
                                                </div>
                                            )}
                                            {order.message && (
                                                <div className="flex items-center gap-2 text-xs text-white/60">
                                                    <MessageSquare className="w-3.5 h-3.5 text-white/30" />
                                                    {order.message}
                                                </div>
                                            )}
                                        </div>

                                        {/* Items Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-white/5 text-white/30">
                                                        <th className="text-left py-2 pr-4">Product</th>
                                                        <th className="text-right py-2 px-3">Qty</th>
                                                        <th className="text-right py-2 px-3">Retail Price</th>
                                                        <th className="text-right py-2 px-3">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item: any) => (
                                                        <tr key={item.id} className="border-b border-white/[0.03]">
                                                            <td className="py-2 pr-4">
                                                                <div className="flex items-center gap-3">
                                                                    {item.product_image && (
                                                                        <div className="w-8 h-8 rounded overflow-hidden relative flex-shrink-0">
                                                                            <Image
                                                                                src={item.product_image}
                                                                                alt={item.product_name}
                                                                                fill
                                                                                className="object-cover"
                                                                                sizes="32px"
                                                                                unoptimized
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span className="text-white/80 truncate">{item.product_name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="text-right py-2 px-3 text-white/60">{item.quantity}</td>
                                                            <td className="text-right py-2 px-3 text-white/60">₹{Number(item.retail_price).toLocaleString('en-IN')}</td>
                                                            <td className="text-right py-2 px-3 text-white/80">₹{(Number(item.retail_price) * item.quantity).toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="border-t border-white/10">
                                                        <td colSpan={2} className="py-2 text-white/50 font-medium">Total</td>
                                                        <td className="text-right py-2 px-3 text-white/50">{totalPieces} pcs</td>
                                                        <td className="text-right py-2 px-3 text-[#D4AF37] font-medium">₹{totalRetail.toLocaleString('en-IN')}</td>
                                                    </tr>
                                                    {order.quoted_total && (
                                                        <tr>
                                                            <td colSpan={3} className="py-1 text-emerald-400/70 text-[10px]">Quoted Total</td>
                                                            <td className="text-right py-1 text-emerald-400 font-medium">₹{Number(order.quoted_total).toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    )}
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* Admin Notes */}
                                        {order.admin_notes && (
                                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                                                <p className="text-[10px] text-white/30 mb-1">Admin Notes</p>
                                                <p className="text-xs text-white/60">{order.admin_notes}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                                            <span className="text-[10px] text-white/30 uppercase tracking-wider mr-2">Update Status:</span>
                                            {['pending', 'quoted', 'confirmed', 'rejected'].map(s => {
                                                const sc = STATUS_CONFIG[s]
                                                const isActive = order.status === s
                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, s) }}
                                                        disabled={isActive || updatingId === order.id}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${isActive
                                                            ? `${sc.color} cursor-default`
                                                            : 'bg-white/[0.03] text-white/40 border-white/5 hover:bg-white/[0.06] cursor-pointer'
                                                            }`}
                                                    >
                                                        {updatingId === order.id ? '...' : sc.label}
                                                    </button>
                                                )
                                            })}
                                            {(adminRole === 'main_admin' || adminRole === 'support_admin') && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(order.id) }}
                                                    className="ml-auto px-3 py-1.5 rounded-lg text-[10px] font-medium text-red-400/60 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
