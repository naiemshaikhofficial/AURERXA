import React, { Suspense } from 'react'
import { getAdminAllUsers, checkAdminRole } from '../actions'
import { UsersClient } from './users-client'
import { UsersSkeleton } from './users-skeleton'

export const dynamic = 'force-dynamic'

export default async function UsersPage(props: { searchParams: Promise<{ search?: string, page?: string, role?: string, banned?: string, dateFrom?: string, dateTo?: string, minSpent?: string, maxSpent?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <Suspense fallback={<UsersSkeleton />}>
            <UsersContent searchParams={searchParams} />
        </Suspense>
    )
}

async function UsersContent({ searchParams }: { searchParams: { search?: string, page?: string, role?: string, banned?: string, dateFrom?: string, dateTo?: string, minSpent?: string, maxSpent?: string } }) {
    const page = Number(searchParams.page) || 1
    const search = searchParams.search || ''
    const role = searchParams.role
    const isBanned = searchParams.banned === 'true' ? true : searchParams.banned === 'false' ? false : undefined
    const dateFrom = searchParams.dateFrom
    const dateTo = searchParams.dateTo
    const minSpent = searchParams.minSpent ? Number(searchParams.minSpent) : undefined
    const maxSpent = searchParams.maxSpent ? Number(searchParams.maxSpent) : undefined

    const [usersData, admin] = await Promise.all([
        getAdminAllUsers(search, page, 20, role, isBanned, dateFrom, dateTo, minSpent, maxSpent),
        checkAdminRole()
    ])

    return (
        <UsersClient
            initialUsers={usersData.users}
            total={usersData.total}
            adminRole={admin?.role || null}
        />
    )
}
