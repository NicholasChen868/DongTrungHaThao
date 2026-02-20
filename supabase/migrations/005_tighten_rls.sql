-- =============================================
-- 005: TIGHTEN RLS POLICIES + RPC FUNCTIONS
-- Security Hardening Phase 1
-- =============================================
-- Since the app uses anon key only (no Supabase Auth),
-- we use RPC functions with SECURITY DEFINER to enforce access control.
-- Direct table access is restricted; all reads/writes go through RPCs.

-- =============================================
-- ADMIN HASH CONSTANT (sha256 of admin password)
-- Used by admin RPC functions to verify identity
-- =============================================

-- =============================================
-- 1. MEMBER AUTH RPC FUNCTIONS
-- =============================================

-- Authenticate member (login)
CREATE OR REPLACE FUNCTION authenticate_member(p_phone TEXT, p_password_hash TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', id, 'name', name, 'phone', phone,
        'email', email, 'total_points', total_points,
        'created_at', created_at
    ) INTO result
    FROM members
    WHERE phone = p_phone AND password_hash = p_password_hash;

    RETURN result; -- NULL if no match
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if phone number exists (registration)
CREATE OR REPLACE FUNCTION check_phone_exists(p_phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM members WHERE phone = p_phone);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get member's orders (requires member credentials)
CREATE OR REPLACE FUNCTION get_member_orders(p_phone TEXT, p_password_hash TEXT)
RETURNS JSON AS $$
DECLARE
    member_exists BOOLEAN;
    result JSON;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM members WHERE phone = p_phone AND password_hash = p_password_hash
    ) INTO member_exists;

    IF NOT member_exists THEN
        RETURN NULL;
    END IF;

    SELECT json_agg(row_to_json(o))
    INTO result
    FROM (
        SELECT id, customer_name, phone, quantity, total_amount, status, created_at
        FROM orders
        WHERE phone = p_phone
        ORDER BY created_at DESC
        LIMIT 20
    ) o;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. PUBLIC RPC FUNCTIONS
-- =============================================

-- Increment post views (public, no auth needed)
CREATE OR REPLACE FUNCTION increment_post_views(p_post_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE member_posts SET views = COALESCE(views, 0) + 1
    WHERE id = p_post_id AND is_approved = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. ADMIN RPC FUNCTIONS
-- =============================================

-- Admin: Get overview stats
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

    SELECT json_agg(row_to_json(o)) INTO recent_orders
    FROM (SELECT * FROM orders ORDER BY created_at DESC LIMIT 5) o;

    SELECT json_agg(row_to_json(c)) INTO recent_ctv
    FROM (SELECT * FROM ctv_accounts ORDER BY created_at DESC LIMIT 5) c;

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

-- Admin: List all orders
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
    FROM (SELECT * FROM orders ORDER BY created_at DESC LIMIT 100) o;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Update order status
CREATE OR REPLACE FUNCTION admin_update_order_status(p_admin_hash TEXT, p_order_id INTEGER, p_status TEXT)
RETURNS VOID AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_status NOT IN ('pending', 'confirmed', 'shipping', 'completed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid status';
    END IF;

    UPDATE orders SET status = p_status, updated_at = now() WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: List all posts (including unapproved)
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
    FROM (SELECT * FROM member_posts ORDER BY created_at DESC) p;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Approve/reject post
CREATE OR REPLACE FUNCTION admin_update_post_status(p_admin_hash TEXT, p_post_id INTEGER, p_approve BOOLEAN)
RETURNS VOID AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    UPDATE member_posts SET is_approved = p_approve WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: List all CTVs
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
    FROM (SELECT * FROM ctv_accounts ORDER BY created_at DESC LIMIT 100) c;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Upgrade CTV tier
CREATE OR REPLACE FUNCTION admin_upgrade_ctv(p_admin_hash TEXT, p_ref_code TEXT, p_new_tier TEXT)
RETURNS VOID AS $$
DECLARE
    admin_hash CONSTANT TEXT := '6445e373d7fcde106bfcb897ee8f0bb28589bd7797f54f1ef4e5d5447cfbd011';
BEGIN
    IF p_admin_hash != admin_hash THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_new_tier NOT IN ('silver', 'gold', 'diamond') THEN
        RAISE EXCEPTION 'Invalid tier';
    END IF;

    UPDATE ctv_accounts SET tier = p_new_tier WHERE referral_code = p_ref_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Get analytics data (orders in last N days)
CREATE OR REPLACE FUNCTION admin_get_analytics(p_admin_hash TEXT, p_days INTEGER DEFAULT 30)
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
        SELECT total_amount, status, created_at
        FROM orders
        WHERE created_at >= (now() - (p_days || ' days')::interval)
        ORDER BY created_at DESC
    ) o;

    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. TIGHTEN RLS POLICIES
-- =============================================

-- --- MEMBERS TABLE ---
DROP POLICY IF EXISTS "Allow anon read members" ON members;
DROP POLICY IF EXISTS "Allow anon update members" ON members;

-- No direct SELECT for anon (use authenticate_member RPC)
-- No direct UPDATE for anon
-- INSERT stays open for registration

-- --- MEMBER_POSTS TABLE ---
DROP POLICY IF EXISTS "Allow anon read member_posts" ON member_posts;
DROP POLICY IF EXISTS "Allow anon update member_posts" ON member_posts;
DROP POLICY IF EXISTS "member_posts_anon_select" ON member_posts;
DROP POLICY IF EXISTS "member_posts_anon_update" ON member_posts;
DROP POLICY IF EXISTS "member_posts_anon_insert" ON member_posts;

-- SELECT: Only approved posts visible to public
CREATE POLICY "member_posts_public_read" ON member_posts
    FOR SELECT TO anon
    USING (is_approved = true);

-- INSERT: Members can create posts
CREATE POLICY "member_posts_insert" ON member_posts
    FOR INSERT TO anon
    WITH CHECK (member_id IS NOT NULL AND is_approved = false);

-- No direct UPDATE for anon (use admin RPC for approve/reject)

-- --- ORDERS TABLE ---
DROP POLICY IF EXISTS "Allow anon read own orders" ON orders;
DROP POLICY IF EXISTS "Allow anon update orders" ON orders;

-- No direct SELECT for anon (use get_member_orders or admin_list_orders RPC)
-- No direct UPDATE for anon (use admin_update_order_status RPC)
-- INSERT stays open for order form
