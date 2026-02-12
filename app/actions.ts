'use server'

import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { notifyNewProduct } from './push-actions'
import { createCashfreeOrder, getCashfreePayments } from '@/lib/cashfree'
import { createRazorpayOrder, verifyRazorpayPayment as verifyRazorpayPaymentLib } from '@/lib/razorpay'
import { unstable_cache, revalidateTag } from 'next/cache'

export async function getTestProductCount() {
  const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true })
  console.log('DEBUG: Product count:', count, error)
  return { count, error }
}

// Helper to get authenticated supabase client
async function getAuthClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function addNewProduct(productData: any) {
  const client = await getAuthClient()

  const { data, error } = await client
    .from('products')
    .insert({
      ...productData,
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
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }
    return data
  },
  ['categories'],
  { tags: ['categories'] }
)

export const getSubCategories = unstable_cache(
  async (categoryId?: string) => {
    let query = supabase
      .from('sub_categories')
      .select('*')
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
  ['sub-categories'],
  { tags: ['sub-categories'] }
)

export async function addSubCategory(subCategoryData: any) {
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
    const { data, error } = await supabase
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
      // FIRE AND FORGET - Don't await in the main flow to keep TTFB low
      syncLiveGoldRates().catch(err => console.error('Background sync failed:', err))
    }

    return ratesObj
  },
  ['gold-rates'],
  { revalidate: 3600, tags: ['gold-rates'] } // Reduced cache time for safer sync checks
)

export const getBestsellers = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, categories(id, name, slug), sub_categories(id, name, slug)')
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

export const getNewReleases = unstable_cache(
  async (limit: number = 8) => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, categories(id, name, slug), sub_categories(id, name, slug)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching new releases:', error)
      return []
    }
    console.log('New releases fetch result:', data?.length)
    return data || []
  },
  ['new-releases'],
  { revalidate: 60, tags: ['products', 'new-releases'] }
)

export const getProducts = unstable_cache(
  async (categorySlug?: string, sortBy?: string) => {
    let query = supabase
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, categories(id, name, slug), sub_categories(id, name, slug)')

    if (categorySlug) {
      // Since it's a join, we filter by the related table's field
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    // Sorting
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

    if (!data || data.length === 0) {
      console.log('⚠️ No products found in database or blocked by RLS')
    }

    return data || []
  },
  ['products-list'],
  { revalidate: 60, tags: ['products'] }
)

// Product Actions
export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(slug, name), sub_categories(slug, name)')
        .eq('slug', slug)
        .single()
      if (error) return null
      return data
    },
    ['product-detail', slug],
    { revalidate: 3600, tags: ['products'] }
  )()
}

export async function getAdminProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), sub_categories(name)')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function updateProductDetails(productId: string, updates: any) {
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
    return { success: true }
  } catch (err: any) {
    console.error('❌ Update Product Details Crash:', err)
    return { success: false, error: err.message || 'Internal server error' }
  }
}

export async function deleteProduct(productId: string) {
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

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete product' }
  }
}


export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getRelatedProducts(categoryId: string, excludeId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, image_url, slug, categories(id, name, slug)')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(4)

  if (error) return []
  return data
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
  const { data: { user } } = await client.auth.getUser()

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

  const { data, error } = await client
    .from('orders')
    .select('id, order_number, status, total, created_at')
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
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) return null
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

  // Get cart items with a short retry to handle race conditions
  let cart = await getCart()

  if (!cart || cart.length === 0) {
    console.log('createOrder: Cart empty, immediate retry...')
    cart = await getCart()
  }

  console.log(`createOrder debug: Final cart length is ${cart?.length || 0}`)

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

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    const price = product?.price || 0
    return sum + (price * item.quantity)
  }, 0)

  // Calculate dynamic shipping
  const isCod = paymentMethod === 'cod'
  const shippingResult = await calculateShippingRate(address.pincode, cart, isCod)

  if (!shippingResult.success) {
    const res = shippingResult as any
    console.error('Shipping calculation failed:', res.error)
    return { success: false, error: `Shipping Error: ${res.error}` }
  }
  const shipping = subtotal >= 50000 ? 0 : (shippingResult.rate || 90)

  const giftWrapCost = options?.giftWrap ? 199 : 0
  const couponDiscount = options?.couponDiscount || 0
  const total = subtotal + shipping + giftWrapCost - couponDiscount

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
      gift_message: options?.giftMessage || null,
      delivery_time_slot: options?.deliveryTimeSlot || null,
      coupon_code: options?.couponCode || null,
      coupon_discount: couponDiscount
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
  }

  return { success: true, orderId: order.id, orderNumber }
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
  if (!formData.name || !formData.email || !formData.description) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  try {
    const client = await getAuthClient()
    const { error } = await client
      .from('custom_orders')
      .insert([{ ...formData, status: 'pending', created_at: new Date().toISOString() }])

    if (error) return { success: false, error: `Order Error: ${error.message}` }

    return { success: true, message: 'Your custom order request has been received.' }
  } catch (err: any) {
    console.error('Custom order error:', err)
    return { success: false, error: `System Error: ${err.message || 'Failed to submit order.'}` }
  }
}

export async function submitContact(formData: any) {
  if (!formData.name || !formData.email || !formData.message) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  try {
    const client = await getAuthClient()
    const { error } = await client
      .from('contact_messages')
      .insert([{ ...formData, created_at: new Date().toISOString() }])

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
  const { error } = await supabase
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

    // 1. Try ILIKE search first for better reliability on name/description
    const { data: ilikeResults, error: ilikeError } = await supabase
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, categories(id, name, slug), sub_categories(id, name, slug)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10)

    if (!ilikeError && ilikeResults && ilikeResults.length > 0) {
      return ilikeResults
    }

    // 2. Fallback to FTS if ILIKE yields no results (handles more complex term matching)
    const { data: ftsResults, error: ftsError } = await supabase
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, categories(id, name, slug), sub_categories(id, name, slug)')
      .textSearch('fts_vector', query, {
        type: 'plain',
        config: 'english'
      })
      .limit(10)

    if (ftsError) {
      // If FTS fails (e.g. column missing), just log it and return empty or ILIKE results
      console.warn('FTS Search fallback failed (likely missing index):', ftsError.message)
      return ilikeResults || []
    }

    return ftsResults || []
  } catch (err) {
    console.error('Search error:', err)
    return []
  }
}

// ============================================
// COUPONS
// ============================================

export async function validateCoupon(code: string, orderTotal: number) {
  try {
    if (!code) return { valid: false, error: 'Please enter a coupon code' }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
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

    // Check usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' }
    }

    // Check minimum order value
    if (data.min_order_value && orderTotal < data.min_order_value) {
      return { valid: false, error: `Minimum order value is ₹${data.min_order_value}` }
    }

    // Calculate discount
    let discount = 0
    if (data.discount_type === 'percentage') {
      discount = (orderTotal * data.discount_value) / 100
      if (data.max_discount && discount > data.max_discount) {
        discount = data.max_discount
      }
    } else {
      discount = data.discount_value
    }

    return {
      valid: true,
      discount,
      coupon: data,
      message: `₹${discount.toLocaleString('en-IN')} discount applied!`
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
    let query = supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
// FILTERS (for collections page)
// ============================================

export async function getFilteredProducts(options: {
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  search?: string
  gender?: string
  type?: string
}) {
  try {
    let query = supabase
      .from('products')
      .select('id, name, price, description, image_url, images, slug, weight_grams, categories(id, name, slug)')

    // Category filter
    if (options.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', options.category)
        .single()
      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    // Gender filter
    if (options.gender && options.gender !== 'all') {
      query = query.eq('gender', options.gender)
    }

    // Type filter
    if (options.type && options.type !== 'all') {
      const singularType = options.type.endsWith('s') ? options.type.slice(0, -1) : options.type
      query = query.ilike('name', `%${singularType}%`)
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
    .update({ status, updated_at: new Date().toISOString() })
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

    // Get order details
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Order not found' }
    }

    // Call Cashfree to get payments for this order
    // Order ID in Cashfree is order.order_number
    const payments = await getCashfreePayments(order.order_number)

    // Find a successful payment
    const successPayment = payments.find((p: any) => p.payment_status === 'SUCCESS')

    if (successPayment) {
      // Update order status
      const { error: updateError } = await client
        .from('orders')
        .update({
          status: 'paid', // Or 'processing'
          payment_id: successPayment.cf_payment_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)

      if (updateError) throw updateError

      return { success: true, status: 'paid' }
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
  | { success: false; error: string; gateway?: never; keyId?: never };

export async function getPaymentGatewayConfig() {
  return {
    gateway: (process.env.PAYMENT_GATEWAY as 'cashfree' | 'razorpay') || 'cashfree',
    mode: process.env.CASHFREE_MODE || 'sandbox',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    enableCod: process.env.ENABLE_COD === 'true'
  }
}

export async function initiatePayment(orderId: string): Promise<PaymentResult> {
  const config = await getPaymentGatewayConfig()
  console.log('initiatePayment: Selected gateway is', config.gateway)

  if (config.gateway === 'razorpay') {
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

  try {
    const isValid = await verifyRazorpayPaymentLib(
      params.razorpay_payment_id,
      params.razorpay_order_id,
      params.razorpay_signature
    )

    if (isValid) {
      const { error: updateError } = await client
        .from('orders')
        .update({
          status: 'paid',
          payment_id: params.razorpay_payment_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

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
