'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getBestsellers } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PREMIUM_EASE } from '@/lib/animation-constants'

import { ProductCard, Product } from '@/components/product-card'

export function Bestsellers({ products: initialProducts }: { products?: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const yHeader = useTransform(smoothProgress, [0, 1], [isMobile ? 0 : 100, isMobile ? 0 : -100])
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  const [bestsellers, setBestsellers] = useState<Product[]>(initialProducts || [])

  // Fetch data on client side only if not provided by server
  useEffect(() => {
    if (!initialProducts) {
      async function loadData() {
        const data = await getBestsellers()
        if (data) setBestsellers(data as any)
      }
      loadData()
    } else {
      setBestsellers(initialProducts)
    }
  }, [initialProducts])

  if (bestsellers.length === 0) return null

  return (
    <section ref={sectionRef} className="py-12 md:py-48 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div>
          {/* Section Header */}
          <motion.div
            style={{ y: yHeader, opacity }}
            className="text-center mb-16 md:mb-40 space-y-4 md:space-y-8"
          >
            <div className="space-y-3 md:space-y-6">
              <span className="text-primary/60 text-[8px] md:text-[10px] tracking-[0.8em] font-bold uppercase block">Timeless Selection</span>
              <h2 className="text-3xl sm:text-5xl md:text-9xl font-serif font-black italic text-foreground tracking-tighter leading-none">
                Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/40 to-primary">Bestsellers.</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-[8px] md:text-xs font-light tracking-[0.4em] uppercase italic max-w-2xl mx-auto leading-relaxed opacity-60 md:opacity-100">
              Our most esteemed pieces, celebrated for their exceptional design and unparalleled quality.
            </p>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: PREMIUM_EASE }}
            className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-10"
          >
            {bestsellers.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
