import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImagePath(url: string | null | undefined): string {
  if (!url) return '/logo.png'
  const trimmed = url.trim()

  // If it's a Supabase URL, proxy it to bypass ISP blocking
  if (trimmed.includes('supabase.co')) {
    const storageMatch = trimmed.match(/\/storage\/v1\/.*/);
    if (storageMatch) {
      return `/api/supabase${storageMatch[0]}`;
    }
  }

  // If it's ImageShack, proxy it as well (ISP blocking common in India)
  if (trimmed.includes('imageshack.com')) {
    return `/api/proxy?url=${encodeURIComponent(trimmed)}`;
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
