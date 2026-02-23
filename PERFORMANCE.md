# 📊 Performance Audit — 2026-02-23

## Bundle Size Analysis

### Top 5 largest bundles (gzipped)

| File | Raw | Gzipped | Notes |
|------|-----|---------|-------|
| `supabase-*.js` | 171.73 KB | 45.99 KB | Supabase SDK — can't reduce |
| `main-*.js` | 124.67 KB | 40.40 KB | App code + Swiper.js |
| `style-*.css` | 53.90 KB | 10.71 KB | Main CSS (7 components) |
| `admin-*.js` | 31.51 KB | 8.38 KB | Admin dashboard |
| `ctv-dashboard-*.js` | 22.83 KB | 6.82 KB | CTV dashboard |

### Total payload (homepage first load)
- **JS**: ~296 KB raw / ~87 KB gzipped (supabase + main)
- **CSS**: ~67 KB raw / ~13 KB gzipped (style + main-swiper)
- **HTML**: ~43 KB raw / ~10 KB gzipped
- **Total gzipped**: ~110 KB ← EXCELLENT for a content site

### Code splitting (Vite auto)
Vite correctly splits per page:
- Homepage loads: `main.js` + `supabase.js` + `auth.js`
- Admin loads: `admin.js` + `supabase.js` + `auth.js`
- CTV dashboard: `ctv-dashboard.js` + `supabase.js` + `auth.js`
- Other pages: tiny page-specific bundles (0.3-7.8 KB)

## Optimization Opportunities

### 🟢 Already Good
1. **Code splitting** — Vite auto-splits per page entry ✅
2. **CSS modular** — no unused CSS loaded per page ✅
3. **Tree shaking** — Vite removes dead code ✅
4. **Gzip** — excellent compression ratios (60-80%) ✅

### 🟡 Could Improve
1. **Swiper.js inside main.js** (~60KB of the 125KB)
   - Currently: Swiper bundled into main chunk
   - Could: Dynamic import Swiper only when testimonials section in viewport
   - Impact: First paint -60KB JS, testimonials load lazily
   - Effort: Small (wrap in `IntersectionObserver` + `import()`)

2. **Font loading** — Google Fonts blocking render
   - Currently: `<link href="fonts.googleapis.com/...">`
   - Could: `font-display: swap` + preconnect
   - Impact: Faster first paint
   - Effort: Tiny

3. **Image optimization**
   - Check: Are images using WebP/AVIF?
   - Check: Are images lazy-loaded?
   - Check: Proper `width`/`height` attributes?

### 🔴 Not Worth It
1. **Supabase SDK** (172KB) — can't reduce, it's the SDK
2. **Admin/CTV-dashboard** — only loaded on admin pages, not public

## Lighthouse Estimates (no run yet)
Based on bundle analysis:
- **Performance**: 85-90 (JS payload reasonable, good code splitting)
- **Accessibility**: needs audit
- **Best Practices**: 90+
- **SEO**: needs meta tag audit

## Recommendations Priority

1. ⭐ Add `font-display: swap` to Google Fonts (5 min, free perf win)
2. ⭐ Add `<link rel="preconnect">` for fonts + Supabase API (5 min)
3. 🔧 Lazy-load Swiper with dynamic import (30 min, -60KB first load)
4. 🔧 Image audit + WebP conversion (1 hour)
5. 📊 Run Lighthouse for baseline scores (15 min)
