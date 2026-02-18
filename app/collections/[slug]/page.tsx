import { CollectionsClient } from '../collections-client'
import { getFilteredProducts, getCategories, getSubCategories } from '@/app/actions'
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

    // Check if the slug exists as a category, sub-category, gender, or occasion
    const categoryMatch = categories?.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase())
    const subCategoryMatch = !categoryMatch ? subCategories?.find((s: any) => s.slug.toLowerCase() === slug.toLowerCase()) : null

    // Gender match
    const genderMatch = (!categoryMatch && !subCategoryMatch) ? ['men', 'women', 'unisex'].find(g => g === slug.toLowerCase()) : null

    // Occasion match (Common ones, or we could fetch from tags, but let's keep it simple for now as per occasion-browsing slugs)
    const occasionMatch = (!categoryMatch && !subCategoryMatch && !genderMatch) ? ['wedding', 'daily', 'gift', 'bridal', 'soulmate'].find(o => o === slug.toLowerCase()) : null

    // Determine filters based on match
    const initialFilters = {
        category: categoryMatch ? categoryMatch.slug : 'all',
        sub_category: subCategoryMatch ? subCategoryMatch.slug : 'all',
        gender: genderMatch || 'all',
        occasion: occasionMatch || 'all',
        tag: (!categoryMatch && !subCategoryMatch && !genderMatch && !occasionMatch) ? slug : '', // fallback to tag
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
                categories={categories}
                initialFilters={initialFilters as any}
            />
        </main>
    )
}
