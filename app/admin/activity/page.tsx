'use client'

import React, { useEffect, useState } from 'react'
import { getActivityLogs } from '../actions'
import { Activity, User, Clock, Package, ShoppingCart, Shield, Tag, Settings, Search, Filter, Calendar, X } from 'lucide-react'

const ENTITY_ICONS: Record<string, any> = {
    order: ShoppingCart,
    product: Package,
    admin_user: Shield,
    coupon: Tag,
    gold_rate: Settings,
    user: User,
    tickets: Activity,
    repairs: Activity,
    contact_messages: Activity,
    custom_orders: Activity,
    service: Activity,
}

const ENTITY_COLORS: Record<string, string> = {
    order: 'bg-emerald-500/10 text-emerald-400',
    product: 'bg-blue-500/10 text-blue-400',
    admin_user: 'bg-purple-500/10 text-purple-400',
    coupon: 'bg-amber-500/10 text-amber-400',
    gold_rate: 'bg-[#D4AF37]/10 text-[#D4AF37]',
    user: 'bg-indigo-500/10 text-indigo-400',
    service: 'bg-pink-500/10 text-pink-400',
}

const ENTITY_TYPES = [
    { value: 'all', label: 'All' },
    { value: 'order', label: 'Orders' },
    { value: 'product', label: 'Products' },
    { value: 'user', label: 'Users' },
    { value: 'coupon', label: 'Coupons' },
    { value: 'gold_rate', label: 'Gold Rates' },
    { value: 'admin_user', label: 'Admin' },
    { value: 'service', label: 'Services' },
]

export default function ActivityPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [entityType, setEntityType] = useState('all')
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        loadLogs()
    }, [page, entityType, search, dateFrom, dateTo])

    const loadLogs = async () => {
        setLoading(true)
        const result = await getActivityLogs(
            page,
            entityType !== 'all' ? entityType : undefined,
            search || undefined,
            dateFrom || undefined,
            dateTo || undefined
        )
        setLogs(result.logs)
        setTotal(result.total)
        setLoading(false)
    }

    const handleSearch = () => {
        setPage(1)
        setSearch(searchInput)
    }

    const clearFilters = () => {
        setEntityType('all')
        setSearch('')
        setSearchInput('')
        setDateFrom('')
        setDateTo('')
        setPage(1)
    }

    const hasFilters = entityType !== 'all' || search || dateFrom || dateTo
    const totalPages = Math.ceil(total / 50)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Activity Logs</h1>
                    <p className="text-white/40 text-sm mt-1">{total} total activities</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition ${showFilters || hasFilters ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasFilters && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                    </button>
                    {hasFilters && (
                        <button onClick={clearFilters} className="p-2 text-white/30 hover:text-white transition" title="Clear filters">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-[#111111] border border-white/5 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by action..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-20 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                        />
                        <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg text-xs font-medium hover:bg-[#D4AF37]/20 transition">
                            Search
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Entity Filter */}
                        <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Entity Type</label>
                            <select
                                value={entityType}
                                onChange={e => { setEntityType(e.target.value); setPage(1) }}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 focus:outline-none"
                            >
                                {ENTITY_TYPES.map(t => (
                                    <option key={t.value} value={t.value} className="bg-[#1a1a1a]">{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filters */}
                        <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => { setDateTo(e.target.value); setPage(1) }}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Entity Type Quick Filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {ENTITY_TYPES.map(t => (
                    <button
                        key={t.value}
                        onClick={() => { setEntityType(t.value); setPage(1) }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${entityType === t.value ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                    {hasFilters ? 'No activities match your filters' : 'No activity recorded yet'}
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {logs.map(log => {
                            const Icon = ENTITY_ICONS[log.entity_type] || Activity
                            const colorClass = ENTITY_COLORS[log.entity_type] || 'bg-[#D4AF37]/10 text-[#D4AF37]'
                            return (
                                <div key={log.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-start gap-3 hover:border-white/10 transition">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass.split(' ')[0]}`}>
                                        <Icon className={`w-4 h-4 ${colorClass.split(' ')[1]}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/80">{log.action}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs text-white/30 flex items-center gap-1">
                                                <User className="w-3 h-3" />{log.profiles?.full_name || log.profiles?.email || 'System'}
                                            </span>
                                            <span className="text-xs text-white/20">•</span>
                                            <span className="text-xs text-white/30 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />{new Date(log.created_at).toLocaleString('en-IN')}
                                            </span>
                                            {log.entity_type && (
                                                <>
                                                    <span className="text-xs text-white/20">•</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colorClass}`}>
                                                        {log.entity_type.replace(/_/g, ' ')}
                                                    </span>
                                                </>
                                            )}
                                            {log.entity_id && (
                                                <>
                                                    <span className="text-xs text-white/20">•</span>
                                                    <span className="text-xs text-white/20 font-mono truncate">{log.entity_id.substring(0, 8)}...</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-30 transition"
                            >
                                Prev
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let p: number
                                if (totalPages <= 7) {
                                    p = i + 1
                                } else if (page <= 4) {
                                    p = i + 1
                                } else if (page >= totalPages - 3) {
                                    p = totalPages - 6 + i
                                } else {
                                    p = page - 3 + i
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition ${page === p ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                                    >
                                        {p}
                                    </button>
                                )
                            })}
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-30 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
