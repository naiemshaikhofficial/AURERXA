-- Migration: Scalable Visitor Tracking RPC
-- Description: Moves the logic for logging visitor events to a database function (RPC).
-- This eliminates the need for "Read-before-Write" and prevents race conditions, 
-- significantly improving scalability for high-traffic scenarios.

CREATE OR REPLACE FUNCTION public.log_visitor_event_v2(
    p_session_id TEXT,
    p_event_name TEXT,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_interest TEXT;
    v_interests JSONB;
BEGIN
    v_interest := p_metadata->>'interest';
    
    INSERT INTO public.visitor_intelligence (
        session_id,
        behavior_summary,
        last_active,
        created_at
    )
    VALUES (
        p_session_id,
        jsonb_build_object(
            'page_views', jsonb_build_array(
                jsonb_build_object('event', p_event_name, 'timestamp', now(), 'meta', p_metadata)
            ),
            'interaction_count', 1,
            'interests', CASE WHEN v_interest IS NOT NULL THEN jsonb_build_object(v_interest, 1) ELSE '{}'::jsonb END
        ),
        now(),
        now()
    )
    ON CONFLICT (session_id) DO UPDATE SET
        behavior_summary = jsonb_build_object(
            'page_views', (
                CASE 
                    WHEN jsonb_array_length(visitor_intelligence.behavior_summary->'page_views') >= 50 
                    THEN (visitor_intelligence.behavior_summary->'page_views') - 0 
                    ELSE COALESCE(visitor_intelligence.behavior_summary->'page_views', '[]'::jsonb) 
                END
            ) || jsonb_build_object('event', p_event_name, 'timestamp', now(), 'meta', p_metadata),
            'interaction_count', COALESCE((visitor_intelligence.behavior_summary->>'interaction_count')::int, 0) + 1,
            'interests', CASE 
                WHEN v_interest IS NOT NULL 
                THEN jsonb_set(
                    COALESCE(visitor_intelligence.behavior_summary->'interests', '{}'::jsonb),
                    ARRAY[v_interest],
                    to_jsonb(COALESCE((visitor_intelligence.behavior_summary->'interests'->>v_interest)::int, 0) + 1)
                )
                ELSE COALESCE(visitor_intelligence.behavior_summary->'interests', '{}'::jsonb)
            END
        ),
        last_active = now();
END;
$$;
