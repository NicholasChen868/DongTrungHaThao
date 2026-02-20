# 🤖 ClaudeCode Mission Briefing — Phase 2+3
> Copy prompt bên dưới vào ClaudeCode terminal

---

## PROMPT (copy từ đây):

```
Bạn đang phối hợp với Antigravity AI (agent khác) trên project DongTrungHaThao.

## PHÂN CÔNG RÕ RÀNG — KHÔNG CHẠM FILE CỦA NHAU:

### BẠN (ClaudeCode) xử lý:
- src/utils/*.js (đã tạo sanitize.js + ratelimit.js)
- Tạo mới: tests/*, vitest.config.js, .github/*, vercel.json, .env.example
- Refactor: admin.html (tách JS → src/admin.js, integrate RPC functions mới)
- Refactor: src/main.js (integrate sanitize + ratelimit)
- Refactor: src/ctv.js (integrate sanitize + ratelimit)

### ANTIGRAVITY đang xử lý (KHÔNG CHẠM):
- cau-chuyen.html, chia-se.html, tra-cuu.html, thanh-vien.html (trang mới)
- src/style.css
- TASKS.md, REVIEW.md

## QC REPORT TỪ ANTIGRAVITY:

Phase 1 đã apply RPC functions lên Supabase (19 functions online). Nhưng:
1. ⚠️ admin.html CHƯA dùng RPC mới — vẫn gọi supabase.from() trực tiếp
2. ⚠️ sanitize.js + ratelimit.js CHƯA được import vào trang nào
3. ⚠️ RLS DROP POLICY statements chưa chạy (phần cuối 005_tighten_rls.sql)

## NHIỆM VỤ CỤ THỂ:

### TASK 1: Integrate security utils vào frontend (ƯU TIÊN CAO)
- Import escapeHTML từ src/utils/sanitize.js vào src/main.js tại mọi chỗ dùng innerHTML với user input
- Import checkRateLimit, recordAttempt từ src/utils/ratelimit.js vào:
  + src/main.js: form đặt hàng (key: 'order', max: 3, window: 60000)
  + src/ctv.js: đăng ký CTV (key: 'ctv_register', max: 3, window: 60000)
- Apply escapeHTML cho: customer_name, address, note trong order form rendering
- Apply escapeHTML cho: CTV name, phone khi render trong dashboard

### TASK 2: Refactor admin.html → dùng RPC functions
- Thay supabase.from('orders').select() → supabase.rpc('admin_list_orders', { p_admin_hash: adminHash })
- Thay supabase.from('orders').update() → supabase.rpc('admin_update_order_status', { p_admin_hash: adminHash, p_order_id: id, p_status: status })
- Thay supabase.from('member_posts').select() → supabase.rpc('admin_list_posts', { p_admin_hash: adminHash })
- Thay supabase.from('member_posts').update() → supabase.rpc('admin_update_post_status', { p_admin_hash: adminHash, p_post_id: id, p_approve: bool })
- Thay supabase.from('ctv_accounts').select() → supabase.rpc('admin_list_ctv', { p_admin_hash: adminHash })
- Thay loadAnalytics → supabase.rpc('admin_get_analytics', { p_admin_hash: adminHash })
- Lưu adminHash vào variable sau khi login thành công

### TASK 3: Setup Testing (Vitest)
- npm install -D vitest @testing-library/dom jsdom
- Tạo vitest.config.js:
  ```js
  import { defineConfig } from 'vitest/config';
  export default defineConfig({
    test: { environment: 'jsdom' }
  });
  ```
- Tạo tests/:
  + tests/sanitize.test.js — test escapeHTML với các XSS vectors
  + tests/ratelimit.test.js — test checkRateLimit logic
  + tests/order-validation.test.js — test price calculation, phone validation
- Thêm vào package.json: "test": "vitest run", "test:watch": "vitest"

### TASK 4: CI/CD + Headers
- Tạo vercel.json:
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      },
      {
        "source": "/admin.html",
        "headers": [
          { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
        ]
      }
    ]
  }
  ```
- Tạo .env.example (KHÔNG chứa key thật):
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```

### TASK 5: Tạo .github/workflows/test.yml
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## QUY TẮC:
1. Luôn `git pull origin main` trước khi bắt đầu
2. Commit message có emoji prefix, viết chi tiết
3. KHÔNG sửa: cau-chuyen.html, chia-se.html, tra-cuu.html, thanh-vien.html, TASKS.md, REVIEW.md
4. Chạy `npx vite build` sau mỗi thay đổi để verify
5. Push lên main khi hoàn thành mỗi task

Bắt đầu từ TASK 1 → TASK 2 → TASK 3 → TASK 4 → TASK 5 theo thứ tự.
```
