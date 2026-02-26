-- Add per-user limit to coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS limit_per_user INTEGER DEFAULT 1;

-- Ensure used_count exists (it should, but just in case for older schemas)
-- ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;

-- RPC to atomically increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE ilike(code, coupon_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
