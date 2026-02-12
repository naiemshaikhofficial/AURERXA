import React, { Suspense } from 'react'
import { getAdminOrders, checkAdminRole } from '../actions'
import { OrdersClient } from './orders-client'
import { OrdersSkeleton } from './orders-skeleton'

export const dynamic = 'force-dynamic'

export default async function OrdersPage(props: { searchParams: Promise<{ status?: string, page?: string, search?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <Suspense fallback={<OrdersSkeleton />}>
            <OrdersContent searchParams={searchParams} />
        </Suspense>
    )
}

async function OrdersContent({ searchParams }: { searchParams: { status?: string, page?: string, search?: string } }) {
    const page = Number(searchParams.page) || 1
    const status = searchParams.status || 'all'
    const search = searchParams.search || ''

    // Parallel fetch
    const [ordersData, admin] = await Promise.all([
        getAdminOrders(status, undefined, undefined, search, page),
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
