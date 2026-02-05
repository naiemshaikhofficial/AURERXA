'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="AURERXA Logo"
              width={150}
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <Link
              href="/"
              className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              href="/collections"
              className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/contact"
              className="text-sm uppercase tracking-widest hover:text-accent transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
