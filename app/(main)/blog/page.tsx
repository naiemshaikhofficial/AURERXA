import Link from 'next/link'
import { SupabaseImage as Image } from '@/components/supabase-image'
import { getBlogPosts } from '@/app/actions'
import { BookOpen, Calendar, ArrowRight, Sparkles } from 'lucide-react'

export const metadata = {
    title: 'Jewelry Blog - Care Tips, Buying Guides & Trends | AURERXA Journal',
    description: 'Read expert jewelry guides, care tips, styling ideas, and latest trends on the AURERXA Journal. Learn how to choose, maintain, and style your gold, diamond, and fashion jewelry.',
    keywords: ['Jewelry Blog', 'Jewelry Care Tips', 'Gold Jewelry Guide', 'Diamond Buying Guide', 'Jewelry Trends 2026', 'How to Style Jewelry'],
}

export const revalidate = 3600 // revalidate every hour

export default async function BlogPage() {
    const posts = await getBlogPosts()

    const categories = ['All', 'Guide', 'Care Tips', 'Trends', 'News']

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Global Atmosphere - REMOVED */}

            <main className="pt-32 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-24 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                        <div className="flex items-center justify-center gap-2 text-amber-500 mb-6 animate-in fade-in duration-700">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Insights</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight animate-in slide-in-from-bottom-4 duration-700">
                            Jewelry <span className="text-amber-500 italic">Journal</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl mx-auto font-light text-sm md:text-base animate-in slide-in-from-bottom-6 duration-700">
                            Explore the craftsmanship behind our heritage pieces and master the art of fine jewelry care.
                        </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-20 animate-in fade-in duration-1000">
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={cat === 'All' ? '/blog' : `/blog?category=${cat}`}
                                className="px-6 py-2.5 rounded-full border border-border text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 bg-card/50 backdrop-blur-sm"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    {/* Posts Grid */}
                    {posts.length === 0 ? (
                        <div className="text-center py-32 animate-in zoom-in-95 duration-500">
                            <div className="mb-8 inline-flex p-8 rounded-full bg-muted border border-border">
                                <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-serif text-foreground mb-2 italic">The library is empty</h3>
                            <p className="text-muted-foreground text-sm tracking-widest uppercase font-light">New articles are being crafted</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {posts.map((post, idx) => (
                                <article
                                    key={post.id}
                                    className="group flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700"
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-muted border border-border group-hover:border-primary/30 transition-all duration-500 mb-6">
                                        <Image
                                            src={post.cover_image || '/placeholder-blog.jpg'}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-4 left-4">
                                            <span className="px-3 py-1 bg-background/80 backdrop-blur-md border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest">
                                                {post.category}
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4">
                                            <Calendar className="w-3.5 h-3.5 text-primary/50" />
                                            <span>
                                                {new Date(post.published_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <Link href={`/blog/${post.slug}`}>
                                            <h2 className="font-serif text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug italic">
                                                {post.title}
                                            </h2>
                                        </Link>

                                        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 font-light leading-relaxed">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="mt-auto inline-flex items-center gap-2 group/btn"
                                        >
                                            <span className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold border-b border-primary/30 pb-1 group-hover/btn:border-primary transition-all">
                                                Explore Article
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-primary group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
