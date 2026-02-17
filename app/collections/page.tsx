import { CollectionsClient } from './collections-client'
import { getProducts, getCategories } from '@/app/actions'
import { Navbar } from '@/components/navbar'

export default async function CollectionsPage() {
    const products = await getProducts()
    const categories = await getCategories()

    return (
        <main>
            <Navbar />
            <CollectionsClient
                initialProducts={products}
                categories={categories}
                initialFilters={{
                    sortBy: 'newest',
                    category: 'all',
                    gender: 'all',
                    type: 'all',
                    priceRange: { min: 0, max: 1000000 }
                }}
            />
        </main>
    )
}
