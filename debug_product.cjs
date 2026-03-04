
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log('--- DIAGNOSTIC START ---')
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', 'aurerxa-trident-silver-ring')
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return
    }

    console.log('PRODUCT CORE DATA:')
    console.log('ID:', product.id)
    console.log('Name:', product.name)
    console.log('Price:', product.price)
    console.log('Purity:', product.purity)
    console.log('Material:', product.material_type)
    console.log('Dynamic Pricing Enabled:', product.is_dynamic_pricing)
    console.log('Pricing Type:', product.pricing_type)
    console.log('Sizes:', JSON.stringify(product.sizes))

    const { data: config } = await supabase.from('global_config').select('*').single()
    const { data: rates } = await supabase.from('gold_rates').select('*')

    console.log('\nMETAL RATES:')
    console.log(JSON.stringify(rates, null, 2))

    console.log('\n--- DIAGNOSTIC END ---')
}

debug()
