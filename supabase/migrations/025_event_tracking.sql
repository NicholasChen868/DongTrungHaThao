-- =============================================
-- 025: Event tracking — CTA clicks, scroll depth, page views
-- V3 recommendation #6A: track which CTAs get clicked
-- =============================================
-- 1. Event logs table
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    -- 'cta_click', 'scroll_depth', 'page_view', 'promo_view'
    element_id TEXT,
    -- '#promoOrderBtn', '.hero-cta-btn', etc.
    page TEXT DEFAULT '/',
    -- page path
    metadata JSONB DEFAULT '{}'::jsonb,
    -- extra info (promo_id, scroll_pct, etc.)
    session_id TEXT,
    -- anonymous session ID
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_event_logs_type ON event_logs (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_logs_element ON event_logs (element_id, created_at DESC);
-- 2. RLS — anon can INSERT, only admin can SELECT
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
-- Anyone can log events (write-only)
CREATE POLICY event_logs_anon_insert ON event_logs FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- Only authenticated (admin) can read
CREATE POLICY event_logs_auth_read ON event_logs FOR
SELECT TO authenticated USING (true);
-- 3. RPC: log_event() — lightweight insert
CREATE OR REPLACE FUNCTION log_event(
        p_event_type TEXT,
        p_element_id TEXT DEFAULT NULL,
        p_page TEXT DEFAULT '/',
        p_metadata JSONB DEFAULT '{}'::jsonb,
        p_session_id TEXT DEFAULT NULL
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
INSERT INTO event_logs (
        event_type,
        element_id,
        page,
        metadata,
        session_id
    )
VALUES (
        p_event_type,
        p_element_id,
        p_page,
        p_metadata,
        p_session_id
    );
RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION log_event(TEXT, TEXT, TEXT, JSONB, TEXT) TO anon,
    authenticated;
-- 4. RPC: get_event_stats() — admin analytics
CREATE OR REPLACE FUNCTION get_event_stats(
        p_session_token UUID,
        p_days INTEGER DEFAULT 7
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_admin_id UUID;
result JSONB;
BEGIN -- Verify admin
SELECT admin_id INTO v_admin_id
FROM admin_sessions
WHERE token = p_session_token
    AND expires_at > now();
IF v_admin_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'Unauthorized');
END IF;
SELECT jsonb_build_object(
        'ok',
        true,
        'period_days',
        p_days,
        'total_events',
        (
            SELECT count(*)
            FROM event_logs
            WHERE created_at > now() - (p_days || ' days')::interval
        ),
        'cta_clicks',
        (
            SELECT COALESCE(jsonb_agg(row_to_json(r)), '[]'::jsonb)
            FROM (
                    SELECT element_id,
                        count(*) as clicks
                    FROM event_logs
                    WHERE event_type = 'cta_click'
                        AND created_at > now() - (p_days || ' days')::interval
                    GROUP BY element_id
                    ORDER BY clicks DESC
                    LIMIT 20
                ) r
        ), 'page_views', (
            SELECT count(*)
            FROM event_logs
            WHERE event_type = 'page_view'
                AND created_at > now() - (p_days || ' days')::interval
        ),
        'promo_views',
        (
            SELECT count(*)
            FROM event_logs
            WHERE event_type = 'promo_view'
                AND created_at > now() - (p_days || ' days')::interval
        )
    ) INTO result;
RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION get_event_stats(UUID, INTEGER) TO authenticated;