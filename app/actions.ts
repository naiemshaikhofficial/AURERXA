'use server'

import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notifyNewProduct } from './push-actions'
import { createCashfreeOrder, getCashfreePayments } from '@/lib/cashfree'
import { createRazorpayOrder, verifyRazorpayPayment as verifyRazorpayPaymentLib } from '@/lib/razorpay'
import { unstable_cache, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { sanitize, sanitizeObject } from '@/lib/sanitizer'

// Server-side Supabase client for static/public data (safe for unstable_cache)
const supabaseServer = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return [] },
      setAll() { },
    },
  }
)

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
  } catch (err) {
    return false
  }
}

// Helper to get authenticated supabaseServer client
async function getAuthClient() {
  try {
    const cookieStore = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            try {
              return cookieStore.getAll()
            } catch {
              return []
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie set errors during static generation
            }
          },
        },
      }
    )
  } catch (e) {
    // If cookies() fails during static generation, return a public client
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() { },
        },
      }
    )
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

export async function getCurrentUserProfile() {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) return null

    const { data, error } = await client
      .from('profiles')
      .select('full_name, email, phone_number')
      .eq('id', user.id)
      .single()

    if (error) {
      // Don't log expected errors during build
      if (error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      return null
    }

    return {
      name: data.full_name,
      email: data.email,
      phone: data.phone_number
    }
  } catch (err) {
    // Silent fail for dynamic server usage errors during build
    return null
  }
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


export async function addNewProduct(productData: any) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const client = await getAuthClient()

  const { data, error } = await client
    .from('products')
    .insert({
      ...productData,
      tags: productData.tags || [],
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Add product error:', error)
    return { success: false, error: error.message }
  }

  // Trigger push notification
  await notifyNewProduct(data.name, data.slug, data.image_url || '/logo.png')

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

      if (error) throw error

      const allTags = data.flatMap(p => p.tags || [])
      const uniqueTags = Array.from(new Set(allTags.map(t => t.toLowerCase())))
        .map(t => t.charAt(0).toUpperCase() + t.slice(1))
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

export async function getSubCategories(categoryId?: string) {
  return unstable_cache(
    async () => {
      let query = supabaseServer
        .from('sub_categories')
        .select('id, name, slug, category_id, description')
        .order('name')

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching sub-categories:', error)
        return []
      }
      return data
    },
    ['sub-categories', categoryId || 'all'],
    { revalidate: 86400, tags: ['sub-categories'] }
  )()
}

export async function addSubCategory(subCategoryData: any) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const client = await getAuthClient()

  const { data, error } = await client
    .from('sub_categories')
    .insert({
      ...subCategoryData,
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

export const getGoldRates = unstable_cache(
  async () => {
    const { data, error } = await supabaseServer
      .from('gold_rates')
      .select('purity, rate, updated_at')
      .order('purity', { ascending: false })

    if (error) {
      console.error('Error fetching gold rates:', error)
      return null
    }

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

    // Lazy Background Sync: If no rates or rates are older than 8 hours
    const eightHoursAgo = Date.now() - (8 * 3600000)
    const isStale = !data || data.length === 0 || lastUpdatedValue < eightHoursAgo

    if (isStale) {
      console.log('DEBUG: Gold rates stale, triggering background sync')
      syncLiveGoldRates().catch(err => console.error('Background sync failed:', err))
    }

    return ratesObj
  },
  ['gold-rates'],
  { revalidate: 3600, tags: ['gold-rates'] } // Reduced cache time for safer sync checks
)


export const getBestsellers = unstable_cache(
  async () => {
    const { data, error } = await supabaseServer
      .from('products')
      .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug), sub_categories(id, name, slug)')
      .eq('bestseller', true)
      .limit(4)

    if (error) {
      console.error('Error fetching bestsellers:', error)
      return []
    }
    console.log('Bestsellers fetch result:', data?.length)
    return data || []
  },
  ['bestsellers'],
  { revalidate: 60, tags: ['products', 'bestsellers'] }
)

export async function getNewReleases(limit: number = 8) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabaseServer
        .from('products')
        .select('id, name, price, image_url, images, slug, weight_grams, categories(id, name, slug), sub_categories(id, name, slug)')
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
        .select('id, name, price, image_url, images, slug, weight_grams, tags, categories(id, name, slug), sub_categories(id, name, slug)')

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
export const getProductBySlug = cache(async (slug: string) => {
  return unstable_cache(
    async () => {
      // PERFORMANCE: Narrowing selection to avoid fetching heavy/unnecessary columns.
      // This reduces memory overhead and improves caching efficiency.
      const { data, error } = await supabaseServer
        .from('products')
        .select(`
          id, name, description, price, image_url, images, stock, 
          sizes, featured, bestseller, slug, purity, gender, 
          weight_grams, dimensions_width, dimensions_height, 
          dimensions_length, dimensions_unit, video_url, tags, created_at,
          material_type,
          categories(slug, name), 
          sub_categories(slug, name)
        `)
        .eq('slug', slug)
        .single()
      if (error) return null
      return data
    },
    ['product-detail', slug],
    { revalidate: 3600, tags: ['products'] }
  )()
})

export async function getAdminProducts() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return []

  const { data, error } = await supabaseServer
    .from('products')
    .select('*, categories(name), sub_categories(name)')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function updateProductDetails(productId: string, updates: any) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const client = await getAuthClient()

    console.log('DEBUG: Updating product details', { productId, updates })

    const { data, error } = await client
      .from('products')
      .update(updates)
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
  const { data, error } = await supabaseServer
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  if (!categoryId) return [] // Safety guard for products without categories

  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', excludeId)
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
}

// ============================================
// CART
// ============================================

export async function getCart() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) {
    console.log('getCart: No user found')
    return []
  }

  const { data, error } = await client
    .from('cart')
    .select('id, product_id, quantity, size, products(id, name, price, slug, image_url, categories(id, name, slug))')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching cart:', error)
    return []
  }

  console.log(`getCart: Found ${data?.length || 0} items for user ${user.id}`)
  return data || []
}

export async function addToCart(productId: string, size?: string, quantity: number = 1) {
  const client = await getAuthClient()
  const { data: { user } = {} } = await client.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please login to add items to cart' }
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
  return { success: true }
}

export async function removeFromCart(cartId: string) {
  const client = await getAuthClient()

  const { error } = await client
    .from('cart')
    .delete()
    .eq('id', cartId)

  if (error) return { success: false, error: 'Failed to remove' }
  return { success: true }
}

export async function clearCart() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return { success: false }

  const { error } = await client
    .from('cart')
    .delete()
    .eq('user_id', user.id)

  if (error) return { success: false }
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
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Server Pincode Error:', error)
    return null
  }
}

export async function getAddresses() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client
    .from('addresses')
    .select('id, label, full_name, phone, street_address, city, state, pincode, is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return []
  return data
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
    .select('id, order_number, status, total, created_at, payment_method, order_items(product_name, product_image, quantity, products(slug))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getOrderById(orderId: string) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  const { data, error } = await client
    .from('orders')
    .select('*, order_items(*, products(name, image_url, weight_grams, purity, slug))')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  // 30-Minute Expiry Logic for Pending Orders (Amazon-style)
  if (data.status === 'pending') {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    if (new Date(data.created_at) < thirtyMinutesAgo) {
      // SECURITY: Instead of deleting, mark as cancelled for audit trail
      await client
        .from('orders')
        .update({
          status: 'cancelled',
          cancellation_reason: 'Payment session expired (30-minute timeout)',
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
  }
) {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please login' }
  }

  // --- SECURITY: UUID Validation ---
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(addressId)) {
    return { success: false, error: 'Invalid address selected.' }
  }

  // --- SECURITY: Rate Limiting ---
  const { count: pendingOrders } = await client
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

  if (pendingOrders !== null && pendingOrders >= 2) {
    return { success: false, error: 'Too many pending orders. Please complete or wait before creating a new one.' }
  }

  // Get cart items with a short retry to handle race conditions
  let cart = await getCart()

  if (!cart || cart.length === 0) {
    console.log('createOrder: Cart empty, immediate retry...')
    cart = await getCart()
  }

  if (!cart || cart.length === 0) {
    console.error('createOrder failed: Cart is definitively empty for user', user.id)
    return { success: false, error: 'Your cart is empty. Please add items before checkout.' }
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
  const shipping = subtotal >= 50000 ? 0 : (shippingResult.rate || 90)

  // 3. Re-validate Coupon on Server (CRITICAL)
  let couponDiscount = 0
  if (options?.couponCode) {
    const validation = await validateCoupon(options.couponCode, subtotal, shipping)
    if (validation.valid) {
      couponDiscount = validation.discount || 0
    } else {
      console.warn(`SECURITY: Potential coupon tampering detected for order. Coupon: ${options.couponCode}, Error: ${validation.error}`)
      return { success: false, error: `Coupon Error: ${validation.error}` }
    }
  }

  const giftWrapCost = options?.giftWrap ? 199 : 0
  const total = subtotal + shipping + giftWrapCost - couponDiscount

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
      payment_method: paymentMethod,
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
  }

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

    // Build refund message based on payment method
    const refundMessage = order.payment_id && order.payment_method !== 'cod'
      ? ` If any amount was debited, ₹${order.total?.toLocaleString('en-IN')} will be refunded to your original payment method within 5-7 business days.`
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

  const { data, error } = await client
    .from('profiles')
    .select('id, full_name, phone_number, avatar_url')
    .eq('id', user.id)
    .single()

  if (error) return null
  return { ...data, email: user.email }
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
  const sanitizedData = sanitizeObject(formData)
  if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.description) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  try {
    const client = await getAuthClient()
    const { error } = await client
      .from('custom_orders')
      .insert([{
        ...sanitizedData,
        status: 'pending',
        created_at: new Date().toISOString(),
        // Add additional metadata if these columns don't exist, 
        // but typically Supabase expects these to be columns.
        images: formData.images || [],
        catalog_requested: formData.catalog_requested || false
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

export async function submitBulkOrder(formData: {
  businessName: string
  contactName: string
  email: string
  phone: string
  gstNumber?: string
  message?: string
  items: {
    productId: string
    productName: string
    productImage: string
    retailPrice: number
    quantity: number
  }[]
}) {
  const sanitized = sanitizeObject(formData)
  try {
    // Validate required fields
    if (!sanitized.businessName?.trim()) return { success: false, error: 'Business name is required' }
    if (!sanitized.contactName?.trim()) return { success: false, error: 'Contact name is required' }
    if (!sanitized.email?.trim() || !sanitized.email.includes('@')) return { success: false, error: 'Valid email is required' }
    if (!sanitized.phone?.trim() || sanitized.phone.replace(/\D/g, '').length < 10) return { success: false, error: 'Valid phone number is required' }
    if (!sanitized.items || sanitized.items.length === 0) return { success: false, error: 'Please add at least one product to your bulk order' }

    // Validate minimum quantity per item
    for (const item of formData.items) {
      if (!item.quantity || item.quantity < 10) {
        return { success: false, error: `Minimum quantity is 10 per product. "${item.productName}" has only ${item.quantity}.` }
      }
    }

    // Try to get authenticated user (optional - guests can also submit)
    let userId: string | null = null
    try {
      const client = await getAuthClient()
      const { data: { user } } = await client.auth.getUser()
      userId = user?.id || null
    } catch {
      // Guest submission
    }

    // Insert bulk order
    const { data: bulkOrder, error: orderError } = await supabaseServer
      .from('bulk_orders')
      .insert({
        user_id: userId,
        business_name: sanitized.businessName.trim(),
        contact_name: sanitized.contactName.trim(),
        email: sanitized.email.trim().toLowerCase(),
        phone: sanitized.phone.trim(),
        gst_number: sanitized.gstNumber?.trim() || null,
        message: sanitized.message?.trim() || null,
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
    const bulkItems = formData.items.map(item => ({
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
      // Order was created, just items failed - still consider success but log
    }

    return {
      success: true,
      bulkOrderId: bulkOrder.id,
      message: 'Your bulk order inquiry has been submitted. Our team will contact you within 24 hours with wholesale pricing.'
    }
  } catch (err: any) {
    console.error('Bulk order error:', err)
    return { success: false, error: `System Error: ${err.message || 'Failed to submit bulk order.'}` }
  }
}

export async function submitContact(formData: any) {
  const sanitized = sanitizeObject(formData)
  if (!sanitized.name || !sanitized.email || !sanitized.message) {
    return { success: false, error: 'Please fill in all required fields' }
  }

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
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

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

  const { error } = await supabaseServer
    .from('gold_rates')
    .upsert({ purity, rate, updated_at: new Date().toISOString() }, { onConflict: 'purity' })

  if (error) {
    console.error(`Error updating gold rate for ${purity}:`, error)
    return { success: false, error: error.message }
  }
  return { success: true }
}

/**
 * Automate Multi-Metal Rate Synchronization
 * Uses GoldAPI.io (Free Tier) to fetch live Indian market rates for Gold, Silver, and Platinum
 */
export async function syncLiveGoldRates() {
  const apiKey = process.env.GOLD_API_KEY

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
      const price24K = data.price_gram_24k
      if (price24K) {
        await updateGoldRate('24K', price24K)
        await updateGoldRate('22K', price24K * 0.9167)
        await updateGoldRate('18K', price24K * 0.75)
        results['24K'] = price24K
        results['22K'] = price24K * 0.9167
        results['18K'] = price24K * 0.75
      }
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
      const data = await silverRes.json()
      if (data.price_gram) {
        await updateGoldRate('Silver', data.price_gram)
        results['Silver'] = data.price_gram
      }
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
      if (data.price_gram) {
        await updateGoldRate('Platinum', data.price_gram)
        results['Platinum'] = data.price_gram
      }
    }

    return { success: true, rates: results }
  } catch (err: any) {
    console.error('Multi-Metal Sync Error:', err)
    return { success: false, error: err.message }
  }
}

export async function searchProducts(query: string) {
  try {
    if (!query || query.length < 2) return []

    // 1. Try Optimized TextSearch first (Fastest for large catalogs)
    // This utilizes the GIN functional index if defined on name/description.
    const { data: ftsResults, error: ftsError } = await supabaseServer
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, tags, categories(id, name, slug), sub_categories(id, name, slug)')
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
      .select('id, name, price, description, image_url, images, slug, weight_grams, tags, categories(id, name, slug), sub_categories(id, name, slug)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(12)

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
    if (!query || query.length < 2) return { categories: [], tags: [] }

    const t = query.toLowerCase()

    // 1. Fetch matching categories
    const { data: categories } = await supabaseServer
      .from('categories')
      .select('name, slug')
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
      .limit(5)

    // 2. Fetch all products to extract tags (not ideal for performance, but good for small catalogs)
    // Actually, let's use a smarter approach: filter by tags directly if possible
    // Since tags is an array, we can use ilike on the whole array string or just filter in JS
    const { data: tagResults } = await supabaseServer
      .from('products')
      .select('tags')
      .not('tags', 'is', null)
      .limit(100)

    const matchingTags = Array.from(new Set(
      (tagResults || [])
        .flatMap(p => p.tags)
        .filter(tag => tag.toLowerCase().includes(t))
    )).slice(0, 5)

    return {
      categories: categories || [],
      tags: matchingTags
    }
  } catch (err) {
    console.error('Search suggestions error:', err)
    return { categories: [], tags: [] }
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
          .select('id, name, price, description, image_url, images, slug, weight_grams, material_type, categories(id, name, slug)')

        // Category filter
        const categorySlug = options.category || options.material
        if (categorySlug && categorySlug !== 'all') {
          const { data: cat } = await supabaseServer
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single()
          if (cat) {
            query = query.eq('category_id', cat.id)
          }
        }

        // Sub-category filter
        if (options.sub_category && options.sub_category !== 'all') {
          const { data: subCat } = await supabaseServer
            .from('sub_categories')
            .select('id')
            .eq('slug', options.sub_category)
            .single()
          if (subCat) {
            query = query.eq('sub_category_id', subCat.id)
          }
        }

        // Tag filter (Theme Collections)
        if (options.tag) {
          const t = options.tag.toLowerCase()
          const words = t.split(/[- ]/)
          const lastWord = words[words.length - 1]
          const singularLast = lastWord.endsWith('s') ? lastWord.slice(0, -1) : lastWord

          const variations = Array.from(new Set([
            t,
            t.replace(/-/g, ' '),
            lastWord,
            singularLast,
            lastWord === 'ring' ? 'rings' : null,
            lastWord === 'earring' ? 'earrings' : null,
            lastWord === 'necklace' ? 'necklaces' : null,
            t === 'bride' ? 'bridal' : null,
            t === 'bridal' ? 'bride' : null,
          ].filter(Boolean) as string[]))

          const allVariations = [...variations]
          variations.forEach(v => {
            allVariations.push(v.charAt(0).toUpperCase() + v.slice(1))
          })

          const orFilter = Array.from(new Set(allVariations))
            .map(v => `tags.cs.{"${v}"}`)
            .join(',')
          query = query.or(orFilter)
        }

        // Gender filter
        if (options.gender && options.gender !== 'all') {
          query = query.eq('gender', options.gender)
        }

        // Type filter (Holistic match for legacy or flexible links)
        if (options.type && options.type !== 'all') {
          const t = options.type.toLowerCase()
          const words = t.split(/[- ]/)
          const lastWord = words[words.length - 1]
          const singularLast = lastWord.endsWith('s') ? lastWord.slice(0, -1) : lastWord

          // 1. Try to match as a category
          const { data: cat } = await supabaseServer.from('categories').select('id').eq('slug', t).single()
          if (cat) {
            query = query.eq('category_id', cat.id)
          } else {
            // 2. Try to match as a sub-category
            const { data: subCat } = await supabaseServer.from('sub_categories').select('id').eq('slug', t).single()
            if (subCat) {
              query = query.eq('sub_category_id', subCat.id)
            } else {
              // 3. Try to match as a tag or in the name
              query = query.or(`tags.cs.{"${t}"},tags.cs.{"${lastWord}"},tags.cs.{"${singularLast}"},name.ilike.%${singularLast}%`)
            }
          }
        }

        // Occasion filter (Treated as Tags)
        if (options.occasion && options.occasion !== 'all') {
          const o = options.occasion.toLowerCase()
          query = query.or(`tags.cs.{"${o}"},tags.cs.{"${options.occasion}"},description.ilike.%${o}%`)
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

    // 5. Create a return ticket in the tickets table (reuses existing support infra)
    const { data: ticket, error: ticketError } = await client
      .from('tickets')
      .insert({
        user_id: user.id,
        subject: `Return Request - Order #${order.order_number}`,
        message: `Issue Type: ${formData.issueType.replace(/_/g, ' ')}\nReason: ${formData.reason.trim()}\n\nDescription:\n${formData.description.trim()}\n\nOrder Total: ₹${order.total?.toLocaleString('en-IN')}\nItems: ${order.order_items?.map((i: any) => `${i.product_name} x${i.quantity}`).join(', ')}`,
        status: 'open',
        urgency: 'high'
      })
      .select('id')
      .single()

    if (ticketError) {
      console.error('Return request ticket creation error:', ticketError)
      return { success: false, error: 'Failed to submit return request. Please try again or contact support.' }
    }

    // 4. Update order with detailed return tracking
    await client
      .from('orders')
      .update({
        status: 'return_requested',
        return_status: 'requested',
        return_reason: `${formData.issueType}: ${formData.reason}`,
        returned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    // 6. Log activity
    try {
      await client.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: `Return request for order: ${order.order_number}`,
        entity_type: 'ticket',
        entity_id: ticket?.id || orderId,
        details: {
          order_number: order.order_number,
          issue_type: formData.issueType,
          reason: formData.reason.trim()
        }
      })
    } catch (e) {
      console.error('Silent log failure:', e)
    }

    return {
      success: true,
      message: 'Your return request has been submitted. Our team will review it and contact you within 24 hours.',
      ticketId: ticket?.id
    }
  } catch (err: any) {
    console.error('Return request crash:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
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
// CASHFREE PAYMENTS
// ============================================

export async function initiateCashfreePayment(orderId: string) {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Get order details
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Order not found' }
    }

    const customerDetails = {
      customer_id: user.id,
      customer_phone: order.shipping_address.phone || '9999999999',
      customer_email: user.email,
      customer_name: order.shipping_address.full_name || 'Customer'
    }

    const cashfreeOrder = await createCashfreeOrder({
      order_id: order.order_number,
      order_amount: Number(order.total),
      order_currency: 'INR',
      customer_details: customerDetails,
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders/${order.id}?payment=success`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/cashfree`
      }
    })

    // Store the Cashfree order ID in our database if needed
    // In this case, we use order_number as the order_id in Cashfree

    // Increment attempts and store gateway order ID
    await client
      .from('orders')
      .update({
        payment_gateway_order_id: cashfreeOrder.cf_order_id,
        payment_attempts: (order.payment_attempts || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    return {
      success: true,
      gateway: 'cashfree',
      paymentSessionId: cashfreeOrder.payment_session_id,
      cfOrderId: cashfreeOrder.cf_order_id,
      mode: process.env.CASHFREE_MODE || 'sandbox'
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error)
    return { success: false, error: error.message }
  }
}

export async function verifyCashfreePayment(orderId: string) {
  try {
    const client = await getAuthClient()
    const { data: { user } } = await client.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // SECURITY: Idempotency & Existence Check
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status === 'confirmed' || order.payment_status === 'paid') {
      return { success: true, message: 'Payment already verified' }
    }

    // Call Cashfree to get payments for this order
    // Order ID in Cashfree is order.order_number
    const payments = await getCashfreePayments(order.order_number)

    // Find a successful payment
    const successPayment = payments.find((p: any) => p.payment_status === 'SUCCESS')

    if (successPayment) {
      // Extract detailed payment method
      let detailedMethod = 'online'
      const pm = successPayment.payment_method
      if (pm) {
        if (pm.upi) detailedMethod = 'UPI'
        else if (pm.card) {
          const network = pm.card.card_network?.toUpperCase() || ''
          const type = pm.card.card_type?.charAt(0).toUpperCase() + pm.card.card_type?.slice(1) || 'Card'
          detailedMethod = `${network} ${type}`.trim()
        } else if (pm.netbanking) detailedMethod = 'Net Banking'
        else if (pm.app) detailedMethod = 'Wallet/App'
      }

      // Verify amount integrity (Safety First)
      const paymentAmount = Number(successPayment.payment_amount)
      const orderTotal = Number(order.total)
      const margin = 1 // 1 rupee tolerance for rounding

      if (Math.abs(paymentAmount - orderTotal) > margin) {
        console.error(`CRITICAL: Amount mismatch for order ${order.order_number}. Order: ${orderTotal}, Paid: ${paymentAmount}`)
        await client.from('orders').update({
          payment_status: 'flagged_mismatch',
          payment_error_reason: `Amount mismatch: Expected ${orderTotal}, got ${paymentAmount}`
        }).eq('id', order.id)
        return { success: false, error: 'Security alert: Payment amount mismatch. Please contact support.' }
      }

      // Update order status
      const { error: updateError } = await client
        .from('orders')
        .update({
          status: 'confirmed',
          payment_id: successPayment.cf_payment_id,
          payment_status: 'paid',
          payment_method: detailedMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (!updateError) {
        // Increment coupon usage if applied
        if (order.coupon_code) {
          await client.rpc('increment_coupon_usage', { coupon_code: order.coupon_code })
        }
      }

      if (updateError) throw updateError

      return { success: true, status: 'confirmed' }
    }

    return { success: false, error: 'Payment not completed or failed' }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return { success: false, error: error.message }
  }
}


// Payment Gateway Configuration
export type PaymentResult =
  | { success: true; gateway: 'razorpay'; keyId: string; amount: number; currency: string; razorpayOrderId: string; productName: string; customer: { name: string; email: string; contact: string }; mode?: string; paymentSessionId?: never }
  | { success: true; gateway: 'cashfree'; paymentSessionId: string; cfOrderId: string; mode: string; keyId?: never; amount?: never }
  | { success: true; gateway: 'free'; orderId: string; keyId?: never; amount?: never; paymentSessionId?: never }
  | { success: false; error: string; gateway?: never; keyId?: never };

export async function getPaymentGatewayConfig() {
  return {
    gateway: (process.env.PAYMENT_GATEWAY as 'cashfree' | 'razorpay') || 'cashfree',
    mode: process.env.CASHFREE_MODE || 'sandbox',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    enableCod: process.env.ENABLE_COD === 'true'
  }
}

export async function initiatePayment(orderId: string, gatewayOverride?: 'cashfree' | 'razorpay'): Promise<PaymentResult> {
  const config = await getPaymentGatewayConfig()
  const gateway = gatewayOverride || config.gateway
  console.log('initiatePayment: Target gateway is', gateway)

  // --- ZERO-AMOUNT ORDER: Auto-confirm without hitting payment gateway ---
  try {
    const client = await getAuthClient()
    const { data: order } = await client
      .from('orders')
      .select('total, coupon_code')
      .eq('id', orderId)
      .single()

    if (order && Number(order.total) <= 0) {
      console.log('initiatePayment: Zero-amount order detected, auto-confirming...')

      await client.from('orders').update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'Free (100% Discount)',
        payment_id: `FREE_${Date.now()}`,
        updated_at: new Date().toISOString()
      }).eq('id', orderId)

      // Increment coupon usage
      if (order.coupon_code) {
        await client.rpc('increment_coupon_usage', { coupon_code: order.coupon_code })
      }

      // Clear cart
      await clearCart()

      return { success: true, gateway: 'free', orderId }
    }
  } catch (e) {
    console.error('Zero-amount check failed, proceeding to gateway:', e)
  }

  if (gateway === 'razorpay') {
    if (!process.env.RAZORPAY_KEY_ID) {
      console.error('initiatePayment: Razorpay Key ID is missing');
      return { success: false, error: 'Razorpay configuration error' };
    }
    const result = await initiateRazorpayPayment(orderId)
    return result as PaymentResult
  }

  if (!process.env.CASHFREE_APP_ID) {
    console.error('initiatePayment: Cashfree App ID is missing');
    return { success: false, error: 'Cashfree configuration error' };
  }
  const result = await initiateCashfreePayment(orderId)
  return result as PaymentResult
}

export async function verifyPayment(orderId: string, params?: any) {
  const config = await getPaymentGatewayConfig()
  console.log('verifyPayment: Selected gateway is', config.gateway, 'for order', orderId)

  if (config.gateway === 'razorpay') {
    const result = await verifyRazorpayPayment(orderId, params)
    if (result.success) {
      console.log('verifyPayment: Razorpay verification successful');
      await clearCart()
    } else {
      console.warn('verifyPayment: Razorpay verification failed', result.error);
    }
    return result
  }

  const result = await verifyCashfreePayment(orderId)
  if (result.success) {
    console.log('verifyPayment: Cashfree verification successful');
    await clearCart()
  } else {
    console.warn('verifyPayment: Cashfree verification failed', result.error);
  }
  return result
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
      .select('user_id, profiles(email, full_name)')
      .lt('created_at', yesterday.toISOString())
      .not('user_id', 'is', null)

    if (error || !abandonedItems) return []

    // Group by user and filter out those who ordered recently
    const users = Array.from(new Set(abandonedItems.map(item => (item as any).user_id)))
    const recoveryList = []

    for (const userId of users) {
      // Check if user has a recent order (last 24h)
      const { count } = await client
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('created_at', yesterday.toISOString())

      if (count === 0) {
        const profile = abandonedItems.find(item => item.user_id === userId)?.profiles
        if (profile) {
          recoveryList.push({
            userId,
            email: (profile as any).email,
            name: (profile as any).full_name,
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
