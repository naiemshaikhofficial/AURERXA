'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogOut, User, ShoppingBag, Heart, Package, Search, Settings, Shield } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import { Menu } from "lucide-react"
import { SearchModal } from './search-modal'
import { ModeToggle } from './mode-toggle'
import { useSearch } from '@/context/search-context'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { staggerContainer, fadeInUp, PREMIUM_EASE } from '@/lib/animation-constants'

export function Navbar() {
  const router = useRouter()
  const { cartCount, openCart } = useCart()
  const { openSearch } = useSearch()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data)

        // Check admin status
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .single()
        if (adminData) setIsAdmin(true)
      }

      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          // Fetch Profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (data) setProfile(data)
          else {
            setProfile({ full_name: session.user.user_metadata.full_name || session.user.email })
          }

          // Fetch Admin Status
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', session.user.id)
            .single()
          setIsAdmin(!!adminData)
        } else {
          setProfile(null)
          setIsAdmin(false)
        }
      })
      authListener = data
    }
    getUser()

    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
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

  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const navHeight = useTransform(scrollY, [0, 100], ['6rem', '4.5rem'])
  const navBg = useTransform(scrollY, [0, 100], ['rgba(var(--background), 0)', 'rgba(8, 8, 8, 0.95)'])

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  // Reveal navbar when scrolling stops
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setHidden(false)
      }, 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <>
      <motion.nav
        style={{
          height: navHeight,
          backgroundColor: navBg,
          y: hidden ? '-100%' : '0%'
        }}
        transition={{ duration: 0.4, ease: PREMIUM_EASE }}
        className="fixed top-0 left-0 right-0 z-50 md:backdrop-blur-md flex items-center p-4 md:p-0"
      >
        <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-12 w-full">
          <div className="flex justify-between items-start md:items-center h-full">
            <Link href="/" className="flex-shrink-0 group relative z-50 transition-transform active:scale-95" aria-label="AURERXA Home - Luxury Jewelry">
              <div className="relative h-10 md:h-20 w-32 md:w-56">
                <Image
                  src="/logo.png"
                  alt="AURERXA Logo"
                  fill
                  priority
                  className="object-contain opacity-90 group-hover:opacity-100 transition-opacity dark:invert-0"
                  sizes="(max-width: 768px) 128px, 224px"
                />
              </div>
            </Link>

            {/* Mobile Cart & Search Actions (Visible only on mobile) */}
            <div className="flex gap-4 items-center md:hidden relative z-50 pt-1">
              <Link href="/cart" className="relative text-primary/80 hover:text-primary transition-colors p-2 bg-background/50 rounded-full backdrop-blur-sm border border-border group" aria-label={`Cart with ${cartCount} items`}>
                <img
                  src="https://img.icons8.com/?size=100&id=Ot2P5D5MPltM&format=png&color=BF9B65"
                  alt="Cart"
                  className="w-5 h-5 transition-transform duration-300 group-hover:scale-105"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-card text-primary text-[9px] font-medium rounded-full flex items-center justify-center border border-border">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {mounted && (
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="text-foreground/80 hover:text-primary transition-colors p-2" aria-label="Open Navigation Menu">
                      <Menu className="w-6 h-6 stroke-1" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="bg-background border-r border-border text-foreground w-[85vw] max-w-[300px] p-0">
                    <SheetHeader className="p-8 border-b border-border text-left bg-card/30 flex flex-row items-center justify-between">
                      <div>
                        <SheetTitle className="text-3xl font-serif text-foreground/90 font-light tracking-wide">AURERXA</SheetTitle>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Est. 1989</p>
                      </div>
                      <ModeToggle />
                    </SheetHeader>
                    <div className="flex flex-col py-6 relative">
                      <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="flex flex-col"
                      >
                        {['Home', 'Shop Collections', 'Custom Jewelry', 'Our Story', 'Blog', 'Contact Us'].map((item, idx) => {
                          const href = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`
                          return (
                            <motion.div key={idx} variants={fadeInUp}>
                              <Link href={href} className="flex px-8 py-5 text-sm uppercase tracking-widest font-light text-foreground/60 hover:bg-muted/10 hover:text-primary transition-all border-b border-border/10">
                                {item}
                              </Link>
                            </motion.div>
                          )
                        })}
                        <motion.div variants={fadeInUp}>
                          <Link href="/faq" className="px-8 py-5 text-sm uppercase tracking-widest font-light text-foreground/60 hover:bg-muted/10 hover:text-primary transition-all">
                            FAQs
                          </Link>
                        </motion.div>
                      </motion.div>

                      {/* User Profile Section in Mobile Menu */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-8 px-6 pt-8 border-t border-border space-y-4"
                      >
                        {user ? (
                          <>
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-sm bg-muted/10 border border-border">
                              <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif text-lg">
                                {getInitials()}
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-foreground/80 uppercase tracking-wider">{profile?.full_name || 'My Account'}</span>
                                <span className="text-[10px] text-muted-foreground font-light">{user.email}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Link
                                href="/account"
                                className="flex flex-col items-center justify-center p-4 rounded-sm bg-muted/10 border border-border hover:bg-muted/20 transition-all group"
                              >
                                <Settings className="w-5 h-5 mb-2 text-muted-foreground group-hover:text-primary/60 transition-colors stroke-1" />
                                <span className="text-[9px] uppercase tracking-widest text-muted-foreground group-hover:text-primary/80">Account</span>
                              </Link>
                              <button
                                onClick={handleSignOut}
                                className="flex flex-col items-center justify-center p-4 rounded-sm bg-muted/10 border border-border hover:bg-muted/20 transition-all group"
                              >
                                <LogOut className="w-5 h-5 mb-2 text-muted-foreground group-hover:text-destructive/60 transition-colors stroke-1" />
                                <span className="text-[9px] uppercase tracking-widest text-muted-foreground group-hover:text-destructive/80">Sign Out</span>
                              </button>
                              {isAdmin && (
                                <Link
                                  href="/admin"
                                  className="flex flex-col items-center justify-center p-4 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all group col-span-2"
                                >
                                  <Shield className="w-5 h-5 mb-2 text-[#D4AF37] transition-colors stroke-1" />
                                  <span className="text-[9px] uppercase tracking-widest text-[#D4AF37]">Admin Panel</span>
                                </Link>
                              )}
                            </div>
                          </>
                        ) : (
                          <Link href="/login" className="block">
                            <Button className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-premium-sans py-6 rounded-none uppercase tracking-[0.2em] text-[10px] transition-all">
                              Sign In / Register
                            </Button>
                          </Link>
                        )}
                      </motion.div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-12 items-center">
              {['Home', 'Our Story', 'Collections', 'Blog'].map((item) => (
                <Link
                  key={item}
                  href={item === 'Home' ? '/' : item === 'Our Story' ? '/our-story' : `/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-[11px] font-premium-sans text-muted-foreground hover:text-primary transition-colors duration-500 tracking-[0.2em]"
                >
                  {item}
                </Link>
              ))}

              {/* Search */}
              <button
                onClick={openSearch}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-3 group"
                aria-label="Search products"
              >
                <Search className="w-4 h-4 stroke-[1.5px] group-hover:stroke-primary transition-colors" />
                <span className="text-[10px] font-premium-sans text-muted-foreground/80 group-hover:text-primary/70 hidden lg:block tracking-widest">SEARCH</span>
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative text-muted-foreground hover:text-primary transition-colors group" aria-label="View Wishlist">
                <Heart className="w-4 h-4 stroke-[1.5px] group-hover:stroke-primary transition-colors" />
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative text-muted-foreground hover:text-primary transition-colors group" aria-label={`Shopping Cart with ${cartCount} items`}>
                <ShoppingBag className="w-4 h-4 stroke-[1.5px] group-hover:stroke-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-medium rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mode Toggle */}
              <ModeToggle />

              {/* Auth Section */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none w-9 h-9 rounded-sm bg-muted/20 hover:bg-muted/30 border border-border flex items-center justify-center text-primary/80 font-serif font-medium text-sm transition-all cursor-pointer" aria-label="Open User Menu">
                      {getInitials()}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background border-border text-foreground min-w-[220px] p-2">
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-premium-sans text-[10px] tracking-widest text-foreground/90">{profile?.full_name || 'User'}</span>
                        <span className="text-[9px] text-muted-foreground font-light tracking-wide">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border my-2" />
                    <DropdownMenuItem asChild className="focus:bg-muted focus:text-primary cursor-pointer group p-3 rounded-sm">
                      <Link href="/account" className="flex items-center">
                        <User className="mr-3 h-3 w-3 opacity-50 group-hover:opacity-100" />
                        <span className="text-[10px] tracking-widest uppercase text-muted-foreground group-hover:text-primary">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-muted focus:text-primary cursor-pointer group p-3 rounded-sm">
                      <Link href="/account/orders" className="flex items-center">
                        <Package className="mr-3 h-3 w-3 opacity-50 group-hover:opacity-100" />
                        <span className="text-[10px] tracking-widest uppercase text-muted-foreground group-hover:text-primary">Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="focus:bg-muted focus:text-primary cursor-pointer group p-3 rounded-sm">
                        <Link href="/admin" className="flex items-center">
                          <Shield className="mr-3 h-3 w-3 opacity-50 group-hover:opacity-100" />
                          <span className="text-[10px] tracking-widest uppercase text-[#D4AF37] group-hover:text-[#D4AF37]">Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border my-2" />
                    <DropdownMenuItem className="focus:bg-destructive/10 focus:text-destructive cursor-pointer group p-3 rounded-sm" onClick={handleSignOut}>
                      <LogOut className="mr-3 h-3 w-3 opacity-50 group-hover:opacity-100" />
                      <span className="text-[10px] tracking-widest uppercase text-muted-foreground group-hover:text-destructive">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <span className="text-[10px] font-premium-sans text-muted-foreground hover:text-foreground transition-colors tracking-[0.2em] border-b border-transparent hover:border-primary pb-1">
                    SIGN IN
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <SearchModal />
    </>
  )
}
