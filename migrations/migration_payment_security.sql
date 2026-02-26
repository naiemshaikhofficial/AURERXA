-- Migration: Add payment security and return tracking columns to orders
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (idempotent)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_gateway_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'awaiting';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_error_reason text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_attempts integer DEFAULT 0;

-- Return tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reason text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS returned_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_status text;

-- Add index for gateway order ID for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway_order_id ON orders(payment_gateway_order_id);
