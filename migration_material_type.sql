-- Migration: Add material_type to products
-- Run this in Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS material_type TEXT 
CHECK (material_type IN ('real_gold', 'gold_plated', 'bentex', 'silver', 'diamond'));

COMMENT ON COLUMN products.material_type IS 
'Jewelry material type: real_gold | gold_plated | bentex | silver | diamond. NULL = unset.';
