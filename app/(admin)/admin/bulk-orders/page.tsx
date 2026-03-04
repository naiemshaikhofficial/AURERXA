import React, { Suspense } from 'react'
import { getAdminBulkOrders, checkAdminRole } from '../actions'
import { BulkOrdersClient } from './bulk-orders-client'

export const dynamic = 'force-dynamic'

export default async function BulkOrdersPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
        }>
            <BulkOrdersContent />
        </Suspense>
    )
}

async function BulkOrdersContent() {
    const [bulkData, admin] = await Promise.all([
        getAdminBulkOrders('all', 1),
        checkAdminRole()
    ])

    return (
        <BulkOrdersClient
            initialOrders={bulkData.orders}
            total={bulkData.total}
            adminRole={admin?.role || null}
        />
    )
}
