-- Create internal_notes table
create table if not exists internal_notes (
  id uuid default gen_random_uuid() primary key,
  entity_type text not null check (entity_type in ('order', 'user', 'product', 'general')),
  entity_id uuid not null,
  author_id uuid references auth.users(id) on delete set null,
  content text not null,
  is_flagged boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table internal_notes enable row level security;

-- Policies
create policy "Admins can view all notes"
  on internal_notes for select
  using (
    exists (
      select 1 from admin_users
      where id = auth.uid()
    )
  );

create policy "Admins can insert notes"
  on internal_notes for insert
  with check (
    exists (
      select 1 from admin_users
      where id = auth.uid()
    )
  );

-- Indexes for performance
create index if not exists idx_internal_notes_entity on internal_notes(entity_type, entity_id);
create index if not exists idx_internal_notes_flagged on internal_notes(is_flagged) where is_flagged = true;
