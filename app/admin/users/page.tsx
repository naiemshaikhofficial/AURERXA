'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { getAdminAllUsers } from '../actions'
import { Search, User, Mail, Phone, Calendar } from 'lucide-react'

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const loadUsers = useCallback(async () => {
        setLoading(true)
        const result = await getAdminAllUsers(search || undefined, page)
        setUsers(result.users)
        setTotal(result.total)
        setLoading(false)
    }, [search, page])

    useEffect(() => { loadUsers() }, [loadUsers])

    const totalPages = Math.ceil(total / 20)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-white/40 text-sm mt-1">{total} registered users</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 text-white/30">No users found</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {users.map(user => (
                            <div key={user.id} className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-white/10 transition">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <User className="w-5 h-5 text-[#D4AF37]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.full_name || 'Unnamed'}</p>
                                        <p className="text-xs text-white/40 truncate flex items-center gap-1">
                                            <Mail className="w-3 h-3" />{user.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-white/30">
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />{user.phone_number || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />{new Date(user.created_at).toLocaleDateString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        ))}
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
