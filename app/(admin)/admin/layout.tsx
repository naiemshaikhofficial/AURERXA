import React from 'react'
import { redirect } from 'next/navigation'
import { checkAdminRole } from './actions'
import { AdminSidebar } from './admin-sidebar'

// Force all admin routes to be dynamic (they all use cookies via checkAdminRole)
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const admin = await checkAdminRole()

    if (!admin) {
        redirect('/')
    }

    // Pass admin data to client sidebar
    return (
        <AdminSidebar admin={admin}>
            {children}
        </AdminSidebar>
    )
}
