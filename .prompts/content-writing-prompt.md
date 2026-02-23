# 📝 Prompt: Viết Content Marketing cho Maldala Đông Trùng Hạ Thảo

> **Dùng cho**: Claude Code hoặc bất kỳ AI nào viết content
> **Output**: JSON-ready content để input vào Supabase
> **Lưu ý**: KHÔNG sửa code, KHÔNG sửa SQL. Chỉ viết content thuần.

---

## 🏢 BỐI CẢNH THƯƠNG HIỆU

**Tên**: Maldala Duy Đức (maldalladuyduc)
**Sản phẩm**: Đông Trùng Hạ Thảo viên nang con nhộng — nguyên chất 100%
**Giá**: ~1.450.000₫/hộp (60 viên)
**Liều lượng**: 2 viên/ngày
**Đối tượng**: Người Việt 25-55 tuổi, quan tâm sức khỏe, gia đình
**Giọng điệu**: Gần gũi, ấm áp, tâm lý, không quảng cáo sáo rỗng
**Website**: dong-trung-ha-thao.vercel.app
**SĐT hotline**: 0903.940.171

### Công dụng chính:
- Tăng đề kháng, miễn dịch
- Bồi bổ sức khỏe sau bệnh, sau sinh
- Tỉnh táo, tập trung, giảm mệt mỏi
- Hỗ trợ giấc ngủ sâu
- Làm đẹp da, chống lão hóa
- Tăng cường sinh lý nam nữ

---

## 📋 TASK 1: VIẾT CONTENT PROMOTION POPUP

### Yêu cầu output:
Mỗi promotion cần đúng format JSON sau:

```json
{
  "title": "Tiêu đề ngắn gọn, có sức hút",
  "tagline": "Câu phụ 1 dòng — có emoji ✨",
  "icon": "🔥",
  "program_name": "Tên chương trình",
  "story_html": "Nội dung chính — HTML cho phép <br>, <strong>, <em>. Dẫn dắt tâm lý theo mô hình PROBLEM → BRIDGE → SOLUTION. Tối đa 5 đoạn ngắn.",
  "discount_percent": 5,
  "badge_text": "GIẢM 5%",
  "benefits": [
    {"icon": "⚡", "text": "Lợi ích 1 — ngắn gọn, cụ thể"},
    {"icon": "🌙", "text": "Lợi ích 2"},
    {"icon": "🛡️", "text": "Lợi ích 3"},
    {"icon": "⏳", "text": "Thời hạn áp dụng"}
  ],
  "cta_text": "Nút CTA hấp dẫn — có emoji",
  "cta_note": "*Ghi chú ngắn dưới nút CTA",
  "footer_quote": "\"Câu quote truyền cảm hứng\"",
  "starts_at": "2026-03-01",
  "ends_at": "2026-03-31"
}
```

### Phong cách viết story_html:
1. **Mở bài**: Chạm đúng nỗi đau / tình huống thực tế của khách
2. **Đồng cảm**: Cho thấy bạn hiểu họ
3. **Pivot**: Nhưng khoan... tại sao không...?
4. **Giải pháp**: Đông trùng giải quyết vấn đề một cách nhẹ nhàng
5. **Kết**: Hình ảnh tươi sáng khi dùng sản phẩm

### Ví dụ content đã có (tham khảo giọng văn):
> Bạn ơi, còn nhớ bao nhiêu thứ hẹn "qua Tết đi..." không? 😅
> Tết đã qua rồi — mà deadline thì đang **dí tới mặt**. Mệt. Đuối. Muốn bỏ cuộc.
> Nhưng khoan... **tại sao không biến áp lực này thành cơ hội để tỏa sáng?** 💪
> Đang "đuối đuối" → uống **2 viên Đông Trùng** → *khỏe re, chạy tới đêm không mệt*.

### Gợi ý chủ đề promotion theo mùa:
1. **Tháng 3**: Ngày Quốc tế Phụ nữ 8/3 — tặng mẹ, tặng vợ, tặng chính mình
2. **Tháng 4-5**: Mùa thi cử — con cái cần tỉnh táo, ba mẹ cần năng lượng cổ vũ
3. **Tháng 6**: Hè nóng bức — cơ thể mất sức, đề kháng giảm
4. **Tháng 7**: Vu Lan — hiếu kính cha mẹ, tặng sức khỏe
5. **Tháng 8-9**: Back to work — hết hè ai cũng thấy "đuối"
6. **Tháng 10-11**: Mùa mưa — cảm cúm, đề kháng kém
7. **Tháng 12-1**: Cuối năm deadline + Tết → bứt phá
8. **Quanh năm**: Người hay thức khuya, WFH burnout, freelancer, gym/thể thao

### ⚠️ LƯU Ý:
- KHÔNG dùng từ "chữa bệnh", "trị bệnh" → dùng "hỗ trợ sức khỏe", "bồi bổ"
- KHÔNG cam kết hiệu quả y khoa → dùng "nhiều khách hàng chia sẻ rằng..."
- Giữ giọng văn GẦN GŨI như bạn bè nhắn tin — không quá sales
- Emoji vừa đủ, không spam
- Mỗi promotion nên có 1 insight tâm lý sâu sắc

---

## 📋 TASK 2: VIẾT CONTENT CTV ĐĂNG KÝ

### Bối cảnh CTV:
- CTV = Cộng Tác Viên bán hàng
- Hoa hồng: 10-20% tùy rank (Bronze → Silver → Gold → Diamond)
- Đăng ký miễn phí, không cần vốn
- Chỉ cần chia sẻ link → có đơn → nhận tiền
- Mật khẩu dashboard mặc định = SĐT

### Output cần viết:

#### 2A. Content popup đăng ký CTV
```json
{
  "headline": "Tiêu đề hấp dẫn",
  "subtitle": "Mô tả 1 dòng",
  "rewards": [
    {"icon": "💰", "title": "Tiêu đề reward", "desc": "Mô tả ngắn"},
    {"icon": "📈", "title": "...", "desc": "..."},
    {"icon": "🎁", "title": "...", "desc": "..."}
  ],
  "cta": "Nút CTA",
  "note": "Ghi chú dưới form"
}
```

#### 2B. Content khuyến khích CTV mới (welcome message)
- Tin nhắn chào mừng sau khi đăng ký thành công
- Hướng dẫn 3 bước đầu tiên
- Motivation: "Bạn đã bắt đầu hành trình kiếm thêm thu nhập..."

#### 2C. Content nhắc nhở CTV "im lặng" (chưa có đơn mới)
Viết 3-5 phiên bản tin nhắn nhắc nhở cho CTV đã lâu không có đơn:

```json
[
  {
    "days_inactive": 7,
    "title": "Tiêu đề nhắc nhẹ",
    "message": "Nội dung nhắc nhở ấm áp, không gây áp lực",
    "cta": "Nút hành động"
  },
  {
    "days_inactive": 14,
    "title": "...",
    "message": "Nhắc mạnh hơn, kèm tip bán hàng",
    "cta": "..."
  },
  {
    "days_inactive": 30,
    "title": "...",
    "message": "Khơi lại motivation, cho ví dụ CTV khác đã kiếm được bao nhiêu",
    "cta": "..."
  }
]
```

### Giọng văn CTV content:
- Thân thiện, bình đẳng — CTV là đối tác, không phải nhân viên
- Tập trung vào CƠ HỘI kiếm tiền — không phải nghĩa vụ
- Nhấn mạnh: không cần vốn, không cần kinh nghiệm, làm từ điện thoại
- Dùng số liệu cụ thể khi có thể: "CTV top tháng kiếm 5-10 triệu"
- Tạo FOMO nhẹ: "Nhiều người đã bắt đầu..."

---

## 📋 TASK 3: VIẾT CONTENT TÌNH HUỐNG ĐẶC BIỆT

### 3A. Toast messages (thông báo ngắn trong app)
Viết 5-10 phiên bản cho mỗi tình huống:
- Đăng ký CTV thành công
- Đăng nhập thành công (CTV)
- Đăng nhập thành công (Khách hàng)
- Đặt hàng thành công
- Áp dụng giảm giá thành công

### 3B. Content "Social Proof" popup
- "Anh Minh vừa đặt 3 hộp ở Quận 7" (fake-but-realistic social proof)
- 5-10 phiên bản khác nhau, đa dạng quận/huyện, tên Việt

---

## ⚠️ QUY TẮC QUAN TRỌNG

1. **CHỈ viết content** — output dạng JSON hoặc text thuần
2. **KHÔNG sửa bất kỳ file code nào** (.js, .css, .html, .sql)
3. **KHÔNG chạy migration SQL** — để Antigravity làm
4. **KHÔNG dùng Supabase API trực tiếp** — để Antigravity input
5. Content phải **sẵn sàng copy-paste** vào hệ thống
6. Viết bằng **tiếng Việt**, giữ đúng giọng văn thương hiệu

---

## 📤 CÁCH GỬI OUTPUT

Sau khi viết xong, gửi cho anh Kha review. Anh Kha sẽ gửi lại cho Antigravity để input vào Supabase.

Format gửi:
```
📦 PROMOTION: [tên chương trình]
[paste JSON ở đây]

📦 CTV WELCOME: 
[paste content ở đây]

📦 CTV REMINDER [7 ngày]:
[paste content ở đây]
```

---

*Prompt tạo bởi Antigravity AI — 23/02/2026*
