'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { addToCart, getProducts } from '@/app/actions'
import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

// Interface to match DB Product
interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock: number
  sizes?: string[]
  categories?: { name: string }
}

function CollectionsContent() {
  const searchParams = useSearchParams()
  const material = searchParams.get('material') || '' // Changed from category to material per user flow
  const [products, setProducts] = useState<Product[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      // If material param exists, use it to filter
      const data = await getProducts(material)
      if (data) setProducts(data as any)
    }
    loadProducts()
  }, [material])

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

  const categoryTitle = material
    ? `${material.charAt(0).toUpperCase() + material.slice(1)} Collection`
    : 'All Collections'

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-950 to-neutral-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Discover
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
            {categoryTitle}
          </h1>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6" />
          <p className="text-base text-white/50 max-w-xl mx-auto font-light">
            Discover our handpicked selection of premium jewelry pieces
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center text-white/50 py-20">
              <p>No products found in this category yet.</p>
              <p className="text-sm mt-2">Check back soon for our latest additions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all duration-500"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />

                    {/* Low Stock Indicator */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-2 right-2 bg-red-900/80 text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                        Only {product.stock} Left
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-serif font-medium mb-2 text-white">
                      {product.name}
                    </h3>

                    <p className="text-sm text-white/50 mb-4 font-light line-clamp-1">{product.description}</p>

                    {/* Sizes if available */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {product.sizes.map(size => (
                          <span key={size} className="text-[10px] border border-neutral-700 text-white/60 px-1.5 py-0.5">
                            {size}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-5">
                      <span className="text-xl font-serif font-bold text-amber-400">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product.id, product.name)}
                      disabled={loadingId !== null || product.stock === 0}
                      className={`w-full font-medium uppercase tracking-[0.15em] h-11 text-xs transition-all duration-300 ${product.stock === 0
                          ? 'bg-neutral-800 text-white/30 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                        }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : (
                        loadingId === product.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : 'Add to Cart'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 text-center text-sm text-white sticky bottom-4">
              {message}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function CollectionsPage() {
  return (
    <Suspense>
      <CollectionsContent />
    </Suspense>
  )
}
