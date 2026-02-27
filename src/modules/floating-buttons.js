// ===================================
// FLOATING BUTTONS — Unified FAB Widget (single button, 2-tap)
// ===================================
import { supabase } from '../supabase.js';
import { escapeHTML } from '../utils/sanitize.js';
import { registerCTV, getAutoRef } from '../ctv.js';
import { checkRateLimit, recordAttempt } from '../utils/ratelimit.js';
import { saveCtvSession, initCtvBanner } from './ctv-banner.js';

// Rotating tooltip messages — align với Content Bible V3
const TOOLTIP_MESSAGES = [
    'Tư vấn hợp tác qua Zalo — miễn phí',
    'Gọi ngay 0903.940.171',
    'Đồng hành lan tỏa sức khỏe',
    '15 năm uy tín — 500+ đối tác',
    '100% con nhộng nguyên chất',
    'Trở thành đại lý — bắt đầu từ đây',
];

let tooltipIndex = 0;
let tooltipTimer = null;

function startTooltipRotation() {
    const textEl = document.getElementById('fabTooltipText');
    if (!textEl) return;

    tooltipTimer = setInterval(() => {
        tooltipIndex = (tooltipIndex + 1) % TOOLTIP_MESSAGES.length;
        textEl.style.opacity = '0';
        textEl.style.transform = 'translateY(4px)';
        setTimeout(() => {
            textEl.textContent = TOOLTIP_MESSAGES[tooltipIndex];
            textEl.style.opacity = '1';
            textEl.style.transform = 'translateY(0)';
        }, 200);
    }, 4000);
}

function stopTooltipRotation() {
    if (tooltipTimer) {
        clearInterval(tooltipTimer);
        tooltipTimer = null;
    }
}

export function initFloatingOrderBtn() {
    const btn = document.getElementById('floatingOrderBtn');
    const contactSection = document.getElementById('contact');
    if (!btn || !contactSection) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        // Close FAB menu
        const widget = document.getElementById('fabWidget');
        widget?.classList.remove('open');
        startTooltipRotation();
        contactSection.scrollIntoView({ behavior: 'smooth' });
    });
}

export function initContactWidget() {
    const widget = document.getElementById('fabWidget');
    const toggle = document.getElementById('fabToggle');
    if (!widget || !toggle) return;

    // Start tooltip rotation
    startTooltipRotation();

    toggle.addEventListener('click', () => {
        const isOpen = widget.classList.toggle('open');
        if (isOpen) {
            stopTooltipRotation();
        } else {
            startTooltipRotation();
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!widget.contains(e.target) && widget.classList.contains('open')) {
            widget.classList.remove('open');
            startTooltipRotation();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && widget.classList.contains('open')) {
            widget.classList.remove('open');
            startTooltipRotation();
        }
    });

    // CTV share button → open popup
    const fabShare = document.getElementById('fabShare');
    if (fabShare) {
        fabShare.addEventListener('click', () => {
            widget.classList.remove('open');
            startTooltipRotation();
            openCtvPopup();
        });
    }

    // Load contact links from Supabase
    loadContactLinks();
}

function openCtvPopup() {
    const popup = document.getElementById('ctvPopup');
    if (popup) {
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

async function loadContactLinks() {
    try {
        const { data, error } = await supabase.rpc('get_contact_info');
        if (error || !data) return;
        const zaloEl = document.getElementById('cwZalo');
        const callEl = document.getElementById('cwCall');
        const messengerEl = document.getElementById('cwMessenger');
        if (zaloEl && data.zalo) zaloEl.href = `https://zalo.me/${data.zalo}`;
        if (callEl && data.phone) callEl.href = `tel:${data.phone}`;
        if (messengerEl && data.messenger) messengerEl.href = `https://m.me/${data.messenger}`;
    } catch (e) {
        // Silent — use defaults from HTML
    }
}

export function initCtvPopup(showToast) {
    const popup = document.getElementById('ctvPopup');
    const closeBtn = document.getElementById('ctvPopupClose');
    const form = document.getElementById('ctvPopupForm');
    if (!popup) return;

    function closePopup() {
        popup.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closePopup();
        }
    });

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const rl = checkRateLimit('ctv_popup', 3, 60000);
            if (!rl.allowed) {
                showToast(`Quá nhiều lần. Đợi ${Math.ceil(rl.remainingMs / 1000)}s`, false);
                return;
            }
            recordAttempt('ctv_popup', 60000);

            const name = document.getElementById('ctvPopupName')?.value?.trim();
            const phone = document.getElementById('ctvPopupPhone')?.value?.trim();
            const email = document.getElementById('ctvPopupEmail')?.value?.trim();

            if (!name || !phone) {
                showToast('Vui lòng nhập họ tên và số điện thoại', false);
                return;
            }

            const submitBtn = form.querySelector('.ctv-popup-submit');
            const originalText = submitBtn?.innerHTML;
            if (submitBtn) submitBtn.innerHTML = '<span>Đang xử lý...</span>';

            try {
                const result = await registerCTV(name, phone, email);
                if (result?.ok) {
                    closePopup();

                    // Save session + activate banner
                    saveCtvSession({
                        referral_code: result.referral_code,
                        name,
                        rank: result.rank || 'bronze',
                        points: result.points || 0,
                        total_orders: result.total_orders || 0,
                        total_earnings: result.total_earnings || 0,
                    });
                    initCtvBanner(showToast);

                    if (result.existing) {
                        showToast(
                            `Chào mừng trở lại! Mã CTV: <strong>${escapeHTML(result.referral_code)}</strong>`
                            + `<br><a href="/ctv-dashboard.html" style="color:var(--gold-light);font-weight:600">Dashboard CTV</a>`,
                            true,
                            { html: true, duration: 6000 }
                        );
                    } else {
                        showToast(
                            `🎉 Đăng ký thành công! Mã CTV: <strong>${escapeHTML(result.referral_code)}</strong>`
                            + `<br><span style="font-size:13px">Mật khẩu Dashboard mặc định là <strong>SĐT</strong> của bạn</span>`
                            + `<br><a href="/ctv-dashboard.html" style="color:var(--gold-light);font-weight:600">Mở Dashboard</a>`,
                            true,
                            { html: true, duration: 8000 }
                        );
                    }
                    form.reset();
                } else {
                    showToast('Đăng ký thất bại. Vui lòng thử lại!', false);
                }
            } catch (err) {
                showToast('Lỗi kết nối. Vui lòng thử lại.', false);
            } finally {
                if (submitBtn) submitBtn.innerHTML = originalText;
            }
        });
    }
}
