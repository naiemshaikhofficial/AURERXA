'use client'

import React, { useEffect, useState } from 'react'
import { getAdminTickets, updateTicketStatus, getAdminRepairs, getAdminContactMessages, getAdminCustomOrders } from '../actions'
import { MessageCircle, Wrench, Mail, Palette, ChevronDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
}

export default function SupportPage() {
    const [tab, setTab] = useState<Tab>('tickets')
    const [tickets, setTickets] = useState<any[]>([])
    const [repairs, setRepairs] = useState<any[]>([])
    const [contacts, setContacts] = useState<any[]>([])
    const [customOrders, setCustomOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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

    const handleTicketUpdate = async (id: string, status: string) => {
        await updateTicketStatus(id, status)
        loadData()
    }

    const tabs = [
        { id: 'tickets' as Tab, label: 'Tickets', icon: MessageCircle },
        { id: 'repairs' as Tab, label: 'Repairs', icon: Wrench },
        { id: 'contacts' as Tab, label: 'Messages', icon: Mail },
        { id: 'custom' as Tab, label: 'Custom Orders', icon: Palette },
    ]

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
                <div className="space-y-3">
                    {/* Tickets */}
                    {tab === 'tickets' && (tickets.length === 0 ? (
                        <div className="text-center py-12 text-white/30">No tickets</div>
                    ) : tickets.map(t => (
                        <div key={t.id} className="bg-[#111111] border border-white/5 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{t.subject}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{t.profiles?.full_name || t.profiles?.email || 'Unknown'}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ${STATUS_COLORS[t.status] || 'bg-white/10 text-white/40'}`}>
                                    {t.status}
                                </span>
                            </div>
                            <p className="text-xs text-white/50 line-clamp-2 mb-3">{t.message}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/20">{new Date(t.created_at).toLocaleString('en-IN')}</span>
                                <select
                                    value={t.status}
                                    onChange={e => handleTicketUpdate(t.id, e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none"
                                >
                                    <option value="open" className="bg-[#1a1a1a]">Open</option>
                                    <option value="in_progress" className="bg-[#1a1a1a]">In Progress</option>
                                    <option value="resolved" className="bg-[#1a1a1a]">Resolved</option>
                                    <option value="closed" className="bg-[#1a1a1a]">Closed</option>
                                </select>
                            </div>
                        </div>
                    )))}

                    {/* Repairs */}
                    {tab === 'repairs' && (repairs.length === 0 ? (
                        <div className="text-center py-12 text-white/30">No repair requests</div>
                    ) : repairs.map(r => (
                        <div key={r.id} className="bg-[#111111] border border-white/5 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                    <p className="text-sm font-medium">{r.product_name}</p>
                                    <p className="text-xs text-white/40">{r.profiles?.full_name || 'Unknown'} {r.order_number && `• Order #${r.order_number}`}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
                            </div>
                            <p className="text-xs text-white/50 line-clamp-2 mb-2">{r.issue_description}</p>
                            <span className="text-[10px] text-white/20">{new Date(r.created_at).toLocaleString('en-IN')}</span>
                        </div>
                    )))}

                    {/* Contact Messages */}
                    {tab === 'contacts' && (contacts.length === 0 ? (
                        <div className="text-center py-12 text-white/30">No messages</div>
                    ) : contacts.map(m => (
                        <div key={m.id} className="bg-[#111111] border border-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 text-[#D4AF37]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{m.name}</p>
                                    <p className="text-xs text-white/40">{m.email} {m.phone && `• ${m.phone}`}</p>
                                </div>
                            </div>
                            <p className="text-xs text-white/50 line-clamp-3 mb-2">{m.message}</p>
                            <span className="text-[10px] text-white/20">{new Date(m.created_at).toLocaleString('en-IN')}</span>
                        </div>
                    )))}

                    {/* Custom Orders */}
                    {tab === 'custom' && (customOrders.length === 0 ? (
                        <div className="text-center py-12 text-white/30">No custom orders</div>
                    ) : customOrders.map(o => (
                        <div key={o.id} className="bg-[#111111] border border-white/5 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                    <p className="text-sm font-medium">{o.name}</p>
                                    <p className="text-xs text-white/40">{o.email} {o.phone && `• ${o.phone}`}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATUS_COLORS[o.status] || 'bg-white/10 text-white/40'}`}>{o.status}</span>
                            </div>
                            <p className="text-xs text-white/50 line-clamp-2 mb-1">{o.description}</p>
                            {o.budget && <p className="text-xs text-[#D4AF37]">Budget: {o.budget}</p>}
                            <span className="text-[10px] text-white/20 block mt-1">{new Date(o.created_at).toLocaleString('en-IN')}</span>
                        </div>
                    )))}
                </div>
            )}
        </div>
    )
}
