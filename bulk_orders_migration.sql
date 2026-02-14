-- BULK ORDERS MIGRATION
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- BULK ORDERS TABLE
-- ============================================
create table if not exists bulk_orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  gst_number text,
  message text,
  status text default 'pending' check (status in ('pending', 'quoted', 'confirmed', 'rejected')),
  admin_notes text,
  quoted_total decimal(12, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table bulk_orders enable row level security;

-- Anyone can submit a bulk order inquiry
drop policy if exists "Allow public insert bulk orders" on bulk_orders;
create policy "Allow public insert bulk orders" on bulk_orders for insert with check (true);

-- Users can view their own bulk orders
drop policy if exists "Users can view own bulk orders" on bulk_orders;
create policy "Users can view own bulk orders" on bulk_orders for select using (
  auth.uid() = user_id or is_admin()
);

-- Admins can update bulk orders
drop policy if exists "Admins can manage bulk orders" on bulk_orders;
create policy "Admins can manage bulk orders" on bulk_orders for all using (is_admin());

-- ============================================
-- BULK ORDER ITEMS TABLE
-- ============================================
create table if not exists bulk_order_items (
  id uuid default gen_random_uuid() primary key,
  bulk_order_id uuid references bulk_orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_image text,
  retail_price decimal(10, 2) not null,
  quantity integer not null check (quantity >= 10),
  quoted_price decimal(10, 2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table bulk_order_items enable row level security;

-- Anyone can insert bulk order items (as part of the inquiry)
drop policy if exists "Allow public insert bulk order items" on bulk_order_items;
create policy "Allow public insert bulk order items" on bulk_order_items for insert with check (true);

-- Users can view their own bulk order items
drop policy if exists "Users can view own bulk order items" on bulk_order_items;
create policy "Users can view own bulk order items" on bulk_order_items for select using (
  is_admin() or exists (
    select 1 from bulk_orders
    where bulk_orders.id = bulk_order_items.bulk_order_id
    and bulk_orders.user_id = auth.uid()
  )
);

-- Admins can manage bulk order items
drop policy if exists "Admins can manage bulk order items" on bulk_order_items;
create policy "Admins can manage bulk order items" on bulk_order_items for all using (is_admin());

-- Index for performance
create index if not exists idx_bulk_orders_status on bulk_orders(status);
create index if not exists idx_bulk_orders_user_id on bulk_orders(user_id);
create index if not exists idx_bulk_order_items_bulk_order_id on bulk_order_items(bulk_order_id);
