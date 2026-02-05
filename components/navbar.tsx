'use client'

import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="AURERXA Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-10">
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
          </div>
        </div>
      </div>
    </nav>
  )
}
