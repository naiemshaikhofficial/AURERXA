import React, { Suspense } from 'react'
import { getAdminGoldRates, getAdminCoupons, getAdminList, checkAdminRole, getAdminSiteSetting } from '../actions'
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
    const [rates, coupons, admins, role, shippingConfig] = await Promise.all([
        getAdminGoldRates(),
        getAdminCoupons(),
        getAdminList(),
        checkAdminRole(),
        getAdminSiteSetting('shipping_config', {
            free_shipping_threshold: 50000,
            default_shipping_fee: 90,
            is_enabled: true
        })
    ])

    return (
        <SettingsClient
            initialRates={rates}
            initialCoupons={coupons}
            initialAdmins={admins}
            currentRole={role?.role || ''}
            initialShippingConfig={shippingConfig}
        />
    )
}
