'use client'

import { useState } from 'react'
import { updateGlobalConfig } from '@/app/actions'
import type { GlobalConfig } from '@/app/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Save, Settings, TrendingUp, Package, Percent, Hammer } from 'lucide-react'

interface PricingSettingsClientProps {
    config: GlobalConfig
}

type ConfigKey = keyof GlobalConfig

const configMeta: Record<ConfigKey, { label: string; description: string; icon: React.ReactNode; unit: string }> = {
    packaging_cost: {
        label: 'Packaging Cost',
        description: 'Default packaging cost added to every order',
        icon: <Package className="w-4 h-4" />,
        unit: '₹',
    },
    platform_fee_pct: {
        label: 'Platform Fee',
        description: 'Fee percentage applied on base cost',
        icon: <Percent className="w-4 h-4" />,
        unit: '%',
    },
    margin_percent: {
        label: 'Default Profit Margin',
        description: 'Margin % added on top of all costs',
        icon: <TrendingUp className="w-4 h-4" />,
        unit: '%',
    },
    making_plain_pct: {
        label: 'Making Charge – Plain',
        description: 'Making charge % for plain/simple jewellery',
        icon: <Hammer className="w-4 h-4" />,
        unit: '%',
    },
    making_designer_pct: {
        label: 'Making Charge – Designer',
        description: 'Making charge % for designer pieces',
        icon: <Hammer className="w-4 h-4" />,
        unit: '%',
    },
    making_handcrafted_pct: {
        label: 'Making Charge – Handcrafted',
        description: 'Making charge % for handcrafted premium pieces',
        icon: <Hammer className="w-4 h-4" />,
        unit: '%',
    },
    ring_base_price_size16: {
        label: 'Ring Anchor Price (Size 16)',
        description: 'Fixed price for size 16 rings. Other sizes scale from this.',
        icon: <Settings className="w-4 h-4" />,
        unit: '₹',
    },
    tax_percent: {
        label: 'GST / Tax Percentage',
        description: 'Standard GST applied to the final price',
        icon: <Percent className="w-4 h-4" />,
        unit: '%',
    },
    shipping_cost: {
        label: 'Base Shipping Cost',
        description: 'Fixed shipping charge (if any)',
        icon: <Package className="w-4 h-4" />,
        unit: '₹',
    },
}

export function PricingSettingsClient({ config }: PricingSettingsClientProps) {
    const [values, setValues] = useState<GlobalConfig>({ ...config })
    const [saving, setSaving] = useState<string | null>(null)
    const [saved, setSaved] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async (key: ConfigKey) => {
        setSaving(key)
        setError(null)
        const result = await updateGlobalConfig(key, values[key])
        setSaving(null)
        if (result.success) {
            setSaved(key)
            setTimeout(() => setSaved(null), 2000)
        } else {
            setError(result.error || 'Failed to save')
        }
    }

    const makingGroup = ['making_plain_pct', 'making_designer_pct', 'making_handcrafted_pct'] as ConfigKey[]
    const feeGroup = ['packaging_cost', 'platform_fee_pct', 'margin_percent'] as ConfigKey[]
    const anchorGroup = ['ring_base_price_size16', 'tax_percent', 'shipping_cost'] as ConfigKey[]

    const renderCard = (key: ConfigKey) => {
        const meta = configMeta[key]
        const isSaving = saving === key
        const isSaved = saved === key
        return (
            <div key={key} className="bg-[#111111] border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:border-[#D4AF37]/20 transition">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
                        {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{meta.label}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{meta.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{meta.unit}</span>
                        <Input
                            type="number"
                            value={values[key]}
                            onChange={(e) => setValues({ ...values, [key]: parseFloat(e.target.value) || 0 })}
                            className="bg-white/5 border-white/10 rounded-xl pl-7 text-sm"
                            step={meta.unit === '%' ? 0.5 : 10}
                        />
                    </div>
                    <Button
                        onClick={() => handleSave(key)}
                        disabled={!!isSaving}
                        className={`h-10 px-4 rounded-xl text-xs font-bold transition-all ${isSaved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#D4AF37] text-black hover:bg-[#D4AF37]/80'
                            }`}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? '✓ Saved' : <><Save className="w-3 h-3 mr-1.5" />Save</>}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pricing Configuration</h1>
                <p className="text-white/40 text-sm mt-1">Global defaults for the dynamic pricing engine — override per product if needed.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Section: Fees & Margin */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Fees & Margin</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feeGroup.map(renderCard)}
                </div>
            </div>

            {/* Section: Making Charges */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Making Charges</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {makingGroup.map(renderCard)}
                </div>
            </div>

            {/* Section: Anchors */}
            <div className="space-y-3">
                <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Price Anchors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {anchorGroup.map(renderCard)}
                </div>
            </div>

            {/* Formula Preview */}
            <div className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-3">
                <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest">Price Formula Reference</h2>
                <div className="font-mono text-xs space-y-1 text-white/50">
                    <p><span className="text-[#D4AF37]">metal_cost</span> = weight × silver_rate × purity_factor</p>
                    <p><span className="text-[#D4AF37]">making_cost</span> = metal_cost × making_%</p>
                    <p><span className="text-[#D4AF37]">base_cost</span> = metal_cost + making_cost + packaging_cost</p>
                    <p><span className="text-[#D4AF37]">with_fee</span> = base_cost × (1 + platform_fee_% / 100)</p>
                    <p><span className="text-[#D4AF37]">with_margin</span> = with_fee × (1 + margin_% / 100)</p>
                    <p><span className="text-[#D4AF37]">final_price</span> = floor(with_margin / 100) × 100 + 99</p>
                </div>
                <p className="text-[11px] text-white/20 pt-2">Size 16 rings are always anchored to ₹{values.ring_base_price_size16?.toLocaleString('en-IN')} regardless of formula output.</p>
            </div>
        </div>
    )
}
