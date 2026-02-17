'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { getUserDetails, toggleUserBan, deleteUser, toggleAdminRole, updateAdminRole, removeAdmin } from '@/app/admin/actions'
import { Search, MapPin, Phone, ShoppingBag, CreditCard, Ban, Trash2, Crown, ShieldCheck, UserCog, User as UserIcon, Mail, X } from 'lucide-react'
import { InternalNotes } from '@/components/admin/internal-notes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function UsersClient({ initialUsers, total, adminRole }: { initialUsers: any[], total: number, adminRole: string | null }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // State
    const [users, setUsers] = useState(initialUsers)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [userDetails, setUserDetails] = useState<any>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [isBanning, setIsBanning] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPromoting, setIsPromoting] = useState(false)

    // Sync Props
    useEffect(() => {
        setUsers(initialUsers)
    }, [initialUsers])

    // URL State
    const currentSearch = searchParams.get('search') || ''
    const currentPage = Number(searchParams.get('page')) || 1

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        if (key !== 'page') params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

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
            setUserDetails((prev: any) => ({ ...prev, profile: { ...prev.profile, is_banned: newStatus } }))
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, is_banned: newStatus } : u))
            router.refresh()
        } else {
            alert('Failed: ' + res.error)
        }
    }

    const handleDelete = async () => {
        if (!selectedUser || !confirm('Are you sure you want to PERMANENTLY delete this user? ALL data will be lost.')) return
        setIsDeleting(true)
        const res = await deleteUser(selectedUser.id)
        setIsDeleting(false)
        if (res.success) {
            setSelectedUser(null)
            setUserDetails(null)
            router.refresh()
        } else {
            alert('Failed: ' + res.error)
        }


    }

    const handleAdminToggle = async () => {
        if (!selectedUser || !userDetails) return

        const isCurrentlyAdmin = userDetails.isAdmin
        const action = confirm(`Are you sure you want to ${isCurrentlyAdmin ? 'REMOVE' : 'GRANT'} Admin privileges for ${userDetails.profile.full_name}?`)
        if (!action) return

        setIsPromoting(true)
        const res = await toggleAdminRole(selectedUser.id, !isCurrentlyAdmin)
        setIsPromoting(false)

        if (res.success) {
            setUserDetails((prev: any) => ({ ...prev, isAdmin: !isCurrentlyAdmin }))
            alert(isCurrentlyAdmin ? 'Admin privileges removed.' : 'User promoted to Admin.')
        } else {
            alert('Failed: ' + res.error)
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
                    defaultValue={currentSearch}
                    onKeyDown={e => e.key === 'Enter' && updateFilters('search', e.currentTarget.value)}
                    onBlur={e => updateFilters('search', e.currentTarget.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/30"
                />
            </div>

            {users.length === 0 ? (
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
                                    onClick={() => updateFilters('page', String(p))}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${currentPage === p ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Same Drawer Code as before, just using local state */}
            {selectedUser && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#111111] border-l border-white/5 overflow-y-auto animate-in slide-in-from-right-full duration-300">
                        <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-semibold text-[#D4AF37]">User Profile</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        {loadingDetails ? (
                            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
                        ) : userDetails ? (
                            <div className="p-4 space-y-6">
                                {/* Profile Details */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37] mb-3">
                                        {userDetails.profile.avatar_url ? <img src={userDetails.profile.avatar_url} className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-10 h-10" />}
                                    </div>
                                    <h2 className="text-xl font-bold">{userDetails.profile.full_name || 'Unnamed'}</h2>
                                    <p className="text-sm text-white/40">{userDetails.profile.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <ShoppingBag className="w-5 h-5 text-[#D4AF37] mx-auto mb-2 opacity-60" />
                                        <p className="text-2xl font-bold text-white">{userDetails.stats.totalOrders}</p>
                                        <p className="text-xs text-white/40 uppercase">Total Orders</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <CreditCard className="w-5 h-5 text-[#D4AF37] mx-auto mb-2 opacity-60" />
                                        <p className="text-2xl font-bold text-[#D4AF37]">₹{userDetails.stats.totalSpent.toLocaleString('en-IN')}</p>
                                        <p className="text-xs text-white/40 uppercase">Lifetime Value</p>
                                    </div>
                                </div>

                                {/* Saved Addresses (NEW) */}
                                {userDetails.addresses && userDetails.addresses.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-white/40 flex items-center gap-1 uppercase tracking-widest px-1">
                                            <MapPin className="w-3 h-3 text-[#D4AF37]" /> Saved Addresses
                                        </p>
                                        <div className="space-y-2">
                                            {userDetails.addresses.map((addr: any) => (
                                                <div key={addr.id} className="bg-white/5 border border-white/10 rounded-xl p-4 relative group hover:border-[#D4AF37]/20 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded uppercase tracking-wider font-medium">
                                                            {addr.label || 'Address'}
                                                        </span>
                                                        {addr.is_default && (
                                                            <span className="text-[9px] text-white/30 uppercase tracking-widest italic">Default</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm space-y-1">
                                                        <p className="font-semibold text-white/90">{addr.full_name}</p>
                                                        <p className="text-white/60 leading-relaxed">{addr.street_address}</p>
                                                        <p className="text-white/40 text-xs flex items-center gap-2">
                                                            <Phone className="w-3 h-3 opacity-50" /> {addr.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Internal Notes */}
                                <div className="pt-6 border-t border-white/5 is-internal-notes">
                                    <InternalNotes entityType="user" entityId={userDetails.profile.id} />
                                </div>

                                {/* Danger Zone & Admin Management */}
                                <div className="pt-6 border-t border-white/5 space-y-3">
                                    {adminRole === 'main_admin' && (
                                        <>
                                            <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <UserCog className="w-4 h-4 text-[#D4AF37]" />
                                                    <span className="text-sm font-bold text-white uppercase tracking-widest">Role Assignment</span>
                                                </div>

                                                <Select
                                                    value={userDetails.adminRole || 'user'}
                                                    onValueChange={async (val) => {
                                                        setIsPromoting(true)
                                                        try {
                                                            if (val === 'user') {
                                                                const res = await removeAdmin(userDetails.profile.id)
                                                                if (!res.success) alert(res.error)
                                                            } else {
                                                                // check if updating or promoting
                                                                const res = await updateAdminRole(userDetails.profile.id, val)
                                                                if (!res.success) alert(res.error)
                                                            }
                                                            // Refresh data (hacky reload for now, ideally update state)
                                                            window.location.reload()
                                                        } catch (e) {
                                                            console.error(e)
                                                            alert('Failed to update role')
                                                        } finally {
                                                            setIsPromoting(false)
                                                        }
                                                    }}
                                                    disabled={isPromoting}
                                                >
                                                    <SelectTrigger className="w-full bg-[#111] border-white/10 text-white h-11">
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                        <SelectItem value="user">No Admin Access (User)</SelectItem>
                                                        <SelectItem value="staff">Staff (Logistics & Orders)</SelectItem>
                                                        <SelectItem value="support_admin">Support Admin (Tickets)</SelectItem>
                                                        <SelectItem value="product_manager">Product Manager (Catalog)</SelectItem>
                                                        <SelectItem value="main_admin" className="text-amber-500 font-bold">Main Admin (Owner)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <button onClick={handleBanToggle} disabled={isBanning} className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition text-sm font-medium ${userDetails.profile.is_banned ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {isBanning ? <div className="w-4 h-4 border-2 border-t-transparent animate-spin" /> : userDetails.profile.is_banned ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                {userDetails.profile.is_banned ? 'Unban User' : 'Ban User'}
                                            </button>

                                            <button onClick={handleDelete} disabled={isDeleting} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl transition text-sm font-medium">
                                                {isDeleting ? <div className="w-4 h-4 border-2 border-t-transparent animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete User Account
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : <div className="text-center py-12 text-white/30">Failed to load details</div>}
                    </div>
                </div>
            )}
        </div>
    )
}
