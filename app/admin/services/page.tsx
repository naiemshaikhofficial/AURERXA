'use client'

import React, { useEffect, useState } from 'react'
import { updateServiceStatus, deleteServiceRequest } from '../actions'
import { supabase } from '@/lib/supabase'
import { Eye, Trash2, X, Sparkles, Gem, Wrench as WrenchIcon, Store, Search, Clock, CheckCircle } from 'lucide-react'

type Tab = 'try-on' | 'harvest' | 'care' | 'boutique'

const TABLE_MAP: Record<Tab, string> = {
    'try-on': 'virtual_try_on_requests',
    'harvest': 'gold_harvest_leads',
    'care': 'jewelry_care_appointments',
    'boutique': 'boutique_appointments',
}

const STATUS_OPTIONS: Record<Tab, string[]> = {
    'try-on': ['pending', 'confirmed', 'completed', 'cancelled'],
    'harvest': ['pending', 'contacted', 'enrolled', 'cancelled'],
    'care': ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    'boutique': ['pending', 'confirmed', 'completed', 'cancelled'],
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-400/10 text-amber-400',
    confirmed: 'bg-blue-400/10 text-blue-400',
    contacted: 'bg-blue-400/10 text-blue-400',
    enrolled: 'bg-emerald-400/10 text-emerald-400',
    in_progress: 'bg-indigo-400/10 text-indigo-400',
    completed: 'bg-emerald-400/10 text-emerald-400',
    cancelled: 'bg-red-400/10 text-red-400',
}


export default function ServicesAdminPage() {
    const [tab, setTab] = useState<Tab>('try-on')
    const [data, setData] = useState<Record<Tab, any[]>>({ 'try-on': [], 'harvest': [], 'care': [], 'boutique': [] })
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)

        const [tryOn, goldHarvest, jewelryCare, boutique] = await Promise.all([
            supabase.from('virtual_try_on_requests').select('*').order('created_at', { ascending: false }),
            supabase.from('gold_harvest_leads').select('*').order('created_at', { ascending: false }),
            supabase.from('jewelry_care_appointments').select('*').order('created_at', { ascending: false }),
            supabase.from('boutique_appointments').select('*').order('created_at', { ascending: false }),
        ])

        setData({
            'try-on': tryOn.data || [],
            'harvest': goldHarvest.data || [],
            'care': jewelryCare.data || [],
            'boutique': boutique.data || [],
        })
        setLoading(false)
    }

    const handleStatusUpdate = async (item: any, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to "${newStatus.toUpperCase()}"?`)) return
        const table = TABLE_MAP[tab]
        const res = await updateServiceStatus(table, item.id, newStatus)
        if (res.success) {
            if (selectedItem?.id === item.id) setSelectedItem({ ...selectedItem, status: newStatus })
            loadData()
        } else {
            alert('Failed to update: ' + res.error)
        }
    }

    const handleDelete = async (item: any) => {
        if (!confirm('Are you sure you want to PERMANENTLY DELETE this request? This cannot be undone.')) return
        const table = TABLE_MAP[tab]
        const res = await deleteServiceRequest(table, item.id)
        if (res.success) {
            setSelectedItem(null)
            loadData()
        } else {
            alert('Failed to delete: ' + res.error)
        }
    }

    const tabs = [
        { id: 'try-on' as Tab, label: 'Virtual Try-On', icon: Sparkles },
        { id: 'harvest' as Tab, label: 'Gold Harvest', icon: Gem },
        { id: 'care' as Tab, label: 'Jewelry Care', icon: WrenchIcon },
        { id: 'boutique' as Tab, label: 'Boutique Visit', icon: Store },
    ]

    const currentItems = (() => {
        const items = data[tab]
        if (!search) return items
        return items.filter((item: any) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()))
    })()

    const renderCard = (item: any) => {
        return (
            <div key={item.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-[#D4AF37]/20 transition group">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedItem(item)}>
                        <p className="text-sm font-medium truncate group-hover:text-[#D4AF37] transition-colors">{item.name}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                            {item.email}
                            {item.phone && ` • ${item.phone}`}
                        </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ${STATUS_COLORS[item.status] || 'bg-white/10 text-white/40'}`}>
                        {item.status?.replace('_', ' ')}
                    </span>
                </div>

                {/* Tab-specific info */}
                {tab === 'try-on' && item.preferred_date && (
                    <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(item.preferred_date).toLocaleDateString()} {item.preferred_time && `at ${item.preferred_time}`}
                    </p>
                )}
                {tab === 'harvest' && item.monthly_amount && (
                    <p className="text-xs text-[#D4AF37] mb-2">Monthly: ₹{item.monthly_amount}</p>
                )}
                {tab === 'care' && (
                    <p className="text-xs text-white/50 mb-2 capitalize">{item.service_type}
                        {item.preferred_date && ` • ${new Date(item.preferred_date).toLocaleDateString()}`}
                    </p>
                )}
                {tab === 'boutique' && (
                    <p className="text-xs text-white/50 mb-2">
                        {item.preferred_date && new Date(item.preferred_date).toLocaleDateString()}
                        {item.preferred_time && ` at ${item.preferred_time}`}
                        {item.visit_reason && ` • ${item.visit_reason}`}
                    </p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-white/20">{new Date(item.created_at).toLocaleString('en-IN')}</span>
                    <div className="flex items-center gap-2">
                        <select
                            value={item.status}
                            onChange={e => handleStatusUpdate(item, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none"
                            onClick={e => e.stopPropagation()}
                        >
                            {STATUS_OPTIONS[tab].map(s => (
                                <option key={s} value={s} className="bg-[#1a1a1a]">{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <button
                            onClick={e => { e.stopPropagation(); setSelectedItem(item) }}
                            className="p-1.5 text-white/30 hover:text-[#D4AF37] transition"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); handleDelete(item) }}
                            className="p-1.5 text-white/30 hover:text-red-400 transition"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Service Requests</h1>
                <p className="text-white/40 text-sm mt-1">Manage appointments and leads from service forms</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => { setTab(t.id); setSelectedItem(null); setSearch('') }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-black/20 text-black' : 'bg-white/10 text-white/40'}`}>
                            {data[t.id].length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : currentItems.length === 0 ? (
                <div className="text-center py-12 text-white/30">No requests found</div>
            ) : (
                <div className="space-y-3">
                    {currentItems.map(renderCard)}
                </div>
            )}

            {/* Detail Drawer */}
            {selectedItem && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-white/5 overflow-y-auto animate-in slide-in-from-right-full duration-300">
                        <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-[#D4AF37]">Request Details</h3>
                            <button onClick={() => setSelectedItem(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${STATUS_COLORS[selectedItem.status] || 'bg-white/10 text-white/40'}`}>
                                    {selectedItem.status?.replace('_', ' ')}
                                </span>
                                <select
                                    value={selectedItem.status}
                                    onChange={e => handleStatusUpdate(selectedItem, e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none"
                                >
                                    {STATUS_OPTIONS[tab].map(s => (
                                        <option key={s} value={s} className="bg-[#1a1a1a]">{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Contact */}
                            <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Contact Info</p>
                                <p className="text-sm font-medium">{selectedItem.name}</p>
                                <p className="text-xs text-white/40">{selectedItem.email}</p>
                                {selectedItem.phone && <p className="text-xs text-white/40">{selectedItem.phone}</p>}
                            </div>

                            {/* Specific Fields */}
                            {tab === 'try-on' && (
                                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                    <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Appointment</p>
                                    <p className="text-sm">Preferred Date: {selectedItem.preferred_date ? new Date(selectedItem.preferred_date).toLocaleDateString() : 'N/A'}</p>
                                    {selectedItem.preferred_time && <p className="text-sm">Time: {selectedItem.preferred_time}</p>}
                                    {selectedItem.notes && <p className="text-xs text-white/50 mt-2">{selectedItem.notes}</p>}
                                </div>
                            )}
                            {tab === 'harvest' && (
                                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-xl p-4">
                                    <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Investment Details</p>
                                    <p className="text-lg font-bold text-[#D4AF37]">₹{selectedItem.monthly_amount || 'N/A'}/month</p>
                                    {selectedItem.duration && <p className="text-xs text-white/50 mt-1">Duration: {selectedItem.duration}</p>}
                                </div>
                            )}
                            {tab === 'care' && (
                                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                    <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Service Details</p>
                                    <p className="text-sm capitalize">Service: {selectedItem.service_type}</p>
                                    <p className="text-sm">Date: {selectedItem.preferred_date ? new Date(selectedItem.preferred_date).toLocaleDateString() : 'N/A'}</p>
                                    {selectedItem.notes && <p className="text-xs text-white/50 mt-2">{selectedItem.notes}</p>}
                                </div>
                            )}
                            {tab === 'boutique' && (
                                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                    <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Visit Details</p>
                                    <p className="text-sm">Date: {selectedItem.preferred_date ? new Date(selectedItem.preferred_date).toLocaleDateString() : 'N/A'}</p>
                                    {selectedItem.preferred_time && <p className="text-sm">Time: {selectedItem.preferred_time}</p>}
                                    {selectedItem.visit_reason && <p className="text-sm">Reason: {selectedItem.visit_reason}</p>}
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-xl p-3 text-center">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Created</p>
                                    <p className="text-xs text-white/60">{new Date(selectedItem.created_at).toLocaleString('en-IN')}</p>
                                </div>
                                {selectedItem.updated_at && (
                                    <div className="bg-white/5 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Updated</p>
                                        <p className="text-xs text-white/60">{new Date(selectedItem.updated_at).toLocaleString('en-IN')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Delete */}
                            <div className="pt-6 border-t border-white/5">
                                <button
                                    onClick={() => handleDelete(selectedItem)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition text-sm font-medium"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Permanently
                                </button>
                                <p className="text-center text-[10px] text-white/20 mt-2">This action cannot be undone.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
