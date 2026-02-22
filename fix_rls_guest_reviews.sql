-- FIX: Allow Guest Review Submissions
-- Run this in your Supabase SQL Editor if you see RLS errors for product_reviews

-- 1. Ensure the columns exist (in case migration was missed)
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE product_reviews ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE product_reviews ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow guest submissions" ON product_reviews;
DROP POLICY IF EXISTS "Public can insert reviews" ON product_reviews;
DROP POLICY IF EXISTS "Insert reviews for authenticated users" ON product_reviews;

-- 3. Create a NEW policy that explicitly allows GUEST and LOGGED-IN insertions
-- 'TO public' covers both authenticated and anonymous users.
CREATE POLICY "Allow guest submissions"
ON product_reviews FOR INSERT
TO public
WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
);

-- 4. Ensure everyone can see approved reviews
DROP POLICY IF EXISTS "Enable read access for approved reviews" ON product_reviews;
CREATE POLICY "Enable read access for approved reviews"
ON product_reviews FOR SELECT
TO public
USING (status = 'approved');

-- 5. Storage Fix (Allow guest images)
-- Run this to ensure guests can upload photos to the 'review' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review', 'review', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Upload Review Images" ON storage.objects;
CREATE POLICY "Public Upload Review Images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
    bucket_id = 'review'
);
