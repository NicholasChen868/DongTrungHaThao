// ===================================
// FLOATING BUTTONS — iOS-style bottom bar + FAB + CTV popup
// ===================================
import { supabase } from '../supabase.js';
import { escapeHTML } from '../utils/sanitize.js';
import { registerCTV, getAutoRef } from '../ctv.js';
import { checkRateLimit, recordAttempt } from '../utils/ratelimit.js';
import { saveCtvSession, initCtvBanner } from './ctv-banner.js';

export function initFloatingOrderBtn() {
    const btn = document.getElementById('floatingOrderBtn');
    const bottomBar = document.getElementById('bottomBar');
    const contactSection = document.getElementById('contact');
    if (!btn || !contactSection || !bottomBar) return;

    // Hide bottom bar when contact section is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            bottomBar.classList.toggle('hidden', entry.isIntersecting);
        });
    }, { threshold: 0.1 });

    observer.observe(contactSection);

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        contactSection.scrollIntoView({ behavior: 'smooth' });
    });
}

export function initContactWidget() {
    // FAB toggle
    const fabContainer = document.getElementById('fabContainer');
    const fabToggle = document.getElementById('fabToggle');
    if (fabContainer && fabToggle) {
        fabToggle.addEventListener('click', () => {
            fabContainer.classList.toggle('open');
        });

        // Close FAB when clicking outside
        document.addEventListener('click', (e) => {
            if (!fabContainer.contains(e.target) && fabContainer.classList.contains('open')) {
                fabContainer.classList.remove('open');
            }
        });

        // Escape key closes FAB
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fabContainer.classList.contains('open')) {
                fabContainer.classList.remove('open');
            }
        });
    }

    // Share button → open CTV popup
    const fabShare = document.getElementById('fabShare');
    if (fabShare) {
        fabShare.addEventListener('click', () => {
            fabContainer?.classList.remove('open');
            openCtvPopup();
        });
    }

    // Load contact links dynamically
    loadContactLinks();
}

export function initCtvPopup(showToast) {
    const popup = document.getElementById('ctvPopup');
    const closeBtn = document.getElementById('ctvPopupClose');
    const form = document.getElementById('ctvPopupForm');
    if (!popup) return;

    // Close popup
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

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const rl = checkRateLimit('ctv_popup', 3, 60000);
            if (!rl.allowed) {
                showToast(`Quá nhiều lần. Đợi ${Math.ceil(rl.remainingMs / 1000)}s`, false);
                return;
            }
            recordAttempt('ctv_popup', 60000);

            const name = document.getElementById('ctvPopupName').value.trim();
            const phone = document.getElementById('ctvPopupPhone').value.trim();
            const email = document.getElementById('ctvPopupEmail')?.value.trim() || null;

            if (!name || !phone) {
                showToast('Vui lòng điền họ tên và số điện thoại!', false);
                return;
            }

            const submitBtn = form.querySelector('.ctv-popup-submit');
            const origText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Đang xử lý...</span>';

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
                showToast('Lỗi kết nối. Vui lòng thử lại!', false);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origText;
            }
        });
    }
}

function openCtvPopup() {
    const popup = document.getElementById('ctvPopup');
    if (!popup) return;
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Auto-focus first input after animation
    setTimeout(() => {
        document.getElementById('ctvPopupName')?.focus();
    }, 400);
}

async function loadContactLinks() {
    try {
        const { data, error } = await supabase.rpc('get_contact_info');
        if (error || !data) return;

        const cwCall = document.getElementById('cwCall');
        const cwZalo = document.getElementById('cwZalo');
        const cwMessenger = document.getElementById('cwMessenger');

        if (cwCall && data.phone) {
            cwCall.href = `tel:${data.phone.replace(/\s/g, '')}`;
        }

        if (cwZalo && data.zalo) {
            cwZalo.href = data.zalo.startsWith('http') ? data.zalo : `https://zalo.me/${data.zalo}`;
        }

        if (cwMessenger && data.messenger) {
            cwMessenger.href = data.messenger;
            cwMessenger.style.display = '';
        } else if (cwMessenger) {
            cwMessenger.style.display = 'none';
        }
    } catch (e) {
        console.warn('⚠️ Could not load contact info:', e.message);
    }
}
