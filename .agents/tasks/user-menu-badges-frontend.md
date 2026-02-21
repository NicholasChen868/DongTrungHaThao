---
title: "Frontend: User Menu Banner with Role Badges"
priority: high
assignee: antigravity
status: in_progress
created: 2026-02-21
depends_on: [unified-auth-backend]
---

# Frontend: User Menu Banner with Role Badges

## Context
After login, display in the navigation bar:
1. User's display name
2. Role badge with appropriate styling per tier
3. Dropdown menu with relevant options

## Role Badges Design

| Role | Badge Text | Color | Icon |
|------|-----------|-------|------|
| Admin | ADMIN | red-gold gradient | 👑 |
| BTV (Biên Tập Viên) | BTV | purple gradient | 📝 |
| CTV (Cộng Tác Viên) | CTV | green gradient | 💰 |
| Khách Hàng Thân Thiết | KHTT | gold gradient | ⭐ |
| Thành Viên | TV | silver | 🎖️ |
| Khách | — | muted | — |

## Menu Items per Role

### Admin
- Dashboard Tổng Quan
- Quản Lý Người Dùng
- Quản Lý Đơn Hàng
- Cài Đặt Hệ Thống
- Tất Cả Trang (CTV, Thành Viên, etc.)
- Đăng Xuất

### BTV
- Dashboard BTV
- Quản Lý Bài Viết
- Duyệt Chia Sẻ
- Hồ Sơ Cá Nhân
- Đăng Xuất

### CTV
- Dashboard CTV
- Chia Sẻ Link
- Điểm Thưởng
- Rút Tiền
- Hồ Sơ Cá Nhân
- Đăng Xuất

### Thành Viên / KHTT
- Bản Đồ Sức Khỏe (Ngũ Hành) — KHTT only
- Điểm Thưởng
- Lịch Sử Đơn Hàng
- Hồ Sơ Cá Nhân
- Đăng Xuất

## Implementation

### State Management
```javascript
// sessionStorage for current session
const SESSION_KEY = 'maldala_user';

function getCurrentUser() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('ctv_ref_code');
  window.location.href = '/';
}
```

### Banner Component
- Inject into existing nav bars on all pages
- If user logged in → show name + badge + dropdown
- If not logged in → show "Đăng Nhập" link
- Responsive: on mobile, badge icon only

### Pages Affected
- index.html (main nav)
- cau-chuyen.html (story nav)
- chia-se.html (sharing nav)
- tuyen-ctv.html (CTV nav)
- ctv-dashboard.html (keeps existing dashboard)
- thanh-vien.html (member page)
- ban-do-suc-khoe.html (health map)

## Files to Create/Modify
- `src/auth.js` — auth state management, login/logout, banner rendering
- `src/style.css` — badge styles, dropdown menu styles
- All HTML pages — add auth banner script import
