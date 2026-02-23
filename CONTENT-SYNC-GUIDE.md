# HƯỚNG DẪN ĐỒNG BỘ GIỌNG VĂN TOÀN SITE

## Giọng văn gốc (đã hoàn thành)

File tham chiếu chính — **giọng Founder, ngôi "tôi", trưởng thành, chân thực, không bán hàng mà kể chuyện:**

```
/Volumes/Personal/DongTrungHaThao/cau-chuyen.html
```

---

## TOÀN BỘ SITEMAP — Phân loại theo mức độ ưu tiên

### 🔴 ƯU TIÊN CAO — Trang khách hàng nhìn thấy nhiều nhất

#### 1. TRANG CHỦ (index.html)
```
/Volumes/Personal/DongTrungHaThao/index.html
```
- **Vai trò:** Trang đầu tiên khách thấy. Hero, giới thiệu sản phẩm, benefits, quy trình, testimonials, CTA
- **Content nằm ở:** HTML trực tiếp trong file + data dynamic từ Supabase
- **Modules render content:**
  - `/Volumes/Personal/DongTrungHaThao/src/modules/render-sections.js` — render benefits, process, stories, testimonials
  - `/Volumes/Personal/DongTrungHaThao/src/modules/hero-cta-rotator.js` — text xoay trong hero CTA
  - `/Volumes/Personal/DongTrungHaThao/src/modules/floating-buttons.js` — nút CTA nổi
  - `/Volumes/Personal/DongTrungHaThao/src/modules/sticky-cta.js` — CTA dính
  - `/Volumes/Personal/DongTrungHaThao/src/modules/exit-intent.js` — popup khi rời trang
  - `/Volumes/Personal/DongTrungHaThao/src/modules/social-proof.js` — thông báo social proof
  - `/Volumes/Personal/DongTrungHaThao/src/modules/reorder-reminder.js` — nhắc mua lại
- **Data files (nội dung fallback khi Supabase không load):**
  - `/Volumes/Personal/DongTrungHaThao/data/products.js` — tên, tagline, mô tả sản phẩm, benefits
  - `/Volumes/Personal/DongTrungHaThao/data/testimonials.js` — các lời chia sẻ
  - `/Volumes/Personal/DongTrungHaThao/data/processSteps.js` — quy trình sản xuất
- **Cần đồng bộ:** Hero heading, tagline, tất cả copy trong sections, microcopy trong popups/CTAs

#### 2. TRANG CHIA SẺ (chia-se.html)
```
/Volumes/Personal/DongTrungHaThao/chia-se.html
```
- **Vai trò:** Testimonials mở rộng — nơi khách đọc trải nghiệm thật
- **Content:** HTML trực tiếp + data testimonials từ Supabase
- **Modules liên quan:**
  - `/Volumes/Personal/DongTrungHaThao/src/modules/testimonials.js` — load & render testimonials
- **Cần đồng bộ:** Heading, intro text, tone của phần giới thiệu trang

#### 3. TRANG CÂU CHUYỆN ✅ (ĐÃ XONG)
```
/Volumes/Personal/DongTrungHaThao/cau-chuyen.html
```

---

### 🟡 ƯU TIÊN TRUNG BÌNH — Trang chuyển đổi & CTV

#### 4. TRANG TUYỂN CTV (tuyen-ctv.html)
```
/Volumes/Personal/DongTrungHaThao/tuyen-ctv.html
```
- **Vai trò:** Landing page tuyển cộng tác viên — lời mời hợp tác "cùng tần số"
- **Content:** HTML trực tiếp + data affiliate tiers từ Supabase
- **Modules liên quan:**
  - `/Volumes/Personal/DongTrungHaThao/src/ctv-landing.js` — logic landing CTV
  - `/Volumes/Personal/DongTrungHaThao/src/modules/ctv-banner.js` — banner CTV
- **Data files:**
  - `/Volumes/Personal/DongTrungHaThao/data/affiliateTiers.js` — cấp bậc CTV, mô tả chương trình
- **Cần đồng bộ:** Giọng văn mời gọi — từ "kiếm tiền" sang "đi cùng", phát tín hiệu năng lượng Founder

#### 5. TRANG THÀNH VIÊN (thanh-vien.html)
```
/Volumes/Personal/DongTrungHaThao/thanh-vien.html
```
- **Vai trò:** Chương trình thành viên thân thiết
- **Content:** HTML trực tiếp
- **Cần đồng bộ:** Tone tri ân, không phải chương trình khuyến mãi

#### 6. BẢN ĐỒ SỨC KHỎE (ban-do-suc-khoe.html)
```
/Volumes/Personal/DongTrungHaThao/ban-do-suc-khoe.html
```
- **Vai trò:** Công cụ tương tác — bản đồ sức khỏe cá nhân
- **Content:** HTML + JS tương tác
- **Cần đồng bộ:** Microcopy, câu hỏi, kết quả — giọng quan tâm, không áp lực

---

### 🟢 ƯU TIÊN THẤP — Trang phụ trợ / pháp lý

#### 7. CTV DASHBOARD (ctv-dashboard.html)
```
/Volumes/Personal/DongTrungHaThao/ctv-dashboard.html
```
- **JS logic:** `/Volumes/Personal/DongTrungHaThao/src/ctv-dashboard.js`
- **Vai trò:** Dashboard nội bộ cho CTV — ít cần thay đổi giọng văn

#### 8. TRANG TRA CỨU (tra-cuu.html)
```
/Volumes/Personal/DongTrungHaThao/tra-cuu.html
```
- **Vai trò:** Tra cứu đơn hàng

#### 9. TRANG 404 (404.html)
```
/Volumes/Personal/DongTrungHaThao/404.html
```
- **Vai trò:** Trang lỗi — cơ hội thể hiện personality

#### 10-12. TRANG PHÁP LÝ
```
/Volumes/Personal/DongTrungHaThao/chinh-sach-bao-mat.html
/Volumes/Personal/DongTrungHaThao/chinh-sach-doi-tra.html
/Volumes/Personal/DongTrungHaThao/dieu-khoan-su-dung.html
```

---

## CÁC FILE CONTENT QUAN TRỌNG KHÁC

### Popup & Conversion Modules (microcopy)
```
/Volumes/Personal/DongTrungHaThao/src/modules/exit-intent.js        — popup khi thoát trang
/Volumes/Personal/DongTrungHaThao/src/modules/social-proof.js       — thông báo "Ai đó vừa mua..."
/Volumes/Personal/DongTrungHaThao/src/modules/promo-popup.js        — popup khuyến mãi
/Volumes/Personal/DongTrungHaThao/src/modules/order-form.js         — form đặt hàng (labels, messages)
/Volumes/Personal/DongTrungHaThao/src/modules/returning-customer.js — chào khách quay lại
/Volumes/Personal/DongTrungHaThao/src/modules/reorder-reminder.js   — nhắc mua lại
```

### Data Layer (nội dung tĩnh fallback)
```
/Volumes/Personal/DongTrungHaThao/data/products.js       — tên, tagline, mô tả, benefits
/Volumes/Personal/DongTrungHaThao/data/testimonials.js   — câu chuyện khách hàng
/Volumes/Personal/DongTrungHaThao/data/processSteps.js   — quy trình sản xuất
/Volumes/Personal/DongTrungHaThao/data/affiliateTiers.js — chương trình CTV
```

### Main Entry & Rendering
```
/Volumes/Personal/DongTrungHaThao/src/main.js                    — JS chính, init tất cả modules
/Volumes/Personal/DongTrungHaThao/src/modules/render-sections.js — render HTML cho tất cả sections trên trang chủ
```

### CSS (styling cho content)
```
/Volumes/Personal/DongTrungHaThao/src/css/hero.css       — hero section styling
/Volumes/Personal/DongTrungHaThao/src/css/sections.css   — sections (benefits, process, stories)
/Volumes/Personal/DongTrungHaThao/src/css/base.css       — base typography & colors
/Volumes/Personal/DongTrungHaThao/src/css/responsive.css — responsive breakpoints
```

---

## NGUYÊN TẮC ĐỒNG BỘ GIỌNG VĂN

### Giọng văn mục tiêu (tham chiếu từ cau-chuyen.html)
1. **Ngôi kể:** "Tôi" — người sáng lập, trưởng thành, đã đi qua nhiều thử thách
2. **Tone:** Chân thực, điềm đạm, tự tin nhưng khiêm tốn. KHÔNG bán hàng, KHÔNG hô hào
3. **Cách kể:** Storytelling — mỗi section là một phần của mạch chuyện lớn
4. **Giá trị cốt lõi tỏa ra:** 
   - Sự kiên trì 15 năm
   - Một sản phẩm duy nhất, làm tới nơi
   - 100% nguyên chất, không pha trộn
   - Lương tâm không cho phép dừng lại
5. **Lời mời CTV:** Phát tín hiệu năng lượng — "nếu bạn cùng tần số, cùng đi"
6. **KHÔNG thay đổi:** Nội dung gốc trong cau-chuyen.html — đây là văn gốc của Founder

### Mạch chuyện xuyên suốt
```
Trang chủ     → Ấn tượng đầu tiên: "Đây là ai? Sản phẩm gì? Vì sao khác biệt?"
Câu chuyện    → Đi sâu: "15 năm, 1 con đường" (✅ đã xong)
Chia sẻ       → Xác nhận: "Người thật, trải nghiệm thật"
Tuyển CTV     → Mời gọi: "Nếu bạn cùng tần số — hãy cùng đi"
Thành viên    → Tri ân: "Người đã tin — được ghi nhớ"
Bản đồ SK     → Quan tâm: "Bạn thật sự ổn không?"
```

---

## CÁCH DÙNG VỚI CLAUDE CODE

Copy prompt này vào Claude Code:

```
Đọc file /Volumes/Personal/DongTrungHaThao/CONTENT-SYNC-GUIDE.md để hiểu toàn bộ sitemap.
Đọc file /Volumes/Personal/DongTrungHaThao/cau-chuyen.html để hiểu giọng văn gốc của Founder.
Sau đó đọc file [TRANG CẦN SỬA] và viết lại nội dung theo giọng văn Founder.
Giữ nguyên cấu trúc HTML/CSS/JS, chỉ thay đổi nội dung text.
```

Ví dụ cụ thể cho từng trang:

```
# Sửa trang chủ:
Đọc /Volumes/Personal/DongTrungHaThao/CONTENT-SYNC-GUIDE.md
Đọc /Volumes/Personal/DongTrungHaThao/cau-chuyen.html (giọng văn gốc)
Sửa /Volumes/Personal/DongTrungHaThao/index.html — đồng bộ giọng văn

# Sửa trang tuyển CTV:
Đọc /Volumes/Personal/DongTrungHaThao/CONTENT-SYNC-GUIDE.md
Đọc /Volumes/Personal/DongTrungHaThao/cau-chuyen.html (giọng văn gốc)
Sửa /Volumes/Personal/DongTrungHaThao/tuyen-ctv.html — chuyển từ "bán hàng" sang "mời đồng hành"
```
