'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ShoppingCart, XCircle, AlertCircle } from 'lucide-react'

export function AdminNotifications() {
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Initialize simple notification sound
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3') // Simple ding sound
        audioRef.current.volume = 0.5
    }, [])

    const playSound = () => {
        try {
            audioRef.current?.play().catch(e => console.log('Audio play failed (user interaction needed first):', e))
        } catch (e) {
            console.error('Audio error', e)
        }
    }

    const addNotification = (n: any) => {
        setNotifications(prev => [n, ...prev].slice(0, 50))
        setUnreadCount(prev => prev + 1)
        playSound()
    }

    useEffect(() => {
        console.log('Initializing Admin Notifications Subscription...')

        const channel = supabase
            .channel('admin-orders-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    const newOrder = payload.new as any
                    console.log('New Order Received:', newOrder)

                    const notification = {
                        id: Date.now(),
                        type: 'new_order',
                        title: 'New Order Received!',
                        message: `Order #${newOrder.order_number} • ₹${newOrder.total}`,
                        time: new Date(),
                        read: false
                    }
                    addNotification(notification)

                    toast.success(
                        <div className="flex flex-col gap-1">
                            <span className="font-bold">{notification.title}</span>
                            <span className="text-xs">{notification.message}</span>
                        </div>,
                        {
                            icon: <ShoppingCart className="w-5 h-5 text-emerald-500" />,
                            duration: 8000,
                            action: {
                                label: 'View',
                                onClick: () => router.push('/admin/orders')
                            }
                        }
                    )
                    router.refresh()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    const updatedOrder = payload.new as any
                    const oldOrder = payload.old as any

                    // Check for Status Change
                    if (updatedOrder.status !== oldOrder.status) {
                        console.log('Order Status Changed:', updatedOrder.status)

                        if (updatedOrder.status === 'cancelled') {
                            const notification = {
                                id: Date.now(),
                                type: 'cancelled',
                                title: 'Order Cancelled',
                                message: `Order #${updatedOrder.order_number} has been cancelled.`,
                                time: new Date(),
                                read: false
                            }
                            addNotification(notification)

                            toast.error(
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">{notification.title}</span>
                                    <span className="text-xs">{notification.message}</span>
                                </div>,
                                {
                                    icon: <XCircle className="w-5 h-5 text-red-500" />,
                                    duration: 8000,
                                    action: {
                                        label: 'View',
                                        onClick: () => router.push('/admin/orders')
                                    }
                                }
                            )
                        } else if (updatedOrder.status === 'confirmed') {

                            toast.info(
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">Order Confirmed</span>
                                    <span className="text-xs">Order #{updatedOrder.order_number} is now confirmed.</span>
                                </div>,
                                {
                                    icon: <AlertCircle className="w-5 h-5 text-blue-500" />
                                }
                            )
                        }
                        router.refresh()
                    }
                }
            )
            .subscribe((status) => {
                console.log('Supabase Realtime Status:', status)
            })

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
                                    <div key={n.id} className="p-3 hover:bg-white/5 rounded-xl transition cursor-pointer border border-transparent hover:border-white/5" onClick={() => router.push('/admin/orders')}>
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${n.type === 'cancelled' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            <div>
                                                <p className={`text-xs font-bold ${n.type === 'cancelled' ? 'text-red-400' : 'text-emerald-400'}`}>{n.title}</p>
                                                <p className="text-xs text-white/70 mt-0.5">{n.message}</p>
                                                <p className="text-[10px] text-white/30 mt-1">{n.time.toLocaleTimeString()}</p>
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
