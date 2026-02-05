import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getBlogPosts } from '@/app/actions'
import { BookOpen, Calendar, ArrowRight } from 'lucide-react'

export const metadata = {
    title: 'Blog - Jewelry Guide | AURERXA',
    description: 'Discover jewelry care tips, buying guides, and the latest trends from AURERXA.'
}

export default async function BlogPage() {
    const posts = await getBlogPosts()

    const categories = ['All', 'Guide', 'Care Tips', 'Trends', 'News']

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-24 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
                            <BookOpen className="w-5 h-5" />
                            <span className="text-sm uppercase tracking-[0.2em]">Jewelry Journal</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Blog & Guides</h1>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            Expert advice on choosing, caring for, and styling your precious jewelry
                        </p>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={cat === 'All' ? '/blog' : `/blog?category=${cat}`}
                                className="px-4 py-2 border border-neutral-700 text-sm hover:border-amber-500 hover:text-amber-400 transition-colors"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    {/* Posts Grid */}
                    {posts.length === 0 ? (
                        <div className="text-center py-16">
                            <BookOpen className="w-16 h-16 mx-auto mb-6 text-white/20" />
                            <p className="text-xl text-white/50">No articles yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <article
                                    key={post.id}
                                    className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all group"
                                >
                                    <Link href={`/blog/${post.slug}`}>
                                        <div className="relative aspect-video overflow-hidden">
                                            <Image
                                                src={post.cover_image || '/placeholder-blog.jpg'}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-amber-500 text-neutral-950 text-xs font-bold uppercase">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="p-6">
                                        <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(post.published_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <Link href={`/blog/${post.slug}`}>
                                            <h2 className="font-serif text-xl font-medium mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>
                                        </Link>

                                        <p className="text-white/50 text-sm mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="inline-flex items-center text-amber-500 text-sm hover:text-amber-400 transition-colors"
                                        >
                                            Read More <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
