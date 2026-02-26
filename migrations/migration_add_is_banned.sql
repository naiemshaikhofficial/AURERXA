-- Run this in your Supabase SQL Editor to add the is_banned column

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_banned boolean default false;

-- Optional: Add a comment
COMMENT ON COLUMN profiles.is_banned IS 'If true, user cannot login or access the site.';
