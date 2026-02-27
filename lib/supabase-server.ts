import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Centrally managed Supabase Server Client for use in Server Actions and Middleware.
 * Standardizes cookie names and options to prevent session mismatch/logout issues.
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const allStored = cookieStore.getAll()
                    // console.log(`[DEBUG] Supabase Server Client: Found ${allStored.length} cookies in store.`)
                    // Only log auth cookie existence, not value for security.
                    const hasAuth = allStored.some(c => c.name.includes('auth-token'))
                    if (!hasAuth) {
                        console.warn(`[DEBUG] Supabase Server Client: NO AUTH COOKIE FOUND! Available names: ${allStored.map(c => c.name).join(', ')}`)
                    }
                    return allStored
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set({ name, value, ...options })
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
            cookieOptions: {
                name: 'sb-xquczexikijzbzcuvmqh-auth-token',
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            }
        }
    )
}

/**
 * Lightweight client for static pages or public data fetching where no cookies are needed.
 */
export function createSupabasePublicClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return [] },
            },
            cookieOptions: {
                name: 'sb-xquczexikijzbzcuvmqh-auth-token',
            }
        }
    )
}

/**
 * Admin client for system tasks (bypasses RLS).
 * Only use for critical background tasks like invoice generation.
 */
export function createSupabaseAdminClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() { return [] },
            },
            cookieOptions: {
                name: 'sb-xquczexikijzbzcuvmqh-auth-token',
            }
        }
    )
}
