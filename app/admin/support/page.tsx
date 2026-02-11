'use client'

import React, { useEffect, useState } from 'react'
import { getAdminTickets, updateTicketStatus, getAdminRepairs, getAdminContactMessages, getAdminCustomOrders, deleteSupportItem, updateSupportItemStatus } from '../actions'
import { MessageCircle, Wrench, Mail, Palette, Clock, X, Trash2, Eye, Search, ChevronDown } from 'lucide-react'

type Tab = 'tickets' | 'repairs' | 'contacts' | 'custom'

const STATUS_COLORS: Record<string, string> = {
    open: 'bg-amber-400/10 text-amber-400',
    in_progress: 'bg-blue-400/10 text-blue-400',
    resolved: 'bg-emerald-400/10 text-emerald-400',
    closed: 'bg-white/10 text-white/40',
    requested: 'bg-amber-400/10 text-amber-400',
    inspecting: 'bg-blue-400/10 text-blue-400',
    repairing: 'bg-indigo-400/10 text-indigo-400',
    completed: 'bg-emerald-400/10 text-emerald-400',
    pending: 'bg-amber-400/10 text-amber-400',
    read: 'bg-emerald-400/10 text-emerald-400',
    unread: 'bg-amber-400/10 text-amber-400',
    approved: 'bg-emerald-400/10 text-emerald-400',
    rejected: 'bg-red-400/10 text-red-400',
}

const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed']
const REPAIR_STATUSES = ['requested', 'inspecting', 'repairing', 'completed', 'closed']
const CUSTOM_ORDER_STATUSES = ['pending', 'approved', 'in_progress', 'completed', 'rejected']
const CONTACT_STATUSES = ['unread', 'read', 'resolved']

const TABLE_MAP: Record<Tab, string> = {
    tickets: 'tickets',
    repairs: 'repairs',
    contacts: 'contact_messages',
    custom: 'custom_orders',
}

export default function SupportPage() {
    const [tab, setTab] = useState<Tab>('tickets')
    const [tickets, setTickets] = useState<any[]>([])
    const [repairs, setRepairs] = useState<any[]>([])
    const [contacts, setContacts] = useState<any[]>([])
    const [customOrders, setCustomOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadData()
    }, [tab])

    const loadData = async () => {
        setLoading(true)
        if (tab === 'tickets') {
            const r = await getAdminTickets()
            setTickets(r.tickets)
        } else if (tab === 'repairs') {
            const r = await getAdminRepairs()
            setRepairs(r.repairs)
        } else if (tab === 'contacts') {
            const r = await getAdminContactMessages()
            setContacts(r.messages)
        } else {
            const r = await getAdminCustomOrders()
            setCustomOrders(r.orders)
        }
        setLoading(false)
    }

    const handleStatusUpdate = async (item: any, newStatus: string) => {
        if (!confirm(`Are you sure you want to change status to "${newStatus.toUpperCase()}"?`)) return
        const table = TABLE_MAP[tab]
        if (tab === 'tickets') {
            await updateTicketStatus(item.id, newStatus)
        } else {
            await updateSupportItemStatus(table, item.id, newStatus)
        }
        if (selectedItem?.id === item.id) {
            setSelectedItem({ ...selectedItem, status: newStatus })
        }
        loadData()
    }

    const handleDelete = async (item: any) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this item? This cannot be undone.')) return
        const table = TABLE_MAP[tab]
        const res = await deleteSupportItem(table, item.id)
        if (res.success) {
            setSelectedItem(null)
            loadData()
        } else {
            alert('Failed to delete: ' + res.error)
        }
    }

    const getStatusOptions = () => {
        switch (tab) {
            case 'tickets': return TICKET_STATUSES
            case 'repairs': return REPAIR_STATUSES
            case 'custom': return CUSTOM_ORDER_STATUSES
            case 'contacts': return CONTACT_STATUSES
            default: return []
        }
    }

    const getCurrentItems = () => {
        const items = tab === 'tickets' ? tickets : tab === 'repairs' ? repairs : tab === 'contacts' ? contacts : customOrders
        if (!search) return items
        return items.filter((item: any) => {
            const text = JSON.stringify(item).toLowerCase()
            return text.includes(search.toLowerCase())
        })
    }

    const tabs = [
        { id: 'tickets' as Tab, label: 'Tickets', icon: MessageCircle, count: tickets.length },
        { id: 'repairs' as Tab, label: 'Repairs', icon: Wrench, count: repairs.length },
        { id: 'contacts' as Tab, label: 'Messages', icon: Mail, count: contacts.length },
        { id: 'custom' as Tab, label: 'Custom Orders', icon: Palette, count: customOrders.length },
    ]

    const renderItemCard = (item: any) => {
        const isTicket = tab === 'tickets'
        const isRepair = tab === 'repairs'
        const isContact = tab === 'contacts'
        const isCustom = tab === 'custom'

        return (
            <div key={item.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-[#D4AF37]/20 transition group">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedItem(item)}>
                        <p className="text-sm font-medium truncate group-hover:text-[#D4AF37] transition-colors">
                            {isTicket ? item.subject : isRepair ? item.product_name : isContact ? item.name : item.name}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                            {isTicket ? (item.profiles?.full_name || item.profiles?.email || 'Unknown') :
                                isRepair ? (item.profiles?.full_name || 'Unknown') :
                                    (item.email || 'N/A')}
                            {isRepair && item.order_number && ` • Order #${item.order_number}`}
                        </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ${STATUS_COLORS[item.status] || 'bg-white/10 text-white/40'}`}>
                        {item.status?.replace('_', ' ')}
                    </span>
                </div>
                <p className="text-xs text-white/50 line-clamp-2 mb-3">
                    {isTicket ? item.message : isRepair ? item.issue_description : isContact ? item.message : item.description}
                </p>
                {isCustom && item.budget && <p className="text-xs text-[#D4AF37] mb-2">Budget: {item.budget}</p>}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/20">{new Date(item.created_at).toLocaleString('en-IN')}</span>
                    <div className="flex items-center gap-2">
                        <select
                            value={item.status}
                            onChange={e => handleStatusUpdate(item, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none"
                            onClick={e => e.stopPropagation()}
                        >
                            {getStatusOptions().map(s => (
                                <option key={s} value={s} className="bg-[#1a1a1a]">{s.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <button
                            onClick={e => { e.stopPropagation(); setSelectedItem(item) }}
                            className="p-1.5 text-white/30 hover:text-[#D4AF37] transition"
                            title="View Details"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); handleDelete(item) }}
                            className="p-1.5 text-white/30 hover:text-red-400 transition"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const items = getCurrentItems()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Support</h1>
                <p className="text-white/40 text-sm mt-1">Manage customer queries & requests</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => { setTab(t.id); setSelectedItem(null); setSearch('') }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-white/30">No items found</div>
            ) : (
                <div className="space-y-3">
                    {items.map(renderItemCard)}
                </div>
            )}

            {/* Detail Drawer */}
            {selectedItem && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-white/5 overflow-y-auto animate-in slide-in-from-right-full duration-300">
                        <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-[#D4AF37]">Detail View</h3>
                            <button onClick={() => setSelectedItem(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${STATUS_COLORS[selectedItem.status] || 'bg-white/10 text-white/40'}`}>
                                    {selectedItem.status?.replace('_', ' ')}
                                </span>
                                <select
                                    value={selectedItem.status}
                                    onChange={e => handleStatusUpdate(selectedItem, e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none"
                                >
                                    {getStatusOptions().map(s => (
                                        <option key={s} value={s} className="bg-[#1a1a1a]">{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">
                                    {tab === 'tickets' ? 'Subject' : tab === 'repairs' ? 'Product' : 'Name'}
                                </p>
                                <p className="text-lg font-semibold">
                                    {tab === 'tickets' ? selectedItem.subject :
                                        tab === 'repairs' ? selectedItem.product_name :
                                            selectedItem.name}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Contact</p>
                                {tab === 'tickets' && selectedItem.profiles && (
                                    <>
                                        <p className="text-sm">{selectedItem.profiles.full_name || 'Unknown'}</p>
                                        <p className="text-xs text-white/40">{selectedItem.profiles.email}</p>
                                    </>
                                )}
                                {tab === 'repairs' && selectedItem.profiles && (
                                    <>
                                        <p className="text-sm">{selectedItem.profiles.full_name || 'Unknown'}</p>
                                        <p className="text-xs text-white/40">{selectedItem.profiles.email}</p>
                                        {selectedItem.order_number && <p className="text-xs text-[#D4AF37]">Order #{selectedItem.order_number}</p>}
                                    </>
                                )}
                                {(tab === 'contacts' || tab === 'custom') && (
                                    <>
                                        <p className="text-sm">{selectedItem.name}</p>
                                        <p className="text-xs text-white/40">{selectedItem.email}</p>
                                        {selectedItem.phone && <p className="text-xs text-white/40">{selectedItem.phone}</p>}
                                    </>
                                )}
                            </div>

                            {/* Message/Description */}
                            <div>
                                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">
                                    {tab === 'tickets' || tab === 'contacts' ? 'Message' : tab === 'repairs' ? 'Issue Description' : 'Description'}
                                </p>
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
                                        {tab === 'tickets' ? selectedItem.message :
                                            tab === 'repairs' ? selectedItem.issue_description :
                                                tab === 'contacts' ? selectedItem.message :
                                                    selectedItem.description}
                                    </p>
                                </div>
                            </div>

                            {/* Extra Fields */}
                            {tab === 'custom' && selectedItem.budget && (
                                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-xl p-4">
                                    <p className="text-xs text-white/30 mb-1">Budget</p>
                                    <p className="text-lg font-bold text-[#D4AF37]">{selectedItem.budget}</p>
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

                            {/* Danger Zone */}
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
