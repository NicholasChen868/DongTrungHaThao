-- 009: CTV Registration RPC
-- Allows new CTV accounts to register via the frontend

CREATE OR REPLACE FUNCTION register_ctv(
    p_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_password_hash TEXT,
    p_referrer_code TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    new_ref_code TEXT;
    result JSON;
BEGIN
    -- Validate phone format (10 digits, starts with 0)
    IF p_phone !~ '^0\d{9}$' THEN
        RETURN json_build_object('ok', false, 'error', 'Số điện thoại không hợp lệ');
    END IF;

    -- Check phone exists
    IF EXISTS (SELECT 1 FROM ctv_accounts WHERE phone = p_phone) THEN
        RETURN json_build_object('ok', false, 'error', 'Số điện thoại đã được đăng ký');
    END IF;

    -- Generate unique referral code (retry on collision)
    LOOP
        new_ref_code := 'CTV' || LPAD(FLOOR(RANDOM() * 999999)::text, 6, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM ctv_accounts WHERE referral_code = new_ref_code);
    END LOOP;

    -- Insert new CTV account
    INSERT INTO ctv_accounts (name, phone, email, password_hash, referral_code, tier, total_points)
    VALUES (p_name, p_phone, NULLIF(p_email, ''), p_password_hash, new_ref_code, 'silver', 0)
    RETURNING json_build_object(
        'ok', true,
        'id', id,
        'name', name,
        'phone', phone,
        'referral_code', referral_code,
        'tier', tier
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
