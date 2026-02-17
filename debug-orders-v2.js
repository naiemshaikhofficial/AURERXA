
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xquczexikijzbzcuvmqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWN6ZXhpa2lqemJ6Y3V2bXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTg5NzIsImV4cCI6MjA4NTgzNDk3Mn0.iSLMsHFPpnoCHzPW1uU_9NIP19D_2gzBagha1WGn1rk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    console.log('Connecting to Supabase...');
    const { data, count, error } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at', { count: 'exact' });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total orders:', count);
        console.log('Latest 10 orders:');
        if (data) {
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 10)
                .forEach(o => console.log(`- #${o.order_number} [${o.status}] - ${o.created_at}`));
        }
    }
}

checkOrders();
