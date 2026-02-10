'use client'

import React, { useEffect, useState } from 'react'
import { getDashboardStats, getRevenueChart, getOrdersChart } from './actions'
import {
    DollarSign, ShoppingCart, Package, Users, AlertTriangle,
    TrendingUp, Clock, Truck, XCircle, CheckCircle, Calendar, ChevronDown
} from 'lucide-react'

type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [ordersData, setOrdersData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [datePreset, setDatePreset] = useState<DatePreset>('month')
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)

    const getDateRange = (preset: DatePreset) => {
        const now = new Date()
        let from = new Date()
        const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

        switch (preset) {
            case 'today':
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
                break
            case 'yesterday':
                from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0)
                to.setDate(to.getDate() - 1)
                break
            case 'week':
                from.setDate(now.getDate() - 7)
                from.setHours(0, 0, 0, 0)
                break
            case 'month':
                from = new Date(now.getFullYear(), now.getMonth(), 1)
                break
            case 'year':
                from = new Date(now.getFullYear(), 0, 1)
                break
            case 'custom':
                return { from: customFrom || undefined, to: customTo || undefined }
        }
        return { from: from.toISOString(), to: to.toISOString() }
    }

    useEffect(() => {
        loadData()
    }, [datePreset, customFrom, customTo])

    const loadData = async () => {
        setLoading(true)
        const { from, to } = getDateRange(datePreset)
        const [s, r, o] = await Promise.all([
            getDashboardStats(from, to),
            getRevenueChart('monthly'),
            getOrdersChart('monthly'),
        ])
        setStats(s)
        setRevenueData(r)
        setOrdersData(o)
        setLoading(false)
    }

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)

    const maxRevenue = Math.max(...revenueData.map(d => d.value), 1)
    const maxOrders = Math.max(...ordersData.map(d => d.total), 1)

    const datePresets: { value: DatePreset; label: string }[] = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' },
    ]

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-white/40 text-sm mt-1">Welcome back to AURERXA Admin</p>
                </div>

                {/* Date Filter */}
                <div className="relative">
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:bg-white/10 transition"
                    >
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <span>{datePresets.find(p => p.value === datePreset)?.label}</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showDatePicker && (
                        <div className="absolute right-0 top-12 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-3 z-50">
                            <div className="grid grid-cols-2 gap-1.5 mb-3">
                                {datePresets.map(p => (
                                    <button
                                        key={p.value}
                                        onClick={() => {
                                            setDatePreset(p.value)
                                            if (p.value !== 'custom') setShowDatePicker(false)
                                        }}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition ${datePreset === p.value
                                                ? 'bg-[#D4AF37] text-black'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            {datePreset === 'custom' && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    <input
                                        type="date"
                                        value={customFrom}
                                        onChange={e => setCustomFrom(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70"
                                    />
                                    <input
                                        type="date"
                                        value={customTo}
                                        onChange={e => setCustomTo(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70"
                                    />
                                    <button
                                        onClick={() => setShowDatePicker(false)}
                                        className="w-full py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} sub={`${formatCurrency(stats?.filteredRevenue || 0)} this period`} color="text-[#D4AF37]" bg="bg-[#D4AF37]/10" />
                <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders || 0} sub={`${stats?.filteredOrders || 0} this period`} color="text-emerald-400" bg="bg-emerald-400/10" />
                <StatCard icon={Package} label="Products" value={stats?.totalProducts || 0} sub={`${stats?.lowStockProducts?.length || 0} low stock`} color="text-blue-400" bg="bg-blue-400/10" />
                <StatCard icon={Users} label="Users" value={stats?.totalUsers || 0} sub="Registered" color="text-purple-400" bg="bg-purple-400/10" />
            </div>

            {/* Order Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniCard icon={Clock} label="Pending" value={stats?.pendingOrders || 0} color="text-amber-400" />
                <MiniCard icon={Truck} label="Shipped" value={stats?.shippedOrders || 0} color="text-blue-400" />
                <MiniCard icon={CheckCircle} label="Delivered" value={stats?.deliveredOrders || 0} color="text-emerald-400" />
                <MiniCard icon={XCircle} label="Cancelled" value={stats?.cancelledOrders || 0} color="text-red-400" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue Chart */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                            Revenue Trend
                        </h3>
                    </div>
                    <div className="h-48 flex items-end gap-1">
                        {revenueData.length > 0 ? revenueData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full relative group">
                                    <div
                                        className="w-full bg-gradient-to-t from-[#D4AF37]/20 to-[#D4AF37]/60 rounded-t-md transition-all hover:from-[#D4AF37]/30 hover:to-[#D4AF37]/80"
                                        style={{ height: `${Math.max((d.value / maxRevenue) * 160, 4)}px` }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 px-2 py-1 rounded text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                        {formatCurrency(d.value)}
                                    </div>
                                </div>
                                <span className="text-[10px] text-white/30 truncate w-full text-center">{d.label}</span>
                            </div>
                        )) : (
                            <div className="flex-1 flex items-center justify-center text-white/20 text-sm">No data</div>
                        )}
                    </div>
                </div>

                {/* Orders Chart */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-emerald-400" />
                            Order Volume
                        </h3>
                    </div>
                    <div className="h-48 flex items-end gap-1">
                        {ordersData.length > 0 ? ordersData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full relative group">
                                    <div
                                        className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-400/60 rounded-t-md transition-all hover:from-emerald-500/30 hover:to-emerald-400/80"
                                        style={{ height: `${Math.max((d.total / maxOrders) * 160, 4)}px` }}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-white/10 px-2 py-1 rounded text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                        {d.total} orders
                                    </div>
                                </div>
                                <span className="text-[10px] text-white/30 truncate w-full text-center">{d.label}</span>
                            </div>
                        )) : (
                            <div className="flex-1 flex items-center justify-center text-white/20 text-sm">No data</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {stats?.lowStockProducts?.length > 0 && (
                <div className="bg-[#111111] border border-red-500/20 rounded-2xl p-4 md:p-6">
                    <h3 className="text-sm font-medium text-red-400 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4" />
                        Low Stock Alerts ({stats.lowStockProducts.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.lowStockProducts.slice(0, 6).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/40 text-xs overflow-hidden">
                                    {p.image_url ? (
                                        <img src={p.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Package className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{p.name}</p>
                                    <p className="text-xs text-red-400">{p.stock} left in stock</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: any) {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 md:p-5 hover:border-white/10 transition group">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                </div>
            </div>
            <p className="text-xl md:text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
            {sub && <p className="text-[11px] text-white/25 mt-0.5">{sub}</p>}
        </div>
    )
}

function MiniCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
            <div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[11px] text-white/40">{label}</p>
            </div>
        </div>
    )
}
