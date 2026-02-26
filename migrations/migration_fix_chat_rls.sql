-- Migration: Fix Live Chat RLS for Admin Operations
-- Run this in Supabase SQL Editor

-- 1. Add UPDATE policy so admins can claim/resolve sessions
DROP POLICY IF EXISTS "Admin update sessions" ON public.chat_sessions;
CREATE POLICY "Admin update sessions" ON public.chat_sessions 
  FOR UPDATE USING (is_admin());

-- 2. Add last_active_at to profiles if not exists (for presence tracking)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- 3. Ensure admins can view ALL sessions (not just their own)
DROP POLICY IF EXISTS "View own sessions" ON public.chat_sessions;
CREATE POLICY "View all sessions" ON public.chat_sessions 
  FOR SELECT USING (true);

-- 4. Ensure admins can view ALL messages
DROP POLICY IF EXISTS "View session messages" ON public.chat_messages;
CREATE POLICY "View all messages" ON public.chat_messages 
  FOR SELECT USING (true);

-- 5. Ensure insert works for all on chat_messages (agent replies)
DROP POLICY IF EXISTS "Allow insert messages" ON public.chat_messages;
CREATE POLICY "Allow insert messages" ON public.chat_messages 
  FOR INSERT WITH CHECK (true);

-- 6. Ensure insert works for chat_sessions 
DROP POLICY IF EXISTS "Allow public insert sessions" ON public.chat_sessions;
CREATE POLICY "Allow public insert sessions" ON public.chat_sessions 
  FOR INSERT WITH CHECK (true);
