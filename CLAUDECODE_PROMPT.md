# 🤖 ClaudeCode Mission Briefing — Phase 6: UX & Engagement Features

> Copy prompt bên dưới vào ClaudeCode terminal

---

## PROMPT (copy từ đây):

```
Bạn đang phối hợp với Antigravity AI trên project DongTrungHaThao.

## CONTEXT HIỆN TẠI:
- Phase 5 Security Hardening: DONE (RLS, Rate Limiting, new admin password)
- Phase 6 Sprint 1: DONE (Returning customer, floating button, CTA journey)
- 23+ RPC functions online trên Supabase
- Mật khẩu admin mới: DuyDuc#2026Maldala (hash: 285a242c372134fdfbea0c4c9b6a102c4b10134f1c5f6b4ad7dc016cc4f05889)

## PHÂN CÔNG — KHÔNG CHẠM FILE CỦA NHAU:

### BẠN (ClaudeCode) xử lý:
- Logic tính Ngũ Hành / Chiêm Tinh (src/utils/ngu-hanh.js)
- CTV onboarding logic (nếu cần thêm field cho ctv_accounts)
- Bất kỳ RPC/migration mới nào (tạo file .sql, KHÔNG tự chạy)

### ANTIGRAVITY đang xử lý (KHÔNG CHẠM):
- index.html (đã thêm greeting banner, floating button, CTA journey)
- src/style.css (đã thêm CSS cho Sprint 1 features)
- src/main.js (đã thêm initReturningCustomer, initFloatingOrderBtn)
- Tất cả file HTML khác

## NHIỆM VỤ CỤ THỂ — PHASE 6 SPRINT 2 & 3:

### TASK 1: 🌟 Ngũ Hành Logic Module (ƯU TIÊN CAO NHẤT)
Tạo file src/utils/ngu-hanh.js — pure JS module tính Ngũ Hành từ ngày sinh.

Logic cần:
1. Input: năm sinh (number)
2. Tính Thiên Can (天干) từ năm sinh: năm % 10 → Can
   - 0/1: Kim (Metal)
   - 2/3: Thủy (Water)
   - 4/5: Mộc (Wood)
   - 6/7: Hỏa (Fire)
   - 8/9: Thổ (Earth)

3. Mapping Ngũ Hành → Sức khỏe:
   - Kim: Phổi, đường hô hấp. Đông Trùng tốt cho phổi, tăng sức đề kháng.
   - Thủy: Thận, hệ tiết niệu. Đông Trùng hỗ trợ chức năng thận.
   - Mộc: Gan, mắt. Đông Trùng giải độc gan, bổ mắt.
   - Hỏa: Tim, huyết áp. Đông Trùng ổn định huyết áp, tăng tuần hoàn.
   - Thổ: Dạ dày, tỳ vị. Đông Trùng tăng hấp thu dinh dưỡng.

4. Output format:
```javascript
export function analyzeNguHanh(birthYear) {
  return {
    element: 'Kim' | 'Thủy' | 'Mộc' | 'Hỏa' | 'Thổ',
    elementIcon: '🥇' | '💧' | '🌿' | '🔥' | '🏔️',
    thienCan: 'Canh' | ...,
    organTarget: 'Phổi, đường hô hấp',
    healthAdvice: 'Đông Trùng Hạ Thảo rất phù hợp vì...',
    recommendation: 'Uống 2 viên/ngày sau bữa sáng...',
    compatibleElements: ['Thổ', 'Thủy'],
    colorHex: '#C0C0C0' | '#1E90FF' | '#228B22' | '#FF4500' | '#DAA520'
  };
}
```

### TASK 2: CTV Onboarding Migration
Tạo file supabase/migrations/012_ctv_onboarding.sql:

```sql
-- Add onboarding tracking to ctv_accounts
ALTER TABLE ctv_accounts ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- RPC to update onboarding progress
CREATE OR REPLACE FUNCTION update_ctv_onboarding(
    p_phone TEXT,
    p_password_hash TEXT,
    p_step INTEGER
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE ctv_accounts 
    SET onboarding_step = p_step 
    WHERE phone = p_phone AND password_hash = p_password_hash
    RETURNING json_build_object('onboarding_step', onboarding_step) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### TASK 3: Post Like RPC
Tạo file supabase/migrations/013_post_likes.sql:

```sql
-- Simple like increment (no auth needed, but rate-limited)
CREATE OR REPLACE FUNCTION like_post(p_post_id INTEGER) 
RETURNS JSON AS $$
DECLARE
    rate_key TEXT;
    updated_likes INTEGER;
BEGIN
    rate_key := 'like:' || p_post_id::text;
    
    -- Rate limit: 5 likes per post per 5 minutes
    IF is_rate_limited(rate_key, 5, 300) THEN
        RAISE EXCEPTION 'Quá nhiều lượt thích. Vui lòng đợi.';
    END IF;
    
    PERFORM record_failed_attempt(rate_key);
    
    UPDATE member_posts SET likes = likes + 1 
    WHERE id = p_post_id AND is_approved = true
    RETURNING likes INTO updated_likes;
    
    RETURN json_build_object('likes', updated_likes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## QUY TẮC:
1. Luôn `git pull origin main` trước khi bắt đầu
2. Commit message có emoji prefix, viết chi tiết tiếng Việt
3. KHÔNG sửa: index.html, src/style.css, src/main.js (Antigravity đang quản lý)
4. TẠO file mới: src/utils/ngu-hanh.js, supabase/migrations/012_*.sql, 013_*.sql
5. Chạy `npx vite build` sau mỗi thay đổi để verify
6. Push lên main khi hoàn thành
7. KHÔNG tự chạy SQL migration — Antigravity sẽ apply lên Supabase

Bắt đầu từ TASK 1 → TASK 2 → TASK 3 theo thứ tự.
```
