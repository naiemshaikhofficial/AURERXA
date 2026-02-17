
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xquczexikijzbzcuvmqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWN6ZXhpa2lqemJ6Y3V2bXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTg5NzIsImV4cCI6MjA4NTgzNDk3Mn0.iSLMsHFPpnoCHzPW1uU_9NIP19D_2gzBagha1WGn1rk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('Querying public schema tables...');

    // Check orders
    const { count: ordersCount, error: ordersErr } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    console.log('Orders count:', ordersCount, ordersErr ? 'ERROR: ' + ordersErr.message : '');

    // Check bulk_orders
    const { count: bulkCount, error: bulkErr } = await supabase.from('bulk_orders').select('*', { count: 'exact', head: true });
    console.log('Bulk Orders count:', bulkCount, bulkErr ? 'ERROR: ' + bulkErr.message : '');

    // Check custom_orders
    const { count: customCount, error: customErr } = await supabase.from('custom_orders').select('*', { count: 'exact', head: true });
    console.log('Custom Orders count:', customCount, customErr ? 'ERROR: ' + customErr.message : '');

    // Check categories
    const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    console.log('Categories count:', catCount);

    // List latest order from any of them if exists
    if (ordersCount > 0) {
        const { data } = await supabase.from('orders').select('order_number, status').order('created_at', { ascending: false }).limit(1);
        console.log('Latest Order:', data[0]);
    }
}

checkDatabase();
