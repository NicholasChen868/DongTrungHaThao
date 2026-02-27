// ===================================
// QUICK LOGIN POPUP — Contextual CTV / Customer
// Reusable from any CTA that needs login
// ===================================
import { loginUser, getCurrentUser } from '../auth.js';
import { escapeHTML } from '../utils/sanitize.js';
import { checkRateLimit, recordAttempt } from '../utils/ratelimit.js';
import { saveCtvSession, initCtvBanner } from './ctv-banner.js';

let currentRole = 'ctv'; // 'ctv' or 'customer'
let onLoginSuccess = null; // callback after successful login

/**
 * Open login popup from anywhere
 * @param {object} opts
 * @param {string} opts.role - 'ctv' | 'customer'
 * @param {string} [opts.subtitle] - Custom subtitle text
 * @param {function} [opts.onSuccess] - Callback after login
 */
export function openLoginPopup(opts = {}) {
    const popup = document.getElementById('loginPopup');
    if (!popup) return;

    // Already logged in? Skip popup, call success directly
    const user = getCurrentUser();
    if (user) {
        if (opts.onSuccess) opts.onSuccess(user);
        return;
    }

    currentRole = opts.role || 'ctv';
    onLoginSuccess = opts.onSuccess || null;

    const icon = document.getElementById('loginPopupIcon');
    const sub = document.getElementById('loginPopupSub');
    const hint = document.getElementById('loginHint');

    if (currentRole === 'ctv') {
        if (icon) icon.textContent = '💼';
        if (sub) sub.textContent = opts.subtitle || 'Đăng nhập để quản lý CTV của bạn';
        if (hint) hint.innerHTML = 'CTV mới? <a href="#" id="loginSwitchRegister">Đăng ký ngay</a> — Mật khẩu mặc định là SĐT';
        setActiveTab('ctv');
    } else {
        if (icon) icon.textContent = '👤';
        if (sub) sub.textContent = opts.subtitle || 'Đăng nhập để theo dõi đơn hàng & nhận ưu đãi';
        if (hint) hint.innerHTML = 'Chưa có tài khoản? <a href="#" id="loginSwitchRegister">Đăng ký ngay</a>';
        setActiveTab('customer');
    }

    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('loginPhone')?.focus(), 400);
}

function setActiveTab(role) {
    document.querySelectorAll('.login-tab').forEach(t => {
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
    // Clear form
    const phone = document.getElementById('loginPhone');
    const pw = document.getElementById('loginPassword');
    if (phone) phone.value = '';
    if (pw) pw.value = '';
}

export function initLoginPopup(showToast) {
    const popup = document.getElementById('loginPopup');
    const closeBtn = document.getElementById('loginPopupClose');
    const form = document.getElementById('loginPopupForm');
    const tabs = document.querySelectorAll('.login-tab');
    if (!popup) return;

    // Close handlers
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
                if (hint) hint.innerHTML = 'Chưa có tài khoản? <a href="#" id="loginSwitchRegister">Đăng ký ngay</a>';
            }
            // removed bindRegisterSwitch();
        });
    });

    // Event delegation on stable container
    const hintContainer = document.getElementById('loginHint');
    if (hintContainer) {
        hintContainer.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'loginSwitchRegister') {
                e.preventDefault();
                closeLoginPopup();
                if (currentRole === 'customer') {
                    // Khách hàng → chuyển trang Thành Viên để đăng ký
                    window.location.href = '/thanh-vien.html';
                } else {
                    // CTV → mở popup đăng ký CTV
                    const ctvPopup = document.getElementById('ctvPopup');
                    if (ctvPopup) {
                        ctvPopup.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                }
            }
        });
    }

    // Form submit — uses existing unified auth (auth.js → loginUser)
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
                // Uses existing loginUser from auth.js
                // It tries authenticate_user → fallback authenticate_ctv
                const result = await loginUser(phone, password);

                if (result?.ok) {
                    closeLoginPopup();

                    const name = escapeHTML(result.display_name || result.name || phone);

                    // Gender-aware greeting — Vietnamese name heuristic
                    const femaleKeywords = ['thị', 'ngọc', 'phương', 'hương', 'lan', 'hoa', 'mai', 'linh', 'thu', 'hà', 'trang', 'yến', 'oanh', 'hạnh', 'thảo', 'loan', 'nga', 'hiền', 'nhung', 'dung', 'hằng', 'thư', 'diệu', 'mỹ', 'kim', 'thanh', 'vy', 'nhi', 'uyên', 'trâm', 'châu', 'my', 'thy', 'xuân', 'trinh', 'cúc', 'lệ'];
                    const nameLower = (result.display_name || result.name || '').toLowerCase();
                    const isFemale = femaleKeywords.some(k => nameLower.includes(k));
                    const honorific = isFemale ? 'chị' : 'anh';

                    // Motivational quotes — always positive, always different
                    const quotes = [
                        'Mỗi ngày là một cơ hội mới để khỏe hơn! 🌟',
                        'Sức khỏe là tài sản quý nhất — bạn đang đầu tư đúng chỗ! 💛',
                        'Hành trình ngàn dặm bắt đầu từ bước chân đầu tiên 🚀',
                        'Cơ thể bạn xứng đáng được chăm sóc tốt nhất! ✨',
                        'Kiên trì mỗi ngày — thay đổi sẽ đến từ những điều nhỏ 💪',
                        'Chúc bạn một ngày thật nhiều năng lượng! ☀️',
                        'Khỏe từ bên trong, tỏa sáng từ bên ngoài! 🌿',
                    ];
                    const quote = quotes[Math.floor(Math.random() * quotes.length)];

                    const roleLabel = result.role === 'ctv' ? ' · CTV' : '';

                    showToast(
                        `Chào ${honorific} <strong>${name}</strong>${roleLabel}!<br><span style="font-size:13px;opacity:0.9">${quote}</span>`,
                        true,
                        { html: true, duration: 5000 }
                    );

                    // If CTV, init banner
                    if (result.role === 'ctv' && result.referral_code) {
                        saveCtvSession({
                            referral_code: result.referral_code,
                            name: result.name,
                            rank: result.tier || 'bronze',
                            points: result.total_points || 0,
                        });
                        initCtvBanner(showToast);
                    }

                    if (onLoginSuccess) onLoginSuccess(result);
                } else {
                    showToast('Sai SĐT hoặc mật khẩu. Thử lại nhé!', false);
                }
            } catch (err) {
                showToast('Lỗi kết nối. Vui lòng thử lại.', false);
            } finally {
                if (btn) btn.textContent = orig;
            }
        });
    }
}

