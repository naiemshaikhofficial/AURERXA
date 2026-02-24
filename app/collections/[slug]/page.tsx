import { CollectionsClient } from '../collections-client'
import { getFilteredProducts, getCategories, getSubCategories, getUsedTags } from '@/app/actions'
import { Navbar } from '@/components/navbar'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function DynamicCollectionsPage({ params }: PageProps) {
    const { slug } = await params
    const categories = await getCategories()
    const subCategories = await getSubCategories()
    const tags = await getUsedTags()

    // Check if the slug exists as a category, sub-category, gender, or tag (fully dynamic)
    const categoryMatch = categories?.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase())
    const subCategoryMatch = !categoryMatch ? subCategories?.find((s: any) => s.slug.toLowerCase() === slug.toLowerCase()) : null

    // Gender match
    const genderMatch = (!categoryMatch && !subCategoryMatch) ? ['men', 'women', 'unisex'].find(g => g === slug.toLowerCase()) : null

    // Dynamic Tag/Occasion match — check if slug (or dehyphenated version) exists in any product's tags
    // This replaces the old hardcoded list, so ANY tag now works as a URL slug
    let tagMatch: string | null = null
    if (!categoryMatch && !subCategoryMatch && !genderMatch) {
        const slugLower = slug.toLowerCase()
        const dehyphenated = slugLower.replace(/-/g, ' ')
        // Check against all used tags in the system (case-insensitive, supports hyphens)
        const matchedTag = tags?.find((t: string) => {
            const tLower = t.toLowerCase()
            return tLower === slugLower || tLower === dehyphenated || tLower.replace(/ /g, '-') === slugLower
        })
        if (matchedTag) {
            tagMatch = slugLower
        } else {
            // Even if not found in used tags, still try — the occasion filter in actions.ts
            // will do fuzzy matching against name/description as fallback
            tagMatch = slugLower
        }
    }

    // Determine filters based on match
    const initialFilters = {
        category: categoryMatch ? categoryMatch.slug : 'all',
        sub_category: subCategoryMatch ? subCategoryMatch.slug : 'all',
        gender: genderMatch || 'all',
        occasion: tagMatch || 'all',
        tag: '',
        type: 'all',
        sortBy: 'newest',
        search: '',
        priceRange: {
            label: 'All Prices',
            min: 0,
            max: null
        }
    }

    const products = await getFilteredProducts({
        category: initialFilters.category === 'all' ? undefined : initialFilters.category,
        sub_category: initialFilters.sub_category === 'all' ? undefined : initialFilters.sub_category,
        gender: initialFilters.gender === 'all' ? undefined : initialFilters.gender,
        occasion: initialFilters.occasion === 'all' ? undefined : initialFilters.occasion,
        tag: initialFilters.tag || undefined,
        sortBy: initialFilters.sortBy,
        minPrice: initialFilters.priceRange.min,
        maxPrice: undefined
    })

    return (
        <main>
            <Navbar />
            <CollectionsClient
                initialProducts={products as any}
                categories={subCategories as any}
                tags={tags}
                initialFilters={initialFilters as any}
            />
        </main>
    )
}
