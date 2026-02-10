'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function BottomNav() {
    const pathname = usePathname()
    const { cartCount } = useCart()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        let authListener: { subscription: { unsubscribe: () => void } } | null = null

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        authListener = data

        return () => {
            if (authListener) {
                authListener.subscription.unsubscribe()
            }
        }
    }, [])

    const links = [
        {
            href: '/',
            label: 'Home',
            iconId: '118937',
        },
        {
            href: '/collections',
            label: 'Shop',
            iconId: '121367',
        },
        {
            href: '/wishlist',
            label: 'Wishlist',
            iconId: 'HLkJG1mxr6Xj',
        },
        {
            href: user ? '/account' : '/login',
            label: 'Account',
            iconId: '3225',
        },
        {
            href: '/custom-jewelry',
            label: 'Custom',
            iconId: '7687',
        },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-800 md:hidden safe-area-pb">
            <nav className="flex items-center justify-around h-14">
                {links.map(({ href, label, iconId }) => {
                    const isActive = pathname === href || (href === '/collections' && pathname.startsWith('/collections')) || (href === '/account' && pathname.startsWith('/account'))
                    const isShop = href === '/collections'
                    return (
                        <Link
                            key={label}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors duration-200 relative",
                                isActive ? "text-amber-500" : "text-white/50 hover:text-white"
                            )}
                        >
                            <div className="relative">
                                <img
                                    src={`https://img.icons8.com/?size=100&id=${iconId}&format=png&color=${isActive ? 'F59E0B' : '999999'}`}
                                    alt={label}
                                    className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")}
                                />
                                {isShop && cartCount > 0 && (
                                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-500 text-neutral-950 text-[8px] font-bold rounded-full flex items-center justify-center">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] font-medium tracking-tight">
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
