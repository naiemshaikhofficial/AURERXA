'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, ShoppingCart, Package, Users, HeadphonesIcon,
    Settings, ChevronLeft, ChevronRight, Menu, X, LogOut, Activity, Sparkles, Wrench, ShieldAlert,
    ExternalLink, Megaphone, ShoppingBag, ArrowLeftRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, imgSrc: 'https://img.icons8.com/?size=100&id=ZQ9axxszRfad&format=png&color=000000', roles: ['main_admin', 'support_admin', 'staff'] },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, imgSrc: 'https://img.icons8.com/?size=100&id=nmdLxlZq4cQi&format=png&color=000000', roles: ['main_admin', 'support_admin', 'staff'] },
    { label: 'Bulk Orders', href: '/admin/bulk-orders', icon: Package, imgSrc: 'https://img.icons8.com/?size=100&id=13007&format=png&color=000000', roles: ['main_admin', 'support_admin'] },
    { label: 'Return Requests', href: '/admin/returns', icon: ArrowLeftRight, roles: ['main_admin', 'support_admin'] },
    { label: 'Categories', href: '/admin/categories', icon: Sparkles, imgSrc: 'https://img.icons8.com/?size=100&id=B5w0V2fjjZ38&format=png&color=000000', roles: ['main_admin', 'support_admin'] },
    { label: 'Products', href: '/admin/products', icon: Package, imgSrc: 'https://img.icons8.com/?size=100&id=12091&format=png&color=000000', roles: ['main_admin', 'support_admin'] },
    { label: 'Users', href: '/admin/users', icon: Users, imgSrc: 'https://img.icons8.com/?size=100&id=IbG1lmsRkQI2&format=png&color=000000', roles: ['main_admin', 'support_admin'] },
    { label: 'Support', href: '/admin/support', icon: HeadphonesIcon, roles: ['main_admin', 'support_admin'] },
    { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['main_admin'] },
    { label: 'Activity', href: '/admin/activity', icon: Activity, roles: ['main_admin'] },
    { label: 'System', href: '/admin/system', icon: ShieldAlert, roles: ['main_admin'] },
    { label: 'Services', href: '/admin/services', icon: Sparkles, imgSrc: 'https://img.icons8.com/?size=100&id=B5w0V2fjjZ38&format=png&color=000000', roles: ['main_admin', 'support_admin'] },
    { label: 'Marketing Hub', href: '/admin/marketing', icon: Megaphone, roles: ['main_admin'] },
    { label: 'Abandoned Carts', href: '/admin/marketing/abandoned-carts', icon: ShoppingBag, roles: ['main_admin'] },
    { label: 'Tools', href: '/admin/tools', icon: Wrench, imgSrc: 'https://img.icons8.com/?size=100&id=114321&format=png&color=000000', roles: ['main_admin', 'support_admin'] },
]

import { AdminNotifications } from '@/components/admin/admin-notifications'

export function AdminSidebar({ admin, children }: { admin: { email?: string; role: string }, children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.replace('/login')
    }

    const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(admin.role))

    const roleBadge = admin.role === 'main_admin' ? 'Main Admin' : admin.role === 'support_admin' ? 'Support' : 'Staff'
    const roleColor = admin.role === 'main_admin' ? 'text-[#D4AF37]' : admin.role === 'support_admin' ? 'text-emerald-400' : 'text-blue-400'

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            <AdminNotifications />
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col ${collapsed ? 'w-[72px]' : 'w-64'} bg-[#111111] border-r border-white/5 transition-all duration-300 fixed top-0 left-0 h-full z-40`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                    {!collapsed && (
                        <Link href="/admin" className="flex items-center gap-2.5">
                            <Image src="/logo-new.webp" alt="AURERXA" width={40} height={40} className="rounded" unoptimized />
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
                <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto custom-scrollbar">
                    {/* Visit Website Link */}
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-white/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 mb-4 border border-white/5 hover:border-[#D4AF37]/20`}
                    >
                        <ExternalLink className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">Visit Website</span>}
                    </Link>

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
                                {item.imgSrc ? (
                                    <div className={`w-5 h-5 flex-shrink-0 relative ${isActive ? '' : 'opacity-50 group-hover:opacity-80'}`}>
                                        <Image
                                            src={item.imgSrc}
                                            alt={item.label}
                                            fill
                                            className={`object-contain`}
                                            style={{ filter: isActive ? 'invert(69%) sepia(50%) saturate(666%) hue-rotate(2deg) brightness(93%) contrast(89%)' : 'invert(1)' }}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : ''}`} />
                                )}
                                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Admin Info */}
                <div className="px-3 py-4 border-t border-white/5">
                    {!collapsed && (
                        <div className="mb-3">
                            <p className="text-xs text-white/40 truncate">{admin.email}</p>
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
                    <Image src="/logo-new.webp" alt="AURERXA" width={22} height={22} className="rounded" unoptimized />
                    <span className="text-sm font-semibold tracking-wider text-[#D4AF37]">ADMIN</span>
                </Link>
                <button onClick={handleLogout} className="text-white/40 hover:text-red-400 p-2">
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
                                <Image src="/logo-new.webp" alt="AURERXA" width={28} height={28} className="rounded" unoptimized />
                                <span className="text-lg font-semibold tracking-wider text-[#D4AF37]">AURERXA</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="text-white/40">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1">
                            {/* Visit Website Link */}
                            <Link
                                href="/"
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-white/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 mb-4 border border-white/5`}
                            >
                                <ExternalLink className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">Visit Website</span>
                            </Link>

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
                                        {item.imgSrc ? (
                                            <div className={`w-5 h-5 flex-shrink-0 relative`}>
                                                <Image
                                                    src={item.imgSrc}
                                                    alt={item.label}
                                                    fill
                                                    className="object-contain"
                                                    style={{ filter: isActive ? 'invert(69%) sepia(50%) saturate(666%) hue-rotate(2deg) brightness(93%) contrast(89%)' : 'invert(1)' }}
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <item.icon className="w-5 h-5" />
                                        )}
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="mt-auto pt-4 border-t border-white/5 pb-6">
                            <div className="px-2 mb-4">
                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Session</p>
                                <p className="text-xs text-white/60 truncate">{admin.email}</p>
                                <p className={`text-[10px] font-bold ${roleColor} tracking-[0.2em] uppercase mt-1`}>{roleBadge}</p>
                            </div>
                            <button onClick={handleLogout} className="flex items-center gap-3 text-white/40 hover:text-red-400 transition text-sm w-full px-3 py-3 bg-white/5 rounded-xl border border-white/5">
                                <LogOut className="w-4 h-4" />
                                <span>Logout Session</span>
                            </button>
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
