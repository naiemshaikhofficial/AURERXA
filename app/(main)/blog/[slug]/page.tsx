import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SupabaseImage as Image } from '@/components/supabase-image'
import { Calendar, User, ArrowLeft, Tag, Share2 } from 'lucide-react'
import { BlogReadingProgress } from '@/components/blog-reading-progress'
import { Metadata } from 'next'
import { STATIC_BLOG_POSTS } from '@/lib/constants/blog-data'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const post = STATIC_BLOG_POSTS.find(p => p.slug === slug)
    if (!post) return { title: 'Post Not Found | AURERXA' }

    const baseUrl = 'https://www.aurerxa.com'
    return {
        title: `${post.title} | Journal | AURERXA`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.cover_image || `${baseUrl}/icon-512.png`],
            type: 'article',
            publishedTime: post.published_at,
            authors: [post.author],
        }
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = STATIC_BLOG_POSTS.find(p => p.slug === slug)

    if (!post) {
        notFound()
    }

    const relatedPosts = STATIC_BLOG_POSTS.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3)
    const baseUrl = 'https://www.aurerxa.com'

    const articleLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: [post.cover_image],
        datePublished: post.published_at,
        author: {
            '@type': 'Person',
            name: post.author,
            url: `${baseUrl}/about-us`
        },
        publisher: {
            '@type': 'Organization',
            name: 'AURERXA',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo.png`
            }
        }
    }

    // Conditional HowTo Schema for the cleaning guide
    const isCleaningGuide = post.slug.includes('clean')
    const howToLd = isCleaningGuide ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: post.title,
        description: post.excerpt,
        step: [
            {
                '@type': 'HowToStep',
                name: 'Line a bowl',
                text: 'Line a ceramic bowl with aluminum foil.'
            },
            {
                '@type': 'HowToStep',
                name: 'Add liquid',
                text: 'Add hot water and 1 tbsp of baking soda.'
            },
            {
                '@type': 'HowToStep',
                name: 'Dip Jewelry',
                text: 'Dip silver jewelry for 5-10 minutes.'
            },
            {
                '@type': 'HowToStep',
                name: 'Rinse',
                text: 'Rinse and dry gently with a micro-fiber cloth.'
            }
        ]
    } : null

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary-foreground">
            <BlogReadingProgress />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            {howToLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
                />
            )}

            <main className="pt-32 pb-32">
                <article className="max-w-4xl mx-auto px-6">
                    {/* Contextual Back Navigation */}
                    <div className="mb-16 flex items-center justify-between">
                        <Link href="/blog" className="group inline-flex items-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground hover:text-primary transition-all duration-300">
                            <ArrowLeft className="w-3.5 h-3.5 mr-3 group-hover:-translate-x-1 transition-transform" />
                            Back to Journal
                        </Link>
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Immersive Detail Header */}
                    <header className="mb-16 space-y-8">
                        <div className="inline-flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em]">
                                {post.category}
                            </span>
                            <div className="w-12 h-px bg-primary/20" />
                        </div>

                        <h1 className="text-4xl md:text-7xl font-serif font-black italic tracking-tighter text-foreground leading-[1.1]">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-t border-border/50">
                            <span className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary/40" />
                                {new Date(post.published_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-3">
                                <User className="w-4 h-4 text-primary/40" />
                                <span className="text-foreground font-medium">By {post.author}</span>
                            </span>
                        </div>
                    </header>

                    {/* Cinematic Feature Image */}
                    {post.cover_image && (
                        <div className="relative aspect-video mb-20 overflow-hidden border border-border/50 rounded-sm shadow-2xl ring-1 ring-primary/5">
                            <Image
                                src={post.cover_image}
                                alt={post.title}
                                fill
                                className="object-cover scale-[1.02]"
                                priority
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    )}

                    {/* Premium Readability Content */}
                    <div className="relative max-w-3xl mx-auto">
                        <div className="prose prose-sm md:prose-base dark:prose-invert prose-neutral max-w-none mb-24 
                                       prose-headings:font-serif prose-headings:italic prose-headings:font-bold prose-headings:tracking-tighter
                                       prose-h2:text-3xl prose-h2:text-primary/90 prose-h2:mt-16 prose-h2:mb-8
                                       prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:mb-8 prose-p:font-light
                                       prose-strong:text-foreground prose-strong:font-bold
                                       prose-blockquote:border-l-primary prose-blockquote:bg-card/50 prose-blockquote:py-4 prose-blockquote:italic
                                       first-letter:text-6xl first-letter:font-serif first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-primary first-letter:leading-none">
                            {post.content.split('\n\n').map((para: string, i: number) => {
                                if (para.startsWith('## ')) {
                                    return <h2 key={i}>{para.replace('## ', '')}</h2>
                                }
                                return <p key={i}>{para}</p>
                            })}
                        </div>

                        {/* Semantic Footer Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-4 py-12 border-t border-border/50">
                                <Tag className="w-4 h-4 text-primary/30" />
                                <div className="flex flex-wrap gap-3">
                                    {post.tags.map((tag: string) => (
                                        <span key={tag} className="px-4 py-2 bg-card/50 border border-border text-[10px] uppercase tracking-widest text-muted-foreground rounded-sm hover:border-primary/40 transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>

                {/* Related Masterpieces Section */}
                {relatedPosts.length > 0 && (
                    <section className="bg-card/20 py-32 border-t border-border/50 mt-24">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-16 space-y-4">
                                <span className="text-primary text-[10px] uppercase tracking-[0.5em] font-bold">Suggestions</span>
                                <h2 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter text-foreground">CONTINUE <span className="text-primary">READING.</span></h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {relatedPosts.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={`/blog/${p.slug}`}
                                        className="group bg-background border border-border/50 hover:border-primary/30 transition-all duration-700 rounded-sm overflow-hidden"
                                    >
                                        <div className="relative aspect-video overflow-hidden border-b border-border/50">
                                            <Image
                                                src={p.cover_image || '/placeholder-blog.jpg'}
                                                alt={p.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                        </div>
                                        <div className="p-8">
                                            <span className="text-primary text-[9px] font-bold uppercase tracking-widest block mb-3 opacity-60">
                                                {p.category}
                                            </span>
                                            <h3 className="font-serif text-xl font-bold italic tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                {p.title}
                                            </h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
