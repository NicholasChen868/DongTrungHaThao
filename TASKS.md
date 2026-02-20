# 📋 Implementation Tasks — Đông Trùng Hạ Thảo (maldalladuyduc)
> Cập nhật lần cuối: **2026-02-20 11:49**

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
- [x] Login bằng password (SHA-256)
- [x] Sidebar navigation (7 sections)
- [x] Overview: tổng đơn hàng, doanh thu, CTV, liên hệ
- [x] Bảng đơn hàng (50 items) + **nút duyệt/từ chối/giao/hoàn thành**
- [x] Danh sách CTV (50 items) + **nút nâng hạng**
- [x] Đánh giá khách hàng
- [x] Yêu cầu liên hệ
- [x] Responsive mobile (sidebar thành tab bar)
- [x] Toast notifications
- [x] Nút 🔄 Làm mới data

### 🗄️ Database (Supabase)
- [x] Bảng `company_testimonials`
- [x] Bảng `ctv_accounts`
- [x] Bảng `point_transactions`
- [x] Bảng `share_clicks`
- [x] Bảng `contact_submissions`
- [x] Bảng `orders`
- [x] RPC functions: `register_ctv`, `get_ctv_dashboard`, `record_share_click`
- [x] Fix diacritics (dấu tiếng Việt)

---

## 🔄 ĐANG TIẾN HÀNH

### 🔐 Admin Dashboard — Nâng cấp
- [x] Thêm chức năng duyệt/từ chối đơn hàng
- [x] Thêm chức năng nâng hạng CTV
- [ ] Đổi password mặc định → password riêng
- [ ] Export dữ liệu CSV
- [ ] Thêm biểu đồ doanh thu (chart)

### 📈 Analytics
- [ ] Tracking page views
- [ ] Tracking section engagement
- [ ] Conversion funnel (visit → contact → order)

---

## 📌 TODO — Chưa Bắt Đầu

### 🛒 Đặt Hàng
- [x] Form đặt hàng hoàn chỉnh (tên, SĐT, địa chỉ, sản phẩm, số lượng)
- [x] Lưu đơn hàng vào Supabase (bảng `orders`)
- [x] SQL migration cho bảng `orders` (003_orders_table.sql)
- [ ] Xác nhận đơn hàng bằng SMS/Zalo
- [ ] Email thông báo đơn hàng mới cho admin
- [ ] Trang theo dõi đơn hàng cho khách

### 💳 Thanh Toán CTV
- [ ] Chức năng rút tiền cho CTV
- [ ] Xác nhận thanh toán từ admin
- [ ] Lịch sử thanh toán

### 📱 PWA / Mobile App
- [ ] Service Worker
- [ ] Manifest.json
- [ ] Offline support
- [ ] Push notifications (đơn hàng mới, điểm CTV)

### 🔍 SEO & Marketing
- [ ] Sitemap.xml
- [ ] Schema.org structured data
- [ ] Open Graph meta tags
- [ ] Blog/Tin tức về Đông Trùng Hạ Thảo
- [ ] Landing pages cho từng sản phẩm

### 📸 Nội Dung
- [ ] Ảnh sản phẩm chuyên nghiệp
- [ ] Video giới thiệu quy trình
- [ ] Chứng nhận / giấy tờ pháp lý
- [ ] Ảnh thực tế nhà xưởng

### 🛡️ Bảo Mật
- [ ] Rate limiting API calls
- [ ] CAPTCHA cho forms
- [ ] RLS policies review
- [ ] Admin auth nâng cao (Supabase Auth)
- [ ] CSP headers

### 🧪 Testing
- [ ] Unit tests cho CTV system
- [ ] E2E tests cho flow đặt hàng
- [ ] Cross-browser testing
- [ ] Performance audit (Lighthouse)

---

## 📝 Ghi Chú
- **Deployment**: Vercel auto-deploy từ `main` branch
- **Database**: Supabase (PostgreSQL)
- **Framework**: Vite (vanilla JS, no React)
- **Font**: Be Vietnam Pro
- **Design**: Premium Dark/Gold theme
- **Admin password mặc định**: `password` — ⚠️ CẦN ĐỔI NGAY
