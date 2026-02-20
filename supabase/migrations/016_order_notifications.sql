-- =============================================
-- 016: CTV NOTIFICATIONS — Thông báo đơn hàng cho CTV
-- Bảng + RPCs + Trigger tự động tạo thông báo
-- =============================================

-- Bảng thông báo
CREATE TABLE IF NOT EXISTS ctv_notifications (
    id SERIAL PRIMARY KEY,
    ctv_id INTEGER REFERENCES ctv_accounts(id),
    type TEXT NOT NULL,  -- 'new_order', 'commission', 'withdrawal_approved', 'post_reward'
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index cho truy vấn nhanh theo ctv_id
CREATE INDEX IF NOT EXISTS idx_ctv_notifications_ctv ON ctv_notifications(ctv_id, created_at DESC);

-- RLS: không cho phép truy cập trực tiếp
ALTER TABLE ctv_notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RPC: get_ctv_notifications
-- Lấy 20 thông báo mới nhất của CTV
-- =============================================
CREATE OR REPLACE FUNCTION get_ctv_notifications(
    p_ref_code TEXT
) RETURNS JSON AS $$
DECLARE
    v_ctv_id INTEGER;
    result JSON;
    unread_count INTEGER;
    rate_key TEXT;
BEGIN
    -- Rate limit: 15 calls per 5 minutes
    rate_key := 'notif:' || p_ref_code;
    IF is_rate_limited(rate_key, 15, 300) THEN
        RAISE EXCEPTION 'Quá nhiều yêu cầu. Vui lòng đợi.';
    END IF;
    PERFORM record_failed_attempt(rate_key);

    -- Find CTV
    SELECT id INTO v_ctv_id
    FROM ctv_accounts
    WHERE referral_code = p_ref_code;

    IF v_ctv_id IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'CTV not found');
    END IF;

    -- Count unread
    SELECT COUNT(*) INTO unread_count
    FROM ctv_notifications
    WHERE ctv_id = v_ctv_id AND is_read = false;

    -- Get latest 20
    SELECT json_agg(row_to_json(n)) INTO result
    FROM (
        SELECT id, type, title, message, is_read, created_at
        FROM ctv_notifications
        WHERE ctv_id = v_ctv_id
        ORDER BY created_at DESC
        LIMIT 20
    ) n;

    RETURN json_build_object(
        'ok', true,
        'unread_count', unread_count,
        'notifications', COALESCE(result, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC: mark_notification_read
-- Đánh dấu thông báo đã đọc
-- =============================================
CREATE OR REPLACE FUNCTION mark_notification_read(
    p_ref_code TEXT,
    p_notification_id INTEGER
) RETURNS JSON AS $$
DECLARE
    v_ctv_id INTEGER;
BEGIN
    -- Find CTV
    SELECT id INTO v_ctv_id
    FROM ctv_accounts
    WHERE referral_code = p_ref_code;

    IF v_ctv_id IS NULL THEN
        RETURN json_build_object('ok', false, 'error', 'CTV not found');
    END IF;

    -- Mark as read (only if belongs to this CTV)
    UPDATE ctv_notifications
    SET is_read = true
    WHERE id = p_notification_id
      AND ctv_id = v_ctv_id;

    RETURN json_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGER: Tự động tạo thông báo khi có đơn hàng mới
-- Khi đơn hàng INSERT với ctv_code khớp CTV → thông báo
-- =============================================
CREATE OR REPLACE FUNCTION notify_ctv_new_order()
RETURNS TRIGGER AS $$
DECLARE
    v_ctv_id INTEGER;
    v_amount TEXT;
BEGIN
    -- Chỉ xử lý khi có ctv_code
    IF NEW.ctv_code IS NULL OR NEW.ctv_code = '' THEN
        RETURN NEW;
    END IF;

    -- Tìm CTV
    SELECT id INTO v_ctv_id
    FROM ctv_accounts
    WHERE referral_code = NEW.ctv_code;

    IF v_ctv_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Format tiền
    v_amount := to_char(NEW.total_amount, 'FM999,999,999') || '₫';

    -- Tạo thông báo
    INSERT INTO ctv_notifications (ctv_id, type, title, message)
    VALUES (
        v_ctv_id,
        'new_order',
        'Đơn hàng mới #' || NEW.id,
        'Khách ' || NEW.customer_name || ' đặt ' || NEW.quantity || ' hộp — ' || v_amount
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn trigger vào bảng orders
DROP TRIGGER IF EXISTS trg_notify_ctv_new_order ON orders;
CREATE TRIGGER trg_notify_ctv_new_order
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_ctv_new_order();
