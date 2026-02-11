'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import supabaseLoader from '@/lib/supabase-loader'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { checkAdminRole } from './actions'
import {
    LayoutDashboard, ShoppingCart, Package, Users, HeadphonesIcon,
    Settings, ChevronLeft, ChevronRight, Shield, Menu, X, LogOut, Activity, Sparkles
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['main_admin', 'support_admin', 'staff'] },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, roles: ['main_admin', 'support_admin', 'staff'] },
    { label: 'Products', href: '/admin/products', icon: Package, roles: ['main_admin', 'support_admin'] },
    { label: 'Users', href: '/admin/users', icon: Users, roles: ['main_admin', 'support_admin'] },
    { label: 'Support', href: '/admin/support', icon: HeadphonesIcon, roles: ['main_admin', 'support_admin'] },
    { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['main_admin'] },
    { label: 'Activity', href: '/admin/activity', icon: Activity, roles: ['main_admin'] },
    { label: 'Services', href: '/admin/services', icon: Sparkles, roles: ['main_admin', 'support_admin'] },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [admin, setAdmin] = useState<{ userId: string; email?: string; role: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAdminRole().then(result => {
            if (!result) {
                router.replace('/')
                return
            }
            setAdmin(result)
            setLoading(false)
        })
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#D4AF37]/70 text-sm tracking-widest uppercase">Loading Admin</p>
                </div>
            </div>
        )
    }

    const filteredNav = NAV_ITEMS.filter(item => admin && item.roles.includes(admin.role))

    const roleBadge = admin?.role === 'main_admin' ? 'Main Admin' : admin?.role === 'support_admin' ? 'Support' : 'Staff'
    const roleColor = admin?.role === 'main_admin' ? 'text-[#D4AF37]' : admin?.role === 'support_admin' ? 'text-emerald-400' : 'text-blue-400'

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col ${collapsed ? 'w-[72px]' : 'w-64'} bg-[#111111] border-r border-white/5 transition-all duration-300 fixed top-0 left-0 h-full z-40`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                    {!collapsed && (
                        <Link href="/admin" className="flex items-center gap-2.5">
                            <Image src="/logo.png" alt="AURERXA" width={40} height={40} className="rounded" unoptimized />

                        </Link>
                    )}
                    {collapsed && (
                        <Link href="/admin" className="mx-auto">
                            <Image src="/favicon.ico" alt="AURERXA" width={80} height={40} className="rounded" unoptimized />
                        </Link>
                    )}
                    <button onClick={() => setCollapsed(!collapsed)} className="text-white/40 hover:text-white/80 transition hidden md:block">
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                    {filteredNav.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] shadow-lg shadow-[#D4AF37]/5'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : ''}`} />
                                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Admin Info */}
                <div className="px-3 py-4 border-t border-white/5">
                    {!collapsed && (
                        <div className="mb-3">
                            <p className="text-xs text-white/40 truncate">{admin?.email}</p>
                            <p className={`text-xs font-medium ${roleColor} tracking-wider uppercase mt-0.5`}>{roleBadge}</p>
                        </div>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 text-white/40 hover:text-red-400 transition text-sm w-full px-1">
                        <LogOut className="w-4 h-4" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#111111]/95 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
                <button onClick={() => setMobileOpen(true)} className="text-white/70">
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/admin" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="AURERXA" width={22} height={22} className="rounded" unoptimized />
                    <span className="text-sm font-semibold tracking-wider text-[#D4AF37]">ADMIN</span>
                </Link>
                <button onClick={handleLogout} className="text-white/40 hover:text-red-400">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-[#111111] border-r border-white/5 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2.5">
                                <Image src="/logo.png" alt="AURERXA" width={28} height={28} className="rounded" unoptimized />
                                <span className="text-lg font-semibold tracking-wider text-[#D4AF37]">AURERXA</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="text-white/40">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1">
                            {filteredNav.map(item => {
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-xs text-white/40 truncate">{admin?.email}</p>
                            <p className={`text-xs font-medium ${roleColor} tracking-wider uppercase mt-0.5`}>{roleBadge}</p>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-64'} pt-14 md:pt-0 min-h-screen`}>
                <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
