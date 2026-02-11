-- Run this in your Supabase SQL Editor to add the video_url column

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS video_url text;

-- Optional: Add a comment
COMMENT ON COLUMN products.video_url IS 'YouTube URL for product video embed';
