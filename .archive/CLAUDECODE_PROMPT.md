# ClaudeCode — Phase 7 Frontend: CTV Dashboard Notifications + Onboarding DB Sync

> Migrations 015-017 đã được chạy trên Supabase. Giờ cần cập nhật Frontend.

---

## PROMPT:

Bạn đang tiếp tục phát triển CTV Dashboard (`ctv-dashboard.html`).
Migrations 015-017 đã live trên Supabase. Cần cập nhật frontend để sử dụng các RPC mới.

### CONTEXT QUAN TRỌNG
- Database `ctv_accounts.id` là **UUID** (không phải INTEGER)
- Supabase client đã có sẵn trong file, import qua module
- File `ctv-dashboard.html` đã có Onboarding Wizard UI (id="obWizard") và CSS
- Token Supabase đã lưu trong `.env`

### NHIỆM VỤ 1: Onboarding Wizard DB Sync (File: ctv-dashboard.html)

Hiện tại Onboarding Wizard chỉ dùng localStorage. Cần đồng bộ với DB.

**RPC đã có trên server:**
- `get_ctv_dashboard(p_ref_code)` → trả thêm field `onboarding_step` (0-5)
- `update_onboarding_step(p_ref_code, p_step)` → lưu bước hoàn thành, chỉ cho phép tăng

**Cần sửa trong `initOnboarding(data)`:**
1. Đọc `data.onboarding_step` thay vì chỉ dùng localStorage
2. Khi user hoàn thành bước (copy link, đủ 3 đơn) → gọi `supabase.rpc('update_onboarding_step', {p_ref_code, p_step})`
3. Khi bấm "Đã hiểu, ẩn hướng dẫn" → gọi `update_onboarding_step(ref, 5)` (dismiss forever)
4. Giữ localStorage làm cache phụ (offline fallback)

### NHIỆM VỤ 2: CTV Notification Bell (File: ctv-dashboard.html)

**RPC đã có trên server:**
- `get_ctv_notifications(p_ref_code)` → trả `{ok, unread_count, notifications[]}`
- `mark_notification_read(p_ref_code, p_notification_id)` → đánh dấu đã đọc

**Cần thêm:**

1. **HTML** — Trong `.ctv-welcome` header, thêm:
```html
<div class="notif-wrapper" id="notifWrapper">
    <button class="notif-bell" id="notifBell" onclick="toggleNotifications()">
        🔔 <span class="notif-badge" id="notifBadge" style="display:none">0</span>
    </button>
    <div class="notif-dropdown" id="notifDropdown">
        <div class="notif-header">Thông Báo</div>
        <div class="notif-list" id="notifList">
            <div class="notif-empty">Chưa có thông báo</div>
        </div>
    </div>
</div>
```

2. **CSS** — Thêm styles cho `.notif-*`:
- `.notif-wrapper` — position: relative
- `.notif-bell` — background none, border none, font-size 1.3rem, cursor pointer, position relative
- `.notif-badge` — position absolute, top -4px, right -4px, background #ef4444, color white, font-size 11px, width 18px, height 18px, border-radius 50%, display flex, align-items center, justify-content center
- `.notif-dropdown` — position absolute, top 100%, right 0, width 320px, max-height 400px, overflow-y auto, background var(--bg-card), border 1px solid var(--border-color), border-radius 12px, box-shadow, display none, z-index 50
- `.notif-dropdown.open` — display block
- `.notif-item` — padding 12px 16px, border-bottom 1px solid, cursor pointer, transition
- `.notif-item.unread` — background rgba(212,168,83,0.06)
- `.notif-item:hover` — background rgba(255,255,255,0.03)
- `.notif-type-icon` — margin-right 8px
- `.notif-time` — font-size 12px, color var(--text-muted)

3. **JavaScript:**
```javascript
async function loadNotifications(refCode) {
    const { data } = await supabase.rpc('get_ctv_notifications', { p_ref_code: refCode });
    if (!data?.ok) return;
    
    // Update badge
    const badge = document.getElementById('notifBadge');
    if (data.unread_count > 0) {
        badge.textContent = data.unread_count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
    
    // Render list
    const list = document.getElementById('notifList');
    if (!data.notifications?.length) {
        list.innerHTML = '<div class="notif-empty">Chưa có thông báo</div>';
        return;
    }
    
    const typeIcons = { new_order: '🛒', commission: '💰', withdrawal_approved: '✅', post_reward: '✍️' };
    list.innerHTML = data.notifications.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="markRead('${refCode}', ${n.id}, this)">
            <div><span class="notif-type-icon">${typeIcons[n.type] || '📌'}</span><strong>${escapeHTML(n.title)}</strong></div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">${escapeHTML(n.message || '')}</div>
            <div class="notif-time">${fmtDate(n.created_at)}</div>
        </div>
    `).join('');
}

async function markRead(refCode, notifId, el) {
    el.classList.remove('unread');
    await supabase.rpc('mark_notification_read', { p_ref_code: refCode, p_notification_id: notifId });
    const badge = document.getElementById('notifBadge');
    const count = parseInt(badge.textContent) - 1;
    badge.textContent = Math.max(count, 0);
    if (count <= 0) badge.style.display = 'none';
}

function toggleNotifications() {
    document.getElementById('notifDropdown').classList.toggle('open');
}

// Close on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.notif-wrapper')) {
        document.getElementById('notifDropdown')?.classList.remove('open');
    }
});
```

4. Gọi `loadNotifications(refCode)` ngay sau `loadBtvPosts(refCode)` trong hàm load dashboard.

### QUY TẮC
1. Tất cả UI/Text phải là **Tiếng Việt**
2. Commit message có `Trước khi sửa:` và `Sau khi sửa:`
3. Không lộ password_hash
4. escapeHTML cho mọi user input
5. Build production trước khi push: `npx vite build`
