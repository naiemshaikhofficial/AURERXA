'use client'

import React, { useState } from 'react'
import { Tab } from 'lucide-react'
import { updateGoldRate, createCoupon, deleteCoupon, updateAdminRole, removeAdmin } from '../actions'
import { CircleDollarSign, Tag, Shield, Save, Plus, Trash2, Crown, HeadphonesIcon, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SettingsClient({ initialRates, initialCoupons, initialAdmins, currentRole }: any) {
    const [tab, setTab] = useState('rates')
    const [editingRates, setEditingRates] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {}
        initialRates.forEach((rate: any) => { initial[rate.id] = String(rate.rate) })
        return initial
    })
    const [showCouponForm, setShowCouponForm] = useState(false)
    const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_discount: '', usage_limit: '' })
    const [showAdminForm, setShowAdminForm] = useState(false)
    const [newAdminId, setNewAdminId] = useState('')
    const [newAdminRole, setNewAdminRole] = useState('staff')
    const router = useRouter()

    const handleRateUpdate = async (id: string) => {
        const value = editingRates[id]
        if (!value || !confirm(`Update rate to ₹${value}?`)) return
        await updateGoldRate(id, parseFloat(value))
        router.refresh()
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
        router.refresh()
    }

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm('Delete coupon?')) return
        await deleteCoupon(id)
        router.refresh()
    }

    const handleRoleChange = async (userId: string, role: string) => {
        if (!confirm(`Change role to ${role}?`)) return
        await updateAdminRole(userId, role)
        router.refresh()
    }

    const handleAddAdmin = async () => {
        if (!newAdminId) return
        await updateAdminRole(newAdminId, newAdminRole)
        setShowAdminForm(false)
        setNewAdminId('')
        router.refresh()
    }

    const handleRemoveAdmin = async (userId: string) => {
        if (!confirm('Remove admin?')) return
        await removeAdmin(userId)
        router.refresh()
    }

    const tabs = [
        { id: 'rates', label: 'Metal Rates', icon: CircleDollarSign },
        { id: 'coupons', label: 'Coupons', icon: Tag },
        ...(currentRole === 'main_admin' ? [{ id: 'admins', label: 'Admin Roles', icon: Shield }] : []),
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-white/40 text-sm mt-1">Configure your store</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'rates' && (
                <div className="space-y-3">
                    {initialRates.map((rate: any) => (
                        <div key={rate.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium">{rate.purity}</p>
                                <p className="text-xs text-white/30">Updated: {new Date(rate.updated_at).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/40">₹</span>
                                <input type="number" value={editingRates[rate.id] || ''} onChange={e => setEditingRates(prev => ({ ...prev, [rate.id]: e.target.value }))} className="w-28 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#D4AF37]/30" />
                                <button onClick={() => handleRateUpdate(rate.id)} className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition"><Save className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'coupons' && (
                <div className="space-y-4">
                    <button onClick={() => setShowCouponForm(!showCouponForm)} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-sm font-medium"><Plus className="w-4 h-4" /> New Coupon</button>
                    {showCouponForm && (
                        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="Code" value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none uppercase" />
                                <select value={newCoupon.discount_type} onChange={e => setNewCoupon(p => ({ ...p, discount_type: e.target.value }))} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                                    <option value="percentage" className="bg-[#1a1a1a]">%</option>
                                    <option value="fixed" className="bg-[#1a1a1a]">₹</option>
                                </select>
                                <input type="number" placeholder="Value" value={newCoupon.discount_value} onChange={e => setNewCoupon(p => ({ ...p, discount_value: e.target.value }))} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none" />
                            </div>
                            <button onClick={handleCreateCoupon} className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium">Create</button>
                        </div>
                    )}
                    <div className="space-y-2">
                        {initialCoupons.map((c: any) => (
                            <div key={c.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2"><p className="text-sm font-mono font-bold text-[#D4AF37]">{c.code}</p><span className={`px-1.5 py-0.5 rounded text-[10px] ${c.is_active ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/10 text-white/40'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></div>
                                    <p className="text-xs text-white/40 mt-0.5">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} off • {c.used_count} used</p>
                                </div>
                                <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-red-400/50 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'admins' && currentRole === 'main_admin' && (
                <div className="space-y-4">
                    <button onClick={() => setShowAdminForm(!showAdminForm)} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-xl text-sm font-medium"><UserPlus className="w-4 h-4" /> Add Admin</button>
                    {showAdminForm && (
                        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 space-y-3">
                            <input placeholder="UUID" value={newAdminId} onChange={e => setNewAdminId(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none font-mono" />
                            <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                                <option value="staff" className="bg-[#1a1a1a]">Staff</option>
                                <option value="support_admin" className="bg-[#1a1a1a]">Support</option>
                                <option value="main_admin" className="bg-[#1a1a1a]">Main Admin</option>
                            </select>
                            <button onClick={handleAddAdmin} className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg text-sm font-medium">Add</button>
                        </div>
                    )}
                    <div className="space-y-2">
                        {initialAdmins.map((a: any) => (
                            <div key={a.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{a.profiles?.full_name || 'Unknown'}</p><p className="text-xs text-white/40 truncate">{a.profiles?.email}</p></div>
                                <select value={a.role} onChange={e => handleRoleChange(a.id, e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none">
                                    <option value="staff" className="bg-[#1a1a1a]">Staff</option>
                                    <option value="support_admin" className="bg-[#1a1a1a]">Support</option>
                                    <option value="main_admin" className="bg-[#1a1a1a]">Main Admin</option>
                                </select>
                                <button onClick={() => handleRemoveAdmin(a.id)} className="p-2 text-red-400/50 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
