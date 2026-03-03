'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Send, Loader2, CheckCircle2, User, Phone, Mail, Star, ChevronDown, ChevronUp, MessageCircle, Clock, ExternalLink } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn, sanitizeImagePath } from '@/lib/utils'
import { getBotResponse, getCurrentUserProfile, checkAgentAvailability, startChatSession, createSupportTicket } from '@/app/actions'
import { Button } from '@/components/ui/button'

type ViewState = 'bubble' | 'toast' | 'details' | 'chat' | 'ticket' | 'feedback' | 'success'
type AgentType = { name: string, role: string, avatar: string, status?: string }
type Message = {
    role: 'user' | 'bot' | 'System',
    sender?: string,
    content: string,
    actions?: { label: string, link?: string, action?: string }[]
}

const AGENTS: Record<string, AgentType> = {
    aurxy: { name: 'AURXY', role: 'AI Assistant', avatar: 'A', status: 'Always Active' }
}

export function ConciergeHub() {
    const pathname = usePathname()
    const router = useRouter()
    const [view, setView] = useState<ViewState>('bubble')
    const [agent, setAgent] = useState<AgentType>(AGENTS.aurxy)
    const [messages, setMessages] = useState<Message[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [showProfile, setShowProfile] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [guestData, setGuestData] = useState({ name: '', email: '', phone: '' })
    const [resolution, setResolution] = useState<'yes' | 'no' | null>(null)
    const [rating, setRating] = useState(0)
    const [feedbackLoading, setFeedbackLoading] = useState(false)
    const [ticketData, setTicketData] = useState({ subject: '', description: '', category: 'General' })
    const [ticketLoading, setTicketLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Initial Load: Fetch Profile
    useEffect(() => {
        getCurrentUserProfile().then(setUserProfile)
    }, [])

    // Toast Timer
    useEffect(() => {
        if (view === 'bubble') {
            const timer = setTimeout(() => setView('toast'), 5000)
            return () => clearTimeout(timer)
        }
    }, [view])

    // Auto Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isThinking, isTransferring, isTyping, view])

    // Hide on admin pages — placed AFTER all hooks to satisfy React rules
    if (pathname?.startsWith('/admin')) return null

    const startChat = () => {
        if (userProfile || (guestData.name && guestData.email)) {
            setView('chat')
            if (messages.length === 0) {
                const name = userProfile?.name || guestData.name
                setMessages([{
                    role: 'bot',
                    sender: 'AURXY',
                    content: `Namaste ${name.split(' ')[0]}! I'm AURXY, your personal guide to the AURERXA heritage. How may I assist you today?`,
                    actions: [
                        { label: "Browse Collections", link: "/collections" },
                        { label: "Talk to Expert", action: "expert" }
                    ]
                }])
            }
        } else {
            setView('details')
        }
    }

    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        startChat()
    }

    const handleAction = (item: { label: string, link?: string, action?: string }) => {
        if (item.link) {
            router.push(item.link)
        } else if (item.action === 'expert') {
            requestExpert()
        } else if (item.action === 'ticket') {
            setView('ticket')
        } else if (item.action === 'continue') {
            // Just dismiss, user continues chatting with AURXY
        }
    }

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setTicketLoading(true)
        const profile = userProfile || guestData
        const chatHistory = messages.map(m => `${m.sender || m.role}: ${m.content}`).join('\n')

        const result = await createSupportTicket({
            subject: ticketData.subject,
            description: ticketData.description,
            category: ticketData.category,
            name: profile.name || profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            userId: userProfile?.id,
            chatHistory
        })

        setTicketLoading(false)
        if (result.success) {
            const ticketId = (result as { success: boolean; ticketId?: string }).ticketId;
            setMessages(prev => [...prev, {
                role: 'System',
                content: `Ticket created successfully! Reference: #${ticketId?.slice(0, 8).toUpperCase() || 'PENDING'}. Our team will respond within 24 hours.`
            }])
            setTicketData({ subject: '', description: '', category: 'General' })
            setView('chat')
        } else {
            setMessages(prev => [...prev, {
                role: 'System',
                content: "Failed to create ticket. Please try again or contact us directly."
            }])
            setView('chat')
        }
    }

    const requestExpert = async () => {
        setMessages(prev => [...prev, { role: 'user', content: 'Connect me to an expert' }])
        setIsTransferring(true)

        const isAvailable = await checkAgentAvailability()

        setTimeout(() => {
            setIsTransferring(false)
            if (isAvailable) {
                setAgent({ name: 'Expert', role: 'Heritage Consultant', avatar: 'E', status: 'Live Now' })
                setMessages(prev => [...prev, {
                    role: 'bot',
                    sender: 'AURXY',
                    content: "I've found an available expert! Connecting you to our Heritage Consultant now..."
                }, {
                    role: 'System',
                    content: "You are now connected with a Live Expert."
                }])
            } else {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    sender: 'AURXY',
                    content: "Our experts are currently assisting other collectors. You can create a support ticket and our team will get back to you within 24 hours.",
                    actions: [
                        { label: "Create Ticket", action: "ticket" },
                        { label: "Continue with AURXY", action: "continue" }
                    ]
                }])
            }
        }, 2500)
    }

    const sendMessage = async (content: string) => {
        setMessages(prev => [...prev, { role: 'user', content }])

        if (agent.name === 'AURXY') {
            setIsThinking(true)
            const response = await getBotResponse(content)
            setTimeout(() => {
                setIsThinking(false)
                setMessages(prev => [...prev, {
                    role: 'bot',
                    sender: agent.name,
                    content: response.text,
                    actions: response.actions
                }])
            }, 1000)
        } else {
            setIsTyping(true)
            setTimeout(() => {
                setIsTyping(false)
                setMessages(prev => [...prev, {
                    role: 'bot',
                    sender: agent.name,
                    content: "I will look into that specifically for you. Please allow me a moment."
                }])
            }, 2000)
        }
    }

    const closeChat = () => {
        setMessages(prev => [...prev, { role: 'System', content: "Conversation ended." }])
        setTimeout(() => setView('feedback'), 1000)
    }

    const submitFeedback = () => {
        setFeedbackLoading(true)
        setTimeout(() => {
            setFeedbackLoading(false)
            setView('success')
            setTimeout(() => {
                setView('bubble')
                setMessages([])
                setAgent(AGENTS.aurxy)
                setRating(0)
                setResolution(null)
            }, 3000)
        }, 1000)
    }

    const activeProfile = userProfile || (guestData.name ? guestData : null)

    return (
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[60] flex flex-col items-end gap-4">
            <AnimatePresence mode="wait">
                {view === 'toast' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        onClick={startChat}
                        className="bg-neutral-900/90 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative shadow-inner">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900 shadow-lg" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">AURERXA Concierge</p>
                            <p className="text-sm text-white/90 font-serif italic">How can I help you?</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setView('bubble'); }} className="ml-2 text-white/20 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {(view === 'details' || view === 'chat' || view === 'ticket' || view === 'feedback' || view === 'success') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[320px] md:w-[400px] h-[640px] bg-neutral-950 border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="px-6 py-8 bg-neutral-900 border-b border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-2xl border border-primary/20">
                                            {agent.avatar}
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-900 shadow-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white/90 tracking-tight">{agent.name}</h3>
                                        <p className="text-[10px] text-primary/60 uppercase font-black tracking-[0.2em]">{agent.status || agent.role}</p>
                                    </div>
                                </div>
                                <button onClick={() => setView('bubble')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>


                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-6 space-y-6 flex flex-col" ref={scrollRef}>
                            {view === 'details' ? (
                                <div className="flex flex-col h-full justify-center">
                                    <div className="text-center space-y-3 mb-10">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
                                            <MessageCircle className="w-8 h-8 text-primary" />
                                        </div>
                                        <h4 className="text-xl font-serif italic text-white/90">Entry Formalities</h4>
                                        <p className="text-[10px] text-white/30 max-w-[240px] mx-auto leading-relaxed uppercase tracking-widest">To ensure a high-end experience, please identify yourself.</p>
                                    </div>
                                    <form onSubmit={handleGuestSubmit} className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black ml-1">Full Name</label>
                                            <input required placeholder="Heritage Collector Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all placeholder:text-white/10" value={guestData.name} onChange={e => setGuestData({ ...guestData, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black ml-1">Contact Details</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input required type="tel" placeholder="Mobile" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all placeholder:text-white/10" value={guestData.phone} onChange={e => setGuestData({ ...guestData, phone: e.target.value })} />
                                                <input required type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all placeholder:text-white/10" value={guestData.email} onChange={e => setGuestData({ ...guestData, email: e.target.value })} />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full h-14 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] rounded-2xl hover:bg-white transition-all mt-6 border-none shadow-[0_10px_30px_rgba(var(--primary),0.3)]">Request Access</Button>
                                    </form>
                                </div>
                            ) : view === 'ticket' ? (
                                <div className="flex flex-col h-full justify-center">
                                    <div className="text-center space-y-3 mb-8">
                                        <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                                            <Mail className="w-7 h-7 text-amber-500" />
                                        </div>
                                        <h4 className="text-lg font-serif italic text-white/90">Create Support Ticket</h4>
                                        <p className="text-[10px] text-white/30 max-w-[240px] mx-auto leading-relaxed uppercase tracking-widest">Our team will respond within 24 hours.</p>
                                    </div>
                                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black ml-1">Category</label>
                                            <select
                                                value={ticketData.category}
                                                onChange={e => setTicketData({ ...ticketData, category: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all appearance-none"
                                            >
                                                <option value="General" className="bg-neutral-900">General Inquiry</option>
                                                <option value="Order" className="bg-neutral-900">Order Issue</option>
                                                <option value="Return" className="bg-neutral-900">Return / Refund</option>
                                                <option value="Custom" className="bg-neutral-900">Custom Jewelry</option>
                                                <option value="Quality" className="bg-neutral-900">Quality Concern</option>
                                                <option value="Shipping" className="bg-neutral-900">Shipping Issue</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black ml-1">Subject</label>
                                            <input required placeholder="Brief summary of your issue" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all placeholder:text-white/10" value={ticketData.subject} onChange={e => setTicketData({ ...ticketData, subject: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-black ml-1">Description</label>
                                            <textarea required rows={3} placeholder="Please describe your concern in detail..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all placeholder:text-white/10 resize-none" value={ticketData.description} onChange={e => setTicketData({ ...ticketData, description: e.target.value })} />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={() => setView('chat')} className="flex-1 h-12 bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all border border-white/10">Back</button>
                                            <Button type="submit" disabled={ticketLoading} className="flex-1 h-12 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-all border-none shadow-[0_10px_30px_rgba(var(--primary),0.3)]">
                                                {ticketLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            ) : view === 'success' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-2xl font-serif italic text-white/90 underline decoration-emerald-500/30 underline-offset-8">Confirmed</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">Your satisfaction is our legacy.</p>
                                    </div>
                                </div>
                            ) : view === 'feedback' ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-10 animate-in fade-in slide-in-from-bottom-8">
                                    <div className="text-center space-y-4">
                                        <p className="text-lg font-serif italic text-white/80">Was your inquiry settled?</p>
                                        <div className="flex gap-5 justify-center pt-2">
                                            <button onClick={() => setResolution('yes')} className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2", resolution === 'yes' ? "bg-emerald-500 border-emerald-500 text-black shadow-lg" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10")}>Yes</button>
                                            <button onClick={() => setResolution('no')} className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2", resolution === 'no' ? "bg-rose-500 border-rose-500 text-black shadow-lg" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10")}>No</button>
                                        </div>
                                    </div>
                                    <div className="text-center space-y-6">
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">Rate your experience</p>
                                        <div className="flex gap-3 justify-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className="p-1 hover:scale-125 focus:scale-125 focus:outline-none transition-transform"
                                                    aria-label={`Rate ${star} out of 5 stars`}
                                                >
                                                    <Star className={cn("w-8 h-8 transition-colors", rating >= star ? "fill-amber-500 text-amber-500" : "text-white/5")} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={submitFeedback} disabled={!resolution || rating === 0 || feedbackLoading} className="w-full bg-amber-500 text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] h-14 shadow-xl">{feedbackLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Seal Review'}</Button>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-4">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                                            <div className="flex items-center gap-2 px-1 text-[7px] text-white/10 font-black tracking-widest uppercase">
                                                {msg.sender || msg.role} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className={cn(
                                                "p-5 text-sm leading-relaxed max-w-[88%] shadow-2xl transition-all",
                                                msg.role === 'user' ? "bg-primary text-black rounded-[2rem] rounded-tr-none font-bold" :
                                                    msg.role === 'System' ? "bg-white/[0.03] text-white/20 italic text-center w-full border border-white/5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest" :
                                                        "bg-neutral-900/80 text-white/80 rounded-[2rem] rounded-tl-none font-serif italic"
                                            )}>
                                                {msg.content}
                                            </div>
                                            {msg.actions && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {msg.actions.map((act, ai) => (
                                                        <button
                                                            key={ai}
                                                            onClick={() => handleAction(act)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-black transition-all group"
                                                        >
                                                            {act.label}
                                                            {act.link && <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100" />}
                                                            {act.action === 'expert' && <Sparkles className="w-3 h-3" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isThinking && (
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
                                            <div className="bg-neutral-900/50 rounded-2xl px-5 py-4 flex gap-1.5 items-center border border-white/5"><span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" /></div>
                                        </div>
                                    )}

                                    {isTransferring && (
                                        <div className="py-8 text-center space-y-4 animate-pulse"><div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10"><Clock className="w-6 h-6 text-primary animate-spin" /></div><p className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-black">Escalating to Expert...</p></div>
                                    )}

                                    {isTyping && (
                                        <div className="flex flex-col gap-2 items-start"><div className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-black">{agent.name} is composing...</div><div className="bg-neutral-900 rounded-3xl p-5 flex gap-1.5 items-center shadow-2xl border border-white/10"><div className="flex gap-1"><span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" /><span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse [animation-delay:0.2s]" /><span className="w-2 h-2 bg-primary/60 rounded-full animate-pulse [animation-delay:0.4s]" /></div></div></div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {view === 'chat' && (
                            <div className="p-6 border-t border-white/5 bg-neutral-900 flex flex-col gap-5">
                                <form className="relative flex items-center gap-3" onSubmit={(e) => { e.preventDefault(); const input = (e.target as any).querySelector('input'); if (input.value.trim()) { sendMessage(input.value); input.value = ''; } }}>
                                    <div className="relative flex-1 group">
                                        <input placeholder="Consult our heritage experts..." className="w-full h-14 bg-white/5 border border-white/10 rounded-[1.25rem] px-6 pr-14 text-sm focus:border-primary/60 focus:bg-primary/[0.02] outline-none transition-all placeholder:text-white/10 text-white shadow-inner" />
                                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-primary text-black flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-90 group-focus-within:shadow-primary/20"><Send className="w-4 h-4" /></button>
                                    </div>
                                </form>
                                <div className="flex items-center justify-between px-2">
                                    <button onClick={closeChat} className="text-[9px] text-white/30 hover:text-rose-500 transition-colors uppercase font-black tracking-[0.3em]">End Journey</button>
                                    <p className="text-[8px] text-white/5 uppercase tracking-[0.5em] font-black italic">AURERXA Legacy Hub</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => { if (view === 'bubble' || view === 'toast') { startChat() } else { setView('bubble') } }}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn("pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center relative group overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]", "bg-neutral-950 border border-primary/20")}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 opacity-50" />
                <AnimatePresence mode="wait">
                    {view === 'bubble' || view === 'toast' ? (
                        <motion.div key="open" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative z-10 w-10 h-10 md:w-12 md:h-12">
                            <img src={sanitizeImagePath("https://img.icons8.com/?size=100&id=87048&format=png&color=000000")} alt="AURERXA" className="w-full h-full object-contain brightness-0 invert opacity-40 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    ) : (
                        <motion.div key="close" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}><X className="w-7 h-7 md:w-9 md:h-9 relative z-10 text-primary" /></motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
