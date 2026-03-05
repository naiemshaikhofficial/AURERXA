'use server'

/**
 * AURERXA ACTION HUB
 * Strictly re-exports async server actions only using explicit wrappers.
 * This ensures compatibility with Turbopack's strict static analysis.
 */

import * as utils from '@/lib/actions/utils'
import * as auth from '@/lib/actions/auth'
import * as cart from '@/lib/actions/cart'
import * as wishlist from '@/lib/actions/wishlist'
import * as categories from '@/lib/actions/categories'
import * as products from '@/lib/actions/products'
import * as blog from '@/lib/actions/blog'
import * as orders from '@/lib/actions/orders'
import * as payments from '@/lib/actions/payments'
import * as search from '@/lib/actions/search'
import * as reviews from '@/lib/actions/reviews'
import * as support from '@/lib/actions/support'
import * as intelligence from '@/lib/actions/intelligence'
import * as maintenance from '@/lib/actions/maintenance'

// FOUNDATION & ACTIONS
export async function checkIsAdmin() { return utils.checkIsAdmin() }
export async function checkActionRateLimit(id: string, action: string, max: number, window: number) {
  return utils.checkActionRateLimit(id, action, max, window)
}
export async function getSiteSetting(key: string, defaultValue: any) {
  return utils.getSiteSetting(key, defaultValue)
}
export async function getGlobalConfig() { return utils.getGlobalConfig() }
export async function updateGlobalConfig(key: string, value: number) { return utils.updateGlobalConfig(key, value) }
export async function getGoldRates() { return utils.getGoldRates() }
export async function forceSyncGoldRates() { return utils.forceSyncGoldRates() }
export async function syncLiveGoldRates() { return utils.syncLiveGoldRates() }
export async function subscribeNewsletter(email: string) { return utils.subscribeNewsletter(email) }

// AUTH & PROFILE
export async function getProfile() { return auth.getProfile() }
export async function getCurrentUserProfile() { return auth.getProfile() }
export async function updateProfile(data: any) { return auth.updateProfile(data) }
export async function signOutAction() { return auth.signOutAction() }
export async function signOut() { return auth.signOutAction() }
export async function getAddresses() { return auth.getAddresses() }
export async function addAddress(data: any) { return auth.addAddress(data) }
export async function updateAddress(id: string, data: any) { return auth.updateAddress(id, data) }
export async function deleteAddress(id: string) { return auth.deleteAddress(id) }
export async function setDefaultAddress(id: string) { return auth.setDefaultAddress(id) }

// CART
export async function getCart() { return cart.getCart() }
export async function addToCart(id: string, size?: string, qty: number = 1) { return cart.addToCart(id, size, qty) }
export async function updateCartItem(id: string, qty: number) { return cart.updateCartItem(id, qty) }
export async function removeFromCart(id: string) { return cart.removeFromCart(id) }

// WISHLIST
export async function getWishlist() { return wishlist.getWishlist() }
export async function addToWishlist(id: string) { return wishlist.addToWishlist(id) }
export async function removeFromWishlist(id: string) { return wishlist.removeFromWishlist(id) }
export async function isInWishlist(id: string) { return wishlist.isInWishlist(id) }

// CATEGORIES
export async function getCategories() { return categories.getCategories() }
export async function getSubCategories(id?: string) { return categories.getSubCategories(id) }
export async function addSubCategory(data: any) { return categories.addSubCategory(data) }
export async function updateSubCategory(id: string, data: any) { return categories.updateSubCategory(id, data) }
export async function deleteSubCategory(id: string) { return categories.deleteSubCategory(id) }
export async function getAllCategorySlugs() { return categories.getAllCategorySlugs() }

// PRODUCTS
export async function getBestsellers() { return products.getBestsellers() }
export async function getNewReleases(limit: number = 8) { return products.getNewReleases(limit) }
export async function getProducts(cat?: string, sort?: string) { return products.getProducts(cat, sort) }
export async function getProductBySlug(slug: string) { return products.getProductBySlug(slug) }
export async function getAdminProducts() { return products.getAdminProducts() }
export async function addNewProduct(data: any) { return products.addNewProduct(data) }
export async function updateProductDetails(id: string, data: any) { return products.updateProductDetails(id, data) }
export async function deleteProduct(id: string) { return products.deleteProduct(id) }
export async function getProductById(id: string) { return products.getProductById(id) }
export async function getRelatedProducts(cat: string, id: string) { return products.getRelatedProducts(cat, id) }
export async function getRecommendedProducts(id: string, limit: number = 4) { return products.getRecommendedProducts(id, limit) }
export async function getAllProductSlugs() { return products.getAllProductSlugs() }
export async function getHeroSlides() { return products.getHeroSlides() }
export async function getUsedTags() { return products.getUsedTags() }
export async function getGenderStats() { return products.getGenderStats() }

// BLOG
export async function getBlogPosts(cat?: string) { return blog.getBlogPosts(cat) }
export async function getBlogPostBySlug(slug: string) { return blog.getBlogPostBySlug(slug) }
export async function getBlogPost(slug: string) { return blog.getBlogPostBySlug(slug) }
export async function getAllBlogSlugs() { return blog.getAllBlogSlugs() }

// ORDERS & LOGISTICS
export async function createOrder(addrId: string, payMe: string, opts: any = {}) { return orders.createOrder(addrId, payMe, opts) }
export async function cancelOrder(id: string, reason?: string) { return orders.cancelOrder(id, reason) }
export async function updateOrderStatus(id: string, status: string) { return orders.updateOrderStatus(id, status) }
export async function getOrders() { return orders.getOrders() }
export async function getOrderById(id: string) { return orders.getOrderById(id) }
export async function getOrderTracking(id: string) { return orders.getOrderTracking(id) }
export async function requestReturn(id: string, data: any) { return orders.requestReturn(id, data) }
export async function getReturnByOrderId(id: string) { return orders.getReturnByOrderId(id) }
export async function getReturnRequests() { return orders.getReturnRequests() }
export async function calculateShippingRate(pin: string, items: any[], cod: boolean = false) {
  return orders.calculateShippingRate(pin, items, cod)
}
export async function createDelhiveryShipment(id: string) { return orders.createDelhiveryShipment(id) }
export async function createDelhiveryReturnShipment(id: string) { return orders.createDelhiveryReturnShipment(id) }
export async function checkDeliveryAvailability(pin: string, productId?: string) {
  return orders.checkDeliveryAvailability(pin, productId)
}
export async function getPincodeDetails(pin: string) { return orders.getPincodeDetails(pin) }
export async function submitBulkOrder(data: any) { return orders.submitBulkOrder(data) }
export async function validateCoupon(code: string, subt: number, ship: number) { return orders.validateCoupon(code, subt, ship) }
export async function triggerOrderInvoice(id: string) { return orders.triggerOrderInvoice(id) }
export async function checkPendingOrder(id?: string) { return orders.checkPendingOrder(id) }

// PAYMENTS
export async function initiatePayment(orderId: string) { return payments.initiatePayment(orderId) }
export async function verifyPayment(orderId: string, details: any = {}) { return payments.verifyPayment(orderId, details) }
export async function getPaymentGatewayConfig() { return payments.getPaymentGatewayConfig() }
export async function processCCAvenueRefund(id: string, amount: number, reason: string) { return payments.processCCAvenueRefund(id, amount, reason) }
export async function getOrderPaymentSession(id: string) { return payments.getOrderPaymentSession(id) }

// SEARCH & AI
export async function getFilteredProducts(params: any) { return search.getFilteredProducts(params) }
export async function searchProducts(query: string) { return search.searchProducts(query) }
export async function getSearchSuggestions(query: string) { return search.getSearchSuggestions(query) }
export async function searchAIKnowledge(query: string) { return search.searchAIKnowledge(query) }

// REVIEWS & FEEDBACK
export async function getProductReviews(id: string) { return reviews.getProductReviews(id) }
export async function getReviewStats(id: string) { return reviews.getReviewStats(id) }
export async function submitReview(formData: FormData) { return reviews.submitReview(formData) }
export async function uploadReviewImage(base64: string, productId: string) { return reviews.uploadReviewImage(base64, productId) }

// SUPPORT & CHAT
export async function createTicket(data: any) { return support.createTicket(data) }
export async function createSupportTicket(data: any) { return support.createSupportTicket(data) }
export async function submitContact(data: any) { return support.submitContact(data) }
export async function submitCustomOrder(data: any) { return support.submitCustomOrder(data) }
export async function createRepairRequest(data: any) { return support.createRepairRequest(data) }
export async function getBotResponse(query: string) { return support.getBotResponse(query) }
export async function broadcastNotification(title: string, body: string, url: string) {
  return support.broadcastNotification(title, body, url)
}
export async function checkAgentAvailability() { return support.checkAgentAvailability() }

// INTELLIGENCE & TRACKING
export async function upsertVisitorIntelligence(data: any) { return intelligence.upsertVisitorIntelligence(data) }
export async function startChatSession(data: any) { return intelligence.upsertVisitorIntelligence(data) }
export async function logVisitorEvent(id: string, event: string, meta: any = {}) { return intelligence.logVisitorEvent(id, event, meta) }

// MAINTENANCE & SYSTEM
export async function triggerDatabaseMaintenance() { return maintenance.triggerDatabaseMaintenance() }
export async function checkAbandonedCarts() { return maintenance.checkAbandonedCarts() }
export async function cleanupPendingOrders() { return maintenance.cleanupPendingOrders() }
export const triggerAIContentIngestion = async () => maintenance.triggerAIContentIngestion()
export const getSiteManifest = async () => maintenance.getSiteManifest()
export const getSyncData = async (buckets: string[]) => maintenance.getSyncData(buckets)
