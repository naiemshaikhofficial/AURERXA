-- Migration: Add Sub-categories support

-- 1. Create sub_categories table
create table if not exists sub_categories (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) on delete cascade not null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on sub_categories
alter table sub_categories enable row level security;

-- 3. Add RLS policies for sub_categories
drop policy if exists "Allow public read sub_categories" on sub_categories;
create policy "Allow public read sub_categories" on sub_categories for select using (true);

drop policy if exists "Admins can manage sub_categories" on sub_categories;
create policy "Admins can manage sub_categories" on sub_categories for all using (is_admin());

-- 4. Update products table to include sub_category_id
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='products' and column_name='sub_category_id') then
    alter table products add column sub_category_id uuid references sub_categories(id) on delete set null;
  end if;
end $$;

-- 5. Create some initial sub-categories (Optional, based on user's examples)
-- Note: This is commented out as it requires actual category IDs
/*
insert into sub_categories (category_id, name, slug) 
values 
  ('your-gold-category-id', 'Rings', 'rings'),
  ('your-gold-category-id', 'Necklace', 'necklaces'),
  ('your-gold-category-id', 'Mangalsutra', 'mangalsutra');
*/
