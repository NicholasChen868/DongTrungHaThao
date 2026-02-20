# CLAUDE.md — Quy Tắc Xưởng DongTrungHaThao

> File này là **luật chung** cho mọi AI agent (ClaudeCode, Antigravity, v.v.) khi làm việc trên project này.
> ClaudeCode tự động đọc file này. Antigravity đọc khi cần context.

---

## 🏷️ BRAND IDENTITY

- **Tên thương hiệu**: `Maldala Duy Đức` (KHÔNG phải "maldalladuyduc")
- **Hiển thị HTML**: `Maldala <span class="brand-accent">Duy Đức</span>`
- **"Duy Đức"** luôn dùng class `.brand-accent` (màu `--gold-primary`)
- **SEO meta tags**: Giữ nguyên "maldalladuyduc" trong meta để không ảnh hưởng SEO
- **Copyright**: `© 2026 Maldala Duy Đức`

## 🎨 COLOR PALETTE (Crimson/Gold Theme)

Bảng màu lấy từ **packaging sản phẩm thật**:

| Token | Hex | Nguồn |
|-------|-----|-------|
| `--crimson` | `#7A1B1B` | Hộp đỏ thẫm |
| `--gold-primary` | `#C5962C` | Lụa vàng, nắp chai |
| `--gold-light` | `#D4A853` | Highlight text |
| `--bg-primary` | `#080505` | Nền chính (ấm, có burgundy undertone) |
| `--text-primary` | `#F5EFE6` | Text chính (ivory ấm) |

**Quy tắc**: KHÔNG dùng màu mới ngoài palette. Nếu cần, đề xuất trước.

## 📸 QUY TẮC HÌNH ẢNH — QUAN TRỌNG

### Ảnh thật vs Ảnh mẫu

| Loại | Quy tắc |
|------|---------|
| **Ảnh thật** (do anh upload) | Hiển thị bình thường, KHÔNG gắn nhãn |
| **Ảnh AI-generated / mẫu** | BẮT BUỘC gắn `<span class="sample-badge">Ảnh mẫu</span>` |

### Khi thêm ảnh mới

1. **KHÔNG BAO GIỜ thay thế ảnh gốc** đã upload bằng ảnh AI
2. Ảnh AI chỉ dùng làm **ảnh phụ, minh họa, placeholder**
3. Mọi ảnh AI PHẢI có nhãn "Ảnh mẫu" để phân biệt
4. Vị trí ảnh: đặt trong `/public/images/`
5. Format: `.png` hoặc `.webp`, tối ưu dung lượng

### Ảnh hiện có

```
/public/images/
├── product-cordyceps.png   ← ẢNH THẬT, KHÔNG CHẠM
├── gift-box.png            ← ẢNH MẪU (có badge)
├── capsules-macro.png      ← ẢNH MẪU (chưa dùng trên site)
├── hero-bottle.png         ← ẢNH MẪU (chưa dùng trên site)
└── avatars/                ← Avatar testimonials
```

## 🏗️ KIẾN TRÚC PROJECT

```
DongTrungHaThao/
├── index.html           ← Trang chính
├── admin.html           ← Admin panel
├── ctv-dashboard.html   ← CTV login/register
├── tra-cuu.html         ← Tra cứu đơn hàng
├── thanh-vien.html      ← Thành viên
├── cau-chuyen.html      ← Câu chuyện brand
├── chia-se.html         ← Chia sẻ kinh nghiệm
├── src/
│   ├── style.css        ← Design system chính
│   ├── main.js          ← Logic trang chính
│   ├── ctv.js           ← Logic CTV
│   └── utils/           ← Shared utilities
├── supabase/            ← SQL migrations
├── public/              ← Static assets
└── tests/               ← Vitest tests
```

## 🔧 TECH STACK

- **Build**: Vite
- **Backend**: Supabase (PostgreSQL + RPC functions)
- **Hosting**: Vercel (auto-deploy from `main`)
- **CSS**: Vanilla CSS với CSS Variables (KHÔNG Tailwind)
- **Font**: Be Vietnam Pro (heading + body), Lora (quotes)
- **Test**: Vitest

## 📐 CODE CONVENTIONS

### HTML
- Dùng semantic HTML5 (`<section>`, `<article>`, `<nav>`)
- Class đặt tên theo BEM-lite: `.section-product`, `.product-image-box`
- Animation trigger: `.animate-on-scroll`
- KHÔNG dùng inline styles — mọi style vào `src/style.css`

### CSS
- Mọi giá trị màu phải dùng CSS variable: `var(--gold-primary)`
- KHÔNG hardcode hex/rgb trực tiếp trong rules
- Mobile-first responsive: breakpoint chính `768px`
- Transition dùng variable: `var(--transition-base)`

### JavaScript
- Import Supabase từ shared module
- Rate limiting: dùng `createSubmitGuard(ms)`
- Error handling: luôn try/catch, hiện toast cho user
- Async/await (không dùng .then chain)

## 🚀 DEPLOYMENT WORKFLOW

```bash
# 1. Pull latest
git pull origin main

# 2. Make changes

# 3. Build verify
npx vite build

# 4. Commit
git add -A
git commit -m "emoji Mô tả chi tiết tiếng Việt"

# 5. Push (auto-deploy to Vercel)
git push origin main
```

### Commit Message Format

```
🎨 UI/styling changes
🔧 Fix bugs
✨ New features
📸 Image/asset changes
🗃️ Database/migration changes
🧪 Tests
📝 Documentation
```

## 🤝 PHỐI HỢP GIỮA CÁC AI AGENTS

### Nguyên tắc phân chia

| Agent | Phạm vi chính |
|-------|--------------|
| **Antigravity** | `index.html`, `src/style.css`, design system, images, pages UI |
| **ClaudeCode** | `src/main.js`, `src/ctv.js`, `admin.html` (JS logic), Supabase migrations |

### Quy tắc va chạm

1. **Luôn `git pull` trước khi bắt đầu**
2. Nếu cần sửa file của agent khác → báo trước, ghi lý do
3. Conflict resolution: agent sau pull phải resolve conflict
4. Không refactor / đổi tên lớn khi agent khác đang active

## ⚠️ NHỮNG ĐIỀU TUYỆT ĐỐI KHÔNG LÀM

1. ❌ Thay ảnh thật bằng ảnh AI mà không hỏi
2. ❌ Sửa meta SEO tags (title, description) mà không hỏi
3. ❌ Đổi brand name format mà không hỏi  
4. ❌ Xóa hoặc thay đổi Supabase RPC functions đang production
5. ❌ Deploy code chưa build verify (`npx vite build`)
6. ❌ Dùng inline styles thay vì CSS file
7. ❌ Hardcode giá trị mà không dùng CSS variables

## 🎯 TRIẾT LÝ THIẾT KẾ

> **"Hành Trình Không Bao Giờ Có Đường Cụt"**

- Mọi trang đều dẫn đến trang khác
- Sau mỗi action (đặt hàng, đăng ký) → suggest bước tiếp theo
- Navigation rõ ràng, breadcrumbs khi cần
- UX tham khảo: AG1.com, iHerb, Moon Juice

> **"Trong Sáng — Rõ Ràng — Minh Bạch"**

- Giá hiển thị rõ, không ẩn phí
- Thành phần sản phẩm liệt kê đầy đủ
- Chứng nhận (GMP-WHO) luôn visible
- Testimonials từ khách hàng thật

---

*File này được tạo bởi Antigravity AI — 20/02/2026*
*Cập nhật khi có thay đổi lớn về brand, architecture, hoặc workflow.*
