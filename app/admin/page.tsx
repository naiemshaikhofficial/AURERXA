'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { getDashboardStats, getRevenueChart, getOrdersChart, getRecentOrders, getTopProducts, getActivityLogs, getCancelledOrderDetails, checkAdminRole, deleteOrder, getOrdersByStatus, updateOrderStatus } from './actions'
import {
    DollarSign, ShoppingCart, Package, Users, AlertTriangle,
    TrendingUp, Clock, Truck, XCircle, CheckCircle, Calendar, ChevronDown,
    ChevronUp, Eye, Trash2, Edit3, X, ArrowRight
} from 'lucide-react'
import Image from 'next/image'

type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'
type PanelType = 'confirmed' | 'pending' | 'cancelled' | 'orders' | 'products' | 'users' | 'shipped' | 'delivered' | null

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-400/10',
    packed: 'text-blue-300 bg-blue-300/10',
    shipped: 'text-blue-400 bg-blue-400/10',
    delivered: 'text-emerald-400 bg-emerald-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
}

const STATUS_OPTIONS = ['pending', 'packed', 'shipped', 'delivered', 'cancelled']

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>({
        confirmedRevenue: 0, filteredRevenue: 0, pendingRevenue: 0, cancelledRevenue: 0,
        totalOrders: 0, filteredOrders: 0, pendingOrders: 0, shippedOrders: 0,
        deliveredOrders: 0, cancelledOrders: 0, totalProducts: 0, totalUsers: 0, lowStockProducts: []
    })
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [ordersData, setOrdersData] = useState<any[]>([])
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [activityLogs, setActivityLogs] = useState<any[]>([])
    const [cancelledDetails, setCancelledDetails] = useState<any[]>([])
    const [adminRole, setAdminRole] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [datePreset, setDatePreset] = useState<DatePreset>('month')
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [showDatePicker, setShowDatePicker] = useState(false)

    // Panel state
    const [activePanel, setActivePanel] = useState<PanelType>(null)
    const [panelData, setPanelData] = useState<any[]>([])
    const [panelLoading, setPanelLoading] = useState(false)
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
    const [editStatus, setEditStatus] = useState('')

    const isMainAdmin = adminRole === 'main_admin'
    const canEdit = adminRole === 'main_admin' || adminRole === 'support_admin'

    const getDateRange = (preset: DatePreset) => {
        const now = new Date()
        let from = new Date()
        const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        switch (preset) {
            case 'today': from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); break
            case 'yesterday': from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0); to.setDate(to.getDate() - 1); break
            case 'week': from.setDate(now.getDate() - 7); from.setHours(0, 0, 0, 0); break
            case 'month': from = new Date(now.getFullYear(), now.getMonth(), 1); break
            case 'year': from = new Date(now.getFullYear(), 0, 1); break
            case 'custom': return { from: customFrom || undefined, to: customTo || undefined }
        }
        return { from: from.toISOString(), to: to.toISOString() }
    }

    useEffect(() => { loadData() }, [datePreset, customFrom, customTo])

    const loadData = async () => {
        setLoading(true)
        const { from, to } = getDateRange(datePreset)
        const [s, r, o, recent, top, activity, cancelled, role] = await Promise.all([
            getDashboardStats(from, to),
            getRevenueChart('monthly'),
            getOrdersChart('monthly'),
            getRecentOrders(),
            getTopProducts(),
            getActivityLogs(1, 'all', '', '', ''),
            getCancelledOrderDetails(),
            checkAdminRole()
        ])
        if (s) setStats(s)
        if (r) setRevenueData(r)
        if (o) setOrdersData(o)
        if (recent) setRecentOrders(recent as any[])
        if (top) setTopProducts(top as any[])
        if ((activity as any)?.logs) setActivityLogs((activity as any).logs)
        if (cancelled) setCancelledDetails(cancelled as any[])
        if (role) setAdminRole((role as any).role || '')
        setLoading(false)
    }

    // Panel data loader
    const openPanel = useCallback(async (panel: PanelType) => {
        if (activePanel === panel) { setActivePanel(null); return }
        setActivePanel(panel)
        setPanelLoading(true)
        setPanelData([])
        try {
            let data: any[] = []
            switch (panel) {
                case 'confirmed': data = await getOrdersByStatus('confirmed'); break
                case 'pending': data = await getOrdersByStatus('pending'); break
                case 'cancelled': data = await getOrdersByStatus('cancelled'); break
                case 'orders': data = await getOrdersByStatus('all'); break
                case 'shipped': data = await getOrdersByStatus('shipped'); break
                case 'delivered': data = await getOrdersByStatus('delivered'); break
                default: break
            }
            setPanelData(data)
        } catch (e) { console.error(e) }
        setPanelLoading(false)
    }, [activePanel])

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const res = await updateOrderStatus(orderId, newStatus)
        if (res?.success) {
            setPanelData(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            setEditingOrderId(null)
            loadData()
        } else { alert(res?.error || 'Failed to update') }
    }

    const handleDelete = async (orderId: string, orderNumber: string) => {
        if (!confirm(`Permanently delete order ${orderNumber}? This cannot be undone.`)) return
        const res = await deleteOrder(orderId)
        if (res?.success) {
            setPanelData(prev => prev.filter(o => o.id !== orderId))
            loadData()
        } else { alert(res?.error || 'Failed to delete') }
    }

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)

    const maxRevenue = Math.max(...revenueData.map(d => d.value), 1)
    const maxOrders = Math.max(...ordersData.map(d => d.total), 1)

    const datePresets: { value: DatePreset; label: string }[] = [
        { value: 'today', label: 'Today' }, { value: 'yesterday', label: 'Yesterday' },
        { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' }, { value: 'custom', label: 'Custom Range' },
    ]

    // Panel title mapping
    const panelTitles: Record<string, string> = {
        confirmed: 'Confirmed Orders (Shipped + Delivered + Packed)',
        pending: 'Pending Orders — Awaiting Confirmation',
        cancelled: 'Cancelled Orders — Lost Revenue',
        orders: 'All Orders',
        shipped: 'Shipped Orders — In Transit',
        delivered: 'Delivered Orders — Completed',
        products: 'Products',
        users: 'Users',
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-white/40 text-sm mt-1">Welcome back to AURERXA Admin • <span className="text-[#D4AF37] capitalize">{adminRole?.replace('_', ' ') || 'Loading...'}</span></p>
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
                                    <button key={p.value} onClick={() => { setDatePreset(p.value); if (p.value !== 'custom') setShowDatePicker(false) }}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition ${datePreset === p.value ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            {datePreset === 'custom' && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70" />
                                    <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70" />
                                    <button onClick={() => setShowDatePicker(false)} className="w-full py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium">Apply</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Revenue Cards - Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <ClickableStatCard
                    active={activePanel === 'confirmed'}
                    onClick={() => openPanel('confirmed')}
                    imgSrc="https://img.icons8.com/?size=100&id=B5w0V2fjjZ38&format=png&color=000000"
                    label="Confirmed Revenue" value={formatCurrency(stats?.confirmedRevenue || 0)}
                    sub={`${formatCurrency(stats?.filteredRevenue || 0)} this period`}
                    color="text-[#D4AF37]" bg="bg-[#D4AF37]/10" activeBorder="border-[#D4AF37]/50"
                />
                <ClickableStatCard
                    active={activePanel === 'pending'}
                    onClick={() => openPanel('pending')}
                    imgSrc="https://img.icons8.com/?size=100&id=102455&format=png&color=000000"
                    label="Pending Revenue" value={formatCurrency(stats?.pendingRevenue || 0)}
                    sub={`${stats?.pendingOrders || 0} orders awaiting`}
                    color="text-amber-400" bg="bg-amber-400/10" activeBorder="border-amber-400/50"
                />
                <ClickableStatCard
                    active={activePanel === 'cancelled'}
                    onClick={() => openPanel('cancelled')}
                    imgSrc="https://img.icons8.com/?size=100&id=ec5nnM2s1CdY&format=png&color=000000"
                    label="Lost Revenue" value={formatCurrency(stats?.cancelledRevenue || 0)}
                    sub={`${stats?.cancelledOrders || 0} cancelled`}
                    color="text-red-400" bg="bg-red-400/10" activeBorder="border-red-400/50"
                />
                <ClickableStatCard
                    active={activePanel === 'orders'}
                    onClick={() => openPanel('orders')}
                    imgSrc="https://img.icons8.com/?size=100&id=nmdLxlZq4cQi&format=png&color=000000"
                    label="Total Orders" value={stats?.totalOrders || 0}
                    sub={`${stats?.filteredOrders || 0} this period`}
                    color="text-emerald-400" bg="bg-emerald-400/10" activeBorder="border-emerald-400/50"
                />
            </div>

            {/* Expandable Panel - After Row 1 */}
            {activePanel && ['confirmed', 'pending', 'cancelled', 'orders'].includes(activePanel) && (
                <OrderDetailPanel
                    title={panelTitles[activePanel]}
                    data={panelData}
                    loading={panelLoading}
                    onClose={() => setActivePanel(null)}
                    formatCurrency={formatCurrency}
                    canEdit={canEdit}
                    isMainAdmin={isMainAdmin}
                    editingOrderId={editingOrderId}
                    editStatus={editStatus}
                    onEditStart={(id, status) => { setEditingOrderId(id); setEditStatus(status) }}
                    onEditCancel={() => setEditingOrderId(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                    setEditStatus={setEditStatus}
                    panelType={activePanel}
                />
            )}

            {/* Secondary Stats - Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <ClickableStatCard
                    active={activePanel === 'products'}
                    onClick={() => { window.location.href = '/admin/products' }}
                    imgSrc="https://img.icons8.com/?size=100&id=12091&format=png&color=000000"
                    label="Products" value={stats?.totalProducts || 0}
                    sub={`${stats?.lowStockProducts?.length || 0} low stock`}
                    color="text-blue-400" bg="bg-blue-400/10" activeBorder="border-blue-400/50"
                    linkHint="→ Products Page"
                />
                <ClickableStatCard
                    active={activePanel === 'users'}
                    onClick={() => { window.location.href = '/admin/users' }}
                    imgSrc="https://img.icons8.com/?size=100&id=IbG1lmsRkQI2&format=png&color=000000"
                    label="Users" value={stats?.totalUsers || 0} sub="Registered"
                    color="text-purple-400" bg="bg-purple-400/10" activeBorder="border-purple-400/50"
                    linkHint="→ Users Page"
                />
                <ClickableStatCard
                    active={activePanel === 'shipped'}
                    onClick={() => openPanel('shipped')}
                    imgSrc="https://img.icons8.com/?size=100&id=HG4lwDHJcYg3&format=png&color=000000"
                    label="Shipped" value={stats?.shippedOrders || 0} sub="In transit"
                    color="text-blue-400" bg="bg-blue-400/10" activeBorder="border-blue-400/50"
                    mini
                />
                <ClickableStatCard
                    active={activePanel === 'delivered'}
                    onClick={() => openPanel('delivered')}
                    imgSrc="https://img.icons8.com/?size=100&id=urubQ4JdZpyy&format=png&color=000000"
                    label="Delivered" value={stats?.deliveredOrders || 0} sub="Completed"
                    color="text-emerald-400" bg="bg-emerald-400/10" activeBorder="border-emerald-400/50"
                    mini
                />
            </div>

            {/* Expandable Panel - After Row 2 */}
            {activePanel && ['shipped', 'delivered'].includes(activePanel) && (
                <OrderDetailPanel
                    title={panelTitles[activePanel]}
                    data={panelData}
                    loading={panelLoading}
                    onClose={() => setActivePanel(null)}
                    formatCurrency={formatCurrency}
                    canEdit={canEdit}
                    isMainAdmin={isMainAdmin}
                    editingOrderId={editingOrderId}
                    editStatus={editStatus}
                    onEditStart={(id, status) => { setEditingOrderId(id); setEditStatus(status) }}
                    onEditCancel={() => setEditingOrderId(null)}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                    setEditStatus={setEditStatus}
                    panelType={activePanel}
                />
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue Chart */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <div className="w-4 h-4 relative">
                                <Image src="https://img.icons8.com/?size=100&id=7WvHWmLeJRQB&format=png&color=000000" alt="Revenue Trend" fill className="object-contain" style={{ filter: 'invert(1)' }} unoptimized />
                            </div>
                            Revenue Trend (Confirmed Only)
                        </h3>
                    </div>
                    <div className="h-48 flex items-end gap-1">
                        {revenueData.length > 0 ? revenueData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full relative group">
                                    <div className="w-full bg-gradient-to-t from-[#D4AF37]/20 to-[#D4AF37]/60 rounded-t-md transition-all hover:from-[#D4AF37]/30 hover:to-[#D4AF37]/80"
                                        style={{ height: `${Math.max((d.value / maxRevenue) * 160, 4)}px` }} />
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
                            <div className="w-4 h-4 relative">
                                <Image src="https://img.icons8.com/?size=100&id=SBrvJmrbcplL&format=png&color=000000" alt="Order Volume" fill className="object-contain" style={{ filter: 'invert(1)' }} unoptimized />
                            </div>
                            Order Volume
                        </h3>
                    </div>
                    <div className="h-48 flex items-end gap-1">
                        {ordersData.length > 0 ? ordersData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full relative group">
                                    <div className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-400/60 rounded-t-md transition-all hover:from-emerald-500/30 hover:to-emerald-400/80"
                                        style={{ height: `${Math.max((d.total / maxOrders) * 160, 4)}px` }} />
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
                        <AlertTriangle className="w-4 h-4" /> Low Stock Alerts ({stats.lowStockProducts.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {stats.lowStockProducts.slice(0, 6).map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition" onClick={() => window.location.href = '/admin/products'}>
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/40 text-xs overflow-hidden">
                                    {p.image_url ? <Image src={p.image_url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized /> : <Package className="w-5 h-5" />}
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

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold">Recent Orders</h3>
                        <a href="/admin/orders" className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></a>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.07] transition cursor-pointer" onClick={() => openPanel('orders')}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                        <ShoppingCart className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{order.order_number}</p>
                                        <p className="text-xs text-white/40">{order.profiles?.full_name || 'Guest'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                                    <p className={`text-[10px] uppercase font-medium ${order.status === 'delivered' ? 'text-emerald-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-amber-400'}`}>{order.status}</p>
                                </div>
                            </div>
                        )) : <p className="text-center text-white/20 text-sm py-4">No recent orders</p>}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 md:p-6">
                    <h3 className="text-base font-semibold mb-4">Top Selling</h3>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? topProducts.map((p: any, i: number) => (
                            <div key={p.id} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 -mx-1.5 transition" onClick={() => window.location.href = '/admin/products'}>
                                <div className="font-bold text-white/20 w-4">{i + 1}</div>
                                <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {p.image_url ? <Image src={p.image_url} alt="" fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Package className="w-4 h-4" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-white/90">{p.name}</p>
                                    <p className="text-xs text-white/40">{p.sales} sold</p>
                                </div>
                            </div>
                        )) : <p className="text-center text-white/20 text-sm py-4">No data yet</p>}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold">Recent Activity</h3>
                    <a href="/admin/activity" className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></a>
                </div>
                <div className="space-y-0">
                    {activityLogs.length > 0 ? activityLogs.map((log: any, i: number) => (
                        <div key={log.id} className="flex gap-4 py-3 border-b border-white/5 last:border-0 last:pb-0 first:pt-0">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-2" />
                                {i !== activityLogs.length - 1 && <div className="w-px h-full bg-white/5 mt-2" />}
                            </div>
                            <div>
                                <p className="text-sm text-white/80">
                                    <span className="font-medium text-white">{log.profiles?.full_name || 'Admin'}</span> {log.action}
                                </p>
                                <p className="text-xs text-white/30 mt-0.5">
                                    {new Date(log.created_at).toLocaleString()} • {log.entity_type}
                                </p>
                            </div>
                        </div>
                    )) : <p className="text-center text-white/20 text-sm py-4">No recent activity</p>}
                </div>
            </div>
        </div>
    )
}

// =============== CLICKABLE STAT CARD ===============
function ClickableStatCard({ active, onClick, imgSrc, label, value, sub, color, bg, activeBorder, linkHint, mini }: any) {
    return (
        <button
            onClick={onClick}
            className={`text-left w-full bg-[#111111] border rounded-2xl ${mini ? 'p-3' : 'p-4 md:p-5'} transition-all duration-200 group relative overflow-hidden
                ${active ? `${activeBorder} shadow-lg` : 'border-white/5 hover:border-white/15'}
                hover:scale-[1.02] active:scale-[0.98]`}
        >
            {/* Active indicator bar */}
            {active && <div className={`absolute top-0 left-0 right-0 h-0.5 ${bg?.replace('/10', '')}`} />}

            <div className="flex items-center justify-between mb-2">
                <div className={`${mini ? 'w-7 h-7' : 'w-9 h-9'} ${bg} rounded-xl flex items-center justify-center`}>
                    {imgSrc && (
                        <div className={`${mini ? 'w-4 h-4' : 'w-5 h-5'} relative`}>
                            <Image src={imgSrc} alt={label} fill className="object-contain" style={{ filter: 'invert(1)' }} unoptimized />
                        </div>
                    )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform duration-200 ${active ? 'rotate-180 text-white/50' : 'group-hover:text-white/40'}`} />
            </div>

            <p className={`${mini ? 'text-lg' : 'text-xl md:text-2xl'} font-bold tracking-tight`}>{value}</p>
            <p className="text-xs text-white/40 mt-0.5">{label}</p>
            {sub && <p className="text-[11px] text-white/25 mt-0.5">{sub}</p>}
            {linkHint && <p className="text-[10px] text-[#D4AF37]/60 mt-1 group-hover:text-[#D4AF37] transition">{linkHint}</p>}
        </button>
    )
}

// =============== ORDER DETAIL PANEL ===============
function OrderDetailPanel({ title, data, loading, onClose, formatCurrency, canEdit, isMainAdmin, editingOrderId, editStatus, onEditStart, onEditCancel, onStatusUpdate, onDelete, setEditStatus, panelType }: any) {
    const borderColor = panelType === 'cancelled' ? 'border-red-500/20' : panelType === 'pending' ? 'border-amber-400/20' : panelType === 'confirmed' ? 'border-[#D4AF37]/20' : 'border-white/10'

    return (
        <div className={`bg-[#111111] border ${borderColor} rounded-2xl p-4 md:p-6 animate-in slide-in-from-top-2 duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/80">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">{data.length} orders</span>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition"><X className="w-4 h-4 text-white/40" /></button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <p className="text-center text-white/20 text-sm py-8">No orders found</p>
            ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] uppercase font-semibold text-white/30 tracking-wider border-b border-white/5 sticky top-0 bg-[#111111] z-10">
                        <div className="col-span-2">Order</div>
                        <div className="col-span-2">Customer</div>
                        <div className="col-span-2">Items</div>
                        <div className="col-span-1">Amount</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {data.map((order: any) => (
                        <div key={order.id} className="grid grid-cols-12 gap-2 px-3 py-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl transition items-center group">
                            {/* Order # */}
                            <div className="col-span-2">
                                <p className="text-sm font-semibold text-white/90">{order.order_number}</p>
                                {order.tracking_number && <p className="text-[10px] text-white/30 mt-0.5">📦 {order.tracking_number}</p>}
                            </div>

                            {/* Customer */}
                            <div className="col-span-2">
                                <p className="text-sm text-white/80 truncate">{order.profiles?.full_name || 'Guest'}</p>
                                <p className="text-[10px] text-white/30 truncate">{order.profiles?.email || ''}</p>
                            </div>

                            {/* Items */}
                            <div className="col-span-2">
                                <div className="flex flex-wrap gap-1">
                                    {order.order_items?.slice(0, 2).map((item: any, idx: number) => (
                                        <span key={idx} className="text-[10px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                            {item.products?.name || 'Item'} ×{item.quantity}
                                        </span>
                                    ))}
                                    {(order.order_items?.length || 0) > 2 && <span className="text-[10px] text-white/30">+{order.order_items.length - 2} more</span>}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="col-span-1">
                                <p className={`text-sm font-bold ${order.status === 'cancelled' ? 'text-red-400 line-through' : 'text-white/90'}`}>
                                    {formatCurrency(order.total)}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                                {editingOrderId === order.id ? (
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="text-xs bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-white/80 w-full"
                                    >
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                                    </select>
                                ) : (
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'text-white/40 bg-white/5'}`}>
                                        {order.status}
                                    </span>
                                )}
                            </div>

                            {/* Date */}
                            <div className="col-span-2">
                                <p className="text-xs text-white/50">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                <p className="text-[10px] text-white/25">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                                {editingOrderId === order.id ? (
                                    <>
                                        <button onClick={() => onStatusUpdate(order.id, editStatus)} className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition" title="Save">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={onEditCancel} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 rounded-lg transition" title="Cancel">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {canEdit && (
                                            <button onClick={() => onEditStart(order.id, order.status)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#D4AF37] rounded-lg transition" title="Edit Status">
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <a href={`/admin/orders`} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition" title="View Details">
                                            <Eye className="w-3.5 h-3.5" />
                                        </a>
                                        {isMainAdmin && (
                                            <button onClick={() => onDelete(order.id, order.order_number)} className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-lg transition" title="Delete (Main Admin)">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
