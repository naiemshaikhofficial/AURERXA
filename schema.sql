-- Run this SQL in your Supabase SQL Editor to create the necessary tables

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

-- Enable Row Level Security (RLS) - Optional, but recommended
alter table newsletter_subscribers enable row level security;
alter table custom_orders enable row level security;
alter table contact_messages enable row level security;

-- Create policies (Example: Allow insert for anon users)
create policy "Allow anon insert subscribers" on newsletter_subscribers for insert with check (true);
create policy "Allow anon insert custom_orders" on custom_orders for insert with check (true);
create policy "Allow anon insert contact_messages" on contact_messages for insert with check (true);
