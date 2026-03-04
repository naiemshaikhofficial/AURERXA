import { CollectionsClient } from '../collections-client'
import { getFilteredProducts, getCategories, getSubCategories, getUsedTags } from '@/app/actions'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateStaticParams() {
    const categories = await getCategories()
    return categories.map((cat: any) => ({
        slug: cat.slug,
    }))
}

export default async function DynamicCollectionsPage({ params }: PageProps) {
    const { slug } = await params

    // 1. Fetch all reference data in parallel for speed
    const [categories, subCategories, tags] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getUsedTags()
    ])

    // Check if the slug exists as a category, sub-category, gender, or tag (fully dynamic)
    const categoryMatch = categories?.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase())
    const subCategoryMatch = !categoryMatch ? subCategories?.find((s: any) => s.slug.toLowerCase() === slug.toLowerCase()) : null

    // Gender match
    const genderMatch = (!categoryMatch && !subCategoryMatch) ? ['men', 'women', 'unisex'].find(g => g === slug.toLowerCase()) : null

    // Material match
    const materials = ['real_gold', 'gold_plated', 'bentex', 'silver', 'diamond']
    const materialMatch = (!categoryMatch && !subCategoryMatch && !genderMatch)
        ? materials.find(m => m === slug.toLowerCase() || m.replace('_', '-') === slug.toLowerCase())
        : null

    // Purity match (e.g. 999-silver, 925-silver)
    const purityPatterns = ['999', '925', '24k', '22k', '18k']
    const purityMatch = (!categoryMatch && !subCategoryMatch && !genderMatch && !materialMatch)
        ? purityPatterns.find(p => slug.toLowerCase().startsWith(p))
        : null

    // Dynamic Tag/Occasion match — check if slug (or dehyphenated version) exists in any product's tags
    let tagMatch: string | null = null
    if (!categoryMatch && !subCategoryMatch && !genderMatch && !materialMatch && !purityMatch) {
        const slugLower = slug.toLowerCase()
        const dehyphenated = slugLower.replace(/-/g, ' ')
        // Check against all used tags in the system
        const matchedTag = tags?.find((t: string) => {
            const tLower = t.toLowerCase()
            return tLower === slugLower || tLower === dehyphenated || tLower.replace(/ /g, '-') === slugLower
        })
        if (matchedTag) {
            tagMatch = matchedTag // Use the actual tag casing from the DB
        } else {
            tagMatch = slugLower
        }
    }

    // Determine filters based on match
    const initialFilters = {
        category: categoryMatch ? categoryMatch.slug : 'all',
        sub_category: subCategoryMatch ? subCategoryMatch.slug : 'all',
        gender: genderMatch || 'all',
        occasion: tagMatch || 'all',
        material: materialMatch || 'all',
        purity: purityMatch || 'all',
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
        material_type: initialFilters.material === 'all' ? undefined : initialFilters.material,
        purity: initialFilters.purity === 'all' ? undefined : initialFilters.purity,
        occasion: initialFilters.occasion === 'all' ? undefined : initialFilters.occasion,
        tag: initialFilters.tag || undefined,
        sortBy: initialFilters.sortBy,
        minPrice: initialFilters.priceRange.min,
        maxPrice: undefined
    })

    return (
        <main>
            <CollectionsClient
                initialProducts={products as any}
                categories={subCategories as any}
                tags={tags}
                initialFilters={initialFilters as any}
            />
        </main>
    )
}
