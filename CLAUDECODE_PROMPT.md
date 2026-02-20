# ClaudeCode — Phase 7: Backend Hoàn Thiện Vòng Lặp Kinh Doanh

> Copy toàn bộ nội dung bên dưới vào terminal ClaudeCode để chạy.

---

## PROMPT:

Bạn đang tiếp tục phát triển hệ thống DongTrungHaThao (HTML, CSS, Vanilla JS, Supabase).
Phase 6 đã hoàn thành toàn bộ Frontend. Giờ cần Backend bổ sung 3 module còn thiếu.

### CONTEXT
- Giá sản phẩm: 1,450,000 VNĐ / hộp 60 viên
- Database Supabase đang có: `ctv_accounts`, `member_posts`, `members`, `orders`, `point_transactions`, `rate_limit_tracker`
- Migration 014 đã chạy: cột `reward_points_granted` trong `member_posts`, RPC `approve_post_and_reward`, `get_btv_posts`, `admin_list_posts`
- CTV Onboarding Wizard UI đã có ở `ctv-dashboard.html` (3 bước: Copy link > 3 khách > Rút tiền)

### NHIỆM VỤ 1: Lưu Onboarding Step vào Database
**File:** `supabase/migrations/015_ctv_onboarding.sql`

Thêm cột `onboarding_step INTEGER DEFAULT 0` vào bảng `ctv_accounts`.

Tạo RPC:
```sql
update_onboarding_step(p_ref_code TEXT, p_step INTEGER)
```
- Validate ref_code tồn tại
- Chỉ cho phép tăng step (không cho giảm)
- Rate limit 10 calls / 5 phút
- SECURITY DEFINER

Cập nhật file `ctv-dashboard.html`:
- Khi load dashboard, đọc `onboarding_step` từ data trả về (cần update RPC `get_ctv_dashboard` để trả thêm field `onboarding_step`)
- Khi user hoàn thành 1 bước, gọi RPC `update_onboarding_step` để lưu vào DB (thay vì chỉ localStorage)

### NHIỆM VỤ 2: Thông Báo Đơn Hàng Cho CTV (Order Notification)
**File:** `supabase/migrations/016_order_notifications.sql`

Tạo bảng `ctv_notifications`:
```sql
CREATE TABLE ctv_notifications (
    id SERIAL PRIMARY KEY,
    ctv_id INTEGER REFERENCES ctv_accounts(id),
    type TEXT NOT NULL, -- 'new_order', 'commission', 'withdrawal_approved', 'post_reward'
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

Tạo RPC:
- `get_ctv_notifications(p_ref_code TEXT)` — Lấy 20 thông báo mới nhất, rate limit
- `mark_notification_read(p_ref_code TEXT, p_notification_id INTEGER)` — Đánh dấu đã đọc

Tạo Trigger trên bảng `orders`:
- Khi có đơn hàng mới với `ref_code` khớp CTV → Tự động INSERT vào `ctv_notifications` với type='new_order'

Cập nhật `ctv-dashboard.html`:
- Thêm icon chuông thông báo ở header (hiện số chưa đọc)
- Dropdown danh sách thông báo khi click
- Gọi `get_ctv_notifications` khi load dashboard

### NHIỆM VỤ 3: Lưu & Chia Sẻ Kết Quả Ngũ Hành
**File:** `supabase/migrations/017_health_map_shares.sql`

Tạo bảng `health_map_results`:
```sql
CREATE TABLE health_map_results (
    id SERIAL PRIMARY KEY,
    share_code TEXT UNIQUE NOT NULL, -- 8 ký tự random
    name TEXT NOT NULL,
    birth_year INTEGER NOT NULL,
    element TEXT NOT NULL, -- Kim, Mộc, Thủy, Hỏa, Thổ
    ref_code TEXT, -- CTV referral nếu có
    created_at TIMESTAMPTZ DEFAULT now()
);
```

Tạo RPC:
- `save_health_map(p_name TEXT, p_birth_year INTEGER, p_element TEXT, p_ref_code TEXT DEFAULT NULL)` — Lưu kết quả, trả về share_code. Rate limit 20/giờ
- `get_health_map(p_share_code TEXT)` — Lấy kết quả theo share_code (public, cho phép xem không cần login)

Cập nhật `ban-do-suc-khoe.html`:
- Sau khi phân tích xong, tự động gọi `save_health_map` để lưu kết quả
- Hiển thị nút "Chia Sẻ Kết Quả" với link dạng: `/ban-do-suc-khoe.html?share=ABC12345`
- Khi URL có `?share=...` → Load kết quả từ DB thay vì yêu cầu nhập lại
- Nếu URL có `?ref=...` → Lưu ref_code vào kết quả (tracking CTV)

### QUY TẮC BẮT BUỘC
1. Tất cả UI/Text/Commit phải là **Tiếng Việt**
2. Commit message phải có `Trước khi sửa:` và `Sau khi sửa:`
3. Mọi RPC phải có `SECURITY DEFINER` + rate limiting
4. Không lộ `password_hash` trong response
5. Tạo file migration SQL riêng cho mỗi nhiệm vụ (015, 016, 017)
6. Test RPC bằng cách gọi trực tiếp trong SQL Editor nếu được

Bắt đầu từ Nhiệm vụ 1 (đơn giản nhất) rồi tiến dần lên nhé!
