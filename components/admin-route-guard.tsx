'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')

    if (isAdmin) return null
    return <>{children}</>
}

export function AdminOnlyWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith('/admin')

    if (!isAdmin) return null
    return <>{children}</>
}
