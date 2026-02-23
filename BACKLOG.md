# 📦 BACKLOG — Tính Năng Tạm Treo

> **Trạng thái**: 🔒 ĐÓNG BĂNG — Chỉ mở khi `TASKS.md` Sprint A-B-C hoàn thành
> **Cập nhật**: 2026-02-23
> **Quy tắc**: Ghi ý tưởng vào đây, KHÔNG triển khai cho đến khi nợ kỹ thuật trả xong.

---

## 🔒 TÍNH NĂNG ĐÃ LÊN KẾ HOẠCH — TẠM TREO

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

### 📱 PWA / Mobile App (Plan gốc Phase 4.1)
- Service Worker + Manifest.json
- Offline cache strategy  
- Install prompt (Add to Home Screen)
- Push notifications
- **Ghi chú**: Chưa bắt đầu, ưu tiên thấp

---

## 🔒 Ý TƯỞNG MỚI PHÁT SINH — TẠM TREO

### 📖 Multi-Story Random Display (Backlog cũ)
- Trang `cau-chuyen.html` có NHIỀU câu chuyện, random hiển thị mỗi lần load
- Mỗi câu chuyện là một "bộ content" hoàn chỉnh (Opening → Chapters → CTA)
- DB/JSON chứa các bộ story, JS logic random pick, transition animation
- Câu chuyện đầu tiên (v3 — "Giường bệnh") là story gốc
- Ý tưởng story: góc nhìn người vợ, góc nhìn CTV, góc nhìn người trẻ burnout...
- **Nguồn**: `content/BACKLOG.md`, `content/cau-chuyen-content.md`

### 🖼️ Nội Dung Chuyên Nghiệp
- Ảnh sản phẩm chuyên nghiệp (thay thế ảnh mẫu AI)
- Video giới thiệu quy trình sản xuất
- Chứng nhận / giấy tờ pháp lý scan
- **Ghi chú**: Phụ thuộc vào anh Kha cung cấp assets

### 🎯 CTV Leaderboard
- Bảng xếp hạng CTV theo điểm tích lũy
- Tháng/Quý, có giải thưởng
- Gamification thêm cho CTV
- **Ghi chú**: Ý tưởng phát sinh, chưa design

### 🔔 Push Notification Web
- Browser push notifications cho:
  - Đơn hàng mới (admin)
  - Điểm CTV được duyệt (CTV)
  - Bài viết được approve (member)
- **Ghi chú**: Cần Service Worker (phụ thuộc PWA)

### 🏷️ Mã Giảm Giá / Coupon
- Hệ thống coupon code
- Admin tạo mã, khách nhập khi đặt hàng
- Tracking hiệu quả từng mã
- **Ghi chú**: Ý tưởng, chưa design

### 💬 Live Chat
- Widget chat trực tiếp với admin/CSKH
- Tích hợp Zalo OA hoặc Tawk.to
- **Ghi chú**: Ý tưởng, chưa design

---

## 📋 CÁCH SỬ DỤNG FILE NÀY

1. **Khi có ý tưởng mới** → Thêm vào section phù hợp bên trên
2. **Khi nợ kỹ thuật trả xong** → Chọn items từ đây để đưa vào `TASKS.md`
3. **Ưu tiên**: Items ở section "ĐÃ LÊN KẾ HOẠCH" trước, rồi đến "Ý TƯỞNG MỚI"
4. **Mỗi item chọn** → Viết task chi tiết (FE/BE phân công, file thay đổi, effort)

---

*Tạo bởi Antigravity AI — 23/02/2026*
*Sẽ unlock sau khi TASKS.md Sprint A-B-C hoàn thành.*
