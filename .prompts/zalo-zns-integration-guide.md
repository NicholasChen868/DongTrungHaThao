# Hướng Dẫn Tích Hợp Zalo ZNS — Thông Báo Đơn Hàng & CTV

> **Mục tiêu**: Khi có đơn hàng mới hoặc CTV đăng ký → gửi tin nhắn Zalo tự động tới:
> 1. **Khách hàng** — xác nhận đơn, tracking
> 2. **Bố (admin)** — thông báo có đơn mới / CTV mới
> 3. **CTV** — duyệt CTV, thông báo có đơn qua ref link

---

## TL;DR — Tổng quan luồng

```
Khách đặt hàng → Supabase INSERT → Edge Function trigger
                                      ↓
                              Zalo ZNS API → Gửi tin nhắn Zalo
                                      ↓
                              ┌───────────────────┐
                              │ Khách: "Đơn #123  │
                              │ đã được ghi nhận" │
                              ├───────────────────┤
                              │ Bố: "Có đơn mới!  │
                              │ Anh Minh - 3 hộp" │
                              └───────────────────┘
```

---

## PHẦN 1: ANH LÀM (Setup Zalo OA + ZNS) ⏱️ ~30 phút

### Bước 1.1: Tạo Zalo Official Account (OA) — MIỄN PHÍ

1. Truy cập: **https://oa.zalo.me**
2. Đăng nhập bằng Zalo cá nhân của Bố (hoặc anh)
3. Nhấn **"Tạo Official Account"**
4. Chọn loại: **Cửa hàng / Doanh nghiệp**
5. Điền thông tin:
   - Tên OA: `Mal Dalla Duy Đức` hoặc `Đông Trùng Hạ Thảo Mal Dalla`
   - Mô tả: "Đông Trùng Hạ Thảo nguyên chất — 15 năm uy tín"
   - Ảnh đại diện: logo công ty
   - Danh mục: "Sức khỏe & Làm đẹp"

### Bước 1.2: Xác minh OA (bắt buộc để gửi ZNS)

1. Mở OA Admin → **Cài đặt** → **Xác minh OA**
2. Chuẩn bị giấy tờ:
   - ✅ Giấy phép kinh doanh (GPKD) hoặc GCN ĐKKD
   - ✅ CCCD/CMND người đại diện
   - ✅ Ảnh biển hiệu hoặc website (dongtrunghathaomaldalla.com)
3. Upload giấy tờ → Gửi xác minh
4. **Chờ duyệt: 3-7 ngày làm việc**

> ⚠️ **KHÔNG THỂ GỬI ZNS NẾU CHƯA XÁC MINH OA**

### Bước 1.3: Tạo Zalo Cloud Account (ZCA) — Nạp tiền

1. Truy cập: **https://account.zalo.cloud**
2. Đăng nhập cùng tài khoản Zalo
3. Liên kết với OA vừa tạo
4. **Nạp tiền** (tối thiểu ~200.000đ để test):
   - Giá ZNS: **200-300đ/tin nhắn** (tùy template)
   - Ước tính: 100 đơn/tháng × 2 tin (khách + admin) = ~60.000đ/tháng

### Bước 1.4: Tạo App trên Zalo Developer

1. Truy cập: **https://developers.zalo.me**
2. **Tạo ứng dụng mới**:
   - Tên: `MalDalla Notifications`
   - Loại: `Doanh nghiệp / Business`
3. Sau khi tạo, ghi lại:
   - **App ID**: `xxxxxxxxxxxxxxx`
   - **Secret Key**: `xxxxxxxxxxxxxxx`
4. Vào tab **Zalo OA** → Liên kết OA đã tạo ở bước 1.1
5. Vào tab **Sản phẩm** → Bật **ZNS (Notification Service)**

### Bước 1.5: Tạo & Đăng Ký Template ZNS

Vào **ZNS Console** (https://account.zalo.cloud → ZNS) → **Tạo template**

#### Template 1: Xác nhận đơn hàng (gửi cho khách)
```
Tên: Xac nhan don hang
Loại: Giao dịch (Transactional)
Nội dung:
---
Xin chào {ten_khach}!

Đơn hàng #{ma_don} đã được ghi nhận.

• Sản phẩm: {san_pham}
• Số lượng: {so_luong} hộp
• Tổng tiền: {tong_tien}
• Thanh toán: {phuong_thuc}

Chúng tôi sẽ liên hệ xác nhận trong 30 phút.
Hotline: 0903.940.171

Mal Dalla Duy Đức — 15 năm uy tín
---
Nút CTA: [Tra cứu đơn hàng] → https://dongtrunghathaomaldalla.com/tra-cuu.html
```

#### Template 2: Thông báo admin (gửi cho Bố)
```
Tên: Thong bao don moi
Loại: Giao dịch (Transactional)
Nội dung:
---
ĐƠN HÀNG MỚI #{ma_don}

Khách: {ten_khach}
SĐT: {sdt_khach}
Địa chỉ: {dia_chi}
Sản phẩm: {so_luong} hộp
Tổng: {tong_tien}
Thanh toán: {phuong_thuc}
CTV: {ctv_code}

Thời gian: {thoi_gian}
---
Nút CTA: [Mở Admin] → https://dongtrunghathaomaldalla.com/admin.html
```

#### Template 3: Duyệt CTV (gửi cho CTV)
```
Tên: Duyet CTV
Loại: Giao dịch
Nội dung:
---
Xin chào {ten_ctv}!

Tài khoản Cộng Tác Viên của bạn đã được duyệt.

Mã giới thiệu: {ma_ctv}
Chiết khấu: 10-20% mỗi đơn

Bắt đầu chia sẻ link ngay tại Dashboard.

Mal Dalla Duy Đức
---
Nút CTA: [Mở Dashboard CTV] → https://dongtrunghathaomaldalla.com/ctv-dashboard.html
```

5. **Gửi duyệt template** → Zalo review trong 1-3 ngày
6. Sau khi duyệt → ghi lại **Template ID** của từng template

### Bước 1.6: Lấy Refresh Token (1 lần duy nhất)

1. Truy cập: `https://developers.zalo.me/tools/explorer/{APP_ID}`
2. Chọn OA đã liên kết
3. Tick quyền: `send_message`, `send_zns`
4. Nhấn **"Lấy mã"** → Copy **Authorization Code**
5. Gửi **Authorization Code** cho em (hoặc tự chạy curl bên dưới)

```bash
curl -X POST 'https://oauth.zaloapp.com/v4/oa/access_token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'secret_key: YOUR_SECRET_KEY' \
  -d 'code=YOUR_AUTH_CODE&app_id=YOUR_APP_ID&grant_type=authorization_code'
```

Response sẽ có:
```json
{
  "access_token": "...",     // hết hạn sau 24h
  "refresh_token": "...",    // dùng để renew, hết hạn 90 ngày
  "expires_in": "..."
}
```

**GỬI CHO EM**: `refresh_token`, `app_id`, `secret_key`, và 3 **template_id**

---

## PHẦN 2: EM LÀM (Code Integration) 🔧

### Bước 2.1: Lưu secrets vào Supabase

Em sẽ tạo Supabase Edge Function để:
- Tự động refresh access_token khi hết hạn (24h)
- Gọi Zalo ZNS API khi có đơn hàng mới
- Gọi Zalo ZNS API khi CTV được duyệt

### Bước 2.2: Edge Function — zalo-notify

```typescript
// supabase/functions/zalo-notify/index.ts
// Em sẽ code function này sau khi anh cung cấp credentials
```

Chức năng:
1. **Webhook trigger** — khi INSERT/UPDATE vào bảng `orders` hoặc `ctv_profiles`
2. **Auto-refresh token** — lưu access_token trong Supabase Vault
3. **Gửi ZNS** — format data theo template → POST tới Zalo API
4. **Fallback** — nếu ZNS fail → ghi log, không ảnh hưởng đơn hàng

### Bước 2.3: Database trigger

```sql
-- Khi có đơn mới → gọi Edge Function
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Gọi Edge Function qua pg_net (hoặc webhook)
    PERFORM net.http_post(
        'https://lfwihaamswskmospcqfo.supabase.co/functions/v1/zalo-notify',
        jsonb_build_object(
            'type', 'new_order',
            'order_id', NEW.id,
            'customer_name', NEW.customer_name,
            'customer_phone', NEW.customer_phone,
            'quantity', NEW.quantity,
            'total', NEW.total_amount,
            'order_code', NEW.order_code
        ),
        '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## PHẦN 3: CHI PHÍ ƯỚC TÍNH

| Mục | Chi phí |
|-----|---------|
| Tạo OA | Miễn phí |
| Xác minh OA | Miễn phí |
| Tạo App Developer | Miễn phí |
| ZNS/tin nhắn | ~200-300đ/tin |
| 100 đơn/tháng × 2 tin | ~60.000đ/tháng |
| 500 đơn/tháng × 2 tin | ~300.000đ/tháng |

**→ Rẻ hơn SMS nhiều** (SMS: 350-500đ/tin)

---

## TIMELINE

```
Ngày 1 (anh):  Tạo OA + nộp xác minh + tạo App + nạp tiền
Ngày 2-7:      Chờ Zalo duyệt OA (3-7 ngày)
Ngày 7 (anh):  Tạo 3 template ZNS + gửi duyệt
Ngày 8-10:     Chờ duyệt template (1-3 ngày)
Ngày 10 (anh): Lấy refresh_token, gửi credentials cho em
Ngày 10 (em):  Code Edge Function + DB trigger + test
Ngày 11:       Go live! 🚀
```

---

## LƯU Ý QUAN TRỌNG

1. **SĐT khách phải có Zalo** — nếu không có Zalo, tin nhắn không gửi được (nhưng 95% người VN dùng Zalo)
2. **Template phải được duyệt** — không thể gửi nội dung tự do, phải theo template
3. **Refresh token hết hạn 90 ngày** — em sẽ code auto-renew
4. **Consent**: Khách đồng ý nhận tin khi điền form đặt hàng (thêm checkbox nếu cần)
5. **Rate limit**: ZNS có giới hạn gửi/phút — nhưng với lượng đơn của mình không lo

---

*Tạo: 23/02/2026 — Antigravity*
