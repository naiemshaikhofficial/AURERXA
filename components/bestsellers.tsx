'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getBestsellers } from '@/app/actions'
import { useCart } from '@/context/cart-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Define the Product interface based on standard DB schema
interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  slug: string
  categories?: { name: string }
  purity?: string
  weight_grams?: number
  gender?: string
  stock?: number
}

function ProductCard({ product }: {
  product: Product
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start']
  })

  // Subtle internal image drift
  const yImage = useTransform(scrollYProgress, [0, 1], [-30, 30])

  // Magnetic Tilt Logic
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleProductAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAdding(true)
    await addItem(product.id, 'Standard', 1, product)
    setIsAdding(false)
  }

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsBuying(true)
    await addItem(product.id, 'Standard', 1, product)
    router.push('/checkout')
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-neutral-900 border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 group/img">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-10 block">
          <div className="absolute inset-0 z-0 h-[110%] -top-[5%] w-full">
            <motion.div style={{ y: yImage }} className="relative h-full w-full">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-grayscale duration-700 grayscale-[0.2] group-hover:grayscale-0"
                unoptimized
              />
            </motion.div>
          </div>
        </Link>
        <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2 relative z-10 bg-black flex-1 flex flex-col text-left">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-[10px] text-amber-500 font-premium-sans tracking-widest uppercase truncate">
                {product.categories?.name || 'EXCLUSIVE'}
              </p>
              {product.purity && (
                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[8px] uppercase tracking-wider text-amber-500 font-bold">
                  {product.purity}
                </span>
              )}
              {product.weight_grams && (
                <span className="px-1.5 py-0.5 border border-white/10 text-[8px] uppercase tracking-wider text-white/40">
                  {product.weight_grams}g
                </span>
              )}
            </div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-lg font-serif text-white font-medium group-hover:text-amber-500 transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>
            {product.description && (
              <p className="mt-1 text-[11px] text-white/30 font-light line-clamp-2 leading-tight">
                {product.description}
              </p>
            )}
          </div>
          <span className="text-lg font-light text-white/90 whitespace-nowrap self-start">
            ₹{product.price.toLocaleString()}
          </span>
        </div>

        {/* Buttons - Side by Side on Mobile, Grid on Desktop */}
        <div className="grid grid-cols-2 gap-2 overflow-hidden max-h-24 opacity-100 md:max-h-0 md:opacity-0 md:group-hover:max-h-24 md:group-hover:opacity-100 transition-all duration-500 ease-out pt-1">
          <Button
            onClick={handleProductAdd}
            disabled={isAdding}
            className="w-full bg-neutral-800 border border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 h-8 text-[8px] uppercase font-bold tracking-widest rounded-none"
          >
            {isAdding ? '...' : 'Add'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isBuying}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 transition-all duration-300 h-8 text-[8px] uppercase font-bold tracking-widest rounded-none shadow-lg"
          >
            {isBuying ? '...' : 'Buy'}
          </Button>
        </div>

        <div className="w-full h-[1px] bg-white/10 group-hover:bg-amber-500/50 transition-colors mt-auto" />
      </div>
    </motion.div>
  )
}

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
