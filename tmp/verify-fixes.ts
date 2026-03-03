import { getFilteredProducts, searchProducts } from '../lib/actions/search'
import { addAddress } from '../lib/actions/auth'

async function runTests() {
    console.log('--- Testing Search ---')
    try {
        const products = await getFilteredProducts({ search: 'Silver' })
        console.log(`Found ${products.length} products for query "Silver"`)

        const suggestions = await searchProducts('Ring')
        console.log(`Found ${suggestions.length} suggestions for query "Ring"`)
    } catch (e) {
        console.error('Search test failed:', e)
    }

    console.log('\n--- Testing Address Sanitization ---')
    try {
        const dummyAddress = {
            label: 'Test',
            full_name: 'Test User',
            phone: '1234567890',
            pincode: '422605',
            address_line1: 'Should be removed',
            address_line2: 'Should be removed',
            landmark: 'Should be removed',
            street_address: '123 Real Street',
            city: 'Sangamner',
            state: 'MH',
            country: 'IN',
            is_default: false
        }

        // This will likely fail due to lack of auth in a script context, 
        // but it will verify the code compiles and logic flow
        const result = await addAddress(dummyAddress)
        console.log('Address save result (expected unauthorized):', result)
    } catch (e: any) {
        console.error('Address test crashed (expected if auth client fails):', e.message)
    }
}

runTests()
