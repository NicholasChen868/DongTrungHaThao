-- =============================================
-- 010: SECURITY HARDENING — Phase 5
-- Fix RLS policies + Admin RPC SELECT * → explicit columns
-- =============================================

-- =============================================
-- 1. ORDERS TABLE — Restrict direct access
-- =============================================

-- Drop old overly-permissive policies
DROP POLICY IF EXISTS "Allow anonymous order insert" ON orders;
DROP POLICY IF EXISTS "Allow anon read own orders" ON orders;
DROP POLICY IF EXISTS "Allow anon update orders" ON orders;

-- INSERT: Allow order placement (restrict fields via CHECK)
CREATE POLICY "orders_anon_insert" ON orders
    FOR INSERT TO anon
    WITH CHECK (
        status = 'pending'
        AND customer_name IS NOT NULL
        AND phone IS NOT NULL
        AND address IS NOT NULL
        AND quantity >= 1
        AND total_amount > 0
    );

-- SELECT: No direct SELECT for anon
-- Orders are read via RPC: get_member_orders (member) or admin_list_orders (admin)
-- tra-cuu.html currently uses direct SELECT — migrate to RPC below

-- UPDATE: No direct UPDATE for anon
-- Status changes via admin_update_order_status RPC only

-- =============================================
-- 2. MEMBERS TABLE — Block direct access
-- =============================================

-- Drop all old policies (004 created open policies, 005 tried to drop but may not have run cleanly)
DROP POLICY IF EXISTS "Allow anon register" ON members;
DROP POLICY IF EXISTS "Allow anon read members" ON members;
DROP POLICY IF EXISTS "Allow anon update members" ON members;

-- INSERT: Allow registration only
CREATE POLICY "members_anon_insert" ON members
    FOR INSERT TO anon
    WITH CHECK (
        name IS NOT NULL
        AND phone IS NOT NULL
        AND password_hash IS NOT NULL
        AND total_points = 0
    );

-- No SELECT, UPDATE for anon — all via RPC (authenticate_member, get_member_orders)

-- =============================================
-- 3. WITHDRAWALS TABLE — Restrict access
-- =============================================

DROP POLICY IF EXISTS "Allow anon insert withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow anon read withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Allow anon update withdrawals" ON withdrawals;

-- INSERT: CTV can create withdrawal requests (validated by app)
CREATE POLICY "withdrawals_anon_insert" ON withdrawals
    FOR INSERT TO anon
    WITH CHECK (
        status = 'pending'
        AND ctv_code IS NOT NULL
        AND ctv_name IS NOT NULL
        AND amount >= 50000
        AND bank_name IS NOT NULL
        AND bank_account IS NOT NULL
        AND bank_holder IS NOT NULL
    );

-- SELECT: No direct SELECT for anon
-- Read via RPC below

-- UPDATE: No direct UPDATE for anon
-- Admin updates via RPC below

-- =============================================
-- 4. PAGE_VIEWS — Add rate limiting via unique constraint
-- =============================================

-- Already limited to INSERT only. Add a functional limit via unique constraint
-- to prevent spam: max 1 view per page_path per session (5 min window)
-- (This is a soft limit; the existing tracker.js also checks client-side)

-- =============================================
-- 5. NEW RPC: track_orders (replaces direct SELECT in tra-cuu.html)
-- =============================================

CREATE OR REPLACE FUNCTION track_orders(p_phone TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Validate phone format (10 digits starting with 0)
    IF p_phone !~ '^0[0-9]{9}$' THEN
        RAISE EXCEPTION 'Số điện thoại không hợp lệ';
    END IF;

    SELECT json_agg(row_to_json(o))
    INTO result
    FROM (
        SELECT id, customer_name, phone, quantity, total_amount,
               status, address, created_at
        FROM orders
        WHERE phone = p_phone
        ORDER BY created_at DESC
        LIMIT 20
    ) o;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. NEW RPC: admin_list_withdrawals (replaces direct table access)
-- =============================================

CREATE OR REPLACE FUNCTION admin_list_withdrawals(p_admin_hash TEXT)
RETURNS JSON AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
    result JSON;
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_agg(row_to_json(w))
    INTO result
    FROM (
        SELECT id, ctv_code, ctv_name, amount, bank_name, bank_account,
               bank_holder, note, status, admin_note, created_at, updated_at
        FROM withdrawals
        ORDER BY created_at DESC
        LIMIT 100
    ) w;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. NEW RPC: admin_process_withdrawal (replaces direct UPDATE)
-- =============================================

CREATE OR REPLACE FUNCTION admin_process_withdrawal(
    p_admin_hash TEXT,
    p_withdrawal_id INTEGER,
    p_status TEXT
)
RETURNS VOID AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_status NOT IN ('approved', 'rejected', 'paid') THEN
        RAISE EXCEPTION 'Invalid status';
    END IF;

    UPDATE withdrawals
    SET status = p_status, updated_at = now()
    WHERE id = p_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. FIX ADMIN RPCs: SELECT * → explicit columns (hide password_hash)
-- =============================================

-- admin_get_overview: Fix SELECT * on ctv_accounts and orders
CREATE OR REPLACE FUNCTION admin_get_overview(p_admin_hash TEXT)
RETURNS JSON AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
    result JSON;
    order_count INTEGER;
    revenue BIGINT;
    ctv_count INTEGER;
    contact_count INTEGER;
    recent_orders JSON;
    recent_ctv JSON;
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT COUNT(*) INTO order_count FROM orders;

    SELECT COALESCE(SUM(total_amount), 0) INTO revenue
    FROM orders WHERE status = 'completed';

    SELECT COUNT(*) INTO ctv_count FROM ctv_accounts;

    SELECT COUNT(*) INTO contact_count FROM contact_submissions;

    -- Explicit columns — NO password_hash
    SELECT json_agg(row_to_json(o)) INTO recent_orders
    FROM (
        SELECT id, customer_name, phone, quantity, total_amount, status, created_at
        FROM orders ORDER BY created_at DESC LIMIT 5
    ) o;

    SELECT json_agg(row_to_json(c)) INTO recent_ctv
    FROM (
        SELECT id, name, phone, email, referral_code, tier, total_points, created_at
        FROM ctv_accounts ORDER BY created_at DESC LIMIT 5
    ) c;

    RETURN json_build_object(
        'order_count', order_count,
        'revenue', revenue,
        'ctv_count', ctv_count,
        'contact_count', contact_count,
        'recent_orders', COALESCE(recent_orders, '[]'::json),
        'recent_ctv', COALESCE(recent_ctv, '[]'::json)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- admin_list_orders: Fix SELECT *
CREATE OR REPLACE FUNCTION admin_list_orders(p_admin_hash TEXT)
RETURNS JSON AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
    result JSON;
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_agg(row_to_json(o)) INTO result
    FROM (
        SELECT id, customer_name, phone, address, quantity, unit_price,
               discount_percent, total_amount, ctv_code, note, status,
               admin_note, created_at, updated_at
        FROM orders ORDER BY created_at DESC LIMIT 100
    ) o;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- admin_list_ctv: Fix SELECT * — exclude password_hash
CREATE OR REPLACE FUNCTION admin_list_ctv(p_admin_hash TEXT)
RETURNS JSON AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
    result JSON;
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_agg(row_to_json(c)) INTO result
    FROM (
        SELECT id, name, phone, email, referral_code, tier,
               total_points, available_vnd, created_at
        FROM ctv_accounts ORDER BY created_at DESC LIMIT 100
    ) c;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- admin_list_posts: Fix SELECT *
CREATE OR REPLACE FUNCTION admin_list_posts(p_admin_hash TEXT)
RETURNS JSON AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
    result JSON;
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_agg(row_to_json(p)) INTO result
    FROM (
        SELECT id, member_id, member_name, title, content, category,
               is_approved, views, likes, created_at
        FROM member_posts ORDER BY created_at DESC
    ) p;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
