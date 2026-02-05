'use server'

import { supabase } from '@/lib/supabase'

// --- Categories ---

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

// --- Products ---

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

export async function getProducts(categorySlug?: string) {
  let query = supabase
    .from('products')
    .select('*, categories!inner(*)')

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
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


// --- User Actions ---

export async function subscribeNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, created_at: new Date().toISOString() }])

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'You are already subscribed!' }
      }
      throw error
    }

    return { success: true, message: 'Thank you for subscribing to AURERXA!' }
  } catch (err) {
    console.error('Subscribe error:', err)
    return { success: false, error: 'Failed to subscribe. Please try again.' }
  }
}

export async function submitCustomOrder(formData: any) {
  if (!formData.name || !formData.email || !formData.description) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  try {
    const { error } = await supabase
      .from('custom_orders')
      .insert([{ ...formData, status: 'pending', created_at: new Date().toISOString() }])

    if (error) throw error

    return { success: true, message: 'Your custom order request has been received.' }
  } catch (err) {
    console.error('Custom order error:', err)
    return { success: false, error: 'Failed to submit order.' }
  }
}

export async function submitContact(formData: any) {
  if (!formData.name || !formData.email || !formData.message) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert([{ ...formData, created_at: new Date().toISOString() }])

    if (error) throw error

    return { success: true, message: 'Thank you for your message.' }
  } catch (err) {
    console.error('Contact error:', err)
    return { success: false, error: 'Failed to send message.' }
  }
}

export async function addToCart(productId: string, productName: string) {
  return { success: true, message: `${productName} added to cart` }
}
