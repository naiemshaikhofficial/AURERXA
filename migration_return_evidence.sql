-- Migration: Add return evidence columns and storage bucket
-- 1. Add columns to return_requests
ALTER TABLE public.return_requests 
ADD COLUMN IF NOT EXISTS video_link TEXT,
ADD COLUMN IF NOT EXISTS evidence_photos JSONB DEFAULT '[]'::jsonb;

-- 2. Create the "Return-proof" bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('Return-proof', 'Return-proof', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
DROP POLICY IF EXISTS "Public Access Proof" ON storage.objects;
CREATE POLICY "Public Access Proof"
ON storage.objects FOR SELECT
USING ( bucket_id = 'Return-proof' );

DROP POLICY IF EXISTS "Allow Authenticated Uploads" ON storage.objects;
CREATE POLICY "Allow Authenticated Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'Return-proof' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Allow Admin Deletes" ON storage.objects;
CREATE POLICY "Allow Admin Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'Return-proof' AND is_admin() );
