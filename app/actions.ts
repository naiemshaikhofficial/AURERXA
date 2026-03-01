'use server'

import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notifyNewProduct } from './push-actions'
import { revalidateTag, revalidatePath, unstable_cache } from 'next/cache'
import * as nodeCrypto from 'node:crypto'

import { createRazorpayOrder, verifyRazorpayPayment as verifyRazorpayPaymentLib } from '@/lib/razorpay'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { sanitize, sanitizeObject } from '@/lib/sanitizer'
import { getDiameterForSize, getCircumferenceForSize } from '@/lib/ring-sizes'
import { runFullIngestion } from '@/lib/ai-knowledge'
import { sendInvoiceEmail } from '@/lib/email'
import { getInvoiceEmailHtml } from '@/lib/templates/invoice-email'
import { generateInvoicePdf } from '@/lib/pdf-generator'
import { encrypt, decrypt, refundOrder } from '@/lib/ccavenue'

import { createSupabaseServerClient, createSupabasePublicClient, createSupabaseAdminClient } from '@/lib/supabase-server'
import { logDiagnostic } from '@/lib/logger'
import { z } from 'zod'

const ReviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().max(50).optional(),
  email: z.string().email().optional(),
})

const SupportTicketSchema = z.object({
  subject: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  category: z.string(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  userId: z.string().uuid().optional(),
})

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(100).optional(),
  message: z.string().min(10).max(2000),
})

const CustomOrderSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  description: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(5).optional(),
  catalog_requested: z.boolean().optional(),
})

const BulkOrderSchema = z.object({
  businessName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  gstNumber: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    productImage: z.string(),
    retailPrice: z.number().positive(),
    quantity: z.number().min(10),
  })).min(1),
})

// Helper to get client ID for rate limiting
async function getClientIdentifier() {
  const head = await headers()
  return head.get('x-forwarded-for')?.split(',')[0] || head.get('x-real-ip') || 'anonymous'
}

// Server-side Supabase client for static/public data (safe for unstable_cache)
const supabaseServer = createSupabasePublicClient()

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// =====================================================
// IN-MEMORY LOOKUP CACHE (eliminates N+1 DB patterns)
// Used for frequently-queried, rarely-changing lookups
// like category IDs by slug.
// =====================================================
interface CacheEntry<T> { value: T; expiresAt: number }
const _lookupCache = new Map<string, CacheEntry<any>>()
const LOOKUP_TTL_MS = 10 * 60 * 1000 // 10 minutes

function _cacheGet<T>(key: string): T | null {
  const entry = _lookupCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    _lookupCache.delete(key)
    return null
  }
  return entry.value as T
}

function _cacheSet<T>(key: string, value: T): void {
  // Prevent unbounded growth — max 200 entries
  if (_lookupCache.size >= 200) {
    const firstKey = _lookupCache.keys().next().value
    if (firstKey) _lookupCache.delete(firstKey)
  }
  _lookupCache.set(key, { value, expiresAt: Date.now() + LOOKUP_TTL_MS })
}

/**
 * Generic TTL Cache for server actions (In-Memory)
 */
async function getCached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now()
  const cached = _lookupCache.get(key)
  if (cached && cached.expiresAt > now) return Promise.resolve(cached.value as T)
  return fetcher().then(data => {
    _lookupCache.set(key, { value: data, expiresAt: now + ttlSeconds * 1000 })
    return data
  })
}

import { get } from '@vercel/edge-config'

/**
 * Fetches a dynamic setting from the site_settings table with Next.js caching.
 * Optimized: Checks Vercel Edge Config first, then Next.js Data Cache.
 */
export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
  // 1. Try Edge Config first (0ms latency, extremely cost-effective)
  try {
    if (process.env.EDGE_CONFIG) {
      const edgeValue = await get(key)
      if (edgeValue !== undefined) return edgeValue as T
    }
  } catch (e) {
    // Fail silently to next cache layer
  }

  // 2. Fallback to Next.js Data Cache + Supabase
  return unstable_cache(
    async () => {
      try {
        const queryPromise = supabaseServer
          .from('site_settings')
          .select('value')
          .eq('key', key)
          .maybeSingle()

        const result = await Promise.race([
          queryPromise,
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Setting fetch timeout')), 3000)
          )
        ])

        const { data, error } = result
        if (error || !data) return defaultValue
        return data.value as T
      } catch (err: any) {
        if (err.message !== 'Setting fetch timeout') {
          console.error(`Error fetching setting ${key}:`, err)
        } else {
          console.warn(`Timeout fetching setting ${key}, using default.`)
        }
        return defaultValue
      }
    },
    [`setting-${key}`],
    { revalidate: 3600, tags: [`setting:${key}`, 'settings'] }
  )()
}

export interface ProductData {
  name: string
  description?: string
  price: number
  image_url: string
  images?: string[]
  category_id?: string
  sub_category_id?: string
  stock?: number
  slug: string
  tags?: string[]
  material_type?: string
  purity?: string
  weight_grams?: number
  // Dynamic Pricing & Control Overrides
  is_dynamic_pricing?: boolean
  pricing_type?: 'size_based' | 'length_based' | 'fixed' | 'none'
  making_type?: 'Plain' | 'Designer' | 'Handcrafted'
  base_size?: number
  base_weight?: number
  weight_per_unit?: number
  packaging_cost_override?: number
  platform_fee_pct_override?: number
  margin_percent_override?: number
  min_price_threshold?: number
  tax_pct_override?: number
  fixed_price_override?: number | null
}

export async function getTestProductCount() {
  const { count, error } = await supabaseServer.from('products').select('*', { count: 'exact', head: true })
  console.log('DEBUG: Product count:', count, error)
  return { count, error }
}

// Helper to check if current user is an admin
async function checkIsAdmin() {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return false

    const { data } = await client
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    return !!data
  } catch (err: any) {
    // Ignore common session errors
    const errorMsg = err.message || ''
    if (
      errorMsg.includes('Refresh Token Not Found') ||
      errorMsg.includes('Refresh Token Already Used') ||
      errorMsg.includes('Auth session missing')
    ) {
      return false
    }
    console.error('Error checking admin status:', err)
    return false
  }
}

// Helper to get authenticated supabaseServer client
const getAuthClient = cache(async () => {
  return createSupabaseServerClient()
})

/**
 * Security: Generic Rate Limiter using Supabase RPC
 */
async function checkActionRateLimit(identifier: string, action: string, max: number, window: number) {
  try {
    const adminClient = await createSupabaseAdminClient()
    const { data, error } = await adminClient.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_count: max,
      p_window_minutes: window
    })
    if (error) {
      console.error('[SECURITY] Rate limit RPC error:', error)
      return true // Fail open to avoid blocking users on DB glitches
    }
    return !!data
  } catch (e) {
    return true
  }
}

// Check if user has a pending order for a specific product
export async function checkPendingOrder(productId: string) {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return false

    // Check orders that are NOT cancelled or delivered (i.e., active/pending/processing/shipped)
    // We want to prevent duplicate PURCHASE of the same item if one is already in progress.
    // Adjust logic based on user request: "pending mai ho" -> usually means not yet delivered/cancelled.
    const { data, error } = await client
      .from('orders')
      .select('order_items!inner(product_id)')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing', 'packed', 'shipped'])
      .eq('order_items.product_id', productId)
      .limit(1)

    if (error) {
      console.error('Error checking pending orders:', error)
      return false
    }

    return data && data.length > 0
  } catch (err) {
    console.error('Error checking pending orders:', err)
    return false
  }
}

export const getCurrentUserProfile = cache(async () => {
  try {
    const client = await getAuthClient()

    // 1. Get user with timeout to prevent RootLayout hang
    const { data: { user } } = await Promise.race([
      client.auth.getUser(),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), 4000))
    ]).catch(() => ({ data: { user: null } }))

    if (!user) return null

    const [profileRes, adminRes] = await Promise.race([
      Promise.all([
        client.from('profiles').select('full_name, email, phone_number, is_banned').eq('id', user.id).maybeSingle(),
        client.from('admin_users').select('role').eq('id', user.id).maybeSingle()
      ]),
      new Promise<[any, any]>((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )
    ])

    const data = profileRes.data
    const adminData = adminRes.data

    if (profileRes.error && profileRes.error.code !== 'PGRST116') {
      console.warn('Profile fetch warning (non-blocking):', profileRes.error.message)
    }

    return {
      id: user.id,
      name: data?.full_name,
      email: data?.email,
      phone: data?.phone_number,
      isBanned: !!data?.is_banned,
      isAdmin: !!adminData
    }
  } catch (err: any) {
    if (err.message === 'Profile fetch timeout') {
      console.error('CRITICAL: Profile fetch timed out - possible DB strain.')
    } else {
      console.warn('Auth Profile Error (non-blocking):', err.message)
    }
    return null
  }
})

// =====================================================
// CONCIERGE & CHAT ACTIONS
// =====================================================


const BOT_KNOWLEDGE: Record<string, string> = {
  greetings: "Namaste! I am AURXY, your personal guide to the world of AURERXA Heritage Jewelry. How may I assist you in your journey today?",
  purity: "At AURERXA, every masterpiece is a promise of purity. Our gold (14K to 24K) is BIS Hallmarked with a unique HUID for verification via the BIS Care app. Our diamonds are certified by world-renowned laboratories like IGI or GIA.",
  shipping: "We offer complimentary Insured Shipping across India for orders above ₹50,000. For others, a flat ₹500 fee applies. Delivery typically takes 5-10 business days as each piece is a handcrafted work of art.",
  returns: "Due to the artisanal nature and high value of our jewelry, we follow a strict no-refund policy. Returns are only considered for manufacturing defects reported within 24h with a mandatory unboxing video.",
  rates: "Our live gold and silver rates are calibrated every 10 minutes based on global spot prices and market benchmarks. This ensures you always receive the fairest heritage value.",
  custom: "Bespoke creations are our soul. You can share your vision on our 'Custom Jewelry' page, and our master artisans will provide a feasibility report and quote within 48 hours.",
  unboxing: "To protect your investment, a continuous, uncut unboxing video is MANDATORY for all claims. This ensures transparency and helps us resolve any transit issues immediately.",
  location: "Experience our legacy in person at our heritage boutique: Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605. We also offer virtual consultations via WhatsApp Video.",
  sizing: "Unsure of your fit? We have a detailed Size Guide on our website with a printable sizer. You can also visit any local jeweler for professional measurement before placing your heritage order.",
  expert: "I can certainly connect you with one of our specialized jewelry consultants for further assistance. Would you like to talk to a human expert now?",
  collections: "Explore our curated masterpieces across our diverse collections: [View All Collections](/collections). We have everything from heritage necklaces to everyday elegance.",
  account: "You can manage your heritage orders, track shipments, and view your wishlists in your [Private Account](/account).",
  store_pickup: "We offer 'Store Pickup' at our Sangamner boutique. Choose this option at checkout to personally collect your masterpiece. A valid ID is required for verification."
}

export interface BotResponse {
  text: string
  actions?: { label: string, link?: string, action?: string }[]
}

/**
 * Intelligent bot response logic with enhanced keyword matching, context, and dynamic actions
 */
export async function getBotResponse(query: string): Promise<BotResponse> {
  const q = query.toLowerCase().trim()

  // Greetings
  if (q.match(/^(hi|hello|hey|namaste|hola|good morning|good evening|good afternoon)/)) {
    return {
      text: BOT_KNOWLEDGE.greetings,
      actions: [
        { label: "Browse Collections", link: "/collections" },
        { label: "Custom Jewelry", link: "/custom-jewelry" }
      ]
    }
  }

  // Purity & Authenticity
  if (q.includes('purity') || q.includes('gold') || q.includes('pure') || q.includes('authentic') || q.includes('hallmark') || q.includes('huid') || q.includes('diamond') || q.includes('certificate')) {
    return {
      text: BOT_KNOWLEDGE.purity,
      actions: [
        { label: "View Certificates", link: "/help#certificates" },
        { label: "Live Gold Rates", link: "/live-rates" }
      ]
    }
  }

  // Shipping & Delivery
  if (q.includes('ship') || q.includes('delivery') || q.includes('time') || q.includes('track') || q.includes('order status')) {
    return {
      text: BOT_KNOWLEDGE.shipping,
      actions: [
        { label: "Track My Order", link: "/account/orders" },
        { label: "Shipping Policy", link: "/shipping" }
      ]
    }
  }

  // Returns & Refunds
  if (q.includes('return') || q.includes('refund') || q.includes('exchange') || q.includes('cancel')) {
    return {
      text: q.includes('unboxing') || q.includes('video') || q.includes('damage') ? BOT_KNOWLEDGE.unboxing : BOT_KNOWLEDGE.returns,
      actions: [
        { label: "Return Policy", link: "/returns" },
        { label: "Contact Support", action: "expert" }
      ]
    }
  }

  // Gold Rates
  if (q.includes('rate') || q.includes('price') || q.includes('live') || q.includes('today')) {
    return {
      text: BOT_KNOWLEDGE.rates,
      actions: [
        { label: "Live Rates Page", link: "/live-rates" },
        { label: "Inquire Bespoke", link: "/custom-jewelry" }
      ]
    }
  }

  // Customization
  if (q.includes('custom') || q.includes('bespoke') || q.includes('make my own') || q.includes('design')) {
    return {
      text: BOT_KNOWLEDGE.custom,
      actions: [
        { label: "Start Designing", link: "/custom-jewelry" },
        { label: "Talk to Artisan", action: "expert" }
      ]
    }
  }

  // Location & Store
  if (q.includes('location') || q.includes('address') || q.includes('store') || q.includes('boutique') || q.includes('visit') || q.includes('sangamner')) {
    return {
      text: q.includes('pickup') ? BOT_KNOWLEDGE.store_pickup : BOT_KNOWLEDGE.location,
      actions: [
        { label: "Get Directions", link: "https://maps.google.com" },
        { label: "Book Appointment", link: "/contact" }
      ]
    }
  }

  // Sizing
  if (q.includes('size') || q.includes('fit') || q.includes('ring size') || q.includes('measure')) {
    return {
      text: BOT_KNOWLEDGE.sizing,
      actions: [
        { label: "Ring Sizer", link: "/ring-size-calculator" },
        { label: "Size Guide", link: "/size-guide" }
      ]
    }
  }

  // Navigation Help
  if (q.includes('collection') || q.includes('catalog') || q.includes('products') || q.includes('jewelry')) {
    return {
      text: BOT_KNOWLEDGE.collections,
      actions: [
        { label: "Chains", link: "/collections/chains" },
        { label: "Rings", link: "/collections/rings" },
        { label: "View All", link: "/collections" }
      ]
    }
  }
  if (q.includes('account') || q.includes('my order') || q.includes('wishlist') || q.includes('profile')) {
    return {
      text: BOT_KNOWLEDGE.account,
      actions: [
        { label: "My Orders", link: "/account/orders" },
        { label: "Manage Profile", link: "/account" }
      ]
    }
  }

  // Human Expert Request
  if (q.includes('expert') || q.includes('human') || q.includes('agent') || q.includes('talk to') || q.includes('person')) {
    return {
      text: BOT_KNOWLEDGE.expert,
      actions: [
        { label: "Connect with Expert", action: "expert" }
      ]
    }
  }

  // --- RAG FALLBACK (Intelligent Search) ---
  const matches = await searchAIKnowledge(query)
  if (matches && matches.length > 0) {
    return {
      text: matches[0].content,
      actions: [
        { label: "View Details", link: matches[0].metadata?.url || "/help" },
        { label: "Talk to Expert", action: "expert" }
      ]
    }
  }

  // Fallback for unknown queries
  return {
    text: "That's an interesting inquiry about our heritage creations. While I'm still perfecting my knowledge of specific rare pieces, I can guide you through our main collections or connect you with a specialized consultant. What would you prefer?",
    actions: [
      { label: "View Collections", link: "/collections" },
      { label: "Talk to Expert", action: "expert" }
    ]
  }
}


/**
 * Creates a support ticket from the chatbot when no agent is available.
 */
export async function createSupportTicket(data: z.infer<typeof SupportTicketSchema> & { chatHistory?: string }) {
  // Rate limit check
  const clientId = await getClientIdentifier()
  const isAllowed = await checkActionRateLimit(clientId, 'create_ticket', 5, 60) // 5 tickets per hour
  if (!isAllowed) return { success: false, error: 'Too many requests. Please try again later.' }

  // Validation
  const validated = SupportTicketSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: 'Invalid input: ' + validated.error.errors[0].message }
  }

  try {
    const { data: ticket, error } = await supabaseServer
      .from('tickets')
      .insert([{
        subject: sanitize(validated.data.subject),
        description: sanitize(validated.data.description),
        category: validated.data.category,
        status: 'open',
        priority: 'normal',
        user_id: validated.data.userId || null,
        guest_name: validated.data.name,
        guest_email: validated.data.email,
        guest_phone: validated.data.phone
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true, ticketId: ticket.id }
  } catch (err: any) {
    console.error('Failed to create support ticket:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Creates a new chat session and saves the initial inquiry.
 */
export async function startChatSession(data: { name: string, email: string, phone: string, initialMessage?: string }) {
  const { data: session, error } = await supabaseServer
    .from('chat_sessions')
    .insert([{
      guest_name: data.name,
      guest_email: data.email,
      guest_phone: data.phone,
      status: 'open'
    }])
    .select()
    .single()

  if (error) throw error

  if (data.initialMessage) {
    await supabaseServer.from('chat_messages').insert([{
      session_id: session.id,
      role: 'user',
      content: data.initialMessage,
      sender_name: data.name
    }])
  }

  return session
}

export async function signOutAction() {
  try {
    const client = await getAuthClient()
    await client.auth.signOut()

    // Explicitly clear all auth related cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Pattern match Supabase auth cookies (usually sb-xyz-auth-token)
    // Also clear the status cache and any other identifying cookies
    allCookies.forEach(cookie => {
      const name = cookie.name.toLowerCase()
      if (
        name.includes('auth') ||
        name.includes('supabase') ||
        name.startsWith('sb-') ||
        name === 'ua-status-cache' ||
        name.includes('session') ||
        name.includes('token')
      ) {
        cookieStore.set(cookie.name, '', { maxAge: 0, path: '/' })
        cookieStore.delete(cookie.name)
      }
    })

    // Also explicitly delete common supabase cookie names just in case
    cookieStore.delete('supabase-auth-token')

    // Clear status cache explicitly
    cookieStore.set('ua-status-cache', '', { maxAge: 0, path: '/' })
    cookieStore.delete('ua-status-cache')

    return { success: true }
  } catch (err: any) {
    console.error('Crash in signOutAction:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}

// ============================================
// REVIEWS
// ============================================

export async function getProductReviews(productId: string) {
  // Step 1: Fetch reviews (including guest fields)
  const { data: reviews, error: reviewError } = await supabaseServer
    .from('product_reviews')
    .select('id, rating, comment, images, is_verified, created_at, user_id, guest_name')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (reviewError) {
    console.error('❌ Error fetching reviews:', reviewError)
    return []
  }

  if (!reviews || reviews.length === 0) return []

  // Step 2: Fetch profiles for authenticated reviewers
  const userIds = Array.from(new Set(reviews.map(r => r.user_id).filter(Boolean)))

  let profilesMap: Record<string, { full_name: string }> = {}

  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabaseServer
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    if (!profileError && profiles) {
      profiles.forEach(p => {
        profilesMap[p.id] = { full_name: p.full_name }
      })
    }
  }

  // Step 3: Combine — use profile name for logged-in users, guest_name for guests
  const results = reviews.map(r => ({
    ...r,
    profiles: r.user_id && profilesMap[r.user_id]
      ? profilesMap[r.user_id]
      : r.guest_name
        ? { full_name: r.guest_name }
        : null
  }))

  return results
}

export async function getReviewStats(productId: string) {
  const { data, error } = await supabaseServer
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved')

  if (error || !data) {
    return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }

  const total = data.length
  const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
  const average = total > 0 ? Number((sum / total).toFixed(1)) : 0

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  data.forEach(r => {
    distribution[r.rating as keyof typeof distribution]++
  })

  return { average, total, distribution }
}

export async function submitReview(formData: FormData): Promise<ActionResponse> {
  // Rate limit check
  const clientId = await getClientIdentifier()
  const isAllowed = await checkActionRateLimit(clientId, 'submit_review', 3, 30) // 3 reviews per 30 mins
  if (!isAllowed) return { success: false, error: 'Too many review attempts. Please try again later.' }

  try {
    const rawData = {
      productId: formData.get('productId') as string,
      rating: parseInt(formData.get('rating') as string),
      comment: formData.get('comment') as string,
      images: JSON.parse(formData.get('images') as string || '[]'),
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
    }

    const validated = ReviewSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: 'Invalid review: ' + validated.error.errors[0].message }
    }

    const { productId, rating, comment, images, firstName, lastName, email } = validated.data

    // Check if user is authenticated
    let userId: string | null = null
    try {
      const client = await getAuthClient()
      const { data: { user } } = await client.auth.getUser()
      if (user) userId = user.id
    } catch { /* Guest review */ }

    // For guest reviews, name and email are required
    if (!userId && (!firstName || !email)) {
      return { success: false, error: 'Name and email are required for guest reviews' }
    }

    const guestName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName

    // Use supabaseServer — RLS policy now allows public inserts
    const { error } = await supabaseServer
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        guest_name: userId ? null : guestName,
        guest_email: userId ? null : email,
        rating,
        comment: sanitize(comment || ''),
        images: images || [],
        status: 'approved',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Submit review error:', error)
      return { success: false, error: error.message }
    }

    revalidateTag('reviews', '')
    return { success: true }
  } catch (err: any) {
    console.error('Submit review crash:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}

export async function uploadReviewImage(base64: string, productId: string): Promise<ActionResponse<string>> {
  try {
    // Size guard: reject images > 500KB base64 (approx 375KB binary)
    if (base64.length > 500_000) {
      return { success: false, error: 'Image too large. Please use a smaller image.' }
    }

    // Convert base64 to buffer
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = `${productId}/guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`

    // Use supabaseServer — bucket is now public for inserts
    const { data, error } = await supabaseServer.storage
      .from('review')
      .upload(fileName, buffer, {
        contentType: 'image/webp',
        upsert: true
      })

    if (error) {
      console.error('Storage upload error:', error)
      return { success: false, error: error.message }
    }

    const { data: { publicUrl } } = supabaseServer.storage
      .from('review')
      .getPublicUrl(fileName)

    return { success: true, data: publicUrl }
  } catch (err: any) {
    console.error('Upload review image crash:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}


export async function addNewProduct(productData: ProductData): Promise<ActionResponse> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const sanitizedData = sanitizeObject(productData)
  const client = await getAuthClient()

  const { data, error } = await client
    .from('products')
    .insert({
      ...sanitizedData,
      tags: sanitizedData.tags || [],
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Add product error:', error)
    return { success: false, error: error.message }
  }

  // Trigger push notification
  await notifyNewProduct(data.name, data.slug, data.image_url || '/icon-192.png')

  revalidateTag('products', '')
  return { success: true, data }
}

// ============================================
// CATEGORIES
// ============================================

export const getCategories = unstable_cache(
  async () => {
    const { data, error } = await supabaseServer
      .from('categories')
      .select('id, name, slug, image_url, description')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    return data
  },
  ['categories'],
  { revalidate: 86400, tags: ['categories'] }
)

export const getUsedTags = unstable_cache(
  async () => {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select('tags')
        .not('tags', 'is', null)

      if (error || !data) return []

      const allTags = data.flatMap(p => p.tags || [])
      const uniqueTags = Array.from(new Set(allTags.map(t => t.toLowerCase())))
        .map(t => {
          if (t === 'genz') return 'GENZ'
          if (t === 'modern') return 'Modern'
          return t.charAt(0).toUpperCase() + t.slice(1)
        })
        .sort()

      return uniqueTags
    } catch (err) {
      console.error('Error fetching used tags:', err)
      return []
    }
  },
  ['used-tags'],
  { revalidate: 3600, tags: ['products'] }
)

export const getGenderStats = unstable_cache(
  async () => {
    try {
      const g = ['men', 'women', 'unisex', 'kids']
      const counts: Record<string, number> = {}

      for (const gender of g) {
        const { count, error } = await supabaseServer
          .from('products')
          .select('*', { count: 'exact', head: true })
          .ilike('gender', gender)

        if (!error) {
          counts[gender] = count || 0
        }
      }

      return counts
    } catch (err) {
      console.error('Error fetching gender stats:', err)
      return {}
    }
  },
  ['gender-stats'],
  { revalidate: 3600, tags: ['products'] }
)

export async function getSubCategories(categoryId?: string) {
  return unstable_cache(
    async () => {
      let query = supabaseServer
        .from('sub_categories')
        .select('id, name, slug, category_id, description, image_url')
        .order('name')

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query

      if (error) {
        // If table doesn't exist yet, return empty array gracefully
        if (error.code === 'PGRST116' || (error.message && error.message.includes('relation "sub_categories" does not exist'))) {
          return []
        }
        console.error('Error fetching sub-categories:', error)
        return []
      }
      return data
    },
    ['sub-categories', categoryId || 'all'],
    { revalidate: 86400, tags: ['sub-categories'] }
  )()
}

export async function addSubCategory(subCategoryData: { name: string, category_id: string, slug: string, description?: string }): Promise<ActionResponse> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const sanitizedData = sanitizeObject(subCategoryData)
  const client = await getAuthClient()

  const { data, error } = await client
    .from('sub_categories')
    .insert({
      ...sanitizedData,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Add sub-category error:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('sub-categories', '')
  return { success: true, data }
}

export async function updateSubCategory(id: string, updates: any) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const client = await getAuthClient()

  const { error } = await client
    .from('sub_categories')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Update sub-category error:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('sub-categories', '')
  return { success: true }
}

export async function deleteSubCategory(id: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const client = await getAuthClient()

  const { error } = await client
    .from('sub_categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete sub-category error:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('sub-categories', '')
  return { success: true }
}

// ============================================
// PRODUCTS
// ============================================

/**
 * Public function to get gold rates and trigger background sync if stale
 */
export async function getGoldRates() {
  return unstable_cache(
    async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseServer = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabaseServer
          .from('gold_rates')
          .select('purity, rate, updated_at')

        if (error) throw error;

        const ratesObj: Record<string, number> = {}
        let lastUpdatedValue: number = 0

        if (data) {
          data.forEach((item: any) => {
            ratesObj[item.purity] = item.rate
            if (item.updated_at) {
              const updatedTime = new Date(item.updated_at).getTime()
              if (updatedTime > lastUpdatedValue) {
                lastUpdatedValue = updatedTime
              }
            }
          })
        }

        const lastUpdated = lastUpdatedValue > 0 ? new Date(lastUpdatedValue).toISOString() : null

        // Lazy Background Sync: If rates are older than 8 hours
        const eightHoursAgo = Date.now() - (8 * 3600000)
        const isStale = !data || data.length === 0 || lastUpdatedValue < eightHoursAgo

        if (isStale) {
          console.log(`[SYNC] Data is stale. Triggering background sync...`)
          syncLiveGoldRates().catch(err => console.error('Background sync failed:', err))
        }

        return { rates: ratesObj, lastUpdated }
      } catch (err) {
        console.error('Error in getGoldRates:', err)
        return null
      }
    },
    ['gold-rates'],
    { revalidate: 600, tags: ['rates'] }
  )()
}

// ============================================
// GLOBAL CONFIG (Pricing Settings)
// ============================================

export type GlobalConfig = {
  packaging_cost: number
  platform_fee_pct: number
  margin_percent: number
  making_plain_pct: number
  making_designer_pct: number
  making_handcrafted_pct: number
  ring_base_price_size16: number
  tax_percent: number
  shipping_cost: number
}

const DEFAULT_CONFIG: GlobalConfig = {
  packaging_cost: 50,
  platform_fee_pct: 5,
  margin_percent: 30,
  making_plain_pct: 18,
  making_designer_pct: 28,
  making_handcrafted_pct: 38,
  ring_base_price_size16: 1699,
  tax_percent: 3.0,
  shipping_cost: 0,
}

/**
 * PRODUCTION-READY: Robust Global Settings Engine
 * Optimized: Uses Vercel Edge Config (0ms) -> Next.js Data Cache -> Supabase
 */
export async function getGlobalConfig(): Promise<GlobalConfig> {
  // 1. Edge Config Layer
  try {
    if (process.env.EDGE_CONFIG) {
      const edgeConfig = await get('global_config')
      if (edgeConfig) return edgeConfig as GlobalConfig
    }
  } catch (e) { /* Fallback */ }

  return unstable_cache(
    async () => {
      try {
        const { data, error } = await supabaseServer
          .from('global_config')
          .select('key, value')

        if (error || !data) return DEFAULT_CONFIG

        const config = { ...DEFAULT_CONFIG }
        data.forEach((row: any) => {
          if (row.key in config) {
            (config as any)[row.key] = Number(row.value)
          }
        })
        return config
      } catch {
        return DEFAULT_CONFIG
      }
    },
    ['global-config'],
    { revalidate: 600, tags: ['settings', 'config'] }
  )()
}

export async function updateGlobalConfig(key: string, value: number): Promise<ActionResponse> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabaseServer
    .from('global_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export const getBestsellers = unstable_cache(
  async () => {
    const { data, error } = await supabaseServer
      .from('products')
      .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug)')
      .eq('bestseller', true)
      .eq('material_type', 'silver')
      .limit(4)

    if (error) {
      console.error('Error fetching bestsellers:', error)
      return []
    }
    console.log('Bestsellers fetch result:', data?.length)
    return data || []
  },
  ['bestsellers'],
  { revalidate: 600, tags: ['products', 'bestsellers'] }
)

export async function getNewReleases(limit: number = 8) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabaseServer
        .from('products')
        .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug)')
        .eq('material_type', 'silver')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching new releases:', error)
        return []
      }
      return data || []
    },
    ['new-releases', limit.toString()],
    { revalidate: 86400, tags: ['products', 'new-releases'] }
  )()
}

export async function getProducts(categorySlug?: string, sortBy?: string) {
  return unstable_cache(
    async () => {
      let query = supabaseServer
        .from('products')
        .select('id, name, price, image_url, images, slug, weight_grams, tags, categories(id, name, slug)')
        .eq('material_type', 'silver')

      if (categorySlug) {
        const { data: cat } = await supabaseServer
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single()

        if (cat) {
          query = query.eq('category_id', cat.id)
        }
      }

      if (sortBy === 'price-low') {
        query = query.order('price', { ascending: true })
      } else if (sortBy === 'price-high') {
        query = query.order('price', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching products:', error)
        return []
      }

      return data || []
    },
    ['products-list', categorySlug || 'all', sortBy || 'default'],
    { revalidate: 86400, tags: ['products'] }
  )()
}

/**
 * PRODUCTION-READY: Dynamic Pricing Engine for All Jewelry Categories
 *
 * Supports:
 *   - size_based:   Rings. Weight = base_weight × (1 + (size - 16) × 0.03)
 *   - length_based: Chains, Bracelets. Weight = weight_per_unit × length_in_inches
 *   - fixed:        Earrings, Pendants. Weight = base_weight (no variation)
 *
 * Price formula:
 *   metalCost = adjustedWeight × silverRate × purityFactor
 *   makingCost = metalCost × making_pct
 *   baseCost = metalCost + makingCost + packagingCost
 *   withPlatformFee = baseCost × (1 + platform_fee_pct / 100)
 *   withMargin = withPlatformFee × (1 + margin_pct / 100)
 *   finalPrice = floor(withMargin / 100) × 100 + 99  (psychological)
 */
export type PricingEntry = {
  price: number
  weight: number
  dimensions: string
  width?: string
  diameter?: string
  circumference?: string
  metalCost?: number
  makingCost?: number
  baseCost?: number
}

interface PricingOptions {
  pricingType: string
  purity: string
  materialType: string
  baseWeight: number
  productBasePrice: number
  weightPerUnit: number | null
  baseSize: number
  makingType: string
  availableSizes: string[]
  packagingCostOverride: number | null
  platformFeePctOverride: number | null
  dimensions?: { width?: string; height?: string; unit?: string }
  marginPercentOverride?: number | null
  minPriceThreshold?: number | null
  taxPctOverride?: number | null
}

async function getDynamicPricingMap(opts: PricingOptions): Promise<Record<string, PricingEntry> | null> {
  const {
    pricingType, purity, materialType, baseWeight, productBasePrice,
    weightPerUnit, baseSize, makingType, availableSizes,
    packagingCostOverride, platformFeePctOverride, dimensions,
    marginPercentOverride, minPriceThreshold, taxPctOverride
  } = opts

  // 1. Fetch metal rate + global config in parallel
  const [rateData, config] = await Promise.all([
    getGoldRates(),
    getGlobalConfig(),
  ])
  if (!rateData) return null

  // 2. Determine silver/gold rate
  let metalRate = 0
  const purityLower = purity?.toLowerCase() || ''
  const materialLower = materialType?.toLowerCase() || ''

  if (materialLower.includes('silver') || purityLower.includes('925') || purityLower.includes('92.5') || purityLower.includes('99.99')) {
    metalRate = rateData.rates['Silver 99.99'] || rateData.rates['Silver 925'] || rateData.rates['Silver 999'] || 85
  } else if (materialLower.includes('gold') || materialLower === 'real_gold') {
    metalRate = rateData.rates[purity] || rateData.rates['22K'] || 6500
  } else {
    metalRate = rateData.rates['Silver 925'] || rateData.rates['Silver 999'] || 85
  }

  // 3. Purity factor (Adjusted for Brand Standard: 99.99 Silver is 1.0 baseline)
  const purityFactor = (purityLower.includes('925') || purityLower.includes('92.5')) ? 0.925 : 1.0

  // 4. Config values (Manual overrides vs Global)
  const packagingCost = packagingCostOverride ?? config.packaging_cost
  const platformFeePct = platformFeePctOverride ?? config.platform_fee_pct
  const marginPct = marginPercentOverride ?? config.margin_percent
  const taxPct = taxPctOverride ?? (config as any).tax_percent ?? 3.0 // Default to 3% GST
  const shippingCost = (config as any).shipping_cost || 0

  const makingPct = makingType === 'Handcrafted'
    ? config.making_handcrafted_pct
    : makingType === 'Designer'
      ? config.making_designer_pct
      : config.making_plain_pct

  // Physical Geometry Constants (Indian Standards)
  const getInnerDiameter = (size: number) => 12.67 + (size * 0.33)
  const dUnit = dimensions?.unit || 'mm'

  // Normalize base dimensions to mm for internal high-fidelity math
  const ringThicknessRaw = parseFloat(dimensions?.height || '1.1') || 1.1
  const ringWidthRaw = parseFloat(dimensions?.width || '0.5') || 0.5
  const ringThickness = dUnit === 'cm' ? ringThicknessRaw * 10 : ringThicknessRaw
  const ringWidth = dUnit === 'cm' ? ringWidthRaw * 10 : ringWidthRaw

  // 5. Anchor Logic: Calculate a "Design Premium Multiplier"
  const calculateFormulaPriceRaw = (weight: number): number => {
    const metalCost = weight * metalRate * purityFactor
    const makingCost = metalCost * (makingPct / 100)
    const baseCost = metalCost + makingCost + packagingCost
    const withFee = baseCost * (1 + platformFeePct / 100)
    const withMargin = withFee * (1 + marginPct / 100)
    const withShipping = withMargin + shippingCost
    const withTax = withShipping * (1 + taxPct / 100)
    return withTax
  }

  const rawBasePrice = calculateFormulaPriceRaw(baseWeight)
  const anchorPrice = productBasePrice || config.ring_base_price_size16 || 1999
  const designPremiumMultiplier = anchorPrice / rawBasePrice

  const pricingMap: Record<string, PricingEntry> = {}

  // 6. Generate map
  const computeEntry = (param: number, label: string, isSize: boolean): PricingEntry => {
    let adjWeight: number
    let displayDims: string
    let diameter: string | undefined
    let circumference: string | undefined

    if (pricingType === 'size_based') {
      const baseRefSize = 16
      const baseCirc = getCircumferenceForSize(baseRefSize)
      const currentCirc = getCircumferenceForSize(label)
      const currentInnerD = getDiameterForSize(label)

      // Weight Pairing: even sizes (8, 10, 12...) use the NEXT odd size's circumference
      // Pair (8,9) → both show size 9's weight; (10,11) → size 11's weight; etc.
      const sizeNum = parseInt(label)
      const weightRefLabel = (!isNaN(sizeNum) && sizeNum % 2 === 0)
        ? String(sizeNum + 1)
        : label
      const weightCirc = getCircumferenceForSize(weightRefLabel)

      // Weight anchored to size 16, scaled by the paired circumference
      adjWeight = baseWeight * (weightCirc / baseCirc)

      const wOut = ringWidth
      const dOut = currentInnerD.toFixed(2)
      const cOut = currentCirc.toFixed(2)

      displayDims = `Width: ${wOut}mm, Diameter: ${dOut}mm, Circumference: ${cOut}mm`
      diameter = `${dOut} mm`
      circumference = `${cOut} mm`
    } else if (pricingType === 'length_based') {
      adjWeight = (weightPerUnit ?? baseWeight) * param
      const wOut = dimensions?.width || '0.5'
      displayDims = `${wOut} x ${wOut} x ${param} "${dUnit === 'mm' ? '(inch)' : dUnit}`
    } else {
      adjWeight = baseWeight
      displayDims = dimensions?.width && dimensions.height
        ? `${dimensions.width} x ${dimensions.height} x ${dimensions?.height || '0'} ${dUnit}`
        : 'Standard'
    }

    adjWeight = Math.round(adjWeight * 100) / 100

    const rawFormulaPrice = calculateFormulaPriceRaw(adjWeight)
    let finalPrice = rawFormulaPrice * designPremiumMultiplier

    if (minPriceThreshold && finalPrice < minPriceThreshold) {
      finalPrice = minPriceThreshold
    }

    // Psychological Rounding (X99 format)
    finalPrice = Math.floor(finalPrice / 100) * 100 + 99

    // Final safety: Force anchor price for the configured base size ring
    if (pricingType === 'size_based' && param === baseSize) {
      finalPrice = Math.floor(anchorPrice / 100) * 100 + 99
      if (anchorPrice % 100 === 99) finalPrice = anchorPrice
    }

    // Cost Breakdown
    const mCost = adjWeight * metalRate * purityFactor
    const makCost = mCost * (makingPct / 100)
    const bCost = mCost + makCost + packagingCost

    return {
      price: finalPrice,
      weight: adjWeight,
      dimensions: displayDims,
      width: pricingType === 'size_based' ? `${ringWidth} mm` : undefined,
      diameter,
      circumference,
      metalCost: Math.round(mCost),
      makingCost: Math.round(makCost),
      baseCost: Math.round(bCost),
    }
  }

  if (pricingType === 'size_based') {
    const sizeList = availableSizes.length > 0
      ? availableSizes
      : Array.from({ length: 25 }, (_, i) => String(i + 6))

    sizeList.forEach(sizeStr => {
      const size = parseInt(sizeStr)
      if (!isNaN(size)) {
        pricingMap[sizeStr] = computeEntry(size, sizeStr, true)
      }
    })
  } else if (pricingType === 'length_based') {
    const lengths = [6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]
    lengths.forEach(len => {
      pricingMap[String(len)] = computeEntry(len, `${len}"`, false)
    })
  } else if (pricingType === 'fixed') {
    pricingMap['default'] = computeEntry(0, 'Standard', false)
  }

  return pricingMap
}

export async function getHeroSlides() {
  return unstable_cache(
    async () => {
      const { data, error } = await supabaseServer
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching hero slides:', error)
        return []
      }
      return data || []
    },
    ['hero-slides'],
    { revalidate: 3600, tags: ['hero-slides'] }
  )()
}

// Product Actions
export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabaseServer
        .from('products')
        .select(`
          id, name, description, price, image_url, images, stock, 
          sizes, featured, bestseller, slug, purity, gender, 
          weight_grams, dimensions_width, dimensions_height, 
          dimensions_length, dimensions_unit, video_url, tags, created_at,
          material_type,
          making_type, pricing_type, base_size, base_weight,
          weight_per_unit, packaging_cost_override, platform_fee_pct_override,
          fixed_price_override, is_dynamic_pricing,
          margin_percent_override, min_price_threshold, tax_pct_override,
          categories(slug, name)
        `)
        .ilike('slug', slug)
        .single()
      if (error || !data) return null

      // Cast to any: Supabase infers a strict type, but we attach the computed `dynamicPricingMap`
      const product: any = data

      // === DYNAMIC PRICING ENGINE ===
      // If fixed override set → skip dynamic
      if (product.fixed_price_override) {
        product.dynamicPricingMap = null
        return product
      }

      if (product.is_dynamic_pricing && product.pricing_type && product.pricing_type !== 'none') {
        const effectivePricingType = product.pricing_type
        const effectiveBaseWeight = (product.base_weight || product.weight_grams) ?? 3.5
        const dynamicMap = await getDynamicPricingMap({
          pricingType: effectivePricingType,
          purity: product.purity || '99.99',
          materialType: product.material_type || 'silver',
          baseWeight: effectiveBaseWeight,
          productBasePrice: product.price,
          weightPerUnit: product.weight_per_unit ?? null,
          baseSize: product.base_size ?? 16,
          makingType: product.making_type || 'Plain',
          availableSizes: Array.isArray(product.sizes) ? product.sizes : [],
          packagingCostOverride: product.packaging_cost_override ?? null,
          platformFeePctOverride: product.platform_fee_pct_override ?? null,
          dimensions: {
            width: product.dimensions_width,
            height: product.dimensions_height,
            unit: product.dimensions_unit
          },
          marginPercentOverride: product.margin_percent_override ?? null,
          minPriceThreshold: product.min_price_threshold ?? null,
          taxPctOverride: product.tax_pct_override ?? null
        })
        if (dynamicMap) {
          product.dynamicPricingMap = dynamicMap
        }
      } else {
        // Legacy fallback: auto-detect rings by name/category
        const nameLower = product.name?.toLowerCase() || ''
        const categories = product.categories
        const catSlug = (Array.isArray(categories) ? categories[0]?.slug : categories?.slug) || ''
        const isRing = catSlug.includes('ring') || nameLower.includes('ring')

        if (isRing) {
          const effectiveBaseWeight = (product.base_weight || product.weight_grams) ?? 3.5
          const dynamicMap = await getDynamicPricingMap({
            pricingType: 'size_based',
            purity: product.purity || '99.99',
            materialType: product.material_type || 'silver',
            baseWeight: effectiveBaseWeight,
            productBasePrice: product.price,
            weightPerUnit: null,
            baseSize: product.base_size ?? 16,
            makingType: product.making_type || 'Plain',
            availableSizes: Array.isArray(product.sizes) ? product.sizes : [],
            packagingCostOverride: product.packaging_cost_override ?? null,
            platformFeePctOverride: product.platform_fee_pct_override ?? null,
            dimensions: {
              width: product.dimensions_width,
              height: product.dimensions_height,
              unit: product.dimensions_unit
            },
            marginPercentOverride: product.margin_percent_override ?? null,
            minPriceThreshold: product.min_price_threshold ?? null,
            taxPctOverride: product.tax_pct_override ?? null
          })
          if (dynamicMap) product.dynamicPricingMap = dynamicMap
        }
      }

      return product
    },
    [`product-${slug}`],
    { revalidate: 3600, tags: [`product:${slug}`, 'products'] }
  )()
}

export async function getAdminProducts() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return []

  const { data, error } = await supabaseServer
    .from('products')
    .select('id, name, price, stock, image_url, slug, created_at, categories(name)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function updateProductDetails(productId: string, updates: Partial<ProductData>): Promise<ActionResponse> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const sanitizedUpdates = sanitizeObject(updates)
  try {
    const client = await getAuthClient()

    console.log('DEBUG: Updating product details', { productId, updates: sanitizedUpdates })

    const { data, error } = await client
      .from('products')
      .update(sanitizedUpdates)
      .eq('id', productId)
      .select()

    if (error) {
      console.error('❌ Update Product Details Error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: `${error.message}. ${error.hint || ''}` }
    }

    console.log('✅ Update Product Details Success:', data)
    revalidateTag('products', '')
    return { success: true }
  } catch (err: any) {
    console.error('❌ Update Product Details Crash:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}

export async function deleteProduct(productId: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const client = await getAuthClient()

    // Check role from admin_users
    const { data: { user: authUser } } = await client.auth.getUser()
    if (!authUser) return { success: false, error: 'Unauthorized' }

    const { data: admin } = await client.from('admin_users').select('role').eq('id', authUser.id).single()
    if (!admin || admin.role === 'staff') return { success: false, error: 'Unauthorized. Staff cannot delete products.' }

    // Get product name for logging
    const { data: product } = await client.from('products').select('name').eq('id', productId).single()

    const { error } = await client.from('products').delete().eq('id', productId)
    if (error) return { success: false, error: error.message }

    // Log activity
    const { data: { user } } = await client.auth.getUser()
    if (user) {
      await client.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: `Deleted product: ${product?.name || productId}`,
        entity_type: 'product',
        entity_id: productId,
      })
    }

    revalidateTag('products', '')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete product' }
  }
}


export async function getProductById(id: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabaseServer
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .single()

      if (error) return null
      return data
    },
    [`product-id-${id}`],
    { revalidate: 3600, tags: [`product:${id}`, 'products'] }
  )()
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  if (!categoryId) return [] // Safety guard for products without categories

  return unstable_cache(
    async () => {
      try {
        const { data, error } = await supabaseServer
          .from('products')
          .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug)')
          .eq('category_id', categoryId)
          .neq('id', excludeId)
          .eq('material_type', 'silver')
          .limit(4)

        if (error) {
          console.error('Error fetching related products:', error)
          return []
        }
        return data || []
      } catch (error) {
        console.error('Unexpected error fetching related products:', error)
        return []
      }
    },
    [`related-products-${categoryId}-${excludeId}`],
    { revalidate: 86400, tags: ['products', 'related-products'] }
  )()
}

// ============================================
// CART
// ============================================

export async function getCart() {
  console.log('[DEBUG] getCart: Initiating...')
  const authClient = await getAuthClient()
  const { data: { user }, error: authError } = await authClient.auth.getUser()

  if (authError) {
    console.error('[DEBUG] getCart: Auth error:', authError)
  }

  if (!user) {
    console.warn('[CART] getCart: No user found in session context.')
    return []
  }

  console.log('[DEBUG] getCart: User identified as', user.id, '. Fetching from DB (Admin Bypass)...')

  // HARDENED: Use Admin client to fetch cart items. 
  // This bypasses RLS synchronization issues that often occur in Server Actions/Background tasks.
  const adminClient = createSupabaseAdminClient()
  const { data, error } = await adminClient
    .from('cart')
    .select('id, product_id, quantity, size, products(id, name, price, slug, image_url, stock, categories(id, name, slug))')
    .eq('user_id', user.id)

  if (error) {
    console.error('[DEBUG] getCart: Supabase error:', error)
    return []
  }

  console.log(`[DEBUG] getCart: Found ${data?.length || 0} items for user ${user.id}`)
  if (data && data.length > 0) {
    data.forEach((item, idx) => console.log(`  Item ${idx}:`, item.product_id, 'x', item.quantity))
  }
  return data || []
}

export async function addToCart(productId: string, size?: string, quantity: number = 1) {
  console.log('addToCart: Request received', { productId, size, quantity })
  const client = await getAuthClient()
  const { data: { user } = {}, error: authError } = await client.auth.getUser()

  if (authError) {
    console.error('addToCart: Auth error', authError)
  }

  if (!user) {
    console.warn('addToCart: No user found, add failed')
    return { success: false, error: 'Please login to add items to cart' }
  }

  console.log('addToCart: Adding item for user', user.id)

  // SECURE STOCK CHECK
  const { data: product, error: productError } = await client
    .from('products')
    .select('stock, name')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    console.error('addToCart: Product not found', productId)
    return { success: false, error: 'Product not found' }
  }

  if (product.stock === 0) {
    console.warn(`addToCart: Attempted to add out-of-stock item: ${product.name}`)
    return { success: false, error: 'Product is currently out of stock' }
  }

  // Check if item already in cart
  const { data: existing } = await client
    .from('cart')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('size', size || '')
    .single()

  if (existing) {
    // Update quantity
    const { error } = await client
      .from('cart')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)

    if (error) return { success: false, error: 'Failed to update cart' }
    return { success: true, message: 'Cart updated' }
  }

  const { error } = await client
    .from('cart')
    .insert({ user_id: user.id, product_id: productId, size: size || '', quantity })

  if (error) {
    console.error('Add to cart error:', error)
    return { success: false, error: 'Failed to add to cart' }
  }

  revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true, message: 'Added to cart' }
}

export async function updateCartItem(cartId: string, quantity: number) {
  const client = await getAuthClient()

  if (quantity <= 0) {
    return removeFromCart(cartId)
  }

  const { error } = await client
    .from('cart')
    .update({ quantity })
    .eq('id', cartId)

  if (error) return { success: false, error: 'Failed to update' }
  revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true }
}

export async function removeFromCart(cartId: string) {
  const client = await getAuthClient()

  const { error } = await client
    .from('cart')
    .delete()
    .eq('id', cartId)

  if (error) return { success: false, error: 'Failed to remove' }
  revalidatePath('/cart')
  revalidatePath('/checkout')
  return { success: true }
}

export async function clearCart() {
  const authClient = await getAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    console.warn('[CART] clearCart: No user found.')
    return { success: false }
  }

  // HARDENED: Use Admin client to clear cart items. 
  // This ensures the cart is emptied even if session cookies are unstable during redirect.
  const adminClient = createSupabaseAdminClient()
  const { error } = await adminClient
    .from('cart')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('[CART] Error clearing items:', error)
    return { success: false }
  }

  console.log(`[CART] Success: Cart cleared for user ${user.id}`)
  return { success: true }
}

export async function getCartCount() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return 0

  const { count } = await client
    .from('cart')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return count || 0
}

// ============================================
// SEO & SITEMAP HELPERS
// ============================================

export async function getAllProductSlugs() {
  return unstable_cache(
    async () => {
      const { data } = await supabaseServer
        .from('products')
        .select('slug, updated_at')
      return data || []
    },
    ['all-product-slugs'],
    { revalidate: 86400, tags: ['products', 'sitemap'] }
  )()
}

export async function getAllCategorySlugs() {
  return unstable_cache(
    async () => {
      const { data } = await supabaseServer
        .from('categories')
        .select('slug')
      return data || []
    },
    ['all-category-slugs'],
    { revalidate: 86400, tags: ['categories', 'sitemap'] }
  )()
}

export async function getAllBlogSlugs() {
  return unstable_cache(
    async () => {
      const { data } = await supabaseServer
        .from('blog')
        .select('slug, updated_at')
      return data || []
    },
    ['all-blog-slugs'],
    { revalidate: 86400, tags: ['blog', 'sitemap'] }
  )()
}

// ============================================
// WISHLIST
// ============================================

export async function getWishlist() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client
    .from('wishlist')
    .select('id, product_id, products(id, name, price, slug, image_url, categories(id, name, slug))')
    .eq('user_id', user.id)

  if (error) return []
  return data
}

export async function addToWishlist(productId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please login to add to wishlist' }
  }

  const { error } = await client
    .from('wishlist')
    .insert({ user_id: user.id, product_id: productId })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Already in wishlist' }
    }
    return { success: false, error: 'Failed to add to wishlist' }
  }
  return { success: true, message: 'Added to wishlist' }
}

export async function removeFromWishlist(productId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { success: false }

  const { error } = await client
    .from('wishlist')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) return { success: false }
  return { success: true }
}

export async function isInWishlist(productId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return false

  const { data } = await client
    .from('wishlist')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  return !!data
}

// ============================================
// ADDRESSES (Max 5 per user)
// ============================================

export async function getPincodeDetails(pincode: string) {
  try {
    if (!pincode || pincode.length !== 6) return null

    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, { next: { revalidate: 3600 } })
    const data = await response.json()

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
      const postOffice = data[0].PostOffice[0]
      const stateName = postOffice.State

      // Map state name to code for India (common case)
      let stateCode = ''
      const { State } = await import('country-state-city')
      const states = State.getStatesOfCountry('IN')
      const foundState = states.find(s =>
        s.name.toLowerCase() === stateName.toLowerCase() ||
        s.name.toLowerCase().includes(stateName.toLowerCase())
      )
      if (foundState) stateCode = foundState.isoCode

      return {
        success: true,
        city: postOffice.Block !== 'NA' ? postOffice.Block : postOffice.District,
        district: postOffice.District,
        state: stateName,
        stateCode: stateCode,
        country: 'IN',
        postOffices: data[0].PostOffice
      }
    }
    return null
  } catch (error) {
    console.error('Server Pincode Error:', error)
    return null
  }
}


export async function getAddresses() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  return getCached(`user:addresses:${user.id}`, 120, async () => {
    const { data, error } = await client
      .from('addresses') // Changed from 'user_addresses' to 'addresses' based on original code
      .select('id, label, full_name, phone, street_address, city, state, pincode, is_default') // Changed from '*' to specific columns
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return []
    }
    return data || []
  })
}

export async function addAddress(addressData: {
  label: string
  full_name: string
  phone: string
  street_address: string
  city: string
  state: string
  pincode: string
  is_default?: boolean
}) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please login' }
  }

  // Check address count (max 5)
  const { count } = await client
    .from('addresses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count && count >= 5) {
    return { success: false, error: 'Maximum 5 addresses allowed. Please delete one to add new.' }
  }

  // If this is default, unset other defaults
  if (addressData.is_default) {
    await client
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { error } = await client
    .from('addresses')
    .insert({
      label: addressData.label,
      full_name: addressData.full_name,
      phone: addressData.phone,
      street_address: addressData.street_address,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      is_default: addressData.is_default,
      user_id: user.id
    })

  if (error) {
    console.error('Add address error:', error)
    if (error.message?.includes('pincode')) return { success: false, error: 'Invalid Pincode: Please enter a valid 6-digit delivery code' }
    if (error.code === '23505') return { success: false, error: 'This address is already in your concierge registry' }
    return { success: false, error: `Concierge Error: ${error.message || 'Verification failed'}` }
  }

  revalidatePath('/checkout')
  revalidatePath('/account')
  return { success: true, message: 'Address added' }
}

export async function updateAddress(addressId: string, addressData: {
  label?: string
  full_name?: string
  phone?: string
  street_address?: string
  city?: string
  state?: string
  pincode?: string
  is_default?: boolean
}) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { success: false }

  // If setting as default, unset others
  if (addressData.is_default) {
    await client
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { error } = await client
    .from('addresses')
    .update({
      label: addressData.label,
      full_name: addressData.full_name,
      phone: addressData.phone,
      street_address: addressData.street_address,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      is_default: addressData.is_default,
      updated_at: new Date().toISOString()
    })
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Update address error:', error)
    if (error.code === '23505') return { success: false, error: 'A destination with this name already exists' }
    if (error.message?.includes('violates check constraint')) return { success: false, error: 'Please check all required fields are filled correctly' }
    return { success: false, error: `Refinement Error: ${error.message || 'System busy'}` }
  }

  revalidatePath('/checkout')
  revalidatePath('/account')
  return { success: true }
}

export async function deleteAddress(addressId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { success: false }

  const { error } = await client
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) return { success: false }
  return { success: true }
}

export async function setDefaultAddress(addressId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { success: false }

  // Unset all defaults
  await client
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', user.id)

  // Set new default
  const { error } = await client
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) return { success: false }
  return { success: true }
}

// ============================================
// ORDERS
// ============================================

export async function getOrders() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) return []

  // Cache orders for 30s to reduce load during page refreshes/navigation
  return getCached(`user:orders:${user.id}`, 30, async () => {
    // Lazy Cleanup: Delete pending orders older than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    await client
      .from('orders')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lt('created_at', thirtyMinutesAgo)

    const { data, error } = await client
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            slug
          )
        ),
        shipping_address
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return data || []
  })
}

export async function getOrderById(orderId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  console.log(`[DEBUG] getOrderById: req_id=${orderId}, user_id=${user.id}`);

  // Detect if ID is a UUID or an Order Number
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  const queryField = isUUID ? 'id' : 'order_number';

  console.log(`[DEBUG] queryField selected: ${queryField}`);

  const { data, error } = await client
    .from('orders')
    .select('*, order_items(*, products(name, image_url, weight_grams, purity, slug))')
    .eq(queryField, orderId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error(`[DEBUG] getOrderById Search Error [${queryField}=${orderId}]:`, error.message);
    // If not found by user_id, check if it exists at all (Service role check for diag)
    const adminClient = await createSupabaseAdminClient();
    const { data: exists } = await adminClient.from('orders').select('user_id').eq(queryField, orderId).maybeSingle();
    if (exists) {
      console.log(`[DEBUG] Order EXISTS but user mismatch. Owner: ${exists.user_id}, Req: ${user.id}`);
    } else {
      console.log(`[DEBUG] Order DOES NOT EXIST in database with ${queryField}=${orderId}`);
    }
    return null
  }
  if (!data) return null

  // 30-Minute Expiry Logic for Pending/Failed Orders (Amazon-style)
  if (data.status === 'pending' || data.status === 'payment_failed') {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (new Date(data.created_at) < thirtyMinutesAgo) {
      // SECURITY: Mark as cancelled for audit trail
      await client
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: 'Payment window expired (30-minute timeout)',
          payment_error_reason: 'Timeout: Payment not completed within 30 minutes',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      // Fetch fresh data after update to reflect cancelled status
      const { data: cancelledOrder } = await client
        .from('orders')
        .select('*, order_items(*, products(name, image_url, weight_grams, purity, slug))')
        .eq('id', orderId)
        .single()

      return cancelledOrder || null
    }
  }

  return data
}


export async function createOrder(
  addressId: string,
  paymentMethod: string = 'online',
  options?: {
    giftWrap?: boolean
    giftMessage?: string
    deliveryTimeSlot?: string
    couponCode?: string
    couponDiscount?: number
    honeypot?: string
  }
) {
  console.log('\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  console.log('!!!! CREATE ORDER ACTION TRIGGERED LOCAL !!!!')
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n')
  console.log('[DEBUG] createOrder: Initiating order for address', addressId)

  // LOG ALL COOKIES TO SEE WHAT SERVER SEES
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  console.log('[DEBUG] Cookies reaching Server Action:', allCookies.map(c => c.name).join(', '))

  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    console.error('[DEBUG] createOrder: User not logged in.')
    return { success: false, error: 'Please login' }
  }

  console.log('[DEBUG] createOrder: User is', user.id, '. Checking cart...')

  // --- SECURITY: UUID Validation ---
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(addressId)) {
    return { success: false, error: 'Invalid address selected.' }
  }

  // --- SECURITY: Honeypot ---
  if (options?.honeypot) {
    console.warn('[SECURITY] Bot detected via honeypot for user', user.id)
    return { success: false, error: 'Security validation failed.' }
  }
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || 'unknown'
  const ua = headerList.get('user-agent') || 'unknown'

  // Limit: 5 order attempts per 10 minutes per IP
  const isAllowedIp = await checkActionRateLimit(ip, 'create_order_ip', 5, 10)
  if (!isAllowedIp) {
    return { success: false, error: 'Too many requests from this connection. Please try again later.' }
  }

  // Limit: 3 pending orders per 10 minutes per User (already exists, but we unify it)
  const { count: pendingOrders } = await client
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

  if (pendingOrders !== null && pendingOrders >= 3) {
    return { success: false, error: 'You have too many pending orders. Please complete or cancel them before creating more.' }
  }

  // Get cart items with a short retry to handle race conditions
  let cart = await getCart()

  if (!cart || cart.length === 0) {
    console.warn('[DEBUG] createOrder: Cart empty, attempting immediate retry...')
    // Force a fresh client and bypass cache if possible (though getAuthClient is cached)
    const freshClient = await createSupabaseServerClient()
    const { data: retryCart } = await freshClient
      .from('cart')
      .select('*, products(price, stock)')
      .eq('user_id', user.id)
    cart = retryCart as any
  }

  if (!cart || cart.length === 0) {
    console.error('[DEBUG] createOrder: FAILURE - Cart is definitively empty for user', user.id)
    return { success: false, error: 'Your cart is empty. Please add items before checkout.' }
  }

  console.log('[DEBUG] createOrder: Cart confirmed with', cart.length, 'items. Proceeding...')

  // --- SECURITY: Stock & Idempotency Check ---
  // Create a hash of the cart to prevent duplicate rapid orders
  const cartHash = nodeCrypto.createHash('md5').update(JSON.stringify(cart.map(i => ({ p: i.product_id, q: i.quantity, s: i.size })))).digest('hex')

  const { data: profile } = await client.from('profiles').select('last_order_hash, last_order_at').eq('id', user.id).single()
  if (profile?.last_order_hash === cartHash && profile?.last_order_at && (Date.now() - new Date(profile.last_order_at).getTime() < 120000)) {
    return { success: false, error: 'A similar order was recently placed. Please check your <a href="/account/orders" class="underline decoration-primary/50 hover:text-primary transition-colors">My Orders</a> page.' }
  }

  // Strict Stock Check
  for (const item of cart) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const currentStock = product?.stock || 0
    if (currentStock < item.quantity) {
      return { success: false, error: `Sorry, ${product?.name || 'an item'} is out of stock or quantity not available.` }
    }
  }

  // Get address
  const { data: address } = await client
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!address) {
    return { success: false, error: 'Delivery address not found' }
  }

  // --- SECURITY: Server-Side Price & Coupon Re-validation ---
  // 1. Recalculate subtotal from DB prices (Don't trust client)
  const subtotal = cart.reduce((sum, item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const price = product?.price || 0
    return sum + (price * item.quantity)
  }, 0)

  // 2. Calculate dynamic shipping
  const isCod = paymentMethod === 'cod'
  const shippingResult = await calculateShippingRate(address.pincode, cart, isCod)

  if (!shippingResult.success) {
    const res = shippingResult as any
    console.error('Shipping calculation failed:', res.error)
    return { success: false, error: `Shipping Error: ${res.error}` }
  }

  // Fetch dynamic shipping config from DB
  const shippingConfig = await getSiteSetting('shipping_config', {
    free_shipping_threshold: 50000,
    default_shipping_fee: 90,
    is_enabled: true
  })

  let shipping = 0
  if (shippingConfig.is_enabled) {
    shipping = subtotal >= shippingConfig.free_shipping_threshold ? 0 : (shippingResult.rate || shippingConfig.default_shipping_fee)
  }

  // 3. Re-validate Coupon on Server (CRITICAL)
  let couponDiscount = 0
  if (options?.couponCode) {
    const validation = await validateCoupon(options.couponCode, subtotal, shipping)
    if (validation.valid) {
      couponDiscount = validation.discount || 0
    } else {
      console.warn(`[SECURITY ALERT] Potential coupon tampering detected for user ${user.id}. Coupon: ${options.couponCode}, Error: ${validation.error}`)
      return { success: false, error: `Coupon Error: ${validation.error}` }
    }
  }

  const giftWrapCost = options?.giftWrap ? 199 : 0
  const expectedTotal = subtotal + shipping + giftWrapCost - couponDiscount
  const total = Math.max(0, expectedTotal)

  // SECURITY: Log and Block Price Tampering (if any client-side field was sent)
  if (options?.couponDiscount !== undefined && Math.abs(options.couponDiscount - couponDiscount) > 1) {
    console.error(`[SECURITY ALERT] Coupon discount mismatch for user ${user.id}. Client: ${options.couponDiscount}, Server: ${couponDiscount}`)
    // We proceed with the server's calculated total to maintain integrity, but log the attempt
  }

  // SECURITY: Prevent negative or absurdly high totals (₹0 allowed for free/coupon orders)
  if (total < 0) {
    return { success: false, error: 'Invalid order total calculated.' }
  }
  if (total > 1000000) {
    return { success: false, error: 'Order total exceeds maximum limit. Please contact support.' }
  }

  // Generate order number
  const orderNumber = `AUR${Date.now().toString(36).toUpperCase()}`

  // Create order
  const { data: order, error: orderError } = await client
    .from('orders')
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      subtotal,
      shipping,
      total,
      shipping_address: address,
      payment_method: ['online', 'cod'].includes(paymentMethod) ? paymentMethod : 'online',
      ip_address: ip,
      user_agent: ua,
      status: 'pending',
      gift_wrap: options?.giftWrap || false,
      gift_message: options?.giftMessage ? sanitize(options.giftMessage) : null,
      delivery_time_slot: options?.deliveryTimeSlot || null,
      coupon_code: options?.couponCode || null,
      coupon_discount: couponDiscount,
      payment_status: 'awaiting',
      payment_attempts: 0
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Create order error:', orderError)
    const errDetail = orderError?.message || 'Transaction limit or inventory sync issue'
    return { success: false, error: `Heritage Acquisition Error: ${errDetail}` }
  }

  // Create order items
  const orderItems = cart.map(item => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    return {
      order_id: order.id,
      product_id: item.product_id,
      product_name: product?.name || 'Unknown Product',
      product_image: product?.image_url || '',
      quantity: item.quantity,
      size: item.size,
      price: product?.price || 0
    }
  })

  const { error: itemsError } = await client
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Create order items error:', itemsError)
  }

  // Clear cart only for COD
  if (paymentMethod === 'cod') {
    await clearCart()

    // Increment coupon usage for COD
    if (options?.couponCode) {
      await client.rpc('increment_coupon_usage', { coupon_code: options.couponCode })
    }

    // TRIGGER INVOICE FOR COD
    triggerOrderInvoice(order.id).catch(err => console.error('COD Invoice trigger error:', err))
  }

  // Record order hash for idempotency
  await client.from('profiles').update({
    last_order_hash: cartHash,
    last_order_at: new Date().toISOString()
  }).eq('id', user.id)

  return { success: true, orderId: order.id, orderNumber }
}

export async function cancelOrder(orderId: string, reason: string) {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { success: false, error: 'Authorization required' }
    }

    // Input validation
    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Please provide a cancellation reason' }
    }

    // 1. Fetch order with items to restore stock
    const { data: order, error: fetchError } = await client
      .from('orders')
      .select('id, user_id, status, order_number, total, payment_method, payment_id, order_items(product_id, quantity)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      return { success: false, error: 'Order not found or access denied' }
    }

    // 2. Strict status check: Cannot cancel if shipped, delivered, or packed
    const nonCancellableStatuses = ['shipped', 'delivered', 'packed']
    if (nonCancellableStatuses.includes(order.status)) {
      return {
        success: false,
        error: `Order #${order.order_number} is already ${order.status} and cannot be cancelled. Please contact support for assistance.`
      }
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'Order is already cancelled' }
    }

    const now = new Date().toISOString()

    // 3. Update order status with cancellation details
    const { error: updateError } = await client
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason.trim(),
        payment_status: order.payment_id && order.payment_method !== 'cod' ? 'awaiting_refund' : 'cancelled',
        cancelled_at: now,
        updated_at: now
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Cancel order error:', updateError)
      return { success: false, error: 'Failed to cancel order. Please contact support.' }
    }

    // 4. Restore product stock for each item (prevent inventory leak)
    if (order.order_items && order.order_items.length > 0) {
      for (const item of order.order_items) {
        if (item.product_id) {
          try {
            // Fetch current stock then increment
            const { data: product } = await client
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single()

            if (product) {
              await client
                .from('products')
                .update({ stock: (product.stock || 0) + item.quantity })
                .eq('id', item.product_id)
            }
          } catch (stockErr) {
            // Don't fail the cancellation if stock restore fails — log and continue
            console.error(`Stock restore failed for product ${item.product_id}:`, stockErr)
          }
        }
      }
    }

    // 5. Log activity for audit trail
    try {
      await client.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: `User cancelled order: ${order.order_number}`,
        entity_type: 'order',
        entity_id: orderId,
        details: { reason: reason.trim(), cancelled_at: now }
      })
    } catch (e) {
      console.error('Silent log failure:', e)
    }

    // 6. Notify user via push notification
    try {
      const { notifyOrderStatusChange } = await import('./push-actions')
      await notifyOrderStatusChange(user.id, order.order_number, 'cancelled')
    } catch (e) {
      console.error('Push notification failed for cancellation:', e)
    }

    // 7. Auto-trigger Refund for paid online orders (CCAvenue)
    let refundInitiated = false;
    if (order.payment_id && order.payment_method !== 'cod') {
      try {
        const refundRes = await processCCAvenueRefund(orderId, order.total, `User Cancelled Order #${order.order_number}`);
        if (refundRes.success) {
          refundInitiated = true;
        }
      } catch (e) {
        console.error('[CANCEL REFUND] Auto-refund failed during cancellation:', e);
      }
    }

    // Build refund message based on payment method and initiation status
    const refundMessage = (order.payment_id && order.payment_method !== 'cod')
      ? (refundInitiated
        ? ` Refund of ₹${order.total?.toLocaleString('en-IN')} has been INITIATED to your original payment method.`
        : ` If any amount was debited, ₹${order.total?.toLocaleString('en-IN')} will be refunded to your original payment method within 5-7 business days.`)
      : ''

    return {
      success: true,
      message: `Order #${order.order_number} has been cancelled successfully.${refundMessage}`
    }
  } catch (err: any) {
    console.error('Cancel order crash:', err)
    return { success: false, error: 'Internal server error occurred during cancellation.' }
  }
}

/**
 * Amazon-style Cleanup for Pending Orders
 * Deletes pending orders that haven't been completed within 30 minutes.
 * This can be called by a cron job or on-demand.
 */
export async function cleanupPendingOrders() {
  try {
    const client = await getAuthClient()
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const { data, error } = await client
      .from('orders')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', thirtyMinutesAgo)
      .select('id, order_number')

    if (error) throw error

    if (data && data.length > 0) {
      console.log(`CLEANUP: Deleted ${data.length} expired pending orders:`, data.map(o => o.order_number))
    }

    return { success: true, count: data?.length || 0 }
  } catch (err) {
    console.error('Cleanup pending orders error:', err)
    return { success: false }
  }
}

/**
 * Facilitates "Retry Payment" for pending orders
 */
export async function getOrderPaymentSession(orderId: string) {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false, error: 'Authorization required' }

    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (error || !order) return { success: false, error: 'Order not found' }
    if (order.status !== 'pending') return { success: false, error: 'Only pending orders can be retried' }

    // Check if expired (30 mins)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (new Date(order.created_at) < thirtyMinutesAgo) {
      // Auto-delete on access if expired
      await client.from('orders').delete().eq('id', orderId)
      return { success: false, error: 'Payment window of 30 minutes has expired. Please place a new order.' }
    }

    // Since our system usually creates a session during createOrder,
    // we'll return the the data needed for the client to initiate the payment again
    // OR return a direct payment URL if applicable.

    return {
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total: order.total
      }
    }
  } catch (err: any) {
    return { success: false, error: 'Failed to retrieve payment session' }
  }
}




// ============================================
// PROFILE
// ============================================

export async function getProfile() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  return getCached(`user:profile:${user.id}`, 60, async () => { // Cache for 60 seconds
    const { data, error } = await client
      .from('profiles')
      .select('id, full_name, phone_number, avatar_url')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return { ...data, email: user.email }
  })
}

export async function updateProfile(profileData: {
  full_name?: string
  phone_number?: string
}) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { success: false }

  const { error } = await client
    .from('profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { success: false, error: 'Failed to update profile' }
  return { success: true }
}

// ============================================
// NEWSLETTER & CONTACT (Existing)
// ============================================

export async function subscribeNewsletter(email: string) {
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || 'unknown'

  const isAllowed = await checkActionRateLimit(ip, 'newsletter', 3, 60) // 3 attempts per hour
  if (!isAllowed) return { success: false, error: 'Too many attempts. Please try again later.' }
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  try {
    const client = await getAuthClient()
    const { error } = await client
      .from('newsletter_subscribers')
      .insert([{ email, created_at: new Date().toISOString() }])

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'You are already subscribed!' }
      }
      return { success: false, error: `Subscription Error: ${error.message}` }
    }

    return { success: true, message: 'Thank you for subscribing to AURERXA!' }
  } catch (err: any) {
    console.error('Subscribe error:', err)
    return { success: false, error: `System Error: ${err.message || 'Please try again.'}` }
  }
}

export async function submitCustomOrder(formData: any) {
  const clientId = await getClientIdentifier()
  const isAllowed = await checkActionRateLimit(clientId, 'custom_order', 3, 60)
  if (!isAllowed) return { success: false, error: 'Too many requests. Please try again later.' }

  const validated = CustomOrderSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: 'Invalid data: ' + validated.error.errors[0].message }
  }

  const sanitizedData = sanitizeObject(validated.data)

  try {
    const client = await getAuthClient()
    const { error } = await client
      .from('custom_orders')
      .insert([{
        ...sanitizedData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Submit custom order error:', error)
      return { success: false, error: `Order Error: ${error.message}` }
    }

    return { success: true, message: 'Your custom jewelry consultation request has been received. Our artisans will reach out shortly.' }
  } catch (err: any) {
    console.error('Custom order error:', err)
    return { success: false, error: `System Error: ${err.message || 'Failed to submit order.'}` }
  }
}


// ============================================
// BULK / WHOLESALE ORDERS
// ============================================

export async function submitBulkOrder(formData: any): Promise<ActionResponse> {
  const clientId = await getClientIdentifier()
  const isAllowed = await checkActionRateLimit(clientId, 'submit_bulk_order', 2, 60) // 2 inquires per hour
  if (!isAllowed) return { success: false, error: 'Too many inquiries. Please try again later.' }

  const validated = BulkOrderSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: 'Invalid inquiry: ' + validated.error.errors[0].message }
  }

  const { businessName, contactName, email, phone, gstNumber, message, items } = validated.data
  const sanitizedMessage = sanitize(message || '')

  try {
    // Try to get authenticated user (optional - guests can also submit)
    let userId: string | null = null
    try {
      const client = await getAuthClient()
      const { data: { user } } = await client.auth.getUser()
      userId = user?.id || null
    } catch { /* Guest submission */ }

    // Insert bulk order
    const { data: bulkOrder, error: orderError } = await supabaseServer
      .from('bulk_orders')
      .insert({
        user_id: userId,
        business_name: businessName.trim(),
        contact_name: contactName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        gst_number: gstNumber?.trim() || null,
        message: message?.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError || !bulkOrder) {
      console.error('Bulk order insert error:', orderError)
      return { success: false, error: `Failed to submit inquiry: ${orderError?.message || 'Unknown error'}` }
    }

    // Insert bulk order items
    const bulkItems = items.map((item: any) => ({
      bulk_order_id: bulkOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage || '',
      retail_price: item.retailPrice,
      quantity: item.quantity,
      created_at: new Date().toISOString(),
    }))

    const { error: itemsError } = await supabaseServer
      .from('bulk_order_items')
      .insert(bulkItems)

    if (itemsError) {
      console.error('Bulk order items insert error:', itemsError)
    }

    return {
      success: true,
      data: { bulkOrderId: bulkOrder.id },
      message: 'Your bulk order inquiry has been submitted. Our team will contact you within 24 hours with wholesale pricing.'
    }
  } catch (err: any) {
    console.error('Bulk order error:', err)
    return { success: false, error: `System Error: ${err.message || 'Failed to submit bulk order.'}` }
  }
}

export async function submitContact(formData: any) {
  const clientId = await getClientIdentifier()
  const isAllowed = await checkActionRateLimit(clientId, 'contact_form', 3, 60) // 3 attempts per hour
  if (!isAllowed) return { success: false, error: 'Too many messages sent. Please wait or call us directly.' }

  const validated = ContactSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: 'Invalid data: ' + validated.error.errors[0].message }
  }

  const sanitized = sanitizeObject(validated.data)

  try {
    const client = await getAuthClient()
    const { error } = await client
      .from('contact_messages')
      .insert([{ ...sanitized, created_at: new Date().toISOString() }])

    if (error) throw error

    return { success: true, message: 'Thank you for your message. We will get back to you soon.' }
  } catch (err) {
    console.error('Contact error:', err)
    return { success: false, error: 'Failed to send message.' }
  }
}

// ============================================
// SEARCH
// ============================================



export async function forceSyncGoldRates() {
  const result = await syncLiveGoldRates();
  if (result.success) {
    // @ts-ignore - Handle varying revalidateTag signatures in newer Next.js versions
    revalidateTag('gold-rates');
  }
  return result;
}

export async function updateGoldRate(purity: string, rate: number) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }
  return _upsertGoldRate(purity, rate)
}

// Internal function used by syncLiveGoldRates — uses service role to bypass RLS
// since it's a server-side automated process
async function _upsertGoldRate(purity: string, rate: number) {
  const { createClient } = await import('@supabase/supabase-js')
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await serviceClient
    .from('gold_rates')
    .upsert({ purity, rate, updated_at: new Date().toISOString() }, { onConflict: 'purity' })

  if (error) {
    console.error(`[DB ERROR] Error updating gold rate for ${purity}:`, error)
    return { success: false, error: error.message }
  }

  console.log(`[DB] Updated ${purity} to ${rate}`)
  return { success: true }
}

/**
 * Automate Multi-Metal Rate Synchronization
 * Uses GoldAPI.io (Free Tier) to fetch live Indian market rates for Gold, Silver, and Platinum
 */
export async function syncLiveGoldRates() {
  const apiKey = process.env.GOLD_API_KEY

  // Calibration factors for local market (Mumbai/Nashik)
  const goldMult = parseFloat(process.env.GOLD_PRICE_MULTIPLIER || '1.0')
  const silverMult = parseFloat(process.env.SILVER_PRICE_MULTIPLIER || '1.0')
  const platinumMult = parseFloat(process.env.PLATINUM_PRICE_MULTIPLIER || '1.0')

  // Separate Markups
  const goldMarkup = parseFloat(process.env.GOLD_LOCAL_MARKUP_PERCENT || '5.0')
  const silverMarkup = parseFloat(process.env.SILVER_LOCAL_MARKUP_PERCENT || '3.0')
  const platinumMarkup = parseFloat(process.env.PLATINUM_LOCAL_MARKUP_PERCENT || '2.0')

  const goldFactor = (1 + (goldMarkup / 100)) * goldMult
  const silverFactor = (1 + (silverMarkup / 100)) * silverMult
  const platinumFactor = (1 + (platinumMarkup / 100)) * platinumMult

  if (!apiKey || apiKey === 'YOUR_GOLD_API_KEY') {
    return { success: false, error: 'Gold API Key not configured' }
  }

  try {
    const results: Record<string, number> = {}

    // 1. Fetch Gold (XAU)
    const goldRes = await fetch('https://www.goldapi.io/api/XAU/INR', {
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (goldRes.ok) {
      const data = await goldRes.json()
      if (data.error && data.error.includes('quota')) {
        console.error('[SYNC ERROR] GoldAPI Quota Exceeded')
        return { success: false, error: 'API Quota Exceeded' }
      }
      const price24K = data.price_gram_24k
      if (price24K) {
        // Calibrate to local market
        const calibratedPrice = price24K * goldFactor

        // All standard gold carats with their purity fractions
        const goldCarats: Record<string, number> = {
          '24K': 1.0,
          '22K': 22 / 24,
          '21K': 21 / 24,
          '20K': 20 / 24,
          '18K': 18 / 24,
          '14K': 14 / 24,
          '10K': 10 / 24,
          '9K': 9 / 24,
        }

        for (const [carat, factor] of Object.entries(goldCarats)) {
          const rate = Math.round(calibratedPrice * factor)
          await _upsertGoldRate(carat, rate)
          results[carat] = rate
        }
      }
    } else {
      console.error(`[API ERROR] Gold Fetch Failed: ${goldRes.status}`)
    }

    // 2. Fetch Silver (XAG)
    const silverRes = await fetch('https://www.goldapi.io/api/XAG/INR', {
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 }
    })
    if (silverRes.ok) {
      const data = await silverRes.ok ? await silverRes.json() : null
      if (data && data.error && data.error.includes('quota')) {
        console.error('[SYNC ERROR] Silver Sync Aborted: Quota Exceeded')
      } else if (data && data.price_gram_24k) {
        // Calibrate to local market
        const calibratedPrice = data.price_gram_24k * silverFactor
        console.log(`[SYNC DEBUG] Silver Calibrated Base: ${calibratedPrice}`)

        // Silver purities
        const silverPurities: Record<string, number> = {
          'Silver 999': 1.0,
          'Silver 99.99': 0.9999,
          'Silver 925': 0.925,
        }
        for (const [label, factor] of Object.entries(silverPurities)) {
          const rate = Math.round(calibratedPrice * factor)
          await _upsertGoldRate(label, rate)
          results[label] = rate
        }
      }
    } else {
      console.error(`[API ERROR] Silver Fetch Failed: ${silverRes.status}`)
    }

    // 3. Fetch Platinum (XPT)
    const platinumRes = await fetch('https://www.goldapi.io/api/XPT/INR', {
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 }
    })
    if (platinumRes.ok) {
      const data = await platinumRes.json()
      if (data.error && data.error.includes('quota')) {
        console.error('[SYNC ERROR] Platinum Sync Aborted: Quota Exceeded')
      } else if (data.price_gram_24k) {
        // Calibrate to local market
        const calibratedPrice = data.price_gram_24k * platinumFactor
        console.log(`[SYNC DEBUG] Platinum Calibrated Base: ${calibratedPrice}`)

        const platinumPurities: Record<string, number> = {
          'Platinum 950': 0.950,
          'Platinum 900': 0.900,
          'Platinum 850': 0.850,
        }
        for (const [label, factor] of Object.entries(platinumPurities)) {
          const rate = Math.round(calibratedPrice * factor)
          await _upsertGoldRate(label, rate)
          results[label] = rate
        }
      }
    } else {
      console.error(`[API ERROR] Platinum Fetch Failed: ${platinumRes.status}`)
    }

    console.log('[SYNC SUCCESS] Rates updated for all metals.')

    // Revalidate the cache tag to ensure the UI sees the new rates
    revalidateTag('gold-rates', '')

    return { success: true, rates: results }
  } catch (err: any) {
    console.error('Multi-Metal Sync Error:', err)
    return { success: false, error: err.message }
  }
}

export async function searchProducts(query: string) {
  const clientId = await getClientIdentifier()
  const isAllowed = await checkActionRateLimit(clientId, 'search', 100, 10) // 100 searches per 10 mins
  if (!isAllowed) return []

  try {
    if (!query || query.length < 2) return []

    // 1. Try Optimized TextSearch first (Fastest for large catalogs)
    // This utilizes the GIN functional index if defined on name/description.
    const { data: ftsResults, error: ftsError } = await supabaseServer
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, tags, categories(id, name, slug)')
      .eq('material_type', 'silver')
      .textSearch('name', query, {
        type: 'websearch',
        config: 'english'
      })
      .limit(12)

    if (!ftsError && ftsResults && ftsResults.length > 0) {
      return ftsResults
    }

    // 2. Fallback to ILIKE if FTS fails or yields no results
    const { data: ilikeResults, error: ilikeError } = await supabaseServer
      .from('products')
      .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug)')
      .eq('material_type', 'silver')
      .or(`name.ilike.%${query}%,tags.cs.{${query}}`)

    if (ilikeError) {
      console.error('Fallback search error:', ilikeError)
      return []
    }
    return ilikeResults || []
  } catch (err) {
    console.error('Search crash:', err)
    return []
  }
}

export async function getSearchSuggestions(query: string) {
  try {
    if (!query || query.length < 2) return { categories: [], tags: [], materials: [] }

    const t = query.toLowerCase()

    // 1. Match against Material Types
    const materialMatches = [
      { label: 'Real Gold', value: 'real_gold', keywords: ['gold', 'purity', '22k', '24k', '18k', 'solid gold'] },
      { label: 'Gold Plated', value: 'gold_plated', keywords: ['plated', 'polishing', 'cover gold', 'guarantee'] },
      { label: 'Fashion / Bentex', value: 'bentex', keywords: ['bentex', 'fashion', 'imitation', 'artificial'] },
      { label: 'Silver', value: 'silver', keywords: ['silver', '925', 'sterling'] },
      { label: 'Diamond', value: 'diamond', keywords: ['diamond', 'ad', 'cz', 'stone'] }
    ].filter(m => m.keywords.some(k => k.includes(t) || t.includes(k)))

    // 2. Fetch matching categories
    const { data: categories } = await supabaseServer
      .from('categories')
      .select('name, slug')
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
      .limit(5)

    // 3. Fetch matching tags from products
    const { data: products, error } = await supabaseServer
      .from('products')
      .select('name, tags, material_type, categories(name, slug)')
      .eq('material_type', 'silver')
      .limit(50)

    const matchingTags = Array.from(new Set(
      (products || [])
        .flatMap(p => p.tags)
        .filter(tag => tag.toLowerCase().includes(t))
    )).slice(0, 5)

    return {
      categories: categories || [],
      tags: matchingTags,
      materials: materialMatches.map(m => ({ label: m.label, value: m.value }))
    }
  } catch (err) {
    console.error('Search suggestions error:', err)
    return { categories: [], tags: [], materials: [] }
  }
}

// ============================================
// COUPONS
// ============================================

export async function validateCoupon(code: string, orderTotal: number, shippingCharge: number = 0) {
  try {
    if (!code) return { valid: false, error: 'Please enter a coupon code' }

    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { valid: false, error: 'Authorization required for coupon validation' }
    }

    const { data, error } = await supabaseServer
      .from('coupons')
      .select('*')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { valid: false, error: 'Invalid coupon code' }
    }

    // Check validity dates
    const now = new Date()
    if (data.valid_from && new Date(data.valid_from) > now) {
      return { valid: false, error: 'Coupon is not yet active' }
    }
    if (data.valid_until && new Date(data.valid_until) < now) {
      return { valid: false, error: 'Coupon has expired' }
    }

    // 1. Check Global usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' }
    }

    // 2. Check Per-User usage limit (Best Practice: Use 'orders' table to verify actual usage)
    if (data.limit_per_user && data.limit_per_user > 0) {
      const { count, error: countError } = await client
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .ilike('coupon_code', code.trim())
        .not('status', 'eq', 'cancelled') // Don't count cancelled orders

      if (!countError && count !== null && count >= data.limit_per_user) {
        return {
          valid: false,
          error: data.limit_per_user === 1
            ? 'This coupon can only be used once per customer'
            : `You have reached the usage limit (${data.limit_per_user}) for this coupon`
        }
      }
    }

    // Check minimum order value (applies to subtotal)
    if (data.min_order_value && orderTotal < data.min_order_value) {
      return { valid: false, error: `Minimum subtotal of ₹${data.min_order_value.toLocaleString('en-IN')} required for this coupon.` }
    }

    // Calculate discount
    let discount = 0
    let shippingDiscount = 0

    // 1. Handle Free Shipping
    if (data.is_free_shipping) {
      shippingDiscount = shippingCharge
    }

    // 2. Calculate Base Discount
    const basis = data.applies_to_shipping ? (orderTotal + shippingCharge) : orderTotal

    if (data.discount_type === 'percentage') {
      discount = (basis * data.discount_value) / 100
      if (data.max_discount && discount > data.max_discount) {
        discount = data.max_discount
      }
    } else {
      discount = data.discount_value
    }

    const totalDiscount = Math.floor(discount + shippingDiscount)

    return {
      valid: true,
      discount: totalDiscount,
      baseDiscount: discount,
      shippingDiscount: shippingDiscount,
      coupon: data,
      message: shippingDiscount > 0 && discount > 0
        ? `₹${discount} off + Free Shipping!`
        : shippingDiscount > 0
          ? 'Free Shipping applied!'
          : `₹${discount.toLocaleString('en-IN')} discount applied!`
    }
  } catch (err) {
    console.error('Coupon validation error:', err)
    return { valid: false, error: 'Failed to validate coupon' }
  }
}

// ============================================
// BLOG
// ============================================

export async function getBlogPosts(category?: string) {
  try {
    let query = supabaseServer
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Blog fetch error:', err)
    return []
  }
}

// Product detail fetch (Moving to consolidated section)

export async function getBlogPost(slug: string) {
  try {
    const { data, error } = await supabaseServer
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Blog post fetch error:', err)
    return null
  }
}

// ============================================
// STORES
// ============================================

export async function getStores() {
  try {
    const { data, error } = await supabaseServer
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('city')

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Stores fetch error:', err)
    return []
  }
}

// ============================================
// AUTH ACTIONS
// ============================================

// ============================================
// AUTH ACTIONS
// ============================================

export async function signOut() {
  const client = await getAuthClient()
  await client.auth.signOut()
  revalidateTag('user-profile', '')
  redirect('/')
}

// ============================================
// FILTERS (for collections page)
// ============================================

// ============================================
// FILTERS (for collections page)
// ============================================

export async function getFilteredProducts(options: {
  category?: string
  sub_category?: string
  tag?: string
  occasion?: string
  material?: string
  material_type?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  search?: string
  gender?: string
  type?: string
}) {
  return unstable_cache(
    async () => {
      try {
        let query = supabaseServer
          .from('products')
          .select('id, name, price, image_url, images, slug, weight_grams, material_type, purity, stock, tags, categories(id, name, slug)')
          .eq('material_type', 'silver')

        // Category filter — in-memory cache eliminates repeated DB lookups for same slug
        const categorySlug = options.category || options.material
        if (categorySlug && categorySlug !== 'all') {
          const ck = `cat:${categorySlug}`
          let catId = _cacheGet<string>(ck)
          if (!catId) {
            const { data: cat } = await supabaseServer.from('categories').select('id').eq('slug', categorySlug).maybeSingle()
            if (cat) { _cacheSet(ck, cat.id); catId = cat.id }
          }
          if (catId) query = query.eq('category_id', catId)
        }

        // Sub-category filter — in-memory cache
        if (options.sub_category && options.sub_category !== 'all') {
          const sk = `subcat:${options.sub_category}`
          let subCatId = _cacheGet<string>(sk)
          if (!subCatId) {
            // Skip subcat if it would cause error (handled gracefully below)
            const { data: subCat } = await supabaseServer.from('sub_categories').select('id').eq('slug', options.sub_category).maybeSingle()
            if (subCat) { _cacheSet(sk, subCat.id); subCatId = subCat.id }
          }
          if (subCatId) query = query.eq('sub_category_id', subCatId)
        }

        // Tag filter (Theme Collections — robust with case variations + fallback)
        if (options.tag) {
          const t = options.tag.toLowerCase()
          const dehyphenated = t.replace(/-/g, ' ')
          const words = t.split(/[- ]/)
          const lastWord = words[words.length - 1]
          const singularLast = lastWord.endsWith('s') ? lastWord.slice(0, -1) : lastWord

          const baseVariations = Array.from(new Set([
            t,
            dehyphenated,
            t.replace(/ /g, '-'),
            lastWord,
            singularLast,
            lastWord === 'ring' ? 'rings' : null,
            lastWord === 'earring' ? 'earrings' : null,
            lastWord === 'necklace' ? 'necklaces' : null,
            t === 'bride' ? 'bridal' : null,
            t === 'bridal' ? 'bride' : null,
            t === 'modern' || t === 'mordern' ? 'modern' : null,
            t === 'modern' || t === 'mordern' ? 'mordern' : null,
          ].filter(Boolean) as string[]))

          // Auto-generate case variations for ALL bases
          const allVariations: string[] = []
          baseVariations.forEach(v => {
            allVariations.push(v)                                                    // lowercase
            allVariations.push(v.toUpperCase())                                      // UPPERCASE
            allVariations.push(v.charAt(0).toUpperCase() + v.slice(1))              // Title case first word
            allVariations.push(v.split(/[\s-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))  // Title Case All Words
            allVariations.push(v.split(/[\s-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-'))  // Title-Case-Hyphenated
          })

          const orFilter = Array.from(new Set(allVariations))
            .map(v => `tags.cs.{"${v}"}`)
            .join(',')
          // Also match against name/description as fallback
          query = query.or(`${orFilter},name.ilike.%${dehyphenated}%`)
        }

        // Gender filter
        if (options.gender && options.gender !== 'all') {
          query = query.ilike('gender', options.gender)
        }

        // Type filter (Holistic match for legacy or flexible links)
        if (options.type && options.type !== 'all') {
          const t = options.type.toLowerCase()
          const words = t.split(/[- ]/)
          const lastWord = words[words.length - 1]
          const singularLast = lastWord.endsWith('s') ? lastWord.slice(0, -1) : lastWord

          // 1. Try to match as a category
          const { data: cat } = await supabaseServer.from('categories').select('id').eq('slug', t).maybeSingle()
          if (cat) {
            query = query.eq('category_id', cat.id)
          } else {
            // 2. Try to match as a sub-category
            const { data: subCat } = await supabaseServer.from('sub_categories').select('id').eq('slug', t).maybeSingle()
            if (subCat) {
              query = query.eq('sub_category_id', subCat.id)
            } else {
              // 3. Try to match as a tag or in the name
              query = query.or(`tags.cs.{"${t}"},tags.cs.{"${lastWord}"},tags.cs.{"${singularLast}"},name.ilike.%${singularLast}%`)
            }
          }
        }

        // Occasion filter (Treated as Tags with robust variations + name/description fallback)
        if (options.occasion && options.occasion !== 'all') {
          const o = options.occasion.toLowerCase()
          // Handle hyphenated slugs: "date-night" → "date night", "day-out" → "day out"
          const dehyphenated = o.replace(/-/g, ' ')

          // Generate all possible variations
          const baseVariations = Array.from(new Set([
            o,                                              // original: "date-night"
            dehyphenated,                                   // dehyphenated: "date night"
            o.replace(/ /g, '-'),                           // hyphenated: "date-night"
            // Common aliases
            o === 'daily' ? 'daily wear' : null,
            o === 'daily wear' || o === 'daily-wear' ? 'daily' : null,
            o === 'wedding' ? 'bridal' : null,
            o === 'bridal' ? 'wedding' : null,
            o === 'office' ? 'office wear' : null,
            o === 'office wear' || o === 'office-wear' ? 'office' : null,
            o === 'party' ? 'party wear' : null,
            o === 'party wear' || o === 'party-wear' ? 'party' : null,
            dehyphenated !== o ? dehyphenated.replace(/ /g, '-') : null,
          ].filter(Boolean) as string[]))

          // Auto-generate case variations for ALL bases
          const allVariations: string[] = []
          baseVariations.forEach(v => {
            allVariations.push(v)                                                    // lowercase
            allVariations.push(v.toUpperCase())                                      // UPPERCASE
            allVariations.push(v.charAt(0).toUpperCase() + v.slice(1))              // Title case first word
            allVariations.push(v.split(/[\s-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))  // Title Case All Words
            allVariations.push(v.split(/[\s-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-'))  // Title-Case-Hyphenated
          })

          const uniqueVariations = Array.from(new Set(allVariations))
          const occasionOrFilter = uniqueVariations
            .map(v => `tags.cs.{"${v}"}`)
            .join(',')

          // Also match against name and description as fallback
          query = query.or(`${occasionOrFilter},name.ilike.%${dehyphenated}%,description.ilike.%${dehyphenated}%`)
        }

        // Material Type filter
        if (options.material_type && options.material_type !== 'all') {
          query = query.eq('material_type', options.material_type)
        }

        // Price filters
        if (options.minPrice) query = query.gte('price', options.minPrice)
        if (options.maxPrice) query = query.lte('price', options.maxPrice)

        // Search
        if (options.search) {
          query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
        }

        // Sorting
        switch (options.sortBy) {
          case 'price-low':
          case 'price_asc':
            query = query.order('price', { ascending: true })
            break
          case 'price-high':
          case 'price_desc':
            query = query.order('price', { ascending: false })
            break
          default:
            query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
      } catch (err) {
        console.error('Filter products error:', err)
        return []
      }
    },
    ['filtered-products', JSON.stringify(options)],
    { revalidate: 3600, tags: ['products'] }
  )()
}

// ============================================
// CUSTOMER SUPPORT (TICKETS & REPAIRS)
// ============================================

export async function createTicket(formData: { subject: string; message: string; urgency: string }) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please login to raise a ticket' }
  }

  const { error } = await client
    .from('tickets')
    .insert({
      user_id: user.id,
      subject: formData.subject,
      message: formData.message,
      urgency: formData.urgency
    })

  if (error) {
    console.error('Create ticket error:', error)
    return { success: false, error: 'Failed to submit ticket' }
  }
  return { success: true, message: 'Ticket raised successfully' }
}

export async function getTickets() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function createRepairRequest(formData: { productName: string; orderNumber?: string; issue: string }) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please login to request repair' }
  }

  const { error } = await client
    .from('repairs')
    .insert({
      user_id: user.id,
      product_name: formData.productName,
      order_number: formData.orderNumber || null,
      issue_description: formData.issue
    })

  if (error) {
    console.error('Create repair error:', error)
    return { success: false, error: 'Failed to submit repair request' }
  }
  return { success: true, message: 'Repair request submitted' }
}

export async function getRepairs() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client
    .from('repairs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ============================================
// RETURN / EXCHANGE REQUEST (Best Practice: linked to specific order)
// ============================================

export async function requestReturn(orderId: string, formData: {
  reason: string
  issueType: 'defective' | 'wrong_product' | 'damaged_in_transit'
  description: string
  videoLink?: string
  evidencePhotos?: string[]
}) {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { success: false, error: 'Authorization required' }
    }

    // Input validation
    if (!formData.reason?.trim() || !formData.description?.trim()) {
      return { success: false, error: 'Please fill in all required fields' }
    }

    // Strict issue type validation — only 3 valid reasons accepted
    const validIssueTypes = ['defective', 'wrong_product', 'damaged_in_transit']
    if (!formData.issueType || !validIssueTypes.includes(formData.issueType)) {
      return { success: false, error: 'Invalid issue type. Returns are only accepted for: Defective Product, Wrong Product, or Damaged in Transit.' }
    }

    // 1. Fetch order and verify ownership + status
    const { data: order, error: fetchError } = await client
      .from('orders')
      .select('id, user_id, status, order_number, total, created_at, updated_at, order_items(product_name, product_image, quantity, price)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      return { success: false, error: 'Order not found or access denied' }
    }

    // 2. Only delivered orders can be returned
    if (order.status !== 'delivered') {
      return {
        success: false,
        error: `Returns are only available for delivered orders. Your order is currently "${order.status}".`
      }
    }

    // 3. Check 24-hour return window (from delivery, approximated by updated_at)
    const deliveredAt = new Date(order.updated_at).getTime()
    const now = Date.now()
    const hoursElapsed = (now - deliveredAt) / (1000 * 60 * 60)

    if (hoursElapsed > 24) {
      return {
        success: false,
        error: 'The 24-hour return window has expired for this order. Please contact support for further assistance.'
      }
    }

    // 4. Check for duplicate return request (prevent spam)
    const { data: existingTickets } = await client
      .from('tickets')
      .select('id')
      .eq('user_id', user.id)
      .ilike('subject', `%${order.order_number}%`)
      .in('status', ['open', 'in_progress'])

    if (existingTickets && existingTickets.length > 0) {
      return {
        success: false,
        error: 'A return request already exists for this order. Please check your support tickets for updates.'
      }
    }

    // 5. Create a return record in the new return_requests table
    const { data: returnReq, error: returnError } = await client
      .from('return_requests')
      .insert({
        order_id: orderId,
        user_id: user.id,
        issue_type: formData.issueType,
        reason: formData.reason.trim(),
        description: formData.description.trim(),
        status: 'requested',
        video_link: formData.videoLink,
        evidence_photos: formData.evidencePhotos || []
      })
      .select('id')
      .single()

    if (returnError) {
      console.error('Return Request table error:', returnError)
      // Fallback to ticket if table doesn't exist yet (to avoid breaking during transition)
      await client
        .from('tickets')
        .insert({
          user_id: user.id,
          subject: `Return Request - Order #${order.order_number}`,
          message: `Issue Type: ${formData.issueType}\nReason: ${formData.reason.trim()}\nDescription: ${formData.description.trim()}`,
          status: 'open',
          urgency: 'high'
        })
      return { success: true, message: 'Return request submitted via support ticket.' }
    }

    // Best Practice: Sync Order Status to return_requested
    await client
      .from('orders')
      .update({
        status: 'return_requested',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    return {
      success: true,
      message: 'Return request submitted successfully. Our team will review it within 24 hours.',
      requestId: returnReq.id
    }
  } catch (error: any) {
    console.error('Request Return Error:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again later.' }
  }
}

export async function getReturnByOrderId(orderId: string) {
  try {
    const client = await getAuthClient()
    const { data, error } = await client
      .from('return_requests')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching return request:', error)
    return null
  }
}

export async function getReturnRequests() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client
    .from('return_requests')
    .select('*, orders(order_number, total, created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ============================================
// DELIVERY AVAILABILITY (Delhivery API Integration)
// ============================================

// Metro city pincode prefixes (first 2 digits) - for delivery time estimation
const METRO_PINCODES = [
  '40', // Mumbai (Fastest from Sangamner)
  '41', // Pune (Fastest from Sangamner)
  '11', // Delhi
  '56', // Bangalore
  '60', // Chennai
  '70', // Kolkata
  '50', // Hyderabad
]

// Tier-2 city pincode prefixes
const TIER2_PINCODES = [
  '30', '31', '32', '33', '34', // Rajasthan
  '22', '23', '24', '25', '26', // UP
  '38', '39', // Gujarat
  '42', '43', '44', // Maharashtra
  '45', '46', // MP
  '52', '53', // Andhra Pradesh
  '62', '63', '64', // Tamil Nadu
  '80', // Karnataka
  '14', '15', '16', // Punjab/Haryana
]

// Delhivery API response type
interface DelhiveryPincodeResponse {
  delivery_codes: Array<{
    postal_code: {
      pin: string
      pre_paid: string // 'Y' or 'N'
      cash: string // 'Y' or 'N'
      pickup: string
      repl: string
      cod: string // 'Y' or 'N'
      is_oda: string // 'Y' or 'N' (Out of Delivery Area)
      sort_code: string
      max_weight: string
      max_amount: string
      district: string
      state_code: string
    }
  }>
}

export async function checkDeliveryAvailability(pincode: string) {
  try {
    // Validate pincode format (6 digits, Indian pincode)
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return {
        success: false,
        error: 'Please enter a valid 6-digit pincode'
      }
    }

    const prefix = pincode.substring(0, 2)
    const firstDigit = pincode.charAt(0)

    // Check if pincode is valid (Indian pincodes start with 1-8)
    if (!['1', '2', '3', '4', '5', '6', '7', '8'].includes(firstDigit)) {
      return {
        success: false,
        error: 'Invalid pincode. Please enter a valid Indian pincode.'
      }
    }

    // Fallback location mapping with 3-digit precision
    const getRegionName = (pin: string) => {
      const p2 = pin.substring(0, 2)
      const p3 = pin.substring(0, 3)
      const mappings: Record<string, string> = {
        '422': 'Sangamner', '411': 'Pune', '400': 'Mumbai', '560': 'Bangalore',
        '600': 'Chennai', '700': 'Kolkata', '500': 'Hyderabad', '380': 'Ahmedabad',
        '395': 'Surat', '110': 'Delhi', '122': 'Gurgaon', '201': 'Noida',
        '302': 'Jaipur', '520': 'Vijayawada', '440': 'Nagpur',
        '452': 'Indore', '462': 'Bhopal', '641': 'Coimbatore', '682': 'Kochi'
      }

      if (mappings[p3]) return mappings[p3]

      const p2Mappings: Record<string, string> = {
        '11': 'Delhi', '40': 'Mumbai', '41': 'Pune', '56': 'Bangalore',
        '60': 'Chennai', '70': 'Kolkata', '50': 'Hyderabad', '38': 'Ahmedabad',
        '39': 'Surat', '42': 'Nashik/Sangamner', '12': 'Gurgaon', '20': 'Noida'
      }
      return p2Mappings[p2] || ''
    }

    // Try Delhivery API first
    let delhiveryData: DelhiveryPincodeResponse | null = null
    let codAvailable = true
    let prepaidAvailable = true
    let isODA = false // Out of Delivery Area
    let district = ''
    let state = ''
    let locality = ''

    const delhiveryToken = process.env.DELHIVERY_API_TOKEN
    const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

    if (delhiveryToken) {
      try {
        const response = await fetch(
          `${delhiveryUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Token ${delhiveryToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          delhiveryData = await response.json()

          if (delhiveryData?.delivery_codes && delhiveryData.delivery_codes.length > 0) {
            const pincodeInfo = delhiveryData.delivery_codes[0].postal_code
            codAvailable = pincodeInfo.cod === 'Y' || pincodeInfo.cash === 'Y'
            prepaidAvailable = pincodeInfo.pre_paid === 'Y'
            isODA = pincodeInfo.is_oda === 'Y'
            district = pincodeInfo.district
            state = pincodeInfo.state_code
            // Some Delhivery responses might have city or locality in other fields, 
            // but we'll prioritize the dedicated pincode API for the "exact" name.

            // If pincode not serviceable at all
            if (!prepaidAvailable && !codAvailable) {
              return {
                success: true,
                available: false,
                pincode,
                error: 'Sorry, we do not deliver to this pincode currently.'
              }
            }
          } else {
            // Pincode not found in Delhivery system
            return {
              success: true,
              available: false,
              pincode,
              error: 'Sorry, we do not deliver to this pincode currently.'
            }
          }
        }
      } catch (apiError) {
        console.warn('Delhivery API error, using fallback:', apiError)
        // Continue with fallback logic
      }
    }

    // Secondary fallback for exact locality name
    if (!locality || !district) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, { next: { revalidate: 3600 } })
        const data = await res.json()
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0]
          // Prioritize "Block" or "Taluka" as it usually represents the main city/town
          locality = postOffice.Block || postOffice.Name
          district = postOffice.District
          state = postOffice.State
        }
      } catch (e) {
        console.warn('Public Pincode API fallback failed')
      }
    }

    // Determine the most specific display name
    let locationDisplay = 'India'
    if (locality && district) {
      if (locality.toLowerCase() === district.toLowerCase()) {
        locationDisplay = district + (state ? `, ${state}` : '')
      } else {
        locationDisplay = `${locality}, ${district}`
      }
    } else if (district) {
      locationDisplay = district + (state ? `, ${state}` : '')
    } else {
      const fallbackRegion = getRegionName(pincode)
      locationDisplay = fallbackRegion || 'India'
    }

    // Determine delivery zone and time
    let deliveryDays: { min: number; max: number }
    let zone: 'metro' | 'tier2' | 'other'
    let expressAvailable = false

    if (isODA) {
      // Out of Delivery Area - longer delivery time
      deliveryDays = { min: 10, max: 15 }
      zone = 'other'
    } else if (prefix === '42') {
      // Very Local (Sangamner/Ahmednagar/Nashik)
      deliveryDays = { min: 1, max: 2 }
      zone = 'metro'
      expressAvailable = true
    } else if (METRO_PINCODES.includes(prefix)) {
      // Mumbai/Pune are very close to Sangamner
      const isVeryClose = ['40', '41'].includes(prefix)
      deliveryDays = isVeryClose ? { min: 2, max: 3 } : { min: 3, max: 5 }
      zone = 'metro'
      expressAvailable = true
    } else if (TIER2_PINCODES.some(p => prefix.startsWith(p.substring(0, 2)) || p === prefix)) {
      deliveryDays = { min: 5, max: 7 }
      zone = 'tier2'
    } else {
      deliveryDays = { min: 7, max: 10 }
      zone = 'other'
    }

    // Calculate estimated delivery dates
    const today = new Date()
    const minDate = new Date(today)
    const maxDate = new Date(today)

    // Add business days (skip Sundays)
    let minDaysAdded = 0
    let maxDaysAdded = 0

    while (minDaysAdded < deliveryDays.min) {
      minDate.setDate(minDate.getDate() + 1)
      if (minDate.getDay() !== 0) {
        minDaysAdded++
      }
    }

    while (maxDaysAdded < deliveryDays.max) {
      maxDate.setDate(maxDate.getDate() + 1)
      if (maxDate.getDay() !== 0) {
        maxDaysAdded++
      }
    }

    // Format dates
    const formatDate = (date: Date) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
    }

    return {
      success: true,
      available: true,
      pincode,
      zone,
      deliveryDays,
      estimatedDelivery: {
        from: formatDate(minDate),
        to: formatDate(maxDate),
        fromDate: minDate.toISOString(),
        toDate: maxDate.toISOString()
      },
      expressAvailable,
      codAvailable,
      prepaidAvailable,
      isODA,
      location: locationDisplay.toUpperCase(),
      city: locality || district,
      district: district,
      state: state,
      message: isODA
        ? 'Extended Delivery Area (Remote)'
        : zone === 'metro'
          ? 'Express Delivery Available'
          : zone === 'tier2'
            ? 'Standard Delivery'
            : 'Extended Delivery Area'
    }

  } catch (err) {
    console.error('Delivery check error:', err)
    return {
      success: false,
      error: 'Unable to check delivery availability. Please try again.'
    }
  }
}

// ============================================
// SHIPPING RATE CALCULATION (Custom Business Rates)
// ============================================

const SHIPPING_RATES_CHART = {
  'A': { base500g: 30, addl500g: 29, base2kg: 92, addl1kg_2to4: 27, base5kg: 159, addl1kg_5to9: 22, base10kg: 226, addl1kg_10plus: 19 },
  'B': { base500g: 33, addl500g: 32, base2kg: 102, addl1kg_2to4: 30, base5kg: 170, addl1kg_5to9: 24, base10kg: 245, addl1kg_10plus: 21 },
  'C': { base500g: 44, addl500g: 42, base2kg: 141, addl1kg_2to4: 34, base5kg: 186, addl1kg_5to9: 31, base10kg: 311, addl1kg_10plus: 28 },
  'D': { base500g: 52, addl500g: 49, base2kg: 166, addl1kg_2to4: 38, base5kg: 212, addl1kg_5to9: 35, base10kg: 359, addl1kg_10plus: 33 },
  'E': { base500g: 64, addl500g: 61, base2kg: 195, addl1kg_2to4: 44, base5kg: 239, addl1kg_5to9: 41, base10kg: 419, addl1kg_10plus: 40 },
  'F': { base500g: 75, addl500g: 72, base2kg: 230, addl1kg_2to4: 52, base5kg: 270, addl1kg_5to9: 49, base10kg: 484, addl1kg_10plus: 46 }
}

const CITY_SURCHARGES: Record<string, number[]> = {
  'Ahmedabad': [2.5, 5, 5, 10, 10, 25],
  'Gandhinagar': [2.5, 5, 5, 10, 10, 25],
  'Bangalore': [2.5, 5, 5, 10, 10, 25],
  'Hoskote': [2.5, 5, 5, 10, 10, 25],
  'Hosur': [2.5, 5, 5, 10, 10, 25],
  'Chandigarh': [2.5, 5, 5, 10, 10, 25],
  'Mohali': [2.5, 5, 5, 10, 10, 25],
  'Rajpura': [2.5, 5, 5, 10, 10, 25],
  'Zirakpur': [2.5, 5, 5, 10, 10, 25],
  'Chennai': [2.5, 5, 5, 10, 10, 25],
  'Sriperumbudur': [2.5, 5, 5, 10, 10, 25],
  'Bahadurgarh': [2.5, 5, 5, 10, 10, 25],
  'Delhi': [2.5, 5, 5, 10, 10, 25],
  'Faridabad': [2.5, 5, 5, 10, 10, 25],
  'Ghaziabad': [2.5, 5, 5, 10, 10, 25],
  'Gurgaon': [2.5, 5, 5, 10, 10, 25],
  'Meerut': [2.5, 5, 5, 10, 10, 25],
  'Noida': [2.5, 5, 5, 10, 10, 25],
  'Panipat': [2.5, 5, 5, 10, 10, 25],
  'Rewari': [2.5, 5, 5, 10, 10, 25],
  'Rohtak': [2.5, 5, 5, 10, 10, 25],
  'Sonipat': [2.5, 5, 5, 10, 10, 25],
  'Hyderabad': [2.5, 5, 5, 10, 10, 25],
  'Kolkata': [2.5, 5, 5, 10, 10, 25],
  'Mumbai': [2.5, 5, 5, 10, 10, 25],
  'Navi mumbai': [2.5, 5, 5, 10, 10, 25],
  'Thane': [2.5, 5, 5, 10, 10, 25],
  'Pune': [2.5, 5, 5, 10, 10, 25],
  'Goa': [2.5, 5, 5, 10, 10, 25]
}

function getZone(pincode: string): keyof typeof SHIPPING_RATES_CHART {
  const prefix = pincode.substring(0, 2)
  const fullPrefix = pincode.substring(0, 3)

  if (prefix === '42') return 'A' // Intra-city / Local (Sangamner Region)

  // Zone B: Maharashtra State
  if (['40', '41', '43', '44'].includes(prefix)) return 'B'

  // Zone C: South & West Metros
  if (['56', '60', '50', '38', '39'].includes(prefix)) return 'C'

  // Zone D: North & East Metros (Delhi etc)
  if (['11', '70', '20', '12'].includes(prefix)) return 'D'

  // Zone E: NE & Special
  if (['78', '79', '18', '19'].includes(prefix)) return 'E'

  // Zone F: Very Remote
  if (fullPrefix === '744') return 'F' // Andaman

  return 'D' // Default to National
}

function getCitySurcharge(pincode: string, weightKg: number): number {
  // Ideally we need a pincode to city mapping. For now, we'll use common city prefixes.
  const prefix = pincode.substring(0, 2)
  let city = 'Other'

  if (prefix === '38' || prefix === '39') city = 'Ahmedabad' // Gujarat
  if (prefix === '56') city = 'Bangalore'
  if (prefix === '60') city = 'Chennai'
  if (prefix === '11') city = 'Delhi'
  if (prefix === '50') city = 'Hyderabad'
  if (prefix === '70') city = 'Kolkata'
  if (prefix === '40') city = 'Mumbai'
  if (prefix === '41') city = 'Pune'

  const surcharges = CITY_SURCHARGES[city] || [0, 0, 0, 0, 0, 0]

  if (weightKg <= 0.5) return surcharges[0]
  if (weightKg <= 1) return surcharges[1]
  if (weightKg <= 2) return surcharges[2]
  if (weightKg <= 3) return surcharges[3]
  if (weightKg <= 5) return surcharges[4]
  return surcharges[5]
}

export async function calculateShippingRate(pincode: string, cartItems: any[], isCod: boolean = false) {
  try {
    // Fetch dynamic shipping config
    const shippingConfig = await getSiteSetting('shipping_config', {
      free_shipping_threshold: 50000,
      default_shipping_fee: 90,
      is_enabled: true
    })

    if (!shippingConfig.is_enabled) {
      return { success: true, rate: 0, isLive: false }
    }

    const originPincode = '422605'
    const delhiveryToken = process.env.DELHIVERY_API_TOKEN
    const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

    // Calculate total weight and volumetric weight
    let totalWeightGrams = 0
    let totalVolWeightGrams = 0
    let cartTotal = 0

    cartItems.forEach(item => {
      const product = item.products
      const weight = product.weight_grams || 200 // Gold items are light
      const w = parseFloat(product.dimensions_width) || 10 // cm
      const h = parseFloat(product.dimensions_height) || 5
      const l = parseFloat(product.dimensions_length) || 10

      const volWeightGrams = (w * h * l / 5000) * 1000

      totalWeightGrams += (weight * item.quantity)
      totalVolWeightGrams += (volWeightGrams * item.quantity)
      cartTotal += (product.price * item.quantity)
    })

    const finalWeightGrams = Math.max(totalWeightGrams, totalVolWeightGrams)
    const weightKg = finalWeightGrams / 1000

    // 1. Try Delhivery Price API First
    if (delhiveryToken) {
      try {
        // Price calculation using Delhivery's KRS (Kilometer-Rate-Slab) logic
        const response = await fetch(
          `${delhiveryUrl}/api/krs/price.json?origin=${originPincode}&destination=${pincode}&weight=${finalWeightGrams}&ss=R`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Token ${delhiveryToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data && data.total_amount) {
            let rate = parseFloat(data.total_amount)

            // Add COD Fee if applicable
            if (isCod) {
              const codFee = Math.max(40, cartTotal * 0.02)
              rate += codFee
            }

            // Apply GST (18%) if not already included in total_amount
            const finalRate = Math.round(rate * 1.18)

            return {
              success: true,
              rate: Math.max(90, finalRate), // Min ₹90 as per user policy
              isLive: true
            }
          }
        }
      } catch (apiError) {
        console.warn('Delhivery Rate API call failed, falling back to internal logic:', apiError)
      }
    }

    // 2. Fallback to Internal Logic (Sangamner Centric)
    const zone = getZone(pincode)
    const rates = SHIPPING_RATES_CHART[zone]

    let baseRate = 0

    // Rate Calculation Logic based on weight slabs
    if (weightKg <= 1.5) {
      baseRate = rates.base500g
      if (weightKg > 0.5) {
        const extraUnits500g = Math.ceil((weightKg - 0.5) / 0.5)
        baseRate += (extraUnits500g * rates.addl500g)
      }
    } else if (weightKg <= 4.5) {
      baseRate = rates.base2kg
      if (weightKg > 2) {
        const extraKg = Math.ceil(weightKg - 2)
        baseRate += (extraKg * rates.addl1kg_2to4)
      }
    } else if (weightKg <= 9.5) {
      baseRate = rates.base5kg
      if (weightKg > 5) {
        const extraKg = Math.ceil(weightKg - 5)
        baseRate += (extraKg * rates.addl1kg_5to9)
      }
    } else {
      baseRate = rates.base10kg
      if (weightKg > 10) {
        const extraKg = Math.ceil(weightKg - 10)
        baseRate += (extraKg * rates.addl1kg_10plus)
      }
    }

    const surcharge = getCitySurcharge(pincode, weightKg)
    let totalShipping = baseRate + surcharge

    if (isCod) {
      const codFee = Math.max(40, cartTotal * 0.02)
      totalShipping += codFee
    }

    const totalWithGST = totalShipping * 1.18

    return {
      success: true,
      rate: Math.max(90, Math.round(totalWithGST)),
      isLive: false // Indicates manual calculation
    }

  } catch (error) {
    console.warn('Shipping calculation failed, using fallback:', error)
    return { success: true, rate: 90, isLive: false }
  }
}

export async function createDelhiveryShipment(orderId: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const client = await getAuthClient()
    const delhiveryToken = process.env.DELHIVERY_API_TOKEN
    const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

    if (!delhiveryToken) {
      return { success: false, error: 'Delhivery token not configured' }
    }

    // 1. Fetch Order and items
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) return { success: false, error: 'Order not found' }
    if (order.tracking_number) return { success: true, trackingNumber: order.tracking_number, message: 'Shipment already exists' }

    const addr = order.shipping_address
    const items = order.order_items

    // Prepare Delhivery Payload
    const payload = {
      shipments: [
        {
          add: addr.street_address,
          address_type: "home",
          phone: addr.phone,
          payment_mode: order.payment_method === 'cod' ? "COD" : "Pre-paid",
          name: addr.full_name || addr.name,
          pincode: addr.pincode,
          order: order.order_number,
          cod_amount: order.payment_method === 'cod' ? order.total : 0,
          total_amount: order.total,
          quantity: items.reduce((s: number, i: any) => s + i.quantity, 0),
          waybill: "", // Let Delhivery generate
          client: "AURERXA",
          seller_name: "AURERXA JEWELS",
          shipping_mode: "Surface" // Default
        }
      ],
      pickup_location: {
        name: "AURERXA SANGAMNER",
        add: "AURERXA JEWELS, Main Road, Sangamner",
        phone: "9123456789", // Replace with real business phone
        pincode: "422605"
      }
    }

    const response = await fetch(`${delhiveryUrl}/api/cgm/packages/json/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${delhiveryToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success && data.packages && data.packages.length > 0) {
      const pkg = data.packages[0]
      const waybill = pkg.waybill

      // Update Order with tracking number
      await client
        .from('orders')
        .update({
          tracking_number: waybill,
          status: 'packed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      return { success: true, trackingNumber: waybill }
    }

    return { success: false, error: data.rmk || 'Shipment creation failed' }

  } catch (error: any) {
    console.error('Delhivery Shipment Error:', error)
    return { success: false, error: error.message }
  }
}

export async function requestDelhiveryPickup(pickupDate?: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const delhiveryToken = process.env.DELHIVERY_API_TOKEN
    const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

    if (!delhiveryToken) return { success: false, error: 'Unauthorized' }

    const payload = {
      pickup_time: "14:00:00",
      pickup_date: pickupDate || new Date().toISOString().split('T')[0],
      pickup_location: "AURERXA SANGAMNER",
      expected_package_count: 1 // Default
    }

    const response = await fetch(`${delhiveryUrl}/api/fm/request/pickup/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${delhiveryToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    return { success: data.incoming_pickup_id ? true : false, data }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getOrderTracking(trackingNumber: string) {
  try {
    const delhiveryToken = process.env.DELHIVERY_API_TOKEN
    const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

    if (!delhiveryToken) {
      return { success: false, error: 'Tracking service unavailable' }
    }

    // Call Delhivery Tracking API
    const response = await fetch(
      `${delhiveryUrl}/api/v1/packages/json/?waybill=${trackingNumber}&token=${delhiveryToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        next: { revalidate: 60 } // Cache for 1 minute
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch tracking info')
    }

    const data = await response.json()

    if (data && data.ShipmentData && data.ShipmentData.length > 0) {
      const shipment = data.ShipmentData[0].Shipment
      return {
        success: true,
        status: shipment.Status.Status,
        location: shipment.Status.StatusLocation,
        timestamp: shipment.Status.StatusDateTime,
        scans: shipment.Scans.map((scan: any) => ({
          status: scan.ScanDetail.Scan,
          location: scan.ScanDetail.ScannedLocation,
          timestamp: scan.ScanDetail.ScanDateTime,
          instructions: scan.ScanDetail.Instructions
        })),
        estimatedDelivery: shipment.ExpectedDeliveryDate
      }
    }

    return { success: false, error: 'Tracking information not found' }

  } catch (error) {
    console.error('Tracking API error:', error)
    return { success: false, error: 'Unable to fetch tracking updates' }
  }
}

export async function createDelhiveryReturnShipment(returnId: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const client = await getAuthClient()
    const delhiveryToken = process.env.DELHIVERY_API_TOKEN
    const delhiveryUrl = process.env.DELHIVERY_API_URL || 'https://staging-express.delhivery.com'

    if (!delhiveryToken) {
      return { success: false, error: 'Delhivery token not configured' }
    }

    // 1. Fetch Return Request and Order
    const { data: returnReq, error: reqError } = await client
      .from('return_requests')
      .select('*, orders(*, order_items(*))')
      .eq('id', returnId)
      .single()

    if (reqError || !returnReq) return { success: false, error: 'Return request not found' }
    if (returnReq.tracking_number) return { success: true, trackingNumber: returnReq.tracking_number, message: 'Return shipment already exists' }

    const order = returnReq.orders
    const addr = order.shipping_address

    // REVERSE PICKUP PAYLOAD
    // Pickup: Customer Address
    // Delivery (ShipTo): AURERXA Warehouse
    const payload = {
      shipments: [
        {
          add: "AURERXA JEWELS, Main Road, Sangamner", // Destination (Warehouse)
          address_type: "office",
          phone: "9123456789",
          payment_mode: "Pre-paid", // Reverse is usually pre-paid by company
          name: "AURERXA RETURNS",
          pincode: "422605",
          order: `RET-${order.order_number}`,
          total_amount: 0,
          quantity: order.order_items.reduce((s: number, i: any) => s + i.quantity, 0),
          waybill: "",
          client: "AURERXA",
          seller_name: addr.full_name || addr.name, // Source is Customer
          shipping_mode: "Surface"
        }
      ],
      pickup_location: {
        name: addr.full_name || addr.name,
        add: addr.street_address,
        phone: addr.phone,
        pincode: addr.pincode
      }
    }

    const response = await fetch(`${delhiveryUrl}/api/cgm/packages/json/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${delhiveryToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('Delhivery return API non-JSON response:', responseText.slice(0, 300))
      return { success: false, error: 'Delhivery API returned an invalid response. Pickup can be scheduled manually.' }
    }

    if (data.success && data.packages && data.packages.length > 0) {
      const pkg = data.packages[0]
      const waybill = pkg.waybill

      // Update Return Request with tracking number
      await client
        .from('return_requests')
        .update({
          tracking_number: waybill,
          status: 'pickup_scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', returnId)

      return { success: true, trackingNumber: waybill }
    }

    return { success: false, error: data.rmk || 'Return shipment creation failed' }

  } catch (error: any) {
    console.error('Delhivery Return Shipment Error:', error)
    return { success: false, error: error.message }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized: Admin access required' }

  const client = await getAuthClient()

  // Get order details first
  const { data: order, error: fetchError } = await client
    .from('orders')
    .select('user_id, order_number')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) return { success: false, error: 'Order not found' }

  const { error } = await client
    .from('orders')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'cancelled' && { payment_status: 'awaiting_refund' }),
      ...(status === 'returned' && { return_status: 'completed' })
    })
    .eq('id', orderId)

  if (error) return { success: false, error: error.message }

  // Trigger push notification to the customer
  try {
    const { notifyOrderStatusChange } = await import('./push-actions')
    await notifyOrderStatusChange(order.user_id, order.order_number, status)
  } catch (e) {
    console.error('Push notification failed for order update:', e)
  }

  return { success: true }
}

export async function broadcastNotification(title: string, body: string, url: string) {
  try {
    const { broadcastOffer } = await import('./push-actions')
    return await broadcastOffer(title, body, url)
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ============================================
// PAYMENT GATEWAY CONFIGURATION
// ============================================


// Payment Gateway Configuration
export type PaymentResult =
  | { success: true; gateway: 'ccavenue'; encRequest: string; accessCode: string; merchantId: string; actionUrl: string }
  | { success: true; gateway: 'razorpay'; keyId: string; amount: number; currency: string; razorpayOrderId: string; productName: string; customer: { name: string; email: string; contact: string }; mode?: string; paymentSessionId?: never }
  | { success: true; gateway: 'free'; orderId: string; keyId?: never; amount?: never; paymentSessionId?: never }
  | { success: false; error: string; gateway?: never; keyId?: never };

export async function getPaymentGatewayConfig() {
  return {
    gateway: 'ccavenue' as const,
    accessCode: process.env.CCAVENUE_ACCESS_CODE,
    enableCod: process.env.ENABLE_COD === 'true'
  }
}

export async function initiatePayment(orderId: string): Promise<PaymentResult> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  const queryField = isUUID ? 'id' : 'order_number';

  // Single auth client + single order fetch for both zero-amount and payment paths
  const client = await getAuthClient()
  const [{ data: { user } }, { data: order }] = await Promise.all([
    client.auth.getUser(),
    client
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq(queryField, orderId)
      .single()
  ])

  if (!order) return { success: false, error: 'Order not found' }

  // --- ZERO-AMOUNT ORDER: Auto-confirm without hitting payment gateway ---
  try {
    if (Number(order.total) <= 0) {
      console.log('initiatePayment: Zero-amount order detected, auto-confirming...')

      await client.from('orders').update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'Free (100% Discount)',
        payment_id: `FREE_${Date.now()}`,
        updated_at: new Date().toISOString()
      }).eq('id', order.id)

      if (order.coupon_code) {
        await client.rpc('increment_coupon_usage', { coupon_code: order.coupon_code })
      }

      await clearCart()
      triggerOrderInvoice(order.id).catch(err => console.error('Free Order Invoice trigger error:', err))

      return { success: true, gateway: 'free', orderId: order.id }
    }
  } catch (e) {
    console.error('Zero-amount check failed, proceeding to gateway:', e)
  }

  if (!process.env.CCAVENUE_MERCHANT_ID || !process.env.CCAVENUE_WORKING_KEY || !process.env.CCAVENUE_ACCESS_CODE) {
    console.error('initiatePayment: CCAvenue configuration is missing');
    return { success: false, error: 'Payment gateway configuration error' };
  }

  try {
    const { encrypt } = await import('@/lib/ccavenue')

    // Prepare CCAvenue Request String
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/ccavenue/callback`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/ccavenue/callback`

    const merchantId = process.env.CCAVENUE_MERCHANT_ID
    const accessCode = process.env.CCAVENUE_ACCESS_CODE
    const workingKey = process.env.CCAVENUE_WORKING_KEY

    const billingAddress = order.shipping_address?.street_address || order.shipping_address?.address_line1 || 'N/A'
    const billingCity = order.shipping_address?.city || 'N/A'
    const billingState = order.shipping_address?.state || 'N/A'
    const billingZip = order.shipping_address?.pincode || 'N/A'
    const billingCountry = 'India'

    const requestParams = [
      `merchant_id=${merchantId}`,
      `order_id=${order.order_number}`,
      `currency=INR`,
      `amount=${order.total.toFixed(2)}`,
      `redirect_url=${encodeURIComponent(redirectUrl)}`,
      `cancel_url=${encodeURIComponent(cancelUrl)}`,
      `language=EN`,
      `billing_name=${encodeURIComponent(order.shipping_address?.full_name || order.billing_name || 'Customer')}`,
      `billing_address=${encodeURIComponent(billingAddress)}`,
      `billing_city=${encodeURIComponent(billingCity)}`,
      `billing_state=${encodeURIComponent(billingState)}`,
      `billing_zip=${encodeURIComponent(billingZip)}`,
      `billing_country=${encodeURIComponent(billingCountry)}`,
      `billing_email=${encodeURIComponent(order.billing_email || user?.email || '')}`,
      `billing_tel=${encodeURIComponent((order.customer_phone || order.shipping_address?.phone || '').replace(/\D/g, ''))}`,
      `merchant_param1=${order.id}`,
      `promo_code=${order.coupon_code || ''}`,
      `integration_type=iframe_normal`
    ].join('&')

    const encRequest = encrypt(requestParams, workingKey)
    console.log('initiatePayment: Request encrypted successfully')

    return {
      success: true,
      gateway: 'ccavenue',
      encRequest,
      accessCode,
      merchantId,
      actionUrl: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
    }
  } catch (err: any) {
    console.error('Payment initiation error details:', err)
    return { success: false, error: `Failed to connect to payment gateway: ${err.message || 'Unknown error'}` }
  }
}
export async function verifyPayment(orderId: string, params?: any) {
  console.log('verifyPayment: Checking status for order:', orderId)

  const client = await getAuthClient()
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
  const queryField = isUUID ? 'id' : 'order_number';

  // 1. Check if already confirmed
  const { data: order } = await client
    .from('orders')
    .select('status, payment_status, payment_method')
    .eq(queryField, orderId)
    .single()

  if (order?.status === 'confirmed') {
    return { success: true, alreadyConfirmed: true }
  }

  // 2. If it's a Razorpay-specific verification request
  if (params && params.razorpay_payment_id) {
    const result = await verifyRazorpayPayment(orderId, params)
    if (result.success) {
      await clearCart()
    }
    return result
  }

  // 3. For others, if it was expected to be successful but isn't yet confirmed
  return { success: false, error: 'Payment not yet confirmed. Please wait a moment or contact support if the amount was debited.' }
}

/**
 * Server Action to process a refund via CCAvenue
 * Can be triggered automatically by system or manually by admin
 */
export async function processCCAvenueRefund(orderId: string, amount: number, reason: string): Promise<ActionResponse> {
  console.log(`[REFUND] Initiating refund for Order ${orderId}. Amount: ${amount}, Reason: ${reason}`);

  try {
    const adminClient = await createSupabaseAdminClient();

    // 1. Fetch order details to get tracing_id/payment_id
    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('payment_id, total, order_number, status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: 'Order not found for refund.' };
    }

    if (!order.payment_id) {
      return { success: false, error: 'No payment ID found for this order. Refund cannot be processed via API.' };
    }

    // 2. Call CCAvenue Refund API
    // We use a unique refund reference
    const refundRefNo = `REF-${order.order_number}-${Date.now()}`;
    const refundResult = await refundOrder(order.payment_id, amount.toString(), refundRefNo);

    console.log(`[REFUND] CCAvenue Response:`, JSON.stringify(refundResult));

    // 3. Handle CCAvenue specific response
    // Typical response: { status: '0', message: 'Success' } or similar
    // Note: CCAvenue response structure varies, so we check for status '0' or "Success" text
    const isSuccess = refundResult.status === '0' ||
      refundResult.refund_status === 'Success' ||
      (typeof refundResult === 'string' && refundResult.includes('Success'));

    if (isSuccess) {
      // 4. Update Database
      await adminClient.from('orders').update({
        payment_status: 'refunded',
        status: order.status === 'cancelled' ? 'cancelled' : 'refunded',
        notes: `Refund Processed: ₹${amount} (${reason}). Ref: ${refundRefNo}`
      }).eq('id', orderId);

      // If there's an associated return request, update it too
      await adminClient.from('returns').update({
        status: 'refunded',
        updated_at: new Date().toISOString()
      }).eq('order_number', order.order_number);

      return { success: true, data: refundResult };
    } else {
      const errorMsg = refundResult.message || refundResult.error || 'CCAvenue Refund Failed';

      // Update order notes with failure
      await adminClient.from('orders').update({
        notes: `Refund FAILED: ${errorMsg} (Ref: ${refundRefNo})`
      }).eq('id', orderId);

      return { success: false, error: errorMsg };
    }
  } catch (err: any) {
    console.error(`[REFUND ERROR]`, err);
    return { success: false, error: err.message || 'Internal server error during refund.' };
  }
}

export async function initiateRazorpayPayment(orderId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: order, error: orderError } = await client
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (orderError || !order) {
    return { success: false, error: 'Order not found' }
  }

  try {
    const rpOrder = await createRazorpayOrder(
      order.total,
      'INR',
      order.order_number
    )

    // Increment attempts and store gateway order ID
    await client
      .from('orders')
      .update({
        payment_gateway_order_id: rpOrder.id,
        payment_attempts: (order.payment_attempts || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    return {
      success: true,
      gateway: 'razorpay',
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      razorpayOrderId: rpOrder.id,
      productName: 'AURERXA Masterpiece',
      customer: {
        name: order.shipping_address?.full_name || 'Customer',
        email: user.email || order.shipping_address?.email || '',
        contact: order.shipping_address?.phone || ''
      }
    }
  } catch (err: any) {
    console.error('Razorpay Error:', err)
    return { success: false, error: err.message }
  }
}

export async function verifyRazorpayPayment(orderId: string, params: { razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }) {
  const client = await getAuthClient()

  // SECURITY: Idempotency Check
  const { data: existingOrder } = await client
    .from('orders')
    .select('status, payment_status')
    .eq('id', orderId)
    .single()

  if (existingOrder?.status === 'confirmed' || existingOrder?.payment_status === 'paid') {
    return { success: true, message: 'Payment already verified' }
  }

  try {
    const result = await verifyRazorpayPaymentLib(
      params.razorpay_payment_id,
      params.razorpay_order_id,
      params.razorpay_signature
    )

    if (result.isValid) {
      let detailedMethod = result.method || 'online'
      if (detailedMethod === 'upi') detailedMethod = `UPI`
      else if (detailedMethod === 'card') detailedMethod = `${result.card_network} Card`
      else if (detailedMethod === 'netbanking') detailedMethod = 'Net Banking'

      // Security: verify amount (Razorpay signature only verifies order integrity, not final amount in some edge cases)
      const { data: order } = await client.from('orders').select('total, order_number').eq('id', orderId).single()
      if (order && result.amount && Math.abs(Number(result.amount) / 100 - Number(order.total)) > 1) {
        console.error(`SECURITY ALERT: Amount mismatch in Razorpay verify for ${order.order_number}`)
        await client.from('orders').update({ payment_status: 'flagged_mismatch' }).eq('id', orderId)
        return { success: false, error: 'Payment amount mismatch detected.' }
      }

      const { error: updateError } = await client
        .from('orders')
        .update({
          status: 'confirmed',
          payment_id: params.razorpay_payment_id,
          payment_status: 'paid',
          payment_method: detailedMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (!updateError) {
        // TRIGGER INVOICE FOR ONLINE PAYMENT
        triggerOrderInvoice(orderId).catch(err => console.error('Online Invoice trigger error:', err))

        // Increment coupon usage if applied
        const { data: orderWithCoupon } = await client.from('orders').select('coupon_code').eq('id', orderId).single()
        if (orderWithCoupon?.coupon_code) {
          await client.rpc('increment_coupon_usage', { coupon_code: orderWithCoupon.coupon_code })
        }
      }

      if (updateError) throw updateError
      return { success: true }
    } else {
      return { success: false, error: 'Payment verification failed' }
    }
  } catch (err: any) {
    console.error('Verification Error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Fetches order details and sends the invoice email.
 * This runs asynchronously to not block the main request.
 */
export async function triggerOrderInvoice(orderId: string) {
  console.log('>>> [DEBUG] triggerOrderInvoice called for:', orderId);
  logDiagnostic('INVOICE', `Triggering for order ID: ${orderId}`)
  try {
    const client = createSupabaseAdminClient()

    // 1. Fetch Order with items
    logDiagnostic('INVOICE', 'Fetching order details...')
    const { data: order, error } = await client
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .single()

    if (error || !order) {
      logDiagnostic('INVOICE_ERROR', 'Order fetch failed', error)
      return
    }

    logDiagnostic('INVOICE', `Order found: ${order.order_number}. Preparing payload...`)

    // 2. Fetch customer details if name is missing
    let name = order.shipping_address?.full_name || 'Valued Customer'
    let email = ''

    const { data: profile } = await client
      .from('profiles')
      .select('email, full_name')
      .eq('id', order.user_id)
      .single()

    if (profile) {
      logDiagnostic('INVOICE', `Profile found for user ${order.user_id}: ${profile.email}`)
      if (name === 'Valued Customer' && profile.full_name) name = profile.full_name
      email = profile.email
    } else {
      logDiagnostic('INVOICE_WARNING', `No profile found for user ${order.user_id}. Fetching from auth.admin...`)
      const { data: { user }, error: userError } = await client.auth.admin.getUserById(order.user_id)
      if (user && user.email) {
        email = user.email
        if (name === 'Valued Customer' && user.user_metadata?.full_name) {
          name = user.user_metadata.full_name
        }
        logDiagnostic('INVOICE', `User email found in auth: ${email}`)
      } else {
        logDiagnostic('INVOICE_ERROR', `Failed to fetch email from auth for ${order.user_id}`, userError)
      }
    }

    if (!email) {
      logDiagnostic('INVOICE_ERROR', `CRITICAL: No customer email found for user ${order.user_id}. Available shipping data:`, order.shipping_address)
      return
    }

    // 3. Prepare Template Data
    const invoiceData = {
      orderNumber: order.order_number,
      date: new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      customerName: name,
      customerEmail: email,
      shippingAddress: {
        line1: order.shipping_address?.street_address || order.shipping_address?.address_line1 || '',
        city: order.shipping_address?.city || '',
        state: order.shipping_address?.state || '',
        postal_code: order.shipping_address?.pincode || '',
        phone: order.shipping_address?.phone || ''
      },
      items: order.order_items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity,
        size: item.size,
        price: Number(item.price)
      })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      discount: Number(order.coupon_discount || 0),
      tax: Math.round(Number(order.total) * 0.03 / 1.03), // Assuming 3% GST is included
      total: Number(order.total),
      paymentMethod: order.payment_method || 'N/A',
      transactionNumber: order.payment_id || 'N/A'
    }

    logDiagnostic('INVOICE', 'Components generated. Generating PDF and HTML body...')

    // 4. Send Email with PDF Attachment
    const emailHtml = getInvoiceEmailHtml({
      customerName: name,
      orderNumber: order.order_number,
      total: invoiceData.total,
      transactionId: invoiceData.transactionNumber,
      paymentMethod: invoiceData.paymentMethod
    })

    const pdfBuffer = await generateInvoicePdf(invoiceData)

    logDiagnostic('INVOICE', `PDF and HTML generated. Sending email to ${email}...`)

    const sendResult = await sendInvoiceEmail(email, order.order_number, emailHtml, pdfBuffer)

    if (sendResult.success) {
      logDiagnostic('INVOICE_SUCCESS', `Email sent successfully for #${order.order_number}`)
    } else {
      logDiagnostic('INVOICE_FAILURE', `Email send failed for #${order.order_number}`, sendResult.error)
    }

  } catch (err: any) {
    logDiagnostic('INVOICE_CRITICAL', `System failure for order ${orderId}`, err.message)
  }
}

// ============================================
// VISITOR INTELLIGENCE & TRACKING (Extreme)
// ============================================

export async function upsertVisitorIntelligence(payload: {
  sessionId: string;
  identityData?: any;
  deviceInfo?: any;
  marketingInfo?: any;
  consentData?: any;
}) {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()

    // Mask IP for legal safety (keeps prefix for geographic intelligence without PII)
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for') || '0.0.0.0'
    const maskedIp = ip.split('.').slice(0, 3).join('.') + '.0'

    const { data, error } = await client
      .from('visitor_intelligence')
      .upsert({
        session_id: payload.sessionId,
        user_id: user?.id || null,
        identity_data: payload.identityData || {},
        device_info: payload.deviceInfo || {},
        marketing_info: {
          ...payload.marketingInfo,
          ip_prefix: maskedIp,
          updated_at: new Date().toISOString()
        },
        consent_data: payload.consentData || {},
        last_active: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      })

    if (error) {
      console.error('Error upserting visitor intelligence:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Crash in upsertVisitorIntelligence:', err)
    return { success: false, error: err.message }
  }
}

export async function logVisitorEvent(sessionId: string, eventName: string, metadata: any = {}) {
  try {
    // SECURITY & PERFORMANCE: 
    // Uses a database RPC (stored procedure) for atomic updates.
    // This avoids "Read-before-Write" race conditions and minimizes DB trips.
    // We use the public supabaseServer client to avoid cookie overhead for pure logging.
    const { error } = await supabaseServer.rpc('log_visitor_event_v2', {
      p_session_id: sessionId,
      p_event_name: eventName,
      p_metadata: metadata
    })

    if (error) {
      console.error('Error logging visitor event via RPC:', error)
      return { success: false }
    }

    return { success: true }
  } catch (err) {
    console.error('Crash in logVisitorEvent RPC:', err)
    return { success: false }
  }
}

// ============================================
// RETENTION & RECOVERY (Phase 4)
// ============================================

/**
 * Checks for users who have items in their cart for more than 24 hours
 * and haven't placed an order recently.
 */
export async function checkAbandonedCarts() {
  try {
    const client = await getAuthClient()

    // Get carts older than 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // We fetch user_id from cart_items that were created > 24h ago
    const { data: abandonedItems, error } = await client
      .from('cart_items')
      .select('user_id')
      .lt('created_at', yesterday.toISOString())
      .not('user_id', 'is', null)

    if (error || !abandonedItems) return []

    // Group by user and filter out those who ordered recently
    const users = Array.from(new Set(abandonedItems.map(item => (item as any).user_id)))

    // Fetch profiles for these users manually to avoid relationship issues
    let profilesMap: Record<string, { email: string; full_name: string }> = {}
    if (users.length > 0) {
      const { data: profiles, error: profileError } = await client
        .from('profiles')
        .select('id, email, full_name')
        .in('id', users)

      if (!profileError && profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.id] = { email: p.email, full_name: p.full_name }
        })
      }
    }

    const recoveryList = []

    for (const userId of users) {
      // Check if user has a recent order (last 24h)
      const { count } = await client
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('created_at', yesterday.toISOString())

      if (count === 0) {
        const profile = profilesMap[userId as string]
        if (profile) {
          recoveryList.push({
            userId,
            email: profile.email,
            name: profile.full_name,
          })
        }
      }
    }

    return recoveryList
  } catch (err) {
    console.error('Abandoned cart check error:', err)
    return []
  }
}


// ============================================
// SYSTEM MAINTENANCE
// ============================================

/**
 * RECOMENDATIONS ENGINE
 * Finds products that pair well with the current product based on tags and categories.
 */
export async function getRecommendedProducts(productId: string) {
  return unstable_cache(
    async () => {
      try {
        // 1. Get the source product to see its tags and category
        const { data: source, error: sourceError } = await supabaseServer
          .from('products')
          .select('id, category_id, tags')
          .eq('id', productId)
          .single()

        if (sourceError || !source) return []

        // 2. Build recommendations query
        let query = supabaseServer
          .from('products')
          .select('*, categories(*)')
          .limit(6)
          .neq('id', productId) // Don't recommend itself

        // 3. Logic: Match by tags FIRST, then by category
        if (source.tags && source.tags.length > 0) {
          const tagFilters = source.tags.map((t: string) => `tags.cs.{"${t}"}`).join(',')
          query = query.or(`${tagFilters},category_id.eq.${source.category_id}`)
        } else {
          query = query.eq('category_id', source.category_id)
        }

        const { data, error } = await query
        if (error) throw error

        return data || []
      } catch (err) {
        console.error('Recommendations error:', err)
        return []
      }
    },
    [`recommendations-${productId}`],
    { revalidate: 3600, tags: ['products'] }
  )()
}

/**
 * Maintenance: Vacuum and cleanup
 */
export async function triggerDatabaseMaintenance() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const { data, error } = await supabaseServer.rpc('perform_database_maintenance')

    if (error) {
      console.error('Maintenance RPC failed:', error)
      return { success: false, error: error.message }
    }

    return { success: true, results: data }
  } catch (err: any) {
    console.error('Crash in triggerDatabaseMaintenance:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Checks if any admin is currently active in the chat system.
 */
export async function checkAgentAvailability(): Promise<boolean> {
  try {
    const { data: activeAgents, error } = await supabaseServer
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .gt('last_active_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 mins

    if (error) return false
    return activeAgents && activeAgents.length > 0
  } catch (err) {
    return false
  }
}

/**
 * Performs a similarity search on the AI Knowledge Base using pgvector.
 */
export async function searchAIKnowledge(query: string, limit: number = 3) {
  try {
    if (!process.env.OPENAI_API_KEY) return []

    // 1. Generate embedding for user query
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: query.replace(/\n/g, ' '),
        model: 'text-embedding-3-small'
      })
    })

    if (!response.ok) return []
    const embData = await response.json()
    const embedding = embData.data[0].embedding

    // 2. Query Supabase RPC for matching context
    const { data: matches, error } = await supabaseServer.rpc('match_ai_knowledge', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit
    })

    if (error) throw error
    return matches || []
  } catch (err) {
    console.error("Vector search failed:", err)
    return []
  }
}

/**
 * Trigger knowledge ingestion (Admin only)
 */
export async function triggerAIContentIngestion() {
  const { data: { user } } = await supabaseServer.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data: profile } = await supabaseServer.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { success: false, error: "Requires Admin Role" }

  return await runFullIngestion()
}
