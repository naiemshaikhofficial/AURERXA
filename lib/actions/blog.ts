'use server'

import { supabaseServer } from './utils'
import { unstable_cache } from 'next/cache'

const _getBlogPosts = unstable_cache(
    async (category?: string) => {
        let query = supabaseServer
            .from('blog_posts')
            .select('*')
            .order('published_at', { ascending: false })

        if (category && category !== 'All') {
            query = query.eq('category', category)
        }

        const { data, error } = await query
        if (error) {
            console.error('Error fetching blog posts:', error)
            return []
        }
        return data || []
    },
    ['blog-posts'],
    { revalidate: 3600, tags: ['blog'] }
)

export async function getBlogPosts(category?: string) {
    return _getBlogPosts(category)
}

const _getBlogPostBySlug = unstable_cache(
    async (slug: string) => {
        const { data, error } = await supabaseServer
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single()

        if (error) return null
        return data
    },
    ['blog-post'],
    { revalidate: 3600, tags: ['blog'] }
)

export async function getBlogPostBySlug(slug: string) {
    return _getBlogPostBySlug(slug)
}

export async function getAllBlogSlugs() {
    const { data, error } = await supabaseServer
        .from('blog_posts')
        .select('slug, updated_at')

    if (error) return []
    return data || []
}
