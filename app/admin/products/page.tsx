import React, { Suspense } from 'react'
import { getAdminProducts, getCategories } from '@/app/actions'
import { checkAdminRole } from '../actions'
import { ProductsClient } from './products-client'
import { ProductsSkeleton } from './products-skeleton'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
    return (
        <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent />
        </Suspense>
    )
}

async function ProductsContent() {
    const [products, categories, admin] = await Promise.all([
        getAdminProducts(),
        getCategories(),
        checkAdminRole()
    ])
    return <ProductsClient initialProducts={products} initialCategories={categories} adminRole={admin?.role} />
}
