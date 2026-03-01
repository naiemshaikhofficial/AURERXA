'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LogOut, User, ShoppingBag, Heart, Package, Search, Settings, Shield, Loader2, X } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useSearch } from '@/context/search-context'
import { useAuth } from '@/context/auth-context'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { getOrdersPollingData } from '@/app/admin/actions'
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
import { Menu } from "lucide-react"
import { ModeToggle } from './mode-toggle'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { staggerContainer, fadeInUp, PREMIUM_EASE } from '@/lib/animation-constants'

export function Navbar({ marketingConfig }: { marketingConfig?: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const { cartCount, openCart } = useCart()
  const { openSearch } = useSearch()
  const { user, profile, isAdmin, loading: authLoading, signOut: handleSignOut } = useAuth()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [searchTermIndex, setSearchTermIndex] = useState(0)

  const searchTerms = [
    "Gold Necklaces",
    "Diamond Rings",
    "Bridal Collections",
    "Chains",
    "Engagement Rings",
    "Luxury Bangles",
    "Earrings",
    "Bracelets",
    "Mangalsutra",
    "Nose Rings",
    "Anklets",
    "Pendants",
    "Earrings",
    "Bracelets",
    "Mangalsutra",
    "Nose Rings",
    "Anklets",
    "Pendants",
  ]

  // Rotating Search Terms Animation (Visibility Optimized)
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSearchTermIndex((prev) => (prev + 1) % searchTerms.length)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [mounted, searchTerms.length])

  useEffect(() => {
    setMounted(true)
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

  // Admin Notification Polling
  useEffect(() => {
    if (!isAdmin || !mounted || !user) {
      setNotificationCount(0)
      return
    }

    const pollNotifications = async () => {
      // Optimization: Skip polling if the tab is hidden
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return
      }

      try {
        const data = await getOrdersPollingData()
        if (!data) return

        const { getDashboardStats } = await import('@/app/admin/actions')
        const stats = await getDashboardStats()
        if (stats) {
          setNotificationCount(stats.pendingOrders)
        }
      } catch (err: any) {
        if (!err.message?.includes('Auth session missing')) {
          console.error('Navbar notification poll error:', err)
        }
      }
    }

    pollNotifications()
    const interval = setInterval(pollNotifications, 180000) // 3 minutes for global badge
    return () => clearInterval(interval)
  }, [isAdmin, mounted, user])

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

  // Safe resolvedTheme for SSR
  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const navHeight = useTransform(scrollY, [0, 100], ['6rem', '4.5rem'])
  const navBg = useTransform(
    scrollY,
    [0, 100],
    [
      `rgba(${isDark ? '0, 0, 0' : '255, 255, 255'}, 0)`,
      `rgba(${isDark ? '0, 0, 0' : '255, 255, 255'}, 0.8)`
    ]
  )
  const navBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(20px)'])

  // Stability: Disable auto-hide to keep header strictly fixed
  useMotionValueEvent(scrollY, "change", () => {
    setHidden(false)
  })

  // Keep navbar always visible
  useEffect(() => {
    setHidden(false)
  }, [])

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        style={{
          height: '5rem',
          backgroundColor: navBg,
          backdropFilter: navBlur,
        }}
        className="w-full relative z-50 flex items-center p-4 md:p-0 border-b border-white/0"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="flex justify-between items-center h-full gap-8">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group relative z-50" aria-label="AURERXA Home">
                <Image
                  src="/logo-new-v2.png"
                  alt="AURERXA Logo"
                  width={180}
                  height={50}
                  priority
                  className="h-10 md:h-12 w-auto object-contain transition-opacity invert dark:invert-0"
                />
              </Link>
            </div>

            {/* Center: Search Pill (Desktop) */}
            <div className="hidden md:flex flex-1 justify-center max-w-xl">
              <button
                onClick={openSearch}
                aria-label="Search jewelry collections (Press Ctrl+K)"
                className="w-full flex items-center justify-center gap-3 px-6 py-2.5 rounded-full bg-card/10 border border-border/60 hover:border-primary/40 hover:bg-card/20 transition-all duration-300 group shadow-sm relative"
              >
                <div className="flex items-center gap-3 w-full justify-center">
                  <Search className="w-4 h-4 text-foreground/60 group-hover:text-primary transition-colors stroke-[1.5px] shrink-0" aria-hidden="true" />
                  <div className="flex items-center">
                    <span className="text-[11px] text-foreground/40 font-light tracking-widest uppercase shrink-0 mr-2">
                      Search for
                    </span>
                    <div className="relative h-4 overflow-hidden min-w-[120px]" aria-live="polite">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={searchTermIndex}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="absolute inset-0 text-[11px] text-foreground/60 font-light tracking-widest uppercase whitespace-nowrap flex items-center"
                        >
                          {searchTerms[searchTermIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="absolute right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                  <span className="text-[8px] text-muted-foreground border border-border rounded px-1">⌘K</span>
                </div>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-5">
              {/* Mobile Menu Trigger (Left side of actions on mobile) */}
              <div className="md:hidden">
                {mounted && (
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="text-foreground/80 hover:text-primary transition-colors p-2" aria-label="Open navigation menu">
                        <Menu className="w-6 h-6 stroke-[1.5px]" />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-background border-r border-border text-foreground w-[85vw] max-w-[300px] p-0 flex flex-col h-[100dvh] gap-0 overflow-hidden">
                      <SheetHeader className="p-4 border-b border-border text-left bg-card/10 flex flex-row items-center justify-between flex-shrink-0">
                        <div>
                          <SheetTitle className="text-3xl font-serif text-foreground/90 font-light tracking-wide">AURERXA</SheetTitle>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Est. 1989</p>
                        </div>
                        <ModeToggle />
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto no-scrollbar py-2 min-h-0">
                        <motion.div
                          variants={staggerContainer}
                          initial="initial"
                          animate="animate"
                          className="flex flex-col px-4 min-h-0"
                        >
                          {[
                            { name: 'Home', href: '/' },
                            { name: 'Shop Collections', href: '/collections' },
                            { name: 'Custom Jewelry', href: '/custom-jewelry' },
                            { name: 'The Price of Perfection', href: '/the-price-of-perfection' },
                            { name: 'Our Story', href: '/about' },
                            { name: 'Ring Size Calculator', href: '/ring-size-calculator' },
                            { name: 'Blog', href: '/blog' },
                            { name: 'Contact Us', href: '/contact-us' },
                            { name: 'FAQs', href: '/faq' }
                          ].map((item, idx) => (
                            <motion.div key={idx} variants={fadeInUp}>
                              <Link
                                href={item.href}
                                aria-current={pathname === item.href ? 'page' : undefined}
                                className={cn(
                                  "flex items-center justify-between py-3 group border-b border-border/5 transition-all text-sm uppercase tracking-[0.25em] font-light",
                                  pathname === item.href ? "text-primary ml-2" : "text-foreground/60 hover:text-primary hover:ml-2"
                                )}
                              >
                                <span>{item.name}</span>
                                <div className={cn(
                                  "h-[1px] w-0 bg-primary/40 transition-all duration-500",
                                  pathname === item.href ? "w-12 ml-4" : "group-hover:w-8 group-hover:ml-4"
                                )} />
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* User Profile Section in Mobile Menu */}
                        <motion.div
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="flex-shrink-0 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-border space-y-2 bg-card/30 backdrop-blur-xl"
                        >
                          {authLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-5 h-5 animate-spin text-primary/40" />
                            </div>
                          ) : user ? (
                            <>
                              <div className="flex items-center gap-3 mb-2 p-2 rounded-sm bg-muted/10 border border-border">
                                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif text-lg">
                                  {getInitials()}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-medium text-foreground/80 uppercase tracking-wider break-words line-clamp-2">{profile?.full_name || 'My Account'}</span>
                                  <span className="text-[10px] text-muted-foreground font-light break-all">{user.email}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <Link
                                  href="/account"
                                  className="flex flex-col items-center justify-center p-2 rounded-sm bg-muted/10 border border-border hover:bg-muted/20 transition-all group"
                                >
                                  <Settings className="w-4 h-4 mb-1 text-muted-foreground group-hover:text-primary/60 transition-colors stroke-1" />
                                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground group-hover:text-primary/80">Account</span>
                                </Link>
                                <button
                                  onClick={handleSignOut}
                                  className="flex flex-col items-center justify-center p-2 rounded-sm bg-muted/10 border border-border hover:bg-muted/20 transition-all group"
                                >
                                  <LogOut className="w-4 h-4 mb-1 text-muted-foreground group-hover:text-destructive/60 transition-colors stroke-1" />
                                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground group-hover:text-destructive/80">Sign Out</span>
                                </button>
                                {isAdmin && (
                                  <Link
                                    href="/admin"
                                    className="flex flex-col items-center justify-center p-2 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all group col-span-2 active:scale-95 tactile-press ml-1 mr-1"
                                  >
                                    <div className="relative">
                                      <Shield className="w-5 h-5 mb-2 text-[#D4AF37] transition-colors stroke-1" />
                                      {notificationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-primary-foreground text-[8px] rounded-full flex items-center justify-center animate-pulse">
                                          {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold">Admin Panel</span>
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

              {/* Search (Mobile Only - Icon) */}
              <button
                onClick={openSearch}
                className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors tactile-press"
                aria-label="Search"
              >
                <Search className="w-6 h-6 text-foreground/70 stroke-[1.5px]" />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-foreground/70 hover:text-primary transition-colors group tactile-press" aria-label="Wishlist">
                <Heart className="w-5 h-5 md:w-6 md:h-6 stroke-[1.2px] group-hover:stroke-primary transition-colors" />
              </Link>

              {/* User/Account */}
              <div className="hidden md:block">
                {authLoading ? (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-primary/40" />
                  </div>
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                      <div className="w-9 h-9 rounded-full bg-muted/20 hover:bg-muted/30 border border-border/40 flex items-center justify-center text-primary/80 font-serif font-medium text-xs transition-all cursor-pointer relative">
                        {getInitials()}
                        {isAdmin && notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-background shadow-lg">
                            {notificationCount > 9 ? '9+' : notificationCount}
                          </span>
                        )}
                      </div>
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
                  <Link href="/login" className="p-2 text-foreground/70 hover:text-primary transition-colors">
                    <User className="w-5 h-5 md:w-6 md:h-6 stroke-[1.2px]" />
                  </Link>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-foreground/70 hover:text-primary transition-colors group tactile-press" aria-label={`Shopping Cart with ${cartCount} items`}>
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 stroke-[1.2px] group-hover:stroke-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center border border-background">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle (Desktop Only) */}
              <div className="hidden md:block">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

    </>
  )
}
