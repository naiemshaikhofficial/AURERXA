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
    const [rates, coupons, admins, role, shippingConfig, maintenanceConfig, contactConfig, marketingConfig] = await Promise.all([
        getAdminGoldRates(),
        getAdminCoupons(),
        getAdminList(),
        checkAdminRole(),
        getAdminSiteSetting('shipping_config', {
            free_shipping_threshold: 50000,
            default_shipping_fee: 90,
            is_enabled: true
        }),
        getAdminSiteSetting('maintenance_config', {
            is_enabled: false,
            message: "AURERXA is upgrading to serve you better. We will be back shortly with a more premium experience."
        }),
        getAdminSiteSetting('contact_config', {
            phone: "+91 9391032677",
            email: "support@aurerxa.com",
            whatsapp: "+91 9391032677",
            address: "Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605"
        }),
        getAdminSiteSetting('marketing_config', {
            banner_enabled: false,
            banner_text: "Special Edition Heritage Collection - Now Live",
            banner_link: "/collections"
        })
    ])

    return (
        <SettingsClient
            initialRates={rates}
            initialCoupons={coupons}
            initialAdmins={admins}
            currentRole={role?.role || ''}
            initialShippingConfig={shippingConfig}
            initialMaintenanceConfig={maintenanceConfig}
            initialContactConfig={contactConfig}
            initialMarketingConfig={marketingConfig}
        />
    )
}
