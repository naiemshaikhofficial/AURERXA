import Link from 'next/link'
import { SupabaseImage as Image } from '@/components/supabase-image'
import { BookOpen, Sparkles } from 'lucide-react'
import { BlogCard } from '@/components/blog-card'
import { STATIC_BLOG_POSTS } from '@/lib/constants/blog-data'

export const metadata = {
    title: 'Jewelry Journal – Aurerxa | Jewelry Care, Trends & Heritage Guides',
    description: 'Read expert jewelry guides, care tips, styling ideas, and latest trends on the AURERXA Journal. Learn how to choose, maintain, and style your gold, diamond, and fashion jewelry.',
    keywords: ['Jewelry Blog', 'Jewelry Care Tips', 'Gold Jewelry Guide', 'Diamond Buying Guide', 'Jewelry Trends 2026', 'How to Style Jewelry'],
}

export default async function BlogPage() {
    const posts = STATIC_BLOG_POSTS;
    const categories = ['All', 'Guide', 'Care Tips', 'Trends', 'News']

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary-foreground overflow-x-hidden">

            {/* Immersive Blog Hero */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-border/50">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/photo_6066572646712807057_y.jpg"
                        alt="High-end Jewelry Craftsmanship"
                        fill
                        className="object-cover opacity-15 grayscale brightness-50 scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-6">
                    <div className="flex items-center justify-center gap-2 text-primary mb-8 animate-in fade-in zoom-in duration-1000">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold">The Journal</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-serif font-black italic tracking-tighter leading-[0.9] text-foreground mb-8 animate-in slide-in-from-bottom-8 duration-1000">
                        HERITAGE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700">INSIGHTS.</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-muted-foreground text-xs md:text-sm tracking-[0.3em] font-light italic animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        Explore the craftsmanship behind our legacy and master the art of fine jewelry.
                    </p>
                </div>
            </section>

            <main className="py-24 md:py-32 bg-background relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Refined Category Filter */}
                    <div className="flex flex-wrap justify-center gap-4 mb-24 animate-in fade-in duration-1000 delay-500">
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={cat === 'All' ? '/blog' : `/blog?category=${cat}`}
                                className="px-8 py-3 rounded-sm border border-border/50 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/[0.03] transition-all duration-500 backdrop-blur-sm group"
                            >
                                <span className="relative inline-block">
                                    {cat}
                                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-500 group-hover:w-full" />
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Blog Posts Grid */}
                    {posts.length === 0 ? (
                        <div className="text-center py-40 animate-in zoom-in-95 duration-700">
                            <div className="mb-10 inline-flex p-10 rounded-full bg-card/50 border border-border/50 ring-1 ring-primary/10">
                                <BookOpen className="w-16 h-16 text-primary/20" />
                            </div>
                            <h3 className="text-3xl font-serif text-foreground mb-4 italic">The library is being curated</h3>
                            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase font-light">New masterpieces are arriving soon</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                            {posts.map((post, idx) => (
                                <BlogCard key={post.id} post={post} index={idx} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
