-- Add tags support to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create an index for faster tag filtering
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);
