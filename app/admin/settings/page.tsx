'use client'

import React, { useEffect, useState } from 'react'
import {
    getAdminGoldRates, updateGoldRate,
    getAdminCoupons, createCoupon, deleteCoupon,
    getAdminList, updateAdminRole, removeAdmin, checkAdminRole
} from '../actions'
import {
    CircleDollarSign, Tag, Shield, Save, Plus, Trash2, Crown, HeadphonesIcon, UserPlus, X
} from 'lucide-react'

type Tab = 'rates' | 'coupons' | 'admins'

export default function SettingsPage() {
    const [tab, setTab] = useState<Tab>('rates')
    const [rates, setRates] = useState<any[]>([])
    const [coupons, setCoupons] = useState<any[]>([])
    const [admins, setAdmins] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentRole, setCurrentRole] = useState('')
    const [editingRates, setEditingRates] = useState<Record<string, string>>({})
    const [showCouponForm, setShowCouponForm] = useState(false)
    const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_discount: '', usage_limit: '' })
    const [showAdminForm, setShowAdminForm] = useState(false)
    const [newAdminId, setNewAdminId] = useState('')
    const [newAdminRole, setNewAdminRole] = useState('staff')

    useEffect(() => {
        checkAdminRole().then(r => { if (r) setCurrentRole(r.role) })
        loadData()
    }, [tab])

    const loadData = async () => {
        setLoading(true)
        if (tab === 'rates') {
            const r = await getAdminGoldRates()
            setRates(r)
            const initial: Record<string, string> = {}
            r.forEach((rate: any) => { initial[rate.id] = String(rate.rate) })
            setEditingRates(initial)
        } else if (tab === 'coupons') {
            const c = await getAdminCoupons()
            setCoupons(c)
        } else {
            const a = await getAdminList()
            setAdmins(a)
        }
        setLoading(false)
    }

    const handleRateUpdate = async (id: string) => {
        const value = editingRates[id]
        if (!value) return
        await updateGoldRate(id, parseFloat(value))
        loadData()
    }

    const handleCreateCoupon = async () => {
        if (!newCoupon.code || !newCoupon.discount_value) return
        await createCoupon({
            code: newCoupon.code.toUpperCase(),
            discount_type: newCoupon.discount_type,
            discount_value: parseFloat(newCoupon.discount_value),
            min_order_value: newCoupon.min_order_value ? parseFloat(newCoupon.min_order_value) : 0,
            max_discount: newCoupon.max_discount ? parseFloat(newCoupon.max_discount) : null,
            usage_limit: newCoupon.usage_limit ? parseInt(newCoupon.usage_limit) : null,
        })
        setShowCouponForm(false)
        setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_discount: '', usage_limit: '' })
        loadData()
    }

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm('Delete this coupon?')) return
        await deleteCoupon(id)
        loadData()
    }

    const handleRoleChange = async (userId: string, role: string) => {
        await updateAdminRole(userId, role)
        loadData()
    }

    const handleRemoveAdmin = async (userId: string) => {
        if (!confirm('Remove this admin?')) return
        await removeAdmin(userId)
        loadData()
    }

    const handleAddAdmin = async () => {
        if (!newAdminId) return
        await updateAdminRole(newAdminId, newAdminRole)
        setShowAdminForm(false)
        setNewAdminId('')
        loadData()
    }

    const tabs = [
        { id: 'rates' as Tab, label: 'Metal Rates', icon: CircleDollarSign },
        { id: 'coupons' as Tab, label: 'Coupons', icon: Tag },
        ...(currentRole === 'main_admin' ? [{ id: 'admins' as Tab, label: 'Admin Roles', icon: Shield }] : []),
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-white/40 text-sm mt-1">Configure your store</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Metal Rates */}
                    {tab === 'rates' && (
                        <div className="space-y-3">
                            {rates.map(rate => (
                                <div key={rate.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{rate.purity}</p>
                                        <p className="text-xs text-white/30">Last updated: {new Date(rate.updated_at).toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white/40">₹</span>
                                        <input
                                            type="number"
                                            value={editingRates[rate.id] || ''}
                                            onChange={e => setEditingRates(prev => ({ ...prev, [rate.id]: e.target.value }))}
                                            className="w-28 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]/30"
                                        />
                                        <button
                                            onClick={() => handleRateUpdate(rate.id)}
                                            className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Coupons */}
                    {tab === 'coupons' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowCouponForm(!showCouponForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" /> New Coupon
                            </button>

                            {showCouponForm && (
                                <div className="bg-[#111111] border border-white/5 rounded-xl p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Code (e.g. SAVE20)" value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))}
                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none uppercase" />
                                        <select value={newCoupon.discount_type} onChange={e => setNewCoupon(p => ({ ...p, discount_type: e.target.value }))}
                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                                            <option value="percentage" className="bg-[#1a1a1a]">Percentage (%)</option>
                                            <option value="fixed" className="bg-[#1a1a1a]">Fixed (₹)</option>
                                        </select>
                                        <input type="number" placeholder="Discount value" value={newCoupon.discount_value} onChange={e => setNewCoupon(p => ({ ...p, discount_value: e.target.value }))}
                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none" />
                                        <input type="number" placeholder="Min order ₹" value={newCoupon.min_order_value} onChange={e => setNewCoupon(p => ({ ...p, min_order_value: e.target.value }))}
                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none" />
                                        <input type="number" placeholder="Max discount ₹" value={newCoupon.max_discount} onChange={e => setNewCoupon(p => ({ ...p, max_discount: e.target.value }))}
                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none" />
                                        <input type="number" placeholder="Usage limit" value={newCoupon.usage_limit} onChange={e => setNewCoupon(p => ({ ...p, usage_limit: e.target.value }))}
                                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleCreateCoupon} className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium">Create</button>
                                        <button onClick={() => setShowCouponForm(false)} className="px-4 py-2 bg-white/5 text-white/50 rounded-lg text-sm">Cancel</button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {coupons.length === 0 ? (
                                    <div className="text-center py-12 text-white/30">No coupons</div>
                                ) : coupons.map(c => (
                                    <div key={c.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-mono font-bold text-[#D4AF37]">{c.code}</p>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${c.is_active ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                                    {c.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/40 mt-0.5">
                                                {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} off
                                                {c.min_order_value > 0 && ` • Min ₹${c.min_order_value}`}
                                                {c.usage_limit && ` • ${c.used_count}/${c.usage_limit} used`}
                                            </p>
                                        </div>
                                        <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-red-400/50 hover:text-red-400 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Roles */}
                    {tab === 'admins' && currentRole === 'main_admin' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowAdminForm(!showAdminForm)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-sm font-medium"
                            >
                                <UserPlus className="w-4 h-4" /> Add Admin
                            </button>

                            {showAdminForm && (
                                <div className="bg-[#111111] border border-white/5 rounded-xl p-4 space-y-3">
                                    <p className="text-xs text-white/40">Enter the user's UUID from Supabase Auth</p>
                                    <input
                                        placeholder="User UUID"
                                        value={newAdminId}
                                        onChange={e => setNewAdminId(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none font-mono"
                                    />
                                    <select
                                        value={newAdminRole}
                                        onChange={e => setNewAdminRole(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none"
                                    >
                                        <option value="staff" className="bg-[#1a1a1a]">Staff</option>
                                        <option value="support_admin" className="bg-[#1a1a1a]">Support Admin</option>
                                        <option value="main_admin" className="bg-[#1a1a1a]">Main Admin</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button onClick={handleAddAdmin} className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium">Add</button>
                                        <button onClick={() => setShowAdminForm(false)} className="px-4 py-2 bg-white/5 text-white/50 rounded-lg text-sm">Cancel</button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {admins.length === 0 ? (
                                    <div className="text-center py-12 text-white/30">No admins configured</div>
                                ) : admins.map(a => {
                                    const roleIcon = a.role === 'main_admin' ? Crown : a.role === 'support_admin' ? HeadphonesIcon : Shield
                                    const RoleIcon = roleIcon
                                    const roleColor = a.role === 'main_admin' ? 'text-[#D4AF37]' : a.role === 'support_admin' ? 'text-emerald-400' : 'text-blue-400'
                                    return (
                                        <div key={a.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                            <div className={`w-9 h-9 rounded-full bg-white/5 flex items-center justify-center`}>
                                                <RoleIcon className={`w-4 h-4 ${roleColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{a.profiles?.full_name || 'Unknown'}</p>
                                                <p className="text-xs text-white/40 truncate">{a.profiles?.email || a.id}</p>
                                            </div>
                                            <select
                                                value={a.role}
                                                onChange={e => handleRoleChange(a.id, e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none"
                                            >
                                                <option value="staff" className="bg-[#1a1a1a]">Staff</option>
                                                <option value="support_admin" className="bg-[#1a1a1a]">Support</option>
                                                <option value="main_admin" className="bg-[#1a1a1a]">Main Admin</option>
                                            </select>
                                            <button onClick={() => handleRemoveAdmin(a.id)} className="p-2 text-red-400/50 hover:text-red-400 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
