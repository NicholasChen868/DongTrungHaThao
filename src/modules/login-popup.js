// ===================================
// QUICK LOGIN POPUP — Contextual CTV / Customer
// Reusable from any CTA that needs login
// ===================================
import { supabase } from '../supabase.js';
import { escapeHTML } from '../utils/sanitize.js';
import { checkRateLimit, recordAttempt } from '../utils/ratelimit.js';
import { saveCtvSession, initCtvBanner } from './ctv-banner.js';

let currentRole = 'ctv'; // 'ctv' or 'customer'
let onLoginSuccess = null; // callback after successful login

/**
 * Open login popup from anywhere
 * @param {object} opts
 * @param {string} opts.role - 'ctv' | 'customer' | 'auto'
 * @param {string} [opts.subtitle] - Custom subtitle text
 * @param {function} [opts.onSuccess] - Callback after login
 */
export function openLoginPopup(opts = {}) {
    const popup = document.getElementById('loginPopup');
    if (!popup) return;

    // Set role
    currentRole = opts.role || 'ctv';
    onLoginSuccess = opts.onSuccess || null;

    // Update UI based on role
    const icon = document.getElementById('loginPopupIcon');
    const sub = document.getElementById('loginPopupSub');
    const hint = document.getElementById('loginHint');
    const tabs = document.getElementById('loginTabs');

    if (currentRole === 'ctv') {
        if (icon) icon.textContent = '💼';
        if (sub) sub.textContent = opts.subtitle || 'Đăng nhập để quản lý CTV của bạn';
        if (hint) hint.innerHTML = 'CTV mới? <a href="#" id="loginSwitchRegister">Đăng ký ngay</a> — Mật khẩu mặc định là SĐT';
        setActiveTab('ctv');
    } else if (currentRole === 'customer') {
        if (icon) icon.textContent = '👤';
        if (sub) sub.textContent = opts.subtitle || 'Đăng nhập để theo dõi đơn hàng & nhận ưu đãi';
        if (hint) hint.innerHTML = 'Chưa có tài khoản? <a href="#" id="loginSwitchRegister">Tạo ngay</a>';
        setActiveTab('customer');
    }

    popup.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus phone input
    setTimeout(() => document.getElementById('loginPhone')?.focus(), 400);
}

function setActiveTab(role) {
    const tabs = document.querySelectorAll('.login-tab');
    tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.role === role);
    });
    currentRole = role;
}

function closeLoginPopup() {
    const popup = document.getElementById('loginPopup');
    if (popup) {
        popup.classList.remove('active');
        document.body.style.overflow = '';
    }
}

export function initLoginPopup(showToast) {
    const popup = document.getElementById('loginPopup');
    const closeBtn = document.getElementById('loginPopupClose');
    const form = document.getElementById('loginPopupForm');
    const tabs = document.querySelectorAll('.login-tab');
    if (!popup) return;

    // Close
    if (closeBtn) closeBtn.addEventListener('click', closeLoginPopup);
    popup.addEventListener('click', (e) => { if (e.target === popup) closeLoginPopup(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) closeLoginPopup();
    });

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveTab(tab.dataset.role);
            const hint = document.getElementById('loginHint');
            const sub = document.getElementById('loginPopupSub');
            const icon = document.getElementById('loginPopupIcon');
            if (tab.dataset.role === 'ctv') {
                if (icon) icon.textContent = '💼';
                if (sub) sub.textContent = 'Đăng nhập để quản lý CTV của bạn';
                if (hint) hint.innerHTML = 'CTV mới? <a href="#" id="loginSwitchRegister">Đăng ký ngay</a> — Mật khẩu mặc định là SĐT';
            } else {
                if (icon) icon.textContent = '👤';
                if (sub) sub.textContent = 'Đăng nhập để theo dõi đơn hàng & nhận ưu đãi';
                if (hint) hint.innerHTML = 'Chưa có tài khoản? <a href="#" id="loginSwitchRegister">Tạo ngay</a>';
            }
            // Re-bind register switch
            bindRegisterSwitch(showToast);
        });
    });

    // Register switch
    bindRegisterSwitch(showToast);

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const rl = checkRateLimit('login_popup', 5, 60000);
            if (!rl.allowed) {
                showToast(`Quá nhiều lần. Đợi ${Math.ceil(rl.remainingMs / 1000)}s`, false);
                return;
            }
            recordAttempt('login_popup', 60000);

            const phone = document.getElementById('loginPhone')?.value?.trim();
            const password = document.getElementById('loginPassword')?.value?.trim();

            if (!phone || !password) {
                showToast('Vui lòng nhập SĐT và mật khẩu', false);
                return;
            }

            const btn = document.getElementById('loginSubmitBtn');
            const orig = btn?.textContent;
            if (btn) btn.textContent = 'Đang xử lý...';

            try {
                if (currentRole === 'ctv') {
                    await loginCTV(phone, password, showToast);
                } else {
                    await loginCustomer(phone, password, showToast);
                }
            } catch (err) {
                showToast('Lỗi kết nối. Vui lòng thử lại.', false);
            } finally {
                if (btn) btn.textContent = orig;
            }
        });
    }
}

function bindRegisterSwitch(showToast) {
    setTimeout(() => {
        const switchEl = document.getElementById('loginSwitchRegister');
        if (switchEl) {
            switchEl.addEventListener('click', (e) => {
                e.preventDefault();
                closeLoginPopup();
                // Open CTV registration popup
                const ctvPopup = document.getElementById('ctvPopup');
                if (ctvPopup) {
                    ctvPopup.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }, 100);
}

async function loginCTV(phone, password, showToast) {
    // Try Supabase RPC for CTV login
    try {
        const { data, error } = await supabase.rpc('ctv_login', {
            p_phone: phone,
            p_password: password,
        });

        if (error || !data || data.length === 0) {
            showToast('Sai SĐT hoặc mật khẩu. CTV mới? Mật khẩu mặc định là SĐT', false);
            return;
        }

        const ctv = data[0] || data;
        closeLoginPopup();

        // Save session
        saveCtvSession({
            referral_code: ctv.referral_code,
            name: ctv.name,
            rank: ctv.rank || 'bronze',
            points: ctv.points || 0,
            total_orders: ctv.total_orders || 0,
            total_earnings: ctv.total_earnings || 0,
        });

        showToast(
            `Chào mừng, <strong>${escapeHTML(ctv.name)}</strong>! 💼`,
            true,
            { html: true, duration: 4000 }
        );

        // Init banner
        initCtvBanner(showToast);

        // Callback
        if (onLoginSuccess) onLoginSuccess(ctv);
    } catch (err) {
        showToast('Lỗi đăng nhập. Vui lòng thử lại.', false);
    }
}

async function loginCustomer(phone, password, showToast) {
    // Customer login via Supabase auth or custom RPC
    try {
        const { data, error } = await supabase.rpc('customer_login', {
            p_phone: phone,
            p_password: password,
        });

        if (error || !data) {
            showToast('Sai SĐT hoặc mật khẩu', false);
            return;
        }

        closeLoginPopup();
        localStorage.setItem('customer_session', JSON.stringify({
            phone,
            name: data.name || phone,
            logged_in_at: Date.now(),
        }));

        showToast(
            `Xin chào, <strong>${escapeHTML(data.name || phone)}</strong>! 👋`,
            true,
            { html: true, duration: 4000 }
        );

        if (onLoginSuccess) onLoginSuccess(data);
    } catch (err) {
        showToast('Lỗi đăng nhập. Vui lòng thử lại.', false);
    }
}
