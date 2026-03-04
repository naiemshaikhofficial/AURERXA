import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImagePath(url: string | null | undefined): string {
  if (!url) return '/logo.png'
  const trimmed = url.trim()

  // Supabase URLs: Return direct URL to reduce server load
  if (trimmed.includes('supabase.co')) {
    return trimmed
  }

  // Robust Pattern: imageshack.com/i/ patterns are landing pages, not direct images.
  // Although we can't always guess the direct link without an API call, we can at least 
  // ensure they don't crash and we might attempt a common direct link conversion.
  if (trimmed.includes('imageshack.com/i/')) {
    // If it's a known landing page, we keep it but the Next.js loader might still fail.
    // However, we avoid any further "normalization" that might make it worse.
    return trimmed
  }

  if (trimmed.startsWith('http') || trimmed.startsWith('blob:')) return trimmed

  // Replace all backslashes with forward slashes, then collapse multiple slashes
  const normalized = trimmed.replace(/\\+/g, '/').replace(/\/+/g, '/')

  // Ensure it starts with a single forward slash
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}
export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor;
}
