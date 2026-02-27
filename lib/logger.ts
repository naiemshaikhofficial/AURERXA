import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'tmp', 'invoice_debug.log')

/**
 * Robust file-based logger to capture deep diagnostics in production-like environments.
 */
export function logDiagnostic(category: string, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] [${category}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`

    try {
        // Ensure tmp directory exists
        const tmpDir = path.dirname(LOG_FILE)
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true })
        }

        fs.appendFileSync(LOG_FILE, logEntry)
        console.log(`[DIAGNOSTIC] ${category}: ${message}`)
    } catch (err) {
        console.error('Failed to write to diagnostic log:', err)
    }
}
