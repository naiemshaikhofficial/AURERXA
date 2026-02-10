'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getBestsellers } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fadeInUp, staggerContainer, PREMIUM_EASE } from '@/lib/animation-constants'

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
    <section className="py-12 md:py-32 px-4 md:px-6 lg:px-12 bg-background relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} className="text-center mb-24 md:mb-40 space-y-8">
            <motion.div className="space-y-6">
              <span className="text-primary/60 text-[10px] tracking-[0.8em] font-bold uppercase block">Timeless Selection</span>
              <h2 className="text-5xl md:text-9xl font-serif font-black italic text-foreground tracking-tighter leading-none mb-6">
                Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/40 to-primary">Bestsellers.</span>
              </h2>
              <div className="w-16 h-[0.5px] mx-auto bg-primary/20" />
            </motion.div>
            <p className="text-muted-foreground text-[10px] md:text-xs font-light tracking-[0.4em] uppercase italic max-w-2xl mx-auto leading-relaxed">
              Our most esteemed pieces, celebrated for their exceptional design and unparalleled quality.
            </p>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10"
          >
            {bestsellers.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
