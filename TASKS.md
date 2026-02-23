# 📋 TASKS — Đông Trùng Hạ Thảo (maldalladuyduc)

> **Cập nhật**: 2026-02-23 12:35
> **Trạng thái**: ✅ SPRINT A-B-C HOÀN THÀNH — Sẵn sàng mở BACKLOG
> **Sprint A tiến độ**: 6/6 tasks ✅
> **Sprint B tiến độ**: 5/5 tasks ✅
> **Sprint C tiến độ**: 4/4 tasks ✅
> **Backlog tính năng mới**: Xem `BACKLOG.md`

---

## ⚠️ NGUYÊN TẮC HIỆN TẠI

> **BACKLOG ĐÃ MỞ KHÓA** — Sprint A-B-C đã hoàn thành.
> Ưu tiên: Chọn items từ `BACKLOG.md` để triển khai tiếp.

---

## 📊 TÌNH TRẠNG DỰ ÁN (Audit 23/02/2026)

### Những gì đã xong ✅
- Trang chủ, CTV Dashboard, Admin Dashboard, Thành Viên, Chia Sẻ, Câu Chuyện, Bản Đồ Sức Khỏe
- Tra cứu đơn hàng, Tuyển CTV landing, Trang pháp lý (3 trang), 404
- 18 SQL migrations, RLS hardening, CSP headers, rate limiting
- Unified auth system, login modal popup, role-based menu
- Phase 6 (UX Engagement) Sprint 1→4 hoàn thành
- SEO (sitemap, schema.org, OG, robots, canonical)
- CI/CD (GitHub Actions: unit + integration + E2E + Lighthouse)
- 223 unit/integration tests + 22 E2E tests (Playwright)
- iOS-style bottom bar, FAB menu, CTV popup, CTV banner
- 105+ commits, deploy tự động qua Vercel

### Nợ kỹ thuật đã trả ✅
- ~~Migration numbering lỗi~~ ✅ Fixed (A1)
- ~~Auth inline styles~~ ✅ Tách ra `auth.css` (A6)
- ~~Monolith HTML admin~~ ✅ Tách ra 3 file (A2)
- ~~Monolith HTML ctv-dashboard~~ ✅ Tách ra 3 file (A3)
- ~~CSS monolith~~ ✅ Tách ra 7 component files (A4)
- ~~JS monolith~~ ✅ Tách ra 7 modules (A5)
- ~~Testing gần bằng 0~~ ✅ 223 unit/integration + 22 E2E tests
- ~~Admin auth SHA-256~~ ✅ Session-based auth (C1)
- ~~Không có error handling~~ ✅ apiCall + retry + offline detection (C2)

---

## 🎯 PLAN — THỨ TỰ THỰC HIỆN

### 🔴 Sprint A: Sửa lỗi cấu trúc ✅ DONE (6/6)

#### A1. Fix migration numbering ✅ DONE
- [x] Đổi tên `011_server_rate_limit.sql` → `011b_server_rate_limit.sql`
- [x] Build verify passed

#### A2. Tách `admin.html` (99KB → 11.7KB HTML) ✅ DONE
- [x] Tách CSS inline → `src/admin.css` (12.01KB)
- [x] Tách JS inline → `src/admin.js` (31.51KB)
- [x] `admin.html` chỉ còn 240 dòng HTML thuần

#### A3. Tách `ctv-dashboard.html` (101KB → 22.6KB HTML) ✅ DONE
- [x] Tách CSS inline → `src/ctv-dashboard.css` (18.94KB)
- [x] Tách JS inline → `src/ctv-dashboard.js` (22.83KB)
- [x] `ctv-dashboard.html` chỉ còn 422 dòng HTML thuần

#### A4. Tách `src/style.css` (78KB → 7 component files) ✅ DONE
- [x] 7 component CSS files, output bit-for-bit identical

#### A5. Tách `src/main.js` (39KB → 7 modules + lean init) ✅ DONE
- [x] 8 modules + `main.js` ~130 dòng init

#### A6. Dọn `src/auth.js` — tách CSS ra khỏi JS ✅ DONE
- [x] `auth.css` (5.98KB), `auth.js` giảm 49%

---

### 🟡 Sprint B: Testing ✅ DONE (5/5)

#### B1. Hoàn thiện Vitest setup ✅ DONE
- [x] `vitest.config.js` — jsdom + globals + coverage (v8)
- [x] `tests/setup.js` — mock Supabase toàn cục

#### B2. Unit tests — 7 files, 130 tests ✅ DONE
- [x] `sanitize` 15 | `ratelimit` 9 | `order-validation` 12
- [x] `auth` 27 | `ngu-hanh` 28 | `ctv` 22 | `tracker` 14

#### B3. Integration tests — 2 files, 30 tests ✅ DONE
- [x] `order-flow` 14 tests | `ctv-flow` 16 tests

#### B4. E2E tests (Playwright) — 4 files, 22 tests ✅ DONE
- [x] `homepage.spec.js` — 9 tests (load, nav, bottom bar, FAB, scroll, mobile menu)
- [x] `order.spec.js` — 4 tests (fields, qty, validate, price update)
- [x] `ctv.spec.js` — 7 tests (popup open/close, rewards, validate, Escape)
- [x] `admin.spec.js` — 2 tests (login page, wrong password)

#### B5. CI tích hợp test ✅ DONE
- [x] `.github/workflows/test.yml` — 3 parallel jobs: unit/integration + E2E + Lighthouse
- [x] `lighthouserc.json` — Performance 90+, Accessibility 85+, Best Practices 90+, SEO 90+

---

### 🟢 Sprint C: Hardening ✅ DONE (4/4)

#### C1. Admin auth nâng cao ✅ DONE
- [x] Session-based auth, sliding window 30 phút

#### C2. Error handling chung ✅ DONE
- [x] `apiCall()`, retry, exponential backoff, offline detection

#### C3. Performance audit ✅ DONE
- [x] Lazy images, WebP, Swiper lazy load, bundle -70%

#### C4. Accessibility cơ bản ✅ DONE
- [x] ARIA labels, keyboard nav, color contrast WCAG AA

---

## 📊 TỔNG KẾT

| Sprint | Tasks | Status |
| ------ | ----- | ------ |
| **A: Refactor** | 6/6 | ✅ DONE |
| **B: Testing** | 5/5 | ✅ DONE |
| **C: Hardening** | 4/4 | ✅ DONE |
| **Tổng** | **15/15** | **✅ ALL DONE** |

### Test Coverage
| Type | Tests | Files |
| ---- | ----- | ----- |
| Unit | 130 | 7 |
| Integration | 30 | 2 |
| E2E (Playwright) | 22 | 4 |
| **Tổng** | **245+** | **13** |

> ✅ Sprint A-B-C hoàn thành → `BACKLOG.md` đã mở khóa.

---

## 📝 QUY TẮC LÀM VIỆC

1. **Build verify bắt buộc** — `npx vite build` clean trước khi push
2. **Test verify** — `npm test` + `npm run test:e2e` pass trước khi push
3. **Commit format** — emoji + mô tả tiếng Việt
4. **Khi phát hiện bug** → fix ngay, đừng ghi TODO
5. **Khi có ý tưởng mới** → ghi vào `BACKLOG.md`
