'use client'

import React, { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { updateTicketStatus, updateSupportItemStatus, deleteSupportItem } from '../actions'
import { MessageCircle, Wrench, Mail, Palette, Eye, Trash2, X, Search } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
    open: 'bg-amber-400/10 text-amber-400', in_progress: 'bg-blue-400/10 text-blue-400', resolved: 'bg-emerald-400/10 text-emerald-400',
    closed: 'bg-white/10 text-white/40', requested: 'bg-amber-400/10 text-amber-400', inspecting: 'bg-blue-400/10 text-blue-400',
    repairing: 'bg-indigo-400/10 text-indigo-400', completed: 'bg-emerald-400/10 text-emerald-400', pending: 'bg-amber-400/10 text-amber-400',
    read: 'bg-emerald-400/10 text-emerald-400', unread: 'bg-amber-400/10 text-amber-400', approved: 'bg-emerald-400/10 text-emerald-400', rejected: 'bg-red-400/10 text-red-400',
}

export function SupportClient({ initialItems, tab, search }: { initialItems: any[], tab: string, search: string }) {
    const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams()
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [localSearch, setLocalSearch] = useState(search)

    const updateTab = (t: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', t)
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (localSearch) params.set('search', localSearch)
        else params.delete('search')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleStatusUpdate = async (item: any, newStatus: string) => {
        if (!confirm(`Change status to "${newStatus}"?`)) return
        const table = tab === 'tickets' ? 'tickets' : tab === 'repairs' ? 'repairs' : tab === 'contacts' ? 'contact_messages' : 'custom_orders'
        if (tab === 'tickets') await updateTicketStatus(item.id, newStatus)
        else await updateSupportItemStatus(table, item.id, newStatus)
        router.refresh()
        if (selectedItem?.id === item.id) setSelectedItem({ ...selectedItem, status: newStatus })
    }

    const handleDelete = async (item: any) => {
        if (!confirm('Permanently delete?')) return
        const table = tab === 'tickets' ? 'tickets' : tab === 'repairs' ? 'repairs' : tab === 'contacts' ? 'contact_messages' : 'custom_orders'
        await deleteSupportItem(table, item.id)
        setSelectedItem(null)
        router.refresh()
    }

    const tabs = [
        { id: 'tickets', label: 'Tickets', icon: MessageCircle }, { id: 'repairs', label: 'Repairs', icon: Wrench },
        { id: 'contacts', label: 'Messages', icon: Mail }, { id: 'custom', label: 'Custom', icon: Palette },
    ]

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl md:text-3xl font-bold tracking-tight">Support</h1></div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => updateTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${tab === t.id ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" placeholder="Search..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]/30" />
            </div>

            <div className="space-y-3">
                {initialItems.map(item => (
                    <div key={item.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-[#D4AF37]/20 transition group" onClick={() => setSelectedItem(item)}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0 cursor-pointer">
                                <p className="text-sm font-medium truncate group-hover:text-[#D4AF37] transition-colors">{tab === 'tickets' ? item.subject : tab === 'repairs' ? item.product_name : item.name}</p>
                                <p className="text-xs text-white/40 mt-0.5">{(item.profiles?.full_name || item.email || 'Unknown')}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ${STATUS_COLORS[item.status] || 'bg-white/10 text-white/40'}`}>{item.status?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-xs text-white/50 line-clamp-2 mb-3">{tab === 'tickets' ? item.message : tab === 'repairs' ? item.issue_description : item.message || item.description}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/20">{new Date(item.created_at).toLocaleString('en-IN')}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={e => { e.stopPropagation(); setSelectedItem(item) }} className="p-1.5 text-white/30 hover:text-[#D4AF37] transition"><Eye className="w-3.5 h-3.5" /></button>
                                <button onClick={e => { e.stopPropagation(); handleDelete(item) }} className="p-1.5 text-white/30 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-white/5 overflow-y-auto animate-in slide-in-from-right-full duration-300">
                        <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-[#D4AF37]">Detail View</h3>
                            <button onClick={() => setSelectedItem(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-4 space-y-6">
                            <select value={selectedItem.status} onChange={e => handleStatusUpdate(selectedItem, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none mb-4">
                                <option value="open" className="bg-[#1a1a1a]">Open</option>
                                <option value="closed" className="bg-[#1a1a1a]">Closed</option>
                                <option value="resolved" className="bg-[#1a1a1a]">Resolved</option>
                            </select>
                            <p className="text-sm text-white/70 whitespace-pre-wrap">{tab === 'tickets' ? selectedItem.message : tab === 'repairs' ? selectedItem.issue_description : selectedItem.message || selectedItem.description}</p>
                            <div className="pt-6 border-t border-white/5">
                                <button onClick={() => handleDelete(selectedItem)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition text-sm font-medium"><Trash2 className="w-4 h-4" /> Delete Permanently</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
