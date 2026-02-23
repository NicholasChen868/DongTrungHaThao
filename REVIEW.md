# 🏗️ PROJECT REVIEW & COORDINATION PLAN
# Đông Trùng Hạ Thảo — maldalladuyduc

> ⚠️ **ARCHIVED** — Phase 1 Security đã hoàn thành. Phase 2-4 chuyển vào `TASKS.md` (Sprint A-B-C).
> Xem `TASKS.md` cho plan hiện tại. Xem `BACKLOG.md` cho tính năng tạm treo.

> **Last updated**: 2026-02-20 12:41 (archived 2026-02-23)
> **Reviewed by**: Antigravity AI
> **For**: ClaudeCode coordination

---

## 📊 PROJECT OVERVIEW

### Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Vite + Vanilla JS + CSS |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel (auto-deploy from `main`) |
| Font | Be Vietnam Pro (Google Fonts) |
| Charts | Chart.js v4 (CDN) |
| Design | Premium Dark/Gold theme |

### Architecture Map

```
DongTrungHaThao/
├── index.html              ← Trang chủ (landing page)
├── admin.html              ← Admin Dashboard (50KB - LỚN)
├── ctv-dashboard.html      ← CTV Dashboard
├── thanh-vien.html         ← Thành Viên Thân Thiết (member login/dashboard)
├── cau-chuyen.html         ← Câu Chuyện Sản Phẩm (static)
├── chia-se.html            ← Chia Sẻ Yêu Thương (blog cộng đồng)
├── src/
│   ├── supabase.js         ← Supabase client config
│   ├── main.js             ← Main page logic (17KB)
│   ├── ctv.js              ← CTV system logic
│   ├── data.js             ← Static data helpers
│   └── style.css           ← Global styles (42KB)
├── data/
│   ├── affiliateTiers.js   ← CTV tier config
│   ├── processSteps.js     ← Manufacturing steps
│   ├── products.js         ← Product catalog
│   └── testimonials.js     ← Fallback testimonials
├── supabase/
│   ├── migration.sql       ← Original full migration
│   └── migrations/
│       ├── 003_orders_table.sql
│       └── 004_members_table.sql
├── public/
│   ├── sitemap.xml
│   └── robots.txt
└── vite.config.js          ← Build config (6 pages)
```

### Database Tables (Supabase)

| Table | Purpose | RLS | Status |
|-------|---------|-----|--------|
| `company_testimonials` | Đánh giá KH | ✅ | ✅ Production |
| `ctv_accounts` | Tài khoản CTV | ✅ | ✅ Production |
| `point_transactions` | Lịch sử điểm CTV | ✅ | ✅ Production |
| `share_clicks` | Tracking click CTV | ✅ | ✅ Production |
| `contact_submissions` | Form liên hệ | ✅ | ✅ Production |
| `orders` | Đơn hàng | ✅ | ✅ Production |
| `members` | Thành Viên Thân Thiết | ✅ | ✅ Mới tạo |
| `member_posts` | Bài viết chia sẻ | ✅ | ✅ Mới tạo |

### RPC Functions (Supabase)

| Function | Purpose |
|----------|---------|
| `register_ctv()` | Đăng ký CTV mới |
| `get_ctv_dashboard()` | Load dashboard data |
| `record_share_click()` | Ghi nhận click share |

---

## 🔴 KNOWN ISSUES & RISKS

### 🚨 CRITICAL — Bảo Mật

1. **Admin auth quá đơn giản**
   - Chỉ dùng SHA-256 hash client-side
   - Password `matkhau` hard-coded trong HTML
   - Không có session/token, reload = logout
   - ⚠️ Bất kỳ ai xem source code đều thấy hash
   - **FIX**: Migrate sang Supabase Auth + server-side validation

2. **Member auth không an toàn**
   - Password hash ở client-side (SHA-256)
   - Lưu member_id vào sessionStorage (dễ giả mạo)
   - Không có rate limiting → brute force
   - **FIX**: Supabase Auth hoặc ít nhất bcrypt + JWT

3. **Supabase Anon Key exposed**
   - Anon key visible trong source code
   - RLS phụ thuộc vào policies đúng
   - **CHECK**: Review tất cả RLS policies, đảm bảo không leak data

4. **RLS Policies quá mở**
   - `members`: Anon có thể SELECT tất cả records → leak phone + email
   - `member_posts`: Anon có thể UPDATE bất kỳ post → hijack content
   - `orders`: Cần check policy có restrict đúng không
   - **FIX**: Tighten RLS policies

### 🟡 MEDIUM — Architecture

5. **admin.html quá lớn (50KB)**
   - Toàn bộ CSS + JS + HTML trong 1 file
   - Khó bảo trì, khó test
   - **FIX**: Tách thành admin module JS riêng

6. **Không có error boundary**
   - Supabase calls không có unified error handling
   - Nếu Supabase down → trang trắng
   - **FIX**: Fallback UI + retry logic

7. **No input sanitization**
   - Form inputs không được sanitize trước khi render
   - XSS risk qua member_posts content/title
   - **FIX**: HTML entity escape trước khi insertHTML

8. **No CSRF protection**
   - Forms submit trực tiếp, không có CSRF token
   - **FIX**: CSRF token hoặc SameSite cookies

### 🟢 LOW — UX / Performance

9. **Chart.js loaded globally**
   - Chart.js CDN (~200KB) load trên admin dù chưa cần
   - **FIX**: Lazy load khi vào tab Analytics

10. **No image optimization**
    - Product images không có lazy loading attribute
    - Không có WebP fallback

11. **Linting warnings**
    - Inline styles trong nhiều file .html
    - TASKS.md markdown formatting issues
    - backdrop-filter missing -webkit- prefix

---

## ✅ COORDINATION PLAN FOR CLAUDECODE

### 🎯 Phase 1: Security Hardening (ƯU TIÊN CAO)

```
ClaudeCode Tasks:
├── 1.1 Tighten RLS Policies
│   ├── members: SELECT chỉ cho owner (bằng phone match)
│   ├── member_posts: UPDATE chỉ cho owner (bằng member_id)
│   ├── orders: SELECT chỉ cho admin hoặc matching phone
│   └── Viết SQL migration 005_tighten_rls.sql
│
├── 1.2 Input Sanitization
│   ├── Tạo src/utils/sanitize.js (HTML entity escape)
│   ├── Apply vào: member_posts content/title
│   ├── Apply vào: order form fields
│   └── Apply vào: CTV registration
│
├── 1.3 Rate Limiting (client-side)
│   ├── Debounce form submissions (5s cooldown)
│   ├── Max 3 login attempts per minute
│   └── localStorage-based tracking
│
└── 1.4 CSP Headers
    ├── Thêm Content-Security-Policy meta tags
    ├── vercel.json headers config
    └── Restrict script-src, style-src
```

### 🎯 Phase 2: Testing (MEDIUM PRIORITY)

```
ClaudeCode Tasks:
├── 2.1 Setup Testing Framework
│   ├── Install Vitest (test runner cho Vite)
│   ├── Install @testing-library/dom
│   └── Cấu hình vitest.config.js
│
├── 2.2 Unit Tests
│   ├── test/supabase-client.test.js
│   ├── test/ctv-system.test.js
│   │   ├── register_ctv()
│   │   ├── get_ctv_dashboard()
│   │   └── record_share_click()
│   ├── test/order-form.test.js
│   │   ├── Validation rules
│   │   ├── Price calculation
│   │   └── Discount logic
│   └── test/sanitize.test.js
│
├── 2.3 Integration Tests
│   ├── CTV signup → dashboard → share flow
│   ├── Member register → login → view orders
│   └── Post submit → admin approve → public display
│
├── 2.4 E2E Tests (Playwright)
│   ├── test/e2e/homepage.spec.js
│   ├── test/e2e/order-flow.spec.js
│   ├── test/e2e/ctv-flow.spec.js
│   └── test/e2e/admin-flow.spec.js
│
└── 2.5 Performance Audit
    ├── Lighthouse CI config
    ├── Target scores: Performance 90+, SEO 95+
    └── Bundle size monitoring
```

### 🎯 Phase 3: Infrastructure & Code Quality (MEDIUM)

```
ClaudeCode Tasks:
├── 3.1 Refactor admin.html
│   ├── Tách CSS → src/admin.css
│   ├── Tách JS → src/admin.js
│   ├── Import modules thay vì inline
│   └── Giảm file size từ 50KB → ~15KB HTML
│
├── 3.2 Refactor large files
│   ├── style.css (42KB) → tách theo component
│   │   ├── src/css/base.css
│   │   ├── src/css/navbar.css
│   │   ├── src/css/hero.css
│   │   ├── src/css/sections.css
│   │   └── src/css/responsive.css
│   └── main.js (17KB) → tách theo feature
│       ├── src/modules/animations.js
│       ├── src/modules/order-form.js
│       └── src/modules/testimonials.js
│
├── 3.3 Error Handling
│   ├── src/utils/api.js (wraps supabase calls)
│   ├── Retry logic (3 attempts, exponential backoff)
│   ├── Fallback UI khi offline
│   └── Global error handler
│
├── 3.4 Environment Config
│   ├── .env.example
│   ├── Supabase keys → env variables
│   ├── Vite define config cho env
│   └── README.md update
│
└── 3.5 CI/CD
    ├── .github/workflows/test.yml
    ├── Pre-push hooks (lint + test)
    └── Vercel preview deploys cho PRs
```

### 🎯 Phase 4: Feature Completion (AFTER Phase 1-3)

```
ClaudeCode Tasks:
├── 4.1 PWA Setup
│   ├── public/manifest.json
│   ├── src/sw.js (Service Worker)
│   ├── Offline cache strategy
│   └── Install prompt
│
├── 4.2 Analytics Tracking
│   ├── Page view tracking (Supabase table)
│   ├── Conversion funnel events
│   └── Simple dashboard in admin
│
├── 4.3 CTV Payment System
│   ├── Withdrawal request form
│   ├── Admin approval workflow
│   └── Payment history
│
└── 4.4 Notification System
    ├── Email notifications (Resend/SendGrid)
    ├── New order → admin email
    └── Order status change → customer email
```

---

## 📋 IMMEDIATE CLAUDECODE HANDOFF CHECKLIST

### Files ClaudeCode cần đọc trước:
1. `src/supabase.js` — Supabase client config
2. `supabase/migration.sql` — Full database schema
3. `supabase/migrations/*.sql` — Recent migrations
4. `admin.html` — Largest file, needs refactoring
5. `vite.config.js` — Build configuration
6. `TASKS.md` — Current task status

### Commands to get started:
```bash
# Clone & setup
cd /Volumes/Personal/DongTrungHaThao
npm install

# Dev server
npm run dev

# Build
npx vite build

# Current branch
git branch  # → main
```

### Supabase Dashboard:
- Project: `lfwihaamswskmospcqfo`
- URL: https://supabase.com/dashboard/project/lfwihaamswskmospcqfo

### Vercel:
- Auto-deploy from `main` branch
- Preview URL: https://dong-trung-ha-thao.vercel.app

---

## 🗓️ TIMELINE RECOMMENDATION

| Phase | Ưu tiên | Thời gian |
|-------|---------|-----------|
| Phase 1: Security | 🔴 HIGH | 1-2 sessions |
| Phase 2: Testing | 🟡 MEDIUM | 2-3 sessions |
| Phase 3: Refactor | 🟡 MEDIUM | 2-3 sessions |
| Phase 4: Features | 🟢 NORMAL | Ongoing |

> **Note**: Phase 1 (Security) nên làm TRƯỚC khi có user thật. Hiện tại RLS policies cho `members` và `member_posts` quá mở, cần fix ngay.

---

## 📝 NOTES FOR CLAUDECODE

1. **Coding style**: Vanilla JS, no framework. Dùng ES modules (import/export).
2. **Naming**: Tiếng Việt cho UI, tiếng Anh cho code variables.
3. **Build**: Luôn chạy `npx vite build` sau khi sửa code.
4. **Push**: Commit message viết chi tiết, có emoji prefix.
5. **Database**: LUÔN tạo migration file trước khi chạy SQL trên Supabase.
6. **Admin password**: Đã đổi thành `matkhau` (SHA-256 hash trong admin.html).
