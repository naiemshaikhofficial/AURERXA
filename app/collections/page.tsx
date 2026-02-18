import { CollectionsClient } from './collections-client'
import { getFilteredProducts, getCategories } from '@/app/actions'
import { Navbar } from '@/components/navbar'

interface PageProps {
    searchParams: Promise<{
        category?: string
        tag?: string
        gender?: string
        type?: string
        minPrice?: string
        maxPrice?: string
        sortBy?: string
        search?: string
    }>
}

export default async function CollectionsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const categories = await getCategories()

    const initialFilters = {
        category: params.category || 'all',
        tag: params.tag || '',
        gender: params.gender || 'all',
        type: params.type || 'all',
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
        tag: initialFilters.tag || undefined,
        gender: initialFilters.gender === 'all' ? undefined : initialFilters.gender,
        type: initialFilters.type === 'all' ? undefined : initialFilters.type,
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
                initialFilters={initialFilters as any}
            />
        </main>
    )
}
