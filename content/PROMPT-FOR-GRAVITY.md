# PROMPT CHO ANTIGRAVITY — Viết lại trang Câu Chuyện

## Nhiệm vụ
Thay toàn bộ nội dung text trong `cau-chuyen.html` bằng content mới bên dưới. Giữ nguyên CSS, JS, animation system. Thay đổi cấu trúc HTML theo hướng dẫn.

## File cần sửa
- `cau-chuyen.html` — thay toàn bộ content text

## Những thay đổi về cấu trúc

### BỎ:
- **Bỏ pull-stats section** (78%, 40%, 3x) — thay bằng divider `· · ·`
- **Bỏ chương "giá cả"** cũ (Chương 04 cũ về "Tại sao giá chỉ bằng một nửa")
- **Bỏ quote "Thà bán ít..."** sau chương giá cả cũ

### GIỮ NGUYÊN:
- Toàn bộ CSS (design system, colors, typography, animations, responsive)
- JS imports (`tracker.js`, `story-animations.js`)
- Reading progress bar
- Nav structure
- Chapter system (`.chapter`, `.chapter-inner`, `.chapter-opening`, `.quote-block`, `.divider`, `.story-visual`, `.story-cta`)
- Reveal/scroll animations

### THAY ĐỔI:
- **6 chương** thay vì 6 chương cũ (cắt chương giá, thêm chương "Ông Năm thuốc")
- **Opening** mở bằng cảnh cụ thể, không tuyên bố
- **Footer copyright**: đổi thành `Maldalla Duy Đức` (không phải maldalladuyduc)
- **SEO meta description** mới (xem cuối file)

---

## NỘI DUNG MỚI — TỪNG SECTION

---

### OPENING (giữ class `.chapter-opening`)

**Kicker:** `Câu chuyện số một`

**H1:** `2 giờ sáng,` `phòng bệnh tầng 3` ← phần sau bọc `<span class="hl">`

**Lead:** `Ba em nằm nghiêng trên giường bệnh. Mắt nhắm. Nhưng em biết ổng chưa ngủ — vì bàn tay ổng vẫn đang nắm chặt mép chăn, như sợ ai lấy mất.`

**Scroll hint:** `↓ Kéo xuống để đọc`

---

### CHƯƠNG 01 — "2 giờ sáng"

**Chapter number:** `Chương 01`

**H2:** `Mùi nước sát khuẩn và tiếng máy monitor —` `những thứ bạn không bao giờ quên` ← phần đầu (italic) bọc `<span class="hl">`

**Body (mỗi đoạn = 1 thẻ `<p>`):**

Em kể cho bạn nghe chuyện này. Không phải chuyện sản phẩm. Chuyện của em.

Hồi đó, má gọi. Giọng bình thường, không gấp: *"Ba con dạo này yếu quá. Con chở ba đi khám nha."*

"Yếu quá." Má nói nhẹ như kể chuyện hàng xóm. Nhưng khi em chở ba ra phòng khám bằng xe máy, ổng ngồi sau ôm eo em — em mới thấy. Cái eo em hồi xưa ổng ôm không hết. Giờ hai cánh tay ba vòng qua mà **thừa ra.**

Em ghì tay lái chặt hơn. Không phải vì đường xấu. Mà vì em sợ ổng tuột.

Bệnh viện. Lấy số. Chờ. Bác sĩ gọi vào. Ổng nhìn ba em — rồi quay sang nói chuyện với em. Như thể ba không ngồi đó. *"Ổng bị suy nhược. Tuổi tác thôi. Bổ sung dinh dưỡng. Nghỉ ngơi."* Kê đơn. Ký tên. Gọi bệnh nhân kế.

Hai phút. Ba em được quan tâm đúng hai phút.

Đêm đó ba phải ở lại viện theo dõi. Em ngồi trên cái ghế nhựa xanh — loại ghế ai từng nuôi bệnh đều biết, cứng, lạnh, và không thể ngủ — nhìn ba nằm trên giường.

Mùi nước sát khuẩn. Tiếng máy monitor kêu tít... tít... tít... đều đặn. Ánh đèn neon trắng nhợt. Người bệnh giường bên ho suốt đêm.

Ba nằm nghiêng. Mắt nhắm nhưng em biết ổng thức. Vì bàn tay ổng — bàn tay hồi xưa bế em lên cao, hồi xưa sửa cái xe hỏng cho em đi học — **giờ đang nắm chặt mép chăn, run run, gân xanh nổi dưới lớp da mỏng.**

Ổng giấu. Giấu cơn đau. Giấu sự sợ. Giấu tất cả — để con không lo.

Ba em diễn giỏi lắm. Mấy chục năm rồi.

Và khoảnh khắc đó — 2 giờ sáng, phòng bệnh tầng 3, tiếng monitor đều đều — em không sợ ba bệnh.

**Em sợ rằng mình sẽ sống cả đời, bon chen, bận rộn, kiếm tiền — rồi một ngày ngồi trên cái ghế nhựa này, nhìn người mình yêu nằm đó, và nhận ra mình chưa từng làm đủ.**

*(Đoạn cuối cùng in đậm toàn bộ, bọc `<strong>`)*

**[Divider `· · ·` sau chương này]**

---

### CHƯƠNG 02 — "Ông Năm thuốc"

**Chapter number:** `Chương 02`

**H2:** `"10 người bán thì 9 người pha.` `Con mua ngoài, may lắm được ba phần thiệt."` ← phần đầu bọc `<span class="hl">`

**Body:**

Sau đêm đó, em bắt đầu tìm.

Không phải tìm thuốc — bác sĩ đã kê đơn, ba uống đủ. Em tìm thứ khác. Một thứ gì đó có thể **bồi đắp** lại những gì thời gian lấy đi từ cơ thể ba. Từ từ. Nhẹ nhàng. Mỗi ngày một chút.

Em nhớ đến ông Năm — bạn ngoại, ông bác sĩ đông y già mà hồi nhỏ em gọi là "ông Năm thuốc." Ổng hay ngồi uống trà với ngoại ở hiên nhà, mùi thuốc bắc phảng phất. Em lên tìm ổng.

Ổng nghe em kể xong, rót thêm trà, chậm rãi:

*"Trùng Thảo là thứ quý thiệt. Ông biết. Nhưng mà thị trường bây giờ... 10 người bán thì 9 người pha. Con mua ngoài, may lắm được 30% nguyên chất. Phần còn lại là bột gạo, bột bắp, trộn màu cho đẹp."*

Em hỏi: *"Vậy con biết mua ở đâu?"*

Ổng nhìn em. Lắc đầu. Im.

Cái im lặng đó nặng hơn bất kỳ câu trả lời nào.

Em đi khảo thị trường. Mua thử. Hộp 800 ngàn. Hộp triệu rưỡi. Hộp 2 triệu. Mở ra, nhìn, ngửi, so sánh. Ông Năm nói đúng — phần lớn **nhìn giống, nhưng không phải.** Cái ngành này sống nhờ một thứ: người mua không biết phân biệt.

Em ngồi giữa đống hộp, giữa đống thất vọng, và tự hỏi:

*"Nếu không tìm được thứ mình tin — thì sao?"*

Rồi một câu hỏi khác, to hơn, dữ hơn:

*"Hay mình tự làm?"*

**[Divider `· · ·` sau chương này]**

---

### CHƯƠNG 03 — "Phòng nuôi cấy nhỏ hơn phòng ngủ"

**Chapter number:** `Chương 03`

**H2:** `Em không xây xưởng.` `Em xây lời hứa.` ← phần sau bọc `<span class="hl">`

**Body:**

Em nói thật: em không giỏi.

Em không có bằng dược. Không có vốn lớn. Không có quan hệ trong ngành. Em chỉ có một thứ: **cảm giác ngồi trên cái ghế nhựa xanh lúc 2 giờ sáng** — và lời hứa thầm với bản thân rằng em sẽ làm gì đó.

Phòng nuôi cấy đầu tiên — nhỏ hơn cái phòng ngủ. Em tìm đọc tài liệu. Hỏi chuyên gia. Thử. Hỏng. Thử lại. Mẻ đầu tiên chết sạch. Mẻ thứ hai nhiễm khuẩn. Mẻ thứ ba — lên được, nhưng hàm lượng không đạt. Bỏ.

Có những đêm em ngồi nhìn cái tủ nuôi cấy trống rỗng và tự hỏi: *"Mình đang làm cái gì? Ai mà tin mình được?"*

Nhưng rồi em nhìn lọ thuốc trên bàn ba. Cái lọ em mua ngoài tiệm, không biết bên trong thật sự là gì. Và cảm giác đó — cảm giác **đặt một thứ mình không tin vào tay ba mình** — nó đau hơn bất kỳ lần thất bại nào.

Em tiếp tục.

Mẻ thứ bảy — lên. Thật sự lên. Quả thể Cordyceps militaris cam vàng, đều, đẹp, đem kiểm nghiệm — **đạt.** Em ôm cái khay nuôi cấy mà run tay.

Viên nang đầu tiên em đóng xong — em không bán. **Em mang về cho ba.**

**[Story Visual — dùng ảnh `story-lab.jpg` hiện có + badge "Ảnh mẫu"]**
Caption: *Ba uống viên đầu tiên. Không nói gì. Một tháng sau, má gọi: "Ba con dạo này khỏe hơn rồi nha. Sáng đi bộ được rồi."*

*Sáu chữ đó — đáng hơn sáu tháng trầy trật.*

---

### QUOTE sau Chương 03 (dùng class `.quote-block`)

> "Mỗi viên nang em làm ra, em đều tự hỏi: mình có dám cho ba uống không? Nếu em do dự dù chỉ một giây — em bỏ cả mẻ."

**cite:** `— Không phải slogan. Là cách em sống.`

**[Divider `· · ·`]**

---

### CHƯƠNG 04 — "Trông con"

**Chapter number:** `Chương 04`

**H2:** `45 ngày tĩnh lặng —` `vì thiên nhiên không cho phép ai vội` ← phần sau bọc `<span class="hl">`

**Body:**

Bạn có biết nuôi cấy Đông Trùng Hạ Thảo giống gì không?

Giống trông con. Thiệt.

Năm ngày đầu — chọn giống. Như chọn hạt giống tốt nhất cho con. Chỉ giữ lại những bào tử khỏe mạnh. Phần còn lại — bỏ. Không thương tiếc.

35 ngày tiếp — phòng sạch, nhiệt độ ổn định, độ ẩm canh từng phần trăm. Mỗi ngày em vào nhìn. Không làm được gì nhiều. Giống như **ngồi nhìn con ngủ** — bạn không thể bắt nó lớn nhanh hơn. Bạn chỉ có thể giữ cho nó an toàn, và chờ.

5 ngày cuối — thu hoạch. Phải đúng lúc. Sớm một ngày — chưa đủ. Muộn một ngày — đã qua. Cái khoảnh khắc đó không cho phép sai. Giống như **lần đầu con bước đi** — bạn không sắp xếp được, bạn chỉ có thể có mặt đúng lúc.

**[Story Visual — dùng ảnh `process-cultivation.jpg` hiện có + badge "Ảnh mẫu"]**
Caption: *Sấy thăng hoa giữ nguyên dưỡng chất. Nghiền mịn. Đóng viên 500mg. Không pha. Không trộn. Không bảo quản. Không phụ gia.*

Người ta hay hỏi em: *"Sao không làm thêm sản phẩm khác? Thêm trà, thêm mật ong, thêm combo?"*

Em hỏi lại: *"Anh chị nuôi một đứa con — anh chị muốn nuôi cho nó đàng hoàng, hay muốn sinh thêm mười đứa rồi đứa nào cũng thiếu?"*

**Em chọn một sản phẩm. Và em sẽ làm nó tới nơi.**

**[Divider `· · ·`]**

---

### CHƯƠNG 05 — "Những tin nhắn lúc nửa đêm"

**Chapter number:** `Chương 05`

**H2:** `Em không chữa bệnh.` `Nhưng có người nhắn cho em lúc 1 giờ sáng.` ← phần sau bọc `<span class="hl">`

**Body:**

Em nói thẳng điều này — vì em ghét ai nói vòng vo:

Đông Trùng Hạ Thảo là **thực phẩm chức năng.** Không phải thuốc. Em không hứa chữa bệnh. Ai hứa — người đó nói dối bạn.

Nhưng có những tin nhắn mà em nhận lúc nửa đêm. Không phải em xin. Người ta tự gửi.

---

**Chị Hoa, 52 tuổi, Đà Nẵng.**

Chị nhắn Zalo cho em lúc 11 giờ đêm. Đúng ra là con gái chị nhắn, vì chị không rành:

*"Chú ơi cho chị hỏi. Má em uống hộp thứ ba rồi. Dạo này má ngủ được. Mà chú biết không, má em 5 năm không ngủ nổi. Bả nằm đếm ngói trên trần từ 12 giờ đêm tới sáng. Giờ bả gọi cho em, bả khóc. Bả nói: 'Lần đầu tiên... mẹ nằm mơ con à.' Em nghe mà em khóc theo."*

Em đọc tin nhắn đó, 11 giờ đêm, trên điện thoại, trong phòng nuôi cấy. Em không trả lời liền được. Vì em cũng đang khóc.

---

**Anh Minh, 38 tuổi, TP.HCM.**

Anh gọi điện cho em. Giọng ngại ngùng, kiểu đàn ông Việt Nam không quen nói mấy thứ này:

*"Ê, tao nói nghe hơi kỳ nha. Mà... vợ tao hỏi sao dạo này tao khỏe vậy. Tao không biết nói sao. Chỉ biết là... mấy tháng nay tao dậy sớm được. Không phải vì chuông báo thức. Mà vì tao MUỐN dậy. Mày hiểu hông? Lâu lắm rồi tao mới muốn dậy sớm."*

Rồi anh im một hồi. Rồi nói nhỏ:

*"Hồi xưa tao mơ mở cái quán cà phê nhỏ. Giờ tao bắt đầu nghĩ lại. Cũng không xa lắm đâu."*

---

**Bác Tám, 65 tuổi, Cần Thơ.**

Con gái bác gọi cho em, cười:

*"Chú ơi, ba em hồi đầu nói 'mày mua chi mấy thứ vớ vẩn.' Uống cho con vui. Giờ ổng đạp xe ra chợ mỗi sáng. Tuần rồi ổng gọi em, biểu: 'Mày mua thêm cho ba mấy hộp. Gửi cho thím Bảy với chú Chín kế bên luôn. Tụi nó cũng đau mỏi hoài.'"*

*"Em hỏi: Ba ghét mấy thứ này mà?"*

*"Ổng nói: 'Ghét là ghét. Nhưng mà nó thiệt.'"*

---

Đó không phải quảng cáo. Đó là những cuộc gọi, những tin nhắn, lúc nửa đêm, từ những người **mà trước đó — mỗi người đều nói "tôi ổn."**

Cho đến khi họ thật sự ổn. Và nhận ra trước đó, mình chưa bao giờ ổn.

**[Story Visual — emoji 💛]**
Caption: *Sản phẩm tốt nhất không phải thứ bán chạy nhất. Mà là thứ mà khi người ta mua lần hai — họ mua cho người họ thương.*

**[Divider `· · ·`]**

---

### CHƯƠNG CUỐI — "Về nhà"

**Chapter number:** `Chương cuối`

**H2:** `Câu chuyện này` `không phải của em.` ← phần sau bọc `<span class="hl">`

**Body:**

Câu chuyện này là của **bạn.**

Của buổi sáng bạn tỉnh dậy, nằm thêm 5 phút, tự hỏi: *"Mình đang sống — hay đang cố qua ngày?"*

Của khoảnh khắc bạn nhìn ba mẹ — thấy tóc bạc nhiều hơn lần gặp trước, thấy lưng còng hơn mùa trước — và cái gì đó bóp chặt trong ngực, nhưng bạn không nói ra.

Của những đêm nằm trên giường — không bệnh, nhưng cũng không khỏe. Mắt mở. Đầu nghĩ. Về cái quán nhỏ muốn mở mà hoãn mãi. Về chuyến đi muốn đưa mẹ đi một lần mà chưa bao giờ sắp xếp được. Về buổi chiều muốn ra công viên chạy bộ cùng con mà không phải dừng lại thở.

Bạn hoãn không phải vì lười. Không phải vì không muốn. Mà vì mỗi ngày, **cơ thể đã dùng hết sức chỉ để "bình thường"** — và không còn gì để đi xa hơn.

Em không hứa viên nang của em sẽ giúp bạn mở quán, đưa mẹ đi du lịch, hay chạy bộ 5km.

Nhưng em hứa một thứ nhỏ hơn, thật hơn:

**Một tháng.** Một viên mỗi ngày. Để cơ thể bạn có cơ hội nói thật với bạn — thay vì cả hai cùng giả vờ ổn.

Nếu sau 30 ngày bạn không thấy gì khác — không sao. Em vẫn biết ơn. Vì bạn đã tin em đủ để thử.

Nhưng nếu một buổi sáng, bạn tỉnh dậy, và lần đầu tiên sau rất lâu — bạn **muốn** dậy...

...thì bạn sẽ hiểu vì sao em làm tất cả những điều này.

*Không phải vì em giỏi. Mà vì em đã ngồi trên cái ghế nhựa xanh đó rồi. Và em không muốn ai phải ngồi đó mà tay trắng.*

---

### CTA SECTION (giữ class `.story-cta`)

**H2:** `Bạn đã đọc đến đây.`

**Sub:** `Vậy thì — đây không phải chỗ để em thuyết phục bạn. Đây là chỗ để bạn tự quyết định.`

**Button 1 (Gold, link → `/#contact`):** `Đặt Hàng — Thử 30 Ngày`
**Button 2 (Outline, link → `/chia-se.html`):** `Đọc Thêm Chia Sẻ Từ Thành Viên`

---

### FOOTER

`© 2026 Maldalla Duy Đức — Một sản phẩm. Một lời hứa. Một con đường về nhà.`

---

### SEO META TAGS — cập nhật

```html
<meta name="description" content="2 giờ sáng, phòng bệnh tầng 3. Ba nằm nghiêng, giấu cơn đau để con không lo. Đó là đêm thay đổi mọi thứ." />
<meta property="og:description" content="Câu chuyện bắt đầu từ một đêm ngồi cạnh giường bệnh ba. Không phải tìm thuốc — mà tìm một thứ đủ tử tế để đặt vào tay người mình thương." />
```

---

## QUY TẮC QUAN TRỌNG

1. **Xưng "em" 100%** — KHÔNG dùng "chúng tôi" ở bất kỳ đâu trong bài
2. **Giọng miền Nam nhẹ**: ổng, bả, thiệt, đàng hoàng — giữ nguyên, KHÔNG sửa thành giọng Bắc
3. **Testimonials giữ giọng vùng miền**: mỗi người nói khác nhau (Đà Nẵng, SG, Cần Thơ)
4. **Ảnh**: Giữ `story-lab.jpg` và `process-cultivation.jpg` hiện có, kèm badge "Ảnh mẫu"
5. **Sản phẩm KHÔNG được nhắc tên** trước Chương 03 — hai chương đầu hoàn toàn là cảm xúc
6. **Motifs xuyên suốt** (không label, để người đọc tự cảm):
   - Chiếc ghế nhựa xanh — xuất hiện ở Ch01 và Chương cuối
   - Bàn tay ba — gầy, run, nắm chăn
   - "Tôi ổn" — mặt nạ
   - "Muốn dậy" — thước đo sức khỏe thật
7. **In đậm / in nghiêng** theo đúng markdown trong content: `**bold**` = `<strong>`, `*italic*` = `<em>`
8. Tuân thủ CLAUDE.md: không inline styles, dùng CSS variables, semantic HTML
