import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImagePath(url: string | null | undefined): string {
  if (!url) return '/logo.png'
  if (url.startsWith('http')) return url
  // Replace all backslashes with forward slashes and collapse multiple slashes
  const normalized = url.replace(/\\+/g, '/').replace(/\/+/g, '/')
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}
