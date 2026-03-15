import { supabaseServer } from './lib/actions/utils'

async function checkSchema() {
    // Check hero_slides schema
    const { data: heroData, error: heroError } = await supabaseServer.from('hero_slides').select('*').limit(1)
    console.log('Hero Slides:', heroError ? heroError : Object.keys(heroData?.[0] || {}))

    // Check addresses schema
    const { data: addressData, error: addressError } = await supabaseServer.from('addresses').select('*').limit(1)
    console.log('Addresses:', addressError ? addressError : Object.keys(addressData?.[0] || {}))
}

checkSchema()
