-- ============================================================
-- AURERXA: Advanced Pricing Controls (Per-Product Margin & Min Price)
-- ============================================================

-- STEP 1: Add per-product override fields
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS margin_percent_override DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS min_price_threshold DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS tax_pct_override DECIMAL(5,2);

-- STEP 2: Add global tax configuration
INSERT INTO global_config (key, value, description) VALUES
  ('tax_percent', 3.00, 'Global GST/Tax percentage for jewelry')
ON CONFLICT (key) DO NOTHING;

-- STEP 3: Update global_config with shipping if missing
INSERT INTO global_config (key, value, description) VALUES
  ('shipping_cost', 0.00, 'Default shipping cost (set to 0 for free shipping)')
ON CONFLICT (key) DO NOTHING;
