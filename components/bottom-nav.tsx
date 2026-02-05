'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const links = [
        {
            href: '/',
            label: 'Home',
            icon: Home,
        },
        {
            href: '/collections',
            label: 'Collections',
            icon: ShoppingBag,
        },
        {
            href: '/contact',
            label: 'Contact',
            icon: Mail,
        },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border md:hidden safe-area-pb">
            <nav className="flex items-center justify-around h-16">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium uppercase tracking-wide">
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
