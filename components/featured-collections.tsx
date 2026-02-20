'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, MotionValue, useSpring } from 'framer-motion'
import { getCategories } from '@/app/actions'
import { fadeInUp, staggerContainer, PREMIUM_EASE } from '@/lib/animation-constants'
import { sanitizeImagePath } from '@/lib/utils'

function CollectionCard({ category, parentScrollProgress }: { category: any, parentScrollProgress?: MotionValue<number> }) {
  // Parallax for Image
  const fallback = useMotionValue(0)
  const yParallax = useTransform(parentScrollProgress || fallback, [0, 1], [0, -50])

  return (
    <motion.div
      variants={fadeInUp}
    >
      <Link
        href={`/collections/${category.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden bg-card transition-all duration-300 hover:z-20 hover:scale-[1.02]"
      >
        {/* Image with Parallax & Scale Effect */}
        <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
          {/* Apply Parallax Y here */}
          <motion.div style={{ y: parentScrollProgress ? yParallax : 0 }} className="relative h-[115%] w-full -top-[7.5%]"> {/* Taller container for parallax room */}
            <Image
              src={sanitizeImagePath(category.image_url)}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-1000 group-hover:scale-110 will-change-transform"
              loading="eager"
            />
          </motion.div>

          {/* Default Dark Overlay - kept dark for text contrast */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-90" />
        </div>

        {/* Content Over Image */}
        <div
          className="absolute inset-0 z-10 p-10 flex flex-col justify-end"
        >
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]">
            <p className="text-primary/80 text-[9px] uppercase tracking-[0.4em] font-bold mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700">Explore</p>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white italic tracking-tighter leading-none mb-4 group-hover:text-primary transition-colors duration-300">
              {category.name}
            </h3>
          </div>

          {/* Minimalist CTA */}
          <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-700 ease-out">
            <span className="inline-block text-[10px] text-white/60 uppercase tracking-[0.3em] font-light hover:text-white transition-colors">
              View Collection
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function FeaturedCollections({ categories: initialCategories }: { categories?: any[] }) {
  const [categories, setCategories] = useState<any[]>(initialCategories || [])
  const containerRef = useRef(null)

  // Shared Scroll Progress for Performance (1 listener for all cards)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  useEffect(() => {
    if (!initialCategories) {
      async function load() {
        const data = await getCategories()
        if (data) setCategories(data)
      }
      load()
    } else {
      setCategories(initialCategories)
    }
  }, [initialCategories])

  // if (categories.length === 0) return null // Removed early return to fix Ref Hydration error

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

  return (
    <section ref={containerRef} className="py-24 md:py-48 bg-background relative overflow-hidden">
      {categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <motion.div
            style={{ y: yHeader, opacity }}
            className="text-center mb-24 md:mb-40 space-y-8"
          >
            <div className="space-y-6">
              <span className="text-primary/60 text-[10px] tracking-[0.8em] font-bold uppercase block">Crafted Excellence</span>
              <h2 className="text-4xl sm:text-5xl md:text-9xl font-serif font-black italic text-foreground tracking-tighter leading-none">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/40 to-primary">Collections.</span>
              </h2>
            </div>
            <Link href="/collections" className="group block">
              <div className="text-muted-foreground text-[10px] md:text-xs font-light tracking-[0.4em] uppercase italic max-w-2xl mx-auto leading-relaxed group-hover:text-primary transition-colors inline-flex items-center gap-2">
                Explore our curated series of masterpieces, each with a unique heritage.
                <div className="w-8 h-[1px] bg-primary/30 group-hover:w-12 group-hover:bg-primary transition-all duration-700 hidden md:block" />
              </div>
            </Link>
          </motion.div>

          {/* Collections Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6"
          >
            {categories.map((category) => (
              <CollectionCard key={category.id} category={category} parentScrollProgress={scrollYProgress} />
            ))}
          </motion.div>
        </div>
      )}
    </section>
  )
}
