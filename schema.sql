-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Categories Table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  description text,
  image_url text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text not null,
  featured boolean default false,
  bestseller boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Newsletter Subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Custom Orders
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

-- Contact Messages
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table categories enable row level security;
alter table products enable row level security;
alter table newsletter_subscribers enable row level security;
alter table custom_orders enable row level security;
alter table contact_messages enable row level security;

-- Create policies
create policy "Allow public read categories" on categories for select using (true);
create policy "Allow public read products" on products for select using (true);

create policy "Allow anon insert subscribers" on newsletter_subscribers for insert with check (true);
create policy "Allow anon insert custom_orders" on custom_orders for insert with check (true);
create policy "Allow anon insert contact_messages" on contact_messages for insert with check (true);

-- Insert Default Categories
insert into categories (slug, name, description, image_url) values
  ('gold', 'Gold', 'Timeless 22K and 24K gold jewelry', '/gold-category.jpg'),
  ('silver', 'Silver', 'Premium sterling silver collection', '/silver-category.jpg'),
  ('diamond', 'Diamond', 'Exquisite diamond masterpieces', '/diamond-category.jpg'),
  ('platinum', 'Platinum', 'The rarest metal for unique moments', '/platinum-category.jpg')
on conflict (slug) do nothing;
