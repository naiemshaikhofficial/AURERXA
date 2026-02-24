
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    const { data, count, error } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at', { count: 'exact' });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total orders:', count);
        console.log('Latest 5 orders:', data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
    }
}

checkOrders();
