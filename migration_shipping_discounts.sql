-- Add shipping discount support to coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applies_to_shipping BOOLEAN DEFAULT FALSE;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_free_shipping BOOLEAN DEFAULT FALSE;
