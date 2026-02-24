-- Migration: Add material_type to products
-- Run this in Supabase SQL Editor

-- 1. Drop old constraint if you already ran it
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_material_type_check;

-- 2. Add a robust constraint that ignores accidental spaces
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS material_type TEXT;

ALTER TABLE products
ADD CONSTRAINT products_material_type_check 
CHECK (TRIM(material_type) IN ('real_gold', 'gold_plated', 'bentex', 'silver', 'diamond'));

-- 3. Optional: Auto-trim whitespace on entry (Best for manual edits)
CREATE OR REPLACE FUNCTION trim_material_type() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.material_type = TRIM(NEW.material_type);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_trim_material_type ON products;
CREATE TRIGGER tr_trim_material_type
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION trim_material_type();

COMMENT ON COLUMN products.material_type IS 
'Jewelry material type: real_gold | gold_plated | bentex | silver | diamond. NULL = unset.';
