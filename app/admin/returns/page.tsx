'use client'

import React, { useState, useEffect } from 'react'
import { getAdminReturnRequests, updateReturnStatus, checkAdminRole } from '@/app/admin/actions'
import {
    RefreshCw, CheckCircle, XCircle, Clock, Truck,
    MessageSquare, User, Hash, IndianRupee,
    ArrowLeftRight, ExternalLink, Loader2, Search, Filter,
    BookOpen, ShieldCheck, ChevronDown, Package, ShieldAlert,
    PlayCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function AdminReturnsPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean, requestId: string, reason: string }>({
        isOpen: false,
        requestId: '',
        reason: ''
    })
    const [adminRole, setAdminRole] = useState<string>('')
    const [showGuide, setShowGuide] = useState(false)
    const [restockEnabled, setRestockEnabled] = useState(false)

    // Quick Analytics Calculation
    const analytics = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'requested').length,
        approved: requests.filter(r => ['approved', 'pickup_scheduled', 'received', 'inspected'].includes(r.status)).length,
        rejected: requests.filter(r => r.status === 'rejected').length
    }

    useEffect(() => {
        loadData()
        // Fetch admin role
        checkAdminRole().then(admin => {
            if (admin) setAdminRole(admin.role)
        })

        // ⚡ Supabase Realtime Listener
        const channel = supabase
            .channel('admin-returns-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'return_requests' }, () => {
                loadData()
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'return_requests' }, () => {
                loadData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const loadData = async () => {
        setLoading(true)
        const data = await getAdminReturnRequests()
        setRequests(data)
        setLoading(false)
    }

    const handleStatusUpdate = async (requestId: string, status: string, notes?: string) => {
        setUpdating(requestId)
        const res = await updateReturnStatus(requestId, status, notes, restockEnabled)
        if (res.success) {
            toast.success(`Return request ${status} successfully`)
            setRestockEnabled(false) // Reset after use
            loadData()
            if (status === 'rejected') setRejectionModal({ isOpen: false, requestId: '', reason: '' })
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
            case 'requested': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
            case 'approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            case 'pickup_scheduled': return 'text-sky-400 bg-sky-400/10 border-sky-400/20'
            case 'picked_up': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            case 'received': return 'text-violet-400 bg-violet-400/10 border-violet-400/20'
            case 'inspected': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
            case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20'
            case 'refunded': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
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

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Requests', value: analytics.total, icon: ArrowLeftRight, color: 'text-[#D4AF37]' },
                    { label: 'Pending Review', value: analytics.pending, icon: Clock, color: 'text-amber-400' },
                    { label: 'Approved/Active', value: analytics.approved, icon: CheckCircle, color: 'text-emerald-400' },
                    { label: 'Rejected', value: analytics.rejected, icon: XCircle, color: 'text-red-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#111111] border border-white/5 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Admin Return Handling Guide */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-sm font-bold text-white uppercase tracking-widest">Return Handling Guide</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {showGuide && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 pt-0 space-y-4 text-sm text-white/60">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl space-y-2">
                                        <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">✅ When to Approve</h4>
                                        <ul className="space-y-1 text-xs">
                                            <li>• Customer has unboxing video proof</li>
                                            <li>• Product is confirmed defective / wrong / damaged</li>
                                            <li>• Return is within 24-hour delivery window</li>
                                            <li>• HUID and hallmark stamps are intact</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl space-y-2">
                                        <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">❌ When to Reject</h4>
                                        <ul className="space-y-1 text-xs">
                                            <li>• No unboxing video or edited/partial video</li>
                                            <li>• Return window expired (24h from delivery)</li>
                                            <li>• Product seal broken / tampered before delivery</li>
                                            <li>• Weight mismatch / HUID mismatch detected</li>
                                            <li>• Buyer's remorse (not a valid return reason)</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">⚠️ Steps Before Approval</h4>
                                    <ol className="space-y-1 text-xs list-decimal pl-4">
                                        <li>Verify unboxing video is continuous and uncut</li>
                                        <li>Cross-check HUID on product with dispatch records</li>
                                        <li>Verify weight matches dispatch weight (±0.01g tolerance)</li>
                                        <li>Confirm issue type matches video evidence</li>
                                        <li>Approve → Delhivery reverse pickup auto-scheduled</li>
                                    </ol>
                                </div>
                                {adminRole === 'main_admin' && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
                                            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                                            Main Admin: Re-Approve Power
                                        </h4>
                                        <p className="text-xs">You can override a rejection and re-approve a return if the customer provides additional evidence or the initial rejection was in error. This action is logged.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                        <option value="requested">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="pickup_scheduled">Pickup Scheduled</option>
                        <option value="rejected">Rejected</option>
                        <option value="refunded">Refunded</option>
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
                                                {req.issue_type && (
                                                    <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold mt-1 block">
                                                        Issue: {req.issue_type.replace(/_/g, ' ')}
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

                                        {/* Evidence Section */}
                                        {(req.evidence_photos?.length > 0 || req.video_link) && (
                                            <div className="pt-4 mt-4 border-t border-white/5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-3">Evidence & Verification</label>
                                                <div className="flex flex-wrap gap-4">
                                                    {req.evidence_photos?.length > 0 && (
                                                        <div className="flex gap-2">
                                                            {req.evidence_photos.map((url: string, i: number) => (
                                                                <a
                                                                    key={i}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-16 h-16 rounded-lg border border-white/10 overflow-hidden hover:border-[#D4AF37] transition-all"
                                                                >
                                                                    <img src={url} alt={`Evidence ${i}`} className="w-full h-full object-cover" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {req.video_link && (
                                                        <a
                                                            href={req.video_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all"
                                                        >
                                                            <PlayCircle className="w-4 h-4" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Unboxing Video</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
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
                                        {/* Status Specific Actions */}
                                        {(req.status === 'received' || req.status === 'inspected') && (
                                            <div className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg border border-white/5">
                                                <input
                                                    type="checkbox"
                                                    id={`restock-${req.id}`}
                                                    checked={restockEnabled}
                                                    onChange={(e) => setRestockEnabled(e.target.checked)}
                                                    className="w-4 h-4 rounded border-white/20 bg-transparent text-[#D4AF37] focus:ring-0 focus:ring-offset-0"
                                                />
                                                <label htmlFor={`restock-${req.id}`} className="text-[10px] font-bold text-white/60 uppercase tracking-widest cursor-pointer">
                                                    Restock Inventory?
                                                </label>
                                            </div>
                                        )}

                                        {req.status === 'requested' && (
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
                                                    onClick={() => setRejectionModal({ isOpen: true, requestId: req.id, reason: '' })}
                                                    disabled={updating === req.id}
                                                    className="flex-1 lg:w-40 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {(req.status === 'approved' || req.status === 'pickup_scheduled') && (
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'picked_up')}
                                                disabled={updating === req.id}
                                                className="flex-1 lg:w-40 py-2.5 bg-sky-500/20 border border-sky-500/30 text-sky-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-sky-500/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Truck className="w-3.5 h-3.5" />
                                                Mark Picked Up
                                            </button>
                                        )}
                                        {req.status === 'picked_up' && (
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'received')}
                                                disabled={updating === req.id}
                                                className="flex-1 lg:w-40 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Package className="w-3.5 h-3.5" />
                                                Mark Received
                                            </button>
                                        )}
                                        {req.status === 'received' && (
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'inspected')}
                                                disabled={updating === req.id}
                                                className="flex-1 lg:w-40 py-2.5 bg-violet-500/20 border border-violet-500/30 text-violet-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-violet-500/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                Mark Inspected
                                            </button>
                                        )}
                                        {req.status === 'inspected' && (
                                            <div className="flex gap-2 w-full lg:w-auto">
                                                <button
                                                    onClick={() => handleStatusUpdate(req.id, 'refunded')}
                                                    disabled={updating === req.id}
                                                    className="flex-1 lg:w-40 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <IndianRupee className="w-3.5 h-3.5" />
                                                    Mark Refunded
                                                </button>
                                                <button
                                                    onClick={() => setRejectionModal({ isOpen: true, requestId: req.id, reason: '' })}
                                                    disabled={updating === req.id}
                                                    className="flex-1 lg:w-40 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Reject Refund
                                                </button>
                                            </div>
                                        )}
                                        {req.status === 'rejected' && adminRole === 'main_admin' && (
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'approved', 'Re-approved by Main Admin after review')}
                                                disabled={updating === req.id}
                                                className="flex-1 lg:w-40 py-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#D4AF37]/30 transition-all flex items-center justify-center gap-2"
                                            >
                                                {updating === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                Re-Approve
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
            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111111] border border-[#D4AF37]/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Reject Return Request</h3>
                        <p className="text-sm text-white/50 mb-6">Please provide a reason for rejection. This will be visible to the customer.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-1.5">Rejection Reason</label>
                                <textarea
                                    autoFocus
                                    rows={4}
                                    value={rejectionModal.reason}
                                    onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                                    placeholder="e.g., Unboxing video is missing or product seal is broken..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/10 resize-none font-medium"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setRejectionModal({ isOpen: false, requestId: '', reason: '' })}
                                    className="flex-1 py-3 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(rejectionModal.requestId, 'rejected', rejectionModal.reason)}
                                    disabled={!rejectionModal.reason.trim() || updating === rejectionModal.requestId}
                                    className="flex-[2] py-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating === rejectionModal.requestId ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
