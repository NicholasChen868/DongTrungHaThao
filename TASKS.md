# 📋 TASKS — Đông Trùng Hạ Thảo (maldalladuyduc)

> **Cập nhật**: 2026-02-23 23:21
> **Trạng thái**: ✅ SPRINT A-D HOÀN THÀNH — Chỉ còn 2 Shadow tasks chờ data
> **Sprint A tiến độ**: 6/6 tasks ✅
> **Sprint B tiến độ**: 5/5 tasks ✅
> **Sprint C tiến độ**: 4/4 tasks ✅
> **Sprint D tiến độ**: 11/12 tasks ✅ (D7 cần data, D9 cần test)
> **Backlog tính năng mới**: Xem `BACKLOG.md`

---

## ⚠️ NGUYÊN TẮC HIỆN TẠI

> **SPRINT D HOÀN THÀNH** — Chỉ còn D7 (A/B test — cần 2 tuần data) và D9 (Content Bible test).
> Build ✅ + 223 tests ✅ tại mỗi commit.
> Main branch sạch — chỉ 1 branch `main`, 0 worktrees thừa.

---

## 📊 TÌNH TRẠNG DỰ ÁN (23/02/2026 23:21)

### Những gì đã xong ✅

- Trang chủ, CTV Dashboard, Admin Dashboard, Thành Viên, Chia Sẻ, Câu Chuyện, Bản Đồ Sức Khỏe
- Tra cứu đơn hàng, Tuyển CTV landing, Trang pháp lý (3 trang), 404
- 25 SQL migrations, RLS hardening, CSP headers, rate limiting
- Unified auth system, login modal popup, role-based menu
- Phase 6 (UX Engagement) Sprint 1→4 hoàn thành
- SEO (sitemap, schema.org, OG, robots, canonical)
- CI/CD (GitHub Actions: unit + integration + E2E + Lighthouse)
- 223 unit/integration tests + 22 E2E tests (Playwright)
- **Unified FAB widget** với 6 nút orbit + ring pulse + tooltip xoay
- **Promotion popup** — Multi-promo carousel + auto-schedule + expiry
- **Quick Login popup** (CTV / Khách hàng — contextual)
- **Event Tracking** — page views, CTA clicks, scroll depth → Supabase
- **Vercel Analytics** — bounce rate, device, traffic sources
- **Sticky CTA Mobile** — fixed bottom bar trên mobile
- **Admin Analytics Dashboard** — event stats UI + charts
- **P1 Features** — social proof, reorder discount, nurturing toast, promo expiry
- **V3 Content Rewrite** — soften messaging, experience-based language
- 120+ commits, deploy tự động qua Vercel

---

## 🔵 Sprint D: FAB & Feature Polish (Session 23/02/2026)

### D1. FAB Widget — Sắp xếp & Polish ✅ DONE

- [x] Reorder 6 nút bottom→top: Order, Call, CTV, Zalo, LiveChat, Promotion
- [x] Zalo icon → inline SVG canh giữa hoàn hảo (nền #0068FF)
- [x] Messenger → LiveChat (teal gradient)
- [x] FAB main icon ⭐→ dấu **+** rõ ràng, xoay 360° chậm (8s/vòng)
- [x] Ring pulse sonar tỏa ra liên tục
- [x] 6th child stagger animation

### D2. Promotion Popup ✅ DONE

- [x] Nút Promo (rose gradient, tag icon) trong FAB orbit
- [x] Multi-promo carousel (‹ prev / dots / next ›)
- [x] Auto-schedule + auto-activate via pg_cron
- [x] Expiry logic: ẩn FAB promo khi hết hạn + DB trống

### D3. Quick Login Popup ✅ DONE

- [x] HTML + CSS + JS module (`login-popup.js`)
- [x] Tab CTV / Khách Hàng (iOS segment control)
- [x] SĐT + mật khẩu → login via Supabase RPC
- [x] Reusable API: `openLoginPopup({ role, subtitle, onSuccess })`
- [x] Rate limited 5 lần/phút

### D4. Popup Polish ✅ DONE

- [x] Staggered entrance animation cho TẤT CẢ popup
- [x] Promo badge pop: scale(0)→scale(1) + xoay nhẹ
- [x] Hero images generated: CTV + Promo

### D5. CI Fix ✅ DONE

- [x] Lighthouse CI `v12` → `v11`
- [x] E2E tests aligned với FAB widget IDs mới
- [x] Exclude `.claude/**` worktrees từ Vitest

### D6. Login Integration ✅ DONE

- [x] Auth interceptor `data-auth` → auto `openLoginPopup()`
- [x] CTV Dashboard có login flow riêng đầy đủ
- [x] Nav account card: avatar, name, role badge, dropdown

### D7. � A/B Test CTA — Giọng Tây vs Giọng Việt ⏳ CHỜ DATA

**Shadow**: CTA kiểu empowerment có thể quá "Tây" cho segment 40-60 tuổi.

**Tasks**:

- [ ] Chuẩn bị 2 bộ CTA: Bản A (empowerment) vs Bản B (bình dân-thực tế)
- [ ] Tạo JS module A/B test + Supabase event tracking (infrastructure ĐÃ CÓ)
- [ ] Chạy A/B test tối thiểu 2 tuần
- [ ] Quyết định dựa trên data

**Prerequisite**: D11 ✅ (event tracking đã setup) — có thể bắt đầu bất cứ lúc nào.

---

### ~~D8. Soften "Trí Lực" Messaging~~ ✅ DONE (V3 Content Rewrite)

- [x] Review overclaim risk → Đã soften toàn bộ trong V3
- [x] Soften thành experience-based language
- [x] Thêm inline disclaimer (section About)

### D9. 🟡 Test Content Bible — Real Output ⏳ CẦN TEST

- [ ] Cho Claude Code đọc `.prompts/content-writing-prompt.md` → viết promotion
- [ ] Review output: giọng văn, CTA style, brand consistency
- [ ] Nếu fail → iterate prompt (tách file, rút gọn)

**Ưu tiên**: 🟡 — quan trọng cho handoff nhưng không urgent

---

### ~~D10. Sticky CTA Mobile~~ ✅ DONE

- [x] Fixed bottom bar "48.000₫/ngày — Đặt Thử Ngay"
- [x] IntersectionObserver: hiện sau hero, ẩn tại #contact
- [x] Safe area cho notched phones
- [x] Auto pushes FAB lên trên khi visible

### ~~D11. Thu Thập Data~~ ✅ DONE

- [x] Event tracking: `event_logs` table + `log_event()` RPC
- [x] Auto-track: page views, CTA clicks, scroll depth (25/50/75/100%)
- [x] `get_event_stats()` RPC cho admin
- [x] Admin Dashboard UI: 4 metric cards + top CTA clicks table
- [x] Vercel Analytics (@vercel/analytics) bật 1 dòng

### D12. UI Polish — 6 Issues ✅ DONE

- [x] D12a. Promo popup scrollable + compact card layout
- [x] D12b. Border-radius thống nhất (CSS vars)
- [x] D12c. Quote/testimonials lighter cards + white quote marks
- [x] D12d. CTV badge beige/gold + mini dashboard 3-column
- [x] D12e. Login popup "Đăng ký" điều hướng đúng role
- [x] D12f. Desktop scroll lock fix (popups display:none mặc định)


### D13. UI/UX Audit Polish ✅ DONE

- [x] Nav account pill: `→` arrow → proper user SVG icon (feather icons)
- [x] Login popup icon: `→` → 🔐 emoji
- [x] Role badge: `display:none` moved from inline HTML to CSS
- [x] CSS vendor prefix: `-webkit-backdrop-filter` before `backdrop-filter`
- [x] Full browser audit: desktop (1440px) + mobile (375px)

---

## ✨ P1 Features (từ Claude Code branch, re-implemented) ✅ DONE

- [x] Form social proof: "X người đã đặt hàng hôm nay" (real từ DB)
- [x] Reorder discount: +3% khách quen (cộng dồn, cap 20%)
- [x] Nurturing toast: nhắc cách uống sau khi đặt hàng
- [x] Promo expiry: ẩn FAB khi promo hết hạn + DB trống

---

## 📊 TỔNG KẾT

| Sprint | Tasks | Status |
| ------ | ----- | ------ |
| **A: Refactor** | 6/6 | ✅ DONE |
| **B: Testing** | 5/5 | ✅ DONE |
| **C: Hardening** | 4/4 | ✅ DONE |
| **D1-D6: FAB & Features** | 6/6 | ✅ DONE |
| **D7: A/B Test** | 0/1 | ⏳ Chờ data |
| **D8: Soften Messaging** | 1/1 | ✅ DONE |
| **D9: Content Bible** | 0/1 | ⏳ Cần test |
| **D10-D12: Mobile + Analytics + Polish** | 3/3 | ✅ DONE |
| **D13: UI/UX Audit** | 1/1 | ✅ DONE |
| **P1: Claude Code Features** | 4/4 | ✅ DONE |
| **Tổng** | **30/32** | **94%** |

### Test Coverage

| Type | Tests | Files |
| ---- | ----- | ----- |
| Unit | 130 | 7 |
| Integration | 93 | 4 |
| E2E (Playwright) | 22 | 4 |
| **Tổng** | **245+** | **15** |

---

## 📝 QUY TẮC LÀM VIỆC

1. **Build verify bắt buộc** — `npx vite build` clean trước khi push
2. **Test verify** — `npm test` pass trước khi push
3. **Commit format** — emoji + mô tả tiếng Việt
4. **Khi phát hiện bug** → fix ngay, đừng ghi TODO
5. **Khi có ý tưởng mới** → ghi vào `BACKLOG.md`
6. **Main branch only** — không tạo feature branch trừ khi cần PR review

---

*Cập nhật bởi Antigravity AI — 23/02/2026 23:58*
*Sprint D 94% — D7 (A/B module ready) + D9 (Content Bible) còn lại*
