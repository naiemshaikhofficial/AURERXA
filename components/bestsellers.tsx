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
  category?: { name: string }
  categories?: { name: string } // Handling potential join structure
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
      className="group flex flex-col items-center text-center"
    >
      {/* Image Container with Luxury Glow */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900 mb-8 group/img">
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-10 w-full h-full">
          <div className="absolute inset-0 z-0 h-[110%] -top-[5%] w-full">
            <motion.div style={{ y: yImage }} className="relative h-full w-full">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-grayscale duration-700 grayscale-[0.2] group-hover:grayscale-0"
              />
            </motion.div>
          </div>
        </Link>

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />

        {/* Hover Action Buttons */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out z-20 flex flex-col gap-2">
          <Button
            onClick={handleBuyNow}
            disabled={isBuying}
            className="w-full bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-all duration-500 rounded-none h-11 text-[9px] font-premium-sans tracking-[0.2em] font-bold shadow-2xl"
          >
            {isBuying ? 'Processing...' : 'Buy Now'}
          </Button>
          <Button
            onClick={handleProductAdd}
            disabled={isAdding}
            className="w-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-black transition-all duration-500 rounded-none h-11 text-[9px] font-premium-sans tracking-[0.2em] shadow-lg"
          >
            {isAdding ? 'Adding...' : 'Add to Collection'}
          </Button>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-4 left-4 w-6 h-[1px] bg-white/20" />
        <div className="absolute top-4 left-4 w-[1px] h-6 bg-white/20" />
      </div>

      {/* Product Info */}
      <div className="space-y-4 px-4 w-full h-full flex flex-col">
        <p className="text-[9px] font-premium-sans text-amber-500/60 tracking-[0.4em] uppercase">
          {product.categories?.name || 'Exclusive'}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-xl font-serif font-medium text-white tracking-wide group-hover:text-amber-500 transition-colors duration-500">
            {product.name}
          </h3>
        </Link>

        <div className="w-8 h-[1px] bg-white/10 mx-auto" />

        <p className="text-[10px] font-premium-sans text-white/20 tracking-widest pb-4">
          ₹{typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
        </p>
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
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-black relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24">
          <p className="text-amber-500/80 text-[10px] tracking-[0.6em] uppercase mb-6 font-premium-sans">
            Timeless Selection
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-8 text-white tracking-tight italic">
            Curated <span className="text-amber-500">Bestsellers</span>
          </h2>
          <div className="w-24 h-[1px] mx-auto bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-8" />
          <p className="text-sm md:text-base text-white/40 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
            Our most esteemed pieces, celebrated for their exceptional design and unparalleled quality.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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
