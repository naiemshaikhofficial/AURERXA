import React, { Suspense } from 'react'
import { getAdminOrders, checkAdminRole } from '../actions'
import { OrdersClient } from './orders-client'
import { OrdersSkeleton } from './orders-skeleton'

export const dynamic = 'force-dynamic'

export default async function OrdersPage(props: { searchParams: Promise<{ status?: string, page?: string, search?: string, dateFrom?: string, dateTo?: string, minTotal?: string, maxTotal?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <Suspense fallback={<OrdersSkeleton />}>
            <OrdersContent searchParams={searchParams} />
        </Suspense>
    )
}

async function OrdersContent({ searchParams }: { searchParams: { status?: string, page?: string, search?: string, dateFrom?: string, dateTo?: string, minTotal?: string, maxTotal?: string } }) {
    const page = Number(searchParams.page) || 1
    const status = searchParams.status || 'all'
    const search = searchParams.search || ''
    const dateFrom = searchParams.dateFrom
    const dateTo = searchParams.dateTo
    const minTotal = searchParams.minTotal ? Number(searchParams.minTotal) : undefined
    const maxTotal = searchParams.maxTotal ? Number(searchParams.maxTotal) : undefined

    // Parallel fetch
    const [ordersData, admin] = await Promise.all([
        getAdminOrders(status, dateFrom, dateTo, search, page, 20, minTotal, maxTotal),
        checkAdminRole()
    ])

    return (
        <OrdersClient
            initialOrders={ordersData.orders}
            total={ordersData.total}
            adminRole={admin?.role || null}
        />
    )
}
