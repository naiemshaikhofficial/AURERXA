-- ============================================================
-- AURERXA: Dynamic Pricing System Migration
-- Run this ONCE in Supabase SQL Editor
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT guards)
-- ============================================================

-- ============================================================
-- STEP 1: Extend products table with pricing fields
-- ============================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS making_type TEXT DEFAULT 'Plain'
    CHECK (making_type IN ('Plain','Designer','Handcrafted')),
  ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'none'
    CHECK (pricing_type IN ('size_based','length_based','fixed','none')),
  ADD COLUMN IF NOT EXISTS base_size INTEGER DEFAULT 16,
  ADD COLUMN IF NOT EXISTS base_weight DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS weight_per_unit DECIMAL(10,4),
  ADD COLUMN IF NOT EXISTS packaging_cost_override DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS platform_fee_pct_override DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS fixed_price_override DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS is_dynamic_pricing BOOLEAN DEFAULT false;

-- Backfill base_weight from weight_grams for all existing products
UPDATE products
  SET base_weight = weight_grams
  WHERE base_weight IS NULL AND weight_grams IS NOT NULL;

-- Mark all ring products as size_based dynamic pricing
UPDATE products
  SET
    pricing_type = 'size_based',
    is_dynamic_pricing = true,
    making_type = 'Plain'
  WHERE
    is_dynamic_pricing = false
    AND (
      EXISTS (
        SELECT 1 FROM categories c
        WHERE c.id = products.category_id
        AND LOWER(c.slug) LIKE '%ring%'
      )
      OR LOWER(products.name) LIKE '%ring%'
    );

-- ============================================================
-- STEP 2: global_config table
-- ============================================================
CREATE TABLE IF NOT EXISTS global_config (
  key TEXT PRIMARY KEY,
  value DECIMAL(10,4) NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE global_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read global_config" ON global_config;
CREATE POLICY "Public read global_config" ON global_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage global_config" ON global_config;
CREATE POLICY "Admins manage global_config" ON global_config
  FOR ALL USING (is_admin());

-- Seed default values (safe to re-run)
INSERT INTO global_config (key, value, description) VALUES
  ('packaging_cost',         50.00,  'Default packaging cost in INR'),
  ('platform_fee_pct',        5.00,  'Platform fee % of base cost'),
  ('margin_percent',         30.00,  'Default profit margin %'),
  ('making_plain_pct',       18.00,  'Making charge % for Plain type'),
  ('making_designer_pct',    28.00,  'Making charge % for Designer type'),
  ('making_handcrafted_pct', 38.00,  'Making charge % for Handcrafted type'),
  ('ring_base_price_size16', 1999.00,'Anchor price for rings at size 16 (INR)')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- STEP 3: PostgreSQL helper function for price calculation
-- Called from Edge Functions or server-side RPC
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_dynamic_price(
  p_base_weight     DECIMAL,
  p_selected_param  DECIMAL,   -- size (for rings) or length in inches (for chains)
  p_pricing_type    TEXT,       -- 'size_based' | 'length_based' | 'fixed'
  p_base_size       INTEGER,    -- default 16
  p_weight_per_unit DECIMAL,   -- used for length_based
  p_purity          TEXT,       -- '925' or '999'
  p_making_type     TEXT,       -- 'Plain' | 'Designer' | 'Handcrafted'
  p_silver_rate     DECIMAL,    -- INR per gram from gold_rates
  p_packaging       DECIMAL DEFAULT 50,
  p_platform_fee    DECIMAL DEFAULT 5,
  p_margin          DECIMAL DEFAULT 30,
  p_anchor_price    DECIMAL DEFAULT 1699
) RETURNS TABLE (
  adjusted_weight   DECIMAL,
  metal_cost        DECIMAL,
  making_cost       DECIMAL,
  base_cost         DECIMAL,
  final_price       DECIMAL,
  profit_amount     DECIMAL,
  actual_margin_pct DECIMAL
) LANGUAGE plpgsql AS $$
DECLARE
  v_weight        DECIMAL;
  v_purity_factor DECIMAL;
  v_making_pct    DECIMAL;
  v_metal         DECIMAL;
  v_making        DECIMAL;
  v_base          DECIMAL;
  v_with_fee      DECIMAL;
  v_final         DECIMAL;
BEGIN
  -- 1. Adjusted weight based on pricing_type
  IF p_pricing_type = 'size_based' THEN
    v_weight := p_base_weight * (1 + ((p_selected_param - p_base_size) * 0.03));
  ELSIF p_pricing_type = 'length_based' THEN
    v_weight := COALESCE(p_weight_per_unit, p_base_weight) * p_selected_param;
  ELSE
    v_weight := COALESCE(p_base_weight, 0);
  END IF;
  v_weight := ROUND(v_weight, 2);

  -- 2. Purity factor
  IF p_purity = '925' THEN
    v_purity_factor := 0.925;
  ELSE
    v_purity_factor := 1.0;
  END IF;

  -- 3. Metal cost
  v_metal := v_weight * p_silver_rate * v_purity_factor;

  -- 4. Making charge
  IF p_making_type = 'Designer' THEN
    v_making_pct := 28;
  ELSIF p_making_type = 'Handcrafted' THEN
    v_making_pct := 38;
  ELSE
    v_making_pct := 18;
  END IF;
  v_making := v_metal * (v_making_pct / 100);

  -- 5. Base cost
  v_base := v_metal + v_making + p_packaging;

  -- 6. Platform fee + margin
  v_with_fee := v_base * (1 + p_platform_fee / 100);
  v_final := v_with_fee * (1 + p_margin / 100);

  -- 7. Psychological rounding: floor to nearest 100 then + 99
  v_final := FLOOR(v_final / 100) * 100 + 99;

  adjusted_weight   := v_weight;
  metal_cost        := ROUND(v_metal, 2);
  making_cost       := ROUND(v_making, 2);
  base_cost         := ROUND(v_base, 2);
  final_price       := v_final;
  profit_amount     := ROUND(v_final - v_base, 2);
  actual_margin_pct := ROUND(((v_final - v_base) / NULLIF(v_final, 0)) * 100, 2);

  RETURN NEXT;
END;
$$;

-- ============================================================
-- Done! Verify with:
-- SELECT * FROM global_config;
-- SELECT making_type, pricing_type, base_weight, is_dynamic_pricing FROM products LIMIT 5;
-- ============================================================
