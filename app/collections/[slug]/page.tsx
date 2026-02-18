import { CollectionsClient } from '../collections-client'
import { getFilteredProducts, getCategories } from '@/app/actions'
import { Navbar } from '@/components/navbar'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function DynamicCollectionsPage({ params }: PageProps) {
    const { slug } = await params
    const categories = await getCategories()

    // Check if the slug exists as a category
    const categoryMatch = categories?.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase())

    // Determine filters based on match
    const initialFilters = {
        category: categoryMatch ? categoryMatch.slug : 'all',
        tag: !categoryMatch ? slug : '', // If not a category, treat as a tag
        gender: 'all',
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
        tag: initialFilters.tag || undefined,
        gender: undefined,
        type: undefined,
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
