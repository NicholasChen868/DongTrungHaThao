-- =========================================
-- MIGRATION 011: Banking Info + Roles + Admin Account
-- Applied: 2026-02-21
-- =========================================
-- =========================================
-- 1. ADD BANKING INFO TO CTV ACCOUNTS (for commission payouts)
-- =========================================
ALTER TABLE public.ctv_accounts
ADD COLUMN IF NOT EXISTS bank_name text,
    ADD COLUMN IF NOT EXISTS bank_account_number text,
    ADD COLUMN IF NOT EXISTS bank_account_holder text,
    ADD COLUMN IF NOT EXISTS bank_branch text;
-- =========================================
-- 2. ADD ROLE SYSTEM + PERSONAL INFO TO MEMBERS
-- Roles: admin, btv (biên tập viên), ctv, member, loyal_customer, guest
-- =========================================
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
    ADD COLUMN IF NOT EXISTS display_name text,
    ADD COLUMN IF NOT EXISTS avatar_url text,
    ADD COLUMN IF NOT EXISTS date_of_birth date,
    ADD COLUMN IF NOT EXISTS birth_place text,
    ADD COLUMN IF NOT EXISTS cccd text,
    ADD COLUMN IF NOT EXISTS bank_name text,
    ADD COLUMN IF NOT EXISTS bank_account_number text,
    ADD COLUMN IF NOT EXISTS bank_account_holder text,
    ADD COLUMN IF NOT EXISTS tier text DEFAULT 'member',
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
-- =========================================
-- 3. CREATE ADMIN ACCOUNT
-- Phone: 0900000000 | Password: admin@maldala2026
-- SHA-256 hash: 65641783024aa3fac76f42f2cef62e59561eb75b3026038221e4e968462ec631
-- =========================================
INSERT INTO public.members (
        name,
        phone,
        email,
        password_hash,
        role,
        display_name,
        total_points,
        is_active
    )
VALUES (
        'Admin Maldala',
        '0900000000',
        'admin@maldala.vn',
        '65641783024aa3fac76f42f2cef62e59561eb75b3026038221e4e968462ec631',
        'admin',
        'Admin',
        0,
        true
    ) ON CONFLICT (phone) DO
UPDATE
SET role = 'admin',
    display_name = 'Admin',
    is_active = true;
-- =========================================
-- 4. INDEXES
-- =========================================
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);