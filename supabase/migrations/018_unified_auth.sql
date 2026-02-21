-- =============================================
-- 018: UNIFIED AUTH SYSTEM
-- Replaces separate authenticate_member + authenticate_ctv
-- with a single authenticate_user RPC using members.role
-- =============================================

-- =============================================
-- 1. authenticate_user(p_phone, p_password_hash)
-- Unified login for ALL roles (admin, btv, ctv, member, etc.)
-- Returns JSON: { ok, user_id, name, display_name, role, tier, referral_code, avatar_url }
-- =============================================
CREATE OR REPLACE FUNCTION authenticate_user(
    p_phone TEXT,
    p_password_hash TEXT
) RETURNS JSON AS $$
DECLARE
    v_user RECORD;
    v_ref_code TEXT;
    rate_key TEXT;
BEGIN
    -- Validate inputs
    IF p_phone IS NULL OR p_password_hash IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'Thiếu thông tin đăng nhập');
    END IF;

    -- Validate phone format
    IF p_phone !~ '^0[0-9]{9}$' THEN
        RETURN json_build_object('ok', false, 'error', 'Số điện thoại không hợp lệ');
    END IF;

    -- Validate password hash format (SHA-256 = 64 hex chars)
    IF p_password_hash !~ '^[a-f0-9]{64}$' THEN
        RETURN json_build_object('ok', false, 'error', 'Mật khẩu không hợp lệ');
    END IF;

    -- Rate limiting: 5 attempts per 5 minutes per phone
    rate_key := 'auth:' || p_phone;
    IF is_rate_limited(rate_key, 5, 300) THEN
        RETURN json_build_object('ok', false, 'error', 'Quá nhiều lần thử. Vui lòng đợi 5 phút.');
    END IF;

    -- Look up user in members table
    SELECT id, name, phone, email, password_hash, role, display_name,
           avatar_url, tier, is_active, total_points
    INTO v_user
    FROM members
    WHERE phone = p_phone AND password_hash = p_password_hash;

    -- Auth failed
    IF v_user IS NULL THEN
        PERFORM record_failed_attempt(rate_key);
        RETURN json_build_object('ok', false, 'error', 'Sai thông tin đăng nhập');
    END IF;

    -- Check if account is active
    IF v_user.is_active = false THEN
        RETURN json_build_object('ok', false, 'error', 'Tài khoản đã bị khóa');
    END IF;

    -- If CTV role, look up referral_code from ctv_accounts (backward compat)
    IF v_user.role IN ('ctv', 'btv') THEN
        SELECT referral_code INTO v_ref_code
        FROM ctv_accounts
        WHERE phone = p_phone;
    END IF;

    -- Update last_login_at
    UPDATE members SET last_login_at = now() WHERE id = v_user.id;

    RETURN json_build_object(
        'ok', true,
        'user_id', v_user.id,
        'name', v_user.name,
        'display_name', COALESCE(v_user.display_name, v_user.name),
        'role', COALESCE(v_user.role, 'member'),
        'tier', COALESCE(v_user.tier, 'member'),
        'referral_code', v_ref_code,
        'avatar_url', v_user.avatar_url,
        'total_points', v_user.total_points,
        'email', v_user.email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 2. get_user_profile(p_user_id)
-- Returns full profile for logged-in user
-- Banking info is masked for security
-- Admin (checked via p_requester_id) can query any user
-- =============================================
CREATE OR REPLACE FUNCTION get_user_profile(
    p_user_id INTEGER,
    p_requester_id INTEGER DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_requester_role TEXT;
    v_target RECORD;
    v_ref_code TEXT;
    v_masked_bank TEXT;
    rate_key TEXT;
BEGIN
    -- Rate limit: 20 per 5 min
    rate_key := 'profile:' || COALESCE(p_requester_id, p_user_id)::text;
    IF is_rate_limited(rate_key, 20, 300) THEN
        RETURN json_build_object('ok', false, 'error', 'Quá nhiều yêu cầu. Vui lòng đợi.');
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Determine who is requesting
    IF p_requester_id IS NOT NULL AND p_requester_id != p_user_id THEN
        SELECT role INTO v_requester_role FROM members WHERE id = p_requester_id;
        IF v_requester_role != 'admin' THEN
            RETURN json_build_object('ok', false, 'error', 'Không có quyền truy cập');
        END IF;
    END IF;

    -- Fetch target user
    SELECT id, name, phone, email, role, display_name, avatar_url,
           date_of_birth, birth_place, cccd, bank_name,
           bank_account_number, bank_account_holder,
           tier, total_points, is_active, last_login_at,
           created_at
    INTO v_target
    FROM members
    WHERE id = p_user_id;

    IF v_target IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'Người dùng không tồn tại');
    END IF;

    -- Mask bank account number (show last 4 digits)
    IF v_target.bank_account_number IS NOT NULL AND length(v_target.bank_account_number) > 4 THEN
        v_masked_bank := repeat('*', length(v_target.bank_account_number) - 4)
                         || right(v_target.bank_account_number, 4);
    ELSE
        v_masked_bank := v_target.bank_account_number;
    END IF;

    -- Get referral code if CTV/BTV
    IF v_target.role IN ('ctv', 'btv') THEN
        SELECT referral_code INTO v_ref_code
        FROM ctv_accounts
        WHERE phone = v_target.phone;
    END IF;

    RETURN json_build_object(
        'ok', true,
        'user_id', v_target.id,
        'name', v_target.name,
        'phone', v_target.phone,
        'email', v_target.email,
        'role', COALESCE(v_target.role, 'member'),
        'display_name', COALESCE(v_target.display_name, v_target.name),
        'avatar_url', v_target.avatar_url,
        'date_of_birth', v_target.date_of_birth,
        'birth_place', v_target.birth_place,
        'cccd', v_target.cccd,
        'bank_name', v_target.bank_name,
        'bank_account_number', v_masked_bank,
        'bank_account_holder', v_target.bank_account_holder,
        'tier', COALESCE(v_target.tier, 'member'),
        'total_points', v_target.total_points,
        'referral_code', v_ref_code,
        'is_active', v_target.is_active,
        'last_login_at', v_target.last_login_at,
        'created_at', v_target.created_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 3. update_user_profile(p_user_id, p_requester_id, p_fields_json)
-- Users update their own profile; admin can update anyone
-- Allowed fields: display_name, avatar_url, date_of_birth,
--   birth_place, cccd, bank_name, bank_account_number, bank_account_holder
-- =============================================
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id INTEGER,
    p_requester_id INTEGER,
    p_fields JSONB
) RETURNS JSON AS $$
DECLARE
    v_requester_role TEXT;
    v_key TEXT;
    v_allowed_keys TEXT[] := ARRAY[
        'display_name', 'avatar_url', 'date_of_birth',
        'birth_place', 'cccd', 'bank_name',
        'bank_account_number', 'bank_account_holder'
    ];
    v_admin_keys TEXT[] := ARRAY[
        'display_name', 'avatar_url', 'date_of_birth',
        'birth_place', 'cccd', 'bank_name',
        'bank_account_number', 'bank_account_holder',
        'role', 'tier', 'is_active', 'total_points'
    ];
    v_set_parts TEXT[] := '{}';
    v_keys TEXT[];
    rate_key TEXT;
BEGIN
    -- Rate limit: 10 per 5 min
    rate_key := 'update_profile:' || p_requester_id::text;
    IF is_rate_limited(rate_key, 10, 300) THEN
        RETURN json_build_object('ok', false, 'error', 'Quá nhiều yêu cầu. Vui lòng đợi.');
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Check requester exists and get role
    SELECT role INTO v_requester_role FROM members WHERE id = p_requester_id;
    IF v_requester_role IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'Người dùng không tồn tại');
    END IF;

    -- Non-admin can only edit themselves
    IF v_requester_role != 'admin' AND p_requester_id != p_user_id THEN
        RETURN json_build_object('ok', false, 'error', 'Không có quyền chỉnh sửa');
    END IF;

    -- Determine which keys are allowed
    IF v_requester_role = 'admin' THEN
        v_keys := v_admin_keys;
    ELSE
        v_keys := v_allowed_keys;
    END IF;

    -- Validate all provided keys are in allowed list
    FOR v_key IN SELECT jsonb_object_keys(p_fields) LOOP
        IF NOT (v_key = ANY(v_keys)) THEN
            RETURN json_build_object('ok', false, 'error', 'Trường không hợp lệ: ' || v_key);
        END IF;
    END LOOP;

    -- Reject empty update
    IF (SELECT count(*) FROM jsonb_object_keys(p_fields)) = 0 THEN
        RETURN json_build_object('ok', false, 'error', 'Không có thông tin cần cập nhật');
    END IF;

    -- Build dynamic UPDATE
    -- We use explicit field-by-field to prevent SQL injection
    UPDATE members SET
        display_name = CASE WHEN p_fields ? 'display_name'
            THEN p_fields->>'display_name' ELSE display_name END,
        avatar_url = CASE WHEN p_fields ? 'avatar_url'
            THEN p_fields->>'avatar_url' ELSE avatar_url END,
        date_of_birth = CASE WHEN p_fields ? 'date_of_birth'
            THEN (p_fields->>'date_of_birth')::date ELSE date_of_birth END,
        birth_place = CASE WHEN p_fields ? 'birth_place'
            THEN p_fields->>'birth_place' ELSE birth_place END,
        cccd = CASE WHEN p_fields ? 'cccd'
            THEN p_fields->>'cccd' ELSE cccd END,
        bank_name = CASE WHEN p_fields ? 'bank_name'
            THEN p_fields->>'bank_name' ELSE bank_name END,
        bank_account_number = CASE WHEN p_fields ? 'bank_account_number'
            THEN p_fields->>'bank_account_number' ELSE bank_account_number END,
        bank_account_holder = CASE WHEN p_fields ? 'bank_account_holder'
            THEN p_fields->>'bank_account_holder' ELSE bank_account_holder END,
        -- Admin-only fields
        role = CASE WHEN p_fields ? 'role' AND v_requester_role = 'admin'
            THEN p_fields->>'role' ELSE role END,
        tier = CASE WHEN p_fields ? 'tier' AND v_requester_role = 'admin'
            THEN p_fields->>'tier' ELSE tier END,
        is_active = CASE WHEN p_fields ? 'is_active' AND v_requester_role = 'admin'
            THEN (p_fields->>'is_active')::boolean ELSE is_active END,
        total_points = CASE WHEN p_fields ? 'total_points' AND v_requester_role = 'admin'
            THEN (p_fields->>'total_points')::integer ELSE total_points END
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'Người dùng không tồn tại');
    END IF;

    RETURN json_build_object('ok', true, 'message', 'Cập nhật thành công');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 4. admin_list_users(p_admin_id, p_role_filter, p_page, p_limit)
-- Admin only — paginated user listing with role filter
-- =============================================
CREATE OR REPLACE FUNCTION admin_list_users(
    p_admin_id INTEGER,
    p_role_filter TEXT DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 20
) RETURNS JSON AS $$
DECLARE
    v_admin_role TEXT;
    v_offset INTEGER;
    v_total INTEGER;
    v_users JSON;
    rate_key TEXT;
BEGIN
    -- Rate limit
    rate_key := 'admin_users:' || p_admin_id::text;
    IF is_rate_limited(rate_key, 30, 300) THEN
        RETURN json_build_object('ok', false, 'error', 'Quá nhiều yêu cầu.');
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Verify admin role
    SELECT role INTO v_admin_role FROM members WHERE id = p_admin_id;
    IF v_admin_role != 'admin' THEN
        RETURN json_build_object('ok', false, 'error', 'Unauthorized');
    END IF;

    -- Sanitize pagination
    IF p_page < 1 THEN p_page := 1; END IF;
    IF p_limit < 1 OR p_limit > 100 THEN p_limit := 20; END IF;
    v_offset := (p_page - 1) * p_limit;

    -- Validate role filter
    IF p_role_filter IS NOT NULL
       AND p_role_filter NOT IN ('admin', 'btv', 'ctv', 'member', 'loyal_customer', 'guest') THEN
        RETURN json_build_object('ok', false, 'error', 'Role không hợp lệ');
    END IF;

    -- Count total
    SELECT COUNT(*) INTO v_total
    FROM members
    WHERE (p_role_filter IS NULL OR role = p_role_filter);

    -- Fetch page (no password_hash!)
    SELECT json_agg(row_to_json(u)) INTO v_users
    FROM (
        SELECT id, name, phone, email, role, display_name, avatar_url,
               tier, total_points, is_active, last_login_at, created_at
        FROM members
        WHERE (p_role_filter IS NULL OR role = p_role_filter)
        ORDER BY created_at DESC
        LIMIT p_limit OFFSET v_offset
    ) u;

    RETURN json_build_object(
        'ok', true,
        'users', COALESCE(v_users, '[]'::json),
        'total', v_total,
        'page', p_page,
        'limit', p_limit,
        'total_pages', CEIL(v_total::float / p_limit)::integer
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- 5. BACKWARD COMPAT: authenticate_ctv wrapper
-- CTV dashboard still calls authenticate_ctv — redirect to members table
-- Falls back to ctv_accounts if not found in members
-- =============================================
CREATE OR REPLACE FUNCTION authenticate_ctv(
    p_phone TEXT,
    p_password_hash TEXT
) RETURNS JSON AS $$
DECLARE
    v_member RECORD;
    v_ctv RECORD;
    v_ref_code TEXT;
    rate_key TEXT;
BEGIN
    rate_key := 'auth:' || p_phone;
    IF is_rate_limited(rate_key, 5, 300) THEN
        RETURN json_build_object('ok', false, 'error', 'Quá nhiều lần thử. Vui lòng đợi 5 phút.');
    END IF;

    -- Try members table first (unified)
    SELECT id, name, phone, role, display_name, tier
    INTO v_member
    FROM members
    WHERE phone = p_phone AND password_hash = p_password_hash
          AND role IN ('ctv', 'btv', 'admin');

    IF v_member IS NOT NULL THEN
        -- Get referral code from ctv_accounts
        SELECT referral_code INTO v_ref_code
        FROM ctv_accounts WHERE phone = p_phone;

        UPDATE members SET last_login_at = now() WHERE id = v_member.id;

        RETURN json_build_object(
            'ok', true,
            'id', v_member.id,
            'name', v_member.name,
            'phone', v_member.phone,
            'referral_code', v_ref_code,
            'tier', COALESCE(v_member.tier, 'silver'),
            'role', v_member.role
        );
    END IF;

    -- Fallback: try ctv_accounts table (legacy)
    SELECT id, name, phone, referral_code, tier
    INTO v_ctv
    FROM ctv_accounts
    WHERE phone = p_phone AND password_hash = p_password_hash;

    IF v_ctv IS NULL THEN
        PERFORM record_failed_attempt(rate_key);
        RETURN json_build_object('ok', false, 'error', 'Sai thông tin đăng nhập');
    END IF;

    RETURN json_build_object(
        'ok', true,
        'id', v_ctv.id,
        'name', v_ctv.name,
        'phone', v_ctv.phone,
        'referral_code', v_ctv.referral_code,
        'tier', COALESCE(v_ctv.tier, 'silver'),
        'role', 'ctv'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
