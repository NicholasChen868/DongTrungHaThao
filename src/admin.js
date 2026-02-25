// ===================================
// ADMIN — Orchestrator
// Session, login, sidebar, section routing
// Tất cả logic nặng đã được tách vào src/admin/
// ===================================
import './admin.css';
import { supabase } from './supabase.js';
import { checkRateLimit, recordAttempt } from './utils/ratelimit.js';
import { getSessionToken, isSessionValid, adminLogin, adminLogout, clearSession } from './admin-session.js';
import { apiCall, handleApiError } from './utils/api.js';

// --- Modules ---
import { showAdminToast, exportCSV, renderTable } from './admin/admin-utils.js';
import { loadOrders as _loadOrders, renderOrderTable, updateOrder as _updateOrder } from './admin/admin-orders.js';
import { loadCTVList as _loadCTVList, upgradeCTV as _upgradeCTV } from './admin/admin-ctv.js';
import {
    loadPosts as _loadPosts,
    approvePostReward as _approvePostReward,
    rejectPost as _rejectPost,
    loadTestimonials as _loadTestimonials,
    loadContacts as _loadContacts,
    loadAdminWithdrawals as _loadAdminWithdrawals,
    processWithdrawal as _processWithdrawal,
} from './admin/admin-posts.js';
import { loadProductSettings as _loadProductSettings, savePricing, saveHero, saveContact, saveCtvConfig, saveAnnouncement } from './admin/admin-settings.js';
import { loadAnalytics as _loadAnalytics } from './admin/admin-analytics.js';

// --- Config ---
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const loginScreen = document.getElementById('adminLogin');
const sidebar = document.getElementById('adminSidebar');
const main = document.getElementById('adminMain');

// --- Shared deps object (truyền vào các module) ---
const deps = {
    supabase,
    getSessionToken,
    showAdminToast,
    renderTable,
    renderOrderTable,
    loaded: {},
};

// --- Section loaders (wrap module functions với deps) ---
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

async function loadOrders() { await _loadOrders({ ...deps, renderOrderTable }); }
async function loadCTVList() { await _loadCTVList(deps); }
async function loadTestimonials() { await _loadTestimonials(deps); }
async function loadContacts() { await _loadContacts(deps); }
async function loadPosts() { await _loadPosts(deps); }
async function loadAdminWithdrawals() { await _loadAdminWithdrawals(deps); }
async function loadProductSettings() { await _loadProductSettings(deps); }
async function loadAnalytics() { await _loadAnalytics(deps); }

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

// --- Check session ---
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

// --- Bypass Login (DEV ONLY) ---
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
const loaded = deps.loaded;

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

// --- Refresh section ---
window.refreshSection = async function (name) {
    loaded[name] = false;
    await loadSection(name);
    showAdminToast('Đã làm mới dữ liệu');
};

// --- Global window bindings (cho onclick trong HTML template) ---
window.exportCSV = (type) => exportCSV(type, deps);
window.updateOrder = (id, newStatus) => _updateOrder(id, newStatus, { ...deps, loaded, loadOrders, loadOverview });
window.upgradeCTV = (refCode, newTier) => _upgradeCTV(refCode, newTier, { ...deps, loaded, loadCTVList });
window.approvePostReward = (id) => _approvePostReward(id, { ...deps, loaded, loadPosts });
window.rejectPost = (id) => _rejectPost(id, { ...deps, loaded, loadPosts });
window.processWithdrawal = (id, newStatus) => _processWithdrawal(id, newStatus, { ...deps, loaded, loadAdminWithdrawals });
window.savePricing = () => savePricing(deps);
window.saveHero = () => saveHero(deps);
window.saveContact = () => saveContact(deps);
window.saveCtvConfig = () => saveCtvConfig(deps);
window.saveAnnouncement = () => saveAnnouncement(deps);
