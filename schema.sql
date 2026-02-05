-- Run this SQL in your Supabase SQL Editor to update/create tables
-- This script is IDEMPOTENT (Safe to run multiple times)

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone_number text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

-- Policies (Drop first to avoid errors)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- ============================================
-- 2. ADDRESSES TABLE
-- ============================================
create table if not exists addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text default 'Home',
  full_name text not null,
  phone text not null,
  street_address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table addresses enable row level security;

drop policy if exists "Users can view own addresses" on addresses;
create policy "Users can view own addresses" on addresses for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own addresses" on addresses;
create policy "Users can insert own addresses" on addresses for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own addresses" on addresses;
create policy "Users can update own addresses" on addresses for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on addresses;
create policy "Users can delete own addresses" on addresses for delete using (auth.uid() = user_id);

-- ============================================
-- 3. CATEGORIES TABLE
-- ============================================
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  description text,
  image_url text not null, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table categories enable row level security;

drop policy if exists "Allow public read categories" on categories;
create policy "Allow public read categories" on categories for select using (true);

-- ============================================
-- 4. PRODUCTS TABLE
-- ============================================
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text not null,
  images text[] default '{}',
  stock integer default 0,
  sizes text[] default '{}',
  featured boolean default false,
  bestseller boolean default false,
  slug text unique, -- [NEW] Product URL slug
  -- We add columns via ALTER below to ensure they exist on re-runs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure new columns exist (Idempotent updates)
alter table products add column if not exists purity text;
alter table products add column if not exists gender text default 'Unisex';
alter table products add column if not exists weight_grams decimal(10, 2);
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure new columns exist
alter table products add column if not exists purity text;
alter table products add column if not exists gender text default 'Unisex';
alter table products add column if not exists weight_grams decimal(10, 2);
alter table products add column if not exists images text[] default '{}';
alter table products add column if not exists slug text unique;

-- Function: Slugify
create or replace function public.slugify(v text)
returns text as $$
begin
  return trim(both '-' from regexp_replace(lower(v), '[^a-z0-9]+', '-', 'g'));
end;
$$ language plpgsql;

-- Trigger: Auto-generate slug
create or replace function public.handle_product_slug() 
returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.slugify(new.name);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_product_save_slug on products;
create trigger on_product_save_slug
  before insert or update on products
  for each row execute procedure public.handle_product_slug();

-- Backfill slugs for existing products
update products set slug = public.slugify(name) where slug is null;

alter table products enable row level security;

drop policy if exists "Allow public read products" on products;
create policy "Allow public read products" on products for select using (true);

-- ============================================
-- 5. WISHLIST TABLE
-- ============================================
create table if not exists wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

alter table wishlist enable row level security;

drop policy if exists "Users can view own wishlist" on wishlist;
create policy "Users can view own wishlist" on wishlist for select using (auth.uid() = user_id);

drop policy if exists "Users can add to own wishlist" on wishlist;
create policy "Users can add to own wishlist" on wishlist for insert with check (auth.uid() = user_id);

drop policy if exists "Users can remove from own wishlist" on wishlist;
create policy "Users can remove from own wishlist" on wishlist for delete using (auth.uid() = user_id);

-- ============================================
-- 6. CART TABLE
-- ============================================
create table if not exists cart (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity integer default 1,
  size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id, size)
);

alter table cart enable row level security;

drop policy if exists "Users can view own cart" on cart;
create policy "Users can view own cart" on cart for select using (auth.uid() = user_id);

drop policy if exists "Users can add to own cart" on cart;
create policy "Users can add to own cart" on cart for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own cart" on cart;
create policy "Users can update own cart" on cart for update using (auth.uid() = user_id);

drop policy if exists "Users can remove from own cart" on cart;
create policy "Users can remove from own cart" on cart for delete using (auth.uid() = user_id);

-- ============================================
-- 7. ORDERS TABLE
-- ============================================
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  status text default 'pending',
  subtotal decimal(10, 2) not null,
  shipping decimal(10, 2) default 0,
  total decimal(10, 2) not null,
  shipping_address jsonb not null,
  payment_method text,
  payment_id text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure optional columns exist
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists coupon_discount decimal(10, 2) default 0;
alter table orders add column if not exists gift_wrap boolean default false;
alter table orders add column if not exists gift_message text;

alter table orders enable row level security;

drop policy if exists "Users can view own orders" on orders;
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on orders;
create policy "Users can create own orders" on orders for insert with check (auth.uid() = user_id);

-- ============================================
-- 8. ORDER ITEMS TABLE
-- ============================================
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null,
  size text,
  price decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table order_items enable row level security;

drop policy if exists "Users can view own order items" on order_items;
create policy "Users can view own order items" on order_items for select 
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

drop policy if exists "Users can create order items" on order_items;
create policy "Users can create order items" on order_items for insert 
  with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- ============================================
-- 9. CUSTOMER SUPPORT TABLES (NEW)
-- ============================================

-- TICKETS
create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  message text not null,
  status text default 'open', 
  urgency text default 'normal',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tickets enable row level security;

drop policy if exists "Users can view own tickets" on tickets;
create policy "Users can view own tickets" on tickets for select using (auth.uid() = user_id);

drop policy if exists "Users can create own tickets" on tickets;
create policy "Users can create own tickets" on tickets for insert with check (auth.uid() = user_id);

-- REPAIRS
create table if not exists repairs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_name text not null,
  order_number text, 
  issue_description text not null,
  status text default 'requested',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table repairs enable row level security;

drop policy if exists "Users can view own repairs" on repairs;
create policy "Users can view own repairs" on repairs for select using (auth.uid() = user_id);

drop policy if exists "Users can create own repairs" on repairs;
create policy "Users can create own repairs" on repairs for insert with check (auth.uid() = user_id);

-- ============================================
-- 10. TRIGGER
-- ============================================
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Triggers are harder to drop via 'IF EXISTS', but replacing the function handles the logic update.
-- Drop trigger if we want to be clean:
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- 11. COUPONS TABLE
-- ============================================
create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_type text not null default 'percentage',
  discount_value decimal(10, 2) not null,
  min_order_value decimal(10, 2) default 0,
  max_discount decimal(10, 2),
  valid_from timestamp with time zone default now(),
  valid_until timestamp with time zone,
  usage_limit integer,
  used_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table coupons enable row level security;

drop policy if exists "Allow public read active coupons" on coupons;
create policy "Allow public read active coupons" on coupons for select using (is_active = true);

-- ============================================
-- 12. BLOG POSTS TABLE
-- ============================================
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text default 'Guide',
  tags text[] default '{}',
  author text default 'AURERXA',
  is_published boolean default true,
  published_at timestamp with time zone default now(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table blog_posts enable row level security;

drop policy if exists "Allow public read published posts" on blog_posts;
create policy "Allow public read published posts" on blog_posts for select using (is_published = true);

-- ============================================
-- 13. STORES TABLE
-- ============================================
create table if not exists stores (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  city text not null,
  address text not null,
  phone text,
  email text,
  hours text,
  lat decimal(10, 8),
  lng decimal(11, 8),
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table stores enable row level security;

drop policy if exists "Allow public read active stores" on stores;
create policy "Allow public read active stores" on stores for select using (is_active = true);

-- ============================================
-- 14. SEED DATA (Safe to re-run)
-- ============================================

-- Categories
insert into categories (slug, name, description, image_url) values
  ('gold', 'Gold', 'Timeless 22K and 24K gold jewelry', '/heritage-rings.jpg'),
  ('silver', 'Silver', 'Premium sterling silver collection', '/stock-photo-pair-of-silver-rings-with-small-diamonds-for-lovers.jpg'),
  ('diamond', 'Diamond', 'Exquisite diamond masterpieces', '/pexels-abhishek-saini-1415858-3847212.jpg'),
  ('platinum', 'Platinum', 'The rarest metal for unique moments', '/platinum-ring.jpg')
on conflict (slug) do update set image_url = excluded.image_url;

-- Coupons
insert into coupons (code, discount_type, discount_value, min_order_value, max_discount, is_active) values
  ('WELCOME10', 'percentage', 10, 5000, 2000, true),
  ('FLAT500', 'fixed', 500, 10000, null, true),
  ('LUXURY20', 'percentage', 20, 50000, 10000, true)
on conflict (code) do nothing;

-- Stores
insert into stores (name, city, address, phone, email, hours, lat, lng, image_url) values
  ('AURERXA Mumbai Flagship', 'Mumbai', 'Shop No. 15, Linking Road, Bandra West, Mumbai 400050', '+91 22 2640 5555', 'mumbai@aurerxa.com', 'Mon-Sat: 11AM-9PM, Sun: 12PM-8PM', 19.0596, 72.8295, '/stores/mumbai.jpg'),
  ('AURERXA Delhi', 'Delhi', 'DLF Emporio, Vasant Kunj, New Delhi 110070', '+91 11 4605 5555', 'delhi@aurerxa.com', 'Mon-Sun: 11AM-8PM', 28.5490, 77.1583, '/stores/delhi.jpg'),
  ('AURERXA Bangalore', 'Bangalore', 'UB City, Vittal Mallya Road, Bangalore 560001', '+91 80 4125 5555', 'bangalore@aurerxa.com', 'Mon-Sun: 10AM-9PM', 12.9716, 77.5946, '/stores/bangalore.jpg')
on conflict do nothing;
