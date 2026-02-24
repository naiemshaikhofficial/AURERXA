/**
 * Indian Ring Size Standard (Tanishq/AURERXA)
 * Maps Size Number to Diameter (mm) and Circumference (mm)
 */

export interface RingSizeEntry {
    size: string
    mm: string // Diameter
    circumference: string
}

export const INDIAN_RING_SIZES: RingSizeEntry[] = [
    { size: "1", mm: "13.10", circumference: "41.01" },
    { size: "2", mm: "13.30", circumference: "42.70" },
    { size: "3", mm: "13.70", circumference: "42.90" },
    { size: "4", mm: "13.90", circumference: "43.60" },
    { size: "5", mm: "14.30", circumference: "44.80" },
    { size: "6", mm: "14.70", circumference: "46.10" },
    { size: "7", mm: "15.10", circumference: "47.40" },
    { size: "8", mm: "15.30", circumference: "48.00" },
    { size: "9", mm: "15.50", circumference: "48.70" },
    { size: "10", mm: "15.90", circumference: "50.00" },
    { size: "11", mm: "16.30", circumference: "51.20" },
    { size: "12", mm: "16.50", circumference: "51.90" },
    { size: "13", mm: "16.90", circumference: "53.10" },
    { size: "14", mm: "17.30", circumference: "54.40" },
    { size: "15", mm: "17.50", circumference: "55.10" },
    { size: "16", mm: "17.90", circumference: "56.30" },
    { size: "17", mm: "18.10", circumference: "57.00" },
    { size: "18", mm: "18.50", circumference: "58.30" },
    { size: "19", mm: "18.80", circumference: "58.90" },
    { size: "20", mm: "19.20", circumference: "60.20" },
    { size: "21", mm: "19.40", circumference: "60.80" },
    { size: "22", mm: "19.80", circumference: "62.10" },
    { size: "23", mm: "20.00", circumference: "62.70" },
    { size: "24", mm: "20.40", circumference: "64.00" },
    { size: "25", mm: "20.60", circumference: "64.60" },
    { size: "26", mm: "21.00", circumference: "65.90" },
    { size: "27", mm: "21.10", circumference: "67.20" },
    { size: "28", mm: "21.60", circumference: "67.80" },
    { size: "29", mm: "22.00", circumference: "69.10" },
    { size: "30", mm: "22.30", circumference: "71.00" }
]

export const COUPLE_RING_SIZES = {
    women: [
        { label: "Size L", mm: "16.40" },
        { label: "Size M", mm: "16.80" },
        { label: "Size N", mm: "17.20" }
    ],
    men: [
        { label: "Size R", mm: "18.80" },
        { label: "Size S", mm: "19.10" },
        { label: "Size T", mm: "19.50" }
    ]
}

/**
 * Gets inner diameter for a given size.
 * Handles both numeric strings and couple labels.
 */
export function getDiameterForSize(sizeName: string | number): number {
    const s = String(sizeName).toUpperCase().trim()

    // Check standard sizes
    const standard = INDIAN_RING_SIZES.find(r => r.size === s)
    if (standard) return parseFloat(standard.mm)

    // Check couple sizes
    const allCouple = [...COUPLE_RING_SIZES.women, ...COUPLE_RING_SIZES.men]
    const couple = allCouple.find(c => c.label.toUpperCase().includes(s))
    if (couple) return parseFloat(couple.mm)

    // Fallback heuristic if size is just a number but not in list
    const num = parseFloat(s)
    if (!isNaN(num)) {
        // Linear interpolation fallback (matches approximate Tanishq scale)
        return 12.67 + (num * 0.33)
    }

    return 17.90 // Default to Size 16 (17.90mm)
}

/**
 * Gets circumference for a given size.
 */
export function getCircumferenceForSize(sizeName: string | number): number {
    const s = String(sizeName).toUpperCase().trim()

    // Check standard sizes
    const standard = INDIAN_RING_SIZES.find(r => r.size === s)
    if (standard) return parseFloat(standard.circumference)

    // Check couple sizes — fallback to diameter/PI if needed
    const diameter = getDiameterForSize(sizeName)
    if (diameter) return diameter * Math.PI

    return 56.30 // Default to Size 16
}
