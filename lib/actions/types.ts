export interface ActionResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    orderId?: string
    count?: number
}

export interface ProductData {
    name: string
    description?: string
    price: number
    image_url: string
    images?: string[]
    category_id?: string
    sub_category_id?: string
    stock?: number
    slug: string
    tags?: string[]
    material_type?: string
    purity?: string
    weight_grams?: number
    is_dynamic_pricing?: boolean
    pricing_type?: 'size_based' | 'length_based' | 'fixed' | 'none'
    making_type?: 'Plain' | 'Designer' | 'Handcrafted'
    base_size?: number
    base_weight?: number
    weight_per_unit?: number
    packaging_cost_override?: number
    platform_fee_pct_override?: number
    margin_percent_override?: number
    min_price_threshold?: number
    tax_pct_override?: number
    fixed_price_override?: number | null
}

export interface PricingEntry {
    price: number
    weight: number
    dimensions: string
    width?: string
    diameter?: string
    circumference?: string
    metalCost?: number
    makingCost?: number
    baseCost?: number
}

export interface GlobalConfig {
    packaging_cost: number
    platform_fee_pct: number
    margin_percent: number
    making_plain_pct: number
    making_designer_pct: number
    making_handcrafted_pct: number
    ring_base_price_size16: number
    tax_percent: number
    shipping_cost: number
}
