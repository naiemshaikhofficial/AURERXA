import React, { Suspense } from 'react'
import { getAdminAllUsers, checkAdminRole } from '../actions'
import { UsersClient } from './users-client'
import { UsersSkeleton } from './users-skeleton'

export const dynamic = 'force-dynamic'

export default async function UsersPage(props: { searchParams: Promise<{ search?: string, page?: string }> }) {
    const searchParams = await props.searchParams
    return (
        <Suspense fallback={<UsersSkeleton />}>
            <UsersContent searchParams={searchParams} />
        </Suspense>
    )
}

async function UsersContent({ searchParams }: { searchParams: { search?: string, page?: string } }) {
    const page = Number(searchParams.page) || 1
    const search = searchParams.search || ''

    const [usersData, admin] = await Promise.all([
        getAdminAllUsers(search, page),
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
