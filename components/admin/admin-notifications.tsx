'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getOrdersPollingData, getSingleOrderForNotification } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

type Notification = {
    id: string
    order_number?: string
    type: string
    status?: string
    title: string
    message: string
    detail: string
    time: Date
    timestamp: string
    read: boolean
}

export function AdminNotifications() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [pulse, setPulse] = useState(false)
    const lastKnownRef = useRef<{ id: string | null; timestamp: string | null; total: number | null }>({
        id: null, timestamp: null, total: null
    })
    const isFirstPoll = useRef(true)
    const panelRef = useRef<HTMLDivElement>(null)

    // Close panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // 🔊 Play notification sound
    const playSound = useCallback((type: string) => {
        try {
            const sounds: Record<string, string> = {
                new_order: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
                confirmed: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
                cancelled: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
                deleted: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
            }
            const audio = new Audio(sounds[type] || sounds.new_order)
            audio.volume = 0.5
            audio.play().catch(() => { })
        } catch { /* ignore */ }
    }, [])

    // ✨ Add notification to panel + auto-open + sound
    const addNotification = useCallback((n: Notification) => {
        setNotifications(prev => {
            if (prev.find(item => item.timestamp === n.timestamp && item.id === n.id)) return prev
            return [n, ...prev].slice(0, 50)
        })
        setUnreadCount(prev => prev + 1)

        // Auto-open the panel
        setIsOpen(true)

        // Pulse animation on bell
        setPulse(true)
        setTimeout(() => setPulse(false), 2000)

        // Play sound
        playSound(n.type)
    }, [playSound])

    // 🔁 BACKUP: Polling (every 15s, Realtime is primary)  
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>

        const pollForChanges = async () => {
            try {
                const data = await getOrdersPollingData()
                if (!data) return

                const prev = lastKnownRef.current

                if (isFirstPoll.current) {
                    lastKnownRef.current = {
                        id: data.latestId,
                        timestamp: data.latestTimestamp,
                        total: data.totalOrders
                    }
                    isFirstPoll.current = false
                    return
                }

                // Detect deletion
                if (data.totalOrders < (prev.total || 0)) {
                    addNotification({
                        id: `del-${Date.now()}`,
                        type: 'deleted',
                        title: '🗑️ Order Deleted',
                        message: 'An order was removed.',
                        detail: `Orders remaining: ${data.totalOrders}`,
                        time: new Date(),
                        timestamp: Date.now().toString(),
                        read: false
                    })
                    router.refresh()
                }

                // Detect new or updated
                const latest = data.latestOrder
                const isNewOrder = data.latestId !== prev.id && data.latestId !== null
                const isUpdate = !isNewOrder && data.latestTimestamp !== prev.timestamp && latest

                if ((isNewOrder || isUpdate) && latest) {
                    const productNames = latest.order_items?.map((item: any) => item.products?.name).join(', ') || 'Various items'
                    addNotification({
                        id: latest.id,
                        order_number: latest.order_number,
                        type: isNewOrder ? 'new_order' : latest.status,
                        status: latest.status,
                        title: isNewOrder ? '🛍️ New Order' : `📦 Order ${latest.status}`,
                        message: `Order #${latest.order_number} • ${productNames}`,
                        detail: `Total: ₹${latest.total?.toLocaleString('en-IN')}`,
                        time: new Date(),
                        timestamp: data.latestTimestamp || '',
                        read: false
                    })
                    router.refresh()
                }

                lastKnownRef.current = {
                    id: data.latestId,
                    timestamp: data.latestTimestamp,
                    total: data.totalOrders
                }
            } catch (e) {
                console.error('Notification poll error:', e)
            }
        }

        pollForChanges()
        intervalId = setInterval(pollForChanges, 15000)
        return () => clearInterval(intervalId)
    }, [router, addNotification])

    // ⚡ PRIMARY: Supabase Realtime for INSTANT notifications
    useEffect(() => {
        const handleOrderChange = async (payload: any) => {
            if (payload.eventType === 'INSERT') {
                const latest = await getSingleOrderForNotification(payload.new.id)
                if (latest) {
                    const productNames = latest.order_items?.map((item: any) => item.products?.name).join(', ') || 'Various items'
                    addNotification({
                        id: latest.id,
                        order_number: latest.order_number,
                        type: 'new_order',
                        status: latest.status,
                        title: '🛍️ New Order',
                        message: `Order #${latest.order_number} • ${productNames}`,
                        detail: `Total: ₹${latest.total?.toLocaleString('en-IN')}`,
                        time: new Date(),
                        timestamp: latest.updated_at || latest.created_at,
                        read: false
                    })
                }
            } else if (payload.eventType === 'UPDATE') {
                if (payload.old?.status !== payload.new?.status) {
                    const latest = await getSingleOrderForNotification(payload.new.id)
                    if (latest) {
                        const productNames = latest.order_items?.map((item: any) => item.products?.name).join(', ') || 'Various items'
                        const isCancelled = latest.status === 'cancelled'
                        addNotification({
                            id: latest.id,
                            order_number: latest.order_number,
                            type: isCancelled ? 'cancelled' : latest.status,
                            status: latest.status,
                            title: isCancelled ? '❌ Order Cancelled' : `📦 Order ${latest.status}`,
                            message: `Order #${latest.order_number} • ${productNames}`,
                            detail: `Total: ₹${latest.total?.toLocaleString('en-IN')}`,
                            time: new Date(),
                            timestamp: latest.updated_at || '',
                            read: false
                        })
                    }
                }
            } else if (payload.eventType === 'DELETE') {
                addNotification({
                    id: `del-${Date.now()}`,
                    type: 'deleted',
                    title: '🗑️ Order Deleted',
                    message: 'An order was just removed.',
                    detail: 'Database record deleted.',
                    time: new Date(),
                    timestamp: Date.now().toString(),
                    read: false
                })
            }
            router.refresh()
        }

        const channel = supabase
            .channel('admin-notifications-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handleOrderChange)
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [router, addNotification])

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_order': return '🛍️'
            case 'cancelled': return '❌'
            case 'deleted': return '🗑️'
            case 'confirmed': return '✅'
            case 'packed': return '📦'
            case 'shipped': return '🚚'
            case 'delivered': return '✨'
            default: return '📋'
        }
    }

    const getColor = (type: string) => {
        switch (type) {
            case 'new_order': return 'text-[#D4AF37]'
            case 'cancelled': return 'text-red-400'
            case 'deleted': return 'text-orange-400'
            case 'confirmed': return 'text-emerald-400'
            case 'shipped': return 'text-sky-400'
            case 'delivered': return 'text-green-400'
            default: return 'text-blue-400'
        }
    }

    const getDotColor = (type: string) => {
        switch (type) {
            case 'new_order': return 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]'
            case 'cancelled': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            case 'deleted': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
            default: return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
        }
    }

    return (
        <div ref={panelRef} className="fixed bottom-6 right-6 z-[100]">
            {/* 🔔 Bell Button */}
            <button
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) setUnreadCount(0) }}
                className={cn(
                    "relative bg-[#111111] border border-[#D4AF37]/30 text-[#D4AF37] p-3 rounded-full shadow-2xl hover:bg-[#D4AF37] hover:text-black transition-all duration-300 group",
                    pulse && "animate-bounce"
                )}
                aria-label="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-[#111111]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* 📋 Notification Panel */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-96 bg-[#0d0d0d] border border-[#D4AF37]/20 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-gradient-to-r from-[#D4AF37]/5 to-transparent flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                            <h3 className="font-bold text-sm text-white tracking-wider uppercase">Live Orders</h3>
                        </div>
                        <button
                            onClick={() => { setNotifications([]); setUnreadCount(0) }}
                            className="text-[10px] text-white/40 hover:text-red-400 uppercase tracking-wider font-bold transition-colors"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="text-3xl mb-2">🔔</div>
                                <p className="text-white/30 text-xs tracking-wider uppercase">No new notifications</p>
                                <p className="text-white/15 text-[10px] mt-1">Live updates will appear here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/[0.03]">
                                {notifications.map((n) => (
                                    <div
                                        key={`${n.id}-${n.timestamp}`}
                                        className="px-4 py-3 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group/notif"
                                        onClick={() => {
                                            if (n.order_number) {
                                                router.push(`/admin/orders?highlight=${n.id}`)
                                            }
                                            setIsOpen(false)
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Status dot */}
                                            <div className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", getDotColor(n.type))} />

                                            <div className="flex-1 min-w-0">
                                                {/* Title + Time */}
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={cn("text-[11px] font-bold uppercase tracking-wider", getColor(n.type))}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[9px] text-white/20 shrink-0 ml-2">
                                                        {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>

                                                {/* Message */}
                                                <p className="text-xs text-white/80 font-medium truncate mt-0.5">{n.message}</p>

                                                {/* Detail + Action */}
                                                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/[0.03]">
                                                    <p className="text-[10px] text-white/40 font-medium">{n.detail}</p>
                                                    {n.order_number && (
                                                        <span className="text-[9px] text-[#D4AF37]/60 group-hover/notif:text-[#D4AF37] transition-colors font-bold uppercase tracking-widest">
                                                            View →
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                            <button
                                onClick={() => { router.push('/admin/orders'); setIsOpen(false) }}
                                className="w-full text-center text-[10px] text-[#D4AF37]/70 hover:text-[#D4AF37] font-bold uppercase tracking-widest transition-colors py-1"
                            >
                                View All Orders →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
