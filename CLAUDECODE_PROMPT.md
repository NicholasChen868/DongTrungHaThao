# 🤖 ClaudeCode Mission Briefing — Phase 4: UX Excellence + CTV Registration + Dynamic Content

> Copy prompt bên dưới vào ClaudeCode terminal

---

## PROMPT (copy từ đây):

```
Bạn đang phối hợp với Antigravity AI trên project DongTrungHaThao.

## CONTEXT HIỆN TẠI:
- 23 RPC functions online trên Supabase
- site_settings table chứa dynamic config (pricing, hero, contact, ctv, announcement)
- 39/39 tests pass, CI/CD active, security headers deployed
- Admin panel có 9 sections bao gồm Settings Center mới

## PHÂN CÔNG — KHÔNG CHẠM FILE CỦA NHAU:

### BẠN (ClaudeCode) xử lý:
- src/main.js (logic đặt hàng, dynamic pricing)
- src/ctv.js (thêm tính năng đăng ký CTV) 
- ctv-dashboard.html (thêm form đăng ký)
- admin.html (JS logic only — KHÔNG đổi HTML structure)

### ANTIGRAVITY đang xử lý (KHÔNG CHẠM):
- index.html (đã cập nhật footer)
- cau-chuyen.html, chia-se.html, tra-cuu.html, thanh-vien.html
- src/style.css, src/utils/*

## NHIỆM VỤ CỤ THỂ:

### TASK 1: 🔥 CTV Registration (ƯU TIÊN CAO NHẤT)
Hiện tại ctv-dashboard.html CHỈ CÓ đăng nhập, CHƯA CÓ đăng ký mới.

Cần thêm:
1. Trong ctv-dashboard.html, thêm tab "Đăng Ký" bên cạnh "Đăng Nhập":
   - Form fields: Họ tên, SĐT, Email, Mật khẩu, Mã giới thiệu (optional)
   - Validation: SĐT VN 10 số bắt đầu bằng 0, mật khẩu >= 6 ký tự
   - Rate limit: dùng createSubmitGuard(10000)

2. Tạo RPC function mới trong supabase/migrations/009_ctv_register.sql:
```sql
CREATE OR REPLACE FUNCTION register_ctv(
    p_name TEXT, p_phone TEXT, p_email TEXT, 
    p_password_hash TEXT, p_referrer_code TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    new_ref_code TEXT;
    result JSON;
BEGIN
    -- Check phone exists
    IF EXISTS (SELECT 1 FROM ctv_accounts WHERE phone = p_phone) THEN
        RAISE EXCEPTION 'Số điện thoại đã được đăng ký';
    END IF;
    
    -- Generate referral code
    new_ref_code := 'CTV' || LPAD(FLOOR(RANDOM() * 999999)::text, 6, '0');
    
    -- Insert
    INSERT INTO ctv_accounts (name, phone, email, password_hash, referral_code, tier, total_points)
    VALUES (p_name, p_phone, NULLIF(p_email, ''), p_password_hash, new_ref_code, 'silver', 0)
    RETURNING json_build_object(
        'id', id, 'name', name, 'phone', phone, 
        'referral_code', referral_code, 'tier', tier
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. Trong src/ctv.js, thêm hàm handleCTVRegister gọi RPC register_ctv

### TASK 2: Dynamic Pricing từ Backend
Hiện tại src/main.js hardcode UNIT_PRICE = 850000 và DISCOUNTS.

Cần thay đổi:
1. Khi trang load, gọi `supabase.rpc('get_product_pricing')` để lấy giá
2. Dùng giá từ backend thay vì hardcode
3. Fallback: nếu API fail, dùng giá cứng 850000
4. Code mẫu:

```javascript
let PRICING = {
    unit_price: 850000,
    discounts: { 1: 0, 2: 0, 3: 5, 5: 10, 10: 15 },
    free_shipping_min: 3
};

// Load từ backend
async function loadPricing() {
    try {
        const { data } = await supabase.rpc('get_product_pricing');
        if (data) PRICING = data;
    } catch (e) { console.warn('Dùng giá mặc định'); }
}
loadPricing();
```

5. Cập nhật hàm calculateOrder dùng PRICING thay vì constants

### TASK 3: UX Flow — "Hành Trình Không Bao Giờ Có Đường Cụt"
Lấy cảm hứng từ: AG1.com, iHerb, Moon Juice — health product sites hàng đầu.

Nguyên tắc: MỌI trang đều dẫn đến trang khác. Không bao giờ "dead end".

Trong src/main.js, sau khi đặt hàng thành công:
- Toast kèm 2 link: "📦 Tra cứu đơn" + "💛 Thành viên"
- Scroll mượt về đầu trang

Trong src/ctv.js:
- Sau đăng ký CTV thành công → hiện link đến "/chia-se.html" (viết bài chia sẻ)
- Sau login → nếu có referral_code → copy button + share

### TASK 4: Page View Tracker cho index.html
Thêm import tracker vào src/main.js:
```javascript
import './utils/tracker.js';
```
(File tracker.js đã tạo sẵn, auto-track khi import)

## QUY TẮC:
1. Luôn `git pull origin main` trước khi bắt đầu
2. Commit message có emoji prefix, viết chi tiết tiếng Việt
3. KHÔNG sửa: index.html, cau-chuyen.html, chia-se.html, tra-cuu.html, thanh-vien.html
4. Chạy `npx vite build` sau mỗi thay đổi để verify
5. Push lên main khi hoàn thành

QUAN TRỌNG: Trang web phải toát lên sự TRONG SÁNG, RÕ RÀNG, MINH BẠCH như các trang sức khỏe hàng đầu (AG1, iHerb). Mọi hành trình của khách hàng phải LIÊN TỤC — không có dead end.

Bắt đầu từ TASK 1 → TASK 2 → TASK 3 → TASK 4 theo thứ tự.
```
