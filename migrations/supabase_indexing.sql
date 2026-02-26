-- 1. Create GIN Index for Full-Text Search on Products
-- This ensures that search by name and description is instant even with 10k+ products.
CREATE INDEX IF NOT EXISTS products_name_description_search_idx 
ON products 
USING gin (to_tsvector('english', name || ' ' || description));

-- 2. Create Composite Index for Product Filtering
-- Optimizes common filter combinations: category_id + price + gender
CREATE INDEX IF NOT EXISTS products_filter_composite_idx 
ON products (category_id, price, gender);

-- 3. Create Index for Bestseller and New Release queries
CREATE INDEX IF NOT EXISTS products_bestseller_idx ON products (bestseller) WHERE bestseller = true;
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);

-- 4. Error Logs Table for Sturdiness
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    error_message TEXT,
    error_stack TEXT,
    pathname TEXT,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB
);

-- RLS for error_logs (Only admins or service role should read, anyone can insert)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert error logs" ON error_logs;
CREATE POLICY "Anyone can insert error logs" 
ON error_logs FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view error logs" ON error_logs;
CREATE POLICY "Only admins can view error logs" 
ON error_logs FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'approved', -- Auto-approve for now, can be changed to 'pending'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON product_reviews;
CREATE POLICY "Anyone can view approved reviews" 
ON product_reviews FOR SELECT 
USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON product_reviews;
CREATE POLICY "Authenticated users can insert reviews" 
ON product_reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Storage Bucket for Reviews
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('review', 'review', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Objects (Storage schema)
-- 1. Anyone can view review images
DROP POLICY IF EXISTS "Public View Review Images" ON storage.objects;
CREATE POLICY "Public View Review Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review');

-- 2. Authenticated users can upload review images
DROP POLICY IF EXISTS "Authenticated Upload Review Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Review Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'review' 
    AND auth.role() = 'authenticated'
);
