---
title: "Feature: CTV Banking Info for Commission Payouts"
priority: medium
assignee: antigravity
status: in_progress
created: 2026-02-21
depends_on: [011_banking_roles_admin.sql]
---

# Feature: CTV Banking Info

## Context
CTVs need to provide bank account details for commission payouts.
Database columns already added:
- `ctv_accounts.bank_name`
- `ctv_accounts.bank_account_number`
- `ctv_accounts.bank_account_holder`
- `ctv_accounts.bank_branch`

Also added to `members` table for unified profile.

## UI Requirements

### CTV Dashboard — New "Thông Tin Thanh Toán" Tab
Add a new section in ctv-dashboard.html with:
1. **Bank Name** — dropdown with common Vietnamese banks:
   - Vietcombank, BIDV, Agribank, Techcombank, VPBank
   - MB Bank, ACB, Sacombank, TPBank, VIB
   - SHB, MSB, OCB, HDBank, SeABank
   - LienVietPostBank, Nam A Bank, Bac A Bank
2. **Số Tài Khoản** — text input with format validation
3. **Tên Chủ Tài Khoản** — auto-uppercase, Vietnamese name validation
4. **Chi Nhánh** (optional) — text input

### Validation Rules
- Account number: 8-20 digits only
- Account holder: must match CTV registered name (warn if different)
- Cannot change bank info more than 3 times per month (anti-fraud)

### Display
- Show in CTV profile settings
- Show masked account number in withdrawal requests
- Admin can see full bank details

## Backend RPC Needed (for ClaudeCode)
```sql
CREATE OR REPLACE FUNCTION update_ctv_banking(
  p_ref_code text,
  p_bank_name text,
  p_account_number text,
  p_account_holder text,
  p_branch text DEFAULT NULL
) RETURNS jsonb AS $$
BEGIN
  -- Validate and update
  -- Rate limit bank info changes
  -- Return success/error
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
