'use client'

import React, { useState, useEffect } from 'react'
import { getMarketingSegments, broadcastMarketingMessage } from '@/app/admin/actions'
import { Megaphone, Users, Zap, Bell, Target, Layers, Layout, Send, Loader2, Sparkles, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function MarketingHubPage() {
    const [segments, setSegments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSegment, setSelectedSegment] = useState<any>(null)
    const [isBroadcasting, setIsBroadcasting] = useState(false)
    const [broadcastForm, setBroadcastForm] = useState({
        title: '',
        body: '',
        url: '/'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const data = await getMarketingSegments()
        setSegments(data)
        setLoading(false)
    }

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSegment) return

        setIsBroadcasting(true)
        const res = await broadcastMarketingMessage(
            selectedSegment.id,
            broadcastForm.title,
            broadcastForm.body,
            broadcastForm.url
        )

        if (res.success) {
            toast.success(`Broadcast sent to ${res.count} active subscribers in ${selectedSegment.name}`)
            setBroadcastForm({ title: '', body: '', url: '/' })
            setSelectedSegment(null)
        } else {
            toast.error(res.error || 'Failed to send broadcast')
        }
        setIsBroadcasting(false)
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
                        <Megaphone className="w-8 h-8 text-[#D4AF37]" />
                        Marketing Hub
                    </h1>
                    <p className="text-white/50 mt-1">Target specific user segments with personalized push notifications.</p>
                </div>
                <button className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37]/90 transition-all flex items-center gap-2 rounded-lg">
                    <Plus className="w-4 h-4" />
                    New Segment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Segments List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#D4AF37]" />
                        Active Segments
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {segments.map((segment) => (
                            <motion.div
                                key={segment.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedSegment(segment)}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer ${selectedSegment?.id === segment.id
                                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5'
                                        : 'bg-[#111111] border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${selectedSegment?.id === segment.id ? 'bg-[#D4AF37]/20' : 'bg-white/5'
                                        }`}>
                                        <Target className={`w-5 h-5 ${selectedSegment?.id === segment.id ? 'text-[#D4AF37]' : 'text-white/50'
                                            }`} />
                                    </div>
                                    <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/20">
                                        {segment.count} Users
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{segment.name}</h3>
                                <p className="text-xs text-white/40 leading-relaxed">{segment.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* AI Insights (Mock) */}
                    <div className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-32 h-32 text-[#D4AF37]" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-[#D4AF37] mb-4">
                                <Zap className="w-5 h-5 fill-[#D4AF37]" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Marketing Insight</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">High demand for Rose Gold pieces in Mumbai</h3>
                            <p className="text-sm text-white/50 max-w-lg">
                                Based on visitor intelligence from the last 48 hours, users from Maharashtra are interacting 40% more with the 'Imperial Rose' collection. Consider a targeted broadcast.
                            </p>
                            <button className="mt-6 text-xs font-bold text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]/30 pb-1 hover:border-[#D4AF37] transition-all">
                                Generate Campaign Concept
                            </button>
                        </div>
                    </div>
                </div>

                {/* Broadcast Sidebar */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedSegment ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-[#111111] border border-[#D4AF37]/30 rounded-2xl p-6 sticky top-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-white">Broadcast Action</h2>
                                    <button
                                        onClick={() => setSelectedSegment(null)}
                                        className="text-white/30 hover:text-white transition"
                                    >✕</button>
                                </div>

                                <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl mb-6">
                                    <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1">Targeting</p>
                                    <p className="text-sm font-medium text-white">{selectedSegment.name}</p>
                                </div>

                                <form onSubmit={handleBroadcast} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 px-0.5">Notification Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={broadcastForm.title}
                                            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                            placeholder="Luxury awaits..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 px-0.5">Message Content</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={broadcastForm.body}
                                            onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                                            placeholder="The latest bridal collection has arrived."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/20 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-1.5 px-0.5">Redirect URL</label>
                                        <input
                                            type="text"
                                            value={broadcastForm.url}
                                            onChange={(e) => setBroadcastForm({ ...broadcastForm, url: e.target.value })}
                                            placeholder="/collections/bridal"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/20"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isBroadcasting}
                                        className="w-full py-4 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#D4AF37]/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#D4AF37]/10"
                                    >
                                        {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Send Broadcast
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="bg-[#111111]/50 border border-white/5 border-dashed rounded-2xl p-12 text-center sticky top-8">
                                <Layout className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <h2 className="text-white/40 font-medium">Select a segment to begin a broadcast campaign</h2>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
