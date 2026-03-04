import { getGlobalConfig } from '@/app/actions'
import { PricingSettingsClient } from './pricing-client'

export default async function PricingSettingsPage() {
    const config = await getGlobalConfig()
    return <PricingSettingsClient config={config} />
}
