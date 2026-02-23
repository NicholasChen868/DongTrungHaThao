# 🧪 Sprint B: Testing — Prompt cho ClaudeCode

## Bối cảnh dự án

Đây là dự án **Đông Trùng Hạ Thảo**, website bán ĐTHT + hệ thống CTV (Cộng Tác Viên).
Vừa hoàn thành **Sprint A (Refactor 6/6 tasks)** — tách monolith HTML/CSS/JS thành modules.

### Tech stack
- **Build**: Vite 7.x
- **Test**: Vitest 4.x + jsdom + @testing-library/dom
- **Backend**: Supabase (PostgreSQL + Auth + RPC)
- **Frontend**: Vanilla JS (ES modules), no framework
- **Package manager**: npm

### Cấu trúc thư mục hiện tại
```
src/
├── main.js          — Entry point (~130 dòng, imports + init)
├── auth.js          — Unified auth (437 dòng): login, session, role-based menu
├── auth.css         — Auth CSS (tách riêng)
├── ctv.js           — CTV system (301 dòng): ref tracking, register, dashboard
├── data.js          — Supabase data fetching (200 dòng)
├── supabase.js      — Supabase client init
├── utils/
│   ├── sanitize.js  — escapeHTML(), escapeCSS()
│   ├── ratelimit.js — checkRateLimit(), recordAttempt(), createSubmitGuard()
│   ├── ngu-hanh.js  — Ngũ Hành analysis (245 dòng): analyzeNguHanh(), getHealthMap()
│   └── tracker.js   — Page view tracker (43 dòng): trackPageView()
├── modules/
│   ├── animations.js        — initScrollAnimations, initCountUp, initHeroParticles
│   ├── render-sections.js   — renderBenefits, renderProcess, renderProduct, etc.
│   ├── testimonials.js      — renderTestimonials, initTestimonialsSwiper, initGallerySwiper
│   ├── order-form.js        — initOrderForm, initQuantitySelector, initPaymentModal, initCtvForm
│   ├── returning-customer.js — initReturningCustomer
│   ├── reorder-reminder.js  — initReorderReminder
│   ├── floating-buttons.js  — initFloatingOrderBtn, initContactWidget
│   └── social-proof.js     — initSocialProof
├── css/
│   ├── base.css, navbar.css, hero.css, sections.css
│   ├── contact.css, responsive.css, components.css
│   └── (imported via style.css)
├── admin.js         — Admin dashboard logic
├── admin.css
├── ctv-dashboard.js — CTV dashboard logic
└── ctv-dashboard.css

tests/                    ← hiện có 3 files
├── sanitize.test.js      ← 94 dòng, 15 tests (escapeHTML + escapeCSS)
├── ratelimit.test.js     ← 99 dòng, 8 tests (checkRateLimit + createSubmitGuard)
└── order-validation.test.js ← 94 dòng, 9 tests (calculateOrder + validatePhone)

vite.config.js            ← không có test config, vitest dùng default
package.json scripts:
  "test": "vitest run"
  "test:watch": "vitest"
```

---

## Nhiệm vụ: Hoàn thành Sprint B (B1 → B5)

### B1. Hoàn thiện Vitest setup

1. **Tạo `vitest.config.js`** (hoặc thêm `test` block vào `vite.config.js`):
   ```js
   test: {
     environment: 'jsdom',
     globals: true,
     coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
     setupFiles: ['./tests/setup.js'],
   }
   ```

2. **Tạo `tests/setup.js`** — mock globals:
   - Mock `localStorage` (đã work vì jsdom, nhưng cần clear mỗi test)
   - Mock `sessionStorage`
   - Mock `supabase` client → tạo `tests/mocks/supabase.js`:
     ```js
     export const supabase = {
       from: vi.fn(() => ({ insert: vi.fn(), select: vi.fn(), ... })),
       rpc: vi.fn(),
       auth: { signInWithPassword: vi.fn(), signOut: vi.fn(), getSession: vi.fn() },
     };
     ```
   - Dùng `vi.mock('../src/supabase.js', ...)` trong setup

3. **Tổ chức thư mục test**:
   ```
   tests/
   ├── setup.js
   ├── mocks/
   │   └── supabase.js
   ├── unit/
   │   ├── sanitize.test.js      ← move từ tests/
   │   ├── ratelimit.test.js     ← move từ tests/
   │   ├── order-validation.test.js ← move từ tests/
   │   ├── auth.test.js          ← MỚI
   │   ├── ngu-hanh.test.js      ← MỚI
   │   ├── ctv.test.js           ← MỚI
   │   └── tracker.test.js       ← MỚI
   └── integration/
       ├── order-flow.test.js    ← MỚI
       └── ctv-flow.test.js      ← MỚI
   ```

4. **Thêm npm scripts** vào `package.json`:
   ```json
   "test:coverage": "vitest run --coverage",
   "test:unit": "vitest run tests/unit/",
   "test:integration": "vitest run tests/integration/"
   ```

### B2. Unit tests — Mở rộng từ 3 → 15+ test files

⚠️ **Lưu ý quan trọng**: 3 test files hiện có đã work và pass. KHÔNG sửa chúng, chỉ move vào `tests/unit/` và cập nhật import paths.

#### B2.1 `tests/unit/auth.test.js` — Auth module
Test các pure functions trong `src/auth.js`:
- `getCurrentUser()` — đọc từ localStorage, check expiry, trả null nếu hết hạn
- `setCurrentUser(user)` — lưu vào localStorage với expiry timestamp
- `logout()` — xóa session keys
- `getRoleConfig(role)` — trả config object đúng cho từng role (admin, btv, ctv, member, guest)
- `sha256(str)` — hash string (lưu ý: dùng Web Crypto API, cần mock `crypto.subtle`)
- `loginUser(phone, password)` — mock supabase rpc calls, test happy path + error cases
- Edge cases: corrupted localStorage, expired session, unknown role

#### B2.2 `tests/unit/ngu-hanh.test.js` — Ngũ Hành analysis
Test `src/utils/ngu-hanh.js`:
- `analyzeNguHanh(birthYear)`:
  - Năm 1990 → Canh (Thiên Can) + Ngọ (Địa Chi) → Kim hành
  - Năm 2000 → Canh (Thiên Can) + Thìn (Địa Chi) → Kim hành
  - Năm 1985 → Ất (Thiên Can) + Sửu (Địa Chi) → Mộc hành
  - Test trả về `{ can, chi, hanh, amDuong, conGiap, element: { icon, organ, ... } }`
- `getAllElements()` → trả 5 elements
- `getHealthMap(birthYear)` → trả render-ready object với đúng fields
- `generateGreeting(name, birthYear)` → trả string chứa tên + hành
- Edge cases: năm quá nhỏ, năm tương lai, NaN

#### B2.3 `tests/unit/ctv.test.js` — CTV system
Test `src/ctv.js` (cần mock supabase):
- `getStoredRef()` / `setStoredRef(code)` — localStorage read/write
- `getAutoRef()` — check cookie, localStorage, trả ref code hoặc null
- `validateCtvCode(ctvCode, customerPhone)`:
  - Trả null nếu code null/empty
  - Chặn self-referral (CTV code = customer's phone → trả null)
  - Phone normalization: `+84xxx` → `0xxx`
  - Valid code → return code
- `initRefTracking()` — check URL `?ref=XXX` → lưu vào localStorage + cookie
- Edge cases: corrupted cookie, no ref param, expired cookie

#### B2.4 `tests/unit/tracker.test.js` — Page view tracker
Test `src/utils/tracker.js` (cần mock supabase + browser globals):
- `trackPageView()`:
  - Không track trang admin
  - Debounce: chỉ track 1 lần per page per session
  - Gửi đúng data: page, referrer hostname, UTM params, device type
- `getDevice()` — test với window.innerWidth: <768=mobile, <1024=tablet, else=desktop
- `getUTM(key)` — parse URL search params

### B3. Integration tests

#### B3.1 `tests/integration/order-flow.test.js`
Mock supabase, test **full order flow**:
1. Setup DOM (tạo form elements bằng testing-library hoặc innerHTML)
2. `initQuantitySelector(product, PRICING)` → click +/- → verify price update
3. `initOrderForm(PRICING, showToast)` → fill form → submit → verify supabase.from('orders').insert() called with correct data
4. Payment method: COD vs bank_transfer → verify different flows
5. Rate limiting: submit 4 times → 4th blocked

#### B3.2 `tests/integration/ctv-flow.test.js`
Mock supabase, test **CTV registration + ref tracking**:
1. `registerCTV(name, phone, email)` → verify supabase insert
2. Existing CTV → verify returns `{ ok: true, existing: true }`
3. `initRefTracking()` with `?ref=CTV001` → verify stored in localStorage + cookie
4. `validateCtvCode('CTV001', '0912345678')` → verify anti-self-referral
5. `getCTVDashboard(refCode)` → verify supabase RPC call

### B4. E2E tests (Playwright) — BỎ QUA cho bây giờ
> Sprint B4 (Playwright) sẽ làm riêng sau vì cần thêm setup và database seeding.
> Chỉ tập trung B1-B3 + B5 trong lần này.

### B5. CI tích hợp test

1. **Tạo/cập nhật `.github/workflows/test.yml`**:
   ```yaml
   name: Tests
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm
         - run: npm ci
         - run: npm test
         - run: npm run test:coverage
   ```

2. Kiểm tra nếu đã có file CI, hãy **merge** thêm test step, đừng ghi đè.

---

## Quy tắc quan trọng

1. **Chạy `npm test` sau mỗi bước** — đảm bảo ALL tests pass trước khi commit
2. **Chạy `npx vite build`** — đảm bảo build không bị break
3. **Commit thường xuyên** — mỗi khi 1 task con hoàn thành (B1, B2, etc.)
4. **Không sửa source code** — sprint này CHỈ viết tests, không refactor source
5. **Vitest env = jsdom** — tất cả tests chạy trong jsdom (DOM available)
6. **Mock Supabase consistently** — dùng `vi.mock()` ở setup file, không mock inline
7. **Vietnamese text OK** — test descriptions có thể dùng tiếng Việt hoặc Anh đều được
8. **Target: 15+ test files, 80+ test cases** — coverage không cần 100% nhưng cần cover critical paths

## Commit Convention
```
🧪 [Test] Sprint B — B1 Vitest setup + mocks
🧪 [Test] Sprint B — B2 Unit tests (auth, ngu-hanh, ctv, tracker)
🧪 [Test] Sprint B — B3 Integration tests (order-flow, ctv-flow)
🧪 [Test] Sprint B — B5 CI workflow for GitHub Actions
```
