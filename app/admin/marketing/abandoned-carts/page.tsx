'use client'

import React, { useState, useEffect } from 'react'
import { getAbandonedCarts, sendAbandonmentReminder } from '@/app/admin/actions'
import { ShoppingCart, Users, Clock, Send, MessageCircle, Bell, ExternalLink, Loader2, IndianRupee } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function AbandonedCartsPage() {
    const [abandonedCarts, setAbandonedCarts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const data = await getAbandonedCarts()
        setAbandonedCarts(data)
        setLoading(false)
    }

    const handleSendReminder = async (userId: string, type: 'push' | 'whatsapp' | 'email') => {
        setSending(`${userId}-${type}`)
        const res = await sendAbandonmentReminder(userId, type)
        if (res.success) {
            toast.success(`Reminder sent successfully via ${type}`)
        } else {
            toast.error((res as any).error || 'Failed to send reminder')
        }
        setSending(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-[#D4AF37]" />
                        Abandoned Carts
                    </h1>
                    <p className="text-white/50 mt-1">Identify lost opportunities and recover revenue through reminders.</p>
                </div>
                <button
                    onClick={loadData}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition-all"
                >
                    Refresh Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111111] p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-sm text-white/50">Abandoned Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{abandonedCarts.length}</p>
                </div>
                <div className="bg-[#111111] p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-sm text-white/50">Potential Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        ₹{abandonedCarts.reduce((sum, cart) => sum + cart.total_value, 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-[#111111] p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <span className="text-sm text-white/50">Avg. Abandonment Time</span>
                    </div>
                    <p className="text-2xl font-bold text-white">4.2 Hours</p>
                </div>
            </div>

            <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Customer</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Cart Items</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Total Value</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40">Last Activity</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Recover</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {abandonedCarts.map((cart) => (
                            <tr key={cart.user.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] font-bold">
                                            {cart.user.full_name?.[0] || cart.user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{cart.user.full_name || 'Anonymous User'}</p>
                                            <p className="text-xs text-white/40">{cart.user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex -space-x-2">
                                        {cart.items.slice(0, 3).map((item: any, i: number) => {
                                            const product = Array.isArray(item.products) ? item.products[0] : item.products
                                            return (
                                                <div key={item.id} className="w-8 h-8 rounded-full border-2 border-[#111111] overflow-hidden bg-white/5" title={product?.name}>
                                                    <Image
                                                        src={product?.image_url || '/logo.png'}
                                                        alt={product?.name}
                                                        width={32}
                                                        height={32}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )
                                        })}
                                        {cart.items.length > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-[#111111] bg-white/10 flex items-center justify-center text-[10px] text-white/60">
                                                +{cart.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm font-bold text-[#D4AF37]">₹{cart.total_value.toLocaleString('en-IN')}</p>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <Clock className="w-3 h-3" />
                                        {new Date(cart.last_updated).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleSendReminder(cart.user.id, 'push')}
                                            disabled={sending === `${cart.user.id}-push`}
                                            className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all text-white/40"
                                            title="Send Push Notification"
                                        >
                                            {sending === `${cart.user.id}-push` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleSendReminder(cart.user.id, 'whatsapp')}
                                            disabled={sending === `${cart.user.id}-whatsapp`}
                                            className="p-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 rounded-lg transition-all text-white/40"
                                            title="Send WhatsApp Message"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleSendReminder(cart.user.id, 'email')}
                                            disabled={sending === `${cart.user.id}-email`}
                                            className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-500 rounded-lg transition-all text-white/40"
                                            title="Send Email Reminder"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {abandonedCarts.length === 0 && (
                    <div className="p-12 text-center">
                        <ShoppingCart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/40">No abandoned carts found in the tracked window.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
