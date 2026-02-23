# 📦 BACKLOG — Tính Năng & Ý Tưởng

> **Trạng thái**: 🔓 MỞ KHÓA — Sprint A-B-C hoàn thành, Sprint D đang triển khai (D7-D11 Shadow tasks)
> **Cập nhật**: 2026-02-23 15:08
> **Quy tắc**: Ưu tiên từ trên xuống. Items đã triển khai được đánh dấu ✅.

---

## ✅ ĐÃ TRIỂN KHAI (Sprint D — 23/02/2026)

### CTA Audit + Content Bible ✅
- Nâng cấp toàn bộ CTA/messaging: transactional → emotional
- Hero, About, CTA Journey, Order, Promo, CTV, Health Map — all updated
- Content Bible v2.0 cho Claude Code handoff
- FAB tooltips + Social proof: trí lực + thể lực messaging
- **5 Shadow tasks** phát sinh từ tự phản biện → D7-D11 trong TASKS.md

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

### 💬 LiveChat Button ✅ (thay Messenger)
- Nút LiveChat teal trong FAB orbit

---

## 🔴 CẦN LÀM TIẾP (ƯU TIÊN CAO) — Shadow Tasks D7-D11

### 🪞 D11. Thu Thập Data — Đo Lường Trước Khi Đổi Thêm (ƯU TIÊN #1)
- Setup Supabase analytics (page views, CTA clicks, scroll depth, conversions)
- Baseline metrics trước khi đổi thêm gì
- Hỏi anh Kha data thực tế về khách hàng
- **Xem chi tiết**: `TASKS.md` → D11

### 🪞 D10. Sticky CTA Mobile + Shorten Flow (ƯU TIÊN #2)
- Sticky bottom CTA trên mobile
- Đo scroll depth: bao nhiêu % user đến #contact?
- Responsive audit cho CTA text dài trên 360px
- **Xem chi tiết**: `TASKS.md` → D10

### 🪞 D7. A/B Test CTA — Giọng Tây vs Giọng Việt (ƯU TIÊN #3)
- 2 bộ CTA: empowerment vs bình dân-thực tế
- JS module A/B test + Supabase tracking
- Chạy 2 tuần, quyết định dựa trên data
- **Xem chi tiết**: `TASKS.md` → D7

### 🪞 D8. Soften "Trí Lực" Messaging — Compliance (ƯU TIÊN #4)
- Review overclaim risk: "Trí Lực Sắc Bén" có thể va ATTP
- Soften thành experience-based language
- Thêm inline disclaimer tại section About
- **Xem chi tiết**: `TASKS.md` → D8

### 🪞 D9. Test Content Bible — Real Output Claude Code (ƯU TIÊN #5)
- Cho Claude Code viết promotion thử → review giọng văn
- Iterate prompt nếu cần (tách file, rút gọn)
- **Xem chi tiết**: `TASKS.md` → D9

### 🔐 D6. Login Integration (Còn lại từ Sprint D)
- Tích hợp `openLoginPopup()` vào CTV dashboard, tracking đơn
- Tạo Supabase RPC `customer_login`
- E2E tests cho login + promo popup flows

### 🏷️ Promotion System — Dynamic
- Chuyển promotion content từ hardcode HTML → Supabase table
- Admin có thể tạo/sửa/tắt promotion từ dashboard
- Auto-hide khi hết hạn, auto-show khi có promo mới
- Áp dụng discount vào order form tự động

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

### 📈 Analytics Tracking (Plan gốc Phase 4.2)
- Page view tracking (database: migration 007 đã có)
- Conversion funnel (visit → scroll → form → submit)
- Section engagement (time spent per section)
- Dashboard analytics trong admin panel
- **Ghi chú**: Migration 007 + tracker.js đã tạo sẵn, cần build dashboard UI

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

*Cập nhật bởi Antigravity AI — 23/02/2026 15:08*
*Shadow Tasks D7-D11 = tự phản biện Carl Jung SELF sau CTA Audit*
