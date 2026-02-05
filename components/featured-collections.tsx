'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { getCategories } from '@/app/actions'

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
      style={{ rotateX, rotateY }}
    >
      <Link
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        href={`/collections?material=${category.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden bg-neutral-950 transition-all duration-300 hover:z-20 hover:scale-[1.02] border border-white/5"
      >
        {/* Image with Parallax Drift & Aggressive Scale */}
        <div className="absolute inset-0 z-0 h-[120%] -top-[10%]">
          <motion.div style={{ y: yImage }} className="relative h-full w-full">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-300 grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-110 will-change-transform"
              loading="eager"
            />
          </motion.div>

          {/* Default Dark Overlay */}
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-300" />

          {/* Flash Tint REMOVED for cleaner look */}

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 opacity-90" />
        </div>

        {/* Content - Centered */}
        <div
          className="absolute inset-0 z-10 p-8 flex flex-col items-center justify-center text-center"
        >
          {/* Category Number REMOVED */}

          <h3 className="text-3xl md:text-4xl font-serif font-bold text-white uppercase tracking-tighter leading-none mb-6 group-hover:text-white transition-colors duration-300 drop-shadow-lg">
            {category.name}
          </h3>

          {/* Button-like CTA that slides in */}
          <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300 ease-out">
            <span className="inline-block px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
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
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-[#004028] relative overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24">
          <p className="text-amber-500/80 text-[10px] uppercase mb-6 font-premium-sans">
            Crafted Excellence
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-light mb-8 text-white tracking-widest italic">
            Discovery by <span className="text-amber-500">Material</span>
          </h2>
          <div className="w-24 h-[1px] mx-auto bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-8" />
          <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            Each piece is a testament to our legacy of precision, crafted from the world's most precious elements.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <CollectionCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
