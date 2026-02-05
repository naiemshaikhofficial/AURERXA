'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogOut, User, ShoppingBag, Heart, Package } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Get initial user
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

        // Get cart count
        const { count } = await supabase
          .from('cart')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        setCartCount(count || 0)
      }
    }
    getUser()

    // Listen for auth changes
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // Get initials
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10 md:h-20">
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="AURERXA Logo"
              className="h-6 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-10 items-center">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-amber-400 transition-colors duration-300 font-light"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-amber-400 transition-colors duration-300 font-light"
            >
              Our Story
            </Link>
            <Link
              href="/collections"
              className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-amber-400 transition-colors duration-300 font-light"
            >
              Collections
            </Link>
            <Link
              href="/contact"
              className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-amber-400 transition-colors duration-300 font-light"
            >
              Contact
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative text-white/70 hover:text-amber-400 transition-colors">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-white/70 hover:text-amber-400 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-neutral-950 text-xs font-bold rounded-full flex items-center justify-center">
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
                <Button variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-neutral-950 text-xs uppercase tracking-widest h-9 px-6 rounded-none">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
