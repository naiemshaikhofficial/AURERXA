import { CollectionsClient } from './collections-client'
import { getFilteredProducts, getCategories, getUsedTags } from '@/app/actions'
import { Navbar } from '@/components/navbar'

interface PageProps {
    searchParams: Promise<{
        category?: string
        sub_category?: string
        tag?: string
        occasion?: string
        gender?: string
        type?: string
        material_type?: string
        minPrice?: string
        maxPrice?: string
        sortBy?: string
        search?: string
    }>
}

export default async function CollectionsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const categories = await getCategories()
    const tags = await getUsedTags()

    const initialFilters = {
        category: params.category || 'all',
        sub_category: params.sub_category || 'all',
        tag: params.tag || '',
        occasion: params.occasion || 'all',
        gender: params.gender || 'all',
        type: params.type || 'all',
        material_type: params.material_type || 'all',
        sortBy: params.sortBy || 'newest',
        search: params.search || '',
        priceRange: {
            label: 'All Prices',
            min: Number(params.minPrice) || 0,
            max: params.maxPrice ? Number(params.maxPrice) : null
        }
    }

    const products = await getFilteredProducts({
        category: initialFilters.category === 'all' ? undefined : initialFilters.category,
        sub_category: initialFilters.sub_category === 'all' ? undefined : initialFilters.sub_category,
        tag: initialFilters.tag || undefined,
        occasion: initialFilters.occasion === 'all' ? undefined : initialFilters.occasion,
        gender: initialFilters.gender === 'all' ? undefined : initialFilters.gender,
        type: initialFilters.type === 'all' ? undefined : initialFilters.type,
        material_type: initialFilters.material_type === 'all' ? undefined : initialFilters.material_type,
        sortBy: initialFilters.sortBy,
        search: initialFilters.search || undefined,
        minPrice: initialFilters.priceRange.min,
        maxPrice: initialFilters.priceRange.max || undefined
    })

    return (
        <main>
            <Navbar />
            <CollectionsClient
                initialProducts={products as any}
                categories={categories}
                tags={tags}
                initialFilters={initialFilters as any}
            />
        </main>
    )
}
