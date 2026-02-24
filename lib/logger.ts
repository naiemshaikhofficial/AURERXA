import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use a separate client to avoid interaction with main auth flow if needed
const loggerClient = createClient(supabaseUrl, supabaseKey)

interface LogOptions {
    pathname?: string
    userId?: string
    metadata?: Record<string, any>
}

export async function logError(error: Error | any, options: LogOptions = {}) {
    const { pathname, userId, metadata } = options

    if (process.env.NODE_ENV === 'development') {
        console.error('[AURERXA LOGGER]:', error, metadata)
    }

    try {
        const { error: logError } = await loggerClient
            .from('error_logs')
            .insert({
                error_message: error.message || String(error),
                error_stack: error.stack,
                pathname: pathname || (typeof window !== 'undefined' ? window.location.pathname : undefined),
                user_id: userId,
                metadata: {
                    ...metadata,
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
                    timestamp: new Date().toISOString()
                }
            })

        if (logError) {
            console.error('Failed to send log to Supabase:', logError)
        }
    } catch (err) {
        // Fail silently in production to avoid crashing the app due to logging failure
        console.error('Logging system failed:', err)
    }
}
