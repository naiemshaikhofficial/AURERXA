'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, User, Clock, Send, CheckCircle2, Search, Ticket, ArrowLeft, Phone, Mail, Tag, AlertCircle, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type TabType = 'chats' | 'tickets'

export default function AdminConciergePage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [tab, setTab] = useState<TabType>('chats')
    const [sessions, setSessions] = useState<any[]>([])
    const [tickets, setTickets] = useState<any[]>([])
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [selectedTicket, setSelectedTicket] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [adminProfile, setAdminProfile] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'open' | 'closed' | 'all'>('open')
    const [ticketReply, setTicketReply] = useState('')
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Presence tracking — mark admin as active every 60s
    useEffect(() => {
        const updatePresence = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Try to update presence (may fail if column doesn't exist yet)
                await supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', user.id)

                // Always fetch profile for admin info
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setAdminProfile({ id: user.id, email: user.email, ...user.user_metadata, ...profile })
            } catch (err) {
                console.error('Presence update failed:', err)
            }
        }
        updatePresence()
        const timer = setInterval(updatePresence, 60000)
        return () => clearInterval(timer)
    }, [])

    // Fetch sessions with filter
    useEffect(() => {
        const fetchSessions = async () => {
            let query = supabase
                .from('chat_sessions')
                .select('*')
                .order('created_at', { ascending: false })

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query
            if (!error) setSessions(data || [])
            setLoading(false)
        }

        fetchSessions()

        // Real-time subscription
        const channel = supabase.channel('admin_chat_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, fetchSessions)
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [statusFilter])

    // Fetch tickets
    useEffect(() => {
        const fetchTickets = async () => {
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error) setTickets(data || [])
        }
        fetchTickets()

        const channel = supabase.channel('admin_tickets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetchTickets)
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    // Fetch messages for selected session (Realtime)
    useEffect(() => {
        if (!selectedSession) { setMessages([]); return }

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', selectedSession.id)
                .order('created_at', { ascending: true })

            if (!error) setMessages(data || [])
        }

        fetchMessages()

        const channel = supabase.channel(`admin_msgs_${selectedSession.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${selectedSession.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new])
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [selectedSession])

    // --- Actions ---

    const sendMessage = async (content: string) => {
        if (!selectedSession || !content.trim()) return
        await supabase.from('chat_messages').insert([{
            session_id: selectedSession.id,
            role: 'agent',
            content,
            sender_name: adminProfile?.full_name || adminProfile?.user_metadata?.full_name || 'Support Agent'
        }])
    }

    const claimSession = async (session: any) => {
        const { error } = await supabase
            .from('chat_sessions')
            .update({ agent_id: adminProfile?.id, status: 'open' })
            .eq('id', session.id)
        if (!error) setSelectedSession({ ...session, agent_id: adminProfile?.id })
    }

    const resolveSession = async (session: any) => {
        // Send a system message before closing
        await supabase.from('chat_messages').insert([{
            session_id: session.id,
            role: 'system',
            content: `Session resolved by ${adminProfile?.full_name || 'Admin'}.`,
            sender_name: 'System'
        }])
        await supabase.from('chat_sessions').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', session.id)
        setSelectedSession(null)
    }

    const updateTicketStatus = async (ticketId: string, status: string) => {
        await supabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticketId)
        setSelectedTicket((prev: any) => prev ? { ...prev, status } : null)
    }

    // --- Filtering ---

    const filteredSessions = sessions.filter(s => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (s.guest_name?.toLowerCase().includes(q)) || (s.guest_email?.toLowerCase().includes(q)) || (s.guest_phone?.includes(q))
    })

    const filteredTickets = tickets.filter(t => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (t.subject?.toLowerCase().includes(q)) || (t.guest_name?.toLowerCase().includes(q)) || (t.guest_email?.toLowerCase().includes(q))
    })

    const openChats = sessions.filter(s => s.status === 'open' && !s.agent_id).length
    const openTickets = tickets.filter(t => t.status === 'open').length

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-black text-white selection:bg-primary/30 rounded-2xl overflow-hidden border border-white/5">
            {/* Sidebar */}
            <div className="w-[340px] border-r border-white/5 flex flex-col bg-neutral-950">
                {/* Header */}
                <div className="p-5 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-serif italic text-primary/80">Support Hub</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{adminProfile?.full_name || 'Agent'}</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white/5 rounded-xl p-1">
                        <button onClick={() => { setTab('chats'); setSelectedTicket(null) }} className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2", tab === 'chats' ? "bg-primary text-black" : "text-white/40 hover:text-white/60")}>
                            <MessageSquare className="w-3.5 h-3.5" /> Chats
                            {openChats > 0 && <span className="w-4 h-4 bg-rose-500 rounded-full text-[8px] text-white flex items-center justify-center">{openChats}</span>}
                        </button>
                        <button onClick={() => { setTab('tickets'); setSelectedSession(null) }} className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2", tab === 'tickets' ? "bg-primary text-black" : "text-white/40 hover:text-white/60")}>
                            <Ticket className="w-3.5 h-3.5" /> Tickets
                            {openTickets > 0 && <span className="w-4 h-4 bg-rose-500 rounded-full text-[8px] text-white flex items-center justify-center">{openTickets}</span>}
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={tab === 'chats' ? "Search by name, email..." : "Search tickets..."}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:border-primary/40 focus:bg-primary/5 outline-none transition-all placeholder:text-white/15"
                        />
                    </div>

                    {/* Status Filter (Chats) */}
                    {tab === 'chats' && (
                        <div className="flex gap-2">
                            {(['open', 'closed', 'all'] as const).map(f => (
                                <button key={f} onClick={() => setStatusFilter(f)} className={cn("flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border", statusFilter === f ? "bg-primary/10 border-primary/30 text-primary" : "border-white/5 text-white/20 hover:text-white/40")}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {tab === 'chats' ? (
                        filteredSessions.length === 0 ? (
                            <div className="p-8 text-center space-y-3 opacity-20 mt-10">
                                <MessageSquare className="w-8 h-8 mx-auto" />
                                <p className="text-[10px] uppercase font-black tracking-widest leading-loose">No sessions found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredSessions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { setSelectedSession(s); setSelectedTicket(null) }}
                                        className={cn(
                                            "w-full p-5 text-left transition-all hover:bg-white/5 group relative",
                                            selectedSession?.id === s.id && "bg-primary/5 border-l-2 border-primary"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-sm text-white/90 truncate max-w-[160px]">{s.guest_name || 'Anonymous'}</p>
                                            <span className="text-[9px] text-white/20 font-black">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[10px] text-white/30 font-serif italic mb-2 truncate">{s.guest_email || 'No email'}</p>
                                        <div className="flex gap-2 items-center">
                                            {s.status === 'closed' ? (
                                                <span className="text-[8px] bg-white/5 text-white/30 px-2 py-0.5 rounded-full font-black uppercase">Closed</span>
                                            ) : s.agent_id ? (
                                                <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-black uppercase">Claimed</span>
                                            ) : (
                                                <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Waiting</span>
                                            )}
                                            {s.guest_phone && <span className="text-[8px] text-white/15 flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{s.guest_phone}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )
                    ) : (
                        filteredTickets.length === 0 ? (
                            <div className="p-8 text-center space-y-3 opacity-20 mt-10">
                                <Ticket className="w-8 h-8 mx-auto" />
                                <p className="text-[10px] uppercase font-black tracking-widest leading-loose">No tickets found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredTickets.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setSelectedTicket(t); setSelectedSession(null) }}
                                        className={cn(
                                            "w-full p-5 text-left transition-all hover:bg-white/5",
                                            selectedTicket?.id === t.id && "bg-primary/5 border-l-2 border-primary"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-xs text-white/90 truncate max-w-[180px]">{t.subject || 'No Subject'}</p>
                                            <span className={cn("text-[8px] px-2 py-0.5 rounded-full font-black uppercase",
                                                t.status === 'open' ? "bg-amber-500/10 text-amber-500" :
                                                    t.status === 'in_progress' ? "bg-blue-500/10 text-blue-500" :
                                                        "bg-emerald-500/10 text-emerald-500"
                                            )}>{t.status}</span>
                                        </div>
                                        <p className="text-[10px] text-white/30 truncate mb-1">{t.guest_name || 'Unknown'} • {t.category || 'General'}</p>
                                        <p className="text-[9px] text-white/15">{new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </button>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {selectedSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-5 bg-neutral-950 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white/90">{selectedSession.guest_name}</h3>
                                    <div className="flex items-center gap-3 text-[9px] text-white/25 uppercase tracking-wider font-black">
                                        {selectedSession.guest_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedSession.guest_email}</span>}
                                        {selectedSession.guest_phone && <><span className="w-1 h-1 bg-white/10 rounded-full" /><span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedSession.guest_phone}</span></>}
                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(selectedSession.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {!selectedSession.agent_id && selectedSession.status === 'open' && (
                                    <Button onClick={() => claimSession(selectedSession)} className="bg-primary text-black font-black text-[9px] uppercase tracking-widest px-5 h-9 hover:bg-white border-none rounded-xl">
                                        Claim Chat
                                    </Button>
                                )}
                                {selectedSession.status === 'open' && (
                                    <Button onClick={() => resolveSession(selectedSession)} variant="outline" className="border-white/10 text-white/40 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-[9px] uppercase font-black px-5 h-9 tracking-widest rounded-xl">
                                        Resolve
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-5 no-scrollbar bg-neutral-950/50">
                            {messages.length === 0 && (
                                <div className="text-center py-20 opacity-10">
                                    <MessageSquare className="w-10 h-10 mx-auto mb-4" />
                                    <p className="text-xs uppercase tracking-widest font-black">No messages yet</p>
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={cn("flex flex-col gap-1.5", m.role === 'agent' ? "items-end" : m.role === 'system' ? "items-center" : "items-start")}>
                                    <div className="flex items-center gap-2 px-1 text-[8px] uppercase tracking-widest font-black text-white/10">
                                        <span>{m.sender_name || m.role}</span>
                                        <span className="w-0.5 h-0.5 bg-white/10 rounded-full" />
                                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={cn(
                                        "max-w-[65%] px-5 py-4 text-sm leading-relaxed",
                                        m.role === 'agent' ? "bg-primary text-black font-semibold rounded-2xl rounded-tr-sm" :
                                            m.role === 'system' ? "bg-white/[0.03] text-white/20 italic text-center text-[10px] uppercase tracking-widest font-black py-3 px-6 rounded-xl border border-white/5 max-w-full" :
                                                "bg-neutral-900 border border-white/5 text-white/80 rounded-2xl rounded-tl-sm font-serif italic"
                                    )}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-neutral-950 border-t border-white/5">
                            {selectedSession.status === 'closed' ? (
                                <div className="text-center py-3 text-[10px] text-white/20 uppercase tracking-widest font-black flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500/40" /> Session Resolved
                                </div>
                            ) : (
                                <form
                                    className="relative flex items-center gap-3"
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        const input = (e.target as any).querySelector('input')
                                        if (input.value.trim()) {
                                            sendMessage(input.value)
                                            input.value = ''
                                        }
                                    }}
                                >
                                    <div className="flex-1 relative">
                                        <input
                                            disabled={!selectedSession.agent_id || selectedSession.agent_id !== adminProfile?.id}
                                            placeholder={selectedSession.agent_id && selectedSession.agent_id === adminProfile?.id ? "Type your response..." : "Claim this chat first to reply"}
                                            className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-6 pr-14 text-sm focus:border-primary/40 outline-none transition-all placeholder:text-white/10 text-white"
                                        />
                                        <button type="submit" disabled={!selectedSession.agent_id} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary text-black flex items-center justify-center hover:bg-white transition-all disabled:opacity-20">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </>
                ) : selectedTicket ? (
                    <>
                        {/* Ticket Detail */}
                        <div className="px-8 py-5 bg-neutral-950 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedTicket(null)} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div>
                                    <h3 className="text-base font-bold text-white/90">{selectedTicket.subject}</h3>
                                    <div className="flex items-center gap-3 text-[9px] text-white/25 uppercase tracking-wider font-black mt-0.5">
                                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{selectedTicket.category || 'General'}</span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                        <span>#{selectedTicket.id?.slice(0, 8).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedTicket.status === 'open' && (
                                    <Button onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')} className="bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest px-5 h-9 hover:bg-blue-600 border-none rounded-xl">
                                        Start Working
                                    </Button>
                                )}
                                {selectedTicket.status !== 'resolved' && (
                                    <Button onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} variant="outline" className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 text-[9px] uppercase font-black px-5 h-9 tracking-widest rounded-xl">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Resolve
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            {/* Customer Info Card */}
                            <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 mb-6 space-y-4">
                                <h4 className="text-[10px] text-white/20 uppercase tracking-widest font-black">Customer Information</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-white/15 uppercase tracking-wider font-black">Name</p>
                                        <p className="text-sm text-white/80">{selectedTicket.guest_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-white/15 uppercase tracking-wider font-black">Email</p>
                                        <p className="text-sm text-white/80">{selectedTicket.guest_email || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-white/15 uppercase tracking-wider font-black">Phone</p>
                                        <p className="text-sm text-white/80">{selectedTicket.guest_phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Content */}
                            <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] text-white/20 uppercase tracking-widest font-black">Ticket Details</h4>
                                    <span className={cn("text-[9px] px-3 py-1 rounded-full font-black uppercase",
                                        selectedTicket.status === 'open' ? "bg-amber-500/10 text-amber-500" :
                                            selectedTicket.status === 'in_progress' ? "bg-blue-500/10 text-blue-500" :
                                                "bg-emerald-500/10 text-emerald-500"
                                    )}>{selectedTicket.status}</span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[9px] text-white/15 uppercase tracking-wider font-black mb-1">Description</p>
                                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{selectedTicket.description || selectedTicket.message || 'No description provided.'}</p>
                                    </div>
                                    <div className="flex gap-6 text-[9px] text-white/20 pt-2 border-t border-white/5">
                                        <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
                                        {selectedTicket.order_number && <span>Order: #{selectedTicket.order_number}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5">
                            {tab === 'chats' ? <MessageSquare className="w-14 h-14" /> : <Ticket className="w-14 h-14" />}
                        </div>
                        <h2 className="text-3xl font-serif italic">Support Dashboard</h2>
                        <p className="text-xs uppercase tracking-[0.5em] mt-3 ml-[0.5em]">Select a {tab === 'chats' ? 'conversation' : 'ticket'} to begin</p>
                    </div>
                )}
            </div>
        </div>
    )
}
