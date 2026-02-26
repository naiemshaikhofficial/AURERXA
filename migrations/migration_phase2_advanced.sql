-- Phase 2: Advanced Optimizations Migration

-- 1. SECURITY & PERFORMANCE FIXES
-- Fix "search_path" warnings for functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
    AND role = 'main_admin'
  );
END;
$$;


-- 2. FULL-TEXT SEARCH (FTS) IMPLEMENTATION
-- Add search vector column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fts_vector tsvector;

-- Create function to update search vectors
CREATE OR REPLACE FUNCTION public.products_fts_trigger() RETURNS trigger AS $$
BEGIN
  NEW.fts_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.purity, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS tr_products_fts ON public.products;
CREATE TRIGGER tr_products_fts
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_fts_trigger();

-- Initialize existing records
UPDATE public.products SET fts_vector = 
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(purity, '')), 'C');

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS idx_products_fts ON public.products USING gin(fts_vector);


-- 3. AUTO-CLEANUP (HYGIENE)
-- Function to clean old activity logs (Older than 60 days)
CREATE OR REPLACE FUNCTION public.cleanup_stale_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_activity_logs
  WHERE created_at < NOW() - INTERVAL '60 days';
END;
$$;

-- NOTE: To fully automate this, you should set up a Supabase Edge Function or 
-- use pg_cron if enabled on your plan:
-- SELECT cron.schedule('0 0 * * *', 'SELECT public.cleanup_stale_logs()');


-- 4. REALTIME OPTIMIZATION (Disable for high-volume logs)
-- This removes tables from the 'supabase_realtime' publication
-- Adjust based on which tables actually need live updates
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.admin_activity_logs;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.newsletter_subscribers;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.gold_rates; -- If you use standard fetching
