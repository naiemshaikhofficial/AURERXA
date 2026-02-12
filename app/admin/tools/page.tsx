'use client'

import React, { useState, useEffect } from 'react'
import { clearCache, getSystemHealth, getDatabaseStats } from './actions'
import {
    Server, Database, Zap, RefreshCw, Trash2, Activity,
    Box, ShoppingCart, Users, MessageSquare, Wrench
} from 'lucide-react'

export default function ToolsPage() {
    const [cachePath, setCachePath] = useState('')
    const [cacheTag, setCacheTag] = useState('')
    const [loading, setLoading] = useState(false)
    const [health, setHealth] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setRefreshing(true)
        const [h, s] = await Promise.all([getSystemHealth(), getDatabaseStats()])
        setHealth(h)
        setStats(s)
        setRefreshing(false)
    }

    const handleClearCache = async (type: 'path' | 'tag' | 'all') => {
        if (type === 'all' && !confirm('Are you sure you want to clear the entire site cache? This may cause temporary performance dips.')) return

        setLoading(true)
        const value = type === 'path' ? cachePath : type === 'tag' ? cacheTag : undefined
        const res = await clearCache(type, value)

        if (res.success) {
            alert(res.message || 'Cache cleared successfully')
            if (type === 'path') setCachePath('')
            if (type === 'tag') setCacheTag('')
        } else {
            alert(res.error || 'Failed to clear cache')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Tools</h1>
                <p className="text-white/40 text-sm mt-1">System utilities and health checks</p>
            </div>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-400" /> System Health
                        </h2>
                        <button
                            onClick={loadData}
                            disabled={refreshing}
                            className={`p-2 hover:bg-white/5 rounded-lg transition ${refreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-4 h-4 text-white/40" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Database className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-sm font-medium">Database Connection</p>
                                    <p className="text-xs text-white/40">{health?.status === 'healthy' ? 'Connected' : 'Issues Detected'}</p>
                                </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-amber-400" />
                                <div>
                                    <p className="text-sm font-medium">Response Latency</p>
                                    <p className="text-xs text-white/40">Round-trip time</p>
                                </div>
                            </div>
                            <p className="text-sm font-mono font-bold text-[#D4AF37]">
                                {health ? `${health.latency}ms` : '...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Database Stats */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Server className="w-5 h-5 text-purple-400" /> Database Statistics
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <StatItem icon={ShoppingCart} label="Orders" value={stats?.orders} color="text-emerald-400" bg="bg-emerald-400/10" />
                        <StatItem icon={Users} label="Users" value={stats?.users} color="text-blue-400" bg="bg-blue-400/10" />
                        <StatItem icon={Box} label="Products" value={stats?.products} color="text-[#D4AF37]" bg="bg-[#D4AF37]/10" />
                        <StatItem icon={MessageSquare} label="Reviews" value={stats?.reviews} color="text-pink-400" bg="bg-pink-400/10" />
                    </div>
                </div>
            </div>

            {/* Cache Management */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                    <Zap className="w-5 h-5 text-[#D4AF37]" /> Cache Management
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Path Revalidation */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white/70">Revalidate Path</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="/products/ring-1"
                                value={cachePath}
                                onChange={e => setCachePath(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition"
                            />
                            <button
                                onClick={() => handleClearCache('path')}
                                disabled={loading || !cachePath}
                                className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#D4AF37]/90 transition"
                            >
                                Run
                            </button>
                        </div>
                        <p className="text-xs text-white/30">Clears cache for a specific page URL.</p>
                    </div>

                    {/* Tag Revalidation */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white/70">Revalidate Tag</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="products"
                                value={cacheTag}
                                onChange={e => setCacheTag(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition"
                            />
                            <button
                                onClick={() => handleClearCache('tag')}
                                disabled={loading || !cacheTag}
                                className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#D4AF37]/90 transition"
                            >
                                Run
                            </button>
                        </div>
                        <p className="text-xs text-white/30">Clears all data associated with a cache tag.</p>
                    </div>

                    {/* Clear All */}
                    <div className="space-y-3 border-l border-white/5 md:pl-8">
                        <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
                        <button
                            onClick={() => handleClearCache('all')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20 transition"
                        >
                            <Trash2 className="w-4 h-4" /> Purge Everything
                        </button>
                        <p className="text-xs text-white/30">Revalidates the entire site layout. Use with caution.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatItem({ icon: Icon, label, value, color, bg }: any) {
    return (
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-lg font-bold">{value ?? '...'}</p>
                <p className="text-xs text-white/40">{label}</p>
            </div>
        </div>
    )
}
