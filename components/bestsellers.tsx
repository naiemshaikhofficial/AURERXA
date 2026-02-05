'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { addToCart, getBestsellers } from '@/app/actions'
import { Loader2 } from 'lucide-react'

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

export function Bestsellers() {
  const [bestsellers, setBestsellers] = useState<Product[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Fetch data on client side for now to handle async server action in client component
  // In a real app, this could be passed as initialData from a Server Component parent
  useEffect(() => {
    async function loadData() {
      const data = await getBestsellers()
      if (data) setBestsellers(data as any)
    }
    loadData()
  }, [])

  const handleAddToCart = async (id: string, name: string) => {
    setLoadingId(id)
    try {
      const result = await addToCart(id, name)
      setMessage(result.message)
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoadingId(null)
    }
  }

  // If no data yet (or DB empty), don't render or render fallback?
  // Current user wants dynamic, so empty state if empty.
  if (bestsellers.length === 0) return null

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Most Loved
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 text-white tracking-tight">
            Bestsellers
          </h2>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6" />
          <p className="text-base text-white/50 max-w-xl mx-auto font-light leading-relaxed">
            Discover our most beloved pieces loved by discerning customers worldwide
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <div
              key={product.id}
              className="group bg-neutral-950 border border-neutral-800 hover:border-amber-500/30 transition-all duration-500"
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIhAAAgIBAwQDAAAAAAAAAAAAAQIDBAUABhEHEiExQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQEAAwEBAAAAAAAAAAAAAAABAAIDESH/2gAMAwEAAhEDEQA/9bNxfbt+3eYLNGWSOKZywiifj4/n+6jxfU3c2Ot1oI8bUkiikKo8kzH3+flRGp0yLrXE1qT/9k="
                />

                <div className="absolute top-4 right-4 bg-neutral-950/90 backdrop-blur-sm px-3 py-1 text-xs font-medium tracking-wider uppercase text-amber-400">
                  {/* Handle joined category name safely */}
                  {product.categories?.name || 'Exclusive'}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-serif font-medium mb-2 text-white">
                  {product.name}
                </h3>

                <p className="text-sm text-white/50 mb-4 font-light line-clamp-2">{product.description}</p>

                <div className="flex justify-between items-center mb-5">
                  <span className="text-2xl font-serif font-bold text-amber-400">
                    {/* Format price if number */}
                    {typeof product.price === 'number'
                      ? `₹${product.price.toLocaleString()}`
                      : product.price}
                  </span>
                </div>

                <Button
                  onClick={() => handleAddToCart(product.id, product.name)}
                  disabled={loadingId !== null}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium uppercase tracking-[0.15em] h-12 text-xs transition-all duration-300"
                >
                  {loadingId === product.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 text-center text-sm text-white">
            {message}
          </div>
        )}
      </div>
    </section>
  )
}
