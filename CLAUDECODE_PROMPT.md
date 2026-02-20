# ClaudeCode — Phase 6 Sprint 4: BTV Gamification & Giá Mới

> Copy prompt bên dưới vào ClaudeCode terminal hoặc dán cho Assistant khác để code chức năng.

---

## PROMPT BẮT ĐẦU:

Bạn đang phối hợp xây dựng hệ thống "Kênh Kép" cho website DongTrungHaThao.
Project sử dụng: HTML, CSS, Vanilla JS, Supabase.

### 🎯 CONTEXT & REQUIREMENT
Khách hàng muốn chốt lại giá sản phẩm: **1,450,000 VNĐ / Hộp 60 Viên**. (Antigravity đã update các file text tĩnh).
Khách hàng vừa duyệt **Chiến lược Nhuận bút Game Hóa** (trong `docs/DE_XUAT_BIEN_TAP_VIEN_NHUAN_BUT.md`), cụ thể:
1. Không trả tiền mặt ngay kiểu báo chí (Tránh rủi ro).
2. Trả nhuận bút cơ bản bằng **"Điểm"** (Khoảng 30-50 ngàn điểm, 1 điểm = 1 VNĐ) cộng vào Ví tài khoản khi được duyệt bài.
3. Khi BTV có điểm, có thể đổi làm thẻ mua hàng, hoặc rút tiền y hệt CTV Bán Hàng.
4. Có cơ chế thưởng tương tác (View/Like) và nhận chiết khấu (Affiliate Sale 10-25%).

### 🛠️ NHIỆM VỤ CỦA CLAUDECODE / ASSISTANT CODE
Nhiệm vụ của bạn là tích hợp cơ chế Ví & Game hoá cho BTV. Dựa vào codebase hiện có:

**[Bước 1] Database** (Tạo/Cập nhật file `supabase/migration.sql` hoặc Migration mới)
- Bảng `ctv_users`: Thêm cột `wallet_balance` (Hoặc nếu đã có, gộp chung điểm CTV và Điểm Nhuận bút thành 1 đồng tiền duy nhất: Ví Số Dư).
- Bảng `posts` (Câu Chuyện): Cần lưu trữ User ID người viết `author_id`. Thêm cột `reward_points_granted` (boolean) để ghi nhận bài đã được trả nhuận bút chưa.
- Tạo RPC function `approve_post_and_reward`: Đánh dấu `approved = true` + Cộng điểm thưởng `+30000` vào `wallet_balance` của User tạo bài. Ghi Transaction Log nếu được.

**[Bước 2] Logic UI: Góc Câu Chuyện (chia-se.html)**
- Khi user gửi bài (Góc Nộp Bài), gắn `author_id` từ auth session (Nếu chưa có session, yêu cầu login).
- Hiển thị bài viết kèm tên tác giả (Nếu là BTV). Cập nhật tính năng Like post có tracking.

**[Bước 3] Logic UI: CTV Dashboard (ctv-dashboard.html)**
- Tích hợp thêm Tab: "Viết Câu Chuyện" hoặc "Quản lý Bài Viết" vào chung Dashboard CTV. (Gắn kết CTV và BTV thành 1 tài khoản Kênh kép - vừa bán hàng, vừa viết bài cày điểm).
- Hiện "Số Điểm Dư" / Lịch sử rút tiền - quy đổi từ số dư tài khoản.

### QUY TẮC BẮT BUỘC:
- **Tất cả UI/Text/Commit phải là Tiếng Việt rõ ràng**.
- Commit message phải có `Trước khi sửa:` và `Sau khi sửa:` (Xem `.cursorrules`).
- Không thêm emoji nếu không cần thiết.

Bắt đầu đọc kĩ lại docs và triển khai `migration` Supabase cho ví tiền và bài viết trước nhé!
