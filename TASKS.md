# 📋 TASKS — Đông Trùng Hạ Thảo (maldalladuyduc)

> **Cập nhật**: 2026-02-23 15:08
> **Trạng thái**: ✅ SPRINT A-B-C HOÀN THÀNH + Sprint D đang triển khai
> **Sprint A tiến độ**: 6/6 tasks ✅
> **Sprint B tiến độ**: 5/5 tasks ✅
> **Sprint C tiến độ**: 4/4 tasks ✅
> **Sprint D tiến độ**: 6/12 tasks (50%) — D1-D5 ✅, D6 ⏳, D7-D11 🪞 Shadow tasks
> **Backlog tính năng mới**: Xem `BACKLOG.md`

---

## ⚠️ NGUYÊN TẮC HIỆN TẠI

> **SPRINT D ĐANG TRIỂN KHAI** — FAB Widget Polish + Feature mới + CTA Audit + Shadow Follow-ups
> Build ✅ + 223 tests ✅ tại mỗi commit.
> D7-D11 = 5 "Shadow" tasks — tự phản biện sau audit CTA, cần data + testing thật.

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

### 🪞 D7-D11: SHADOW TASKS — Phản biện sau CTA Audit (23/02/2026)

> **Bối cảnh**: Sau khi audit + nâng cấp toàn bộ CTA/messaging trên website
> (commit `8fd0df4`), em tự phản biện theo Carl Jung SELF và phát hiện 5 shadow
> cần xử lý tiếp. Không phải bug — mà là **rủi ro chiến lược** nếu để lâu.

### D7. 🔴 A/B Test CTA — Giọng Tây vs Giọng Việt
**Shadow**: CTA mới kiểu empowerment ("Tôi Muốn Thử Cảm Giác Khỏe Thật Sự") có thể quá "Tây" cho segment 40-60 tuổi Việt Nam.

**Tasks**:
- [ ] Chuẩn bị **2 bộ CTA**: Bản A (empowerment hiện tại) vs Bản B (bình dân-thực tế)
  - Bản B ví dụ: "Đặt Thử 1 Hộp — Xem Có Hợp Không", "Đặt Hàng Ngay", "Thử 30 Ngày"
- [ ] Tạo hệ thống A/B test đơn giản (JS module + Supabase tracking)
  - Random user vào group A/B → track click + conversion mỗi variant
- [ ] Chạy A/B test tối thiểu 2 tuần, thu thập data
- [ ] Quyết định dựa trên data: giữ bản nào, hoặc dùng bản nào cho segment nào

**KPIs**: Click-through rate (CTR) trên hero CTA, conversion rate order form, bounce rate
**Ưu tiên**: 🔴 CAO — nếu CTA sai giọng, mất khách mà không biết

---

### D8. 🔴 Soften "Trí Lực" Messaging — Tránh Overclaim
**Shadow**: "Trí Lực Sắc Bén" đang là lời hứa chính của website, nhưng benefit này là gián tiếp (ngủ tốt → tỉnh táo). Có thể gây kỳ vọng sai hoặc va ranh giới ATTP.

**Tasks**:
- [ ] Review lại toàn bộ messaging có chứa "sắc bén", "minh mẫn", "trí lực" — đếm số lần xuất hiện
- [ ] Soften bằng **experience-based language**:
  - ❌ "Trí Lực Sắc Bén" (absolute claim)
  - ✅ "Nhiều người chia sẻ: tỉnh táo hơn, tập trung hơn sau 1 tháng" (testimonial-based)
- [ ] Thêm **inline disclaimer** tại section About (không chỉ ở footer):
  - "*Kết quả có thể khác nhau tùy cơ địa. Sản phẩm hỗ trợ sức khỏe, không phải thuốc.*"
- [ ] Kiểm tra lại title section: cân nhắc đổi "Trí Lực Sắc Bén, Thể Lực Bền Bỉ" → "Tỉnh Táo Hơn, Bền Bỉ Hơn — Mỗi Ngày" (softer, experience-based)
- [ ] Tham khảo quy định ATTP về functional claims cho TPCN Việt Nam

**Rủi ro nếu không làm**: Khách kỳ vọng sai → thất vọng → refund/bad review. Hoặc bị cơ quan chức năng nhắc nhở.
**Ưu tiên**: 🔴 CAO — liên quan compliance

---

### D9. 🟡 Test Content Bible — Real Output từ Claude Code
**Shadow**: Content Bible viết 300+ dòng nhưng chưa biết Claude Code có tuân thủ 100% không. Prompt dài có thể gây context dilution.

**Tasks**:
- [ ] Cho Claude Code đọc `.prompts/content-writing-prompt.md` → viết 1 promotion (Task 1)
- [ ] Review output: giọng văn đúng chưa? CTA empowering chưa? TRÍ LỰC + THỂ LỰC có không?
- [ ] Nếu output sai giọng → iterate prompt:
  - Cân nhắc **tách file**: `brand-voice.md` (ngắn, 50 dòng, always-load) + `content-tasks.md` (load khi cần)
  - Rút gọn rules thành bullet points sắc hơn
- [ ] Cho Claude Code viết thêm 2-3 tasks khác (CTV welcome, social proof, toast) → review consistency
- [ ] Nếu pass → seal prompt thành v2.1; nếu fail → iterate thêm

**KPIs**: Tỉ lệ content pass review lần 1 (target: >80%)
**Ưu tiên**: 🟡 TRUNG BÌNH — quan trọng cho handoff nhưng không urgent

---

### D10. 🔴 Sticky CTA Mobile + Shorten Flow
**Shadow**: Đổi text 30 nút nhưng user flow vẫn nguyên — hero → scroll 5000px → form đặt hàng. Trên mobile (>70% traffic VN), friction rất lớn.

**Tasks**:
- [ ] Thêm **sticky bottom CTA** trên mobile:
  - Thanh cố định ở bottom, hiện khi scroll qua hero: "Đặt Hàng" + giá
  - Auto-hide khi user scroll đến contact form (tránh overlap)
  - CSS: glassmorphism, nhỏ gọn, không che nội dung
- [ ] Đo **scroll depth** hiện tại: bao nhiêu % user đến được #contact?
  - Sử dụng tracker.js hiện có (migration 007) → log scroll milestones (25%, 50%, 75%, 100%)
- [ ] Cân nhắc **shortcut flow** cho mobile:
  - Hero → nhấn CTA → popup mini-order form (không cần scroll xuống cuối)
  - Hoặc: Hero → 3 benefits → Product price → Order form → done (skip testimonials/stories)
- [ ] Responsive audit: test CTA text dài trên màn hình 360px ("Tôi Muốn Thử Cảm Giác Khỏe Thật Sự" có bị vỡ layout không?)

**Rủi ro nếu không làm**: Đổi text đẹp nhưng user không bao giờ thấy nút order form → conversion vẫn thấp
**Ưu tiên**: 🔴 CAO — trực tiếp ảnh hưởng revenue

---

### D11. 🔴 Thu Thập Data — Đo Lường Trước Khi Đổi Thêm
**Shadow**: Toàn bộ audit CTA dựa trên assumptions, không phải data. Chưa biết CTA nào đang convert, drop-off ở đâu, persona nào đặt hàng nhiều nhất.

**Tasks**:
- [ ] **Setup analytics cơ bản** (ưu tiên Supabase-native, không cần Google Analytics):
  - Track: page views, CTA clicks (nút nào, bao nhiêu), form submissions, scroll depth
  - Bảng `analytics_events`: `{event, page, element_id, timestamp, session_id, device}`
  - Migration mới + Edge Function hoặc client-side tracker
- [ ] **Baseline metrics** trước khi đổi thêm bất cứ gì:
  - Conversion rate hiện tại (visits → orders) = bao nhiêu?
  - Top CTA clicks = nút nào được bấm nhiều nhất?
  - Bounce rate = % user rời trang mà không scroll?
  - Average session duration = bao lâu?
- [ ] **Hỏi anh Kha data thực tế**:
  - Khách đặt hàng nhiều nhất là ai? (tuổi, giới tính, kênh đến)
  - Content nào trên social (Zalo, Facebook) được phản hồi tốt nhất?
  - Lý do top 3 đặt hàng? (tặng ba mẹ, tự dùng, phục hồi sau bệnh?)
- [ ] Build **mini dashboard** trong admin panel:
  - Biểu đồ đơn giản: orders/ngày, CTA clicks/ngày, scroll depth distribution

**Rủi ro nếu không làm**: Tiếp tục optimize based on gut feeling → có thể đang sửa sai hướng
**Ưu tiên**: 🔴 RẤT CAO — đây là foundation cho mọi quyết định tiếp theo

---

## 📊 TỔNG KẾT

| Sprint | Tasks | Status |
| ------ | ----- | ------ |
| **A: Refactor** | 6/6 | ✅ DONE |
| **B: Testing** | 5/5 | ✅ DONE |
| **C: Hardening** | 4/4 | ✅ DONE |
| **D1-D5: FAB & Features** | 5/5 | ✅ DONE |
| **D6: Login Integration** | 0/4 | ⏳ |
| **D7-D11: Shadow Tasks** | 0/5 | 🪞 NEW |
| **Tổng** | **20/30** | **67%** |

### Test Coverage
| Type | Tests | Files |
| ---- | ----- | ----- |
| Unit | 130 | 7 |
| Integration | 30 | 2 |
| E2E (Playwright) | 22 | 4 |
| **Tổng** | **245+** | **13** |

> 🪞 **Shadow Tasks D7-D11** = 5 tasks phản biện chính mình:
> D7 (A/B Test CTA), D8 (Soften Trí Lực ✅), D9 (Test Content Bible),
> D10 (Sticky CTA Mobile), D11 (Thu Thập Data)
> **Thứ tự ưu tiên**: D11 → D10 → D7 → D8 → D9

### 🎨 D12. UI Polish — 6 Issues User-Facing ⏳

> **Ưu tiên**: Tất cả ảnh hưởng trực tiếp UX người dùng

- [x] **D12a.** Promo popup không scroll được → thêm `overflow-y: auto` + `max-height` ✅
- [x] **D12b.** Promo popup layout visual card gọn gàng → redesign compact card ✅
- [x] **D12c.** Border-radius thống nhất toàn site → `--radius-*` CSS vars thay 50px/24px/20px ✅
- [x] **D12d.** Quote/testimonials card sáng hơn, dấu quote trắng ✅
- [x] **D12e.** CTV badge beige/gold + mini dashboard full-width 3 cột ✅
- [x] **D12f.** Login popup → "Đăng ký" điều hướng đúng role (CTV→popup, KH→thanh-vien) ✅
> *(Đo trước, sửa sau — không optimize trên assumptions)*

---

## 📝 QUY TẮC LÀM VIỆC

1. **Build verify bắt buộc** — `npx vite build` clean trước khi push
2. **Test verify** — `npm test` + `npm run test:e2e` pass trước khi push
3. **Commit format** — emoji + mô tả tiếng Việt
4. **Khi phát hiện bug** → fix ngay, đừng ghi TODO
5. **Khi có ý tưởng mới** → ghi vào `BACKLOG.md`
