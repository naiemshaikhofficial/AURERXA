-- Migration: Add detailed payment info columns
-- This adds card_name and payment_mode to support showing "UPI", "Visa (4242)", etc.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_mode text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_name text;

COMMENT ON COLUMN orders.payment_mode IS 'Specific type of payment (Credit Card, UPI, etc.)';
COMMENT ON COLUMN orders.card_name IS 'Provider or Card Type (Visa, HDFC, Google Pay, etc.)';
