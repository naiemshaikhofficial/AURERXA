-- Migration: Optimize Database Performance with Indexes
-- Description: Adds indexes to frequently queried columns to reduce slow queries and improve response times.

-- Profiles & Auth
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Admin Users
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_bestseller ON public.products(bestseller);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Cart & Wishlist
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);

-- Audit/Activity Logs
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_entity_type ON public.admin_activity_logs(entity_type);

-- Coupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
