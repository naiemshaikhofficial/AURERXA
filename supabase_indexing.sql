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

CREATE POLICY "Anyone can insert error logs" 
ON error_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view error logs" 
ON error_logs FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');
