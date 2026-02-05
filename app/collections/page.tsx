'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/app/actions'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

const allProducts = [
  {
    id: '1',
    name: 'Eternal Diamond Ring',
    category: 'rings',
    price: '₹285,000',
    description: 'Classic solitaire engagement ring with 1.5 carat diamond',
    image: '/pexels-abhishek-saini-1415858-3847212.jpg',
  },
  {
    id: '2',
    name: 'Royal Diamond Solitaire',
    category: 'rings',
    price: '₹425,000',
    description: 'Premium 2 carat diamond with platinum band',
    image: '/pexels-janakukebal-30541170.jpg',
  },
  {
    id: '3',
    name: 'Ruby Promise Ring',
    category: 'rings',
    price: '₹195,000',
    description: 'Burmese ruby with diamond accents',
    image: '/pexels-janakukebal-30541177.jpg',
  },
  {
    id: '4',
    name: 'Golden Elegance Necklace',
    category: 'necklaces',
    price: '₹95,000',
    description: '18K gold chain with pearl pendant',
    image: '/pexels-janakukebal-30541179.jpg',
  },
  {
    id: '5',
    name: 'Diamond Statement Necklace',
    category: 'necklaces',
    price: '₹185,000',
    description: 'Tennis necklace with VS clarity diamonds',
    image: '/pexels-punam-oishy-415017245-35059564.jpg',
  },
  {
    id: '6',
    name: 'Emerald Essence Necklace',
    category: 'necklaces',
    price: '₹275,000',
    description: 'Colombian emerald with gold detailing',
    image: '/pexels-the-glorious-studio-3584518-29245554.jpg',
  },
  {
    id: '7',
    name: 'Royal Pearl Bracelet',
    category: 'bracelets',
    price: '₹125,000',
    description: 'South sea pearls with diamond accents',
    image: '/pexels-janakukebal-30541184.jpg',
  },
  {
    id: '8',
    name: 'Diamond Tennis Bracelet',
    category: 'bracelets',
    price: '₹325,000',
    description: 'Premium quality VS diamonds in 18K gold',
    image: '/pexels-janakukebal-30541185.jpg',
  },
  {
    id: '9',
    name: 'Sapphire Luxury Bracelet',
    category: 'bracelets',
    price: '₹215,000',
    description: 'Ceylon sapphires with diamond spacers',
    image: '/pexels-vikashkr50-27155546.jpg',
  },
  {
    id: '10',
    name: 'Emerald Promise Ring',
    category: 'wedding',
    price: '₹325,000',
    description: 'Emerald center stone with diamond side stones',
    image: '/heritage-rings.jpg',
  },
  {
    id: '11',
    name: 'Sapphire Wedding Band',
    category: 'wedding',
    price: '₹245,000',
    description: 'Blue sapphire with diamond band',
    image: '/stock-photo-pair-of-silver-rings-with-small-diamonds-for-lovers.jpg',
  },
  {
    id: '12',
    name: 'Ultimate Wedding Set',
    category: 'wedding',
    price: '₹625,000',
    description: 'Complete set with engagement ring and wedding band',
    image: '/pexels-abhishek-saini-1415858-3847212.jpg',
  },
]

function CollectionsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || ''
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const filteredProducts = category
    ? allProducts.filter(p => p.category === category)
    : allProducts

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

  const categoryTitle = category === 'rings'
    ? 'Engagement Rings'
    : category === 'necklaces'
      ? 'Necklaces'
      : category === 'bracelets'
        ? 'Bracelets'
        : category === 'wedding'
          ? 'Wedding Collection'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-serif font-medium mb-2 text-white">
                    {product.name}
                  </h3>

                  <p className="text-sm text-white/50 mb-4 font-light">{product.description}</p>

                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xl font-serif font-bold text-amber-400">
                      {product.price}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product.id, product.name)}
                    disabled={loadingId !== null}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-medium uppercase tracking-[0.15em] h-11 text-xs transition-all duration-300"
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
