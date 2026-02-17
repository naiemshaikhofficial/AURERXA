
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xquczexikijzbzcuvmqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWN6ZXhpa2lqemJ6Y3V2bXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTg5NzIsImV4cCI6MjA4NTgzNDk3Mn0.iSLMsHFPpnoCHzPW1uU_9NIP19D_2gzBagha1WGn1rk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function scan() {
    const tables = ['orders', 'bulk_orders', 'custom_orders', 'profiles', 'admin_users', 'products', 'categories', 'order_items'];
    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        console.log(`${t.padEnd(20)}: ${count} rows ${error ? '(Error: ' + error.message + ')' : ''}`);
    }
}
scan();
