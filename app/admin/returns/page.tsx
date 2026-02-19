'use client'

import React, { useState, useEffect } from 'react'
import { getAdminReturnRequests, updateReturnStatus } from '@/app/admin/actions'
import {
    RefreshCw, CheckCircle, XCircle, Clock, Truck,
    MessageSquare, User, Hash, IndianRupee,
    ArrowLeftRight, ExternalLink, Loader2, Search, Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminReturnsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const data = await getAdminReturnRequests()
        setRequests(data)
        setLoading(false)
    }

    const handleStatusUpdate = async (requestId: string, status: 'approved' | 'rejected' | 'completed') => {
        setUpdating(requestId)
        const res = await updateReturnStatus(requestId, status)
        if (res.success) {
            toast.success(`Return request ${status} successfully`)
            loadData()
        } else {
            toast.error(res.error || `Failed to update status to ${status}`)
        }
        setUpdating(null)
    }

    const filteredRequests = requests.filter(req => {
        const matchesSearch =
            req.orders?.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterStatus === 'all' || req.status === filterStatus
        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
            case 'approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20'
            case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            default: return 'text-white/40 bg-white/5 border-white/10'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ArrowLeftRight className="w-8 h-8 text-[#D4AF37]" />
                        Return Management
                    </h1>
                    <p className="text-white/50 mt-1">Review, approve, and manage customer return & exchange requests.</p>
                </div>
                <button
                    onClick={loadData}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by Order #, Customer Name, or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111111] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 bg-[#111111] border border-white/5 rounded-xl px-3 py-1">
                    <Filter className="w-4 h-4 text-white/30" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent text-sm text-white focus:outline-none py-2 cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved / In Transit</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredRequests.map((req) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#D4AF37]/30 transition-all"
                        >
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    {/* Left: Info */}
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                            <span className="text-xs text-white/40 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">Customer</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white">
                                                        {req.profiles?.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{req.profiles?.full_name || 'Anonymous'}</p>
                                                        <p className="text-[10px] text-white/40">{req.profiles?.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">Order Details</label>
                                                <p className="text-sm font-medium text-white flex items-center gap-2">
                                                    <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                    {req.orders?.order_number}
                                                </p>
                                                <p className="text-[10px] text-[#D4AF37] font-bold">₹{req.orders?.total?.toLocaleString('en-IN')}</p>
                                            </div>

                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1">Reason</label>
                                                <p className="text-sm text-white/80 line-clamp-2 italic">"{req.reason}"</p>
                                                {req.type && (
                                                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold mt-1 block">
                                                        Type: {req.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {req.admin_notes && (
                                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-start gap-3">
                                                <MessageSquare className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                                <p className="text-xs text-white/60">Admin Note: {req.admin_notes}</p>
                                            </div>
                                        )}

                                        {req.tracking_number && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                <Truck className="w-4 h-4 text-blue-400" />
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                    Return Waybill: {req.tracking_number}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-row lg:flex-col justify-end gap-2 shrink-0">
                                        {req.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(req.id, 'approved')}
                                                    disabled={updating === req.id}
                                                    className="flex-1 lg:w-40 py-2.5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#D4AF37]/90 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {updating === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                    Approve & Pickup
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                                    disabled={updating === req.id}
                                                    className="flex-1 lg:w-40 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'approved' && (
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'completed')}
                                                disabled={updating === req.id}
                                                className="flex-1 lg:w-40 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Mark Received
                                            </button>
                                        )}
                                        <a
                                            href={`/admin/orders?search=${req.orders?.order_number}`}
                                            className="p-2.5 bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-lg transition-all"
                                            title="View Original Order"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredRequests.length === 0 && (
                    <div className="p-20 text-center bg-[#111111] rounded-2xl border border-dashed border-white/10">
                        <ArrowLeftRight className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white/60">No return requests found</h3>
                        <p className="text-sm text-white/30">Requests matching your filters will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
