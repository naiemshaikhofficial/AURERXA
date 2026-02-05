'use server'

import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

// ============================================
// CATEGORIES
// ============================================

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  return data
}

// ============================================
// PRODUCTS
// ============================================

export async function getBestsellers() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('bestseller', true)
    .limit(4)

  if (error) {
    console.error('Error fetching bestsellers:', error)
    return []
  }
  return data
}

export async function getNewReleases(limit: number = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching new releases:', error)
    return []
  }
  return data
}

export async function getProducts(categorySlug?: string, sortBy?: string) {
  let query = supabase
    .from('products')
    .select('*, categories!inner(*)')

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }

  // Sorting
  if (sortBy === 'price-low') {
    query = query.order('price', { ascending: true })
  } else if (sortBy === 'price-high') {
    query = query.order('price', { ascending: false })
  } else if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data
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
    .select('*, categories(*)')
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
  if (!user) return []

  const { data, error } = await client
    .from('cart')
    .select('*, products(*)')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching cart:', error)
    return []
  }
  return data
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
    .select('*, products(*, categories(*))')
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

export async function getAddresses() {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client
    .from('addresses')
    .select('*')
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
    .insert({ ...addressData, user_id: user.id })

  if (error) {
    console.error('Add address error:', error)
    return { success: false, error: 'Failed to add address' }
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
    .update({ ...addressData, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: 'Failed to update' }
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
    .select('*')
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

export async function createOrder(addressId: string, paymentMethod: string = 'cod') {
  const client = await getAuthClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    return { success: false, error: 'Please login' }
  }

  // Get cart items
  const cart = await getCart()
  if (!cart || cart.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  // Get address
  const { data: address } = await client
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single()

  if (!address) {
    return { success: false, error: 'Invalid address' }
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.products.price * item.quantity), 0)
  const shipping = subtotal >= 50000 ? 0 : 500 // Free shipping above ₹50,000
  const total = subtotal + shipping

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
      status: 'pending'
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Create order error:', orderError)
    return { success: false, error: 'Failed to create order' }
  }

  // Create order items
  const orderItems = cart.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.products.name,
    product_image: item.products.image_url,
    quantity: item.quantity,
    size: item.size,
    price: item.products.price
  }))

  const { error: itemsError } = await client
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    console.error('Create order items error:', itemsError)
  }

  // Clear cart
  await clearCart()

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
    .select('*')
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

export async function searchProducts(query: string) {
  try {
    if (!query || query.length < 2) return []

    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, image_url, categories:category_id(name)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10)

    if (error) throw error
    return data || []
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
}) {
  try {
    let query = supabase
      .from('products')
      .select('*, categories:category_id(name, slug)')

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

    // Price filters
    if (options.minPrice) {
      query = query.gte('price', options.minPrice)
    }
    if (options.maxPrice) {
      query = query.lte('price', options.maxPrice)
    }

    // Search
    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`)
    }

    // Sorting
    switch (options.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
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
