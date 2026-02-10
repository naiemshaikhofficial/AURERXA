'use client'

import React, { useEffect, useState } from 'react'
import { getActivityLogs } from '../actions'
import { Activity, User, Clock, Package, ShoppingCart, Shield, Tag, Settings } from 'lucide-react'

const ENTITY_ICONS: Record<string, any> = {
    order: ShoppingCart,
    product: Package,
    admin_user: Shield,
    coupon: Tag,
    gold_rate: Settings,
}

export default function ActivityPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {
        loadLogs()
    }, [page])

    const loadLogs = async () => {
        setLoading(true)
        const result = await getActivityLogs(page)
        setLogs(result.logs)
        setTotal(result.total)
        setLoading(false)
    }

    const totalPages = Math.ceil(total / 50)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Activity Logs</h1>
                <p className="text-white/40 text-sm mt-1">{total} total activities</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 text-white/30">No activity recorded yet</div>
            ) : (
                <>
                    <div className="space-y-2">
                        {logs.map(log => {
                            const Icon = ENTITY_ICONS[log.entity_type] || Activity
                            return (
                                <div key={log.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-4 h-4 text-[#D4AF37]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/80">{log.action}</p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs text-white/30 flex items-center gap-1">
                                                <User className="w-3 h-3" />{log.profiles?.full_name || log.profiles?.email || 'System'}
                                            </span>
                                            <span className="text-xs text-white/20">•</span>
                                            <span className="text-xs text-white/30 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />{new Date(log.created_at).toLocaleString('en-IN')}
                                            </span>
                                            {log.entity_id && (
                                                <>
                                                    <span className="text-xs text-white/20">•</span>
                                                    <span className="text-xs text-white/20 font-mono truncate">{log.entity_id.substring(0, 8)}...</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${page === p ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
