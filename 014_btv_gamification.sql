-- =============================================
-- 014: BTV GAMIFICATION — Nhuận bút cho Biên Tập Viên
-- Khi admin duyệt bài viết, BTV được cộng 30,000đ vào ví CTV
-- =============================================

-- 1a. Thêm cột reward_points_granted vào member_posts
ALTER TABLE member_posts ADD COLUMN IF NOT EXISTS reward_points_granted BOOLEAN DEFAULT false;

-- =============================================
-- 1b. RPC: approve_post_and_reward
-- Duyệt bài + cộng 30,000đ vào ví CTV (nếu BTV có tài khoản CTV)
-- =============================================
CREATE OR REPLACE FUNCTION approve_post_and_reward(
    p_admin_hash TEXT,
    p_post_id INTEGER
) RETURNS JSON AS $$
DECLARE
    v_member_id INTEGER;
    v_member_phone TEXT;
    v_ctv_id INTEGER;
    v_ctv_found BOOLEAN := false;
    v_already_rewarded BOOLEAN;
BEGIN
    -- Validate admin (rate-limited via validate_admin)
    PERFORM validate_admin(p_admin_hash);

    -- Check post exists and hasn't been rewarded already
    SELECT member_id, reward_points_granted
    INTO v_member_id, v_already_rewarded
    FROM member_posts
    WHERE id = p_post_id;

    IF v_member_id IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'Bài viết không tồn tại');
    END IF;

    IF v_already_rewarded THEN
        RETURN json_build_object(
            'ok', true,
            'post_id', p_post_id,
            'points_credited', false,
            'ctv_found', false,
            'message', 'Bài đã được duyệt và cộng nhuận bút trước đó'
        );
    END IF;

    -- Approve post + mark rewarded
    UPDATE member_posts
    SET is_approved = true,
        reward_points_granted = true
    WHERE id = p_post_id;

    -- Find CTV account via member phone
    SELECT m.phone INTO v_member_phone
    FROM members m
    WHERE m.id = v_member_id;

    IF v_member_phone IS NOT NULL THEN
        SELECT id INTO v_ctv_id
        FROM ctv_accounts
        WHERE phone = v_member_phone;

        IF v_ctv_id IS NOT NULL THEN
            -- Credit 30,000đ to CTV wallet
            UPDATE ctv_accounts
            SET available_vnd = available_vnd + 30000
            WHERE id = v_ctv_id;

            -- Log transaction
            INSERT INTO point_transactions (ctv_id, content_type, points, status)
            VALUES (v_ctv_id, 'nhuan_but', 30000, 'approved');

            v_ctv_found := true;
        END IF;
    END IF;

    RETURN json_build_object(
        'ok', true,
        'post_id', p_post_id,
        'points_credited', v_ctv_found,
        'ctv_found', v_ctv_found
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 1c. RPC: get_btv_posts (cho CTV Dashboard)
-- Lấy danh sách bài viết của BTV qua ref_code
-- =============================================
CREATE OR REPLACE FUNCTION get_btv_posts(
    p_ref_code TEXT
) RETURNS JSON AS $$
DECLARE
    v_ctv_phone TEXT;
    v_member_id INTEGER;
    result JSON;
    rate_key TEXT;
BEGIN
    -- Rate limit: 10 calls per 5 minutes
    rate_key := 'btv_posts:' || p_ref_code;
    IF is_rate_limited(rate_key, 10, 300) THEN
        RAISE EXCEPTION 'Quá nhiều yêu cầu. Vui lòng đợi.';
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Find CTV phone → member_id
    SELECT phone INTO v_ctv_phone
    FROM ctv_accounts
    WHERE referral_code = p_ref_code;

    IF v_ctv_phone IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'CTV not found');
    END IF;

    SELECT id INTO v_member_id
    FROM members
    WHERE phone = v_ctv_phone;

    IF v_member_id IS NULL THEN
        -- CTV exists but no member account with same phone
        RETURN json_build_object('ok', true, 'posts', '[]'::json);
    END IF;

    -- Get posts by this member
    SELECT json_agg(row_to_json(p)) INTO result
    FROM (
        SELECT id, title, category, is_approved, reward_points_granted,
               views, likes, created_at
        FROM member_posts
        WHERE member_id = v_member_id
        ORDER BY created_at DESC
        LIMIT 50
    ) p;

    RETURN json_build_object('ok', true, 'posts', COALESCE(result, '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 1d. Update admin_list_posts to include reward_points_granted
-- =============================================
CREATE OR REPLACE FUNCTION admin_list_posts(p_admin_hash TEXT) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    PERFORM validate_admin(p_admin_hash);

    SELECT json_agg(row_to_json(p)) INTO result
    FROM (
        SELECT id, member_id, member_name, title, content, category,
               is_approved, reward_points_granted, views, likes, created_at
        FROM member_posts
        ORDER BY created_at DESC
    ) p;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
