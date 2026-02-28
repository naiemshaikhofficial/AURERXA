-- Migration: Add bank_ref_no to orders table
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (idempotent)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS bank_ref_no text;

-- Add comment for clarity
COMMENT ON COLUMN orders.bank_ref_no IS 'External gateway bank reference number (e.g., CCAvenue bank_ref_no)';
