# 📋 TASKS — Đông Trùng Hạ Thảo (maldalladuyduc)

> **Cập nhật**: 2026-02-28 00:30
> **Trạng thái**: 🔴 SPRINT E IN PROGRESS — Business Model Split
> **Sprint A-D**: ✅ HOÀN THÀNH (31/33)
> **Sprint E**: 🔵 Frontend ✅ — Backend cần ClaudeCode
> **Backlog tính năng mới**: Xem `BACKLOG.md`

---

## ⚠️ NGUYÊN TẮC HIỆN TẠI

> **BUSINESS MODEL SPLIT** — Website đang chuyển từ bán lẻ → Nhà sản xuất/Phân phối.
> Frontend đã xong (Antigravity). Backend tasks dưới đây dành cho **ClaudeCode**.
> Build ✅ tại commit hiện tại.

---

## 🔴 Sprint E: Business Model Split (28/02/2026)

> **Context**: Giấy phép kinh doanh là nhà phân phối/sản xuất, không bán lẻ.
> Website chính giờ là "Founder/Manufacturer" — kêu gọi hợp tác, mở rộng đại lý.
> Website đại lý riêng sẽ làm sau (Phase 3).

### E1. Frontend — Website Founder ✅ DONE (Antigravity)

- [x] Homepage: hero, nav, CTA → B2B messaging
- [x] Removed: order form, qty selector, payment, promo popup, CTV popup
- [x] Added: partnership contact form (`#partnership`)
- [x] Added: B2B CTA journey ("Vì sao chọn Maldalla?")
- [x] Affiliate → Dealer Network section
- [x] FAB widget: 6 → 3 buttons (Call, Zalo, LiveChat)
- [x] `tuyen-ctv.html` → `tuyen-dai-ly.html` (renamed + rebranded)
- [x] `vite.config.js`: removed `tra-cuu`, `thanh-vien`; renamed entry
- [x] `vercel.json`: 6 redirects (301)
- [x] `main.js`: removed retail modules, added `initPartnershipForm()`
- [x] Build passed ✅

### E2. 🔵 Database — Apply Migration (ClaudeCode)

**File**: `supabase/migrations/20260228_create_partnership_inquiries.sql`

- [ ] Apply migration lên Supabase production
  ```bash
  # Chạy SQL trong file migration lên Supabase SQL Editor hoặc:
  curl -X POST 'https://lfwihaamswskmospcqfo.supabase.co/rest/v1/rpc/exec_sql' \
    -H 'apikey: <SERVICE_ROLE_KEY>' \
    -H 'Authorization: Bearer <SERVICE_ROLE_KEY>' \
    -H 'Content-Type: application/json' \
    -d '{"query": "<SQL from migration file>"}'
  ```
- [ ] Verify table `partnership_inquiries` tồn tại
- [ ] Verify RLS policies hoạt động (anon insert, admin read)

### E3. 🔵 Admin Panel — Partnership Inquiries (ClaudeCode)

**Mục tiêu**: Admin có thể xem và quản lý yêu cầu hợp tác từ website.

- [ ] Thêm tab/section "Yêu Cầu Hợp Tác" vào `admin.html` + `admin.js`
- [ ] Hiển thị danh sách inquiries: tên, SĐT, loại hình, ngày gửi, status
- [ ] Filter theo status: `pending` / `contacted` / `approved` / `rejected`
- [ ] Update status (dropdown → save qua Supabase)
- [ ] Stats card: "X yêu cầu mới hôm nay"

**DB**: Table `partnership_inquiries` đã có (E2).
**RLS**: Admin-only SELECT đã setup trong migration.
**RPC cần tạo**:
- `get_partnership_inquiries(status_filter, page, limit)` → paginated list
- `update_partnership_status(inquiry_id, new_status)` → update status

### E4. 🟡 Notification — Yêu Cầu Mới (ClaudeCode, optional)

- [ ] Gửi email/Zalo notification khi có partnership inquiry mới
- [ ] Options: Supabase Edge Function trigger on INSERT, hoặc pg_notify + webhook
- [ ] Admin nhận notification real-time (hoặc daily digest)

**Ưu tiên**: 🟡 — nice to have, không blocking

### E5. 🟡 E2E Tests Update (ClaudeCode)

- [ ] Update `homepage.spec.js` — order form tests → partnership form tests
- [ ] Update navigation tests (removed pages: tra-cuu, thanh-vien)
- [ ] Add redirect tests (tuyen-ctv → tuyen-dai-ly)
- [ ] Remove/update CTV popup tests

---

## 📊 TÌNH TRẠNG DỰ ÁN (28/02/2026)

### Những gì đã xong ✅

- Trang chủ, CTV Dashboard, Admin Dashboard, Chia Sẻ, Câu Chuyện, Bản Đồ Sức Khỏe
- **Business Model Split**: Website chuyển sang Founder/Manufacturer focus
- **Tuyển Đại Lý** landing page (rebranded từ CTV)
- **Partnership contact form** + Supabase table
- Trang pháp lý (3 trang), 404
- 26 SQL migrations, RLS hardening, CSP headers, rate limiting
- Unified auth system, login modal popup, role-based menu
- Phase 6 (UX Engagement) Sprint 1→4 hoàn thành
- SEO (sitemap, schema.org, OG, robots, canonical)
- CI/CD (GitHub Actions: unit + integration + E2E + Lighthouse)
- 223 unit/integration tests + 22 E2E tests (Playwright)
- **FAB widget** 3 nút (Call, Zalo, LiveChat) + ring pulse + tooltip xoay
- **Quick Login popup** (Đại lý — contextual)
- **Event Tracking** — page views, CTA clicks, scroll depth → Supabase
- **Vercel Analytics** — bounce rate, device, traffic sources
- **Admin Analytics Dashboard** — event stats UI + charts
- **V3 Content Rewrite** — soften messaging, experience-based language
- 120+ commits, deploy tự động qua Vercel

### Đã xóa / chuyển đi 🗑️

- `tra-cuu.html` — Tra cứu đơn hàng (sẽ ở website dealer)
- `thanh-vien.html` — Thành viên thân thiết (sẽ ở website dealer)
- Order form / payment / qty selector (sẽ ở website dealer)
- CTV popup, Promo popup, Payment QR modal
- Social proof, returning customer, reorder reminder, exit intent, AB test modules

---

## 🔵 Sprint D: FAB & Feature Polish ✅ DONE

*(collapsed — xem git history cho chi tiết)*

- [x] D1-D6: FAB, Promo Popup, Login, Polish, CI, Integration
- [x] D8: Soften Messaging (V3)
- [x] D10-D14: Sticky CTA, Analytics, UI Polish, PWA
- [ ] D7: A/B Test ⏳ (chờ data)
- [ ] D9: Content Bible ⏳ (cần test)

---

## ✨ P1 Features ✅ DONE

- [x] Form social proof, reorder discount, nurturing toast, promo expiry

---

## 📊 TỔNG KẾT

| Sprint | Tasks | Status |
| ------ | ----- | ------ |
| **A-C: Refactor/Test/Harden** | 15/15 | ✅ DONE |
| **D: FAB & Features** | 11/13 | ✅ 85% |
| **P1: Claude Code Features** | 4/4 | ✅ DONE |
| **E1: Frontend Split** | 1/1 | ✅ DONE |
| **E2: DB Migration** | 0/1 | 🔵 ClaudeCode |
| **E3: Admin Panel** | 0/1 | 🔵 ClaudeCode |
| **E4: Notifications** | 0/1 | 🟡 Optional |
| **E5: E2E Tests** | 0/1 | 🟡 ClaudeCode |

---

## 📝 QUY TẮC LÀM VIỆC

1. **Build verify bắt buộc** — `npm run build` clean trước khi push
2. **Test verify** — `npm test` pass trước khi push
3. **Commit format** — emoji + mô tả tiếng Việt
4. **Khi phát hiện bug** → fix ngay, đừng ghi TODO
5. **Khi có ý tưởng mới** → ghi vào `BACKLOG.md`
6. **Main branch only** — không tạo feature branch trừ khi cần PR review
7. **Phân công**: Antigravity = Frontend + DB. ClaudeCode = Backend logic.

---

*Cập nhật bởi Antigravity AI — 28/02/2026 00:30*
*Sprint E: Frontend ✅ — Backend tasks chờ ClaudeCode*
