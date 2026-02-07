'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getBestsellers } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ProductCard, Product } from '@/components/product-card'

export function Bestsellers() {
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Fetch data on client side
  useEffect(() => {
    async function loadData() {
      const data = await getBestsellers()
      if (data) setBestsellers(data as any)
    }
    loadData()
  }, [])

  if (bestsellers.length === 0) return null

  return (
    <section className="py-12 md:py-32 px-4 md:px-6 lg:px-12 bg-black relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-24">
          <p className="text-amber-500/80 text-[10px] uppercase mb-4 md:mb-6 font-premium-sans">
            Timeless Selection
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif font-light mb-6 md:mb-8 text-white tracking-widest italic">
            Curated <span className="text-amber-500">Bestsellers</span>
          </h2>
          <div className="w-24 h-[1px] mx-auto bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-6 md:mb-8" />
          <p className="text-sm md:text-base text-white/40 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            Our most esteemed pieces, celebrated for their exceptional design and unparalleled quality.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
