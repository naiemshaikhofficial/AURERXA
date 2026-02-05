'use server'

import { supabase } from '@/lib/supabase'

export async function subscribeNewsletter(email: string) {
  // Validate email
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, created_at: new Date().toISOString() }])

    if (error) {
      console.error('Supabase error:', error)
      // Check for duplicate key error (code 23505)
      if (error.code === '23505') {
        return { success: false, error: 'You are already subscribed!' }
      }
      throw error
    }

    return {
      success: true,
      message: 'Thank you for subscribing to AURERXA!',
    }
  } catch (err) {
    console.error('Subscribe error:', err)
    return { success: false, error: 'Failed to subscribe. Please try again.' }
  }
}

export async function submitCustomOrder(formData: {
  name: string
  email: string
  phone: string
  description: string
  budget: string
}) {
  // Validate required fields
  if (!formData.name || !formData.email || !formData.description) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  if (!formData.email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  try {
    const { error } = await supabase
      .from('custom_orders')
      .insert([{
        ...formData,
        status: 'pending',
        created_at: new Date().toISOString()
      }])

    if (error) throw error

    return {
      success: true,
      message: 'Your custom order request has been received. We will contact you shortly.',
    }
  } catch (err) {
    console.error('Custom order error:', err)
    return { success: false, error: 'Failed to submit order. Please try again.' }
  }
}

export async function submitContact(formData: {
  name: string
  email: string
  subject: string
  message: string
}) {
  // Validate required fields
  if (!formData.name || !formData.email || !formData.message) {
    return { success: false, error: 'Please fill in all required fields' }
  }

  if (!formData.email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' }
  }

  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert([{
        ...formData,
        created_at: new Date().toISOString()
      }])

    if (error) throw error

    return {
      success: true,
      message: 'Thank you for your message. We will get back to you soon.',
    }
  } catch (err) {
    console.error('Contact error:', err)
    return { success: false, error: 'Failed to send message. Please try again.' }
  }
}

export async function addToCart(productId: string, productName: string) {
  // NOTE: In a real app, successful cart addition depends on a user session or ID.
  // For now, we will log this action and assume client-side state or future implementation handles the session.
  // If we had a 'cart_items' table:
  /*
  const { error } = await supabase
    .from('cart_items')
    .insert([{ product_id: productId, quantity: 1 }])
  */

  console.log(`[Supabase Mock] Added ${productName} (ID: ${productId}) to cart logic.`)

  return {
    success: true,
    message: `${productName} added to cart`,
  }
}
