'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { addToCart } from '@/app/actions'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const allProducts = [
  {
    id: '1',
    name: 'Eternal Diamond Ring',
    category: 'rings',
    price: '₹285,000',
    description: 'Classic solitaire engagement ring with 1.5 carat diamond',
  },
  {
    id: '2',
    name: 'Royal Diamond Solitaire',
    category: 'rings',
    price: '₹425,000',
    description: 'Premium 2 carat diamond with platinum band',
  },
  {
    id: '3',
    name: 'Ruby Promise Ring',
    category: 'rings',
    price: '₹195,000',
    description: 'Burmese ruby with diamond accents',
  },
  {
    id: '4',
    name: 'Golden Elegance Necklace',
    category: 'necklaces',
    price: '₹95,000',
    description: '18K gold chain with pearl pendant',
  },
  {
    id: '5',
    name: 'Diamond Statement Necklace',
    category: 'necklaces',
    price: '₹185,000',
    description: 'Tennis necklace with VS clarity diamonds',
  },
  {
    id: '6',
    name: 'Emerald Essence Necklace',
    category: 'necklaces',
    price: '₹275,000',
    description: 'Colombian emerald with gold detailing',
  },
  {
    id: '7',
    name: 'Royal Pearl Bracelet',
    category: 'bracelets',
    price: '₹125,000',
    description: 'South sea pearls with diamond accents',
  },
  {
    id: '8',
    name: 'Diamond Tennis Bracelet',
    category: 'bracelets',
    price: '₹325,000',
    description: 'Premium quality VS diamonds in 18K gold',
  },
  {
    id: '9',
    name: 'Sapphire Luxury Bracelet',
    category: 'bracelets',
    price: '₹215,000',
    description: 'Ceylon sapphires with diamond spacers',
  },
  {
    id: '10',
    name: 'Emerald Promise Ring',
    category: 'wedding',
    price: '₹325,000',
    description: 'Emerald center stone with diamond side stones',
  },
  {
    id: '11',
    name: 'Sapphire Wedding Band',
    category: 'wedding',
    price: '₹245,000',
    description: 'Blue sapphire with diamond band',
  },
  {
    id: '12',
    name: 'Ultimate Wedding Set',
    category: 'wedding',
    price: '₹625,000',
    description: 'Complete set with engagement ring and wedding band',
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-secondary to-background">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-accent mb-4">
            {category === 'rings'
              ? 'Engagement Rings'
              : category === 'necklaces'
                ? 'Necklaces'
                : category === 'bracelets'
                  ? 'Bracelets'
                  : category === 'wedding'
                    ? 'Wedding Collection'
                    : 'All Collections'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover our handpicked selection of premium jewelry pieces
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group border border-border rounded-sm overflow-hidden bg-background hover:border-accent transition-all duration-300"
              >
                {/* Image placeholder */}
                <div className="h-64 bg-gradient-to-br from-accent/10 to-card/10 flex items-center justify-center overflow-hidden relative group-hover:shadow-lg">
                  <div className="text-center">
                    <div className="text-5xl mb-2">💎</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-serif font-semibold mb-2 text-foreground group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-serif font-bold text-accent">
                      {product.price}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product.id, product.name)}
                    disabled={loadingId !== null}
                    className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold uppercase tracking-widest h-10"
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
            <div className="p-4 bg-accent/10 border border-accent rounded-sm text-center text-sm text-foreground">
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
