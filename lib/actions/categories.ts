'use server'

import { revalidateTag, unstable_cache } from 'next/cache'
import { supabaseServer, getAuthClient, checkIsAdmin } from './utils'
import { ActionResponse } from './types'
import { sanitizeObject } from '@/lib/sanitizer'

const _getCategories = unstable_cache(
    async () => {
        const { data, error } = await supabaseServer
            .from('categories')
            .select('id, name, slug, image_url, description')
            .order('name')

        if (error) {
            console.error('Error fetching categories:', error)
            return []
        }
        return data || []
    },
    ['categories'],
    { revalidate: 86400, tags: ['categories'] }
)

export async function getCategories() {
    return _getCategories()
}

export async function getSubCategories(categoryId?: string) {
    return unstable_cache(
        async () => {
            let query = supabaseServer
                .from('sub_categories')
                .select('id, name, slug, category_id, description, image_url')
                .order('name')

            if (categoryId) query = query.eq('category_id', categoryId)

            const { data, error } = await query
            if (error) {
                if (error.code === 'PGRST116' || (error.message && error.message.includes('relation "sub_categories" does not exist'))) {
                    return []
                }
                return []
            }
            return data || []
        },
        ['sub-categories', categoryId || 'all'],
        { revalidate: 86400, tags: ['sub-categories'] }
    )()
}

export async function addSubCategory(subCategoryData: { name: string, category_id: string, slug: string, description?: string }): Promise<ActionResponse> {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    const sanitizedData = sanitizeObject(subCategoryData)
    const client = await getAuthClient()

    const { data, error } = await client
        .from('sub_categories')
        .insert({
            ...sanitizedData,
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    revalidateTag('sub-categories', 'max')
    return { success: true, data }
}

export async function updateSubCategory(id: string, updates: any) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    const client = await getAuthClient()
    const { error } = await client
        .from('sub_categories')
        .update(updates)
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidateTag('sub-categories', 'max')
    return { success: true }
}

export async function deleteSubCategory(id: string) {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) return { success: false, error: 'Unauthorized' }

    const client = await getAuthClient()
    const { error } = await client
        .from('sub_categories')
        .delete()
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidateTag('sub-categories', 'max')
    return { success: true }
}
export async function getAllCategorySlugs() {
    const { data, error } = await supabaseServer
        .from('categories')
        .select('slug')
        .order('name')

    if (error) return []
    return data || []
}

