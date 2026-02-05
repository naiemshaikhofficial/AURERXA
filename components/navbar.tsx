'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogOut, User, ShoppingBag, Heart, Package, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchModal } from './search-modal'

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)

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
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) setProfile(data)
        else {
          setProfile({ full_name: session.user.user_metadata.full_name || session.user.email })
        }

        const { count } = await supabase
          .from('cart')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
        setCartCount(count || 0)
      } else {
        setProfile(null)
        setCartCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'AU'
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 md:bg-black/90 md:backdrop-blur-xl md:border-b md:border-white/10 h-auto md:h-24 flex items-center transition-all duration-500 md:shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-4 md:p-0">
        <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-12 w-full">
          <div className="flex justify-between items-start md:items-center h-full">
            <Link href="/" className="flex-shrink-0 group relative z-50">
              <img
                src="/logo.png"
                alt="AURERXA Logo"
                // Mobile: Smaller, nicely positioned. Desktop: Larger.
                className="h-12 md:h-24 w-auto object-contain brightness-0 invert-[.7] sepia-[1] saturate-[5] hue-rotate-[5deg] drop-shadow-lg"
              />
            </Link>

            {/* Mobile Cart & Search Actions (Visible only on mobile) */}
            <div className="flex gap-4 items-center md:hidden relative z-50 pt-1">
              <Link href="/cart" className="relative text-amber-500 hover:text-white transition-colors p-2 bg-black/50 rounded-full backdrop-blur-sm border border-white/10">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-black">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-12 items-center">
              <Link
                href="/"
                className="text-[10px] font-premium-sans text-white/60 hover:text-amber-500 transition-colors duration-500"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-[10px] font-premium-sans text-white/60 hover:text-amber-500 transition-colors duration-500"
              >
                Our Story
              </Link>
              <Link
                href="/collections"
                className="text-[10px] font-premium-sans text-white/60 hover:text-amber-500 transition-colors duration-500"
              >
                Collections
              </Link>
              <Link
                href="/blog"
                className="text-[10px] font-premium-sans text-white/60 hover:text-amber-500 transition-colors duration-500"
              >
                Blog
              </Link>

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="text-white/40 hover:text-amber-500 transition-colors flex items-center gap-2 group"
              >
                <Search className="w-4 h-4" />
                <span className="text-[9px] font-premium-sans text-white/20 group-hover:text-amber-500/50 hidden lg:block">Search</span>
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative text-white/40 hover:text-amber-500 transition-colors">
                <Heart className="w-4 h-4" />
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative text-white/40 hover:text-amber-500 transition-colors">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-600 text-white text-[8px] font-premium-sans flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Auth Section */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/50 flex items-center justify-center text-amber-500 font-serif font-bold text-sm hover:bg-amber-500 hover:text-neutral-950 transition-all cursor-pointer">
                      {getInitials()}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-white min-w-[200px]">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile?.full_name || 'User'}</span>
                        <span className="text-xs text-white/50 font-normal">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem asChild className="focus:bg-neutral-800 focus:text-white cursor-pointer group">
                      <Link href="/account">
                        <User className="mr-2 h-4 w-4 text-white/50 group-hover:text-amber-400" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-neutral-800 focus:text-white cursor-pointer group">
                      <Link href="/account/orders">
                        <Package className="mr-2 h-4 w-4 text-white/50 group-hover:text-amber-400" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-neutral-800" />
                    <DropdownMenuItem className="focus:bg-neutral-800 focus:text-white cursor-pointer group" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4 text-white/50 group-hover:text-red-400" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="bg-transparent border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-neutral-950 text-[10px] font-premium-sans h-9 px-6 rounded-none transition-all">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
