'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export function BottomNav() {
    const pathname = usePathname()
    const [cartCount, setCartCount] = useState(0)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { count } = await supabase
                    .from('cart')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                setCartCount(count || 0)
            }
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                const { count } = await supabase
                    .from('cart')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', session.user.id)
                setCartCount(count || 0)
            } else {
                setCartCount(0)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const links = [
        {
            href: '/',
            label: 'Home',
            icon: Home,
        },
        {
            href: '/collections',
            label: 'Shop',
            icon: ShoppingBag,
        },
        {
            href: '/wishlist',
            label: 'Wishlist',
            icon: Heart,
        },
        {
            href: user ? '/account' : '/login',
            label: 'Account',
            icon: User,
        },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-800 md:hidden safe-area-pb">
            <nav className="flex items-center justify-around h-14">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href === '/collections' && pathname.startsWith('/collections')) || (href === '/account' && pathname.startsWith('/account'))
                    const isCart = href === '/cart'
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
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {isCart && cartCount > 0 && (
                                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
