/**
 * Simple server-side sanitizer to prevent basic XSS and clean HTML tags.
 * For deep sanitization in production, consider 'dompurify' with 'jsdom' or 'sanitize-html',
 * but for a lightweight serverless environment, this regex-based approach handles common cases.
 */
export function sanitize(text: string | null | undefined): string {
    if (!text) return ''

    return text
        // Remove script tags and their content
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
        // Remove on* event handlers
        .replace(/on\w+="[^"]*"/gim, '')
        .replace(/on\w+='[^']*'/gim, '')
        // Remove style tags
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, '')
        // Remove HTML tags but keep some basic formatting if needed (optional)
        // Here we strip all tags for maximum safety in plain text areas
        .replace(/<[^>]*>?/gm, '')
        // Trim whitespace
        .trim()
}

/**
 * Sanitizes an object of fields (useful for form data)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = { ...obj }

    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitize(sanitized[key])
        } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
            sanitized[key] = sanitizeObject(sanitized[key])
        }
    }

    return sanitized
}
