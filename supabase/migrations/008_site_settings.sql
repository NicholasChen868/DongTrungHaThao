-- =============================================  
-- SITE SETTINGS — Centralized config for admin
-- Stores: prices, discounts, site text, toggles
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- Public can read non-sensitive settings
CREATE POLICY "public_read_settings" ON site_settings FOR
SELECT TO anon USING (key NOT LIKE 'admin_%');
-- Insert default product config
INSERT INTO site_settings (key, value, description)
VALUES (
        'product_pricing',
        '{
        "unit_price": 850000,
        "currency": "VND",
        "product_name": "Đông Trùng Hạ Thảo Viên Nang",
        "product_subtitle": "Viên nang nguyên chất 500mg — Nuôi cấy tại Việt Nam",
        "quantity_options": [1, 2, 3, 5, 10],
        "discounts": {"1": 0, "2": 0, "3": 5, "5": 10, "10": 15},
        "free_shipping_min": 3,
        "enabled": true
    }'::jsonb,
        'Bảng giá sản phẩm: đơn giá, giảm giá theo SL, freeship'
    ),
    (
        'hero_content',
        '{
        "title": "Đông Trùng Hạ Thảo Nguyên Chất",
        "subtitle": "Viên nang 500mg — Nuôi cấy tại Đà Lạt",
        "cta_text": "Đặt Hàng Ngay",
        "cta_link": "#contact",
        "badge_text": "🍄 100% Nguyên Chất"
    }'::jsonb,
        'Nội dung Hero section trang chủ'
    ),
    (
        'contact_info',
        '{
        "phone": "0374867868",
        "zalo": "0374867868",
        "address": "Đà Lạt, Lâm Đồng",
        "working_hours": "8:00 — 21:00 hàng ngày"
    }'::jsonb,
        'Thông tin liên hệ hiển thị trên site'
    ),
    (
        'ctv_config',
        '{
        "commission_rates": {"silver": 8, "gold": 12, "diamond": 15},
        "min_withdrawal": 200000,
        "registration_enabled": true,
        "auto_approve": false
    }'::jsonb,
        'Cấu hình CTV: hoa hồng, rút tiền tối thiểu'
    ),
    (
        'site_announcement',
        '{
        "enabled": false,
        "message": "",
        "type": "info",
        "dismissible": true
    }'::jsonb,
        'Thanh thông báo trên cùng trang chủ'
    ) ON CONFLICT (key) DO NOTHING;
-- Admin RPC: Get all settings
CREATE OR REPLACE FUNCTION admin_get_settings(p_admin_hash TEXT) RETURNS JSON AS $$
DECLARE admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
result JSON;
BEGIN IF p_admin_hash != admin_hash THEN RAISE EXCEPTION 'Unauthorized';
END IF;
SELECT json_agg(row_to_json(s)) INTO result
FROM (
        SELECT key,
            value,
            description,
            updated_at
        FROM site_settings
        ORDER BY key
    ) s;
RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Admin RPC: Update a setting
CREATE OR REPLACE FUNCTION admin_update_setting(p_admin_hash TEXT, p_key TEXT, p_value JSONB) RETURNS VOID AS $$
DECLARE admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
BEGIN IF p_admin_hash != admin_hash THEN RAISE EXCEPTION 'Unauthorized';
END IF;
UPDATE site_settings
SET value = p_value,
    updated_at = now()
WHERE key = p_key;
IF NOT FOUND THEN
INSERT INTO site_settings (key, value)
VALUES (p_key, p_value);
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Public RPC: Get pricing (for frontend to load dynamic prices)
CREATE OR REPLACE FUNCTION get_product_pricing() RETURNS JSON AS $$ BEGIN RETURN (
        SELECT value
        FROM site_settings
        WHERE key = 'product_pricing'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;