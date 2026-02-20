-- =============================================
-- 017: HEALTH MAP — Lưu & Chia Sẻ Kết Quả Ngũ Hành
-- Cho phép chia sẻ kết quả phân tích qua link
-- =============================================

-- Bảng lưu kết quả
CREATE TABLE IF NOT EXISTS health_map_results (
    id SERIAL PRIMARY KEY,
    share_code TEXT UNIQUE NOT NULL,  -- 8 ký tự random
    name TEXT NOT NULL,
    birth_year INTEGER NOT NULL,
    element TEXT NOT NULL,  -- Kim, Mộc, Thủy, Hỏa, Thổ
    ref_code TEXT,  -- CTV referral nếu có
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index cho tra cứu share_code
CREATE INDEX IF NOT EXISTS idx_health_map_share ON health_map_results(share_code);

-- RLS: không cho phép truy cập trực tiếp
ALTER TABLE health_map_results ENABLE ROW LEVEL SECURITY;

-- Cho phép INSERT (không cần auth)
CREATE POLICY "health_map_anon_insert" ON health_map_results FOR
INSERT TO anon WITH CHECK (
    name IS NOT NULL
    AND birth_year >= 1900
    AND birth_year <= 2100
    AND element IN ('Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ')
);

-- =============================================
-- RPC: save_health_map
-- Lưu kết quả, trả về share_code
-- =============================================
CREATE OR REPLACE FUNCTION save_health_map(
    p_name TEXT,
    p_birth_year INTEGER,
    p_element TEXT,
    p_ref_code TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_share_code TEXT;
    rate_key TEXT;
    v_attempts INTEGER := 0;
BEGIN
    -- Rate limit: 20 saves per hour
    rate_key := 'healthmap:' || COALESCE(p_ref_code, 'anon');
    IF is_rate_limited(rate_key, 20, 3600) THEN
        RAISE EXCEPTION 'Quá nhiều yêu cầu. Vui lòng đợi.';
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Validate
    IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
        RAISE EXCEPTION 'Tên không hợp lệ';
    END IF;
    IF p_birth_year < 1900 OR p_birth_year > 2100 THEN
        RAISE EXCEPTION 'Năm sinh không hợp lệ';
    END IF;
    IF p_element NOT IN ('Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ') THEN
        RAISE EXCEPTION 'Mệnh không hợp lệ';
    END IF;

    -- Generate unique 8-char share code
    LOOP
        v_share_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
        BEGIN
            INSERT INTO health_map_results (share_code, name, birth_year, element, ref_code)
            VALUES (v_share_code, trim(p_name), p_birth_year, p_element, NULLIF(trim(COALESCE(p_ref_code, '')), ''));
            EXIT;  -- success
        EXCEPTION WHEN unique_violation THEN
            v_attempts := v_attempts + 1;
            IF v_attempts > 5 THEN
                RAISE EXCEPTION 'Không thể tạo mã chia sẻ';
            END IF;
        END;
    END LOOP;

    RETURN json_build_object(
        'ok', true,
        'share_code', v_share_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC: get_health_map
-- Lấy kết quả theo share_code (public, không cần login)
-- =============================================
CREATE OR REPLACE FUNCTION get_health_map(
    p_share_code TEXT
) RETURNS JSON AS $$
DECLARE
    result JSON;
    rate_key TEXT;
BEGIN
    -- Rate limit: 30 lookups per 5 minutes
    rate_key := 'healthmap_get:' || p_share_code;
    IF is_rate_limited(rate_key, 30, 300) THEN
        RAISE EXCEPTION 'Quá nhiều yêu cầu. Vui lòng đợi.';
    END IF;
    PERFORM record_failed_attempt(rate_key);

    SELECT json_build_object(
        'ok', true,
        'name', name,
        'birth_year', birth_year,
        'element', element,
        'ref_code', ref_code,
        'created_at', created_at
    ) INTO result
    FROM health_map_results
    WHERE share_code = upper(p_share_code);

    IF result IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'Không tìm thấy kết quả');
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
