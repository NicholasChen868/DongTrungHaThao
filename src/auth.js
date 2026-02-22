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
            logout();
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
    // Backward compat: CTV dashboard reads ctv_ref_code
    if (user.referral_code) {
        localStorage.setItem('ctv_ref_code', user.referral_code);
    }
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem('ctv_ref_code');
    window.location.href = '/';
}

export function getRoleConfig(role) {
    return ROLE_CONFIG[role] || ROLE_CONFIG.guest;
}

// --- SHA-256 ---
export async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Login ---
export async function loginUser(phone, password) {
    try {
        const pwHash = await sha256(password);
        const { data, error } = await supabase.rpc('authenticate_user', {
            p_phone: phone,
            p_password_hash: pwHash
        });
        if (error) throw error;
        if (data?.ok) {
            setCurrentUser(data);
        }
        return data;
    } catch (err) {
        console.error('Login error:', err.message);
        return { ok: false, error: err.message };
    }
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
        // Not logged in — add login button
        const loginEl = document.createElement(navLinks ? 'li' : 'div');
        loginEl.id = 'authBanner';
        loginEl.className = 'auth-login-wrapper';
        if (navLinks) {
            loginEl.innerHTML = '<a href="/ctv-dashboard.html" class="auth-login-btn"><span class="auth-login-icon">🔐</span><span class="auth-login-text">Đăng Nhập</span></a>';
            navLinks.appendChild(loginEl);
        } else {
            loginEl.innerHTML = '<a href="/ctv-dashboard.html" class="auth-login-btn"><span class="auth-login-icon">🔐</span><span class="auth-login-text">Đăng Nhập</span></a>';
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

        .auth-avatar {
            font-size: 16px;
            line-height: 1;
        }

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

        .auth-dropdown.open ~ .auth-user-btn .auth-chevron,
        .auth-user-btn:has(+ .auth-dropdown.open) .auth-chevron {
            transform: rotate(180deg);
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

        .auth-dropdown-header {
            padding: 12px 16px;
        }

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

        .auth-logout-btn {
            color: #f87171 !important;
        }

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
    // DOM already loaded, init right away (but with slight delay for nav to render)
    setTimeout(initAuth, 50);
}
