'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { getCategories } from '@/app/actions'
import { fadeInUp, staggerContainer, PREMIUM_EASE } from '@/lib/animation-constants'

function CollectionCard({ category }: { category: any }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start']
  })

  // Internal image drift
  const yImage = useTransform(scrollYProgress, [0, 1], [-40, 40])

  // Magnetic Tilt Logic
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg'])

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    // Disable heavy tilt on mobile simply by not setting if window is small (conceptually)
    // or relying on the fact that mouseMove doesn't fire constantly on touch like this
    x.set(xPct)
    y.set(yPct)
  }

  // Optimize Image Drift for Mobile (Prevent "baar baar loading" feeling)
  // We use `will-change` in CSS to help browser optimize


  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      variants={fadeInUp}
      style={{ rotateX, rotateY }}
    >
      <Link
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        href={`/collections?material=${category.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden bg-card transition-all duration-300 hover:z-20 hover:scale-[1.02] border border-border"
      >
        {/* Image with Parallax Drift & Aggressive Scale */}
        <div className="absolute inset-0 z-0 h-[120%] -top-[10%]">
          <motion.div style={{ y: yImage }} className="relative h-full w-full">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-300 group-hover:scale-110 will-change-transform"
              loading="eager"
              unoptimized
            />
          </motion.div>

          {/* Default Dark Overlay - kept dark for text contrast */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-90" />
        </div>

        {/* Content - Bottom Left Editorial Style */}
        <div
          className="absolute inset-0 z-10 p-10 flex flex-col justify-end"
        >
          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <p className="text-primary/80 text-[9px] uppercase tracking-[0.4em] font-bold mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700">Explore</p>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white italic tracking-tighter leading-none mb-8 group-hover:text-primary transition-colors duration-300">
              {category.name}
            </h3>
          </div>

          {/* Minimalist CTA */}
          <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-700 ease-out">
            <span className="inline-block border-b border-white/20 pb-1 text-[10px] text-white/60 uppercase tracking-[0.3em] font-light hover:text-white transition-colors">
              View Collection
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function FeaturedCollections() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const data = await getCategories()
      if (data) setCategories(data)
    }
    load()
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="py-12 md:py-32 px-4 md:px-6 lg:px-12 bg-background relative overflow-hidden">
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
              <span className="text-primary/60 text-[10px] tracking-[0.8em] font-bold uppercase block">Crafted Excellence</span>
              <h2 className="text-5xl md:text-9xl font-serif font-black italic text-foreground tracking-tighter leading-none mb-6">
                Discovery by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary/40 to-primary">Material.</span>
              </h2>
              <div className="w-16 h-[0.5px] mx-auto bg-primary/20" />
            </motion.div>
            <p className="text-muted-foreground text-[10px] md:text-xs font-light tracking-[0.4em] uppercase italic max-w-2xl mx-auto leading-relaxed">
              Each piece is a testament to our legacy of precision, crafted from the world's most precious elements.
            </p>
          </motion.div>

          {/* Collections Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {categories.map((category) => (
              <CollectionCard key={category.id} category={category} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
