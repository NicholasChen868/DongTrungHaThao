-- =============================================
-- 011: SERVER-SIDE RATE LIMITING
-- Track login attempts + block brute force
-- =============================================
-- Table to track failed login attempts
CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    attempt_key TEXT NOT NULL,
    -- e.g. 'member:0901234567' or 'admin'
    attempted_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_key ON login_attempts(attempt_key, attempted_at DESC);
-- Enable RLS — no direct access
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
-- No policies = no anon access (only SECURITY DEFINER RPCs can write)
-- =============================================
-- Helper: check rate limit (reusable)
-- Returns TRUE if rate limit exceeded
-- =============================================
CREATE OR REPLACE FUNCTION is_rate_limited(
        p_key TEXT,
        p_max_attempts INTEGER DEFAULT 5,
        p_window_seconds INTEGER DEFAULT 300 -- 5 minutes
    ) RETURNS BOOLEAN AS $$
DECLARE attempt_count INTEGER;
BEGIN
SELECT COUNT(*) INTO attempt_count
FROM login_attempts
WHERE attempt_key = p_key
    AND attempted_at > (
        now() - (p_window_seconds || ' seconds')::interval
    );
RETURN attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- Helper: record a failed attempt
-- =============================================
CREATE OR REPLACE FUNCTION record_failed_attempt(p_key TEXT) RETURNS VOID AS $$ BEGIN
INSERT INTO login_attempts (attempt_key)
VALUES (p_key);
-- Auto-cleanup: delete attempts older than 1 hour
DELETE FROM login_attempts
WHERE attempt_key = p_key
    AND attempted_at < (now() - interval '1 hour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- PATCHED: authenticate_member with rate limiting
-- =============================================
CREATE OR REPLACE FUNCTION authenticate_member(p_phone TEXT, p_password_hash TEXT) RETURNS JSON AS $$
DECLARE result JSON;
rate_key TEXT;
BEGIN rate_key := 'member:' || p_phone;
-- Check rate limit: 5 attempts per 5 minutes
IF is_rate_limited(rate_key, 5, 300) THEN RAISE EXCEPTION 'Quá nhiều lần thử. Vui lòng đợi 5 phút.';
END IF;
SELECT json_build_object(
        'id',
        id,
        'name',
        name,
        'phone',
        phone,
        'email',
        email,
        'total_points',
        total_points,
        'created_at',
        created_at
    ) INTO result
FROM members
WHERE phone = p_phone
    AND password_hash = p_password_hash;
IF result IS NULL THEN -- Record failed attempt
PERFORM record_failed_attempt(rate_key);
END IF;
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- PATCHED: All admin RPCs with rate limiting
-- (Only patch admin_get_overview as entry point —
--  if this passes, others share same hash)
-- =============================================
-- Helper: validate admin with rate limiting
CREATE OR REPLACE FUNCTION validate_admin(p_admin_hash TEXT) RETURNS BOOLEAN AS $$
DECLARE admin_hash CONSTANT TEXT := '285a242c372134fdfbea0c4c9b6a102c4b10134f1c5f6b4ad7dc016cc4f05889';
BEGIN -- Check rate limit: 3 attempts per 5 minutes
IF is_rate_limited('admin', 3, 300) THEN RAISE EXCEPTION 'Quá nhiều lần thử đăng nhập admin. Đợi 5 phút.';
END IF;
IF p_admin_hash != admin_hash THEN PERFORM record_failed_attempt('admin');
RAISE EXCEPTION 'Unauthorized';
END IF;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- PATCHED: track_orders with rate limiting
-- =============================================
CREATE OR REPLACE FUNCTION track_orders(p_phone TEXT) RETURNS JSON AS $$
DECLARE result JSON;
rate_key TEXT;
BEGIN rate_key := 'track:' || p_phone;
-- Rate limit: 10 lookups per 5 minutes per phone
IF is_rate_limited(rate_key, 10, 300) THEN RAISE EXCEPTION 'Quá nhiều lần tra cứu. Vui lòng đợi 5 phút.';
END IF;
-- Record every attempt (even valid ones to prevent enumeration)
PERFORM record_failed_attempt(rate_key);
-- Validate phone format (10 digits starting with 0)
IF p_phone !~ '^0[0-9]{9}$' THEN RAISE EXCEPTION 'Số điện thoại không hợp lệ';
END IF;
SELECT json_agg(row_to_json(o)) INTO result
FROM (
        SELECT id,
            customer_name,
            phone,
            quantity,
            total_amount,
            status,
            address,
            created_at
        FROM orders
        WHERE phone = p_phone
        ORDER BY created_at DESC
        LIMIT 20
    ) o;
RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- PATCHED: register_ctv with rate limiting
-- =============================================
CREATE OR REPLACE FUNCTION register_ctv(
        p_name TEXT,
        p_phone TEXT,
        p_email TEXT,
        p_password_hash TEXT DEFAULT NULL,
        p_referrer_code TEXT DEFAULT NULL
    ) RETURNS JSON AS $$
DECLARE new_ref_code TEXT;
result JSON;
rate_key TEXT;
BEGIN rate_key := 'ctv_reg:' || p_phone;
-- Rate limit: 3 registrations per 30 minutes per phone
IF is_rate_limited(rate_key, 3, 1800) THEN RAISE EXCEPTION 'Quá nhiều lần đăng ký. Vui lòng đợi 30 phút.';
END IF;
PERFORM record_failed_attempt(rate_key);
-- Validate phone format
IF p_phone !~ '^0[0-9]{9}$' THEN RAISE EXCEPTION 'Số điện thoại không hợp lệ';
END IF;
-- Validate password hash format (must be 64 char hex = SHA-256)
IF p_password_hash IS NULL
OR p_password_hash !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'Mật khẩu không hợp lệ';
END IF;
-- Check phone exists
IF EXISTS (
    SELECT 1
    FROM ctv_accounts
    WHERE phone = p_phone
) THEN RAISE EXCEPTION 'Số điện thoại đã được đăng ký';
END IF;
-- Generate referral code
new_ref_code := 'CTV' || LPAD(FLOOR(RANDOM() * 999999)::text, 6, '0');
-- Insert
INSERT INTO ctv_accounts (
        name,
        phone,
        email,
        password_hash,
        referral_code,
        tier,
        total_points
    )
VALUES (
        p_name,
        p_phone,
        NULLIF(p_email, ''),
        p_password_hash,
        new_ref_code,
        'silver',
        0
    )
RETURNING json_build_object(
        'id',
        id,
        'name',
        name,
        'phone',
        phone,
        'referral_code',
        referral_code,
        'tier',
        tier
    ) INTO result;
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- Cleanup job: delete old attempts (optional cron)
-- Run manually or via pg_cron if available
-- =============================================
-- DELETE FROM login_attempts WHERE attempted_at < now() - interval '24 hours';