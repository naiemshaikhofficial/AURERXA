-- Run this SQL in your Supabase SQL Editor to update/create tables

-- ============================================
-- PROFILES TABLE
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
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- ============================================
-- ADDRESSES TABLE (Max 5 per user, linked to profile)
-- ============================================
create table if not exists addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text default 'Home', -- Home, Office, etc.
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
create policy "Users can view own addresses" on addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on addresses for delete using (auth.uid() = user_id);

-- ============================================
-- CATEGORIES TABLE
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
create policy "Allow public read categories" on categories for select using (true);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text not null,
  images text[] default '{}', -- Additional product images
  stock integer default 0,
  sizes text[] default '{}',
  featured boolean default false,
  bestseller boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;
create policy "Allow public read products" on products for select using (true);

-- ============================================
-- WISHLIST TABLE
-- ============================================
create table if not exists wishlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

alter table wishlist enable row level security;
create policy "Users can view own wishlist" on wishlist for select using (auth.uid() = user_id);
create policy "Users can add to own wishlist" on wishlist for insert with check (auth.uid() = user_id);
create policy "Users can remove from own wishlist" on wishlist for delete using (auth.uid() = user_id);

-- ============================================
-- CART TABLE
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
create policy "Users can view own cart" on cart for select using (auth.uid() = user_id);
create policy "Users can add to own cart" on cart for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on cart for update using (auth.uid() = user_id);
create policy "Users can remove from own cart" on cart for delete using (auth.uid() = user_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  order_number text unique not null,
  status text default 'pending', -- pending, confirmed, shipped, delivered, cancelled
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

alter table orders enable row level security;
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can create own orders" on orders for insert with check (auth.uid() = user_id);

-- ============================================
-- ORDER ITEMS TABLE
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
create policy "Users can view own order items" on order_items for select 
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Users can create order items" on order_items for insert 
  with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- SEED DATA: Categories
-- ============================================
insert into categories (slug, name, description, image_url) values
  ('gold', 'Gold', 'Timeless 22K and 24K gold jewelry', '/heritage-rings.jpg'),
  ('silver', 'Silver', 'Premium sterling silver collection', '/stock-photo-pair-of-silver-rings-with-small-diamonds-for-lovers.jpg'),
  ('diamond', 'Diamond', 'Exquisite diamond masterpieces', '/pexels-abhishek-saini-1415858-3847212.jpg'),
  ('platinum', 'Platinum', 'The rarest metal for unique moments', '/platinum-ring.jpg')
on conflict (slug) do update set image_url = excluded.image_url;

-- ============================================
-- COUPONS TABLE
-- ============================================
create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_type text not null default 'percentage', -- percentage, fixed
  discount_value decimal(10, 2) not null,
  min_order_value decimal(10, 2) default 0,
  max_discount decimal(10, 2), -- cap for percentage discounts
  valid_from timestamp with time zone default now(),
  valid_until timestamp with time zone,
  usage_limit integer,
  used_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table coupons enable row level security;
create policy "Allow public read active coupons" on coupons for select using (is_active = true);

-- Add coupon fields to orders
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists coupon_discount decimal(10, 2) default 0;
alter table orders add column if not exists gift_wrap boolean default false;
alter table orders add column if not exists gift_message text;

-- ============================================
-- BLOG POSTS TABLE
-- ============================================
create table if not exists blog_posts (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text default 'Guide', -- Guide, Care Tips, Trends, News
  tags text[] default '{}',
  author text default 'AURERXA',
  is_published boolean default true,
  published_at timestamp with time zone default now(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table blog_posts enable row level security;
create policy "Allow public read published posts" on blog_posts for select using (is_published = true);

-- ============================================
-- STORES TABLE
-- ============================================
create table if not exists stores (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  city text not null,
  address text not null,
  phone text,
  email text,
  hours text, -- e.g., "Mon-Sat: 10AM-8PM, Sun: 11AM-6PM"
  lat decimal(10, 8),
  lng decimal(11, 8),
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table stores enable row level security;
create policy "Allow public read active stores" on stores for select using (is_active = true);

-- ============================================
-- SEED DATA: Sample Coupons
-- ============================================
insert into coupons (code, discount_type, discount_value, min_order_value, max_discount, is_active) values
  ('WELCOME10', 'percentage', 10, 5000, 2000, true),
  ('FLAT500', 'fixed', 500, 10000, null, true),
  ('LUXURY20', 'percentage', 20, 50000, 10000, true)
on conflict (code) do nothing;

-- ============================================
-- SEED DATA: Sample Blog Posts
-- ============================================
insert into blog_posts (slug, title, excerpt, content, cover_image, category, tags) values
  ('how-to-care-for-gold-jewelry', 'How to Care for Your Gold Jewelry', 'Essential tips to keep your gold jewelry shining for generations.', 'Gold jewelry is a timeless investment that can last for generations if properly cared for. Here are some essential tips:\n\n## 1. Regular Cleaning\nClean your gold jewelry with a mixture of mild soap and warm water. Use a soft brush to gently remove dirt and oils.\n\n## 2. Proper Storage\nStore each piece separately in a soft cloth or jewelry box to prevent scratches.\n\n## 3. Avoid Chemicals\nRemove jewelry before swimming, cleaning, or applying lotions and perfumes.\n\n## 4. Professional Cleaning\nGet your fine jewelry professionally cleaned every 6 months.', '/blog/gold-care.jpg', 'Care Tips', ARRAY['gold', 'jewelry care', 'tips']),
  ('choosing-the-perfect-engagement-ring', 'Choosing the Perfect Engagement Ring', 'A comprehensive guide to finding the ring of her dreams.', 'An engagement ring is one of the most significant purchases you will ever make. Here is how to choose wisely:\n\n## Understanding the 4Cs\nCut, Clarity, Color, and Carat - learn what each means for your diamond.\n\n## Setting Styles\nFrom solitaire to halo, explore different setting options.\n\n## Metal Options\nPlatinum, white gold, yellow gold, or rose gold - each has its charm.\n\n## Budget Planning\nHow to get the best value without compromising quality.', '/blog/engagement-ring.jpg', 'Guide', ARRAY['engagement', 'diamond', 'ring', 'guide']),
  ('jewelry-trends-2026', 'Jewelry Trends to Watch in 2026', 'Discover the hottest jewelry trends setting the fashion world ablaze.', 'Stay ahead of the curve with these trending jewelry styles:\n\n## Bold Gold\nChunky gold chains and statement pieces are making a comeback.\n\n## Layering\nMix and match necklaces, bracelets, and rings for a personalized look.\n\n## Colored Gemstones\nMove over diamonds - sapphires, emeralds, and rubies are in demand.\n\n## Sustainable Luxury\nEthically sourced and recycled metals are becoming the norm.', '/blog/trends-2026.jpg', 'Trends', ARRAY['trends', 'fashion', '2026'])
on conflict (slug) do nothing;

-- ============================================
-- SEED DATA: Sample Stores
-- ============================================
insert into stores (name, city, address, phone, email, hours, lat, lng, image_url) values
  ('AURERXA Mumbai Flagship', 'Mumbai', 'Shop No. 15, Linking Road, Bandra West, Mumbai 400050', '+91 22 2640 5555', 'mumbai@aurerxa.com', 'Mon-Sat: 11AM-9PM, Sun: 12PM-8PM', 19.0596, 72.8295, '/stores/mumbai.jpg'),
  ('AURERXA Delhi', 'Delhi', 'DLF Emporio, Vasant Kunj, New Delhi 110070', '+91 11 4605 5555', 'delhi@aurerxa.com', 'Mon-Sun: 11AM-8PM', 28.5490, 77.1583, '/stores/delhi.jpg'),
  ('AURERXA Bangalore', 'Bangalore', 'UB City, Vittal Mallya Road, Bangalore 560001', '+91 80 4125 5555', 'bangalore@aurerxa.com', 'Mon-Sun: 10AM-9PM', 12.9716, 77.5946, '/stores/bangalore.jpg')
on conflict do nothing;

