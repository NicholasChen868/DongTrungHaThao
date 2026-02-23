-- =============================================
-- 020: ADMIN SESSION-BASED AUTHENTICATION
-- Chuyển từ gửi admin_hash mỗi request → session token
-- Hash chỉ dùng 1 lần lúc login, sau đó dùng UUID token
-- =============================================

-- =============================================
-- 1. BẢNG admin_sessions
-- =============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    session_token UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_sessions_token
    ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active
    ON admin_sessions(is_active, expires_at);

-- RLS: no direct access — only SECURITY DEFINER RPCs
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. validate_admin_session — check token + sliding window
-- Trả TRUE nếu token hợp lệ, gia hạn thêm 30 phút
-- =============================================
CREATE OR REPLACE FUNCTION validate_admin_session(p_session_token UUID)
RETURNS BOOLEAN AS $$
DECLARE
    session_exists BOOLEAN;
BEGIN
    -- Tìm session active + chưa expire
    SELECT EXISTS (
        SELECT 1 FROM admin_sessions
        WHERE session_token = p_session_token
          AND is_active = true
          AND expires_at > now()
    ) INTO session_exists;

    IF NOT session_exists THEN
        RAISE EXCEPTION 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
    END IF;

    -- Sliding window: gia hạn thêm 30 phút
    UPDATE admin_sessions
    SET expires_at = now() + interval '30 minutes'
    WHERE session_token = p_session_token
      AND is_active = true;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. admin_login — validate hash server-side → trả session token
-- Hash chỉ gửi 1 lần ở đây
-- =============================================
CREATE OR REPLACE FUNCTION admin_login(p_admin_hash TEXT)
RETURNS JSON AS $$
DECLARE
    admin_hash CONSTANT TEXT := '285a242c372134fdfbea0c4c9b6a102c4b10134f1c5f6b4ad7dc016cc4f05889';
    new_token UUID;
    new_expires TIMESTAMPTZ;
BEGIN
    -- Rate limit: 3 attempts per 5 minutes
    IF is_rate_limited('admin', 3, 300) THEN
        RAISE EXCEPTION 'Quá nhiều lần thử đăng nhập. Đợi 5 phút.';
    END IF;

    -- Validate hash
    IF p_admin_hash != admin_hash THEN
        PERFORM record_failed_attempt('admin');
        RAISE EXCEPTION 'Mật khẩu không đúng.';
    END IF;

    -- Vô hiệu hóa sessions cũ (chỉ cho phép 1 session active)
    UPDATE admin_sessions SET is_active = false WHERE is_active = true;

    -- Tạo session mới
    new_token := gen_random_uuid();
    new_expires := now() + interval '30 minutes';

    INSERT INTO admin_sessions (session_token, expires_at)
    VALUES (new_token, new_expires);

    RETURN json_build_object(
        'ok', true,
        'session_token', new_token,
        'expires_at', new_expires
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. admin_logout — vô hiệu hóa session
-- =============================================
CREATE OR REPLACE FUNCTION admin_logout(p_session_token UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE admin_sessions
    SET is_active = false
    WHERE session_token = p_session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. validate_admin — OVERWRITE version cũ (TEXT → UUID)
-- Dùng session token thay admin hash
-- =============================================
DROP FUNCTION IF EXISTS validate_admin(TEXT);

CREATE OR REPLACE FUNCTION validate_admin(p_session_token UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN validate_admin_session(p_session_token);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. REWRITE TẤT CẢ 14 ADMIN RPCs
-- DROP version cũ (p_admin_hash TEXT)
-- CREATE version mới (p_session_token UUID)
-- =============================================

-- --- 6.1 admin_get_overview ---
DROP FUNCTION IF EXISTS admin_get_overview(TEXT);

CREATE OR REPLACE FUNCTION admin_get_overview(p_session_token UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin_session(p_session_token);

    SELECT json_build_object(
        'order_count', (SELECT count(*) FROM orders),
        'revenue', (SELECT COALESCE(sum(total_amount), 0) FROM orders WHERE status = 'completed'),
        'ctv_count', (SELECT count(*) FROM ctv_accounts),
        'contact_count', (SELECT count(*) FROM contact_submissions),
        'recent_orders', (
            SELECT COALESCE(json_agg(row_to_json(o)), '[]'::json)
            FROM (
                SELECT id, customer_name, phone, quantity, total_amount, ctv_code, status, created_at
                FROM orders ORDER BY created_at DESC LIMIT 5
            ) o
        ),
        'recent_ctv', (
            SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
            FROM (
                SELECT referral_code, name, phone, tier, total_points, created_at
                FROM ctv_accounts ORDER BY created_at DESC LIMIT 5
            ) c
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.2 admin_list_orders ---
DROP FUNCTION IF EXISTS admin_list_orders(TEXT);

CREATE OR REPLACE FUNCTION admin_list_orders(p_session_token UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin_session(p_session_token);

    SELECT COALESCE(json_agg(row_to_json(o)), '[]'::json) INTO result
    FROM (
        SELECT id, customer_name, phone, address, quantity, unit_price,
               discount_percent, total_amount, ctv_code, note, status,
               payment_method, payment_status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 200
    ) o;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.3 admin_update_order_status ---
DROP FUNCTION IF EXISTS admin_update_order_status(TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION admin_update_order_status(
    p_session_token UUID,
    p_order_id INTEGER,
    p_status TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM validate_admin_session(p_session_token);

    IF p_status NOT IN ('pending', 'confirmed', 'shipping', 'completed', 'cancelled') THEN
        RAISE EXCEPTION 'Trạng thái không hợp lệ: %', p_status;
    END IF;

    UPDATE orders SET status = p_status, updated_at = now()
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.4 admin_list_posts ---
DROP FUNCTION IF EXISTS admin_list_posts(TEXT);

CREATE OR REPLACE FUNCTION admin_list_posts(p_session_token UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin_session(p_session_token);

    SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json) INTO result
    FROM (
        SELECT cp.id, cp.title, cp.category, cp.content, cp.views, cp.likes,
               cp.is_approved, cp.reward_points_granted, cp.created_at,
               m.name as member_name
        FROM community_posts cp
        LEFT JOIN members m ON cp.member_id = m.id
        ORDER BY cp.created_at DESC
        LIMIT 100
    ) p;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.5 admin_update_post_status ---
DROP FUNCTION IF EXISTS admin_update_post_status(TEXT, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION admin_update_post_status(
    p_session_token UUID,
    p_post_id INTEGER,
    p_approve BOOLEAN
) RETURNS VOID AS $$
BEGIN
    PERFORM validate_admin_session(p_session_token);

    UPDATE community_posts
    SET is_approved = p_approve
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.6 admin_list_ctv ---
DROP FUNCTION IF EXISTS admin_list_ctv(TEXT);

CREATE OR REPLACE FUNCTION admin_list_ctv(p_session_token UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin_session(p_session_token);

    SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json) INTO result
    FROM (
        SELECT referral_code, name, phone, email, tier,
               total_points, available_vnd, created_at
        FROM ctv_accounts
        ORDER BY created_at DESC
        LIMIT 200
    ) c;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.7 admin_upgrade_ctv ---
DROP FUNCTION IF EXISTS admin_upgrade_ctv(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION admin_upgrade_ctv(
    p_session_token UUID,
    p_ref_code TEXT,
    p_new_tier TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM validate_admin_session(p_session_token);

    IF p_new_tier NOT IN ('silver', 'gold', 'diamond') THEN
        RAISE EXCEPTION 'Hạng không hợp lệ: %', p_new_tier;
    END IF;

    UPDATE ctv_accounts SET tier = p_new_tier
    WHERE referral_code = p_ref_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.8 admin_get_analytics ---
DROP FUNCTION IF EXISTS admin_get_analytics(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION admin_get_analytics(
    p_session_token UUID,
    p_days INTEGER DEFAULT 30
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin_session(p_session_token);

    SELECT COALESCE(json_agg(row_to_json(o)), '[]'::json) INTO result
    FROM (
        SELECT id, total_amount, status, created_at
        FROM orders
        WHERE created_at > (now() - (p_days || ' days')::interval)
        ORDER BY created_at DESC
    ) o;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.9 admin_get_settings ---
DROP FUNCTION IF EXISTS admin_get_settings(TEXT);

CREATE OR REPLACE FUNCTION admin_get_settings(p_session_token UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin_session(p_session_token);

    SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json) INTO result
    FROM (
        SELECT key, value, updated_at
        FROM site_settings
        ORDER BY key
    ) s;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.10 admin_update_setting ---
DROP FUNCTION IF EXISTS admin_update_setting(TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION admin_update_setting(
    p_session_token UUID,
    p_key TEXT,
    p_value JSONB
) RETURNS VOID AS $$
BEGIN
    PERFORM validate_admin_session(p_session_token);

    INSERT INTO site_settings (key, value, updated_at)
    VALUES (p_key, p_value, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.11 admin_list_withdrawals ---
DROP FUNCTION IF EXISTS admin_list_withdrawals(TEXT);

CREATE OR REPLACE FUNCTION admin_list_withdrawals(p_session_token UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin_session(p_session_token);

    SELECT COALESCE(json_agg(row_to_json(w)), '[]'::json) INTO result
    FROM (
        SELECT wr.id, wr.amount, wr.bank_name, wr.bank_account, wr.bank_holder,
               wr.status, wr.created_at,
               ca.name as ctv_name, ca.referral_code as ctv_code
        FROM withdrawal_requests wr
        JOIN ctv_accounts ca ON wr.ctv_id = ca.id
        ORDER BY wr.created_at DESC
        LIMIT 100
    ) w;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.12 admin_process_withdrawal ---
DROP FUNCTION IF EXISTS admin_process_withdrawal(TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION admin_process_withdrawal(
    p_session_token UUID,
    p_withdrawal_id INTEGER,
    p_status TEXT
) RETURNS VOID AS $$
BEGIN
    PERFORM validate_admin_session(p_session_token);

    IF p_status NOT IN ('approved', 'rejected', 'paid') THEN
        RAISE EXCEPTION 'Trạng thái không hợp lệ: %', p_status;
    END IF;

    UPDATE withdrawal_requests
    SET status = p_status, updated_at = now()
    WHERE id = p_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- 6.13 approve_post_and_reward ---
DROP FUNCTION IF EXISTS approve_post_and_reward(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION approve_post_and_reward(
    p_session_token UUID,
    p_post_id INTEGER
) RETURNS JSON AS $$
DECLARE
    post_record RECORD;
    ctv_record RECORD;
    reward_points INTEGER := 30; -- 30 points = 30,000₫
BEGIN
    PERFORM validate_admin_session(p_session_token);

    -- Get post info
    SELECT * INTO post_record FROM community_posts WHERE id = p_post_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bài viết không tồn tại';
    END IF;

    -- Approve post
    UPDATE community_posts
    SET is_approved = true, reward_points_granted = true
    WHERE id = p_post_id;

    -- Find CTV account linked to post author
    SELECT ca.* INTO ctv_record
    FROM ctv_accounts ca
    JOIN members m ON ca.phone = m.phone
    WHERE m.id = post_record.member_id;

    IF FOUND THEN
        -- Credit points to CTV
        UPDATE ctv_accounts
        SET total_points = total_points + reward_points,
            available_vnd = available_vnd + (reward_points * 1000)
        WHERE id = ctv_record.id;

        RETURN json_build_object(
            'ok', true,
            'post_id', p_post_id,
            'points_credited', reward_points,
            'ctv_code', ctv_record.referral_code
        );
    ELSE
        RETURN json_build_object(
            'ok', true,
            'post_id', p_post_id,
            'points_credited', 0,
            'message', 'Bài đã duyệt nhưng tác giả chưa có tài khoản CTV'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. Cleanup: xóa sessions hết hạn (optional cron)
-- =============================================
-- DELETE FROM admin_sessions WHERE expires_at < now() - interval '24 hours';

-- =============================================
-- DONE: Sau migration này, tất cả admin RPCs dùng UUID session token
-- Client cần update: gửi p_session_token thay p_admin_hash
-- =============================================
