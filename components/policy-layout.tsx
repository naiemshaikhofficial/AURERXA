'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ChevronRight, FileText, Shield, Truck, HelpCircle } from 'lucide-react'

interface PolicyLayoutProps {
    children: React.ReactNode
    title: string
    description?: string
}

export function PolicyLayout({ children, title, description }: PolicyLayoutProps) {
    const pathname = usePathname()

    const navItems = [
        { name: 'Terms & Conditions', href: '/terms', icon: FileText },
        { name: 'Privacy Policy', href: '/privacy', icon: Shield },
        { name: 'Returns & Shipping', href: '/returns', icon: Truck },
        { name: 'Help Center', href: '/help', icon: HelpCircle },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-serif font-bold mb-4">{title}</h1>
                        {description && <p className="text-muted-foreground">{description}</p>}
                        <div className="w-16 h-px bg-primary mt-6" />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar Navigation */}
                        <aside className="lg:w-64 flex-shrink-0">
                            <nav className="sticky top-28 space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-3">Policy Center</p>
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all group ${isActive
                                                    ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                            <span className="flex-1">{item.name}</span>
                                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                                        </Link>
                                    )
                                })}
                            </nav>
                        </aside>

                        {/* Content */}
                        <article className="flex-1 min-w-0">
                            {children}
                        </article>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
