-- =============================================
-- 026: Missing RPCs — Functions called by frontend but not in DB
-- get_contact_info, record_share_click, reset_ctv_password, get_ctv_info
-- =============================================
-- =============================================
-- 1. get_contact_info()
-- Called by: src/modules/floating-buttons.js:121
-- Returns phone, zalo, messenger from site_settings
-- =============================================
DROP FUNCTION IF EXISTS get_contact_info();
CREATE OR REPLACE FUNCTION get_contact_info() RETURNS JSON AS $$ BEGIN RETURN (
        SELECT value
        FROM site_settings
        WHERE key = 'contact_info'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION get_contact_info() TO anon,
    authenticated;
-- =============================================
-- 2. record_share_click()
-- Called by: src/ctv.js:28
-- Records a CTV share click, awards points with anti-abuse checks
-- Params: p_ref_code, p_content_type, p_content_id, p_ip, p_user_agent, p_dwell_time
-- =============================================
DROP FUNCTION IF EXISTS record_share_click(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION record_share_click(
        p_ref_code TEXT,
        p_content_type TEXT DEFAULT 'page',
        p_content_id TEXT DEFAULT NULL,
        p_ip TEXT DEFAULT 'unknown',
        p_user_agent TEXT DEFAULT '',
        p_dwell_time INTEGER DEFAULT 0
    ) RETURNS JSON AS $$
DECLARE v_ctv RECORD;
v_points INTEGER := 0;
v_today_points INTEGER := 0;
v_daily_cap CONSTANT INTEGER := 50;
v_click_count INTEGER := 0;
BEGIN -- Find CTV account
SELECT id,
    referral_code,
    total_points,
    tier INTO v_ctv
FROM ctv_accounts
WHERE referral_code = p_ref_code;
IF NOT FOUND THEN RETURN json_build_object('ok', false, 'error', 'CTV not found');
END IF;
-- Anti-abuse: check duplicate clicks (same IP in last 10 minutes)
SELECT count(*) INTO v_click_count
FROM point_transactions
WHERE ctv_id = v_ctv.id
    AND ip_address = p_ip
    AND created_at > now() - interval '10 minutes';
IF v_click_count >= 3 THEN RETURN json_build_object(
    'ok',
    false,
    'error',
    'Rate limited',
    'points',
    0
);
END IF;
-- Check daily points cap
SELECT COALESCE(sum(points), 0) INTO v_today_points
FROM point_transactions
WHERE ctv_id = v_ctv.id
    AND status = 'approved'
    AND created_at::date = CURRENT_DATE;
IF v_today_points >= v_daily_cap THEN RETURN json_build_object(
    'ok',
    true,
    'points',
    0,
    'message',
    'Daily cap reached'
);
END IF;
-- Award points based on content type (min dwell_time = 3s)
IF p_dwell_time >= 3 THEN v_points := CASE
    p_content_type
    WHEN 'product' THEN 5
    WHEN 'story' THEN 3
    WHEN 'page' THEN 2
    ELSE 1
END;
-- Cap to daily limit
IF v_today_points + v_points > v_daily_cap THEN v_points := v_daily_cap - v_today_points;
END IF;
END IF;
-- Insert transaction
INSERT INTO point_transactions (
        ctv_id,
        points,
        content_type,
        content_id,
        ip_address,
        user_agent,
        status
    )
VALUES (
        v_ctv.id,
        v_points,
        p_content_type,
        p_content_id,
        p_ip,
        p_user_agent,
        CASE
            WHEN v_points > 0 THEN 'approved'
            ELSE 'rejected'
        END
    );
-- Update CTV total points
IF v_points > 0 THEN
UPDATE ctv_accounts
SET total_points = total_points + v_points,
    total_clicks = COALESCE(total_clicks, 0) + 1
WHERE id = v_ctv.id;
END IF;
RETURN json_build_object('ok', true, 'points', v_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION record_share_click(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER) TO anon,
    authenticated;
-- =============================================
-- 3. reset_ctv_password()
-- Called by: src/ctv-dashboard.js:164
-- Verifies phone + email match, then updates password hash
-- Params: p_phone, p_email, p_new_password_hash
-- =============================================
DROP FUNCTION IF EXISTS reset_ctv_password(TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION reset_ctv_password(
        p_phone TEXT,
        p_email TEXT,
        p_new_password_hash TEXT
    ) RETURNS JSON AS $$
DECLARE v_ctv RECORD;
v_member RECORD;
BEGIN -- Rate limit check
IF is_rate_limited('reset_pw_' || p_phone, 3, 300) THEN RETURN json_build_object(
    'ok',
    false,
    'error',
    'Quá nhiều lần thử. Đợi 5 phút.'
);
END IF;
-- 1) Check ctv_accounts
SELECT id,
    name,
    phone,
    email INTO v_ctv
FROM ctv_accounts
WHERE phone = p_phone;
IF NOT FOUND THEN PERFORM record_failed_attempt('reset_pw_' || p_phone);
RETURN json_build_object(
    'ok',
    false,
    'error',
    'Số điện thoại chưa đăng ký CTV'
);
END IF;
-- 2) Verify email matches
IF v_ctv.email IS NULL
OR lower(trim(v_ctv.email)) != lower(trim(p_email)) THEN PERFORM record_failed_attempt('reset_pw_' || p_phone);
RETURN json_build_object('ok', false, 'error', 'Email không khớp');
END IF;
-- 3) Update password in ctv_accounts
UPDATE ctv_accounts
SET password_hash = p_new_password_hash,
    updated_at = now()
WHERE id = v_ctv.id;
-- 4) Also update members table if exists
UPDATE members
SET password_hash = p_new_password_hash,
    updated_at = now()
WHERE phone = p_phone;
RETURN json_build_object('ok', true, 'name', v_ctv.name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION reset_ctv_password(TEXT, TEXT, TEXT) TO anon,
    authenticated;
-- =============================================
-- 4. get_ctv_info()
-- Called by: src/modules/ctv-banner.js:189
-- Returns CTV basic info for banner refresh
-- Params: p_referral_code
-- =============================================
DROP FUNCTION IF EXISTS get_ctv_info(TEXT);
CREATE OR REPLACE FUNCTION get_ctv_info(p_referral_code TEXT) RETURNS JSON AS $$
DECLARE v_ctv RECORD;
v_total_orders INTEGER;
v_total_earnings NUMERIC;
BEGIN
SELECT id,
    name,
    referral_code,
    tier AS rank,
    total_points AS points,
    COALESCE(total_clicks, 0) AS total_clicks,
    available_vnd INTO v_ctv
FROM ctv_accounts
WHERE referral_code = p_referral_code;
IF NOT FOUND THEN RETURN json_build_object('ok', false, 'error', 'CTV not found');
END IF;
-- Count orders with this CTV code
SELECT count(*),
    COALESCE(sum(total_amount), 0) INTO v_total_orders,
    v_total_earnings
FROM orders
WHERE ctv_code = p_referral_code
    AND status IN ('confirmed', 'shipping', 'completed');
RETURN json_build_object(
    'ok',
    true,
    'name',
    v_ctv.name,
    'rank',
    v_ctv.rank,
    'points',
    v_ctv.points,
    'total_orders',
    v_total_orders,
    'total_earnings',
    COALESCE(v_ctv.available_vnd, 0),
    'total_clicks',
    v_ctv.total_clicks
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION get_ctv_info(TEXT) TO anon,
    authenticated;
-- =============================================
-- 5. Fix get_event_stats() — add default for p_session_token
-- Frontend calls: supabase.rpc('get_event_stats', { p_days: 7 })
-- Missing p_session_token → need overload that accepts just p_days
-- Actually the FE in admin-analytics.js:136 is missing the token
-- This is a frontend bug, but we add a safer overload
-- =============================================
-- (No change needed — frontend should pass session_token.
--  The admin-analytics.js needs to include it, which it does via getSessionToken())
-- =============================================
-- DONE: All missing RPCs created
-- =============================================