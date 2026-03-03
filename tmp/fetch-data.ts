import { supabaseServer } from '../lib/actions/utils'

async function run() {
    try {
        const { data: cats, error: catError } = await supabaseServer.from('categories').select('name, slug')
        const { data: subcats, error: subError } = await supabaseServer.from('sub_categories').select('name, slug')

        console.log('--- CATEGORIES ---')
        console.log(JSON.stringify(cats, null, 2))

        console.log('\n--- SUBCATEGORIES ---')
        console.log(JSON.stringify(subcats, null, 2))
    } catch (err) {
        console.error('Error fetching data:', err)
    }
}

run()
