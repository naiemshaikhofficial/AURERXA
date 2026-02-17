import React, { Suspense } from 'react'
import { getDashboardStats, getRevenueChart, getOrdersChart, getRecentOrders, getTopProducts, getActivityLogs, getCancelledOrderDetails, checkAdminRole, getAnalyticsSummary, getFlaggedNotes } from './actions'
import { DashboardClient } from './dashboard-client'
import { DashboardSkeleton } from './dashboard-skeleton'

export default async function AdminDashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    )
}

async function DashboardContent() {
    // 1. Calculate default date range (Month) on server
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

    // 2. Fetch all data in parallel on SERVER
    // 2. Check Role FIRST to determine data visibility
    const admin = await checkAdminRole()
    const isRevenueVisible = admin?.role === 'main_admin' // Only Main Admin sees revenue

    // 3. Fetch data in parallel on SERVER (Revenue dependent on role)
    const [
        stats,
        revenueData,
        ordersData,
        recentOrders,
        topProducts,
        activity,
        cancelledDetails,
        analytics,
        flaggedNotes
    ] = await Promise.all([
        getDashboardStats(from, to),
        isRevenueVisible ? getRevenueChart('monthly') : Promise.resolve([]), // Hide if not privileged
        getOrdersChart('monthly'),
        getRecentOrders(),
        getTopProducts(),
        getActivityLogs(1, 'all', '', '', ''),
        getCancelledOrderDetails(),
        isRevenueVisible ? getAnalyticsSummary(from, to) : Promise.resolve(null), // Hide detailed analytics
        getFlaggedNotes()
    ])

    // 3. Render Client Component with initial data
    return (
        <DashboardClient
            initialStats={stats}
            initialRevenue={revenueData || []}
            initialOrders={ordersData || []}
            initialRecent={recentOrders as any[]}
            initialTopProducts={topProducts as any[]}
            initialActivity={(activity as any)?.logs || []}
            initialCancelled={cancelledDetails as any[]}
            adminRole={admin?.role || ''}
            initialAnalytics={analytics}
            initialFlaggedNotes={flaggedNotes as any[]}
        />
    )
}
