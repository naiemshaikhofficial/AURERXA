import React from 'react'
import { AdminOnlyWrapper } from '@/components/admin-route-guard'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminOnlyWrapper>
            <div className="min-h-screen bg-background">
                {children}
            </div>
        </AdminOnlyWrapper>
    )
}
