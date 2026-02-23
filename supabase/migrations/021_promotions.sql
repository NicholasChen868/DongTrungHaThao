-- =============================================
-- 021: PROMOTIONS TABLE — Dynamic Promo System
-- Admin can create/edit/toggle promotions
-- Frontend fetches active promo and renders popup
-- =============================================
-- =============================================
-- 1. BẢNG promotions
-- =============================================
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    -- "Bứt Phá Đầu Năm Đinh Ngọ"
    tagline TEXT,
    -- "Biến áp lực thành cơ hội tỏa sáng ✨"
    icon TEXT DEFAULT '🔥',
    -- Emoji icon for popup header
    story_html TEXT,
    -- Main story content (HTML allowed)
    discount_percent INTEGER DEFAULT 5,
    -- Discount percentage
    badge_text TEXT DEFAULT 'GIẢM 5%',
    -- Badge display text
    program_name TEXT,
    -- "Năng Lượng Bứt Phá"
    benefits JSONB DEFAULT '[]'::jsonb,
    -- [{icon:"⚡", text:"Tỉnh táo..."}, ...]
    cta_text TEXT DEFAULT '💊 2 viên/ngày — Khỏe re!',
    cta_note TEXT,
    -- "*Tự động giảm 5%..."
    footer_quote TEXT,
    -- "Đừng để sức ì sau Tết..."
    image_url TEXT,
    -- Hero image URL (optional)
    starts_at TIMESTAMPTZ DEFAULT now(),
    ends_at TIMESTAMPTZ,
    -- NULL = no expiry
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    -- Higher = shown first
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Index for active promo lookup
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions (is_active, priority DESC, starts_at DESC)
WHERE is_active = true;
-- =============================================
-- 2. RLS — Public read active promos, admin write
-- =============================================
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
-- Anyone can read active promotions
CREATE POLICY promotions_public_read ON promotions FOR
SELECT USING (
        is_active = true
        AND starts_at <= now()
        AND (
            ends_at IS NULL
            OR ends_at > now()
        )
    );
-- =============================================
-- 3. RPC: get_active_promotion()
-- Returns the highest-priority active promo
-- =============================================
CREATE OR REPLACE FUNCTION get_active_promotion() RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE promo RECORD;
BEGIN
SELECT * INTO promo
FROM promotions
WHERE is_active = true
    AND starts_at <= now()
    AND (
        ends_at IS NULL
        OR ends_at > now()
    )
ORDER BY priority DESC,
    created_at DESC
LIMIT 1;
IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'message', 'No active promotion');
END IF;
RETURN jsonb_build_object(
    'ok',
    true,
    'id',
    promo.id,
    'title',
    promo.title,
    'tagline',
    promo.tagline,
    'icon',
    promo.icon,
    'story_html',
    promo.story_html,
    'discount_percent',
    promo.discount_percent,
    'badge_text',
    promo.badge_text,
    'program_name',
    promo.program_name,
    'benefits',
    promo.benefits,
    'cta_text',
    promo.cta_text,
    'cta_note',
    promo.cta_note,
    'footer_quote',
    promo.footer_quote,
    'image_url',
    promo.image_url,
    'ends_at',
    promo.ends_at
);
END;
$$;
-- Grant execute to anon/authenticated
GRANT EXECUTE ON FUNCTION get_active_promotion() TO anon,
    authenticated;
-- =============================================
-- 4. RPC: admin_upsert_promotion() — admin only
-- =============================================
CREATE OR REPLACE FUNCTION admin_upsert_promotion(
        p_session_token UUID,
        p_id UUID DEFAULT NULL,
        p_title TEXT DEFAULT NULL,
        p_tagline TEXT DEFAULT NULL,
        p_icon TEXT DEFAULT '🔥',
        p_story_html TEXT DEFAULT NULL,
        p_discount_percent INTEGER DEFAULT 5,
        p_badge_text TEXT DEFAULT 'GIẢM 5%',
        p_program_name TEXT DEFAULT NULL,
        p_benefits JSONB DEFAULT '[]'::jsonb,
        p_cta_text TEXT DEFAULT '💊 2 viên/ngày — Khỏe re!',
        p_cta_note TEXT DEFAULT NULL,
        p_footer_quote TEXT DEFAULT NULL,
        p_image_url TEXT DEFAULT NULL,
        p_starts_at TIMESTAMPTZ DEFAULT now(),
        p_ends_at TIMESTAMPTZ DEFAULT NULL,
        p_is_active BOOLEAN DEFAULT true,
        p_priority INTEGER DEFAULT 0
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_admin_id UUID;
v_promo_id UUID;
BEGIN -- Verify admin session
SELECT admin_id INTO v_admin_id
FROM admin_sessions
WHERE token = p_session_token
    AND expires_at > now();
IF v_admin_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'Unauthorized');
END IF;
IF p_id IS NOT NULL THEN -- Update existing
UPDATE promotions
SET title = COALESCE(p_title, title),
    tagline = COALESCE(p_tagline, tagline),
    icon = p_icon,
    story_html = COALESCE(p_story_html, story_html),
    discount_percent = p_discount_percent,
    badge_text = p_badge_text,
    program_name = COALESCE(p_program_name, program_name),
    benefits = p_benefits,
    cta_text = p_cta_text,
    cta_note = p_cta_note,
    footer_quote = p_footer_quote,
    image_url = p_image_url,
    starts_at = p_starts_at,
    ends_at = p_ends_at,
    is_active = p_is_active,
    priority = p_priority,
    updated_at = now()
WHERE id = p_id
RETURNING id INTO v_promo_id;
ELSE -- Insert new
INSERT INTO promotions (
        title,
        tagline,
        icon,
        story_html,
        discount_percent,
        badge_text,
        program_name,
        benefits,
        cta_text,
        cta_note,
        footer_quote,
        image_url,
        starts_at,
        ends_at,
        is_active,
        priority
    )
VALUES (
        p_title,
        p_tagline,
        p_icon,
        p_story_html,
        p_discount_percent,
        p_badge_text,
        p_program_name,
        p_benefits,
        p_cta_text,
        p_cta_note,
        p_footer_quote,
        p_image_url,
        p_starts_at,
        p_ends_at,
        p_is_active,
        p_priority
    )
RETURNING id INTO v_promo_id;
END IF;
RETURN jsonb_build_object('ok', true, 'promo_id', v_promo_id);
END;
$$;
GRANT EXECUTE ON FUNCTION admin_upsert_promotion(
        UUID,
        UUID,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        INTEGER,
        TEXT,
        TEXT,
        JSONB,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        TIMESTAMPTZ,
        TIMESTAMPTZ,
        BOOLEAN,
        INTEGER
    ) TO anon,
    authenticated;
-- =============================================
-- 5. SEED: Insert current promotion as first record
-- =============================================
INSERT INTO promotions (
        title,
        tagline,
        icon,
        story_html,
        discount_percent,
        badge_text,
        program_name,
        benefits,
        cta_text,
        cta_note,
        footer_quote,
        image_url,
        starts_at,
        ends_at,
        is_active,
        priority
    )
VALUES (
        'Bứt Phá Đầu Năm Đinh Ngọ',
        'Biến áp lực thành cơ hội tỏa sáng ✨',
        '🔥',
        'Bạn ơi, còn nhớ bao nhiêu thứ hẹn <em>"qua Tết đi..."</em> không? 😅<br><br>Tết đã qua rồi — mà deadline thì đang <strong>dí tới mặt</strong>. Cuối năm tồn đọng, đầu năm ngập đầu. Mệt. Đuối. Muốn bỏ cuộc.<br><br>Nhưng khoan... <strong>tại sao không biến áp lực này thành cơ hội để tỏa sáng?</strong> 💪<br><br>Đang "đuối đuối" → uống <strong>2 viên Đông Trùng</strong> → <em>khỏe re, chạy tới đêm không mệt</em>. Người ta hỏi bí quyết gì mà năng lượng đầy — bạn chỉ cười 🌿',
        5,
        'GIẢM 5%',
        'Năng Lượng Bứt Phá',
        '[{"icon":"⚡","text":"Tỉnh táo, minh mẫn — <em>không phải cà phê</em>"},{"icon":"🌙","text":"Làm xuyên đêm mà sáng vẫn tươi"},{"icon":"🛡️","text":"Tăng đề kháng — mùa nắng mưa thất thường"},{"icon":"⏳","text":"Giảm <strong>5%</strong> khi đặt trước <strong>28/02/2026</strong>"}]'::jsonb,
        '💊 2 viên/ngày — Khỏe re!',
        '*Tự động giảm 5% khi đặt hàng. Giao nhanh trong 2h tại TP.HCM.',
        '"Đừng để sức ì sau Tết là lý do bạn bỏ lỡ cơ hội đầu năm."',
        '/images/promo-new-year.png',
        '2026-02-01'::timestamptz,
        '2026-02-28 23:59:59'::timestamptz,
        true,
        10
    );