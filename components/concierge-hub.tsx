'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Send, Ticket, Loader2, CheckCircle2, User, Phone, Mail, Star, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createSupportTicket, getBotResponse, getCurrentUserProfile } from '@/app/actions'
import { Button } from '@/components/ui/button'

type ViewState = 'bubble' | 'toast' | 'details' | 'chat' | 'feedback' | 'success'
type AgentType = { name: string, role: string, avatar: string, status?: string }

const AGENTS: Record<string, AgentType> = {
    aurxy: { name: 'AURXY', role: 'AI Assistant', avatar: 'A', status: 'Always Active' },
    shahid: { name: 'Shahid', role: 'Support Agent', avatar: 'S', status: 'Active Now' }
}

export function ConciergeHub() {
    const pathname = usePathname()
    const [view, setView] = useState<ViewState>('bubble')
    const [agent, setAgent] = useState<AgentType>(AGENTS.aurxy)
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string, sender?: string }[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [showProfile, setShowProfile] = useState(true)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [guestData, setGuestData] = useState({ name: '', email: '', phone: '' })
    const [resolution, setResolution] = useState<'yes' | 'no' | null>(null)
    const [rating, setRating] = useState(0)
    const [feedbackLoading, setFeedbackLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    if (pathname?.startsWith('/admin')) return null

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

    const startChat = () => {
        if (userProfile) {
            setView('chat')
            if (messages.length === 0) {
                setMessages([{
                    role: 'bot',
                    sender: 'AURXY',
                    content: `Namaste ${userProfile.name?.split(' ')[0] || 'valued guest'}! I'm AURXY, How may I assist you today?`
                }])
            }
        } else {
            setView('details')
        }
    }

    const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setView('chat')
        if (messages.length === 0) {
            setMessages([{
                role: 'bot',
                sender: 'AURXY',
                content: `Namaste ${guestData.name.split(' ')[0]}! I'm AURXY, your personal guide. How may I assist you today?`
            }])
        }
    }

    const handleAction = async (action: string) => {
        if (action === 'expert') {
            setMessages(prev => [...prev, { role: 'user', content: 'Talk to an Expert' }])
            setIsTransferring(true)

            // Best Practice: Brief connection delay
            setTimeout(() => {
                setIsTransferring(false)
                setAgent(AGENTS.shahid)
                setMessages(prev => [...prev, {
                    role: 'bot',
                    sender: 'AURXY',
                    content: "Let me connect you to an expert who can help you with that."
                }, {
                    role: 'bot',
                    sender: 'System',
                    content: "You have been transferred to: Shahid."
                }])

                // Best Practice: Shahid greets after joining
                setTimeout(() => {
                    setIsTyping(true)
                    setTimeout(() => {
                        setIsTyping(false)
                        setMessages(prev => [...prev, {
                            role: 'bot',
                            sender: 'Shahid',
                            content: `Hello! I'm Shahid. I see you were talking to AURXY. How can I help you today?`
                        }])
                    }, 2000)
                }, 1000)
            }, 3000)
        }
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
                    content: response
                }])
            }, 1000)
        } else {
            // Simulated human agent behavior
            setIsTyping(true)
            setTimeout(() => {
                setIsTyping(false)
                setMessages(prev => [...prev, {
                    role: 'bot',
                    sender: agent.name,
                    content: "I'm checking that for you right now. One moment please."
                }])
            }, 2500)
        }
    }

    const closeChat = () => {
        setMessages(prev => [...prev, { role: 'bot', sender: 'System', content: "You have closed the chat." }])
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
                {/* Toast View */}
                {view === 'toast' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        onClick={startChat}
                        className="bg-neutral-900/90 backdrop-blur-xl border border-primary/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">AURERXA Concierge</p>
                            <p className="text-sm text-white/90 font-serif italic">How can I help you?</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setView('bubble'); }}
                            className="ml-2 text-white/20 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                {/* Main Hub Window */}
                {(view === 'details' || view === 'chat' || view === 'feedback' || view === 'success') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[320px] md:w-[400px] h-[600px] bg-neutral-950 border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-6 bg-neutral-900 border-b border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {agent.avatar}
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white/90">{agent.name}</h3>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">{agent.status || agent.role}</p>
                                    </div>
                                </div>
                                <button onClick={() => setView('bubble')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Session Info Wrapper */}
                            {view === 'chat' && activeProfile && (
                                <div className="bg-black/40 rounded-xl overflow-hidden border border-white/5">
                                    <button
                                        onClick={() => setShowProfile(!showProfile)}
                                        className="w-full p-3 flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest hover:text-white transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-primary/60" />
                                            <span>Session Context</span>
                                        </div>
                                        {showProfile ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                    <AnimatePresence>
                                        {showProfile && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2"
                                            >
                                                <div className="grid grid-cols-[60px_1fr] gap-x-2 text-[10px]">
                                                    <span className="text-white/30 uppercase font-bold">Guest:</span>
                                                    <span className="text-white/80 font-serif italic truncate">{activeProfile.name}</span>

                                                    <span className="text-white/30 uppercase font-bold">Contact:</span>
                                                    <span className="text-white/80 font-serif italic truncate">{activeProfile.phone || activeProfile.email}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 flex flex-col" ref={scrollRef}>
                            {view === 'details' ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                                    <div className="text-center space-y-2 mb-8 mt-4">
                                        <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-black">Identity Verification</p>
                                        <h4 className="text-lg font-serif italic text-white/90 underline decoration-primary/20 underline-offset-8">Welcome to Heritage Support</h4>
                                        <p className="text-[10px] text-white/30 max-w-[200px] mx-auto leading-relaxed">To provide a bespoke experience, please share your details with us.</p>
                                    </div>

                                    <form onSubmit={handleGuestSubmit} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    required placeholder="Your Name"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all"
                                                    value={guestData.name}
                                                    onChange={e => setGuestData({ ...guestData, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    required type="tel" placeholder="Mobile Number"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all"
                                                    value={guestData.phone}
                                                    onChange={e => setGuestData({ ...guestData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">E-mail Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    required type="email" placeholder="Email"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-primary/40 focus:bg-primary/5 transition-all"
                                                    value={guestData.email}
                                                    onChange={e => setGuestData({ ...guestData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full h-12 bg-primary text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:bg-white transition-all mt-4 border-none">
                                            Begin Your Journey
                                        </Button>
                                    </form>
                                </motion.div>
                            ) : view === 'success' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-serif italic text-white/90">Thank You!</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Your feedback helps us shine.</p>
                                    </div>
                                </div>
                            ) : view === 'feedback' ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="text-center space-y-2">
                                        <p className="text-sm font-serif italic text-white/80">Was the case resolved during the chat?</p>
                                        <div className="flex gap-4 justify-center pt-2">
                                            <button
                                                onClick={() => setResolution('yes')}
                                                className={cn(
                                                    "px-6 py-2 rounded-xl text-xs font-bold transition-all border",
                                                    resolution === 'yes' ? "bg-emerald-500 border-emerald-500 text-black" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                                )}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setResolution('no')}
                                                className={cn(
                                                    "px-6 py-2 rounded-xl text-xs font-bold transition-all border",
                                                    resolution === 'no' ? "bg-rose-500 border-rose-500 text-black" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                                )}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <p className="text-sm font-serif italic text-white/80">How would you rate this chat?</p>
                                        <div className="flex gap-2 justify-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} onClick={() => setRating(star)} className="p-1">
                                                    <Star className={cn("w-6 h-6 transition-colors", rating >= star ? "fill-amber-500 text-amber-500" : "text-white/10")} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={submitFeedback}
                                        disabled={!resolution || rating === 0 || feedbackLoading}
                                        className="w-full bg-amber-500 text-black rounded-xl font-bold uppercase tracking-widest text-[10px] h-12"
                                    >
                                        {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={cn("flex flex-col gap-1.5", msg.role === 'user' ? "items-end" : "items-start")}>
                                            {msg.sender && <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold px-1">{msg.sender}</span>}
                                            <div className={cn(
                                                "p-4 text-[12px] leading-relaxed max-w-[85%] shadow-xl",
                                                msg.role === 'user' ? "bg-amber-500 text-black rounded-2xl rounded-tr-none font-bold" :
                                                    msg.sender === 'System' ? "bg-white/5 text-white/40 italic text-center w-full border border-white/5 rounded-xl block" :
                                                        "bg-neutral-900 text-white/70 rounded-2xl rounded-tl-none font-serif italic"
                                            )}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}

                                    {isThinking && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                            </div>
                                            <div className="bg-neutral-900 rounded-2xl rounded-tl-none p-3 flex gap-1 items-center shadow-lg border border-white/5">
                                                <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
                                                <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce delay-100" />
                                                <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    )}

                                    {isTransferring && (
                                        <div className="py-4 text-center space-y-2">
                                            <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
                                            <p className="text-[8px] text-white/30 uppercase tracking-[0.4em] font-black">Connecting to Expert...</p>
                                        </div>
                                    )}

                                    {isTyping && (
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold px-1">{agent.name} is typing...</span>
                                            <div className="bg-neutral-900 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center shadow-lg border border-white/5">
                                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse capitalize" />
                                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse delay-150" />
                                                <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse delay-300" />
                                            </div>
                                        </div>
                                    )}

                                    {messages.length === 1 && !isTransferring && (
                                        <div className="space-y-3 pt-4">
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold px-1">How can we assist you?</p>
                                            <button
                                                onClick={() => handleAction('expert')}
                                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-white/80 hover:bg-primary/20 hover:border-primary/30 transition-all flex items-center justify-between group shadow-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <MessageCircle className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-serif italic text-sm">Talk to an Expert</span>
                                                </div>
                                                <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {view === 'chat' && (
                            <div className="p-4 border-t border-white/5 bg-neutral-900 flex flex-col gap-4">
                                <form
                                    className="relative"
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        const input = (e.target as any).querySelector('input')
                                        if (input.value.trim()) {
                                            sendMessage(input.value)
                                            input.value = ''
                                        }
                                    }}
                                >
                                    <input
                                        placeholder="Type your message..."
                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 pr-12 text-xs focus:border-amber-500/40 outline-none transition-all placeholder:text-white/20 text-white"
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center hover:bg-white transition-all shadow-lg active:scale-95">
                                        <Send className="w-3 h-3" />
                                    </button>
                                </form>
                                <div className="flex items-center justify-between px-2">
                                    <button onClick={closeChat} className="text-[9px] text-white/30 hover:text-rose-500 transition-colors uppercase font-black tracking-[0.2em]">Close Request</button>
                                    <p className="text-[7px] text-white/10 uppercase tracking-[0.4em] font-black italic">Heritage Support by AURERXA</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble Button */}
            <motion.button
                onClick={() => {
                    if (view === 'bubble' || view === 'toast') {
                        startChat()
                    } else {
                        setView('bubble')
                    }
                }}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                    "pointer-events-auto w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center relative group overflow-hidden shadow-2xl",
                    "bg-neutral-950 border border-primary/30"
                )}
                aria-label="Open AURERXA Concierge Hub"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 opacity-50" />
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_3s_linear_infinite]" />

                <AnimatePresence mode="wait">
                    {view === 'bubble' || view === 'toast' ? (
                        <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-8 h-8 md:w-10 md:h-10">
                            <img
                                src="https://img.icons8.com/?size=100&id=87048&format=png&color=000000"
                                alt="AURERXA Concierge"
                                className="w-full h-full object-contain brightness-0 invert"
                            />
                        </motion.div>
                    ) : (
                        <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <X className="w-6 h-6 md:w-8 md:h-8 relative z-10 text-primary" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
