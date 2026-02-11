import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import supabaseLoader from '@/lib/supabase-loader'
import { getBlogPost, getBlogPosts } from '@/app/actions'
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getBlogPost(slug)
    if (!post) return { title: 'Post Not Found' }
    return {
        title: `${post.title} | AURERXA Blog`,
        description: post.excerpt
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await getBlogPost(slug)

    if (!post) {
        notFound()
    }

    const relatedPosts = (await getBlogPosts(post.category)).filter(p => p.id !== post.id).slice(0, 3)

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />

            <main className="pt-24 pb-24">
                <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link href="/blog" className="inline-flex items-center text-white/50 hover:text-amber-400 mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <header className="mb-8">
                        <span className="inline-block px-3 py-1 bg-amber-500 text-neutral-950 text-xs font-bold uppercase mb-4">
                            {post.category}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{post.title}</h1>

                        <div className="flex items-center gap-6 text-sm text-white/50">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.published_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {post.author}
                            </span>
                        </div>
                    </header>

                    {/* Cover Image */}
                    {post.cover_image && (
                        <div className="relative aspect-video mb-12 overflow-hidden">
                            <Image
                                src={post.cover_image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                loader={supabaseLoader}
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-invert prose-amber max-w-none mb-12">
                        {post.content.split('\n\n').map((para: string, i: number) => {
                            if (para.startsWith('## ')) {
                                return <h2 key={i} className="text-xl font-serif font-medium text-amber-400 mt-8 mb-4">{para.replace('## ', '')}</h2>
                            }
                            return <p key={i} className="text-white/70 leading-relaxed mb-4">{para}</p>
                        })}
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-12 pt-8 border-t border-neutral-800">
                            <Tag className="w-4 h-4 text-white/40" />
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-neutral-900 border border-neutral-700 text-sm text-white/60">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
                        <h2 className="text-2xl font-serif font-bold mb-8 text-center">Related Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/blog/${p.slug}`}
                                    className="bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 transition-all group"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        <Image
                                            src={p.cover_image || '/placeholder-blog.jpg'}
                                            alt={p.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-serif font-medium group-hover:text-amber-400 transition-colors line-clamp-2">
                                            {p.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    )
}
