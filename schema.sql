-- Run this SQL in your Supabase SQL Editor to update/create tables

-- Categories Table (Enhanced)
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  description text,
  image_url text not null, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table (Enhanced with Stock, Sizes, etc.)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text not null,
  stock integer default 0,
  sizes text[] default '{}',
  featured boolean default false,
  bestseller boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table categories enable row level security;
alter table products enable row level security;

-- Policies
create policy "Allow public read categories" on categories for select using (true);
create policy "Allow public read products" on products for select using (true);

-- Functions to clear data if needed (Optional, user can do this in dashboard)
-- truncate table products, categories cascade;

-- Seed Data (Examples)
-- Insert Categories
insert into categories (slug, name, description, image_url) values
  ('gold', 'Gold', 'Timeless 22K and 24K gold jewelry', '/heritage-rings.jpg'),
  ('silver', 'Silver', 'Premium sterling silver collection', '/stock-photo-pair-of-silver-rings-with-small-diamonds-for-lovers.jpg'),
  ('diamond', 'Diamond', 'Exquisite diamond masterpieces', '/pexels-abhishek-saini-1415858-3847212.jpg'),
  ('platinum', 'Platinum', 'The rarest metal for unique moments', '/platinum-ring.jpg')
on conflict (slug) do update set image_url = excluded.image_url;

-- Insert Products (Linked to categories dynamically would require IDs, doing simple inserts assuming user will manage or IDs correspond)
-- NOTE: In a real scenario, you'd insert using the returned IDs or specific UUIDs.
-- Here is a template for the user to run in SQL Editor:

/*
do $$
declare
  gold_id uuid;
  diamond_id uuid;
begin
  select id into gold_id from categories where slug = 'gold';
  select id into diamond_id from categories where slug = 'diamond';

  insert into products (category_id, name, description, price, image_url, stock, sizes, bestseller) values
  (gold_id, 'Royal Gold Necklace', '24K Solid Gold Chain with Pendant', 125000, '/pexels-janakukebal-30541179.jpg', 10, ARRAY['16"', '18"', '20"'], true),
  (diamond_id, 'Solitaire Diamond Ring', '1.5 Carat VVS1 Diamond Ring', 450000, '/pexels-janakukebal-30541170.jpg', 5, ARRAY['6', '7', '8', '9'], true);
end $$;
*/
