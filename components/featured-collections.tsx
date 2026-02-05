import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/app/actions'

export async function FeaturedCollections() {
  const categories = await getCategories()

  if (!categories || categories.length === 0) {
    // Return empty or fallback UI if no categories found (shouldn't happen after seed)
    return null
  }

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
            <Link
              key={category.id}
              href={`/collections?material=${category.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-black"
            >
              {/* Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1.5s] ease-[0.16, 1, 0.3, 1] group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                />
                {/* Minimalist Gradient overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-10 text-center flex flex-col items-center">
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
          ))}
        </div>
      </div>
    </section>
  )
}
