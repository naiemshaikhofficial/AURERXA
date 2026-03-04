import React, { Suspense } from 'react'
import { getAdminAllProducts, checkAdminRole } from '../actions'
import { getCategories } from '@/app/actions'
import { ProductsClient } from './products-client'
import { ProductsSkeleton } from './products-skeleton'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage(props: { searchParams: Promise<{ search?: string, page?: string, categoryId?: string, minPrice?: string, maxPrice?: string, stockStatus?: string, dateFrom?: string, dateTo?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent searchParams={searchParams} />
        </Suspense>
    )
}

async function ProductsContent({ searchParams }: { searchParams: { search?: string, page?: string, categoryId?: string, minPrice?: string, maxPrice?: string, stockStatus?: string, dateFrom?: string, dateTo?: string } }) {
    const page = Number(searchParams.page) || 1
    const search = searchParams.search || ''
    const categoryId = searchParams.categoryId
    const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined
    const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined
    const stockStatus = searchParams.stockStatus as 'low' | 'out' | 'in' | undefined
    const dateFrom = searchParams.dateFrom
    const dateTo = searchParams.dateTo

    const [productsData, categories, admin] = await Promise.all([
        getAdminAllProducts(search, page, 20, categoryId, undefined, minPrice, maxPrice, stockStatus, dateFrom, dateTo),
        getCategories(),
        checkAdminRole()
    ])

    return (
        <ProductsClient
            initialProducts={productsData.products}
            total={productsData.total}
            initialCategories={categories}
            adminRole={admin?.role}
        />
    )
}
