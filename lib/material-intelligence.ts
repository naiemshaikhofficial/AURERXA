/**
 * Global Utility for Material Intelligence (Purity & Weight)
 * Maps database values to global craftsmanship standards.
 */

export const PURITY_MAPPING: Record<string, { label: string; subLabel: string; type: 'Gold' | 'Silver' | 'Platinum' | 'General' }> = {
    // Gold Standards
    '24': { label: '24K Fine Gold', subLabel: '99.9% Pure', type: 'Gold' },
    '24K': { label: '24K Fine Gold', subLabel: '99.9% Pure', type: 'Gold' },
    '999': { label: '24K Fine Gold', subLabel: '99.9% Pure', type: 'Gold' },
    '22': { label: '22K Gold Purity', subLabel: 'BIS 916 Standard', type: 'Gold' },
    '22K': { label: '22K Gold Purity', subLabel: 'BIS 916 Standard', type: 'Gold' },
    '916': { label: '22K Gold Purity', subLabel: 'BIS 916 Standard', type: 'Gold' },
    '18': { label: '18K Gold Purity', subLabel: '75.0% Fine Gold', type: 'Gold' },
    '18K': { label: '18K Gold Purity', subLabel: '75.0% Fine Gold', type: 'Gold' },
    '750': { label: '18K Gold Purity', subLabel: '75.0% Fine Gold', type: 'Gold' },
    '14': { label: '14K Gold Purity', subLabel: '58.5% Fine Gold', type: 'Gold' },
    '14K': { label: '14K Gold Purity', subLabel: '58.5% Fine Gold', type: 'Gold' },
    '585': { label: '14K Gold Purity', subLabel: '58.5% Fine Gold', type: 'Gold' },

    // Silver Standards
    '92.5': { label: '925 Sterling Silver', subLabel: 'Premium Quality', type: 'Silver' },
    '92.5%': { label: '925 Sterling Silver', subLabel: 'Premium Quality', type: 'Silver' },
    '925': { label: '925 Sterling Silver', subLabel: 'Premium Quality', type: 'Silver' },
    '99.9': { label: 'Fine Silver', subLabel: '99.9% Pure', type: 'Silver' },
    '99.9%': { label: 'Fine Silver', subLabel: '99.9% Pure', type: 'Silver' },

    // Platinum Standards
    '950': { label: '950 Platinum', subLabel: 'Highly Pure & Rare', type: 'Platinum' },
    'PT950': { label: '950 Platinum', subLabel: 'Highly Pure & Rare', type: 'Platinum' },
    '900': { label: '900 Platinum', subLabel: '90% Pure Platinum', type: 'Platinum' },
    'PT900': { label: '900 Platinum', subLabel: '90% Pure Platinum', type: 'Platinum' },
}

export function formatPurity(value: string | number | null | undefined) {
    if (!value) return { label: 'Fine Craftsmanship', subLabel: 'Premium Materials', type: 'General' as const }

    const strValue = String(value).toUpperCase().trim()

    // Exact match from mapping
    if (PURITY_MAPPING[strValue]) {
        return PURITY_MAPPING[strValue]
    }

    // Heuristics for unknown values
    if (strValue.includes('K')) {
        return { label: `${strValue} Gold Purity`, subLabel: 'Certified Quality', type: 'Gold' as const }
    }

    // Try numeric match (e.g. 22 -> 22K)
    const num = parseFloat(strValue)
    if (!isNaN(num)) {
        if (num <= 24 && num >= 1) return { label: `${num}K Gold Purity`, subLabel: 'Certified Quality', type: 'Gold' as const }
        if (num >= 900) return { label: `${num} Fine Purity`, subLabel: 'Precious Metal', type: 'General' as const }
    }

    return { label: `${strValue} Purity`, subLabel: 'Handmade Excellence', type: 'General' as const }
}

export function formatWeight(grams: number | string | null | undefined): string {
    if (grams === null || grams === undefined || grams === '') return 'Artisan Sized'

    const weight = typeof grams === 'string' ? parseFloat(grams) : grams
    if (isNaN(weight)) return 'Artisan Sized'

    if (weight >= 1000) {
        const kg = (weight / 1000).toFixed(2).replace(/\.00$/, '').replace(/\.([1-9])0$/, '.$1')
        return `${kg} Kilograms`
    }

    const formatted = weight.toFixed(2).replace(/\.00$/, '').replace(/\.([1-9])0$/, '.$1')
    return `${formatted} Grams`
}

export function formatDimensions(l?: number | string, w?: number | string, h?: number | string, unit: string = 'cm'): string {
    const parts = [l, w, h].filter(v => v !== undefined && v !== null && v !== '')
    if (parts.length === 0) return 'Standard Boutique Size'
    return `${parts.join(' x ')} ${unit}`
}
