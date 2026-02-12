import React from 'react'
import { redirect } from 'next/navigation'
import { checkAdminRole } from './actions'
import { AdminSidebar } from './admin-sidebar'

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
