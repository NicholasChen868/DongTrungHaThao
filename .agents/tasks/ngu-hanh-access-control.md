---
title: "Feature: Ngũ Hành Access Control"
priority: medium
assignee: antigravity
status: todo
created: 2026-02-21
depends_on: [unified-auth-backend, user-menu-badges-frontend]
---

# Feature: Ngũ Hành Access Control

## Context
The Ngũ Hành (Five Elements) feature on the health map page (`ban-do-suc-khoe.html`) 
currently shows for all visitors. It should only be available for:

1. **Thành Viên đã đăng ký** (registered members with account)
2. **Khách Hàng Thân Thiết** (loyal customers who have purchased)

Because these users have provided personal information needed:
- Ngày tháng năm sinh (date_of_birth)
- Nơi sinh (birth_place)
- Số CCCD (cccd)

## Implementation

### Access Check Logic
```javascript
function canAccessNguHanh(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (['member', 'loyal_customer'].includes(user.role)) {
    // Must have DOB at minimum
    return !!user.date_of_birth;
  }
  return false;
}
```

### UI Changes
1. If user NOT logged in → show teaser + "Đăng nhập để sử dụng" CTA
2. If user logged in but missing DOB → show "Cập nhật hồ sơ" prompt
3. If user has full access → show Ngũ Hành normally
4. CTV users → show "Nâng cấp thành Thành Viên" prompt

### Files
- `ban-do-suc-khoe.html` — add auth check before showing Ngũ Hành section
- `src/utils/ngu-hanh.js` — no changes needed (logic stays the same)
- `src/auth.js` — use getCurrentUser() to check access
