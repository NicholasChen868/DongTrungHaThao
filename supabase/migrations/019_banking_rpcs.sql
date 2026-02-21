-- =========================================
-- MIGRATION 019: CTV Banking Info RPCs
-- Applied: 2026-02-21
-- =========================================
-- Get CTV banking info (masked account number for display)
CREATE OR REPLACE FUNCTION get_ctv_banking(p_ref_code TEXT) RETURNS JSON AS $$
DECLARE v_ctv RECORD;
BEGIN
SELECT bank_name,
    bank_account_number,
    bank_account_holder,
    bank_branch
FROM ctv_accounts
WHERE referral_code = p_ref_code INTO v_ctv;
IF v_ctv IS NULL THEN RETURN json_build_object('ok', true, 'has_banking', false);
END IF;
RETURN json_build_object(
    'ok',
    true,
    'has_banking',
    v_ctv.bank_name IS NOT NULL,
    'bank_name',
    v_ctv.bank_name,
    'bank_account_number',
    CASE
        WHEN v_ctv.bank_account_number IS NOT NULL
        AND length(v_ctv.bank_account_number) > 4 THEN repeat('*', length(v_ctv.bank_account_number) - 4) || right(v_ctv.bank_account_number, 4)
        ELSE v_ctv.bank_account_number
    END,
    'bank_account_number_full',
    v_ctv.bank_account_number,
    'bank_account_holder',
    v_ctv.bank_account_holder,
    'bank_branch',
    v_ctv.bank_branch
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Update CTV banking info with validation and rate limiting
CREATE OR REPLACE FUNCTION update_ctv_banking(
        p_ref_code TEXT,
        p_bank_name TEXT,
        p_account_number TEXT,
        p_account_holder TEXT,
        p_branch TEXT DEFAULT NULL
    ) RETURNS JSON AS $$
DECLARE v_ctv_id INTEGER;
rate_key TEXT;
BEGIN rate_key := 'bank_update:' || p_ref_code;
-- Rate limit: 5 updates per hour
IF is_rate_limited(rate_key, 5, 3600) THEN RETURN json_build_object(
    'ok',
    false,
    'error',
    'Bạn đã thay đổi thông tin ngân hàng quá nhiều lần. Vui lòng đợi 1 giờ.'
);
END IF;
PERFORM record_failed_attempt(rate_key);
-- Validate account number format
IF p_account_number !~ '^[0-9]{8,20}$' THEN RETURN json_build_object(
    'ok',
    false,
    'error',
    'Số tài khoản phải từ 8-20 chữ số'
);
END IF;
-- Validate holder name
IF length(p_account_holder) < 3 THEN RETURN json_build_object(
    'ok',
    false,
    'error',
    'Tên chủ tài khoản không hợp lệ'
);
END IF;
-- Update banking info
UPDATE ctv_accounts
SET bank_name = p_bank_name,
    bank_account_number = p_account_number,
    bank_account_holder = UPPER(p_account_holder),
    bank_branch = p_branch
WHERE referral_code = p_ref_code
RETURNING id INTO v_ctv_id;
IF v_ctv_id IS NULL THEN RETURN json_build_object('ok', false, 'error', 'Mã CTV không tồn tại');
END IF;
RETURN json_build_object(
    'ok',
    true,
    'message',
    'Cập nhật thông tin ngân hàng thành công'
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;