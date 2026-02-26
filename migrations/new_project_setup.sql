-- ================================================================
-- AURERXA - COMPLETE SUPABASE SETUP SCRIPT
-- Run this ONCE in the SQL Editor of your NEW Supabase project.
-- This is IDEMPOTENT – safe to run multiple times.
-- ================================================================


-- ============================================
-- SECTION 0: HELPER FUNCTIONS (Run FIRST)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
    AND role = 'main_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- SECTION 1: PROFILES & AUTH SYNC
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON COLUMN public.profiles.is_banned IS 'If true, user cannot login or access the site.';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================
-- SECTION 2: ADMIN USERS & ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('main_admin', 'support_admin', 'staff')) DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own admin status" ON public.admin_users;
CREATE POLICY "Users can view their own admin status" ON public.admin_users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Main admins can manage all admin users" ON public.admin_users;
CREATE POLICY "Main admins can manage all admin users" ON public.admin_users FOR ALL USING (is_main_admin());

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can insert activity logs" ON public.admin_activity_logs FOR INSERT WITH CHECK (is_admin());


-- ============================================
-- SECTION 3: CATEGORIES, SUB-CATEGORIES & PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS public.sub_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read sub_categories" ON public.sub_categories;
CREATE POLICY "Allow public read sub_categories" ON public.sub_categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage sub_categories" ON public.sub_categories;
CREATE POLICY "Admins can manage sub_categories" ON public.sub_categories FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id),
  sub_category_id UUID REFERENCES public.sub_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  images JSONB DEFAULT '[]'::JSONB,
  stock INTEGER DEFAULT 0,
  sizes TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  bestseller BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE,
  purity TEXT,
  gender TEXT DEFAULT 'Unisex',
  weight_grams DECIMAL(10, 2),
  dimensions_width TEXT,
  dimensions_height TEXT,
  dimensions_length TEXT,
  dimensions_unit TEXT DEFAULT 'mm',
  video_url TEXT,
  material_type TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products
ADD CONSTRAINT products_material_type_check
CHECK (material_type IS NULL OR TRIM(material_type) IN ('real_gold', 'gold_plated', 'bentex', 'silver', 'diamond'));

COMMENT ON COLUMN public.products.material_type IS
'Jewelry material type: real_gold | gold_plated | bentex | silver | diamond. NULL = unset.';

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (is_admin());

-- Auto-trim material_type whitespace
CREATE OR REPLACE FUNCTION trim_material_type()
RETURNS TRIGGER AS $$
BEGIN
    NEW.material_type = TRIM(NEW.material_type);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_trim_material_type ON public.products;
CREATE TRIGGER tr_trim_material_type
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION trim_material_type();


-- ============================================
-- SECTION 4: COUPONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  limit_per_user INTEGER DEFAULT 1,
  applies_to_shipping BOOLEAN DEFAULT FALSE,
  is_free_shipping BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read coupons" ON public.coupons;
CREATE POLICY "Allow public read coupons" ON public.coupons FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (is_admin());

-- Atomic coupon usage increment RPC
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE ILIKE(code, coupon_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- SECTION 5: ORDERS & CART
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  payment_gateway_order_id TEXT,
  payment_status TEXT DEFAULT 'awaiting',
  payment_error_reason TEXT,
  payment_attempts INTEGER DEFAULT 0,
  coupon_code TEXT,
  coupon_discount DECIMAL(10, 2) DEFAULT 0,
  gift_wrap BOOLEAN DEFAULT FALSE,
  gift_message TEXT,
  delivery_time_slot TEXT,
  tracking_number TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  return_reason TEXT,
  returned_at TIMESTAMPTZ,
  return_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can cancel own orders" ON public.orders;
CREATE POLICY "Users can cancel own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway_order_id ON public.orders(payment_gateway_order_id);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  size TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Cart Table
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id, size)
);

ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart;
CREATE POLICY "Users can manage own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_cart_updated_at ON public.cart;
CREATE TRIGGER set_cart_updated_at
BEFORE UPDATE ON public.cart
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();


-- ============================================
-- SECTION 6: PRODUCT REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'approved',
    guest_name TEXT,
    guest_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.product_reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.product_reviews;
CREATE POLICY "Authenticated users can insert reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================
-- SECTION 7: RETURNS
-- ============================================

CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('defective', 'wrong_product', 'damaged_in_transit')),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'pickup_scheduled', 'picked_up', 'in_transit', 'received', 'inspected', 'refunded', 'rejected')),
    tracking_number TEXT,
    label_url TEXT,
    pickup_date TIMESTAMP WITH TIME ZONE,
    video_link TEXT,
    evidence_photos JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own return requests" ON public.return_requests;
CREATE POLICY "Users can view own return requests" ON public.return_requests FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can create own return requests" ON public.return_requests;
CREATE POLICY "Users can create own return requests" ON public.return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update return requests" ON public.return_requests;
CREATE POLICY "Admins can update return requests" ON public.return_requests FOR UPDATE USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON public.return_requests(user_id);


-- ============================================
-- SECTION 8: SUPPORT (TICKETS & REPAIRS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  urgency TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Admins can update tickets" ON public.tickets;
CREATE POLICY "Admins can update tickets" ON public.tickets FOR UPDATE USING (is_admin());

CREATE TABLE IF NOT EXISTS public.repairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  order_number TEXT,
  issue_description TEXT NOT NULL,
  status TEXT DEFAULT 'requested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own repairs" ON public.repairs;
CREATE POLICY "Users can view own repairs" ON public.repairs FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Admins can update repairs" ON public.repairs;
CREATE POLICY "Admins can update repairs" ON public.repairs FOR UPDATE USING (is_admin());


-- ============================================
-- SECTION 9: BULK ORDERS
-- ============================================

CREATE TABLE IF NOT EXISTS public.bulk_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gst_number TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'confirmed', 'rejected')),
  admin_notes TEXT,
  quoted_total DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert bulk orders" ON public.bulk_orders;
CREATE POLICY "Allow public insert bulk orders" ON public.bulk_orders FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Users can view own bulk orders" ON public.bulk_orders;
CREATE POLICY "Users can view own bulk orders" ON public.bulk_orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
DROP POLICY IF EXISTS "Admins can manage bulk orders" ON public.bulk_orders;
CREATE POLICY "Admins can manage bulk orders" ON public.bulk_orders FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS public.bulk_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bulk_order_id UUID REFERENCES public.bulk_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  retail_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 10),
  quoted_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bulk_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert bulk order items" ON public.bulk_order_items;
CREATE POLICY "Allow public insert bulk order items" ON public.bulk_order_items FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Users can view own bulk order items" ON public.bulk_order_items;
CREATE POLICY "Users can view own bulk order items" ON public.bulk_order_items FOR SELECT USING (
  is_admin() OR EXISTS (SELECT 1 FROM public.bulk_orders WHERE bulk_orders.id = bulk_order_items.bulk_order_id AND bulk_orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins can manage bulk order items" ON public.bulk_order_items;
CREATE POLICY "Admins can manage bulk order items" ON public.bulk_order_items FOR ALL USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_bulk_orders_status ON public.bulk_orders(status);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_user_id ON public.bulk_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_order_items_bulk_order_id ON public.bulk_order_items(bulk_order_id);


-- ============================================
-- SECTION 10: MISC (GOLD RATES, NEWSLETTER, etc.)
-- ============================================

CREATE TABLE IF NOT EXISTS public.gold_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purity TEXT NOT NULL UNIQUE,
  rate DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gold_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gold rates" ON public.gold_rates;
CREATE POLICY "Allow public read gold rates" ON public.gold_rates FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage gold rates" ON public.gold_rates;
CREATE POLICY "Admins can manage gold rates" ON public.gold_rates FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Public can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS public.custom_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  description TEXT NOT NULL,
  budget TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view custom orders" ON public.custom_orders;
CREATE POLICY "Admins can view custom orders" ON public.custom_orders FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can update custom orders" ON public.custom_orders;
CREATE POLICY "Admins can update custom orders" ON public.custom_orders FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "Public can insert custom orders" ON public.custom_orders;
CREATE POLICY "Public can insert custom orders" ON public.custom_orders FOR INSERT WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
CREATE POLICY "Public can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);


-- ============================================
-- SECTION 11: SERVICES
-- ============================================

CREATE TABLE IF NOT EXISTS public.virtual_try_on_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
  preferred_date DATE, preferred_time TIME,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.virtual_try_on_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert try-on" ON public.virtual_try_on_requests;
CREATE POLICY "Allow public insert try-on" ON public.virtual_try_on_requests FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admins can view try-on" ON public.virtual_try_on_requests;
CREATE POLICY "Admins can view try-on" ON public.virtual_try_on_requests FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can update try-on" ON public.virtual_try_on_requests;
CREATE POLICY "Admins can update try-on" ON public.virtual_try_on_requests FOR UPDATE USING (is_admin());

CREATE TABLE IF NOT EXISTS public.gold_harvest_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
  monthly_amount DECIMAL(10, 2), status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.gold_harvest_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert gold harvest" ON public.gold_harvest_leads;
CREATE POLICY "Allow public insert gold harvest" ON public.gold_harvest_leads FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admins can view gold harvest" ON public.gold_harvest_leads;
CREATE POLICY "Admins can view gold harvest" ON public.gold_harvest_leads FOR SELECT USING (is_admin());

CREATE TABLE IF NOT EXISTS public.jewelry_care_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
  service_type TEXT, preferred_date DATE, status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.jewelry_care_appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert jewelry care" ON public.jewelry_care_appointments;
CREATE POLICY "Allow public insert jewelry care" ON public.jewelry_care_appointments FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admins can view jewelry care" ON public.jewelry_care_appointments;
CREATE POLICY "Admins can view jewelry care" ON public.jewelry_care_appointments FOR SELECT USING (is_admin());

CREATE TABLE IF NOT EXISTS public.boutique_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
  preferred_date DATE, preferred_time TIME, visit_reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.boutique_appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert boutique" ON public.boutique_appointments;
CREATE POLICY "Allow public insert boutique" ON public.boutique_appointments FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admins can view boutique" ON public.boutique_appointments;
CREATE POLICY "Admins can view boutique" ON public.boutique_appointments FOR SELECT USING (is_admin());


-- ============================================
-- SECTION 12: HERO SLIDES
-- ============================================

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  cta_text TEXT DEFAULT 'Explore',
  cta_link TEXT DEFAULT '/collections',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active slides" ON public.hero_slides;
CREATE POLICY "Public can view active slides" ON public.hero_slides FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Admins can manage slides" ON public.hero_slides;
CREATE POLICY "Admins can manage slides" ON public.hero_slides FOR ALL USING (is_admin());

-- Seed hero slides
INSERT INTO public.hero_slides (image_url, title, subtitle, cta_text, cta_link, sort_order)
VALUES
  ('/photo_6066572646712807057_y.webp', 'Bridal Series', 'Where Tradition Meets Eternity', 'Explore Collection', '/collections/bridal', 1),
  ('/pexels-the-glorious-studio-3584518-29245554.webp', 'Gold Harvest', 'Secure Your Future in Gold', 'Start Saving', '/gold-harvest', 2)
ON CONFLICT DO NOTHING;


-- ============================================
-- SECTION 13: SITE SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read site_settings" ON public.site_settings;
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

INSERT INTO public.site_settings (key, value) VALUES
  ('shipping_config', '{"free_shipping_threshold": 50000, "default_shipping_fee": 90, "is_enabled": true}'::JSONB),
  ('maintenance_config', '{"is_enabled": false, "message": "AURERXA is upgrading to serve you better. We will be back shortly."}'::JSONB),
  ('contact_config', '{"phone": "+91 9391032677", "email": "support@aurerxa.com", "whatsapp": "+91 9391032677", "address": "Captain Lakshmi Chowk, Rangargalli, Sangamner, Maharashtra 422605"}'::JSONB),
  ('marketing_config', '{"banner_enabled": false, "banner_text": "Special Edition Heritage Collection - Now Live", "banner_link": "/collections"}'::JSONB)
ON CONFLICT (key) DO NOTHING;


-- ============================================
-- SECTION 14: INTERNAL NOTES
-- ============================================

CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('order', 'user', 'product', 'general')),
  entity_id UUID NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all notes" ON public.internal_notes;
CREATE POLICY "Admins can view all notes" ON public.internal_notes FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert notes" ON public.internal_notes;
CREATE POLICY "Admins can insert notes" ON public.internal_notes FOR INSERT WITH CHECK (is_admin());

CREATE INDEX IF NOT EXISTS idx_internal_notes_entity ON public.internal_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_flagged ON public.internal_notes(is_flagged) WHERE is_flagged = TRUE;


-- ============================================
-- SECTION 15: VISITOR INTELLIGENCE
-- ============================================

CREATE TABLE IF NOT EXISTS public.visitor_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    identity_data JSONB DEFAULT '{}'::JSONB,
    device_info JSONB DEFAULT '{}'::JSONB,
    marketing_info JSONB DEFAULT '{}'::JSONB,
    behavior_summary JSONB DEFAULT '{"page_views": [], "interaction_count": 0}'::JSONB,
    consent_data JSONB DEFAULT '{"status": "undecided"}'::JSONB,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.visitor_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage visitor intelligence" ON public.visitor_intelligence;
CREATE POLICY "Admins can manage visitor intelligence" ON public.visitor_intelligence FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Allow anonymous upsert by session_id" ON public.visitor_intelligence;
CREATE POLICY "Allow anonymous upsert by session_id" ON public.visitor_intelligence FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS visitor_intelligence_session_idx ON public.visitor_intelligence (session_id);
CREATE INDEX IF NOT EXISTS visitor_intelligence_user_idx ON public.visitor_intelligence (user_id);

-- Scalable RPC for logging visitor events (prevents race conditions)
CREATE OR REPLACE FUNCTION public.log_visitor_event_v2(
    p_session_id TEXT,
    p_event_name TEXT,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_interest TEXT;
BEGIN
    v_interest := p_metadata->>'interest';
    INSERT INTO public.visitor_intelligence (session_id, behavior_summary, last_active, created_at)
    VALUES (
        p_session_id,
        jsonb_build_object(
            'page_views', jsonb_build_array(jsonb_build_object('event', p_event_name, 'timestamp', now(), 'meta', p_metadata)),
            'interaction_count', 1,
            'interests', CASE WHEN v_interest IS NOT NULL THEN jsonb_build_object(v_interest, 1) ELSE '{}'::JSONB END
        ),
        now(), now()
    )
    ON CONFLICT (session_id) DO UPDATE SET
        behavior_summary = jsonb_build_object(
            'page_views',
            COALESCE(visitor_intelligence.behavior_summary->'page_views', '[]'::JSONB) || jsonb_build_object('event', p_event_name, 'timestamp', now(), 'meta', p_metadata),
            'interaction_count', COALESCE((visitor_intelligence.behavior_summary->>'interaction_count')::INT, 0) + 1,
            'interests', CASE
                WHEN v_interest IS NOT NULL
                THEN jsonb_set(
                    COALESCE(visitor_intelligence.behavior_summary->'interests', '{}'::JSONB),
                    ARRAY[v_interest],
                    to_jsonb(COALESCE((visitor_intelligence.behavior_summary->'interests'->>v_interest)::INT, 0) + 1)
                )
                ELSE COALESCE(visitor_intelligence.behavior_summary->'interests', '{}'::JSONB)
            END
        ),
        last_active = now();
END;
$$;


-- ============================================
-- SECTION 16: ERROR LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    error_message TEXT,
    error_stack TEXT,
    pathname TEXT,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;
CREATE POLICY "Anyone can insert error logs" ON public.error_logs FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Only admins can view error logs" ON public.error_logs;
CREATE POLICY "Only admins can view error logs" ON public.error_logs FOR SELECT USING (is_admin());


-- ============================================
-- SECTION 17: PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS products_name_description_search_idx ON public.products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS products_filter_composite_idx ON public.products (category_id, price, gender);
CREATE INDEX IF NOT EXISTS products_bestseller_idx ON public.products (bestseller) WHERE bestseller = TRUE;
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN (tags);
CREATE INDEX IF NOT EXISTS optimize_admin_stats_idx ON public.orders(status, created_at DESC);


-- ============================================
-- SECTION 18: ADMIN HELPER FUNCTIONS
-- ============================================

-- Function to increment product stock (used by admin restock feature)
CREATE OR REPLACE FUNCTION public.increment_product_stock(p_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock = stock + p_qty
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_product_stock(UUID, INT) TO service_role;


-- ============================================
-- SECTION 19: STORAGE BUCKETS
-- ============================================

-- Products bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', TRUE) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public View Products Images" ON storage.objects;
CREATE POLICY "Public View Products Images" ON storage.objects FOR SELECT USING (bucket_id = 'products');
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND is_admin());
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND is_admin());

-- Reviews bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('review', 'review', TRUE) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public View Review Images" ON storage.objects;
CREATE POLICY "Public View Review Images" ON storage.objects FOR SELECT USING (bucket_id = 'review');
DROP POLICY IF EXISTS "Public Upload Review Images" ON storage.objects;
CREATE POLICY "Public Upload Review Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review');

-- Return proof bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('Return-proof', 'Return-proof', TRUE) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public Access Proof" ON storage.objects;
CREATE POLICY "Public Access Proof" ON storage.objects FOR SELECT USING (bucket_id = 'Return-proof');
DROP POLICY IF EXISTS "Allow Authenticated Uploads" ON storage.objects;
CREATE POLICY "Allow Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'Return-proof' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow Admin Deletes" ON storage.objects;
CREATE POLICY "Allow Admin Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'Return-proof' AND is_admin());


-- ================================================================
-- ✅ SETUP COMPLETE!
-- Next Steps:
-- 1. Run this script in your new Supabase project's SQL Editor.
-- 2. Go to Authentication → Settings and configure your site URL and redirect URLs.
-- 3. Update .env.local with the new project URL and Anon Key.
-- 4. Migrate your existing data using pg_dump or Supabase's migration tools.
-- ================================================================
