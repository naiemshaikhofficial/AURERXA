import React, { Suspense } from 'react'
import { getAdminTickets, getAdminRepairs, getAdminContactMessages, getAdminCustomOrders } from '../actions'
import { SupportClient } from './support-client'
import { SupportSkeleton } from './support-skeleton'

export const dynamic = 'force-dynamic'

export default async function SupportPage(props: { searchParams: Promise<{ tab?: string, search?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <Suspense fallback={<SupportSkeleton />}>
            <SupportContent searchParams={searchParams} />
        </Suspense>
    )
}

async function SupportContent({ searchParams }: { searchParams: { tab?: string, search?: string } }) {
    const tab = searchParams.tab || 'tickets'
    const search = searchParams.search || ''

    let items: any[] = []

    if (tab === 'tickets') {
        const r = await getAdminTickets()
        items = r.tickets
    } else if (tab === 'repairs') {
        const r = await getAdminRepairs()
        items = r.repairs
    } else if (tab === 'contacts') {
        const r = await getAdminContactMessages()
        items = r.messages
    } else {
        const r = await getAdminCustomOrders()
        items = r.orders
    }

    if (search) {
        items = items.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()))
    }

    return <SupportClient initialItems={items} tab={tab} search={search} />
}
