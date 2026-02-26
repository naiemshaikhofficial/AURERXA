-- Migration: Enable Guest Reviews (no login required)
-- Run this in Supabase SQL Editor

-- 1. Make user_id nullable (allow guest reviews)
ALTER TABLE product_reviews ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add guest reviewer columns
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- 3. Update RLS: Allow anonymous inserts via service role (handled server-side)
-- The existing SELECT policy already allows anyone to view approved reviews.
-- INSERT will be done via supabaseServer (service role), which bypasses RLS.

-- 4. Allow public uploads to review bucket (for guest photo uploads)
DROP POLICY IF EXISTS "Public Upload Review Images" ON storage.objects;
CREATE POLICY "Public Upload Review Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'review'
);
