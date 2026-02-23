# 📋 TASKS — Đông Trùng Hạ Thảo (maldalladuyduc)

> **Cập nhật**: 2026-02-23 13:25
> **Trạng thái**: ✅ SPRINT A-B-C HOÀN THÀNH + Sprint D đang triển khai
> **Sprint A tiến độ**: 6/6 tasks ✅
> **Sprint B tiến độ**: 5/5 tasks ✅
> **Sprint C tiến độ**: 4/4 tasks ✅
> **Sprint D tiến độ**: 5/6 tasks (83%)
> **Backlog tính năng mới**: Xem `BACKLOG.md`

---

## ⚠️ NGUYÊN TẮC HIỆN TẠI

> **SPRINT D ĐANG TRIỂN KHAI** — FAB Widget Polish + Feature mới
> Build ✅ + 223 tests ✅ tại mỗi commit.

---

## 📊 TÌNH TRẠNG DỰ ÁN (Audit 23/02/2026 13:25)

### Những gì đã xong ✅
- Trang chủ, CTV Dashboard, Admin Dashboard, Thành Viên, Chia Sẻ, Câu Chuyện, Bản Đồ Sức Khỏe
- Tra cứu đơn hàng, Tuyển CTV landing, Trang pháp lý (3 trang), 404
- 18 SQL migrations, RLS hardening, CSP headers, rate limiting
- Unified auth system, login modal popup, role-based menu
- Phase 6 (UX Engagement) Sprint 1→4 hoàn thành
- SEO (sitemap, schema.org, OG, robots, canonical)
- CI/CD (GitHub Actions: unit + integration + E2E + Lighthouse)
- 223 unit/integration tests + 22 E2E tests (Playwright)
- **Unified FAB widget** với 6 nút orbit + ring pulse + tooltip xoay
- **Promotion popup** (Bứt Phá Đinh Ngọ 2026 — content tâm lý)
- **Quick Login popup** (CTV / Khách hàng — contextual)
- 110+ commits, deploy tự động qua Vercel

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
- [x] Popup content: "Bứt Phá Đầu Năm Đinh Ngọ" 
- [x] Storyline tâm lý: "qua Tết đi..." → deadline dí mặt → biến áp lực thành cơ hội → 2 viên khỏe re
- [x] Benefits: ⚡ Tỉnh táo, 🌙 Xuyên đêm, 🛡️ Đề kháng, ⏳ Giảm 5% trước 28/02
- [x] CTA: "💊 2 viên/ngày — Khỏe re!"
- [x] Quote: "Đừng để sức ì sau Tết là lý do bạn bỏ lỡ cơ hội đầu năm."
- [x] Hero image: Đông trùng lọ thủy tinh + hộp quà vàng + hoa đào Tết

### D3. Quick Login Popup ✅ DONE
- [x] HTML + CSS + JS module (`login-popup.js`)
- [x] Tab CTV / Khách Hàng (iOS segment control)
- [x] SĐT + mật khẩu → login via Supabase RPC
- [x] Reusable API: `openLoginPopup({ role, subtitle, onSuccess })`
- [x] Context-aware: icon/text thay đổi theo role
- [x] Rate limited 5 lần/phút
- [x] Link "Đăng ký ngay" → mở CTV popup

### D4. Popup Polish ✅ DONE
- [x] Staggered entrance animation cho TẤT CẢ popup (CTV, Promo, Login)
- [x] popupSlideUp: header 0.1s → content 0.2s → benefits 0.3s → CTA 0.4s → footer 0.5s
- [x] Reward items stagger (mỗi item delay +0.1s)
- [x] Promo badge pop: scale(0)→scale(1) + xoay nhẹ
- [x] popupBounce nâng cấp với scale
- [x] Hero images: CTV (partnership illustration) + Promo (Tết cordyceps)

### D5. CI Fix ✅ DONE
- [x] Lighthouse CI `v12` → `v11` (v12 không tồn tại)
- [x] E2E tests aligned với FAB widget IDs mới

### D6. Login Popup Integration ⏳ CÒN LẠI
- [ ] Tích hợp `openLoginPopup()` vào các CTA cần login (CTV dashboard, tracking đơn...)
- [ ] Supabase RPC `customer_login` chưa tồn tại → cần tạo migration
- [ ] Test E2E cho login popup flow
- [ ] Test E2E cho promo popup flow

---

## 📊 TỔNG KẾT

| Sprint | Tasks | Status |
| ------ | ----- | ------ |
| **A: Refactor** | 6/6 | ✅ DONE |
| **B: Testing** | 5/5 | ✅ DONE |
| **C: Hardening** | 4/4 | ✅ DONE |
| **D: FAB & Features** | 5/6 | 🔵 83% |
| **Tổng** | **20/21** | **95%** |

### Test Coverage
| Type | Tests | Files |
| ---- | ----- | ----- |
| Unit | 130 | 7 |
| Integration | 30 | 2 |
| E2E (Playwright) | 22 | 4 |
| **Tổng** | **245+** | **13** |

> 🔵 Sprint D còn lại: D6 (Login integration + customer_login RPC + E2E tests)

---

## 📝 QUY TẮC LÀM VIỆC

1. **Build verify bắt buộc** — `npx vite build` clean trước khi push
2. **Test verify** — `npm test` + `npm run test:e2e` pass trước khi push
3. **Commit format** — emoji + mô tả tiếng Việt
4. **Khi phát hiện bug** → fix ngay, đừng ghi TODO
5. **Khi có ý tưởng mới** → ghi vào `BACKLOG.md`
