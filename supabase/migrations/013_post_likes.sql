-- =============================================
-- 013: POST LIKES — Tương tác bài chia sẻ
-- Rate-limited, chỉ cho bài đã duyệt
-- =============================================

-- =============================================
-- RPC: Like bài viết (tăng likes + 1)
-- Không cần auth, nhưng rate-limited theo post_id
-- =============================================
CREATE OR REPLACE FUNCTION like_post(p_post_id INTEGER)
RETURNS JSON AS $$
DECLARE
    rate_key TEXT;
    updated_likes INTEGER;
BEGIN
    -- Rate limit: 5 likes per post per 5 minutes
    rate_key := 'like:' || p_post_id::text;
    IF is_rate_limited(rate_key, 5, 300) THEN
        RAISE EXCEPTION 'Quá nhiều lượt thích. Vui lòng đợi.';
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Chỉ like bài đã duyệt
    UPDATE member_posts
    SET likes = likes + 1
    WHERE id = p_post_id AND is_approved = true
    RETURNING likes INTO updated_likes;

    IF updated_likes IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'Bài viết không tồn tại hoặc chưa được duyệt');
    END IF;

    RETURN json_build_object('ok', true, 'likes', updated_likes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
