import Link from 'next/link'
import { SupabaseImage as Image } from '@/components/supabase-image'
import { Calendar, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface BlogCardProps {
    post: any
    index: number
}

export function BlogCard({ post, index }: BlogCardProps) {
    return (
        <article className="group flex flex-col h-full bg-card/30 border border-border/50 hover:border-primary/30 transition-all duration-500 rounded-sm overflow-hidden backdrop-blur-sm">
            <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                    src={post.cover_image || '/placeholder-blog.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-background/80 backdrop-blur-md border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest">
                        {post.category}
                    </span>
                </div>
            </Link>

            <div className="p-8 flex flex-col flex-1">
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

                <p className="text-muted-foreground text-sm mb-8 line-clamp-2 font-light leading-relaxed">
                    {post.excerpt}
                </p>

                <Link
                    href={`/blog/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-2 group/btn"
                >
                    <span className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold border-b border-primary/10 pb-1 group-hover/btn:border-primary transition-all">
                        Explore Article
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </article>
    )
}
