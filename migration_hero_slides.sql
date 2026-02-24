-- Migration: Create hero_slides table for dynamic carousel
-- Run this in Supabase SQL Editor

create table if not exists hero_slides (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,        -- Desktop Banner URL
  mobile_image_url text,          -- Optional Mobile Banner
  title text not null,            -- "Bridal Series", "Gold Harvest"
  subtitle text,                  -- "Tradition Meets Modernity"
  cta_text text default 'Explore', -- "Shop Now", "Learn More"
  cta_link text default '/collections',
  sort_order integer default 0,   -- Lower number = Higher priority
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table hero_slides enable row level security;
drop policy if exists "Public can view active slides" on hero_slides;
create policy "Public can view active slides" on hero_slides for select using (is_active = true);

drop policy if exists "Admins can manage slides" on hero_slides;
create policy "Admins can manage slides" on hero_slides for all using (is_admin());

-- Seed Data: Bridal Series (Priority 1)
insert into hero_slides (image_url, title, subtitle, cta_text, cta_link, sort_order)
values 
(
  '/photo_6066572646712807057_y.webp', -- Placeholder until user provides specific image, using existing high-quality asset
  'Bridal Series', 
  'Where Tradition Meets Eternity', 
  'Explore Collection', 
  '/collections/bridal', 
  1
)
on conflict do nothing;

-- Seed Data: Gold Harvest (Priority 2)
insert into hero_slides (image_url, title, subtitle, cta_text, cta_link, sort_order)
values 
(
  '/pexels-the-glorious-studio-3584518-29245554.webp', 
  'Gold Harvest', 
  'Secure Your Future in Gold', 
  'Start Saving', 
  '/gold-harvest', 
  2
)
on conflict do nothing;
