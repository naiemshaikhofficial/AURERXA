'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { AlertCircle, Trash2, ExternalLink, ShieldAlert, Cpu, Globe } from 'lucide-react'
import { deleteErrorLog, getErrorLogs } from '../actions'
import { toast } from 'sonner'

interface Log {
    id: string
    created_at: string
    error_message: string
    error_stack?: string
    pathname?: string
    user_id?: string
    metadata?: any
}

export function SystemClient({ initialLogs }: { initialLogs: Log[] }) {
    const [logs, setLogs] = useState<Log[]>(initialLogs)
    const [loading, setLoading] = useState(false)
    const [expandedLog, setExpandedLog] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this log?')) return

        const res = await deleteErrorLog(id)
        if (res.success) {
            setLogs(logs.filter(l => l.id !== id))
            toast.success('Log deleted')
        } else {
            toast.error('Failed to delete log')
        }
    }

    const refreshLogs = async () => {
        setLoading(true)
        const newLogs = await getErrorLogs(100)
        setLogs(newLogs)
        setLoading(false)
        toast.success('Logs refreshed')
    }

    return (
        <div className="space-y-4">
            {/* System Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-400/10 rounded-xl flex items-center justify-center text-red-400">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{logs.length}</p>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Active Error Logs</p>
                    </div>
                </div>
                <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-400/10 rounded-xl flex items-center justify-center text-emerald-400">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">Stable</p>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Security Status</p>
                    </div>
                </div>
                <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">Optimized</p>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Runtime Engine</p>
                    </div>
                </div>
            </div>

            {/* Logs Toolbar */}
            <div className="flex justify-between items-center bg-[#111111] border border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-white/60">Live Error Stream</span>
                </div>
                <button
                    onClick={refreshLogs}
                    disabled={loading}
                    className="text-xs bg-white/5 hover:bg-white/10 text-white/80 px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Logs'}
                </button>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
                {logs.length === 0 ? (
                    <div className="bg-[#111111] border border-white/5 rounded-2xl p-12 text-center">
                        <p className="text-white/20 text-sm italic">No errors logged. Infrastructure is currently healthy.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className={`bg-[#111111] border ${expandedLog === log.id ? 'border-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/5' : 'border-white/5'} rounded-2xl transition-all duration-300 overflow-hidden`}
                        >
                            <div
                                className="p-4 md:p-5 flex items-start justify-between cursor-pointer hover:bg-white/[0.02]"
                                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            >
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="mt-1 w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 flex-shrink-0">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 text-white/40 rounded uppercase tracking-tighter">
                                                {format(new Date(log.created_at), 'HH:mm:ss')}
                                            </span>
                                            <span className="text-xs font-bold text-red-400/90 truncate max-w-[200px] md:max-w-md">
                                                {log.error_message}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-white/30 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Globe className="w-3 h-3" /> {log.pathname || 'Global Scope'}
                                            </span>
                                            <span>
                                                {format(new Date(log.created_at), 'MMMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(log.id) }}
                                        className="p-2 hover:bg-red-400/10 text-white/20 hover:text-red-400 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {expandedLog === log.id && (
                                <div className="px-5 pb-5 animate-in slide-in-from-top-1">
                                    <div className="pt-2 space-y-4">
                                        {log.error_stack && (
                                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-2">Stack Trace</p>
                                                <pre className="text-[11px] font-mono text-red-300/60 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                                                    {log.error_stack}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-2">Contextual Data</p>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="text-white/40">Request Path:</span>
                                                        <span className="text-white/80">{log.pathname}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="text-white/40">User ID:</span>
                                                        <span className="text-white/80 font-mono text-[10px]">{log.user_id || 'unauthenticated'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {log.metadata && (
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-2">Agent Metadata</p>
                                                    <pre className="text-[11px] font-mono text-emerald-400/60 overflow-x-auto">
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
