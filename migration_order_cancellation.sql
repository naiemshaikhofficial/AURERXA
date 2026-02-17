-- Migration: Add cancellation tracking columns to orders
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (idempotent)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- Allow users to update their own orders (for cancellation)
DROP POLICY IF EXISTS "Users can cancel own orders" ON orders;
CREATE POLICY "Users can cancel own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own orders
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
