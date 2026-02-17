
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function DebugPage() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Test connection
    const cookieStore = await cookies()
    const supabase = createServerClient(url!, key!, {
        cookies: {
            getAll() { return cookieStore.getAll() },
            setAll() { }
        }
    })

    const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { data: admin } = await supabase.from('admin_users').select('role').limit(1);

    return (
        <div style={{ padding: '2rem', color: 'white', background: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
            <h1>Debug Info</h1>
            <p><strong>URL:</strong> {url}</p>
            <p><strong>Orders Count:</strong> {count} {error ? `(Error: ${error.message})` : ''}</p>
            <p><strong>Admin Users Count:</strong> {admin?.length || 0}</p>
            <hr />
            <p>If URL matches .env.local but count is 0, RLS is likely blocking even if count: 'exact' is used? No, count should work if policy allows head.</p>
        </div>
    );
}
