# ANTIGRAVITY HANDOFF — Content Marketing do ClaudeCode viết

> **Ngày**: 23/02/2026
> **Từ**: ClaudeCode (Backend + Testing)
> **Cho**: Antigravity (Frontend + Database + QC)
> **Mục đích**: Gửi toàn bộ content marketing đã viết xong, kèm hướng dẫn chi tiết cách input vào hệ thống.

---

## 📋 TÓM TẮT — CÁI GÌ ĐÃ SẴN SÀNG

| # | Nội dung | Trạng thái | Cần Antigravity làm gì |
|---|----------|------------|------------------------|
| 1 | 3 Promotion Popup (8/3, Mùa Thi, Vu Lan) | ✅ JSON sẵn sàng | INSERT vào bảng `promotions` |
| 2 | CTV Đăng ký Popup | ✅ JSON sẵn sàng | Lưu vào nơi phù hợp (config hoặc hardcode) |
| 3 | CTV Welcome Message | ✅ JSON sẵn sàng | Tạo bảng mới hoặc dùng `ctv_notifications` |
| 4 | CTV Reminder (4 mốc) | ✅ JSON sẵn sàng | Tạo bảng `ctv_reminders` hoặc cron job |
| 5 | Toast Messages (27 variants) | ✅ JSON sẵn sàng | Cập nhật `showToast()` hoặc tạo toast config |
| 6 | Social Proof (10 variants) | ✅ JSON sẵn sàng | Cập nhật `src/modules/social-proof.js` |

---

## 🔍 CẤU TRÚC HIỆN TẠI (ClaudeCode đã khảo sát)

### Bảng `promotions` — ĐÃ CÓ (migration 021)
```sql
-- Columns: id, title, tagline, icon, story_html, discount_percent, badge_text,
--          program_name, benefits (JSONB), cta_text, cta_note, footer_quote,
--          image_url, starts_at, ends_at, is_active, priority, created_at, updated_at

-- RPC đã có:
-- get_active_promotion()        → Frontend gọi để lấy promo active
-- admin_upsert_promotion(...)   → Admin dùng để tạo/sửa promo
```

### Frontend render promo — ĐÃ CÓ
- `src/modules/promo-popup.js` → `renderPromo(promo)` render dynamic từ DB
- `index.html` dòng 978-1035 → HTML popup structure
- CSS classes: `.promo-popup-overlay`, `.promo-popup`, `.promo-benefit`, v.v.

### Social Proof — ĐÃ CÓ
- `src/modules/social-proof.js` → Random names/cities/messages
- `index.html` → `#socialProof` container

### Toast — ĐÃ CÓ
- `src/main.js` dòng 89-104 → `showToast(message, success, options)`
- `index.html` dòng 774-776 → `#toast` container

### CTV Notifications — ĐÃ CÓ
- Bảng `ctv_notifications` (migration 016)
- RPC: `get_ctv_notifications(ref_code)`, `mark_notification_read(ref_code, id)`

---

## 📦 1. PROMOTIONS — INSERT SQL

> **Lưu ý**: Promo seed cũ "Bứt Phá Đầu Năm" hết hạn 28/02/2026. 3 promo mới bên dưới tiếp nối.

### Migration file gợi ý: `supabase/migrations/022_seed_promotions_q1q2.sql`

```sql
-- =============================================
-- 022: Seed 3 chương trình khuyến mãi Q1-Q2 2026
-- ClaudeCode viết content, Antigravity input
-- =============================================

-- PROMOTION 1: Ngày Quốc tế Phụ nữ 8/3
INSERT INTO promotions (
  title, tagline, icon, program_name, story_html,
  discount_percent, badge_text, benefits,
  cta_text, cta_note, footer_quote,
  starts_at, ends_at, is_active, priority
) VALUES (
  'Tặng Sức Khỏe — Tặng Yêu Thương 💐',
  '8/3 này, đừng chỉ tặng hoa — hãy tặng điều ở lại lâu hơn ✨',
  '💐',
  'Yêu Thương 8/3',
  'Mỗi năm 8/3, mình tặng hoa, tặng quà... rồi hoa héo, quà cất tủ. 🥀<br><br>Nhưng có một món quà mà <strong>càng dùng càng thấy giá trị</strong> — đó là sức khỏe.<br><br>Mẹ hay nói <em>"mẹ khỏe mà, con lo gì"</em> — nhưng bạn biết mà, mẹ giấu mệt giỏi lắm. Vợ cũng vậy, sáng lo con đi học, tối lo cơm nước, khuya còn dọn nhà... mà miệng cứ cười <em>"có gì đâu"</em>. 😢<br><br>2 viên Đông Trùng Hạ Thảo mỗi ngày — giúp <strong>tăng đề kháng, ngủ sâu hơn, da dẻ hồng hào hơn</strong>. Không phải lời hứa to tát, mà là sự chăm sóc nhỏ mà thật.<br><br>8/3 này, tặng mẹ, tặng vợ, tặng chị em — hay <strong>tặng chính mình</strong> cũng xứng đáng lắm. 💛',
  8,
  'GIẢM 8%',
  '[
    {"icon": "💐", "text": "Giảm 8% mừng ngày 8/3 — áp dụng mọi đơn hàng"},
    {"icon": "🌸", "text": "Hỗ trợ da đẹp, ngủ ngon, đề kháng tốt cho phụ nữ"},
    {"icon": "🎁", "text": "Tặng thiệp viết tay khi mua làm quà (ghi chú khi đặt hàng)"},
    {"icon": "⏳", "text": "Chỉ áp dụng từ 01/03 đến 10/03/2026"}
  ]'::jsonb,
  '🌷 Đặt Quà 8/3 Ngay',
  '*Giao hàng trước 8/3 nếu đặt trước ngày 06/03',
  '"Yêu thương không cần lý do — nhưng cần hành động."',
  '2026-03-01',
  '2026-03-10',
  true,
  10
);

-- PROMOTION 2: Mùa Thi Cử (Tháng 4-5)
INSERT INTO promotions (
  title, tagline, icon, program_name, story_html,
  discount_percent, badge_text, benefits,
  cta_text, cta_note, footer_quote,
  starts_at, ends_at, is_active, priority
) VALUES (
  'Mùa Thi Tỉnh Táo — Không Lo Đuối Sức 📚',
  'Con ôn bài tới khuya, ba mẹ thức cùng — ai cũng cần năng lượng ✨',
  '📚',
  'Bứt Phá Mùa Thi',
  'Tháng 5 — mùa thi cử, mùa áp lực.<br><br>Con thì <strong>ôn bài tới 1-2h sáng</strong>, mắt díp mà sách còn dày. Ba mẹ thì lo lắng, muốn giúp mà không biết giúp kiểu gì ngoài nấu cháo đêm. 😓<br><br>Nhiều phụ huynh chia sẻ rằng cho con uống <strong>Đông Trùng Hạ Thảo</strong> trong mùa thi, thấy con <em>tỉnh táo hơn, tập trung lâu hơn, ngủ ít mà vẫn khỏe</em>. Không phải thần dược — mà là <strong>dinh dưỡng đúng lúc, đúng chỗ</strong>.<br><br>Và ba mẹ cũng đừng quên chăm mình — thức cùng con mỗi đêm, cơ thể cũng cần được bồi bổ. 💪<br><br><strong>Mùa thi này, cả nhà cùng khỏe — cùng bứt phá.</strong> 🎯',
  5,
  'GIẢM 5%',
  '[
    {"icon": "🧠", "text": "Hỗ trợ tỉnh táo, tập trung — lý tưởng cho mùa ôn thi"},
    {"icon": "⚡", "text": "Tăng năng lượng tự nhiên, không gây bồn chồn như cà phê"},
    {"icon": "👨‍👩‍👧", "text": "Mua 2 hộp trở lên — giảm thêm 2% cho cả gia đình"},
    {"icon": "⏳", "text": "Áp dụng từ 15/04 đến 31/05/2026"}
  ]'::jsonb,
  '📖 Đặt Hàng Mùa Thi',
  '*Đông Trùng là thực phẩm bổ sung, không thay thế thuốc điều trị',
  '"Không có con đường tắt tới thành công — nhưng có cách để đi xa mà không kiệt sức."',
  '2026-04-15',
  '2026-05-31',
  true,
  10
);

-- PROMOTION 3: Vu Lan Báo Hiếu (Tháng 7-8)
INSERT INTO promotions (
  title, tagline, icon, program_name, story_html,
  discount_percent, badge_text, benefits,
  cta_text, cta_note, footer_quote,
  starts_at, ends_at, is_active, priority
) VALUES (
  'Vu Lan Này — Tặng Ba Mẹ Sức Khỏe Thật 🪷',
  'Hiếu kính không chỉ là lời nói — mà là hành động mỗi ngày ✨',
  '🪷',
  'Hiếu Kính Vu Lan',
  'Ba mẹ già đi mỗi ngày — mà mình bận quá, đôi khi quên mất.<br><br>Gọi điện thì ba nói <em>"ba khỏe"</em>, mẹ nói <em>"mẹ ổn"</em>. Nhưng lần về gần nhất, bạn có thấy <strong>tóc ba bạc thêm, mẹ hay kêu mỏi lưng</strong> không? 😢<br><br>Vu Lan không cần quà đắt tiền. Chỉ cần cho ba mẹ biết: <strong>"Con quan tâm sức khỏe ba mẹ thật sự"</strong>.<br><br>Đông Trùng Hạ Thảo — 2 viên mỗi ngày, giúp ba mẹ <strong>ngủ ngon hơn, ít mệt mỏi, đề kháng vững vàng</strong>. Nhiều khách hàng chia sẻ rằng sau 2-3 tuần, ba mẹ họ cảm thấy khỏe khoắn và vui vẻ hơn hẳn.<br><br>Món quà nhỏ — nhưng <strong>ở lại với ba mẹ mỗi ngày</strong>. 💛',
  10,
  'GIẢM 10%',
  '[
    {"icon": "🪷", "text": "Giảm 10% nhân mùa Vu Lan — tri ân cha mẹ"},
    {"icon": "💝", "text": "Tặng kèm túi quà Vu Lan khi ghi chú \"tặng ba mẹ\""},
    {"icon": "🚚", "text": "Giao hàng tận nhà ba mẹ — bạn chỉ cần đặt, chúng tôi lo"},
    {"icon": "⏳", "text": "Áp dụng từ 01/07 đến 20/08/2026 (Vu Lan 15/7 Âm lịch)"}
  ]'::jsonb,
  '🪷 Tặng Ba Mẹ Sức Khỏe',
  '*Ghi địa chỉ ba mẹ khi đặt hàng — chúng tôi giao tận nơi',
  '"Cây có gốc mới nở hoa — người có cha mẹ mới nên ta có ngày hôm nay."',
  '2026-07-01',
  '2026-08-20',
  true,
  10
);
```

> **Ghi chú**: `get_active_promotion()` RPC đã có sẵn logic lọc theo `starts_at <= now() AND ends_at >= now() AND is_active = true`, sắp xếp theo `priority DESC`. Chỉ cần INSERT là frontend tự hiển thị đúng lúc.

---

## 📦 2. CTV ĐĂNG KÝ POPUP

> **Hiện tại**: `ctv-dashboard.html` đã có form đăng ký CTV. Content bên dưới dùng để **nâng cấp UI** popup đăng ký hoặc tạo popup riêng trên `index.html`.

```json
{
  "headline": "Kiếm Thêm Thu Nhập — Không Cần Vốn, Không Cần Kinh Nghiệm 💰",
  "subtitle": "Chia sẻ link → Có đơn → Nhận tiền. Đơn giản vậy thôi.",
  "rewards": [
    {
      "icon": "💰",
      "title": "Hoa hồng 10-20% mỗi đơn",
      "desc": "Bán càng nhiều, rank càng cao, % càng lớn. CTV top tháng kiếm 5-10 triệu."
    },
    {
      "icon": "📈",
      "title": "Thăng hạng tự động",
      "desc": "Bronze → Silver → Gold → Diamond. Mỗi rank mở thêm quyền lợi và % hoa hồng."
    },
    {
      "icon": "🎁",
      "title": "Quà tặng & ưu đãi riêng",
      "desc": "CTV được mua sản phẩm giá gốc, nhận quà vào dịp lễ, và hỗ trợ marketing miễn phí."
    }
  ],
  "cta": "🚀 Đăng Ký Làm CTV Ngay",
  "note": "Đăng ký miễn phí • Mật khẩu mặc định = số điện thoại • Bắt đầu kiếm tiền ngay hôm nay"
}
```

### Gợi ý triển khai:
- **Cách 1 (đơn giản)**: Hardcode trong HTML, dùng CSS classes hiện có
- **Cách 2 (scalable)**: Lưu vào bảng `site_config` hoặc `content_blocks` → render dynamic
- Antigravity quyết định cách nào phù hợp nhất.

---

## 📦 3. CTV WELCOME MESSAGE

> **Hiện tại**: Bảng `ctv_notifications` đã có. Có thể INSERT welcome notification ngay khi CTV đăng ký.

```json
{
  "welcome_title": "🎉 Chào mừng bạn gia nhập đội ngũ Maldala Duy Đức!",
  "welcome_message": "Bạn vừa bắt đầu hành trình kiếm thêm thu nhập cùng Đông Trùng Hạ Thảo — sản phẩm sức khỏe mà ai cũng cần, ai cũng muốn tặng người thân.\n\nKhông cần vốn. Không cần kho hàng. Chỉ cần chiếc điện thoại và sự chân thành — bạn đã sẵn sàng.",
  "steps": [
    {
      "step": 1,
      "icon": "🔗",
      "title": "Lấy link giới thiệu của bạn",
      "desc": "Vào Dashboard → mục \"Link giới thiệu\" → copy link. Đây là link riêng của bạn — mọi đơn hàng qua link này đều tính hoa hồng cho bạn."
    },
    {
      "step": 2,
      "icon": "📱",
      "title": "Chia sẻ với người thân, bạn bè",
      "desc": "Gửi link qua Zalo, Facebook, nhóm gia đình. Không cần \"bán hàng\" — chỉ cần chia sẻ câu chuyện sức khỏe thật lòng. Mẹo: kể về trải nghiệm thật của mình hoặc người quen."
    },
    {
      "step": 3,
      "icon": "💸",
      "title": "Có đơn = Có tiền",
      "desc": "Khi ai đó đặt hàng qua link bạn → hoa hồng tự động cộng vào tài khoản. Theo dõi thu nhập ngay trên Dashboard. Rank Bronze bắt đầu ở 10% — càng bán càng lên rank, % càng cao!"
    }
  ],
  "motivation_quote": "\"Nhiều CTV bắt đầu bằng 1 tin nhắn cho mẹ — rồi phát hiện ra mình kiếm thêm được vài triệu mỗi tháng. Bạn cũng làm được.\" 💪",
  "support_note": "Cần hỗ trợ? Gọi hotline 0903.940.171 hoặc nhắn tin trực tiếp trên Zalo. Chúng tôi luôn sẵn sàng hỗ trợ bạn!"
}
```

### Gợi ý triển khai:
- **Option A**: Tạo trigger SQL — khi INSERT vào `ctv_accounts` → auto INSERT vào `ctv_notifications` với type = `'welcome'`, title + message từ content trên.
- **Option B**: Xử lý trong frontend JS — sau khi đăng ký thành công, hiện popup/page welcome với nội dung trên.
- **Option C (recommended)**: Kết hợp cả 2 — trigger gửi notification + frontend hiện welcome wizard (tận dụng onboarding wizard hiện có ở `ctv-dashboard.html`).

---

## 📦 4. CTV REMINDER — Nhắc nhở CTV "im lặng"

> **Cần tạo mới**: Hệ thống này cần bảng mới hoặc cron job để tự động gửi.

```json
[
  {
    "days_inactive": 7,
    "type": "reminder_gentle",
    "title": "Dạo này bạn có khỏe không? 😊",
    "message": "Chào bạn! Cả tuần rồi chưa thấy bạn ghé Dashboard. Không sao cả — ai cũng có lúc bận.\n\nNhưng mà... bạn biết không, chỉ cần 1 tin nhắn gửi cho người quen là có thể tạo ra 1 đơn hàng rồi đó. Thử nhắn cho ai đó hôm nay xem? 💬\n\nMẹo nhỏ: Hỏi thăm sức khỏe trước, giới thiệu sản phẩm sau — tự nhiên như bạn bè chia sẻ.",
    "cta": "📲 Vào Dashboard Lấy Link"
  },
  {
    "days_inactive": 14,
    "type": "reminder_tip",
    "title": "2 tuần rồi — bạn có muốn thử cách này không? 💡",
    "message": "Chào bạn! 2 tuần qua Dashboard vắng bạn quá 😅\n\nChia sẻ một tip từ CTV top tháng trước nhé:\n\n👉 \"Mình không bán hàng — mình chỉ kể cho mẹ mình nghe về Đông Trùng, rồi mẹ kể cho hàng xóm. Thế là có 3 đơn.\" — Chị Lan, CTV Silver\n\nĐôi khi không cần chiến lược phức tạp. Chỉ cần chân thành chia sẻ với 3-5 người thân quen. Thử tuần này xem sao?",
    "cta": "🔗 Chia Sẻ Link Ngay"
  },
  {
    "days_inactive": 30,
    "type": "reminder_motivation",
    "title": "1 tháng rồi — bạn ơi, đừng bỏ cuộc nha! 🌟",
    "message": "Chào bạn! Cả tháng rồi Dashboard im ắng quá — mình hơi lo nên nhắn hỏi thăm.\n\nBạn biết không, nhiều CTV cũng từng \"nguội\" như vậy — rồi quay lại và bất ngờ vì hoa hồng tích lũy nhanh hơn tưởng tượng:\n\n🏆 CTV Minh (Gold) — tháng trước nhận 8.2 triệu hoa hồng\n🏆 CTV Hà (Silver) — bắt đầu lại sau 3 tuần nghỉ, tuần đầu đã có 4 đơn\n\nBạn đã có tài khoản, đã có link — mọi thứ sẵn sàng rồi. Chỉ cần 1 bước nhỏ: mở Dashboard và gửi link cho 1 người hôm nay. Chỉ 1 người thôi. 💛",
    "cta": "💪 Quay Lại Dashboard"
  },
  {
    "days_inactive": 60,
    "type": "reminder_winback",
    "title": "Bạn vẫn ở đây chứ? Chúng tôi vẫn chờ bạn 🤝",
    "message": "Chào bạn! Lâu lắm rồi mình không thấy bạn hoạt động — hy vọng bạn vẫn khỏe.\n\nMình hiểu, ai cũng có giai đoạn bận rộn hoặc chưa tìm được cách phù hợp. Không sao cả — cánh cửa CTV của Maldala Duy Đức luôn mở.\n\nNếu bạn muốn bắt đầu lại, đây là 1 việc duy nhất bạn cần làm:\n📌 Mở Zalo → gửi link sản phẩm cho 1 nhóm gia đình hoặc bạn bè.\n\nChỉ vậy thôi. Không áp lực. Không deadline. Bạn làm theo tốc độ của bạn. 🌱",
    "cta": "🔄 Bắt Đầu Lại"
  }
]
```

### Gợi ý triển khai (Antigravity quyết định):

**Option A — Dùng bảng `ctv_notifications` hiện có + cron function:**
```sql
-- Tạo Supabase Edge Function hoặc pg_cron job chạy hàng ngày
-- Logic: SELECT CTV có last_login_at hoặc last_order_at > N ngày
-- INSERT vào ctv_notifications với type = 'reminder_gentle' / 'reminder_tip' / ...
-- Tránh gửi trùng: check xem đã có notification cùng type trong 7 ngày chưa
```

**Option B — Tạo bảng `ctv_reminder_templates` riêng:**
```sql
CREATE TABLE ctv_reminder_templates (
  id SERIAL PRIMARY KEY,
  days_inactive INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  cta TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);
-- INSERT 4 records từ JSON ở trên
-- Cron job match days_inactive → tạo notification từ template
```

---

## 📦 5. TOAST MESSAGES — Đa phiên bản

> **Hiện tại**: `showToast(message, success)` nhận message cố định.
> **Nâng cấp**: Random pick từ mảng variants cho mỗi tình huống.

### Đăng ký CTV thành công
```javascript
const TOAST_CTV_REGISTER = [
  "🎉 Chào mừng bạn gia nhập đội ngũ CTV Maldala Duy Đức!",
  "✅ Đăng ký thành công! Vào Dashboard để lấy link giới thiệu nhé.",
  "🚀 Tài khoản CTV đã sẵn sàng — bắt đầu kiếm hoa hồng ngay hôm nay!",
  "💪 Đăng ký CTV thành công! Chúc bạn bán hàng vui vẻ.",
  "🎊 Welcome! Mật khẩu mặc định = SĐT của bạn. Đổi mật khẩu trong Dashboard nhé."
];
```

### Đăng nhập thành công (CTV)
```javascript
const TOAST_CTV_LOGIN = [
  "👋 Chào mừng bạn quay lại, CTV!",
  "💰 Đăng nhập thành công — kiểm tra hoa hồng mới nhé!",
  "📊 Chào bạn! Dashboard đã sẵn sàng.",
  "🌟 Welcome back! Xem doanh số hôm nay nào.",
  "✅ Đăng nhập thành công — chúc bạn một ngày bán hàng hiệu quả!"
];
```

### Đăng nhập thành công (Khách hàng)
```javascript
const TOAST_CUSTOMER_LOGIN = [
  "👋 Chào mừng bạn quay lại!",
  "✅ Đăng nhập thành công — chúc bạn mua sắm vui vẻ!",
  "🌿 Chào bạn! Khám phá sản phẩm Đông Trùng Hạ Thảo nhé.",
  "💛 Welcome back! Bạn có ưu đãi mới đang chờ đó.",
  "✅ Đăng nhập thành công — sức khỏe là trên hết!"
];
```

### Đặt hàng thành công
```javascript
const TOAST_ORDER_SUCCESS = [
  "🎉 Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận sớm nhất.",
  "✅ Đơn hàng đã được ghi nhận — cảm ơn bạn đã tin tưởng Maldala Duy Đức!",
  "📦 Đặt hàng thành công! Kiểm tra email/SĐT để theo dõi đơn nhé.",
  "💛 Cảm ơn bạn! Đơn hàng đang được xử lý — giao hàng nhanh chóng.",
  "🌿 Đặt hàng thành công! Chúc bạn sức khỏe dồi dào.",
  "✅ Đơn hàng #OK! Hotline 0903.940.171 nếu bạn cần hỗ trợ thêm."
];
```

### Áp dụng giảm giá thành công
```javascript
const TOAST_DISCOUNT_APPLIED = [
  "🎊 Áp dụng giảm giá thành công! Giá mới đã cập nhật.",
  "💰 Mã giảm giá hợp lệ — bạn được giảm ngay!",
  "✅ Ưu đãi đã áp dụng — tiết kiệm rồi nè!",
  "🎁 Giảm giá thành công! Đặt hàng ngay kẻo hết ưu đãi.",
  "✨ Mã khuyến mãi đã kích hoạt — giá tốt nhất dành cho bạn!"
];
```

### Gợi ý triển khai:

**Cách dùng**: Tạo file `src/utils/toast-messages.js` hoặc thêm vào `src/main.js`:

```javascript
// Helper: random pick từ mảng
function randomToast(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Khi cần hiện toast:
showToast(randomToast(TOAST_ORDER_SUCCESS), true);
```

---

## 📦 6. SOCIAL PROOF — Cập nhật variants

> **File hiện tại**: `src/modules/social-proof.js` đã có random names/cities.
> **Nâng cấp**: Thêm variants đa dạng hơn, có ngữ cảnh "tặng ai".

```json
[
  {
    "name": "Anh Minh",
    "location": "Quận 7, TP.HCM",
    "action": "vừa đặt 3 hộp",
    "time_ago": "2 phút trước",
    "display": "Anh Minh ở Quận 7 vừa đặt 3 hộp 📦"
  },
  {
    "name": "Chị Hà",
    "location": "Quận Bình Thạnh, TP.HCM",
    "action": "vừa đặt 1 hộp tặng mẹ",
    "time_ago": "5 phút trước",
    "display": "Chị Hà ở Bình Thạnh vừa đặt 1 hộp tặng mẹ 💝"
  },
  {
    "name": "Anh Tuấn",
    "location": "Quận 1, TP.HCM",
    "action": "vừa đặt 2 hộp",
    "time_ago": "8 phút trước",
    "display": "Anh Tuấn ở Quận 1 vừa đặt 2 hộp 🌿"
  },
  {
    "name": "Chị Linh",
    "location": "Quận Tân Bình, TP.HCM",
    "action": "vừa mua combo gia đình 5 hộp",
    "time_ago": "12 phút trước",
    "display": "Chị Linh ở Tân Bình vừa mua combo 5 hộp cho gia đình 👨‍👩‍👧‍👦"
  },
  {
    "name": "Anh Phong",
    "location": "TP. Thủ Đức",
    "action": "vừa đặt 1 hộp",
    "time_ago": "15 phút trước",
    "display": "Anh Phong ở Thủ Đức vừa đặt 1 hộp ✨"
  },
  {
    "name": "Chị Mai",
    "location": "Quận Gò Vấp, TP.HCM",
    "action": "vừa đặt 2 hộp tặng ba mẹ",
    "time_ago": "18 phút trước",
    "display": "Chị Mai ở Gò Vấp vừa đặt 2 hộp tặng ba mẹ 🪷"
  },
  {
    "name": "Anh Đức",
    "location": "Quận 3, TP.HCM",
    "action": "vừa mua lại lần 3",
    "time_ago": "22 phút trước",
    "display": "Anh Đức ở Quận 3 vừa mua lại lần 3 🔄"
  },
  {
    "name": "Chị Ngọc",
    "location": "Biên Hòa, Đồng Nai",
    "action": "vừa đặt 1 hộp",
    "time_ago": "25 phút trước",
    "display": "Chị Ngọc ở Biên Hòa vừa đặt 1 hộp 🌟"
  },
  {
    "name": "Anh Khoa",
    "location": "Quận 2, TP.HCM",
    "action": "vừa đặt 4 hộp tặng đồng nghiệp",
    "time_ago": "30 phút trước",
    "display": "Anh Khoa ở Quận 2 vừa đặt 4 hộp tặng đồng nghiệp 🎁"
  },
  {
    "name": "Chị Trang",
    "location": "Quận Phú Nhuận, TP.HCM",
    "action": "vừa đặt 1 hộp dùng thử",
    "time_ago": "35 phút trước",
    "display": "Chị Trang ở Phú Nhuận vừa đặt 1 hộp dùng thử 💛"
  }
]
```

### Gợi ý triển khai:
- Merge vào mảng `notifications` hiện có trong `src/modules/social-proof.js`
- Hoặc thay thế hoàn toàn nếu muốn — nội dung mới đa dạng và tự nhiên hơn

---

## ⚡ CHECKLIST CHO ANTIGRAVITY

Sau khi review content, Antigravity cần làm:

- [ ] **Migration 022**: Chạy SQL insert 3 promotions mới
- [ ] **CTV Signup UI**: Quyết định có cần popup riêng hay nâng cấp form hiện có
- [ ] **CTV Welcome**: Tạo trigger hoặc frontend logic gửi welcome message
- [ ] **CTV Reminder**: Quyết định Option A (dùng bảng cũ + cron) hay Option B (bảng mới)
- [ ] **Toast variants**: Tạo file `src/utils/toast-messages.js` hoặc embed vào `main.js`
- [ ] **Social Proof**: Cập nhật `src/modules/social-proof.js` với data mới
- [ ] **QC**: Review toàn bộ content — sửa nếu cần trước khi merge
- [ ] **Build verify**: `npx vite build` trước khi commit

---

## 🤝 GHI CHÚ PHỐI HỢP

- ClaudeCode **CHỈ viết content** — không sửa file nào trong lần này
- Mọi thay đổi code/CSS/HTML/SQL → **Antigravity quyết định và thực hiện**
- Nếu Antigravity muốn ClaudeCode viết thêm JS logic (ví dụ: random toast helper, cron function) → tag lại, ClaudeCode sẽ viết
- Antigravity là **QC cuối cùng** — content có thể sửa giọng văn, emoji, câu từ tùy ý

---

*Handoff tạo bởi ClaudeCode — 23/02/2026*
