import Link from 'next/link'
import Image from 'next/image'

const collections = [
  {
    id: 'rings',
    name: 'Engagement Rings',
    description: 'Timeless symbols of love and commitment',
    image: '/pexels-abhishek-saini-1415858-3847212.jpg',
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    description: 'Elegant pieces that frame your beauty',
    image: '/pexels-janakukebal-30541179.jpg',
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    description: 'Delicate adornments for the wrist',
    image: '/pexels-janakukebal-30541184.jpg',
  },
  {
    id: 'wedding',
    name: 'Wedding Collection',
    description: 'Celebrate your special day',
    image: '/pexels-janakukebal-30541185.jpg',
  },
]

export function FeaturedCollections() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4 text-gradient-gold tracking-wider">
            Our Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each collection represents our commitment to excellence and timeless beauty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections?category=${collection.id}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-sm"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIhAAAgIBAwQDAAAAAAAAAAAAAQIDBAUABhEHEiExQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQEAAwEBAAAAAAAAAAAAAAABAAIDESH/2gAMAwEAAhEDEEQA/9bNxfbt+3eYLNGWSOKZywiifj4/n+6jxfU3c2Ot1oI8bUkiikKo8kzH3+flRGp0yLrXE1qT/9k="
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-serif font-semibold mb-2">
                  {collection.name}
                </h3>
                <p className="text-sm text-white/80">
                  {collection.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
