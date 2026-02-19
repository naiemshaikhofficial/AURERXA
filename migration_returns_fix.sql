-- Migration: Add admin_notes and fix policies for return_requests
ALTER TABLE public.return_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Drop and recreate policies to be consistent with other tables
DROP POLICY IF EXISTS "Users can view own return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Admins can update return requests" ON public.return_requests;

CREATE POLICY "Users can view own return requests" 
ON public.return_requests FOR SELECT 
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can update return requests" 
ON public.return_requests FOR UPDATE 
USING (is_admin());
