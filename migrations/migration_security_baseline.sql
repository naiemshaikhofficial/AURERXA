-- Security Baseline Migration
-- 1. Track IP Address in Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS user_agent text;

-- 2. Add Rate Limiting Table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier text NOT NULL, -- IP or User ID
    action text NOT NULL,     -- 'create_order', 'login_attempt', etc.
    count integer DEFAULT 1,
    last_request timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(identifier, action)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS rate_limits_identifier_idx ON public.rate_limits(identifier);

-- 3. Add Idempotency Tracking to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_order_hash text,
ADD COLUMN IF NOT EXISTS last_order_at timestamp with time zone;

-- 4. Function to check and update rate limit (Atomic)
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier text,
    p_action text,
    p_max_count integer,
    p_window_minutes integer
) RETURNS boolean AS $$
DECLARE
    v_current_count integer;
    v_last_request timestamp with time zone;
BEGIN
    SELECT count, last_request INTO v_current_count, v_last_request
    FROM public.rate_limits
    WHERE identifier = p_identifier AND action = p_action;

    IF NOT FOUND THEN
        INSERT INTO public.rate_limits (identifier, action, count, last_request)
        VALUES (p_identifier, p_action, 1, now());
        RETURN TRUE;
    END IF;

    -- Reset if window passed
    IF v_last_request < now() - (p_window_minutes * interval '1 minute') THEN
        UPDATE public.rate_limits
        SET count = 1, last_request = now()
        WHERE identifier = p_identifier AND action = p_action;
        RETURN TRUE;
    END IF;

    -- Block if limit reached
    IF v_current_count >= p_max_count THEN
        RETURN FALSE;
    END IF;

    -- Increment
    UPDATE public.rate_limits
    SET count = v_current_count + 1, last_request = now()
    WHERE identifier = p_identifier AND action = p_action;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
