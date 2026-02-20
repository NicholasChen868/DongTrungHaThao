# Phase 6: UX & Engagement Features

> **PM**: Antigravity (Frontend + QC + SQL Migration)
> **Backend**: Claude Code
> **Ngày bắt đầu**: 2026-02-20

---

## Tổng quan phân công

| # | Việc | Antigravity (FE + QC + SQL) | Claude Code (BE) |
|---|------|----------------------------|-------------------|
| 1 | Nhớ khách cũ | ✅ UI greeting, auto-fill form, localStorage | ❌ Không cần BE |
| 2 | Floating "Đặt Hàng" | ✅ CSS + HTML + JS animation | ❌ Không cần BE |
| 3 | CTA sau Hành Trình | ✅ HTML + CSS button | ❌ Không cần BE |
| 4 | Gợi ý mua lại | ✅ Banner UI + logic hiển thị | ✅ RPC `get_last_order_date(phone)` |
| 5 | Bài viết chi tiết + like | ✅ Modal UI + like button | ✅ RPC `like_post(post_id)` + migration |
| 6 | CTV onboarding | ✅ Onboarding wizard UI | ✅ Track progress field trong `ctv_accounts` |
| 7 | Mệnh Lý & Chiêm Tinh | ✅ Input form + visualization | ✅ Logic tính Ngũ Hành / gợi ý sức khỏe |

---

## Chi tiết từng task

### Task 1: Nhớ khách cũ ⭐ (Dễ → Tác động Rất Cao)
**Owner: Antigravity (100% Frontend)**

**Yêu cầu:**
- Khi khách đặt hàng thành công → lưu `{name, phone}` vào `localStorage`
- Lần sau vào trang chủ → hiện banner chào: "Chào [Tên]! 💛 Rất vui được gặp lại bạn"
- Form đặt hàng → tự điền tên + SĐT từ localStorage
- Nút "Không phải bạn?" để xóa dữ liệu cũ

**File thay đổi:**
- `src/main.js` — thêm module `initReturningCustomer()`
- `index.html` — thêm banner container
- `src/style.css` — style cho greeting banner

**Không cần migration / backend.**

---

### Task 2: Floating "Đặt Hàng" Button (Dễ → Tác động Cao)
**Owner: Antigravity (100% Frontend)**

**Yêu cầu:**
- Nút floating ở góc phải dưới, luôn hiện (trừ khi đang ở section #contact)
- Design: pill-shaped, gold gradient, pulse animation nhẹ
- Click → smooth scroll đến form đặt hàng (#contact)
- Ẩn khi user đã cuộn đến section đặt hàng
- Mobile: nút nhỏ hơn, có safe-area padding

**File thay đổi:**
- `index.html` — thêm floating button element
- `src/style.css` — positioning, animation, responsive
- `src/main.js` — show/hide logic based on scroll

**Không cần migration / backend.**

---

### Task 3: CTA sau Hành Trình Sức Khỏe (Rất dễ → Tác động Cao)
**Owner: Antigravity (100% Frontend)**

**Yêu cầu:**
- Sau section "Hành Trình Sức Khỏe" (#health-stories) → thêm CTA box
- Text: "Bắt đầu hành trình sức khỏe của bạn ngay hôm nay"
- Button: "Đặt Hàng Ngay" → scroll to #contact
- Design: gradient border, subtle glow animation

**File thay đổi:**
- `index.html` — thêm CTA section
- `src/style.css` — styling

**Không cần migration / backend.**

---

### Task 4: Gợi ý mua lại (Trung bình → Tác động Cao)
**Owner: Antigravity (FE) + Claude Code (BE)**

**Frontend (Antigravity):**
- Banner "Đã 30 ngày kể từ đơn hàng cuối, bổ sung thêm nhé? 💛"
- Hiện ở đầu trang khi user đã mua trước đó
- Nút "Đặt Lại" + nút "Bỏ qua" (ẩn 7 ngày)
- Logic: check localStorage `last_order_date`, nếu > 30 ngày → hiện

**Backend (Claude Code):**
- **KHÔNG CẦN RPC MỚI** — dùng localStorage lưu ngày đặt hàng cuối khi submit thành công
- Nếu muốn chính xác hơn: RPC `get_last_order_date(p_phone TEXT)` → trả về timestamp

**File thay đổi:**
- FE: `src/main.js`, `index.html`, `src/style.css`
- BE (optional): migration `012_reorder_reminder.sql`

---

### Task 5: Bài viết đọc chi tiết + Like (Trung bình → Tác động Trung bình)
**Owner: Antigravity (FE) + Claude Code (BE)**

**Frontend (Antigravity):**
- Trên trang `chia-se.html`: click vào bài → mở modal đọc full
- Nút ❤️ Like — toggle, hiện số lượt thích
- Lưu liked posts vào localStorage (tránh like spam)
- SQL migration cho bảng `post_likes` nếu cần

**Backend (Claude Code):**
- RPC `like_post(p_post_id INTEGER)` → tăng likes +1 trong `member_posts`
- Có thể thêm bảng `post_likes` để track unique likes (optional)

**File thay đổi:**
- FE: `chia-se.html` (modal + like UI)
- BE: migration `012_post_likes.sql`

---

### Task 6: CTV Onboarding (Trung bình → Tác động Trung bình)
**Owner: Antigravity (FE) + Claude Code (BE)**

**Frontend (Antigravity):**
- Sau CTV đăng ký xong → hiện onboarding wizard (3-4 bước)
- Bước 1: "Chia sẻ mã giới thiệu của bạn"
- Bước 2: "Giới thiệu 3 khách đầu tiên"
- Bước 3: "Theo dõi doanh số & rút tiền"
- Progress bar: Silver → Gold → Platinum
- Hiện trên `ctv-dashboard.html`

**Backend (Claude Code):**
- Thêm field `onboarding_step INTEGER DEFAULT 0` vào `ctv_accounts`
- RPC `update_onboarding_step(p_phone, p_hash, p_step)`

**File thay đổi:**
- FE: `ctv-dashboard.html` (wizard UI)
- BE: migration `013_ctv_onboarding.sql`

---

### Task 7: Mệnh Lý & Chiêm Tinh 🌟 (Khó → Tác động Rất Cao)
**Owner: Antigravity (FE) + Claude Code (BE logic)**

**Frontend (Antigravity):**
- Trang riêng hoặc section mới: nhập Ngày/Tháng/Năm sinh
- Hiệu ứng "đang phân tích..." (loading animation đẹp)
- Kết quả: Bản Đồ Sức Khỏe Cá Nhân
  - Mệnh (Kim/Mộc/Thủy/Hỏa/Thổ)
  - Cơ quan yếu theo mệnh
  - Gợi ý bổ sung Đông Trùng Hạ Thảo phù hợp
  - Visualization: radar chart hoặc body map
- Nút "Đặt Hàng theo Gợi Ý"

**Backend (Claude Code):**
- Logic tính Can Chi / Ngũ Hành từ năm sinh (Thiên Can + Địa Chi)
- Mapping Ngũ Hành → cơ quan cơ thể → lời khuyên sức khỏe
- Có thể dùng pure JS (không cần server) hoặc RPC nếu muốn

**File thay đổi:**
- FE: `ban-do-suc-khoe.html` (trang mới) hoặc section trong `index.html`
- BE: `src/utils/ngu-hanh.js` (logic module)

---

## Thứ tự ưu tiên thực hiện

### Sprint 1 (Ngay bây giờ — Antigravity tự làm):
1. ✅ Task 1: Nhớ khách cũ
2. ✅ Task 2: Floating button
3. ✅ Task 3: CTA sau Health Stories

### Sprint 2 (Sau Sprint 1 — cần phối hợp Claude Code):
4. Task 4: Gợi ý mua lại
5. Task 5: Bài viết + Like

### Sprint 3 (Feature lớn):
6. Task 6: CTV Onboarding
7. Task 7: Mệnh Lý & Chiêm Tinh (wow factor)

---

## Ghi chú cho Claude Code

> Khi Claude Code implement backend cho Task 4-7, cần:
> 1. Tạo file migration SQL riêng (012, 013...)
> 2. Antigravity sẽ review + chạy migration trên Supabase
> 3. Frontend integration sẽ do Antigravity handle
> 4. Mọi RPC mới phải có `SECURITY DEFINER` + rate limiting
> 5. Không lộ `password_hash` trong bất kỳ response nào
