-- Migration: Add ImageShack Slide to Hero Carousel
-- Run this in Supabase SQL Editor

-- Insert new slide with higher priority (0) to appear first or second
insert into hero_slides (image_url, title, subtitle, cta_text, cta_link, sort_order)
values 
(
  'https://imagizer.imageshack.com/img924/5452/drr5yB.png', 
  'Timeless Elegance', 
  'Crafted for Eternity', 
  'View Details', 
  '/collections', 
  0
)
on conflict do nothing;

-- Optional: Reorder other slides if needed
-- update hero_slides set sort_order = 1 where title = 'Bridal Series';
