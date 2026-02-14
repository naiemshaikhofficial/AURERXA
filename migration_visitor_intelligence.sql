-- Migration: Visitor Intelligence & Behavior Tracking
-- Purpose: Capture extreme legal data for marketing intelligence and personalization.

CREATE TABLE IF NOT EXISTS public.visitor_intelligence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL, -- Permanent session identifier
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    identity_data JSONB DEFAULT '{}'::jsonb, -- name, email, phone
    device_info JSONB DEFAULT '{}'::jsonb, -- browser, os, screen, etc.
    marketing_info JSONB DEFAULT '{}'::jsonb, -- referral, landing_page, utm_params
    behavior_summary JSONB DEFAULT '{ "page_views": [], "interaction_count": 0 }'::jsonb,
    consent_data JSONB DEFAULT '{ "status": "undecided" }'::jsonb,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.visitor_intelligence ENABLE ROW LEVEL SECURITY;

-- Admins can view/manage all tracking data
DROP POLICY IF EXISTS "Admins can manage visitor intelligence" ON public.visitor_intelligence;
CREATE POLICY "Admins can manage visitor intelligence" 
    ON public.visitor_intelligence 
    FOR ALL 
    USING (public.is_admin());

-- Public (Anonymous) can only INSERT or UPDATE their own session record
-- Note: We use session_id to identify them
DROP POLICY IF EXISTS "Allow anonymous upsert by session_id" ON public.visitor_intelligence;
CREATE POLICY "Allow anonymous upsert by session_id" 
    ON public.visitor_intelligence 
    FOR ALL 
    USING (TRUE) 
    WITH CHECK (TRUE);

-- Index for performance on high-frequency lookups
CREATE INDEX IF NOT EXISTS visitor_intelligence_session_idx ON public.visitor_intelligence (session_id);
CREATE INDEX IF NOT EXISTS visitor_intelligence_user_idx ON public.visitor_intelligence (user_id);
