'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, PackageCheck, ShoppingCart, XCircle, AlertCircle } from 'lucide-react'
import { getOrdersPollingData, getSingleOrderForNotification } from '@/app/admin/actions'
import { cn } from '@/lib/utils'

export function AdminNotifications() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const lastKnownRef = useRef<{ id: string | null; timestamp: string | null; total: number | null }>({
        id: null, timestamp: null, total: null
    })
    const isFirstPoll = useRef(true)

    const addNotification = (n: any) => {
        setNotifications(prev => {
            // Avoid duplicates by timestamp/id
            if (prev.find(item => item.timestamp === n.timestamp && item.id === n.id)) return prev
            return [n, ...prev].slice(0, 50)
        })
        setUnreadCount(prev => prev + 1)

        // 🔊 Event-specific sounds
        const sounds: Record<string, string> = {
            new_order: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Ding
            confirmed: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Subtle success
            cancelled: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Low alert
            deleted: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'    // Pop/Swoosh
        }

        try {
            const soundUrl = sounds[n.type] || sounds[n.status] || sounds.new_order
            const audio = new Audio(soundUrl)
            audio.volume = 0.4
            audio.play().catch(() => { })
        } catch (e) { /* ignore */ }
    }

    // 🎯 PRIMARY: Polling for rich notifications & deletions
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>

        const pollForChanges = async () => {
            try {
                const data = await getOrdersPollingData()
                if (!data) return

                const prev = lastKnownRef.current
                const latest = data.latestOrder

                // First poll baseline
                if (isFirstPoll.current) {
                    lastKnownRef.current = {
                        id: data.latestId,
                        timestamp: data.latestTimestamp,
                        total: data.totalOrders
                    }
                    isFirstPoll.current = false
                    return
                }

                // 1. Detect Deletion (Count decreased)
                if (data.totalOrders < (prev.total || 0)) {
                    addNotification({
                        id: `del-${Date.now()}`,
                        type: 'deleted',
                        title: '🗑️ Order Deleted',
                        message: 'An order was removed from the database.',
                        detail: `Orders remaining: ${data.totalOrders}`,
                        time: new Date(),
                        timestamp: Date.now().toString(),
                        read: false
                    })
                    router.refresh()
                }

                // 2. Detect New Order (ID changed and it's not the first poll)
                const isNewOrder = data.latestId !== prev.id && data.latestId !== null
                // 3. Detect Update (Same ID but timestamp changed)
                const isUpdate = !isNewOrder && data.latestTimestamp !== prev.timestamp && latest

                if (isNewOrder || isUpdate) {
                    const productNames = latest.order_items?.map((item: any) => item.products?.name).join(', ') || 'Various items'

                    const notification = {
                        id: latest.id,
                        order_number: latest.order_number,
                        type: isNewOrder ? 'new_order' : latest.status,
                        status: latest.status,
                        title: isNewOrder ? '🛍️ New Order' : `📦 Order ${latest.status}`,
                        message: `Order #${latest.order_number} • ${productNames}`,
                        detail: `Total: ₹${latest.total.toLocaleString('en-IN')}`,
                        time: new Date(),
                        timestamp: data.latestTimestamp,
                        read: false
                    }

                    addNotification(notification)

                    // Also show toast
                    if (isNewOrder) {
                        toast.success(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-[#D4AF37]">🛍️ New Order: #{latest.order_number}</span>
                                <span className="text-xs opacity-80">{productNames}</span>
                            </div>,
                            { duration: 8000 }
                        )
                    } else if (latest.status === 'cancelled') {
                        toast.error(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-red-400">❌ Order Cancelled: #{latest.order_number}</span>
                                <span className="text-xs opacity-80">Status: {latest.status}</span>
                            </div>,
                            { duration: 8000 }
                        )
                    }

                    router.refresh()
                }

                // Update ref
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
        intervalId = setInterval(pollForChanges, 10000) // Poll less frequently, Realtime will catch most
        return () => clearInterval(intervalId)
    }, [router])

    // 🔌 PRIMARY: Supabase Realtime for INSTANT "Attack" notifications
    useEffect(() => {
        const handleOrderChange = async (payload: any) => {
            console.log('⚡ Realtime Order Change:', payload)

            if (payload.eventType === 'INSERT') {
                const latest = await getSingleOrderForNotification(payload.new.id)
                if (latest) {
                    const productNames = latest.order_items?.map((item: any) => item.products?.name).join(', ') || 'Various items'

                    const notification = {
                        id: latest.id,
                        order_number: latest.order_number,
                        type: 'new_order',
                        status: latest.status,
                        title: '🛍️ New Order',
                        message: `Order #${latest.order_number} • ${productNames}`,
                        detail: `Total: ₹${latest.total.toLocaleString('en-IN')}`,
                        time: new Date(),
                        timestamp: latest.updated_at || latest.created_at,
                        read: false
                    }

                    addNotification(notification)

                    toast.success(
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-[#D4AF37]">🛍️ New Order: #{latest.order_number}</span>
                            <span className="text-xs text-white/90">{productNames}</span>
                        </div>,
                        { duration: 10000 }
                    )
                }
            } else if (payload.eventType === 'UPDATE') {
                if (payload.old.status !== payload.new.status) {
                    const latest = await getSingleOrderForNotification(payload.new.id)
                    if (latest) {
                        const productNames = latest.order_items?.map((item: any) => item.products?.name).join(', ') || 'Various items'
                        const isCancelled = latest.status === 'cancelled'

                        const notification = {
                            id: latest.id,
                            order_number: latest.order_number,
                            type: latest.status,
                            status: latest.status,
                            title: isCancelled ? '❌ Order Cancelled' : `📦 Order ${latest.status}`,
                            message: `Order #${latest.order_number} • ${productNames}`,
                            detail: `Total: ₹${latest.total.toLocaleString('en-IN')}`,
                            time: new Date(),
                            timestamp: latest.updated_at,
                            read: false
                        }

                        addNotification(notification)

                        if (isCancelled) {
                            toast.error(
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-red-400">❌ Order Cancelled: #{latest.order_number}</span>
                                    <span className="text-xs text-white/90">Click to view details</span>
                                </div>,
                                { duration: 10000 }
                            )
                        } else {
                            toast.info(
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-sky-400">📦 Order Update: #{latest.order_number}</span>
                                    <span className="text-xs text-white/90">Status changed to {latest.status}</span>
                                </div>,
                                { duration: 8000 }
                            )
                        }
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

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router])

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <button
                onClick={() => { setIsOpen(!isOpen); setUnreadCount(0) }}
                className="relative bg-[#111111] border border-[#D4AF37]/30 text-[#D4AF37] p-3 rounded-full shadow-2xl hover:bg-[#D4AF37] hover:text-black transition-all group"
            >
                <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                </div>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 bg-[#111111] border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                    <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        <button onClick={() => setNotifications([])} className="text-[10px] text-white/40 hover:text-white uppercase tracking-wider">Clear All</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-1">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-white/30 text-xs">
                                No new notifications
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {notifications.map((n) => (
                                    <div
                                        key={`${n.id}-${n.timestamp}`}
                                        className="p-3 hover:bg-white/[0.03] rounded-xl transition cursor-pointer border border-transparent hover:border-white/5 group/notif"
                                        onClick={() => router.push(`/admin/orders?highlight=${n.id}`)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "mt-1 w-2 h-2 rounded-full shrink-0",
                                                n.type === 'new_order' ? 'bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]' :
                                                    n.status === 'cancelled' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                            )} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={cn(
                                                        "text-[11px] font-bold uppercase tracking-wider",
                                                        n.status === 'cancelled' ? 'text-red-400' :
                                                            n.type === 'new_order' ? 'text-[#D4AF37]' : 'text-emerald-400'
                                                    )}>{n.title}</p>
                                                    <p className="text-[9px] text-white/20">{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                <p className="text-xs text-white/80 font-medium truncate mt-0.5">{n.message}</p>
                                                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/[0.03]">
                                                    <p className="text-[10px] text-white/40 font-medium">{n.detail}</p>
                                                    <span className="text-[9px] text-[#D4AF37]/60 group-hover/notif:text-[#D4AF37] transition-colors font-bold uppercase tracking-widest">Details →</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
