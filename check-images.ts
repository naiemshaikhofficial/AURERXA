
import { supabase } from './lib/supabase'

async function checkProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('name, image_url')
        .limit(5)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Products:', JSON.stringify(data, null, 2))
    }
}

checkProducts()
