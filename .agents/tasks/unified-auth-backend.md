---
title: "Backend: Unified Auth System + Admin Login RPC"
priority: high
assignee: claudecode
status: todo
created: 2026-02-21
depends_on: [011_banking_roles_admin.sql migration]
---

# Backend: Unified Auth System

## Context
Currently the site has 2 separate auth systems:
- `ctv_accounts` table with `authenticate_ctv` RPC (used by ctv-dashboard.html)
- `members` table with basic login (used by thanh-vien.html)

We need to **unify** these into a single auth flow using the `members` table, which now has a `role` column.

## DB Schema (already applied)
```sql
members table new columns:
  role text DEFAULT 'member' -- admin, btv, ctv, member, loyal_customer, guest
  display_name text
  avatar_url text
  date_of_birth date
  birth_place text
  cccd text
  bank_name text
  bank_account_number text
  bank_account_holder text
  tier text DEFAULT 'member'
  is_active boolean DEFAULT true
  last_login_at timestamptz
```

## Admin Account (already created)
- Phone: `0900000000`
- Password: `admin@maldala2026`
- SHA-256: `65641783024aa3fac76f42f2cef62e59561eb75b3026038221e4e968462ec631`

## Required RPCs

### 1. `authenticate_user(p_phone, p_password_hash)` 
- Replaces both `authenticate_ctv` and member login
- Returns: `{ ok, user_id, name, display_name, role, tier, referral_code (if CTV), avatar_url }`
- Updates `last_login_at` on success
- Admin role bypasses all restrictions
- Rate limit check (keep existing `login_attempts` table)

### 2. `get_user_profile(p_user_id)`
- Returns full profile info for the logged-in user
- Includes: role, tier, banking info (masked), points, personal info
- Admin can query any user_id

### 3. `update_user_profile(p_user_id, p_fields_json)`
- Allows users to update their own profile
- Fields: display_name, avatar_url, date_of_birth, birth_place, cccd, bank_*
- Admin can update any user

### 4. `admin_list_users(p_admin_id, p_role_filter, p_page, p_limit)`
- Admin only — list all users with role filtering
- Returns paginated results

## Important Notes
- Keep backward compatibility with `authenticate_ctv` RPC (CTV dashboard still uses it)
- Admin account should be able to access ALL pages (CTV dashboard, member pages, etc.)
- The `role` hierarchy: admin > btv > ctv > loyal_customer > member > guest
