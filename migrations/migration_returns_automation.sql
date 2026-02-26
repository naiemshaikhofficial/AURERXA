-- Migration: Create return_requests table for automated return management

CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('defective', 'wrong_product', 'damaged_in_transit')),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'pickup_scheduled', 'picked_up', 'in_transit', 'received', 'inspected', 'refunded', 'rejected')),
    tracking_number TEXT, -- Delhivery Waybill for reverse pickup
    label_url TEXT, -- URL to the shipping label PDF
    pickup_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own return requests" ON public.return_requests;
CREATE POLICY "Users can view own return requests" 
ON public.return_requests FOR SELECT 
USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can create own return requests" ON public.return_requests;
CREATE POLICY "Users can create own return requests" 
ON public.return_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update return requests" ON public.return_requests;
CREATE POLICY "Admins can update return requests" 
ON public.return_requests FOR UPDATE 
USING (is_admin());

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON public.return_requests(user_id);
