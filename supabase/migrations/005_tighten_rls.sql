-- =============================================
-- 005: TIGHTEN RLS POLICIES — Security Hardening
-- =============================================
-- Problem: Current policies allow anon to SELECT/UPDATE all records
-- Fix: Restrict access based on ownership (phone/member_id match)

-- =============================================
-- 1. MEMBERS TABLE — Restrict SELECT & UPDATE
-- =============================================
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow anon read members" ON members;
DROP POLICY IF EXISTS "Allow anon update members" ON members;

-- SELECT: Only allow reading own record by phone match
-- Used for login (client sends phone + password_hash filter)
CREATE POLICY "Members select own by phone" ON members
    FOR SELECT TO anon
    USING (phone = current_setting('request.headers', true)::json->>'x-member-phone'
           OR phone = current_setting('request.querystring', true)::json->>'phone'
           OR id::text = current_setting('request.querystring', true)::json->>'id');

-- UPDATE: Only allow updating own record (match by phone)
CREATE POLICY "Members update own" ON members
    FOR UPDATE TO anon
    USING (phone = current_setting('request.headers', true)::json->>'x-member-phone')
    WITH CHECK (phone = current_setting('request.headers', true)::json->>'x-member-phone');

-- INSERT: Keep open for registration (already exists, no change needed)

-- =============================================
-- 2. MEMBER_POSTS TABLE — Restrict UPDATE & add SELECT filter
-- =============================================
-- First check if policies exist and drop them
DROP POLICY IF EXISTS "Allow anon read member_posts" ON member_posts;
DROP POLICY IF EXISTS "Allow anon update member_posts" ON member_posts;
DROP POLICY IF EXISTS "Allow anon insert member_posts" ON member_posts;
DROP POLICY IF EXISTS "member_posts_select" ON member_posts;
DROP POLICY IF EXISTS "member_posts_insert" ON member_posts;
DROP POLICY IF EXISTS "member_posts_update" ON member_posts;

-- SELECT: Public can read approved posts; owners can read their own
CREATE POLICY "member_posts_select" ON member_posts
    FOR SELECT TO anon
    USING (is_approved = true
           OR member_id::text = current_setting('request.headers', true)::json->>'x-member-id');

-- INSERT: Members can create posts (member_id required)
CREATE POLICY "member_posts_insert" ON member_posts
    FOR INSERT TO anon
    WITH CHECK (member_id IS NOT NULL);

-- UPDATE: Only post owner can update own posts (not approve — admin uses service key)
CREATE POLICY "member_posts_update" ON member_posts
    FOR UPDATE TO anon
    USING (member_id::text = current_setting('request.headers', true)::json->>'x-member-id')
    WITH CHECK (member_id::text = current_setting('request.headers', true)::json->>'x-member-id');

-- =============================================
-- 3. ORDERS TABLE — Restrict SELECT & UPDATE
-- =============================================
DROP POLICY IF EXISTS "Allow anon read own orders" ON orders;
DROP POLICY IF EXISTS "Allow anon update orders" ON orders;

-- SELECT: Only allow reading own orders by phone match
CREATE POLICY "Orders select own by phone" ON orders
    FOR SELECT TO anon
    USING (phone = current_setting('request.headers', true)::json->>'x-member-phone');

-- UPDATE: No anon update allowed (admin uses service_role key)
-- Remove the permissive update policy entirely
-- Admin operations should use the Supabase service_role key, not anon

-- INSERT: Keep open for order form (already exists, no change needed)
