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
