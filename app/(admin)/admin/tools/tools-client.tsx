'use client'

import React, { useState } from 'react'
import { clearCache } from './actions'
import { Server, Database, Zap, RefreshCw, Trash2, Activity, Box, ShoppingCart, Users, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ToolsClient({ initialHealth, initialStats }: any) {
    const [cachePath, setCachePath] = useState('')
    const [cacheTag, setCacheTag] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleClearCache = async (type: 'path' | 'tag' | 'all') => {
        if (type === 'all' && !confirm('Clear entire site cache?')) return
        setLoading(true)
        const value = type === 'path' ? cachePath : type === 'tag' ? cacheTag : undefined
        const res = await clearCache(type, value)
        if (res.success) {
            alert('Cleared')
            if (type === 'path') setCachePath('')
            if (type === 'tag') setCacheTag('')
        } else {
            alert('Failed')
        }
        setLoading(false)
    }

    const refreshStats = () => {
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Tools</h1>
                <p className="text-white/40 text-sm mt-1">System utilities and health checks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400" /> System Health</h2>
                        <button onClick={refreshStats} className="p-2 hover:bg-white/5 rounded-lg transition"><RefreshCw className="w-4 h-4 text-white/40" /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3"><Database className="w-5 h-5 text-blue-400" /><div><p className="text-sm font-medium">Database</p><p className="text-xs text-white/40">{initialHealth?.status === 'healthy' ? 'Connected' : 'Issues'}</p></div></div>
                            <div className={`w-3 h-3 rounded-full ${initialHealth?.status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400" /><div><p className="text-sm font-medium">Latency</p><p className="text-xs text-white/40">Round-trip</p></div></div>
                            <p className="text-sm font-mono font-bold text-[#D4AF37]">{initialHealth ? `${initialHealth.latency}ms` : '...'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Server className="w-5 h-5 text-purple-400" /> Database Statistics</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <StatItem icon={ShoppingCart} label="Orders" value={initialStats?.orders} color="text-emerald-400" bg="bg-emerald-400/10" />
                        <StatItem icon={Users} label="Users" value={initialStats?.users} color="text-blue-400" bg="bg-blue-400/10" />
                        <StatItem icon={Box} label="Products" value={initialStats?.products} color="text-[#D4AF37]" bg="bg-[#D4AF37]/10" />
                        <StatItem icon={MessageSquare} label="Reviews" value={initialStats?.reviews} color="text-pink-400" bg="bg-pink-400/10" />
                    </div>
                </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-6"><Zap className="w-5 h-5 text-[#D4AF37]" /> Cache Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white/70">Revalidate Path</h3>
                        <div className="flex gap-2">
                            <input placeholder="/products/ring-1" value={cachePath} onChange={e => setCachePath(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition" />
                            <button onClick={() => handleClearCache('path')} disabled={loading || !cachePath} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Run</button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white/70">Revalidate Tag</h3>
                        <div className="flex gap-2">
                            <input placeholder="products" value={cacheTag} onChange={e => setCacheTag(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition" />
                            <button onClick={() => handleClearCache('tag')} disabled={loading || !cacheTag} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">Run</button>
                        </div>
                    </div>
                    <div className="space-y-3 border-l border-white/5 md:pl-8">
                        <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
                        <button onClick={() => handleClearCache('all')} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20 transition"><Trash2 className="w-4 h-4" /> Purge Everything</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatItem({ icon: Icon, label, value, color, bg }: any) {
    return (
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
            <div><p className="text-lg font-bold">{value ?? '...'}</p><p className="text-xs text-white/40">{label}</p></div>
        </div>
    )
}
