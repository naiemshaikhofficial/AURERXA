-- AURERXA Database Schema
-- Run this SQL in your Supabase SQL Editor
-- This script is IDEMPOTENT (Safe to run multiple times)

-- ============================================
-- HELPER FUNCTIONS (To break RLS recursion)
-- ============================================
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_main_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid()
    and role = 'main_admin'
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 1. PROFILES & AUTH SYNC
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

drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles" on profiles for select using (is_admin());

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
-- 2. ADMIN USERS & LOGS
-- ============================================
create table if not exists admin_users (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('main_admin', 'support_admin', 'staff')) default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table admin_users enable row level security;

drop policy if exists "Users can view their own admin status" on admin_users;
create policy "Users can view their own admin status" on admin_users for select using (auth.uid() = id);

drop policy if exists "Main admins can manage all admin users" on admin_users;
create policy "Main admins can manage all admin users" on admin_users for all using (is_main_admin());

create table if not exists admin_activity_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table admin_activity_logs enable row level security;

drop policy if exists "Admins can view activity logs" on admin_activity_logs;
create policy "Admins can view activity logs" on admin_activity_logs for select using (is_admin());

drop policy if exists "Admins can insert activity logs" on admin_activity_logs;
create policy "Admins can insert activity logs" on admin_activity_logs for insert with check (is_admin());

-- ============================================
-- 3. CATEGORIES & PRODUCTS
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

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text not null,
  images jsonb default '[]'::jsonb,
  stock integer default 0,
  sizes text[] default '{}',
  featured boolean default false,
  bestseller boolean default false,
  slug text unique,
  purity text,
  gender text default 'Unisex',
  weight_grams decimal(10, 2),
  dimensions_width text,
  dimensions_height text,
  dimensions_length text,
  dimensions_unit text default 'mm',
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;

drop policy if exists "Allow public read products" on products;
create policy "Allow public read products" on products for select using (true);

drop policy if exists "Admins can manage products" on products;
create policy "Admins can manage products" on products for all using (is_admin());

-- ============================================
-- 4. ORDERS & CART
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
  coupon_code text,
  coupon_discount decimal(10, 2) default 0,
  gift_wrap boolean default false,
  gift_message text,
  delivery_time_slot text,
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table orders enable row level security;

drop policy if exists "Users can view own orders" on orders;
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id or is_admin());

drop policy if exists "Admins can update orders" on orders;
create policy "Admins can update orders" on orders for update using (is_admin());

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
create policy "Users can view own order items" on order_items for select using (is_admin() or exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- ============================================
-- 5. SUPPORT (TICKETS & REPAIRS)
-- ============================================
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
create policy "Users can view own tickets" on tickets for select using (auth.uid() = user_id or is_admin());
drop policy if exists "Admins can update tickets" on tickets;
create policy "Admins can update tickets" on tickets for update using (is_admin());

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
create policy "Users can view own repairs" on repairs for select using (auth.uid() = user_id or is_admin());
drop policy if exists "Admins can update repairs" on repairs;
create policy "Admins can update repairs" on repairs for update using (is_admin());

-- ============================================
-- 6. MISC (GOLD, COUPONS, STORES, ETC)
-- ============================================
create table if not exists gold_rates (
  id uuid default gen_random_uuid() primary key,
  purity text not null unique,
  rate decimal(10, 2) not null,
  currency text default 'INR',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table gold_rates enable row level security;
drop policy if exists "Allow public read gold rates" on gold_rates;
create policy "Allow public read gold rates" on gold_rates for select using (true);
drop policy if exists "Admins can manage gold rates" on gold_rates;
create policy "Admins can manage gold rates" on gold_rates for all using (is_admin());

create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table newsletter_subscribers enable row level security;
drop policy if exists "Admins can view subscribers" on newsletter_subscribers;
create policy "Admins can view subscribers" on newsletter_subscribers for select using (is_admin());

create table if not exists custom_orders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  description text not null,
  budget text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table custom_orders enable row level security;
drop policy if exists "Admins can view custom orders" on custom_orders;
create policy "Admins can view custom orders" on custom_orders for select using (is_admin());
drop policy if exists "Admins can update custom orders" on custom_orders;
create policy "Admins can update custom orders" on custom_orders for update using (is_admin());

create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table contact_messages enable row level security;
drop policy if exists "Admins can view contact messages" on contact_messages;
create policy "Admins can view contact messages" on contact_messages for select using (is_admin());

-- ============================================
-- 7. SERVICES (TRY-ON, HARVEST, CARE, VISIT)
-- ============================================

create table if not exists virtual_try_on_requests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  preferred_date date,
  preferred_time time,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table virtual_try_on_requests enable row level security;
drop policy if exists "Allow public insert try-on" on virtual_try_on_requests;
create policy "Allow public insert try-on" on virtual_try_on_requests for insert with check (true);
drop policy if exists "Admins can view try-on" on virtual_try_on_requests;
create policy "Admins can view try-on" on virtual_try_on_requests for select using (is_admin());
drop policy if exists "Admins can update try-on" on virtual_try_on_requests;
create policy "Admins can update try-on" on virtual_try_on_requests for update using (is_admin());

create table if not exists gold_harvest_leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  monthly_amount decimal(10, 2),
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table gold_harvest_leads enable row level security;
drop policy if exists "Allow public insert gold harvest" on gold_harvest_leads;
create policy "Allow public insert gold harvest" on gold_harvest_leads for insert with check (true);
drop policy if exists "Admins can view gold harvest" on gold_harvest_leads;
create policy "Admins can view gold harvest" on gold_harvest_leads for select using (is_admin());
drop policy if exists "Admins can update gold harvest" on gold_harvest_leads;
create policy "Admins can update gold harvest" on gold_harvest_leads for update using (is_admin());

create table if not exists jewelry_care_appointments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  service_type text,
  preferred_date date,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table jewelry_care_appointments enable row level security;
drop policy if exists "Allow public insert jewelry care" on jewelry_care_appointments;
create policy "Allow public insert jewelry care" on jewelry_care_appointments for insert with check (true);
drop policy if exists "Admins can view jewelry care" on jewelry_care_appointments;
create policy "Admins can view jewelry care" on jewelry_care_appointments for select using (is_admin());
drop policy if exists "Admins can update jewelry care" on jewelry_care_appointments;
create policy "Admins can update jewelry care" on jewelry_care_appointments for update using (is_admin());

create table if not exists boutique_appointments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  preferred_date date,
  preferred_time time,
  visit_reason text,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table boutique_appointments enable row level security;
drop policy if exists "Allow public insert boutique" on boutique_appointments;
create policy "Allow public insert boutique" on boutique_appointments for insert with check (true);
drop policy if exists "Admins can view boutique" on boutique_appointments;
create policy "Admins can view boutique" on boutique_appointments for select using (is_admin());
drop policy if exists "Admins can update boutique" on boutique_appointments;
create policy "Admins can update boutique" on boutique_appointments for update using (is_admin());

-- End of standardized schema
