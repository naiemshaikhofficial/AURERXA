-- Migration: Database Maintenance & Storage Cleanup
-- Description: Creates a function to purge old logs and temporary data.
-- This keeps the database size within Supabase free-tier limits (500MB).

CREATE OR REPLACE FUNCTION public.perform_database_maintenance()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_visitor_count INT;
    v_error_count INT;
    v_results JSONB;
BEGIN
    -- 1. Purge visitor intelligence older than 30 days
    -- We keep recent data for marketing, but prune old history.
    DELETE FROM public.visitor_intelligence
    WHERE last_active < NOW() - INTERVAL '30 days'
    AND session_id NOT IN (
        -- Keep active users / recent buyers (optional strategy)
        SELECT session_id FROM public.orders WHERE created_at > NOW() - INTERVAL '60 days'
    );
    GET DIAGNOSTICS v_visitor_count = ROW_COUNT;

    -- 2. Purge error logs older than 15 days
    -- Error logs grow fast and shouldn't be kept indefinitely.
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'error_logs') THEN
        DELETE FROM public.error_logs
        WHERE created_at < NOW() - INTERVAL '15 days';
        GET DIAGNOSTICS v_error_count = ROW_COUNT;
    ELSE
        v_error_count := 0;
    END IF;

    -- Construct result summary
    v_results := jsonb_build_object(
        'status', 'success',
        'timestamp', NOW(),
        'purged_visitor_logs', v_visitor_count,
        'purged_error_logs', v_error_count
    );

    -- Log maintenance action (optional)
    -- INSERT INTO public.admin_activity_logs (action, entity_type, details)
    -- VALUES ('DB_MAINTENANCE', 'system', v_results);

    RETURN v_results;
END;
$$;
