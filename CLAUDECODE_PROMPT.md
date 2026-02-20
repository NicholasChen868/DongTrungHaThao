# ClaudeCode — Phase 6 Sprint 3: Emoji Cleanup + Bớt Emoji Toàn Site

> Copy prompt bên dưới vào ClaudeCode terminal

---

## PROMPT:

```
Bạn đang phối hợp với Antigravity AI trên project DongTrungHaThao.

## CONTEXT:
- Phase 6 Sprint 2: DONE (Ngũ Hành module, CTV onboarding migration, Post likes)
- Antigravity đã apply migration 012 + 013 lên Supabase
- Antigravity đã build Like button UI cho chia-se.html
- Yêu cầu quan trọng từ khách hàng: BỚT EMOJI, NỘI DUNG NGHIÊM TÚC HƠN

## NHIỆM VỤ: Emoji Audit & Cleanup

Khách hàng nói: "Bớt emoji, nghiêm túc hơn, càng nhiều emoji lại càng không giống người"

### Cần rà soát và bớt emoji trong các file SAU:

1. **src/main.js** — Kiểm tra các hàm render (renderBenefits, renderProcess, renderProduct, renderTestimonials, renderHealthStories, renderAffiliateSteps, renderAffiliateTiers). Bỏ emoji trong heading, labels, card content. Giữ lại emoji CHỈ KHI nó là icon chức năng (VD: nút điện thoại 📞 trong contact info thì OK).

2. **data/testimonials.js** — Nếu có emoji trong data, bỏ bớt.

3. **ctv-dashboard.html** — Bỏ emoji thừa trong labels, headings.

4. **tra-cuu.html** — Bỏ emoji thừa.

5. **thanh-vien.html** — Bỏ emoji thừa.

### QUY TẮC emoji:
- KHÔNG dùng emoji trong heading, title, paragraph text
- CHỈ ĐƯỢC dùng emoji trong:
  - Contact info icons (📞, 📧) — nhưng tốt hơn là dùng SVG icon
  - Navigation labels có thể giữ 1-2 emoji như CTV section
- KHÔNG dùng: 💛, 🌟, ✨, 🎉, 💚, 🏡, 💡, ✍️, ✏️, 📤, 👁️, ❤️
  trong text content
- Toast messages: bỏ emoji, chỉ dùng text
- showToast('Đặt hàng thành công!', true) ← KHÔNG có emoji

### KHÔNG CHẠM:
- index.html (Antigravity quản lý)
- src/style.css (Antigravity quản lý)
- chia-se.html (Antigravity đã cleanup)
- ban-do-suc-khoe.html (backlog)

### SAU KHI XỬ LÝ:
1. `npx vite build` để verify
2. Commit: "Cleanup emoji usage across site for professional tone"
3. Push lên main

Bắt đầu rà soát ngay.
```
