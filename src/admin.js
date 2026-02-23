import './admin.css';
import { supabase } from './supabase.js';
import { escapeHTML } from './utils/sanitize.js';
import { checkRateLimit, recordAttempt } from './utils/ratelimit.js';
import { getSessionToken, isSessionValid, adminLogin, adminLogout, clearSession } from './admin-session.js';
import { apiCall, handleApiError } from './utils/api.js';

// --- Config ---
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const loginScreen = document.getElementById('adminLogin');
const sidebar = document.getElementById('adminSidebar');
const main = document.getElementById('adminMain');

// --- Session timeout ---
let sessionTimer;
function resetSessionTimer() {
    clearTimeout(sessionTimer);
    if (isSessionValid()) {
        sessionTimer = setTimeout(() => {
            clearSession();
            showAdminToast('Phiên đã hết hạn. Vui lòng đăng nhập lại.', 'error');
            setTimeout(() => location.reload(), 1500);
        }, SESSION_TIMEOUT_MS);
    }
}
['click', 'keydown', 'scroll', 'mousemove'].forEach(evt =>
    document.addEventListener(evt, () => {
        if (isSessionValid()) resetSessionTimer();
    }, { passive: true })
);

// --- Simple hash ---
async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Toast ---
function showAdminToast(msg, type = 'success') {
    const toast = document.getElementById('adminToast');
    toast.textContent = msg;
    toast.className = `admin-toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// --- Check session (with timeout validation) ---
if (isSessionValid()) {
    resetSessionTimer();
    showDashboard();
}

// --- Login ---
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const rl = checkRateLimit('admin_login', 3, 60000);
    if (!rl.allowed) {
        const errEl = document.getElementById('adminLoginError');
        errEl.textContent = `Quá nhiều lần thử. Đợi ${Math.ceil(rl.remainingMs / 1000)}s`;
        errEl.style.display = 'block';
        return;
    }
    recordAttempt('admin_login', 60000);

    const pw = document.getElementById('adminPassword').value;
    const hash = await sha256(pw);
    const result = await adminLogin(supabase, hash);

    if (result.ok) {
        resetSessionTimer();
        showDashboard();
    } else {
        const errEl = document.getElementById('adminLoginError');
        errEl.textContent = result.error || 'Mật khẩu không đúng';
        errEl.style.display = 'block';
    }
});

// --- Logout ---
document.getElementById('adminLogout').addEventListener('click', async () => {
    await adminLogout(supabase);
    location.reload();
});

// --- Bypass Login (DEV ONLY) — gọi admin_login RPC ---
document.getElementById('btnBypass').addEventListener('click', async () => {
    const devHash = await sha256('matkhau');
    const result = await adminLogin(supabase, devHash);
    if (result.ok) {
        document.getElementById('bypassNote').style.display = 'block';
        resetSessionTimer();
        showDashboard();
        showAdminToast('⚡ Đã bypass đăng nhập (DEV mode)', 'success');
    } else {
        showAdminToast('Bypass thất bại: ' + (result.error || ''), 'error');
    }
});

// --- Sidebar navigation ---
document.querySelectorAll('.sidebar-item').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const section = btn.dataset.section;
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${section}`).classList.add('active');
        document.getElementById('topbarTitle').textContent = btn.textContent;

        loadSection(section);
    });
});

function showDashboard() {
    loginScreen.classList.add('hidden');
    sidebar.classList.remove('hidden');
    main.classList.remove('hidden');

    const now = new Date();
    document.getElementById('topbarMeta').textContent =
        now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    loadSection('overview');
}

// Track loaded sections
const loaded = {};

async function loadSection(name) {
    if (loaded[name]) return;
    loaded[name] = true;

    switch (name) {
        case 'overview': await loadOverview(); break;
        case 'orders': await loadOrders(); break;
        case 'ctv': await loadCTVList(); break;
        case 'testimonials': await loadTestimonials(); break;
        case 'products': await loadProductSettings(); break;
        case 'contacts': await loadContacts(); break;
        case 'posts': await loadPosts(); break;
        case 'withdrawals': await loadAdminWithdrawals(); break;
        case 'analytics': await loadAnalytics(); break;
    }
}

// Refresh section (force reload)
window.refreshSection = async function (name) {
    loaded[name] = false;
    await loadSection(name);
    showAdminToast('Đã làm mới dữ liệu');
};

// --- Export CSV ---
window.exportCSV = async function (type) {
    try {
        let data, filename, headers;
        if (type === 'orders') {
            const res = await supabase.rpc('admin_list_orders', { p_session_token: getSessionToken() });
            data = res.data;
            filename = 'don-hang';
            headers = ['ID', 'Khách hàng', 'SĐT', 'Địa chỉ', 'SL', 'Đơn giá', 'Giảm %', 'Tổng', 'CTV', 'Ghi chú', 'Trạng thái', 'Ngày tạo'];
        } else if (type === 'ctv') {
            const res = await supabase.rpc('admin_list_ctv', { p_session_token: getSessionToken() });
            data = res.data;
            filename = 'ctv';
            headers = ['Mã CTV', 'Tên', 'SĐT', 'Email', 'Hạng', 'Điểm', 'VNĐ', 'Ngày ĐK'];
        }
        if (!data?.length) {
            showAdminToast('Không có dữ liệu để xuất', 'error');
            return;
        }

        const fieldMap = {
            orders: ['id', 'customer_name', 'phone', 'address', 'quantity', 'unit_price', 'discount_percent', 'total_amount', 'ctv_code', 'note', 'status', 'created_at'],
            ctv: ['referral_code', 'name', 'phone', 'email', 'tier', 'total_points', 'available_vnd', 'created_at'],
        };

        const fields = fieldMap[type];
        const csvRows = [headers.join(',')];
        data.forEach(row => {
            csvRows.push(fields.map(f => {
                let v = row[f] ?? '';
                v = String(v).replace(/"/g, '""');
                if (v.includes(',') || v.includes('"') || v.includes('\n')) v = `"${v}"`;
                return v;
            }).join(','));
        });

        const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showAdminToast(`Đã xuất ${data.length} dòng → ${a.download}`);
    } catch (err) {
        showAdminToast('Lỗi xuất CSV: ' + err.message, 'error');
    }
};

// --- OVERVIEW (via admin RPC) ---
async function loadOverview() {
    try {
        const { data: ov, error } = await apiCall(
            () => supabase.rpc('admin_get_overview', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải tổng quan' }
        );
        if (error) throw error;

        document.getElementById('ovOrders').textContent = ov.order_count || 0;
        document.getElementById('ovRevenue').textContent = Number(ov.revenue || 0).toLocaleString('vi-VN') + '₫';
        document.getElementById('ovCTV').textContent = ov.ctv_count || 0;
        document.getElementById('ovContacts').textContent = ov.contact_count || 0;

        renderOrderTable('recentOrders', ov.recent_orders || [], true);
        renderTable('recentCTV', ov.recent_ctv || [], ['referral_code', 'name', 'phone', 'tier', 'total_points', 'created_at'],
            ['Mã CTV', 'Tên', 'SĐT', 'Hạng', 'Điểm', 'Ngày ĐK']);

    } catch (err) {
        handleApiError(err, 'Tải tổng quan', showAdminToast);
    }
}

// --- ORDERS with action buttons (via admin RPC) ---
async function loadOrders() {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_list_orders', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải đơn hàng' }
        );
        if (error) throw error;
        renderOrderTable('allOrders', data || [], false);
    } catch (err) {
        handleApiError(err, 'Tải đơn hàng', showAdminToast);
    }
}

function renderOrderTable(containerId, data, compact) {
    const container = document.getElementById(containerId);
    if (!data?.length) {
        container.innerHTML = '<div class="admin-empty">Chưa có đơn hàng</div>';
        return;
    }

    const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const fmtMoney = (v) => Number(v || 0).toLocaleString('vi-VN') + '₫';
    const statusBadge = (s) => {
        const map = {
            pending: ['⏳ Chờ duyệt', 'badge-warning'],
            confirmed: ['✅ Đã duyệt', 'badge-info'],
            shipping: ['🚚 Đang giao', 'badge-info'],
            completed: ['✓ Hoàn thành', 'badge-success'],
            cancelled: ['✗ Đã hủy', 'badge-danger'],
        };
        const [text, cls] = map[s] || ['—', 'badge-info'];
        return `<span class="badge ${cls}">${text}</span>`;
    };

    // --- Build action buttons ---
    function getActions(o) {
        const oid = parseInt(o.id);
        if (o.status === 'pending') return `<button class="btn-action btn-approve" onclick="updateOrder(${oid},'confirmed')">✓ Duyệt</button><button class="btn-action btn-reject" onclick="updateOrder(${oid},'cancelled')">✗ Hủy</button>`;
        if (o.status === 'confirmed') return `<button class="btn-action btn-ship" onclick="updateOrder(${oid},'shipping')">🚚 Giao</button>`;
        if (o.status === 'shipping') return `<button class="btn-action btn-approve" onclick="updateOrder(${oid},'completed')">✓ Xong</button>`;
        return '—';
    }

    // --- TABLE VIEW (Desktop) ---
    const headers = compact
        ? '<th>ID</th><th>Khách hàng</th><th>Tổng</th><th>Trạng thái</th><th>Thao tác</th>'
        : '<th>ID</th><th>Khách hàng</th><th>SĐT</th><th>Địa chỉ</th><th>SL</th><th>Tổng</th><th>CTV</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th>';

    const tableHTML = `
<div class="order-table-wrapper">
<table class="admin-table">
    <thead><tr>${headers}</tr></thead>
    <tbody>
        ${data.map(o => {
        const actions = getActions(o);
        if (compact) {
            return `<tr>
<td>#${parseInt(o.id)}</td>
<td>${escapeHTML(o.customer_name)}</td>
<td>${fmtMoney(o.total_amount)}</td>
<td>${statusBadge(o.status)}</td>
<td>${actions}</td>
        </tr>`;
        }
        return `<tr>
        <td>#${parseInt(o.id)}</td>
        <td>${escapeHTML(o.customer_name)}</td>
        <td>${escapeHTML(o.phone)}</td>
        <td>${escapeHTML(String(o.address || '').substring(0, 40))}${(o.address || '').length > 40 ? '...' : ''}</td>
        <td>${parseInt(o.quantity) || 1}</td>
        <td>${fmtMoney(o.total_amount)}</td>
        <td>${escapeHTML(o.ctv_code) || '—'}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>${actions}</td>
    </tr>`;
    }).join('')}
    </tbody>
</table>
</div>`;

    // --- CARD VIEW (Mobile) ---
    const cardsHTML = `
<div class="order-cards">
<div class="order-cards-grid">
${data.map(o => {
        const oid = parseInt(o.id);
        const actions = getActions(o);
        const actionsHTML = actions !== '—'
            ? `<div class="order-card-footer">${actions}</div>`
            : '';
        return `
<div class="order-card status-${o.status}">
    <div class="order-card-header">
        <span class="order-card-id">#${oid}</span>
        ${statusBadge(o.status)}
    </div>
    <div class="order-card-name">${escapeHTML(o.customer_name)}</div>
    <div class="order-card-info">
        <div class="order-card-row">
<span class="label">Tổng tiền</span>
<span class="order-card-amount">${fmtMoney(o.total_amount)}</span>
        </div>
        ${!compact ? `<div class="order-card-row">
<span class="label">SL</span>
<span class="value">${parseInt(o.quantity) || 1} hộp</span>
        </div>` : ''}
        ${!compact && o.ctv_code ? `<div class="order-card-row">
<span class="label">CTV</span>
<span class="value">${escapeHTML(o.ctv_code)}</span>
        </div>` : ''}
    </div>
    <div class="order-card-date">${fmtDate(o.created_at)}</div>
    ${actionsHTML}
</div>`;
    }).join('')}
</div>
</div>`;

    container.innerHTML = tableHTML + cardsHTML;
}

// --- Update order status ---
window.updateOrder = async function (id, newStatus) {
    const labels = { confirmed: 'duyệt', shipping: 'giao hàng', completed: 'hoàn thành', cancelled: 'hủy' };
    if (!confirm(`Xác nhận ${labels[newStatus]} đơn #${id}?`)) return;

    try {
        const { error } = await supabase.rpc('admin_update_order_status', {
            p_session_token: getSessionToken(), p_order_id: id, p_status: newStatus
        });
        if (error) throw error;
        showAdminToast(`Đơn #${id} → ${labels[newStatus]}`);
        loaded.orders = false;
        loaded.overview = false;
        await loadOrders();
        await loadOverview();
    } catch (err) {
        showAdminToast('Lỗi cập nhật: ' + err.message, 'error');
    }
};

// --- CTV LIST with tier upgrade (via admin RPC) ---
async function loadCTVList() {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_list_ctv', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải danh sách CTV' }
        );
        if (error) throw error;
        renderCTVTable('allCTV', data || []);
    } catch (err) {
        handleApiError(err, 'Tải danh sách CTV', showAdminToast);
    }
}

function renderCTVTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!data?.length) {
        container.innerHTML = '<div class="admin-empty">Chưa có CTV</div>';
        return;
    }

    const tierMap = { silver: '🥈 Bạc', gold: '🥇 Vàng', diamond: '💎 Kim Cương' };
    const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // --- TABLE VIEW (Desktop) ---
    const tableHTML = `
<div class="ctv-table-wrapper">
<table class="admin-table">
<thead><tr><th>Mã CTV</th><th>Tên</th><th>SĐT</th><th>Email</th><th>Hạng</th><th>Điểm</th><th>VNĐ</th><th>Ngày ĐK</th><th>Nâng hạng</th></tr></thead>
<tbody>
${data.map(c => {
        const nextTier = c.tier === 'silver' ? 'gold' : c.tier === 'gold' ? 'diamond' : null;
        const upgradeBtn = nextTier
            ? `<button class="btn-action btn-approve" data-ref="${escapeHTML(c.referral_code)}" data-tier="${escapeHTML(nextTier)}" onclick="upgradeCTV(this.dataset.ref,this.dataset.tier)">${tierMap[nextTier]}</button>`
            : '<span class="text-muted">Max</span>';
        return `<tr>
        <td><code>${escapeHTML(c.referral_code)}</code></td>
        <td>${escapeHTML(c.name)}</td>
        <td>${escapeHTML(c.phone)}</td>
        <td>${escapeHTML(c.email) || '—'}</td>
        <td>${tierMap[c.tier] || escapeHTML(c.tier)}</td>
        <td>${parseInt(c.total_points) || 0}</td>
        <td>${Number(c.available_vnd || 0).toLocaleString('vi-VN')}₫</td>
        <td>${fmtDate(c.created_at)}</td>
        <td>${upgradeBtn}</td>
    </tr>`;
    }).join('')}
</tbody>
</table>
</div>`;

    // --- CARD VIEW (Mobile) ---
    const cardsHTML = `
<div class="ctv-cards">
<div class="ctv-cards-grid">
${data.map(c => {
        const nextTier = c.tier === 'silver' ? 'gold' : c.tier === 'gold' ? 'diamond' : null;
        const upgradeBtn = nextTier
            ? `<button class="btn-action btn-approve" data-ref="${escapeHTML(c.referral_code)}" data-tier="${escapeHTML(nextTier)}" onclick="upgradeCTV(this.dataset.ref,this.dataset.tier)">${tierMap[nextTier]}</button>`
            : '';
        return `
<div class="ctv-card">
    <div class="ctv-card-header">
        <span class="ctv-card-code">${escapeHTML(c.referral_code)}</span>
        <span class="badge badge-info">${tierMap[c.tier] || escapeHTML(c.tier)}</span>
    </div>
    <div class="ctv-card-name">${escapeHTML(c.name)}</div>
    <div class="ctv-card-info">
        <div class="ctv-card-row">
<span class="label">SĐT</span>
<span class="val">${escapeHTML(c.phone)}</span>
        </div>
        <div class="ctv-card-row">
<span class="label">Điểm</span>
<span class="val">${parseInt(c.total_points) || 0}</span>
        </div>
        <div class="ctv-card-row">
<span class="label">VNĐ khả dụng</span>
<span class="val">${Number(c.available_vnd || 0).toLocaleString('vi-VN')}₫</span>
        </div>
        <div class="ctv-card-row">
<span class="label">Ngày ĐK</span>
<span class="val">${fmtDate(c.created_at)}</span>
        </div>
    </div>
    ${upgradeBtn ? `<div class="ctv-card-footer">${upgradeBtn}</div>` : ''}
</div>`;
    }).join('')}
</div>
</div>`;

    container.innerHTML = tableHTML + cardsHTML;
}

// --- Upgrade CTV tier ---
window.upgradeCTV = async function (refCode, newTier) {
    const tierMap = { gold: 'Vàng', diamond: 'Kim Cương' };
    if (!confirm(`Nâng hạng ${refCode} lên ${tierMap[newTier]}?`)) return;

    try {
        const { error } = await supabase.rpc('admin_upgrade_ctv', {
            p_session_token: getSessionToken(), p_ref_code: refCode, p_new_tier: newTier
        });
        if (error) throw error;
        showAdminToast(`${refCode} → ${tierMap[newTier]}`);
        loaded.ctv = false;
        await loadCTVList();
    } catch (err) {
        showAdminToast('Lỗi nâng hạng: ' + err.message, 'error');
    }
};

// --- TESTIMONIALS ---
async function loadTestimonials() {
    const { data } = await supabase.from('company_testimonials')
        .select('*').order('created_at', { ascending: false }).limit(50);
    renderTable('allTestimonials', data, ['id', 'author_name', 'location', 'rating', 'quote', 'created_at'],
        ['ID', 'Tên', 'Địa điểm', 'Sao', 'Nội dung', 'Ngày tạo']);
}

// --- CONTACTS ---
async function loadContacts() {
    const { data } = await supabase.from('contact_submissions')
        .select('*').order('created_at', { ascending: false }).limit(50);
    renderTable('allContacts', data, ['id', 'name', 'phone', 'email', 'message', 'created_at'],
        ['ID', 'Tên', 'SĐT', 'Email', 'Nội dung', 'Ngày gửi']);
}

// --- POSTS (via admin RPC) ---
async function loadPosts() {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_list_posts', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải bài viết' }
        );
        if (error) throw error;

        const container = document.getElementById('allPosts');
        if (!data?.length) {
            container.innerHTML = '<div class="admin-empty">Chưa có bài viết</div>';
            return;
        }

        const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const catMap = { 'suc-khoe': '💚 Sức khỏe', 'cuoc-song': '🏡 Cuộc sống', 'trai-nghiem': '🌿 Trải nghiệm', 'meo-hay': '💡 Mẹo hay' };

        container.innerHTML = `<table class="admin-table">
    <thead><tr><th>ID</th><th>Tác giả</th><th>Tiêu đề</th><th>Chuyên mục</th><th>👁️</th><th>❤️</th><th>Nhuận bút</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead>
    <tbody>
        ${data.map(p => {
            const status = p.is_approved
                ? '<span class="badge badge-success">✓ Đã duyệt</span>'
                : '<span class="badge badge-warning">⏳ Chờ duyệt</span>';
            const reward = p.reward_points_granted
                ? '<span class="badge badge-success">✓ 30K</span>'
                : '<span style="color:var(--text-muted)">—</span>';
            const actions = !p.is_approved
                ? `<button class="btn-action btn-approve" data-id="${parseInt(p.id)}" onclick="approvePostReward(+this.dataset.id)">✓ Duyệt</button><button class="btn-action btn-reject" data-id="${parseInt(p.id)}" onclick="rejectPost(+this.dataset.id)">✗ Xóa</button>`
                : `<button class="btn-action btn-reject" data-id="${parseInt(p.id)}" onclick="rejectPost(+this.dataset.id)">Ẩn</button>`;
            return `<tr>
        <td>#${parseInt(p.id)}</td>
        <td>${escapeHTML(p.member_name)}</td>
        <td>${escapeHTML((p.title || '').substring(0, 40))}</td>
        <td>${catMap[p.category] || escapeHTML(p.category)}</td>
        <td>${parseInt(p.views) || 0}</td>
        <td>${parseInt(p.likes) || 0}</td>
        <td>${reward}</td>
        <td>${status}</td>
        <td>${fmtDate(p.created_at)}</td>
        <td>${actions}</td>
    </tr>`;
        }).join('')}
    </tbody>
</table>`;
    } catch (err) {
        handleApiError(err, 'Tải bài viết', showAdminToast);
    }
}

window.approvePostReward = async function (id) {
    if (!confirm(`Duyệt bài #${id} và cộng nhuận bút 30,000đ?`)) return;
    try {
        const { data, error } = await supabase.rpc('approve_post_and_reward', {
            p_session_token: getSessionToken(), p_post_id: id
        });
        if (error) throw error;
        if (data?.points_credited) {
            showAdminToast(`Bài #${id} đã duyệt + Cộng 30,000đ nhuận bút`);
        } else if (data?.message) {
            showAdminToast(data.message);
        } else {
            showAdminToast(`Bài #${id} đã duyệt (BTV chưa có tài khoản CTV)`);
        }
        loaded.posts = false;
        await loadPosts();
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
};

window.rejectPost = async function (id) {
    if (!confirm(`Xác nhận ẩn bài #${id}?`)) return;
    try {
        const { error } = await supabase.rpc('admin_update_post_status', {
            p_session_token: getSessionToken(), p_post_id: id, p_approve: false
        });
        if (error) throw error;
        showAdminToast(`Bài #${id} → ẩn`);
        loaded.posts = false;
        await loadPosts();
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
};

// --- WITHDRAWALS (via admin RPC) ---
async function loadAdminWithdrawals() {
    try {
        const { data } = await apiCall(
            () => supabase.rpc('admin_list_withdrawals', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải yêu cầu rút tiền' }
        );

        const container = document.getElementById('allWithdrawals');
        if (!data?.length) {
            container.innerHTML = '<div class="admin-empty">Chưa có yêu cầu rút tiền</div>';
            return;
        }

        const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        const fmtMoney = (v) => Number(v).toLocaleString('vi-VN') + '₫';
        const statusMap = {
            pending: '<span class="badge badge-warning">⏳ Chờ</span>',
            approved: '<span class="badge badge-info">✅ Duyệt</span>',
            paid: '<span class="badge badge-success">💰 Đã trả</span>',
            rejected: '<span class="badge badge-danger">✗ Từ chối</span>',
        };

        container.innerHTML = `<table class="admin-table">
    <thead><tr><th>ID</th><th>CTV</th><th>Số tiền</th><th>Ngân hàng</th><th>STK</th><th>Chủ TK</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead>
    <tbody>
        ${data.map(w => {
            const status = statusMap[w.status] || statusMap.pending;
            let actions = '';
            if (w.status === 'pending') {
                actions = `<button class="btn-action btn-approve" onclick="processWithdrawal(${w.id},'approved')">Duyệt</button>
   <button class="btn-action btn-reject" onclick="processWithdrawal(${w.id},'rejected')">✗</button>`;
            } else if (w.status === 'approved') {
                actions = `<button class="btn-action btn-approve" onclick="processWithdrawal(${w.id},'paid')">💰 Đã trả</button>`;
            }
            return `<tr>
        <td>#${parseInt(w.id)}</td>
        <td>${escapeHTML(w.ctv_name)}<br><small style="color:var(--text-muted)">${escapeHTML(w.ctv_code)}</small></td>
        <td style="color:var(--gold-light);font-weight:600">${fmtMoney(w.amount)}</td>
        <td>${escapeHTML(w.bank_name)}</td>
        <td>${escapeHTML(w.bank_account)}</td>
        <td>${escapeHTML(w.bank_holder)}</td>
        <td>${status}</td>
        <td>${fmtDate(w.created_at)}</td>
        <td>${actions}</td>
    </tr>`;
        }).join('')}
    </tbody>
</table>`;
    } catch (err) {
        handleApiError(err, 'Tải yêu cầu rút tiền', showAdminToast);
    }
}

window.processWithdrawal = async function (id, newStatus) {
    const label = { approved: 'duyệt', rejected: 'từ chối', paid: 'xác nhận đã thanh toán' };
    if (!confirm(`Xác nhận ${label[newStatus]} yêu cầu #${id}?`)) return;
    try {
        const { error } = await supabase.rpc('admin_process_withdrawal', {
            p_session_token: getSessionToken(), p_withdrawal_id: id, p_status: newStatus
        });
        if (error) throw error;
        showAdminToast(`Yêu cầu #${id} → ${label[newStatus]}`);
        loaded.withdrawals = false;
        await loadAdminWithdrawals();
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
};
// ===== PRODUCTS / SITE SETTINGS =====
let allSettings = {};
async function loadProductSettings() {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_get_settings', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải cài đặt' }
        );
        if (error) throw error;
        allSettings = {};
        (data || []).forEach(s => { allSettings[s.key] = s.value; });

        // --- Pricing Editor ---
        const pricing = allSettings.product_pricing || {};
        document.getElementById('pricingEditor').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Tên sản phẩm</label>
        <input class="admin-input" id="sp_name" value="${escapeHTML(pricing.product_name || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Mô tả ngắn</label>
        <input class="admin-input" id="sp_subtitle" value="${escapeHTML(pricing.product_subtitle || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">💰 Đơn giá (VNĐ)</label>
        <input class="admin-input" type="number" id="sp_price" value="${pricing.unit_price || 850000}" step="10000" min="0" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">🚚 Free ship từ (hộp)</label>
        <input class="admin-input" type="number" id="sp_freeship" value="${pricing.free_shipping_min || 3}" min="1" />
    </div>
</div>
<div style="margin-bottom:16px">
    <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:8px">📊 Giảm giá theo số lượng (%)</label>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
        ${(pricing.quantity_options || [1, 2, 3, 5, 10]).map(q => `
        <div style="text-align:center">
<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${q} hộp</div>
<input class="admin-input" type="number" id="sp_disc_${q}" value="${(pricing.discounts || {})[q] || 0}" min="0" max="50" step="1" style="text-align:center" />
        </div>
    `).join('')}
    </div>
</div>
<button class="btn-action btn-approve" onclick="savePricing()" style="padding:10px 24px;font-size:14px">💾 Lưu Bảng Giá</button>
`;

        // --- Hero Editor ---
        const hero = allSettings.hero_content || {};
        document.getElementById('heroEditor').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Tiêu đề Hero</label>
        <input class="admin-input" id="hero_title" value="${escapeHTML(hero.title || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Subtitle</label>
        <input class="admin-input" id="hero_subtitle" value="${escapeHTML(hero.subtitle || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Nút CTA</label>
        <input class="admin-input" id="hero_cta" value="${escapeHTML(hero.cta_text || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Badge text</label>
        <input class="admin-input" id="hero_badge" value="${escapeHTML(hero.badge_text || '')}" />
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveHero()" style="padding:10px 24px;font-size:14px">💾 Lưu Hero</button>
`;

        // --- Contact Editor ---
        const contact = allSettings.contact_info || {};
        document.getElementById('contactEditor').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">📱 Số điện thoại</label>
        <input class="admin-input" id="ct_phone" value="${escapeHTML(contact.phone || '')}" placeholder="0374867868" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">💬 Zalo (SĐT hoặc link)</label>
        <input class="admin-input" id="ct_zalo" value="${escapeHTML(contact.zalo || '')}" placeholder="0374867868" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">💙 Messenger (link m.me/...)</label>
        <input class="admin-input" id="ct_messenger" value="${escapeHTML(contact.messenger || '')}" placeholder="https://m.me/username" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">📍 Địa chỉ</label>
        <input class="admin-input" id="ct_address" value="${escapeHTML(contact.address || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">🕐 Giờ làm việc</label>
        <input class="admin-input" id="ct_hours" value="${escapeHTML(contact.working_hours || '')}" />
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveContact()" style="padding:10px 24px;font-size:14px">💾 Lưu Liên Hệ</button>
`;

        // --- CTV Config ---
        const ctv = allSettings.ctv_config || {};
        const rates = ctv.commission_rates || { silver: 8, gold: 12, diamond: 15 };
        document.getElementById('ctvConfigEditor').innerHTML = `
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px">
    <div style="text-align:center">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">🥈 Silver (%)</div>
        <input class="admin-input" type="number" id="ctv_silver" value="${rates.silver}" min="0" max="50" style="text-align:center" />
    </div>
    <div style="text-align:center">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">🥇 Gold (%)</div>
        <input class="admin-input" type="number" id="ctv_gold" value="${rates.gold}" min="0" max="50" style="text-align:center" />
    </div>
    <div style="text-align:center">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">💎 Diamond (%)</div>
        <input class="admin-input" type="number" id="ctv_diamond" value="${rates.diamond}" min="0" max="50" style="text-align:center" />
    </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Rút tối thiểu (VNĐ)</label>
        <input class="admin-input" type="number" id="ctv_minwd" value="${ctv.min_withdrawal || 200000}" step="50000" />
    </div>
    <div style="display:flex;align-items:end;gap:8px;padding-bottom:2px">
        <label style="font-size:13px;color:var(--text-sec)">
<input type="checkbox" id="ctv_open" ${ctv.registration_enabled !== false ? 'checked' : ''} /> Cho phép đăng ký CTV
        </label>
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveCtvConfig()" style="padding:10px 24px;font-size:14px">💾 Lưu CTV</button>
`;

        // --- Announcement ---
        const ann = allSettings.site_announcement || {};
        document.getElementById('announcementEditor').innerHTML = `
<div style="margin-bottom:14px">
    <label style="font-size:13px;color:var(--text-sec)">
        <input type="checkbox" id="ann_enabled" ${ann.enabled ? 'checked' : ''} /> Hiển thị thông báo
    </label>
</div>
<div style="margin-bottom:14px">
    <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Nội dung</label>
    <input class="admin-input" id="ann_msg" value="${escapeHTML(ann.message || '')}" placeholder="VD: 🎉 Khuyến mãi mua 3 tặng 1!" />
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Loại</label>
        <select class="admin-input" id="ann_type">
<option value="info" ${ann.type === 'info' ? 'selected' : ''}>ℹ️ Info</option>
<option value="success" ${ann.type === 'success' ? 'selected' : ''}>✅ Thành công</option>
<option value="warning" ${ann.type === 'warning' ? 'selected' : ''}>⚠️ Cảnh báo</option>
<option value="promo" ${ann.type === 'promo' ? 'selected' : ''}>🔥 Khuyến mãi</option>
        </select>
    </div>
    <div style="display:flex;align-items:end;gap:8px;padding-bottom:2px">
        <label style="font-size:13px;color:var(--text-sec)">
<input type="checkbox" id="ann_dismiss" ${ann.dismissible !== false ? 'checked' : ''} /> Cho phép đóng
        </label>
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveAnnouncement()" style="padding:10px 24px;font-size:14px">💾 Lưu Thông Báo</button>
`;
    } catch (err) { showAdminToast('Lỗi tải settings: ' + err.message, 'error'); }
}

// --- Save helpers ---
async function saveSetting(key, value) {
    const { error } = await supabase.rpc('admin_update_setting', {
        p_session_token: getSessionToken(), p_key: key, p_value: value
    });
    if (error) throw error;
    showAdminToast('Đã lưu thành công! ✅');
}

window.savePricing = async function () {
    try {
        const pricing = allSettings.product_pricing || {};
        pricing.product_name = document.getElementById('sp_name').value;
        pricing.product_subtitle = document.getElementById('sp_subtitle').value;
        pricing.unit_price = parseInt(document.getElementById('sp_price').value) || 850000;
        pricing.free_shipping_min = parseInt(document.getElementById('sp_freeship').value) || 3;
        (pricing.quantity_options || [1, 2, 3, 5, 10]).forEach(q => {
            const el = document.getElementById('sp_disc_' + q);
            if (el) pricing.discounts[q] = parseInt(el.value) || 0;
        });
        await saveSetting('product_pricing', pricing);
    } catch (err) { showAdminToast('Lỗi lưu giá: ' + err.message, 'error'); }
};

window.saveHero = async function () {
    try {
        await saveSetting('hero_content', {
            title: document.getElementById('hero_title').value,
            subtitle: document.getElementById('hero_subtitle').value,
            cta_text: document.getElementById('hero_cta').value,
            cta_link: '#contact',
            badge_text: document.getElementById('hero_badge').value,
        });
    } catch (err) { showAdminToast('Lỗi lưu hero: ' + err.message, 'error'); }
};

window.saveContact = async function () {
    try {
        await saveSetting('contact_info', {
            phone: document.getElementById('ct_phone').value,
            zalo: document.getElementById('ct_zalo').value,
            messenger: document.getElementById('ct_messenger').value,
            address: document.getElementById('ct_address').value,
            working_hours: document.getElementById('ct_hours').value,
        });
    } catch (err) { showAdminToast('Lỗi lưu liên hệ: ' + err.message, 'error'); }
};

window.saveCtvConfig = async function () {
    try {
        await saveSetting('ctv_config', {
            commission_rates: {
                silver: parseInt(document.getElementById('ctv_silver').value) || 8,
                gold: parseInt(document.getElementById('ctv_gold').value) || 12,
                diamond: parseInt(document.getElementById('ctv_diamond').value) || 15,
            },
            min_withdrawal: parseInt(document.getElementById('ctv_minwd').value) || 200000,
            registration_enabled: document.getElementById('ctv_open').checked,
            auto_approve: false,
        });
    } catch (err) { showAdminToast('Lỗi lưu CTV: ' + err.message, 'error'); }
};

window.saveAnnouncement = async function () {
    try {
        await saveSetting('site_announcement', {
            enabled: document.getElementById('ann_enabled').checked,
            message: document.getElementById('ann_msg').value,
            type: document.getElementById('ann_type').value,
            dismissible: document.getElementById('ann_dismiss').checked,
        });
    } catch (err) { showAdminToast('Lỗi lưu thông báo: ' + err.message, 'error'); }
};

async function loadAnalytics() {
    try {
        const { data: orders, error } = await apiCall(
            () => supabase.rpc('admin_get_analytics', {
                p_session_token: getSessionToken(), p_days: 30
            }),
            { retries: 2, context: 'Tải phân tích' }
        );
        if (error) throw error;

        if (!orders?.length) {
            document.getElementById('anMonthOrders').textContent = '0';
            document.getElementById('anMonthRevenue').textContent = '0₫';
            return;
        }

        // Month stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthOrders = orders.filter(o => o.created_at >= monthStart);
        const monthCompleted = monthOrders.filter(o => o.status === 'completed');
        document.getElementById('anMonthOrders').textContent = monthOrders.length;
        document.getElementById('anMonthRevenue').textContent =
            monthCompleted.reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString('vi-VN') + '₫';

        // --- Bar chart: Revenue by day ---
        const dayMap = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(5, 10); // MM-DD
            dayMap[key] = 0;
        }
        orders.filter(o => o.status !== 'cancelled').forEach(o => {
            const key = o.created_at.slice(5, 10);
            if (dayMap[key] !== undefined) dayMap[key] += (o.total_amount || 0);
        });

        const chartColors = {
            gold: 'rgba(212, 168, 83, 0.8)',
            goldBorder: 'rgba(212, 168, 83, 1)',
            gridColor: 'rgba(255,255,255,0.06)',
            textColor: '#a09888',
        };

        new Chart(document.getElementById('chartRevenue'), {
            type: 'bar',
            data: {
                labels: Object.keys(dayMap).map(k => k.replace('-', '/')),
                datasets: [{
                    label: 'Doanh thu (₫)',
                    data: Object.values(dayMap),
                    backgroundColor: chartColors.gold,
                    borderColor: chartColors.goldBorder,
                    borderWidth: 1,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ctx.raw.toLocaleString('vi-VN') + '₫'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: chartColors.gridColor },
                        ticks: {
                            color: chartColors.textColor,
                            callback: (v) => v >= 1000000 ? (v / 1000000) + 'M' : v >= 1000 ? (v / 1000) + 'K' : v
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartColors.textColor, maxRotation: 45 }
                    }
                }
            }
        });

        // --- Doughnut chart: Status breakdown ---
        const statusCount = { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
        orders.forEach(o => { if (statusCount[o.status] !== undefined) statusCount[o.status]++; });

        new Chart(document.getElementById('chartStatus'), {
            type: 'doughnut',
            data: {
                labels: ['Chờ duyệt', 'Đã duyệt', 'Đang giao', 'Hoàn thành', 'Đã hủy'],
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: [
                        'rgba(251,191,36,0.7)',
                        'rgba(96,165,250,0.7)',
                        'rgba(129,140,248,0.7)',
                        'rgba(74,222,128,0.7)',
                        'rgba(248,113,113,0.7)',
                    ],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: chartColors.textColor, padding: 16, font: { size: 13 } }
                    }
                }
            }
        });

    } catch (err) {
        handleApiError(err, 'Tải phân tích', showAdminToast);
    }

    // --- D11: Event Tracking Stats ---
    try {
        const { data: eventStats, error: evErr } = await supabase.rpc('get_event_stats', { p_days: 7 });
        if (!evErr && eventStats) {
            const stats = eventStats;

            // Summary cards
            const pageViews = stats.page_views || 0;
            const ctaClicks = stats.cta_clicks || 0;
            const deepScrolls = stats.deep_scrolls || 0;
            const sessions = stats.unique_sessions || 0;

            const pvEl = document.getElementById('anPageViews');
            const ccEl = document.getElementById('anCtaClicks');
            const dsEl = document.getElementById('anDeepScroll');
            const ssEl = document.getElementById('anSessions');

            if (pvEl) pvEl.textContent = pageViews.toLocaleString('vi-VN');
            if (ccEl) ccEl.textContent = ctaClicks.toLocaleString('vi-VN');
            if (dsEl) dsEl.textContent = deepScrolls.toLocaleString('vi-VN');
            if (ssEl) ssEl.textContent = sessions.toLocaleString('vi-VN');

            // Top CTA list
            const topCtaEl = document.getElementById('topCtaList');
            if (topCtaEl && stats.top_ctas?.length) {
                topCtaEl.innerHTML = `<table class="admin-table">
                    <thead><tr><th>#</th><th>CTA Target</th><th>Clicks</th></tr></thead>
                    <tbody>
                    ${stats.top_ctas.map((item, i) => `<tr>
                        <td>${i + 1}</td>
                        <td><code>${escapeHTML(item.target || item.event_target || '—')}</code></td>
                        <td style="color:var(--gold-light);font-weight:600">${item.count || item.click_count || 0}</td>
                    </tr>`).join('')}
                    </tbody>
                </table>`;
            } else if (topCtaEl) {
                topCtaEl.innerHTML = '<div class="admin-empty">Chưa có dữ liệu CTA clicks</div>';
            }
        }
    } catch {
        // Silent — event stats are non-critical
    }
}

// --- Generic render table helper ---
function renderTable(containerId, data, fields, headers) {
    const container = document.getElementById(containerId);
    if (!data?.length) {
        container.innerHTML = '<div class="admin-empty">Chưa có dữ liệu</div>';
        return;
    }

    container.innerHTML = `
<table class="admin-table">
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>
        ${data.map(row => `<tr>${fields.map(f => {
        let val = row[f];
        if (f === 'created_at' && val) {
            val = new Date(val).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
        if (f === 'total_amount' && val) val = Number(val).toLocaleString('vi-VN') + '₫';
        if (f === 'available_vnd' && val) val = Number(val).toLocaleString('vi-VN') + '₫';
        if (f === 'status') {
            const cls = val === 'completed' ? 'badge-success' : val === 'pending' ? 'badge-warning' : val === 'cancelled' ? 'badge-danger' : 'badge-info';
            val = `<span class="badge ${cls}">${escapeHTML(val) || '—'}</span>`;
            return `<td>${val}</td>`;
        }
        if (f === 'tier') {
            const map = { silver: '🥈 Bạc', gold: '🥇 Vàng', diamond: '💎 Kim Cương' };
            val = map[val] || escapeHTML(val) || '—';
            return `<td>${val}</td>`;
        }
        if (f === 'rating') { val = '⭐'.repeat(parseInt(val) || 0); return `<td>${val}</td>`; }
        if (f === 'quote' || f === 'message' || f === 'address') {
            val = String(val || '').substring(0, 60) + (String(val || '').length > 60 ? '...' : '');
        }
        return `<td>${escapeHTML(val) ?? '—'}</td>`;
    }).join('')}</tr>`).join('')}
    </tbody>
</table>
`;
}
