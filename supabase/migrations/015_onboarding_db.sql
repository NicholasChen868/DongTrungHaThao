-- =============================================
-- 015: ONBOARDING — Lưu tiến trình vào DB
-- Cột onboarding_step đã tồn tại từ migration 012.
-- Migration này cập nhật get_ctv_dashboard để trả về
-- onboarding_step, và tạo alias RPC cho frontend.
-- =============================================

-- Idempotent: đảm bảo cột tồn tại
ALTER TABLE ctv_accounts ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- =============================================
-- RPC: update_onboarding_step (alias cho update_ctv_onboarding)
-- Lưu bước onboarding vào DB khi CTV hoàn thành
-- =============================================
CREATE OR REPLACE FUNCTION update_onboarding_step(
    p_ref_code TEXT,
    p_step INTEGER
) RETURNS JSON AS $$
DECLARE
    result JSON;
    rate_key TEXT;
BEGIN
    -- Validate step range (0-5)
    IF p_step < 0 OR p_step > 5 THEN
        RAISE EXCEPTION 'Invalid onboarding step';
    END IF;

    -- Rate limit: 10 calls per 5 minutes
    rate_key := 'onboarding:' || p_ref_code;
    IF is_rate_limited(rate_key, 10, 300) THEN
        RAISE EXCEPTION 'Quá nhiều yêu cầu. Vui lòng đợi.';
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Update onboarding step (only forward progress)
    UPDATE ctv_accounts
    SET onboarding_step = GREATEST(onboarding_step, p_step)
    WHERE referral_code = p_ref_code
    RETURNING json_build_object(
        'ok', true,
        'onboarding_step', onboarding_step
    ) INTO result;

    IF result IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'CTV not found');
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC: get_ctv_dashboard (CREATE OR REPLACE)
-- Trả về dữ liệu dashboard CTV bao gồm onboarding_step
-- =============================================
CREATE OR REPLACE FUNCTION get_ctv_dashboard(
    p_ref_code TEXT
) RETURNS JSON AS $$
DECLARE
    v_ctv RECORD;
    v_pending_points INTEGER;
    v_today_points INTEGER;
    v_total_clicks INTEGER;
    rate_key TEXT;
BEGIN
    -- Rate limit: 20 calls per 5 minutes
    rate_key := 'dashboard:' || p_ref_code;
    IF is_rate_limited(rate_key, 20, 300) THEN
        RAISE EXCEPTION 'Quá nhiều yêu cầu. Vui lòng đợi.';
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Get CTV account (no password_hash)
    SELECT id, name, phone, email, referral_code, tier,
           total_points, available_vnd, onboarding_step
    INTO v_ctv
    FROM ctv_accounts
    WHERE referral_code = p_ref_code;

    IF v_ctv IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'CTV not found');
    END IF;

    -- Pending points (last 48 hours, not yet approved)
    SELECT COALESCE(SUM(points), 0) INTO v_pending_points
    FROM point_transactions
    WHERE ctv_id = v_ctv.id
      AND status = 'pending'
      AND created_at > now() - interval '48 hours';

    -- Today's points
    SELECT COALESCE(SUM(points), 0) INTO v_today_points
    FROM point_transactions
    WHERE ctv_id = v_ctv.id
      AND status = 'approved'
      AND created_at::date = CURRENT_DATE;

    -- Total clicks
    SELECT COUNT(*) INTO v_total_clicks
    FROM share_clicks
    WHERE ctv_id = v_ctv.id;

    RETURN json_build_object(
        'ok', true,
        'name', v_ctv.name,
        'phone', v_ctv.phone,
        'referral_code', v_ctv.referral_code,
        'tier', v_ctv.tier,
        'total_points', v_ctv.total_points,
        'available_vnd', COALESCE(v_ctv.available_vnd, 0),
        'onboarding_step', COALESCE(v_ctv.onboarding_step, 0),
        'pending_points', v_pending_points,
        'today_points', v_today_points,
        'total_clicks', v_total_clicks
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
