# 📦 BACKLOG — Tính Năng & Ý Tưởng

> **Trạng thái**: 🔓 MỞ KHÓA — V3 Content Rewrite hoàn tất, P1 features done
> **Cập nhật**: 2026-02-23 23:20
> **Quy tắc**: Ưu tiên từ trên xuống. Items đã triển khai được đánh dấu ✅.

---

## ✅ ĐÃ TRIỂN KHAI (Sprint D — 23/02/2026)

### CTA Audit + Content Bible ✅
- Nâng cấp toàn bộ CTA/messaging: transactional → emotional
- Hero, About, CTA Journey, Order, Promo, CTV, Health Map — all updated
- Content Bible v2.0 cho Claude Code handoff
- FAB tooltips + Social proof: trí lực + thể lực messaging
- **5 Shadow tasks** phát sinh từ tự phản biện → D7-D11 trong TASKS.md

### 📝 V3 Content Rewrite + Hero CTA Rotator ✅
- V3 soften messaging: experience-based (ngủ ngon, ít mệt) thay overclaims
- Tất cả CTA → tiếng Việt tự nhiên, không Tây, không sales
- Hero CTA random 5 phương án mỗi lần load (hero-cta-rotator.js)
- Social proof → Zalo-style quotes, FAB tooltips → price framing

### 🎨 D12. UI Polish — 6 Issues ✅
- Promo popup scrollable + compact card layout + gold CTA
- Border-radius thống nhất toàn site (CSS vars: --radius-sm/md/lg/xl)
- Testimonials lighter cards + white quote marks
- CTV badge beige/gold + mini dashboard full-width 3-column
- Login popup "Đăng ký" → route đúng role (CTV→popup, KH→/thanh-vien)

### 💡 Promotion Popup ✅
- Nút Promo trong FAB orbit (rose gradient)
- Popup content "Bứt Phá Đinh Ngọ 2026" — tâm lý, tinh tế
- Hero image, staggered animations, badge pop
- CTA "2 viên/ngày — Khỏe re!" + auto 5% discount

### 🔐 Quick Login Popup ✅
- Popup đăng nhập nhanh tại mọi điểm chạm
- Tab CTV / Khách Hàng (contextual)
- Reusable API: `openLoginPopup({ role, onSuccess })`
- Rate limited, session management

### 🎯 Multi-Promo Carousel + Auto-Schedule ✅
- Popup lật page khi nhiều promo active (carousel ‹ prev / dots / next ›)
- RPC `get_all_active_promotions` + auto_activate column
- Cron function `auto_manage_promotions` cho pg_cron
- Promo expiry: ẩn FAB khi không có promo active

### 📊 V3 Event Tracking + Vercel Analytics ✅
- Supabase event_logs table + RPC log_event()
- Auto-track CTA clicks, scroll depth (25/50/75/100%), page views
- Vercel Analytics (@vercel/analytics) bật 1 dòng
- Admin RPC get_event_stats() cho dashboard

### 📝 V3 Social Proof Quotes ✅
- 8 testimonials kiểu "tin nhắn Zalo thật"
- Handle null age display

### ✨ P1 Features (từ Claude Code branch) ✅
- Form social proof: "X người đã đặt hàng hôm nay" (real từ DB)
- Reorder discount: +3% cho khách quen (cộng dồn, cap 20%)
- Nurturing toast: nhắc cách uống sau khi đặt hàng
- Promo expiry: ẩn FAB khi promo hết hạn + DB trống

### 🐛 Bug Fixes ✅
- Fix desktop scroll lock (popups display:none mặc định)
- Fix CI tests (exclude .claude/ worktrees từ vitest)
- Dọn sạch 3 Claude Code branches + 2 remote stale branches

---

## 🔴 CẦN LÀM TIẾP (ƯU TIÊN CAO) — Shadow Tasks D7-D11

### ~~🪞 D11. Thu Thập Data~~ ✅ (Event tracking + Vercel Analytics + Admin Dashboard UI)
- ~~Setup Supabase analytics~~ → event_logs table + get_event_stats() RPC
- ~~Baseline metrics~~ → Admin Dashboard hiện page views, CTA clicks, scroll depth, sessions
- Top CTA clicks table (7 ngày)

### ~~🪞 D10. Sticky CTA Mobile~~ ✅
- ~~Sticky bottom CTA trên mobile~~ → Fixed bar "48.000₫/ngày — Đặt Thử Ngay"
- IntersectionObserver: hiện sau hero, ẩn tại #contact
- Safe area cho notched phones

### 🪞 D7. A/B Test CTA — Giọng Tây vs Giọng Việt (ƯU TIÊN #3)
- 2 bộ CTA: empowerment vs bình dân-thực tế
- JS module A/B test + Supabase tracking
- Chạy 2 tuần, quyết định dựa trên data
- **Xem chi tiết**: `TASKS.md` → D7

### ~~🪞 D8. Soften "Trí Lực" Messaging~~ ✅ (Đã xong trong V3 Content Rewrite)
- ~~Review overclaim risk~~ → Đã soften toàn bộ trong V3
- ~~Soften thành experience-based language~~ → Done
- ~~Thêm inline disclaimer~~ → Done (section About)

### 🪞 D9. Test Content Bible — Real Output Claude Code (ƯU TIÊN #5)
- Cho Claude Code viết promotion thử → review giọng văn
- Iterate prompt nếu cần (tách file, rút gọn)
- **Xem chi tiết**: `TASKS.md` → D9

### ~~🔐 D6. Login Integration~~ ✅ (Auth interceptor + openLoginPopup API)
- ~~Tích hợp `openLoginPopup()` vào CTV dashboard~~ → data-auth interceptor tự động
- CTV Dashboard có login flow riêng đầy đủ
- Quick login popup: tab CTV/Khách Hàng

### ~~🏷️ Promotion System — Dynamic~~ ✅
- ~~Hardcode HTML → Supabase table~~ → promotions table + RPC
- Multi-promo carousel + auto-activate/deactivate
- Auto-hide FAB khi hết hạn + DB trống
- Discount tự động áp vào order form

---

## 🟡 ƯU TIÊN TRUNG BÌNH

### 💳 Thanh Toán CTV (Plan gốc Phase 4.3)
- Chức năng rút tiền cho CTV (form yêu cầu)
- Admin duyệt/từ chối yêu cầu rút tiền
- Lịch sử thanh toán
- **Ghi chú**: Database đã có migration 006 (withdrawals) + 011/019 (banking), cần build FE flow

### 📧 Thông Báo Email (Plan gốc Phase 4.4)
- Email xác nhận đơn hàng mới → admin
- Email trạng thái đơn hàng → khách hàng
- Dịch vụ: Resend hoặc SendGrid
- **Ghi chú**: Cần chọn email provider, setup Supabase Edge Function

### 📱 SMS/Zalo Xác Nhận Đơn (Plan gốc TODO)
- Gửi SMS/Zalo xác nhận khi đặt hàng thành công
- Gửi thông báo trạng thái đơn (đang giao, hoàn thành)
- **Ghi chú**: Cần tích hợp API SMS (eSMS, SpeedSMS) hoặc Zalo OA

### ~~📈 Analytics Tracking (Plan gốc Phase 4.2)~~ ✅ (Đã xong — event-tracking.js + Vercel Analytics)
- ~~Page view tracking~~ → Done (event_logs table)
- ~~Conversion funnel~~ → Done (CTA clicks + scroll depth)
- ~~Section engagement~~ → Done (scroll milestones)
- Dashboard analytics trong admin panel → **CẦN BUILD UI**

### 📱 Zalo ZNS — Thông Báo Đơn Hàng + CTV (MỚI 🆕)
- Tự động gửi tin nhắn Zalo khi có đơn mới / CTV được duyệt
- 3 template: xác nhận đơn (khách), alert (Bố), duyệt CTV
- **Anh cần làm trước**: Tạo OA + xác minh + tạo template + lấy token
- **Em code**: Edge Function + DB trigger + auto token refresh
- Chi phí: ~60K/tháng cho 100 đơn
- **Hướng dẫn chi tiết**: `.prompts/zalo-zns-integration-guide.md`

### 🔧 Portable Dev Environment — Tokens & Secrets (MỚI 🆕)
- Tạo bộ token/API key/secret đóng gói để làm việc trên máy nào cũng được
- Setup: GitHub PAT, Supabase keys, Vercel token, Zalo credentials
- **Hướng dẫn chi tiết**: `.prompts/portable-dev-setup.md`

---

## 🟢 ƯU TIÊN THẤP / Ý TƯỞNG

### 📖 Multi-Story Random Display
- Trang `cau-chuyen.html` có NHIỀU câu chuyện, random hiển thị mỗi lần load
- **Nguồn**: `content/BACKLOG.md`, `content/cau-chuyen-content.md`

### 🖼️ Nội Dung Chuyên Nghiệp
- Ảnh sản phẩm chuyên nghiệp (thay thế ảnh mẫu AI)
- Video giới thiệu quy trình sản xuất
- **Ghi chú**: Phụ thuộc vào anh Kha cung cấp assets

### 🎯 CTV Leaderboard
- Bảng xếp hạng CTV theo điểm tích lũy, gamification

### 📱 PWA / Mobile App
- Service Worker, Manifest.json, Offline cache, Push notifications

### 🔔 Push Notification Web
- Browser push cho đơn hàng, điểm CTV, bài viết approved

---

## 📋 CÁCH SỬ DỤNG FILE NÀY

1. **Khi có ý tưởng mới** → Thêm vào section phù hợp bên trên
2. **Chọn task tiếp** → Lấy từ 🔴 CẦN LÀM TIẾP trước
3. **Ưu tiên**: 🔴 > 🟡 > 🟢
4. **Mỗi item chọn** → Viết task chi tiết vào `TASKS.md`

---

*Cập nhật bởi Antigravity AI — 23/02/2026 23:20*
*D10+D11+D6+Promotion: all done — còn D7 (A/B test), D9 (Content Bible test)*
