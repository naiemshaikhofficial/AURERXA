import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImagePath(url: string | null | undefined): string {
  if (!url) return '/logo.png'
  const trimmed = url.trim()
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:')) return trimmed

  // Replace all backslashes with forward slashes, then collapse multiple slashes
  const normalized = trimmed.replace(/\\+/g, '/').replace(/\/+/g, '/')

  // Ensure it starts with a single forward slash
  return normalized.startsWith('/') ? normalized : `/${normalized}`
}
