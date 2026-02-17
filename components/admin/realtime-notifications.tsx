'use client'

import { useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ShoppingBag, PackageCheck } from 'lucide-react'
import { getOrdersPollingData } from '@/app/admin/actions'

export function RealtimeNotifications() {
    const router = useRouter()
    const lastKnownRef = useRef<{ id: string | null; timestamp: string | null; total: number | null }>({
        id: null, timestamp: null, total: null
    })
    const isFirstPoll = useRef(true)

    // 🎯 PRIMARY: Polling-based realtime
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>

        const pollForChanges = async () => {
            try {
                console.log('🔄 Polling for order changes...')
                const data = await getOrdersPollingData()
                console.log('📊 Poll result:', data)

                if (!data) {
                    console.warn('⚠️ Poll returned null (admin check may have failed)')
                    return
                }

                const prev = lastKnownRef.current

                // First poll — just set baseline
                if (isFirstPoll.current) {
                    console.log('📌 Setting baseline:', data)
                    lastKnownRef.current = {
                        id: data.latestId,
                        timestamp: data.latestTimestamp,
                        total: data.totalOrders
                    }
                    isFirstPoll.current = false
                    return
                }

                // Detect changes
                const isNewOrder = data.latestId !== prev.id && data.totalOrders > (prev.total || 0)
                const isUpdate = !isNewOrder && data.latestTimestamp !== prev.timestamp

                if (isNewOrder) {
                    console.log('🛍️ NEW ORDER DETECTED!')
                    try {
                        const audio = new Audio('/notification.mp3')
                        audio.play().catch(() => { })
                    } catch (e) { /* ignore */ }

                    toast('🛍️ New Order Received!', {
                        description: 'A new order has been placed.',
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
                    console.log('📦 ORDER UPDATED!')
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
                } else {
                    console.log('✅ No changes detected')
                }

                // Update baseline
                lastKnownRef.current = {
                    id: data.latestId,
                    timestamp: data.latestTimestamp,
                    total: data.totalOrders
                }
            } catch (e) {
                console.error('❌ Polling error:', e)
            }
        }

        // Start polling
        pollForChanges()
        intervalId = setInterval(pollForChanges, 5000)

        return () => { clearInterval(intervalId) }
    }, [router])

    // 🔌 BONUS: Supabase Realtime
    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const channel = supabase
            .channel('admin_orders_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('⚡ Supabase Realtime event:', payload)
                router.refresh()
            })
            .subscribe((status) => {
                console.log('🔌 Supabase Realtime status:', status)
            })

        return () => { supabase.removeChannel(channel) }
    }, [router])

    return null
}
