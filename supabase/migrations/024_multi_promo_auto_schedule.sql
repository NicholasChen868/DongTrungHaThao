-- =============================================
-- 024: Multi-promo support + Auto-scheduling
-- =============================================
-- 1. New RPC: get_all_active_promotions()
-- Returns ALL active promotions (for carousel), not just one
CREATE OR REPLACE FUNCTION get_all_active_promotions() RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result JSONB;
BEGIN
SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id',
                p.id,
                'title',
                p.title,
                'tagline',
                p.tagline,
                'icon',
                p.icon,
                'story_html',
                p.story_html,
                'discount_percent',
                p.discount_percent,
                'badge_text',
                p.badge_text,
                'program_name',
                p.program_name,
                'benefits',
                p.benefits,
                'cta_text',
                p.cta_text,
                'cta_note',
                p.cta_note,
                'footer_quote',
                p.footer_quote,
                'image_url',
                p.image_url,
                'ends_at',
                p.ends_at
            )
            ORDER BY p.priority DESC,
                p.created_at DESC
        ),
        '[]'::jsonb
    ) INTO result
FROM promotions p
WHERE p.is_active = true
    AND p.starts_at <= now()
    AND (
        p.ends_at IS NULL
        OR p.ends_at > now()
    );
RETURN jsonb_build_object('ok', true, 'promotions', result);
END;
$$;
GRANT EXECUTE ON FUNCTION get_all_active_promotions() TO anon,
    authenticated;
-- 2. Auto-scheduling: add auto_activate flag
-- When true: promo auto-activates at starts_at, auto-deactivates at ends_at
ALTER TABLE promotions
ADD COLUMN IF NOT EXISTS auto_activate BOOLEAN DEFAULT false;
-- 3. Cron function: auto_manage_promotions()
-- Called by pg_cron or Supabase Edge Function
CREATE OR REPLACE FUNCTION auto_manage_promotions() RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE activated_count INTEGER := 0;
deactivated_count INTEGER := 0;
BEGIN -- Auto-activate: starts_at arrived, auto_activate = true, is_active = false
UPDATE promotions
SET is_active = true,
    updated_at = now()
WHERE auto_activate = true
    AND is_active = false
    AND starts_at <= now()
    AND (
        ends_at IS NULL
        OR ends_at > now()
    );
GET DIAGNOSTICS activated_count = ROW_COUNT;
-- Auto-deactivate: ends_at passed, is_active = true
UPDATE promotions
SET is_active = false,
    updated_at = now()
WHERE is_active = true
    AND ends_at IS NOT NULL
    AND ends_at <= now();
GET DIAGNOSTICS deactivated_count = ROW_COUNT;
RETURN jsonb_build_object(
    'ok',
    true,
    'activated',
    activated_count,
    'deactivated',
    deactivated_count,
    'run_at',
    now()
);
END;
$$;
GRANT EXECUTE ON FUNCTION auto_manage_promotions() TO authenticated;
-- 4. Enable pg_cron extension (if not already enabled)
-- Supabase supports pg_cron on Pro plan
-- If available, schedule daily at midnight VN time (17:00 UTC)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
) THEN PERFORM cron.schedule(
    'auto-manage-promotions',
    '0 17 * * *',
    'SELECT auto_manage_promotions()'
);
END IF;
END;
$$;
-- 5. Update existing seasonal promos: enable auto_activate
UPDATE promotions
SET auto_activate = true
WHERE title IN (
        '8/3 — Tặng Mẹ Sức Khỏe, Đừng Chỉ Tặng Hoa',
        'Mùa Thi — Cả Nhà Cần Thêm Sức',
        'Vu Lan — Mua Tặng Ba Mẹ, Giao Tận Nhà'
    );