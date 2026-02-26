-- Migration: Real-Time Live Chat System
-- Run this in Supabase SQL Editor

-- 1. Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    guest_name text,
    guest_email text,
    guest_phone text,
    agent_id uuid REFERENCES auth.users(id),
    status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 1.1 Add presence tracking to admin_users
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- 2. Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('user', 'agent', 'system')),
    content text NOT NULL,
    sender_name text,
    created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policies for chat_sessions
-- Anyone can create a session (protected by app logic)
CREATE POLICY "Allow public insert sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);
-- Users can see their own sessions, Admins see all
CREATE POLICY "View own sessions" ON public.chat_sessions FOR SELECT USING (
    auth.uid() = user_id OR (guest_email IS NOT NULL AND auth.uid() IS NULL) OR is_admin()
);

-- 5. Policies for chat_messages
-- Anyone can insert a message to an active session (app logic validates session_id)
CREATE POLICY "Allow insert messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
-- View messages for accessible sessions
CREATE POLICY "View session messages" ON public.chat_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions s 
        WHERE s.id = session_id AND (s.user_id = auth.uid() OR auth.uid() IS NULL OR is_admin())
    )
);

-- 6. Enable Realtime for these tables
-- Run these as a superuser or in the SQL editor
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
