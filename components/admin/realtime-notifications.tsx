'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

export function RealtimeNotifications() {
    const router = useRouter()

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const channel = supabase
            .channel('admin_orders')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT and UPDATE
                    schema: 'public',
                    table: 'orders',
                },
                (payload: any) => {
                    console.log('Order Update Received:', payload)

                    // Only notify for impactful status changes
                    const status = payload.new.status
                    const validStatuses = ['packed', 'shipped', 'delivered', 'cancelled', 'confirmed'] // 'confirmed' might be used if your logic sets it, otherwise 'packed' usually implies confirmation

                    // Supabase Realtime listens to INSERT (new orders are usually 'pending') and UPDATE
                    // If INSERT, it's a new order. If UPDATE, it's a status change.
                    // User wants notification ONLY for confirmed/cancelled, NOT pending.

                    if (validStatuses.includes(status)) {
                        try {
                            const audio = new Audio('/notification.mp3')
                            audio.play().catch(e => console.warn('Audio play failed', e))
                        } catch (e) { /* ignore */ }

                        const isCancelled = status === 'cancelled'
                        toast(isCancelled ? 'Order Cancelled' : 'Order Confirmed!', {
                            description: `Order #${payload.new.order_number} ${isCancelled ? 'has been cancelled' : 'is now ' + status}`,
                            duration: 10000,
                            action: {
                                label: 'View',
                                onClick: () => router.push(`/admin/orders?highlight=${payload.new.id}`)
                            },
                            icon: isCancelled ? <Bell className="w-5 h-5 text-red-500" /> : <Bell className="w-5 h-5 text-green-500" />,
                            className: isCancelled ? 'border-red-500/20' : 'border-green-500/20'
                        })
                    }

                    // Always refresh data table regardless of status (so pending orders appear in list)
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router])

    return null // Invisible component
}
