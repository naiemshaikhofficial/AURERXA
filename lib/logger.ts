/**
 * Robust logger to capture diagnostics in all environments.
 * Using console for Vercel as it automatically captures and drains these to runtime logs.
 */
export function logDiagnostic(category: string, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] [${category}] ${message}`

    if (data) {
        console.log(`[DIAGNOSTIC] ${logEntry}`, JSON.stringify(data, null, 2))
    } else {
        console.log(`[DIAGNOSTIC] ${logEntry}`)
    }
}
