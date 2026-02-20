-- =============================================
-- PAGE VIEWS TRACKING
-- Lightweight analytics — no PII, just counts
-- =============================================
CREATE TABLE IF NOT EXISTS page_views (
    id SERIAL PRIMARY KEY,
    page TEXT NOT NULL,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    device TEXT CHECK (device IN ('mobile', 'tablet', 'desktop')),
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
-- Anyone can insert a page view (lightweight tracking)
CREATE POLICY "Allow anon insert views" ON page_views FOR
INSERT TO anon WITH CHECK (true);
-- Only admin reads (via RPC)
-- No direct SELECT for anon
-- Indexes
CREATE INDEX IF NOT EXISTS idx_views_page ON page_views(page);
CREATE INDEX IF NOT EXISTS idx_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_views_source ON page_views(utm_source);
-- Admin RPC to get analytics
CREATE OR REPLACE FUNCTION admin_page_analytics(p_admin_hash TEXT, p_days INTEGER DEFAULT 30) RETURNS JSON AS $$
DECLARE admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
result JSON;
BEGIN IF p_admin_hash != admin_hash THEN RAISE EXCEPTION 'Unauthorized';
END IF;
SELECT json_build_object(
        'total_views',
        (
            SELECT COUNT(*)
            FROM page_views
            WHERE created_at >= now() - (p_days || ' days')::interval
        ),
        'by_page',
        (
            SELECT json_agg(row_to_json(p))
            FROM (
                    SELECT page,
                        COUNT(*) as views
                    FROM page_views
                    WHERE created_at >= now() - (p_days || ' days')::interval
                    GROUP BY page
                    ORDER BY views DESC
                ) p
        ),
        'by_device',
        (
            SELECT json_agg(row_to_json(d))
            FROM (
                    SELECT device,
                        COUNT(*) as views
                    FROM page_views
                    WHERE created_at >= now() - (p_days || ' days')::interval
                        AND device IS NOT NULL
                    GROUP BY device
                    ORDER BY views DESC
                ) d
        ),
        'by_source',
        (
            SELECT json_agg(row_to_json(s))
            FROM (
                    SELECT COALESCE(utm_source, 'direct') as source,
                        COUNT(*) as views
                    FROM page_views
                    WHERE created_at >= now() - (p_days || ' days')::interval
                    GROUP BY utm_source
                    ORDER BY views DESC
                    LIMIT 10
                ) s
        ), 'daily', (
            SELECT json_agg(row_to_json(t))
            FROM (
                    SELECT created_at::date as day,
                        COUNT(*) as views
                    FROM page_views
                    WHERE created_at >= now() - (p_days || ' days')::interval
                    GROUP BY day
                    ORDER BY day
                ) t
        )
    ) INTO result;
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;