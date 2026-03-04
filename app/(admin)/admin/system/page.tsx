import React, { Suspense } from 'react'
import { getErrorLogs, checkAdminRole } from '../actions'
import { SystemClient } from './system-client'
import { redirect } from 'next/navigation'

export default async function AdminSystemPage() {
    const admin = await checkAdminRole()
    if (!admin || admin.role !== 'main_admin') {
        redirect('/admin')
    }

    const logs = await getErrorLogs(100)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Health</h1>
                <p className="text-white/40 text-sm mt-1">Monitor application errors and production stability logs.</p>
            </div>

            <Suspense fallback={<div className="h-64 flex items-center justify-center bg-[#111111] rounded-2xl border border-white/5 animate-pulse">
                <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>}>
                <SystemClient initialLogs={logs} />
            </Suspense>
        </div>
    )
}
