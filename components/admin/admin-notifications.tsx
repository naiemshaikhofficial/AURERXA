'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ShoppingCart, XCircle, AlertCircle } from 'lucide-react'

export function AdminNotifications() {
    const router = useRouter()
    const audioRef = useRef<HTMLAudioElement | null>(null)

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

                    playSound()
                    toast.success(
                        <div className="flex flex-col gap-1">
                            <span className="font-bold">New Order Received!</span>
                            <span className="text-xs">Order #{newOrder.order_number} • ₹{newOrder.total}</span>
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
                            playSound()
                            toast.error(
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold">Order Cancelled</span>
                                    <span className="text-xs">Order #{updatedOrder.order_number} has been cancelled.</span>
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

    return null // Invisible component, just logic
}
