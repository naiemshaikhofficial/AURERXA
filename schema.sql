-- Run this SQL in your Supabase SQL Editor to update/create tables

-- Profiles Table (to store user details linked to Auth)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  phone_number text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

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

-- Enable RLS for other tables
alter table categories enable row level security;
alter table products enable row level security;

-- Policies for other tables
create policy "Allow public read categories" on categories for select using (true);
create policy "Allow public read products" on products for select using (true);

-- Trigger to handle new user profile creation automatically on Google/Auth signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
