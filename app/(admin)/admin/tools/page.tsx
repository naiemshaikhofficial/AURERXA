import React, { Suspense } from 'react'
import { getSystemHealth, getDatabaseStats } from './actions'
import { ToolsClient } from './tools-client'

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-white/30">Loading System Tools...</div>}>
            <ToolsContent />
        </Suspense>
    )
}

async function ToolsContent() {
    const [health, stats] = await Promise.all([getSystemHealth(), getDatabaseStats()])
    return <ToolsClient initialHealth={health} initialStats={stats} />
}
