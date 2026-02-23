# 📋 TASKS — Đông Trùng Hạ Thảo (maldalladuyduc)

> **Cập nhật**: 2026-02-23 09:17
> **Trạng thái**: 🔴 ĐÓNG BĂNG TÍNH NĂNG MỚI — Trả nợ kỹ thuật trước
> **Sprint A tiến độ**: 6/6 tasks hoàn thành ✅✅✅ DONE!
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
- ~~**Migration numbering lỗi** — 2 file cùng số 011~~ ✅ Fixed (A1)
- ~~**Auth inline styles** — `auth.js` 28KB chứa cả CSS trong JS~~ ✅ Tách ra `auth.css` (A6)
- ~~**Monolith HTML** — `admin.html` 99KB~~ ✅ Tách ra 3 file (A2: 11.7KB HTML)
- ~~**Monolith HTML** — `ctv-dashboard.html` 100KB~~ ✅ Tách ra 3 file (A3: 22.6KB HTML)
- ~~**CSS monolith** — `style.css` 78KB~~ ✅ Tách ra 7 component files (A4)
- ~~**JS monolith** — `main.js` 39KB~~ ✅ Tách ra 7 modules + lean init (A5)
- **Testing gần bằng 0** (chỉ 3 unit tests, 0 E2E)
- **Admin auth vẫn SHA-256** client-side (chưa nâng Supabase Auth)
- **Không có error handling** chung (Supabase down → trang trắng)

---

## 🎯 PLAN MỚI — THỨ TỰ THỰC HIỆN

### 🔴 Sprint A: Sửa lỗi cấu trúc (Blocking — làm trước tiên)

> Mục tiêu: Dọn dẹp cấu trúc project để có thể bảo trì được.
> Ai: Gravity (Frontend) + ClaudeCode (JS logic)

#### A1. Fix migration numbering ✅ DONE
- [x] Đổi tên `011_server_rate_limit.sql` → `011b_server_rate_limit.sql`
- [x] Build verify passed
- **Effort**: Nhỏ (30 phút) — xong

#### A2. Tách `admin.html` (99KB → 11.7KB HTML) ✅ DONE
- [x] Tách CSS inline → `src/admin.css` (12.01KB, 872 dòng)
- [x] Tách JS inline → `src/admin.js` (31.51KB, 1028 dòng)
- [x] `admin.html` chỉ còn 240 dòng HTML thuần
- [x] Import paths fixed, build verify passed
- **Effort**: Trung bình — xong, HTML giảm 88%

#### A3. Tách `ctv-dashboard.html` (101KB → 22.6KB HTML) ✅ DONE
- [x] Tách CSS inline → `src/ctv-dashboard.css` (18.94KB, 1370 dòng)
- [x] Tách JS inline → `src/ctv-dashboard.js` (22.83KB, 970 dòng)
- [x] `ctv-dashboard.html` chỉ còn 422 dòng HTML thuần
- [x] Import paths fixed, build verify passed
- **Effort**: Trung bình — xong, HTML giảm 78%

#### A4. Tách `src/style.css` (78KB → 7 component files) ✅ DONE
- [x] `src/css/base.css` — 449 dòng (Variables, Reset, Buttons, Animations)
- [x] `src/css/navbar.css` — 158 dòng (Header, Navigation, Mobile Menu)
- [x] `src/css/hero.css` — 194 dòng (Hero Section)
- [x] `src/css/sections.css` — 1211 dòng (Benefits, Process, Product, etc.)
- [x] `src/css/contact.css` — 512 dòng (Contact/Order, Footer, Toast)
- [x] `src/css/responsive.css` — 745 dòng (Media Queries)
- [x] `src/css/components.css` — 1003 dòng (Widgets, Floating Buttons)
- [x] `src/style.css` → import file (13 dòng), output identical hash
- **Effort**: Lớn — xong, build output bit-for-bit identical

#### A5. Tách `src/main.js` (39KB → 7 modules + lean init) ✅ DONE
- [x] `src/modules/animations.js` — 76 dòng (scroll, particles, countup)
- [x] `src/modules/render-sections.js` — 120 dòng (benefits, process, product, stories, affiliate)
- [x] `src/modules/testimonials.js` — 97 dòng (render + Swiper init)
- [x] `src/modules/order-form.js` — 275 dòng (order, payment, qty, CTV form)
- [x] `src/modules/returning-customer.js` — 33 dòng
- [x] `src/modules/reorder-reminder.js` — 33 dòng
- [x] `src/modules/floating-buttons.js` — 80 dòng
- [x] `src/modules/social-proof.js` — 155 dòng
- [x] `src/main.js` chỉ còn ~130 dòng (imports + navbar + toast + init)
- **Effort**: Trung bình — xong, build output ~identical

#### A6. Dọn `src/auth.js` — tách CSS ra khỏi JS ✅ DONE
- [x] Di chuyển toàn bộ CSS trong `injectAuthStyles()` → `src/auth.css` (5.98KB)
- [x] `auth.js` giảm từ 860 → 436 dòng, 28KB → 20KB (-49%)
- [x] `injectAuthStyles()` → no-op (CSS import qua Vite)
- [x] Build verify passed
- **Effort**: Nhỏ-Trung bình — xong

---

### 🟡 Sprint B: Testing (Quan trọng — làm sau Sprint A)

> Mục tiêu: Đảm bảo code hoạt động đúng, phát hiện regression.
> Ai: ClaudeCode chính, Gravity review

#### B1. Hoàn thiện Vitest setup ✅ DONE
- [x] `vitest.config.js` — jsdom + globals + coverage (v8)
- [x] `tests/setup.js` — mock Supabase toàn cục
- [x] `tests/mocks/supabase.js` — mock client
- [x] Cấu trúc `tests/unit/`, `tests/integration/`
- [x] npm scripts: `test:coverage`, `test:unit`, `test:integration`
- **Effort**: Nhỏ — xong

#### B2. Unit tests — 7 files, 130 tests ✅ DONE
- [x] `tests/unit/sanitize.test.js` — 15 tests (escapeHTML + escapeCSS)
- [x] `tests/unit/ratelimit.test.js` — 9 tests (rate limit + submit guard)
- [x] `tests/unit/order-validation.test.js` — 12 tests (calc + phone)
- [x] `tests/unit/auth.test.js` — 27 tests (login, logout, session, sha256, role config)
- [x] `tests/unit/ngu-hanh.test.js` — 28 tests (ngũ hành, health map, greeting)
- [x] `tests/unit/ctv.test.js` — 22 tests (ref tracking, self-referral, register, dashboard)
- [x] `tests/unit/tracker.test.js` — 14 tests (device detection, UTM, debounce)
- **Effort**: Trung bình — xong
- **Owner**: ClaudeCode

#### B3. Integration tests — 2 files, 30 tests ✅ DONE
- [x] `tests/integration/order-flow.test.js` — 14 tests (qty selector, form, submit, rate limit, payment)
- [x] `tests/integration/ctv-flow.test.js` — 16 tests (đăng ký → dashboard, ref tracking, anti-self-referral)
- **Effort**: Trung bình — xong
- **Owner**: ClaudeCode

#### B4. E2E tests (Playwright) — ⏭️ DEFERRED
- [ ] Install Playwright
- [ ] `tests/e2e/homepage.spec.js` — load, navigate, scroll, CTA
- [ ] `tests/e2e/order.spec.js` — fill form → submit → confirmation
- [ ] `tests/e2e/ctv.spec.js` — register → login → dashboard
- [ ] `tests/e2e/admin.spec.js` — login → view orders → approve
- **Effort**: Lớn (3-4 giờ)
- **Status**: Chờ Sprint C xong rồi làm

#### B5. CI tích hợp test ✅ DONE
- [x] `.github/workflows/test.yml` — npm test + coverage on push/PR
- [ ] Lighthouse CI (target: Performance 90+) — chưa làm
- **Effort**: Nhỏ — xong (phần test CI)

---

### 🟢 Sprint C: Hardening (Sau Sprint B)

> Mục tiêu: Sẵn sàng cho user thật.
> Ai: ClaudeCode + Gravity

#### C1. Admin auth nâng cao ✅ DONE
- [x] Migration 020: `admin_sessions` table + `admin_login()` → UUID session token
- [x] 14 RPCs rewrite: `p_admin_hash TEXT` → `p_session_token UUID`
- [x] `src/admin-session.js` — session management client-side
- [x] ADMIN_HASH xóa khỏi source code → hash chỉ gửi 1 lần lúc login
- [x] Sliding window: session tự gia hạn 30 phút
- **Owner**: ClaudeCode — 5 commits

#### C2. Error handling chung ✅ DONE
- [x] `src/utils/api.js` — `apiCall()`, `fireAndForget()`, `handleApiError()`
- [x] Retry logic: 3 attempts, exponential backoff (500ms → 2s)
- [x] `initNetworkStatus()` — monitor online/offline + toast
- [x] Áp dụng vào order-form.js, ctv.js, tracker.js
- [x] Unit tests: 63 tests mới cho api.js + admin-auth
- **Owner**: ClaudeCode

#### C3. Performance audit 🟡 IN PROGRESS
- [x] `loading="lazy"` tất cả images — đã có sẵn ✅
- [x] Bundle size audit → PERFORMANCE.md ✅
- [x] Supabase preconnect ✅
- [x] 6 orphan images tận dụng vào visual cards ✅
- [ ] WebP conversion cho 3 PNG (golden-powder, golden-capsules, og-share)
- [ ] Lazy load Swiper (~60KB)
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
