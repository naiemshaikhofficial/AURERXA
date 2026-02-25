import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
            cookieOptions: {
                name: 'sb-xquczexikijzbzcuvmqh-auth-token',
            },
        }
    )

    const results: any = {
        timestamp: new Date().toISOString(),
        env: {
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
            SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
        },
        cookies: cookieStore.getAll().map(c => c.name),
        healthCheck: null,
        user: null,
        error: null
    }

    try {
        const startHealth = Date.now()
        const healthRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
            method: 'GET',
            cache: 'no-store'
        })
        results.healthCheck = {
            status: healthRes.status,
            ok: healthRes.ok,
            duration: Date.now() - startHealth
        }
    } catch (e: any) {
        results.healthCheck = { error: e.message }
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        results.user = user ? { id: user.id, email: user.email } : null
        results.error = error ? error.message : null
    } catch (e: any) {
        results.error = `Exception: ${e.message}`
    }

    return NextResponse.json(results)
}
