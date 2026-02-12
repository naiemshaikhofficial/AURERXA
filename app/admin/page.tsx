import React from 'react'
import { getDashboardStats, getRevenueChart, getOrdersChart, getRecentOrders, getTopProducts, getActivityLogs, getCancelledOrderDetails, checkAdminRole, getAnalyticsSummary } from './actions'
import { DashboardClient } from './dashboard-client'

export default async function AdminDashboardPage() {
    // 1. Calculate default date range (Month) on server
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

    // 2. Fetch all data in parallel on SERVER
    const [
        stats,
        revenueData,
        ordersData,
        recentOrders,
        topProducts,
        activity,
        cancelledDetails,
        admin,
        analytics
    ] = await Promise.all([
        getDashboardStats(from, to),
        getRevenueChart('monthly'),
        getOrdersChart('monthly'),
        getRecentOrders(),
        getTopProducts(),
        getActivityLogs(1, 'all', '', '', ''),
        getCancelledOrderDetails(),
        checkAdminRole(),
        getAnalyticsSummary(from, to)
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
        />
    )
}
