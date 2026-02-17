'use client'

import { useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ShoppingBag, PackageCheck, Truck, XCircle } from 'lucide-react'

export function RealtimeNotifications() {
    const router = useRouter()
    const lastKnownRef = useRef<{ id: string | null; timestamp: string | null; total: number | null }>({
        id: null, timestamp: null, total: null
    })
    const isFirstPoll = useRef(true)

    // 🎯 PRIMARY: Polling-based realtime (works 100% without Supabase Realtime config)
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>

        const pollForChanges = async () => {
            try {
                const { getOrdersPollingData } = await import('@/app/admin/actions')
                const data = await getOrdersPollingData()
                if (!data) return

                const prev = lastKnownRef.current

                // First poll — just set baseline, don't notify
                if (isFirstPoll.current) {
                    lastKnownRef.current = {
                        id: data.latestId,
                        timestamp: data.latestTimestamp,
                        total: data.totalOrders
                    }
                    isFirstPoll.current = false
                    return
                }

                // Detect new order (new ID or count increased)
                const isNewOrder = data.latestId !== prev.id && data.totalOrders > (prev.total || 0)
                // Detect order update (same count but timestamp changed)
                const isUpdate = !isNewOrder && data.latestTimestamp !== prev.timestamp

                if (isNewOrder) {
                    // 🛍️ New Order notification
                    try {
                        const audio = new Audio('/notification.mp3')
                        audio.play().catch(() => { })
                    } catch (e) { /* ignore */ }

                    toast('🛍️ New Order Received!', {
                        description: `A new order has been placed. Check the orders page.`,
                        duration: 15000,
                        action: {
                            label: 'View Orders',
                            onClick: () => router.push('/admin/orders')
                        },
                        icon: <ShoppingBag className="w-5 h-5 text-primary" />,
                        className: 'border-primary/30'
                    })

                    router.refresh()
                } else if (isUpdate) {
                    // 📦 Order status update
                    try {
                        const audio = new Audio('/notification.mp3')
                        audio.play().catch(() => { })
                    } catch (e) { /* ignore */ }

                    toast('📦 Order Updated', {
                        description: 'An order status has changed.',
                        duration: 8000,
                        action: {
                            label: 'View',
                            onClick: () => router.push('/admin/orders')
                        },
                        icon: <PackageCheck className="w-5 h-5 text-sky-400" />,
                        className: 'border-sky-500/20'
                    })

                    router.refresh()
                }

                // Update baseline
                lastKnownRef.current = {
                    id: data.latestId,
                    timestamp: data.latestTimestamp,
                    total: data.totalOrders
                }
            } catch (e) {
                // Silently ignore
            }
        }

        pollForChanges()
        intervalId = setInterval(pollForChanges, 5000)

        return () => { clearInterval(intervalId) }
    }, [router])

    // 🔌 BONUS: Supabase Realtime (instant when enabled in dashboard)
    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const channel = supabase
            .channel('admin_orders_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                router.refresh()
            })
            .subscribe((status) => {
                console.log('🔌 Supabase Realtime:', status)
            })

        return () => { supabase.removeChannel(channel) }
    }, [router])

    return null
}

