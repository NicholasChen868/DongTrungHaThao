# 📋 TASKS — Đông Trùng Hạ Thảo (maldalladuyduc)

> **Cập nhật**: 2026-02-23
> **Trạng thái**: 🔴 ĐÓNG BĂNG TÍNH NĂNG MỚI — Trả nợ kỹ thuật trước
> **Backlog tính năng mới**: Xem `BACKLOG.md`

---

## ⚠️ NGUYÊN TẮC HIỆN TẠI

> **KHÔNG thêm tính năng mới** cho đến khi trả xong nợ kỹ thuật bên dưới.
> Mọi ý tưởng feature mới → ghi vào `BACKLOG.md`, xử lý sau.
> Ưu tiên: Refactor → Test → Harden → rồi mới Feature.

---

## 📊 TÌNH TRẠNG DỰ ÁN (Audit 23/02/2026)

### Những gì đã xong ✅
- Trang chủ, CTV Dashboard, Admin Dashboard, Thành Viên, Chia Sẻ, Câu Chuyện, Bản Đồ Sức Khỏe
- Tra cứu đơn hàng, Tuyển CTV landing, Trang pháp lý (3 trang), 404
- 18 SQL migrations, RLS hardening, CSP headers, rate limiting
- Unified auth system, login modal popup, role-based menu
- Phase 6 (UX Engagement) Sprint 1→4 hoàn thành
- SEO (sitemap, schema.org, OG, robots, canonical)
- CI/CD cơ bản (GitHub Actions build + security scan)
- 102 commits, deploy tự động qua Vercel

### Những gì đang nợ 🔴
- **File sizes phình 2x** so với plan (chưa refactor gì)
- **Testing gần bằng 0** (chỉ 3 unit tests, 0 E2E)
- **Monolith HTML** — `ctv-dashboard.html` 100KB, `admin.html` 99KB
- **CSS monolith** — `style.css` 78KB (plan ghi 42KB)
- **JS monolith** — `main.js` 39KB (plan ghi 17KB)
- **Auth inline styles** — `auth.js` 28KB chứa cả CSS trong JS
- **Migration numbering lỗi** — 2 file cùng số 011
- **Admin auth vẫn SHA-256** client-side (chưa nâng Supabase Auth)
- **Không có error handling** chung (Supabase down → trang trắng)

---

## 🎯 PLAN MỚI — THỨ TỰ THỰC HIỆN

### 🔴 Sprint A: Sửa lỗi cấu trúc (Blocking — làm trước tiên)

> Mục tiêu: Dọn dẹp cấu trúc project để có thể bảo trì được.
> Ai: Gravity (Frontend) + ClaudeCode (JS logic)

#### A1. Fix migration numbering
- [ ] Đổi tên `011_server_rate_limit.sql` → `011a_server_rate_limit.sql` hoặc renumber
- [ ] Kiểm tra tất cả 18 migrations chạy đúng thứ tự trên Supabase
- **Effort**: Nhỏ (30 phút)

#### A2. Tách `admin.html` (99KB → ~15KB HTML)
- [ ] Tách CSS inline → `src/admin.css`
- [ ] Tách JS inline → `src/admin.js`
- [ ] `admin.html` chỉ còn HTML structure + script/link imports
- [ ] Verify build: `npx vite build`
- **Effort**: Trung bình (2-3 giờ)
- **Owner**: ClaudeCode (JS tách) + Gravity (CSS tách + QC)

#### A3. Tách `ctv-dashboard.html` (100KB → ~15KB HTML)
- [ ] Tách CSS inline → `src/ctv-dashboard.css`
- [ ] Tách JS inline → `src/ctv-dashboard.js`
- [ ] `ctv-dashboard.html` chỉ còn HTML structure + imports
- [ ] Verify build: `npx vite build`
- **Effort**: Trung bình (2-3 giờ)
- **Owner**: ClaudeCode (JS tách) + Gravity (CSS tách + QC)

#### A4. Tách `src/style.css` (78KB → ~40KB tổng qua components)
- [ ] `src/css/base.css` — reset, variables, typography, utilities
- [ ] `src/css/navbar.css` — header, nav, mobile menu
- [ ] `src/css/hero.css` — hero section
- [ ] `src/css/sections.css` — benefits, process, product, testimonials, stories, contact
- [ ] `src/css/components.css` — cards, buttons, badges, forms, modals
- [ ] `src/css/responsive.css` — media queries tập trung
- [ ] `src/css/pages/` — CSS riêng từng trang phụ (chia-se, cau-chuyen, etc.)
- [ ] `src/style.css` → import file gom lại, hoặc Vite xử lý
- [ ] Xóa CSS trùng lặp / không dùng (ước tính giảm ~30-40%)
- **Effort**: Lớn (3-4 giờ)
- **Owner**: Gravity

#### A5. Tách `src/main.js` (39KB → modules)
- [ ] `src/modules/animations.js` — scroll animations, observers
- [ ] `src/modules/order-form.js` — form logic, validation, submit
- [ ] `src/modules/testimonials.js` — load/render testimonials
- [ ] `src/modules/returning-customer.js` — nhớ khách cũ, greeting banner
- [ ] `src/modules/reorder-reminder.js` — gợi ý mua lại
- [ ] `src/modules/floating-buttons.js` — floating CTA, contact widget
- [ ] `src/main.js` chỉ còn imports + init calls
- **Effort**: Trung bình (2-3 giờ)
- **Owner**: ClaudeCode

#### A6. Dọn `src/auth.js` — tách CSS ra khỏi JS
- [ ] Di chuyển toàn bộ CSS trong `injectAuthStyles()` → `src/css/auth.css`
- [ ] `auth.js` chỉ giữ logic JS, import CSS qua Vite
- [ ] Giảm auth.js từ 28KB → ~10KB
- **Effort**: Nhỏ-Trung bình (1-2 giờ)
- **Owner**: Gravity

---

### 🟡 Sprint B: Testing (Quan trọng — làm sau Sprint A)

> Mục tiêu: Đảm bảo code hoạt động đúng, phát hiện regression.
> Ai: ClaudeCode chính, Gravity review

#### B1. Hoàn thiện Vitest setup
- [ ] Cấu trúc thư mục test: `tests/unit/`, `tests/integration/`
- [ ] Mock Supabase client cho unit tests
- [ ] npm scripts: `test`, `test:watch`, `test:coverage`
- **Effort**: Nhỏ (1 giờ)

#### B2. Unit tests — Mở rộng từ 3 → 15+ tests
- [ ] `tests/unit/sanitize.test.js` ← ✅ đã có
- [ ] `tests/unit/ratelimit.test.js` ← ✅ đã có
- [ ] `tests/unit/order-validation.test.js` ← ✅ đã có
- [ ] `tests/unit/auth.test.js` — login, logout, session, role config
- [ ] `tests/unit/ngu-hanh.test.js` — tính ngũ hành đúng
- [ ] `tests/unit/ctv.test.js` — ref tracking, tier logic, anti-self-referral
- [ ] `tests/unit/tracker.test.js` — page view tracking
- **Effort**: Trung bình (2-3 giờ)
- **Owner**: ClaudeCode

#### B3. Integration tests
- [ ] `tests/integration/ctv-flow.test.js` — đăng ký → login → dashboard
- [ ] `tests/integration/order-flow.test.js` — đặt hàng → xác nhận
- [ ] `tests/integration/member-flow.test.js` — đăng ký → login → profile
- **Effort**: Trung bình (2-3 giờ)
- **Owner**: ClaudeCode

#### B4. E2E tests (Playwright) — Happy path
- [ ] Install Playwright
- [ ] `tests/e2e/homepage.spec.js` — load, navigate, scroll, CTA
- [ ] `tests/e2e/order.spec.js` — fill form → submit → confirmation
- [ ] `tests/e2e/ctv.spec.js` — register → login → dashboard
- [ ] `tests/e2e/admin.spec.js` — login → view orders → approve
- **Effort**: Lớn (3-4 giờ)
- **Owner**: ClaudeCode

#### B5. CI tích hợp test
- [ ] GitHub Actions: chạy `npm test` trước merge
- [ ] Lighthouse CI (target: Performance 90+, Accessibility 90+, SEO 95+)
- **Effort**: Nhỏ (1 giờ)

---

### 🟢 Sprint C: Hardening (Sau Sprint B)

> Mục tiêu: Sẵn sàng cho user thật.
> Ai: ClaudeCode + Gravity

#### C1. Admin auth nâng cao
- [ ] Migrate admin login từ SHA-256 client-side → Supabase Auth (hoặc server-side RPC)
- [ ] Session token thay vì chỉ check hash
- [ ] Không lộ password hash trong source code
- **Effort**: Trung bình (2 giờ)
- **Owner**: ClaudeCode (logic) + Gravity (UI)

#### C2. Error handling chung
- [ ] `src/utils/api.js` — wrapper cho Supabase calls
- [ ] Retry logic (3 attempts, exponential backoff)
- [ ] Fallback UI khi Supabase/network down
- [ ] Global error handler + toast notification
- **Effort**: Trung bình (2 giờ)
- **Owner**: ClaudeCode

#### C3. Performance audit
- [ ] Lazy load Chart.js trên admin (hiện load ~200KB global)
- [ ] Lazy load images (`loading="lazy"`)
- [ ] WebP fallback cho ảnh lớn
- [ ] Bundle size check sau refactor
- **Effort**: Nhỏ (1-2 giờ)
- **Owner**: Gravity

#### C4. Accessibility cơ bản
- [ ] Alt text cho tất cả ảnh
- [ ] Keyboard navigation cho modals, dropdowns
- [ ] ARIA labels cho interactive elements
- [ ] Color contrast check (gold on dark bg)
- **Effort**: Nhỏ-Trung bình (1-2 giờ)
- **Owner**: Gravity

---

## 📊 TỔNG KẾT EFFORT

| Sprint | Số tasks | Effort ước tính | Ưu tiên |
|--------|----------|----------------|---------|
| **A: Refactor** | 6 tasks | ~12-16 giờ | 🔴 Làm ngay |
| **B: Testing** | 5 tasks | ~10-12 giờ | 🟡 Sau Sprint A |
| **C: Hardening** | 4 tasks | ~6-8 giờ | 🟢 Sau Sprint B |
| **Tổng** | **15 tasks** | **~28-36 giờ** | |

> Sau khi Sprint A-B-C xong → mở khóa `BACKLOG.md` để tiếp tục phát triển tính năng.

---

## 📝 QUY TẮC LÀM VIỆC

1. **Mỗi Sprint tách branch riêng** — merge vào `main` khi xong + pass tests
2. **Mỗi task A1-A6 commit riêng** — dễ rollback nếu có lỗi
3. **Build verify bắt buộc** — `npx vite build` clean trước khi push
4. **Không sáng tạo thêm feature** trong quá trình refactor
5. **Khi phát hiện bug** → fix ngay, đừng ghi TODO
6. **Khi có ý tưởng mới** → ghi vào `BACKLOG.md`, không làm luôn
