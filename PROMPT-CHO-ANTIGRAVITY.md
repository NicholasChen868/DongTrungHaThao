# PROMPT GỬI CHO ANTIGRAVITY — Phối hợp tiếp từ ClaudeCode

> **Copy toàn bộ nội dung này gửi cho Antigravity trong 1 message.**

---

## Antigravity ơi, ClaudeCode vừa hoàn thành content writing. Anh gửi cho em thực thi nhé.

### 📋 TÌNH HÌNH HIỆN TẠI

ClaudeCode đã viết xong 2 file content, đã commit vào branch `claudecode/serene-lichterman`:

1. **`CONTENT-REWRITE-V2.md`** — Viết lại TOÀN BỘ nội dung website
2. **`ANTIGRAVITY-HANDOFF-CONTENT.md`** — SQL migrations + JSON data sẵn sàng

**Không có file code nào bị sửa.** ClaudeCode chỉ viết content thuần — phần thực thi HTML/CSS/SQL là của em (Antigravity).

---

### 🎯 NHIỆM VỤ CỦA EM (Antigravity)

Đọc kỹ file `CONTENT-REWRITE-V2.md` và thực hiện theo thứ tự ưu tiên:

#### Ưu tiên 1 — CTA & Giọng văn (ảnh hưởng lớn nhất đến conversion)
- [ ] Đổi **tất cả CTA buttons** sang ngôi thứ nhất (chi tiết trong file)
  - Hero: "Đặt Hàng Ngay" → "Cho Bản Thân Cơ Hội — Thử 30 Ngày"
  - Product: "Đặt Mua" → "Tôi Sẵn Sàng"
  - CTA Journey: "Bắt Đầu Hành Trình" → "Cho Bản Thân 30 Ngày — Tôi Sẵn Sàng"
  - Order form: "Xác Nhận Đặt Hàng" → "Gửi Đơn — Tôi Sẵn Sàng Khỏe Thật"
- [ ] Đổi **CTV popup tiêu đề** từ "Kiếm Tiền Cùng Maldala" → "Đồng Hành Lan Tỏa Sức Khỏe"
- [ ] Đổi **CTV popup rewards** — lead với giá trị, không lead với tiền (xem file)

#### Ưu tiên 2 — Content sections (TRÍ LỰC + THỂ LỰC)
- [ ] Đổi **hero subtitle**: "Một viên mỗi sáng — tỉnh táo hơn, bền bỉ hơn, sống trọn vẹn hơn."
- [ ] Đổi **About section**: title + subtitle + chia benefits thành 2 cột TRÍ LỰC / THỂ LỰC (JSON sẵn trong file)
- [ ] Đổi **Testimonials title**: "Họ Không Nói 'Thay Đổi Cuộc Đời.' Họ Nói: 'Sáng Dậy Nhẹ Hơn.'"
- [ ] Đổi **CTA Journey section**: thêm timeline 30 ngày cụ thể
- [ ] Đổi **Footer tagline**: "Mỗi viên nang là một lời hứa..."
- [ ] Đổi **Hero stats labels**: "Đối tác đồng hành" (thay "Cộng tác viên"), "Năm tâm huyết" (thay "Năm hoạt động")

#### Ưu tiên 3 — Database (Promotions)
- [ ] Tạo migration `022_seed_promotions_q1q2.sql` — SQL INSERT sẵn trong file `ANTIGRAVITY-HANDOFF-CONTENT.md`
- [ ] 3 promotions: 8/3 (giảm 8%), Mùa Thi (giảm 5%), Vu Lan (giảm 10%)
- [ ] Chạy migration trên Supabase

#### Ưu tiên 4 — JS Updates (Toast + Social Proof)
- [ ] Tạo hoặc cập nhật toast variants — mảng messages mới trong file
- [ ] Cập nhật `src/modules/social-proof.js` — templates + customer quotes mới

#### Ưu tiên 5 — CTV System (nếu có thời gian)
- [ ] CTV Welcome trigger/message — content sẵn trong file
- [ ] CTV Reminder system — 4 mốc 7/14/30/60 ngày

---

### ⚠️ NHỮNG GÌ KHÔNG ĐỔI

- **Trang Câu Chuyện** (`cau-chuyen.html`) — TUYỆT VỜI, giữ nguyên từng chữ
- **Gallery section** tags & captions — rất tốt rồi
- **Process section** — tốt rồi
- **SEO meta tags** — giữ nguyên (CLAUDE.md quy định)
- **Footer disclaimer ATTP** — bắt buộc giữ
- **Ảnh thật** — KHÔNG thay thế

---

### 🔑 NGUYÊN TẮC XUYÊN SUỐT (từ Content Bible)

1. **CTA = ngôi thứ nhất, empowering**: "Tôi muốn...", "Cho mình...", "Tôi sẵn sàng..."
2. **2 giá trị cốt lõi** phải hiện diện: 🧠 TRÍ LỰC + 💪 THỂ LỰC
3. **Cụ thể, không sáo rỗng**: "giấc ngủ sâu hơn" ✅ — "thay đổi cuộc sống" ❌
4. **CTV = đồng hành, lan tỏa** — KHÔNG "kiếm tiền", "bán hàng"
5. **KHÔNG dùng**: "chữa bệnh", "trị bệnh", "thần dược", "kỳ diệu"
6. **Emoji vừa đủ**: max 2-3 per đoạn, đúng chỗ

---

### 📂 FILES CẦN ĐỌC

```
CONTENT-REWRITE-V2.md           ← Nội dung website viết lại (CHÍNH)
ANTIGRAVITY-HANDOFF-CONTENT.md  ← SQL migrations + JSON data
.prompts/content-writing-prompt.md ← Content Bible (đã đọc)
```

---

### 🤝 PHỐI HỢP TIẾP

- Nếu em (Antigravity) cần ClaudeCode viết thêm JS logic (random toast helper, cron function, v.v.) → tag lại, ClaudeCode sẽ viết
- Nếu em thấy content cần sửa giọng văn → em là QC cuối cùng, sửa thoải mái
- Sau khi thực thi xong → em `npx vite build` verify trước khi commit
- Em quyết định merge hay reject — theo CLAUDE.md

**Một lưu ý cuối**: Đây là món quà anh Kha làm tặng Bố — 15 năm kinh doanh truyền miệng chưa bao giờ có website. Mình làm cho xứng đáng nhé. 💛

---

*Prompt phối hợp — ClaudeCode gửi Antigravity — 23/02/2026*
