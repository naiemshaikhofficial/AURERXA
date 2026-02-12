import React, { Suspense } from 'react'
import { getAdminGoldRates, getAdminCoupons, getAdminList, checkAdminRole } from '../actions'
import { SettingsClient } from './settings-client'
import { SettingsSkeleton } from './settings-skeleton'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <SettingsContent />
        </Suspense>
    )
}

async function SettingsContent() {
    const [rates, coupons, admins, role] = await Promise.all([
        getAdminGoldRates(),
        getAdminCoupons(),
        getAdminList(),
        checkAdminRole()
    ])

    return (
        <SettingsClient
            initialRates={rates}
            initialCoupons={coupons}
            initialAdmins={admins}
            currentRole={role?.role || ''}
        />
    )
}
