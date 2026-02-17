
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xquczexikijzbzcuvmqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWN6ZXhpa2lqemJ6Y3V2bXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTg5NzIsImV4cCI6MjA4NTgzNDk3Mn0.iSLMsHFPpnoCHzPW1uU_9NIP19D_2gzBagha1WGn1rk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function scanTables() {
    const tables = ['orders', 'bulk_orders', 'custom_orders', 'profiles', 'admin_users', 'products', 'categories', 'order_items'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        console.log(`Table: ${table} | Count: ${count} | Error: ${error ? error.message : 'None'}`);

        if (count > 0) {
            const { data } = await supabase.from(table).select('*').limit(1);
            console.log(`  Sample from ${table}:`, data[0]);
        }
    }
}

scanTables();
