# 🏗️ Architecture — Đông Trùng Hạ Thảo Website

> Cập nhật: 2026-02-23 — Sau Sprint A (Refactor) + Sprint B (Testing)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Build | Vite | 7.x |
| Frontend | Vanilla JS (ES Modules) | — |
| Styling | Vanilla CSS (modular) | — |
| Backend | Supabase | 2.x |
| Database | PostgreSQL (via Supabase) | — |
| Testing | Vitest + jsdom | 4.x |
| CI | GitHub Actions | — |
| Hosting | (configured via deploy workflow) | — |

## Project Structure

```
DongTrungHaThao/
├── index.html              — Trang chủ (1082 dòng)
├── admin.html              — Admin dashboard (252 dòng)
├── ctv-dashboard.html      — CTV dashboard (422 dòng)
├── thanh-vien.html         — Member portal
├── ban-do-suc-khoe.html    — Health map (Ngũ Hành)
├── tra-cuu.html            — Order lookup
├── cau-chuyen.html         — Brand story
├── chia-se.html            — Content sharing
├── tuyen-ctv.html          — CTV recruitment
├── 404.html                — Not found page
├── chinh-sach-*.html       — Policy pages
│
├── src/                    — Source (JS + CSS)
│   ├── main.js             — Entry point (140 dòng) ← orchestrator
│   ├── auth.js             — Auth system (436 dòng) ← login/logout/session
│   ├── ctv.js              — CTV system (301 dòng) ← referral tracking
│   ├── data.js             — Data fetching (200 dòng) ← Supabase queries
│   ├── supabase.js         — Client init (7 dòng)
│   ├── admin.js            — Admin dashboard (1027 dòng)
│   ├── ctv-dashboard.js    — CTV dashboard (970 dòng)
│   │
│   ├── modules/            — Feature modules (tách từ main.js)
│   │   ├── animations.js        — Scroll, particles, countup (77 dòng)
│   │   ├── render-sections.js   — Benefits, process, product (126 dòng)
│   │   ├── testimonials.js      — Testimonials + Swiper (99 dòng)
│   │   ├── order-form.js        — Order form + payment (319 dòng)
│   │   ├── floating-buttons.js  — Floating CTA + contact (76 dòng)
│   │   ├── social-proof.js      — Fake realtime notifications (163 dòng)
│   │   ├── returning-customer.js — Greeting banner (32 dòng)
│   │   └── reorder-reminder.js  — Reorder prompt (31 dòng)
│   │
│   ├── utils/              — Shared utilities
│   │   ├── sanitize.js     — XSS protection: escapeHTML, escapeCSS
│   │   ├── ratelimit.js    — Client-side rate limiting
│   │   ├── ngu-hanh.js     — Ngũ Hành (Five Elements) analysis
│   │   └── tracker.js      — Page view tracking (fire-and-forget)
│   │
│   ├── css/                — Modular CSS (tách từ style.css)
│   │   ├── base.css        — Variables, reset, buttons (449 dòng)
│   │   ├── navbar.css      — Header, navigation (158 dòng)
│   │   ├── hero.css        — Hero section (166 dòng)
│   │   ├── sections.css    — Content sections (1194 dòng)
│   │   ├── contact.css     — Contact/order, footer, toast (462 dòng)
│   │   ├── responsive.css  — Media queries (703 dòng)
│   │   └── components.css  — Widgets, floating buttons (1000 dòng)
│   │
│   ├── style.css           — Import file (19 dòng, @import all css/)
│   ├── admin.css           — Admin-specific CSS (872 dòng)
│   ├── auth.css            — Auth modal CSS (463 dòng)
│   └── ctv-dashboard.css   — CTV dashboard CSS (1370 dòng)
│
├── tests/                  — Test suite (160 tests, 9 files)
│   ├── setup.js            — Global setup + Supabase mock
│   ├── mocks/supabase.js   — Mock Supabase client
│   ├── unit/               — 7 unit test files (130 tests)
│   └── integration/        — 2 integration test files (30 tests)
│
├── supabase/migrations/    — Database migrations
├── images/                 — Static images
├── .github/workflows/      — CI/CD
├── vite.config.js          — Build config (multi-page)
├── vitest.config.js        — Test config
├── TASKS.md                — Sprint planning & progress
└── package.json
```

## Architecture Decisions

### 1. No Framework — Vanilla JS

Quyết định dùng Vanilla JS (không React/Vue/Angular) vì:
- Website chủ yếu là **content-driven** (sản phẩm, testimonial, CTV info)
- SEO quan trọng — HTML tĩnh index nhanh hơn SPA
- Không cần complex state management
- Bundle size nhỏ (~125KB JS, ~54KB CSS gzipped)

### 2. Modular Architecture (Post-Refactor)

```
main.js (orchestrator)
  ├── import modules/*.js     — Feature-specific code
  ├── import utils/*.js       — Shared utilities
  ├── import data.js          — Data layer
  ├── import auth.js          — Auth system
  └── import ctv.js           — CTV system
```

**Key principle**: Mỗi module **self-contained**, nhận dependencies qua parameters:
- `PRICING` truyền vào `order-form.js`, `render-sections.js` (không global)
- `showToast` truyền vào modules cần notification (tránh circular import)
- `supabase` import trực tiếp từ `supabase.js` (singleton)

### 3. CSS Architecture

```
style.css (@import orchestrator)
  ├── base.css       — Design tokens (CSS variables), reset, buttons
  ├── navbar.css     — Navigation (fixed, responsive)
  ├── hero.css       — Hero section
  ├── sections.css   — All content sections
  ├── contact.css    — Contact form, footer, toast
  ├── components.css — CTA, floating widgets, social proof
  └── responsive.css — Media queries (1024px, 768px, 480px, 360px)
```

Import order = CSS cascade: **base → layout → components → responsive**

Vite processes `@import` at build time → output is single concatenated file (no runtime cost).

### 4. Data Flow

```
Supabase (PostgreSQL)
  ↓ RPC calls
data.js → fetchAllData()
  ↓ returns { product, testimonials, processSteps, ... }
main.js → distributes to modules
  ↓
render-sections.js → DOM manipulation
testimonials.js → Swiper initialization
order-form.js → Form handling + supabase.from('orders').insert()
```

### 5. Auth System

```
auth.js
  ├── getCurrentUser() — localStorage + expiry check
  ├── loginUser(phone, password) — supabase.rpc('login_...')
  ├── ROLE_CONFIG — admin | btv | ctv | member | guest
  ├── renderAuthBanner() — Dynamic nav based on role
  └── showLoginModal() — Popup login form
```

Roles: `admin` > `btv` > `ctv` > `member` > `guest`

### 6. CTV (Cộng Tác Viên) System

```
ctv.js
  ├── initRefTracking() — ?ref=CODE → localStorage + cookie (30-day TTL)
  ├── validateCtvCode() — Anti self-referral (phone normalization)
  ├── registerCTV() → supabase.rpc('registerCTV')
  ├── getCTVDashboard() → supabase.rpc('get_ctv_dashboard')
  └── copyShareLink() — Clipboard API
```

### 7. Testing Strategy

```
Unit Tests (130 tests)
  ├── Pure functions: sanitize, ratelimit, ngu-hanh, order-calc
  ├── Side-effect functions: auth, ctv, tracker (mocked supabase)
  └── All run in jsdom environment

Integration Tests (30 tests)
  ├── order-flow: DOM setup → form interaction → supabase verify
  └── ctv-flow: register → ref tracking → dashboard

E2E Tests (Playwright) — deferred to later sprint
```

## Build Output

```
dist/
├── *.html              — 13 pages (static, multi-page app)
├── assets/
│   ├── style-*.css     — ~54 KB (main CSS bundle)
│   ├── main-*.css      — ~13 KB (Swiper CSS)
│   ├── auth-*.css      — ~6 KB
│   ├── admin-*.css     — ~12 KB
│   ├── ctv-dashboard-*.css — ~19 KB
│   ├── main-*.js       — ~125 KB (main + modules + Swiper)
│   ├── supabase-*.js   — ~172 KB (Supabase SDK)
│   ├── admin-*.js      — ~32 KB
│   ├── ctv-dashboard-*.js — ~23 KB
│   └── (other page-specific bundles)
```

Vite automatically:
- Tree-shakes unused code
- Code-splits per page entry
- Hashes filenames for cache busting
- Processes CSS @import into single bundles

## Key Conventions

1. **Vietnamese comments** — code comments in Vietnamese (matching team language)
2. **Commit format** — emoji prefix: `🔧 [Refactor]`, `🧪 [Test]`, `📋 [Docs]`, `🧹 [CSS]`, `🔒 [Security]`
3. **No global variables** — pass dependencies as function parameters
4. **Mock at boundary** — Supabase mocked in `tests/setup.js`, not inline
5. **Build verify** — every change must pass `npx vite build`
