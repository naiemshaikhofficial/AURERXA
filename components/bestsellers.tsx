'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/app/actions'
import { Loader2 } from 'lucide-react'

const bestsellers = [
  {
    id: '1',
    name: 'Diamond Solitaire Ring',
    price: '$2,499',
    category: 'Rings',
    description: 'A classic 1.5 carat diamond set in 18k gold',
    image: '/pexels-janakukebal-30541170.jpg',
  },
  {
    id: '2',
    name: 'Rose Gold Locket',
    price: '$899',
    category: 'Necklaces',
    description: 'Vintage-inspired locket with intricate details',
    image: '/pexels-janakukebal-30541177.jpg',
  },
  {
    id: '3',
    name: 'Pearl Drop Earrings',
    price: '$599',
    category: 'Earrings',
    description: 'Freshwater pearls suspended from gold chains',
    image: '/pexels-punam-oishy-415017245-35059564.jpg',
  },
  {
    id: '4',
    name: 'Tennis Bracelet',
    price: '$3,299',
    category: 'Bracelets',
    description: 'Startling brilliance in a continuous line',
    image: '/pexels-the-glorious-studio-3584518-29245554.jpg',
  },
]

export function Bestsellers() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

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

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-900">
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
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIhAAAgIBAwQDAAAAAAAAAAAAAQIDBAUABhEHEiExQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQEAAwEBAAAAAAAAAAAAAAABAAIDESH/2gAMAwEAAhEDEQA/9bNxfbt+3eYLNGWSOKZywiifj4/n+6jxfU3c2Ot1oI8bUkiikKo8kzH3+flRGp0yLrXE1qT/9k="
                />

                <div className="absolute top-4 right-4 bg-neutral-950/90 backdrop-blur-sm px-3 py-1 text-xs font-medium tracking-wider uppercase text-amber-400">
                  {product.category}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-serif font-medium mb-2 text-white">
                  {product.name}
                </h3>

                <p className="text-sm text-white/50 mb-4 font-light">{product.description}</p>

                <div className="flex justify-between items-center mb-5">
                  <span className="text-2xl font-serif font-bold text-amber-400">{product.price}</span>
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
