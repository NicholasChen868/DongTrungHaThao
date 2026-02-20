-- =============================================
-- 012: CTV ONBOARDING TRACKING
-- Theo dõi tiến trình hướng dẫn CTV mới
-- =============================================

-- Thêm cột onboarding_step vào ctv_accounts
-- 0 = chưa bắt đầu, 1-4 = đang làm, 5 = hoàn thành
ALTER TABLE ctv_accounts ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- =============================================
-- RPC: Cập nhật tiến trình onboarding
-- Chỉ CTV đã xác thực mới gọi được
-- =============================================
CREATE OR REPLACE FUNCTION update_ctv_onboarding(
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

    -- Rate limit: 20 calls per 5 minutes (generous — UI-triggered)
    rate_key := 'onboarding:' || p_ref_code;
    IF is_rate_limited(rate_key, 20, 300) THEN
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
-- RPC: Lấy trạng thái onboarding hiện tại
-- =============================================
CREATE OR REPLACE FUNCTION get_ctv_onboarding(
    p_ref_code TEXT
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'ok', true,
        'onboarding_step', onboarding_step,
        'name', name
    ) INTO result
    FROM ctv_accounts
    WHERE referral_code = p_ref_code;

    IF result IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'CTV not found');
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
