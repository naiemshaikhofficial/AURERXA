import React, { Suspense } from 'react'
import { getActivityLogs } from '../actions'
import { ActivityClient } from './activity-client'
import { ActivitySkeleton } from './activity-skeleton'

export const dynamic = 'force-dynamic'

export default async function ActivityPage(props: { searchParams: Promise<{ entity_type?: string, search?: string, dateFrom?: string, dateTo?: string, page?: string }> }) {
    const searchParams = await props.searchParams
    const page = Number(searchParams.page) || 1
    const { entity_type, search, dateFrom, dateTo } = searchParams

    const result = await getActivityLogs(page, entity_type === 'all' ? undefined : entity_type, search, dateFrom, dateTo)

    return (
        <Suspense fallback={<ActivitySkeleton />}>
            <ActivityClient initialLogs={result.logs as any[]} total={result.total} />
        </Suspense>
    )
}
