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
    <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4 font-light">
            Materials
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 text-white tracking-tight">
            Discover by Category
          </h2>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6" />
          <p className="text-base text-white/50 max-w-xl mx-auto font-light leading-relaxed">
            Explore our exclusive collections crafted from the finest materials
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collections?material=${category.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden"
            >
              {/* Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white items-center text-center">
                <h3 className="text-2xl font-serif font-medium mb-3 tracking-wide text-white group-hover:text-amber-400 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-sm text-white/60 font-light transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 px-2 line-clamp-2">
                  {category.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 w-8 h-px bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100" />
              </div>

              {/* Gold border on hover */}
              <div className="absolute inset-0 border border-amber-400/0 group-hover:border-amber-400/50 transition-all duration-500 z-20" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
