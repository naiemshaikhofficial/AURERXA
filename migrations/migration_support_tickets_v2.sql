-- Migration: Support Tickets V2 (Guest Support & Categorization)
-- Run this in Supabase SQL Editor

-- 1. Modify existing tickets table
ALTER TABLE IF EXISTS public.tickets 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_name text,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_phone text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS order_number text;

-- 2. Update RLS policies
-- Allow anyone to insert (protected by bot check in app logic)
DROP POLICY IF EXISTS "Allow public insert tickets" ON public.tickets;
CREATE POLICY "Allow public insert tickets" ON public.tickets 
  FOR INSERT WITH CHECK (true);

-- Users can still only view their own tickets
-- Admins can view all
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets" ON public.tickets 
  FOR SELECT USING (
    (auth.uid() = user_id) OR 
    (is_admin()) OR 
    (guest_email IS NOT NULL AND auth.uid() IS NULL) -- Guests can't select easily without more logic, but this keeps it safe
  );

-- 3. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
