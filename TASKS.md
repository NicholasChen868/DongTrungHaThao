# 📋 Implementation Tasks — Đông Trùng Hạ Thảo (maldalladuyduc)

> Cập nhật lần cuối: **2026-02-20 12:41**

---

## ✅ ĐÃ HOÀN THÀNH

### 🏗️ Nền Tảng

- [x] Khởi tạo Vite project
- [x] Thiết kế Design System (CSS variables, typography, colors)
- [x] Tích hợp Supabase (database, auth)
- [x] Cấu trúc thư mục: `src/`, `data/`, `public/`
- [x] Deploy Vercel (auto-deploy từ GitHub `main`)

### 🎨 Giao Diện Trang Chính

- [x] Hero section (tiêu đề, CTA, thống kê, cuộn xuống)
- [x] Section Giới Thiệu / Benefits (3 cards)
- [x] Section Quy Trình (timeline steps)
- [x] Section Sản Phẩm (ảnh, giá, mô tả)
- [x] Section Đánh Giá (testimonials từ Supabase)
- [x] Section Câu Chuyện Sức Khỏe (stories)
- [x] Section CTV / Affiliate (bảng hoa hồng, đăng ký)
- [x] Section Liên Hệ (form, hotline, Zalo)
- [x] Footer (links, copyright)
- [x] Animations on scroll (animate-on-scroll)

### 🧭 Navigation Bar

- [x] Premium header bar (nền #141414, viền vàng trên 2px)
- [x] Logo vàng "maldalladuyduc"
- [x] Menu items không rớt chữ (nowrap + &nbsp;)
- [x] CTA button "Đặt Hàng" nổi bật
- [x] Hamburger menu cho tablet/mobile (<= 1024px)
- [x] Sticky navbar khi scroll
- [x] Nút CTV (border blue) + Thành Viên (border gold)
- [x] Link Chia Sẻ + Câu Chuyện

### ⚡ Hiệu Năng

- [x] Loại bỏ toàn bộ animations GPU-intensive
- [x] Không backdrop-filter, không text gradient, không shimmer
- [x] Transition chỉ specific properties (color, border-color, opacity)
- [x] No `transition: all`
- [x] Kiểm tra 0 GPU artifacts trên production

### 📱 Responsive

- [x] Desktop (>1024px): Full navbar, 3/4-col grids
- [x] Tablet (768-1024px): Hamburger menu, 2-col grids
- [x] Mobile (480-768px): Stack layout, adjusted font sizes
- [x] Small Mobile (<480px): Compact layout
- [x] Hero content padding-top tránh bị navbar đè

### 📊 CTV System

- [x] Đăng ký CTV (form trên trang chính)
- [x] Hệ thống ref tracking (URL params)
- [x] Ghi nhận click + điểm tích lũy
- [x] Share buttons trên story cards + product
- [x] Bảng hoa hồng theo tier (Bạc/Vàng/Kim Cương/Đại Lý)

### 📄 Trang CTV Dashboard (`/ctv-dashboard.html`)

- [x] Đăng nhập bằng SĐT
- [x] Thống kê: tổng điểm, chờ duyệt, VNĐ, lượt click
- [x] Link giới thiệu + copy 1-click
- [x] Lịch sử giao dịch (20 items gần nhất)
- [x] Tier badge (Bạc/Vàng/Kim Cương)
- [x] Responsive mobile

### 🔐 Trang Admin Dashboard (`/admin.html`)

- [x] Login bằng password (SHA-256, password = 'matkhau')
- [x] Sidebar navigation (8 sections)
- [x] Overview: tổng đơn hàng, doanh thu, CTV, liên hệ
- [x] Bảng đơn hàng + nút duyệt/từ chối/giao/hoàn thành
- [x] Danh sách CTV + nút nâng hạng (→ Vàng/Kim Cương)
- [x] Đánh giá khách hàng
- [x] Yêu cầu liên hệ
- [x] Bài viết chia sẻ (duyệt/ẩn)
- [x] Analytics: Bar chart doanh thu 30 ngày + Doughnut trạng thái
- [x] Export CSV (đơn hàng + CTV)
- [x] Toast notifications + nút 🔄 Làm mới
- [x] Responsive mobile (sidebar thành tab bar)

### 💛 Trang Thành Viên Thân Thiết (`/thanh-vien.html`)

- [x] Đăng ký (tên, SĐT, email, mật khẩu)
- [x] Đăng nhập (SĐT + mật khẩu)
- [x] Dashboard: đơn hàng gần đây, tổng chi tiêu
- [x] Badges: Thành Viên Thân Thiết
- [x] Session persistence (sessionStorage)

### ✍️ Trang Chia Sẻ Yêu Thương (`/chia-se.html`)

- [x] Blog cộng đồng cho Thành Viên
- [x] 4 chuyên mục: Sức khỏe, Cuộc sống, Trải nghiệm, Mẹo hay
- [x] Viết bài + admin duyệt trước khi hiển thị
- [x] Social sharing (Facebook, Zalo, copy link)
- [x] View counter + likes
- [x] Open Graph meta cho rich preview

### 🍄 Trang Câu Chuyện Sản Phẩm (`/cau-chuyen.html`)

- [x] Hero section (font Lora serif)
- [x] Timeline quy trình sản xuất (5 bước)
- [x] Grid giá trị khác biệt (4 cards)
- [x] Grid công dụng (4 cards)
- [x] CTA buttons

### 🗄️ Database (Supabase)

- [x] Bảng `company_testimonials`
- [x] Bảng `ctv_accounts`
- [x] Bảng `point_transactions`
- [x] Bảng `share_clicks`
- [x] Bảng `contact_submissions`
- [x] Bảng `orders` (migration 003)
- [x] Bảng `members` (migration 004)
- [x] Bảng `member_posts` (migration 004)
- [x] RPC functions: `register_ctv`, `get_ctv_dashboard`, `record_share_click`
- [x] Fix diacritics (dấu tiếng Việt)

### 🔍 SEO & Marketing

- [x] Sitemap.xml
- [x] Schema.org structured data (Organization + Product)
- [x] Open Graph meta tags (full: url, locale, site_name)
- [x] Twitter Card meta tags
- [x] Canonical URL
- [x] Robots.txt (+ noindex admin)

---

## 🔄 ĐANG TIẾN HÀNH — Phối hợp ClaudeCode

### 🔴 Phase 1: Security Hardening (ƯU TIÊN CAO)

- [ ] Tighten RLS: members (SELECT by owner only)
- [ ] Tighten RLS: member_posts (UPDATE by owner only)
- [ ] Tighten RLS: orders (restrict SELECT)
- [ ] Input sanitization (XSS prevention)
- [ ] Rate limiting (login attempts, form submissions)
- [ ] CSP headers (vercel.json)
- [ ] Admin auth nâng cao → Supabase Auth

### 🟡 Phase 2: Testing

- [ ] Setup Vitest + testing-library
- [ ] Unit tests: CTV system, order form, sanitize
- [ ] Integration tests: signup → dashboard flows
- [ ] E2E tests: homepage, order, ctv, admin (Playwright)
- [ ] Lighthouse CI (target: Performance 90+, SEO 95+)

### 🟡 Phase 3: Refactoring & Code Quality

- [ ] Tách admin.html JS/CSS → modules riêng
- [ ] Tách style.css (42KB) → component files
- [ ] Tách main.js (17KB) → feature modules
- [ ] Error handling wrapper (retry logic, fallback UI)
- [ ] Environment variables (.env)
- [ ] CI/CD: GitHub Actions (lint + test + preview)

---

## 📌 TODO — Features

### 🛒 Đặt Hàng

- [x] Form đặt hàng hoàn chỉnh
- [x] Lưu đơn hàng vào Supabase
- [x] SQL migration cho bảng `orders`
- [ ] Xác nhận đơn hàng bằng SMS/Zalo
- [ ] Email thông báo đơn hàng mới cho admin

### 💳 Thanh Toán CTV

- [ ] Chức năng rút tiền cho CTV
- [ ] Xác nhận thanh toán từ admin
- [ ] Lịch sử thanh toán

### 📱 PWA / Mobile App

- [ ] Service Worker + Manifest.json
- [ ] Offline support
- [ ] Push notifications

### 📈 Analytics

- [ ] Page view tracking
- [ ] Conversion funnel
- [ ] Section engagement

### 📸 Nội Dung

- [ ] Ảnh sản phẩm chuyên nghiệp
- [ ] Video giới thiệu quy trình
- [ ] Chứng nhận / giấy tờ pháp lý

---

## 📝 Ghi Chú

- **Deployment**: Vercel auto-deploy từ `main` branch
- **Database**: Supabase (PostgreSQL) — Project `lfwihaamswskmospcqfo`
- **Framework**: Vite (vanilla JS, no React)
- **Font**: Be Vietnam Pro + Lora (Câu Chuyện page)
- **Design**: Premium Dark/Gold theme
- **Admin password**: `matkhau` (SHA-256 hash)
- **Review doc**: Xem `REVIEW.md` cho full security audit + coordination plan
