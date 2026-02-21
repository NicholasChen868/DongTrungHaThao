// ===================================
// AUTH STATE MANAGEMENT
// Unified auth for all roles:
// admin, btv, ctv, member, loyal_customer, guest
// ===================================
import { supabase } from './supabase.js';

const SESSION_KEY = 'maldala_user';
const SESSION_EXPIRY_KEY = 'maldala_session_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// --- Role Config ---
const ROLE_CONFIG = {
    admin: {
        label: 'ADMIN',
        icon: '👑',
        gradient: 'linear-gradient(135deg, #ff4444, #d4a853)',
        color: '#ff4444',
        menuItems: [
            { label: '📊 Dashboard Tổng Quan', href: '/admin-dashboard.html' },
            { label: '👥 Quản Lý Người Dùng', href: '/admin-dashboard.html?tab=users' },
            { label: '📦 Quản Lý Đơn Hàng', href: '/admin-dashboard.html?tab=orders' },
            { label: '💰 CTV Dashboard', href: '/ctv-dashboard.html' },
            { label: '🏥 Bản Đồ Sức Khỏe', href: '/ban-do-suc-khoe.html' },
            { label: '👤 Hồ Sơ Cá Nhân', href: '#profile', action: 'profile' },
        ]
    },
    btv: {
        label: 'BTV',
        icon: '📝',
        gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
        color: '#a855f7',
        menuItems: [
            { label: '📝 Dashboard BTV', href: '/btv-dashboard.html' },
            { label: '📄 Quản Lý Bài Viết', href: '/btv-dashboard.html?tab=posts' },
            { label: '✅ Duyệt Chia Sẻ', href: '/btv-dashboard.html?tab=review' },
            { label: '👤 Hồ Sơ Cá Nhân', href: '#profile', action: 'profile' },
        ]
    },
    ctv: {
        label: 'CTV',
        icon: '💰',
        gradient: 'linear-gradient(135deg, #22c55e, #4ade80)',
        color: '#22c55e',
        menuItems: [
            { label: '📊 Dashboard CTV', href: '/ctv-dashboard.html' },
            { label: '🔗 Chia Sẻ Link', href: '/ctv-dashboard.html?tab=share' },
            { label: '⭐ Điểm Thưởng', href: '/ctv-dashboard.html?tab=points' },
            { label: '💳 Rút Tiền', href: '/ctv-dashboard.html?tab=withdraw' },
            { label: '👤 Hồ Sơ Cá Nhân', href: '#profile', action: 'profile' },
        ]
    },
    loyal_customer: {
        label: 'KHTT',
        icon: '⭐',
        gradient: 'linear-gradient(135deg, #d4a853, #e8c97a)',
        color: '#d4a853',
        menuItems: [
            { label: '🏥 Bản Đồ Sức Khỏe', href: '/ban-do-suc-khoe.html' },
            { label: '⭐ Điểm Thưởng', href: '/thanh-vien.html?tab=points' },
            { label: '📦 Lịch Sử Đơn Hàng', href: '/thanh-vien.html?tab=orders' },
            { label: '👤 Hồ Sơ Cá Nhân', href: '#profile', action: 'profile' },
        ]
    },
    member: {
        label: 'TV',
        icon: '🎖️',
        gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
        color: '#94a3b8',
        menuItems: [
            { label: '⭐ Điểm Thưởng', href: '/thanh-vien.html?tab=points' },
            { label: '📦 Lịch Sử Đơn Hàng', href: '/thanh-vien.html?tab=orders' },
            { label: '👤 Hồ Sơ Cá Nhân', href: '#profile', action: 'profile' },
        ]
    },
    guest: {
        label: '',
        icon: '',
        gradient: 'none',
        color: '#665e52',
        menuItems: []
    }
};

// --- Session Management ---
export function getCurrentUser() {
    try {
        const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
        if (expiry && Date.now() > parseInt(expiry)) {
            logout(false);
            return null;
        }
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setCurrentUser(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION));
    if (user.referral_code) {
        localStorage.setItem('ctv_ref_code', user.referral_code);
    }
}

export function logout(redirect = true) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem('ctv_ref_code');
    if (redirect) window.location.reload();
}

export function getRoleConfig(role) {
    return ROLE_CONFIG[role] || ROLE_CONFIG.guest;
}

// --- SHA-256 ---
export async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Login (unified: members + ctv_accounts fallback) ---
export async function loginUser(phone, password) {
    try {
        const pwHash = await sha256(password);

        // 1) Try unified auth (members table)
        const { data, error } = await supabase.rpc('authenticate_user', {
            p_phone: phone,
            p_password_hash: pwHash
        });
        if (!error && data?.ok) {
            setCurrentUser(data);
            return data;
        }

        // 2) Fallback: CTV-specific auth (ctv_accounts table)
        const { data: ctvData, error: ctvErr } = await supabase.rpc('authenticate_ctv', {
            p_phone: phone,
            p_password_hash: pwHash
        });
        if (!ctvErr && ctvData?.ok) {
            // Map CTV data to unified format
            const userData = {
                ok: true,
                user_id: ctvData.user_id || ctvData.id,
                name: ctvData.name,
                display_name: ctvData.name,
                role: 'ctv',
                tier: ctvData.tier || 'silver',
                referral_code: ctvData.referral_code,
                total_points: ctvData.total_points || 0,
                email: ctvData.email
            };
            setCurrentUser(userData);
            return userData;
        }

        return { ok: false, error: data?.error || 'Sai số điện thoại hoặc mật khẩu' };
    } catch (err) {
        console.error('Login error:', err.message);
        return { ok: false, error: 'Lỗi kết nối. Vui lòng thử lại.' };
    }
}

// ===================================
// LOGIN MODAL POPUP
// Opens on any page when user clicks "Đăng Nhập"
// After login → updates auth banner in-place
// ===================================
function showLoginModal() {
    // Remove if already exists
    const existing = document.getElementById('authLoginModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'authLoginModal';
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
        <div class="auth-modal">
            <button class="auth-modal-close" id="authModalClose">✕</button>
            <div class="auth-modal-header">
                <div class="auth-modal-logo">🔐</div>
                <h2>Đăng Nhập</h2>
                <p>Chào mừng trở lại! Nhập thông tin để tiếp tục.</p>
            </div>
            <form id="authModalForm" class="auth-modal-form">
                <div class="auth-modal-field">
                    <label>Số điện thoại</label>
                    <input type="tel" id="authModalPhone" placeholder="VD: 0901234567" 
                           pattern="0[0-9]{9}" maxlength="10" required autocomplete="tel" />
                </div>
                <div class="auth-modal-field">
                    <label>Mật khẩu</label>
                    <input type="password" id="authModalPassword" placeholder="Nhập mật khẩu" 
                           required minlength="6" autocomplete="current-password" />
                </div>
                <div class="auth-modal-error" id="authModalError"></div>
                <button type="submit" class="auth-modal-submit" id="authModalSubmit">
                    Đăng Nhập
                </button>
            </form>
            <div class="auth-modal-footer">
                <a href="/ctv-dashboard.html" class="auth-modal-link">Đăng ký CTV mới →</a>
            </div>

            <!-- Success View (hidden initially) -->
            <div class="auth-modal-success" id="authModalSuccess" style="display:none">
                <div class="auth-success-icon" id="authSuccessIcon">✅</div>
                <h3 id="authSuccessTitle">Đăng nhập thành công!</h3>
                <p id="authSuccessMsg">Chào mừng bạn trở lại.</p>
                <div class="auth-success-badge" id="authSuccessBadge"></div>
                <div class="auth-success-actions" id="authSuccessActions"></div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => modal.classList.add('open'));

    // Close modal
    const closeModal = () => {
        modal.classList.remove('open');
        setTimeout(() => modal.remove(), 300);
    };

    document.getElementById('authModalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle form submit
    document.getElementById('authModalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('authModalPhone').value.trim();
        const password = document.getElementById('authModalPassword').value;
        const errEl = document.getElementById('authModalError');
        const btn = document.getElementById('authModalSubmit');

        errEl.textContent = '';
        btn.disabled = true;
        btn.textContent = 'Đang xác thực...';

        const result = await loginUser(phone, password);

        if (!result?.ok) {
            errEl.textContent = result?.error || 'Sai thông tin đăng nhập';
            btn.disabled = false;
            btn.textContent = 'Đăng Nhập';
            return;
        }

        // SUCCESS — show success view
        const config = getRoleConfig(result.role);
        const form = document.getElementById('authModalForm');
        const footer = modal.querySelector('.auth-modal-footer');
        const header = modal.querySelector('.auth-modal-header');
        const successEl = document.getElementById('authModalSuccess');

        form.style.display = 'none';
        if (footer) footer.style.display = 'none';
        header.style.display = 'none';
        successEl.style.display = 'block';

        document.getElementById('authSuccessIcon').textContent = config.icon || '✅';
        document.getElementById('authSuccessTitle').textContent =
            `Xin chào, ${escapeForHTML(result.display_name || result.name)}!`;
        document.getElementById('authSuccessMsg').textContent =
            `Đăng nhập thành công với vai trò ${config.label || 'Thành viên'}`;

        // Show role badge
        const badgeEl = document.getElementById('authSuccessBadge');
        if (config.label) {
            badgeEl.innerHTML = `<span class="auth-badge" style="background:${config.gradient};padding:6px 16px;font-size:14px">${config.icon} ${config.label}</span>`;
        }

        // Show action buttons based on role
        const actionsEl = document.getElementById('authSuccessActions');
        let dashboardHref = '/';
        if (result.role === 'ctv') dashboardHref = '/ctv-dashboard.html';
        else if (result.role === 'btv') dashboardHref = '/btv-dashboard.html';
        else if (result.role === 'admin') dashboardHref = '/admin-dashboard.html';
        else if (result.role === 'member' || result.role === 'loyal_customer') dashboardHref = '/thanh-vien.html';

        const isCurrentPage = window.location.pathname === dashboardHref ||
            (dashboardHref === '/' && (window.location.pathname === '/' || window.location.pathname === '/index.html'));

        actionsEl.innerHTML = `
            ${!isCurrentPage ? `<a href="${dashboardHref}" class="auth-success-btn primary">${config.icon} Vào ${config.label || ''} Dashboard</a>` : ''}
            <button class="auth-success-btn secondary" id="authSuccessContinue">Tiếp tục duyệt web</button>
        `;

        // "Tiếp tục" button — close modal and refresh banner
        document.getElementById('authSuccessContinue')?.addEventListener('click', () => {
            closeModal();
            // Re-render auth banner with new user data
            renderAuthBanner();
        });

        // Also update the banner immediately
        renderAuthBanner();
    });
}

// --- User Banner Component ---
export function renderAuthBanner() {
    const user = getCurrentUser();

    // Find the nav element — different pages use different class names
    const nav = document.querySelector('.s-nav, .r-nav, .navbar .nav-container, nav');
    if (!nav) return;

    // Remove any existing auth banner
    const existing = document.getElementById('authBanner');
    if (existing) existing.remove();

    // For homepage navbar, find the nav-links list and append there
    const navLinks = nav.querySelector('.nav-links, ul');

    if (!user) {
        // Not logged in — add login button that opens modal
        const loginEl = document.createElement(navLinks ? 'li' : 'a');
        loginEl.id = 'authBanner';
        loginEl.className = 'auth-login-wrapper';
        if (navLinks) {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'nav-link auth-login-link';
            link.textContent = '🔐 Đăng Nhập';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginModal();
            });
            loginEl.appendChild(link);
            navLinks.appendChild(loginEl);
        } else {
            loginEl.href = '#';
            loginEl.className = 'auth-login-link';
            loginEl.textContent = '🔐 Đăng Nhập';
            loginEl.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginModal();
            });
            nav.appendChild(loginEl);
        }
        return;
    }

    // Logged in — build the banner
    const config = getRoleConfig(user.role);
    const wrapper = document.createElement(navLinks ? 'li' : 'div');
    wrapper.id = 'authBanner';
    wrapper.className = 'auth-banner';
    wrapper.innerHTML = `
        <button class="auth-user-btn" id="authUserBtn">
            <span class="auth-avatar">${config.icon || user.display_name?.charAt(0) || '👤'}</span>
            <span class="auth-name">${escapeForHTML(user.display_name || user.name)}</span>
            ${config.label ? `<span class="auth-badge" style="background:${config.gradient}">${config.label}</span>` : ''}
            <span class="auth-chevron">▾</span>
        </button>
        <div class="auth-dropdown" id="authDropdown">
            <div class="auth-dropdown-header">
                <div class="auth-dropdown-name">${escapeForHTML(user.display_name || user.name)}</div>
                <div class="auth-dropdown-role">${config.icon} ${config.label || 'Thành viên'} · ${user.total_points || 0} điểm</div>
            </div>
            <div class="auth-dropdown-divider"></div>
            ${config.menuItems.map(item => `
                <a href="${item.href}" class="auth-dropdown-item" ${item.action ? `data-action="${item.action}"` : ''}>
                    ${item.label}
                </a>
            `).join('')}
            <div class="auth-dropdown-divider"></div>
            <button class="auth-dropdown-item auth-logout-btn" id="authLogoutBtn">
                🚪 Đăng Xuất
            </button>
        </div>
    `;

    // Append to nav
    if (navLinks) {
        navLinks.appendChild(wrapper);
    } else {
        nav.appendChild(wrapper);
    }

    // Toggle dropdown
    const btn = document.getElementById('authUserBtn');
    const dropdown = document.getElementById('authDropdown');

    btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', () => {
        dropdown?.classList.remove('open');
    });

    // Logout
    document.getElementById('authLogoutBtn')?.addEventListener('click', () => {
        logout();
    });
}

// --- Inject Auth CSS ---
export function injectAuthStyles() {
    if (document.getElementById('authStyles')) return;

    const style = document.createElement('style');
    style.id = 'authStyles';
    style.textContent = `
        /* === Auth Banner === */
        .auth-banner {
            position: relative;
            display: inline-flex;
            align-items: center;
        }

        .auth-user-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(212,168,83,0.2);
            border-radius: 24px;
            cursor: pointer;
            font-family: inherit;
            font-size: 13px;
            color: #f5f0e8;
            transition: all 0.3s;
        }

        .auth-user-btn:hover {
            background: rgba(212,168,83,0.1);
            border-color: rgba(212,168,83,0.4);
        }

        .auth-avatar { font-size: 16px; line-height: 1; }

        .auth-name {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 500;
        }

        .auth-badge {
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 800;
            color: #fff;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .auth-chevron {
            font-size: 10px;
            opacity: 0.6;
            transition: transform 0.2s;
        }

        .auth-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            min-width: 240px;
            background: #141414;
            border: 1px solid rgba(212,168,83,0.2);
            border-radius: 12px;
            padding: 8px 0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px);
            transition: all 0.25s ease;
            z-index: 1000;
        }

        .auth-dropdown.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .auth-dropdown-header { padding: 12px 16px; }

        .auth-dropdown-name {
            font-weight: 600;
            font-size: 14px;
            color: #f5f0e8;
        }

        .auth-dropdown-role {
            font-size: 12px;
            color: #a09888;
            margin-top: 2px;
        }

        .auth-dropdown-divider {
            height: 1px;
            background: rgba(212,168,83,0.1);
            margin: 4px 0;
        }

        .auth-dropdown-item {
            display: block;
            width: 100%;
            padding: 10px 16px;
            font-size: 13px;
            color: #b0a596;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            background: none;
            text-align: left;
            font-family: inherit;
        }

        .auth-dropdown-item:hover {
            background: rgba(212,168,83,0.08);
            color: #e8c97a;
        }

        .auth-logout-btn { color: #f87171 !important; }
        .auth-logout-btn:hover {
            background: rgba(248,113,113,0.1) !important;
            color: #f87171 !important;
        }

        /* === LOGIN BUTTON (chưa đăng nhập) === */
        .auth-login-wrapper {
            display: flex;
            align-items: center;
        }

        .auth-login-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 16px;
            background: transparent;
            border: 1.5px solid rgba(212,168,83,0.55);
            border-radius: 24px;
            color: #e8c97a !important;
            text-decoration: none !important;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.02em;
            transition: all 0.25s ease;
            white-space: nowrap;
            cursor: pointer;
        }

        .auth-login-btn:hover {
            background: rgba(212,168,83,0.12);
            border-color: rgba(212,168,83,0.85);
            color: #f5d78a !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(212,168,83,0.2);
        }

        .auth-login-icon {
            font-size: 14px;
            line-height: 1;
        }

        /* === Login Modal === */
        .auth-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            padding: 20px;
        }

        .auth-modal-overlay.open { opacity: 1; }

        .auth-modal {
            background: #111;
            border: 1px solid rgba(212,168,83,0.2);
            border-radius: 20px;
            padding: 32px;
            width: 100%;
            max-width: 400px;
            position: relative;
            transform: scale(0.9) translateY(20px);
            transition: transform 0.3s ease;
            box-shadow: 0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(212,168,83,0.05);
        }

        .auth-modal-overlay.open .auth-modal {
            transform: scale(1) translateY(0);
        }

        .auth-modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            color: #666;
            font-size: 20px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
        }

        .auth-modal-close:hover {
            background: rgba(255,255,255,0.08);
            color: #fff;
        }

        .auth-modal-header {
            text-align: center;
            margin-bottom: 24px;
        }

        .auth-modal-logo {
            font-size: 40px;
            margin-bottom: 12px;
        }

        .auth-modal-header h2 {
            font-size: 22px;
            color: #f5f0e8;
            margin: 0 0 6px;
        }

        .auth-modal-header p {
            font-size: 13px;
            color: #888;
            margin: 0;
        }

        .auth-modal-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .auth-modal-field label {
            display: block;
            font-size: 12px;
            color: #888;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }

        .auth-modal-field input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(212,168,83,0.15);
            border-radius: 10px;
            color: #f5f0e8;
            font-size: 15px;
            font-family: inherit;
            transition: border-color 0.2s;
        }

        .auth-modal-field input:focus {
            outline: none;
            border-color: rgba(212,168,83,0.5);
        }

        .auth-modal-field input::placeholder {
            color: #555;
        }

        .auth-modal-error {
            color: #f87171;
            font-size: 13px;
            min-height: 18px;
            text-align: center;
        }

        .auth-modal-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #d4a853, #b8860b);
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
            transition: opacity 0.2s, transform 0.1s;
        }

        .auth-modal-submit:hover { opacity: 0.9; }
        .auth-modal-submit:active { transform: scale(0.98); }
        .auth-modal-submit:disabled { opacity: 0.5; cursor: wait; }

        .auth-modal-footer {
            text-align: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .auth-modal-link {
            color: #d4a853;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s;
        }

        .auth-modal-link:hover { color: #e8c97a; }

        /* Success State */
        .auth-modal-success {
            text-align: center;
            padding: 20px 0;
        }

        .auth-success-icon {
            font-size: 56px;
            margin-bottom: 16px;
            animation: authBounceIn 0.5s ease;
        }

        @keyframes authBounceIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .auth-modal-success h3 {
            font-size: 20px;
            color: #f5f0e8;
            margin: 0 0 6px;
        }

        .auth-modal-success p {
            font-size: 14px;
            color: #888;
            margin: 0 0 20px;
        }

        .auth-success-badge {
            margin-bottom: 20px;
        }

        .auth-success-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .auth-success-btn {
            display: block;
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            text-align: center;
            text-decoration: none;
            transition: all 0.2s;
        }

        .auth-success-btn.primary {
            background: linear-gradient(135deg, #d4a853, #b8860b);
            color: #fff;
            border: none;
        }

        .auth-success-btn.primary:hover { opacity: 0.9; }

        .auth-success-btn.secondary {
            background: rgba(255,255,255,0.05);
            color: #ccc;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .auth-success-btn.secondary:hover {
            background: rgba(255,255,255,0.1);
            color: #fff;
        }

        /* Mobile: nút login chiếm full width trong drawer */
        @media (max-width: 900px) {
            .auth-login-wrapper {
                width: 100%;
                padding: 4px 0 8px;
            }
            .auth-login-btn {
                width: 100%;
                justify-content: center;
                padding: 12px 16px;
                font-size: 14px;
                border-radius: 12px;
                background: rgba(212,168,83,0.07);
            }
            .auth-name {
                max-width: 80px;
                font-size: 12px;
            }
            .auth-user-btn {
                padding: 6px 10px;
                gap: 6px;
                font-size: 12px;
            }
            .auth-dropdown {
                right: -12px;
                min-width: 220px;
            }
            .auth-modal { padding: 24px; margin: 16px; }
        }
    `;
    document.head.appendChild(style);
}

// --- Escape HTML (simple) ---
function escapeForHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// --- Auto Init ---
export function initAuth() {
    injectAuthStyles();
    renderAuthBanner();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    setTimeout(initAuth, 50);
}
