'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // @ts-ignore - lock is a valid property in newer versions of @supabase/auth-js/ssr
        // Overriding the lock function fixes the persistent "AbortError: signal is aborted" 
        // common in Next.js 14+ environments with Web Locks contention.
        // It bypasses the navigator.locks implementation entirely by executing the acquire callback immediately.
        lock: async (name: string, acquire: () => Promise<any>) => {
            return await acquire()
        }
    }
})
