'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { getAdminAllUsers, deleteUser, checkAdminRole, getUserDetails } from '../actions'
import { Search, User as UserIcon, Mail, Phone, Calendar, Trash2, ShoppingBag, CreditCard, X, ChevronRight, Ban, ShieldCheck, ShieldAlert } from 'lucide-react'

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    // New State
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [adminRole, setAdminRole] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [userDetails, setUserDetails] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [isBanning, setIsBanning] = useState(false)

    useEffect(() => {
        checkAdminRole().then(res => setAdminRole(res?.role || null))
    }, [])

    const loadUsers = useCallback(async () => {
        setLoading(true)
        const result = await getAdminAllUsers(search || undefined, page)
        setUsers(result.users)
        setTotal(result.total)
        setLoading(false)
    }, [search, page])

    useEffect(() => { loadUsers() }, [loadUsers])

    const handleUserClick = async (user: any) => {
        setSelectedUser(user)
        setLoadingDetails(true)
        const details = await getUserDetails(user.id)
        setUserDetails(details)
        setLoadingDetails(false)
    }

    const handleBanToggle = async () => {
        if (!selectedUser) return
        const newStatus = !userDetails?.profile?.is_banned
        if (!confirm(`Are you sure you want to ${newStatus ? 'BAN' : 'UNBAN'} this user?`)) return

        setIsBanning(true)
        const res = await toggleUserBan(selectedUser.id, newStatus)
        setIsBanning(false)

        if (res.success) {
            // Update local state to reflect change immediately
            setUserDetails((prev: any) => ({ ...prev, profile: { ...prev.profile, is_banned: newStatus } }))
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, is_banned: newStatus } : u))
        } else {
            alert('Failed to update ban status: ' + res.error)
        }
    }

    const handleDelete = async () => {
        if (!selectedUser || !confirm('Are you sure you want to PERMANENTLY delete this user? ALL their data (orders, etc.) will be lost. This cannot be undone.')) return
        setIsDeleting(true)
        const res = await deleteUser(selectedUser.id)
        setIsDeleting(false)
        if (res.success) {
            setSelectedUser(null)
            setUserDetails(null)
            loadUsers()
        } else {
            alert('Failed to delete: ' + res.error)
        }
    }

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
                            <div
                                key={user.id}
                                onClick={() => handleUserClick(user)}
                                className={`bg-[#111111] border rounded-xl p-4 cursor-pointer transition group relative overflow-hidden ${user.is_banned ? 'border-red-500/30' : 'border-white/5 hover:border-[#D4AF37]/30'
                                    }`}
                            >
                                {user.is_banned && (
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded">
                                        Banned
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37]">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <UserIcon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-[#D4AF37] transition-colors">{user.full_name || 'Unnamed'}</p>
                                        <p className="text-xs text-white/40 truncate flex items-center gap-1">
                                            <Mail className="w-3 h-3" />{user.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-3">
                                    <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                        <p className="text-white/30 mb-1">Orders</p>
                                        <p className="text-white font-medium">{user.stats?.totalOrders || 0}</p>
                                    </div>
                                    <div className="text-center p-2 bg-white/[0.02] rounded-lg">
                                        <p className="text-white/30 mb-1">Spent</p>
                                        <p className="text-[#D4AF37] font-medium">₹{(user.stats?.totalSpent || 0).toLocaleString('en-IN')}</p>
                                    </div>
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

            {/* User Detail Drawer */}
            {selectedUser && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-white/5 overflow-y-auto animate-in slide-in-from-right-full duration-300">
                        <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-[#D4AF37]">User Profile</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        {loadingDetails ? (
                            <div className="flex justify-center py-20">
                                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : userDetails ? (
                            <div className="p-4 space-y-6">
                                {/* Profile Header */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] mb-3">
                                        {userDetails.profile.avatar_url ? (
                                            <img src={userDetails.profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <UserIcon className="w-10 h-10" />
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold">{userDetails.profile.full_name || 'Unnamed'}</h2>
                                    <p className="text-sm text-white/40">{userDetails.profile.email}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {userDetails.profile.phone_number || 'N/A'}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> User since {new Date(userDetails.profile.created_at).getFullYear()}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <ShoppingBag className="w-5 h-5 text-[#D4AF37] mx-auto mb-2 opacity-60" />
                                        <p className="text-2xl font-bold text-white max-w-full truncate">{userDetails.stats.totalOrders}</p>
                                        <p className="text-xs text-white/40 uppercase tracking-wider">Total Orders</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <CreditCard className="w-5 h-5 text-[#D4AF37] mx-auto mb-2 opacity-60" />
                                        <p className="text-2xl font-bold text-[#D4AF37] max-w-full truncate">₹{userDetails.stats.totalSpent.toLocaleString('en-IN')}</p>
                                        <p className="text-xs text-white/40 uppercase tracking-wider">Lifetime Value</p>
                                    </div>
                                </div>

                                {/* Order History */}
                                <div>
                                    <h4 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Order History</h4>
                                    {userDetails.orders.length === 0 ? (
                                        <div className="text-center py-8 text-white/20 bg-white/[0.02] rounded-xl border border-white/5">
                                            No orders yet
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {userDetails.orders.map((order: any) => (
                                                <div key={order.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-lg hover:bg-white/5 transition">
                                                    <div>
                                                        <p className="text-sm font-medium text-[#D4AF37]">#{order.order_number}</p>
                                                        <p className="text-xs text-white/30">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">₹{Number(order.total).toLocaleString('en-IN')}</p>
                                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                                'bg-amber-500/10 text-amber-500'
                                                            }`}>{order.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Detailed Status */}
                                {userDetails.profile.is_banned && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-center">
                                        <ShieldAlert className="w-6 h-6 text-red-500 mx-auto mb-2" />
                                        <p className="text-red-500 font-bold">This account is BANNED</p>
                                        <p className="text-xs text-red-400/60 mt-1">User cannot login or access the site.</p>
                                    </div>
                                )}

                                {/* Danger Zone */}
                                {adminRole === 'main_admin' && (
                                    <div className="pt-6 border-t border-white/5 space-y-3">
                                        <button
                                            onClick={handleBanToggle}
                                            disabled={isBanning}
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition text-sm font-medium ${userDetails.profile.is_banned
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                                }`}
                                        >
                                            {isBanning ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : userDetails.profile.is_banned ? (
                                                <ShieldCheck className="w-4 h-4" />
                                            ) : (
                                                <Ban className="w-4 h-4" />
                                            )}
                                            {userDetails.profile.is_banned ? 'Unban User' : 'Ban User'}
                                        </button>

                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition text-sm font-medium"
                                        >
                                            {isDeleting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Delete User Account
                                        </button>
                                        <p className="text-center text-[10px] text-white/20">
                                            Warning: Deletion is permanent. Banning prevents access but keeps data.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-white/30">Failed to load details</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
