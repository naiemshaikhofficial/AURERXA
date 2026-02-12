import React, { Suspense } from 'react'
import { getAdminProducts } from '@/app/actions'
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
    const products = await getAdminProducts()
    return <ProductsClient initialProducts={products} />
}
