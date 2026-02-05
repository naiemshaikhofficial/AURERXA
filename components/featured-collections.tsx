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
    x.set(xPct)
    y.set(yPct)
  }

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
        className="group relative block aspect-[4/5] overflow-hidden bg-black transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Image with Parallax Drift */}
        <div className="absolute inset-0 z-0 h-[120%] -top-[10%]">
          <motion.div style={{ y: yImage }} className="relative h-full w-full">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-grayscale duration-700 grayscale-[0.3] group-hover:grayscale-0 scale-110"
            />
          </motion.div>
          {/* Minimalist Gradient overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>

        {/* Content */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 p-10 text-center flex flex-col items-center"
        >
          <h3 className="text-xl md:text-2xl font-serif font-medium mb-4 tracking-wider text-white">
            {category.name}
          </h3>
          {/* Precision Line */}
          <div className="w-0 h-[1px] bg-amber-500 group-hover:w-16 transition-all duration-700 ease-in-out" />
          <p className="mt-6 text-[9px] text-white/40 font-premium-sans tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            Explore Collection
          </p>
        </div>

        {/* Ultra-thin precise border */}
        <div className="absolute inset-0 border border-white/5 group-hover:border-amber-500/20 transition-colors duration-700" />
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
      {/* Decorative texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24">
          <p className="text-amber-500/80 text-[10px] tracking-[0.6em] uppercase mb-6 font-premium-sans">
            Crafted Excellence
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-8 text-white tracking-tight italic">
            Discovery by <span className="text-amber-500">Material</span>
          </h2>
          <div className="w-24 h-[1px] mx-auto bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-8" />
          <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            Each piece is a testament to our legacy of precision, crafted from the world's most precious elements.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CollectionCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
