// ===================================
// REORDER REMINDER
// Hiện banner nhắc đặt lại + giảm giá 3% cho khách quen
// ===================================

const REORDER_DISCOUNT_PERCENT = 3;

/**
 * Kiểm tra khách có đang được reorder discount không
 * Dùng bởi order-form.js để tự động áp dụng giảm giá
 */
export function getReorderDiscount() {
    try {
        if (sessionStorage.getItem('mdd_reorder_discount') === '1') {
            return REORDER_DISCOUNT_PERCENT;
        }
    } catch { /* ignore */ }
    return 0;
}

export function initReorderReminder() {
    const banner = document.getElementById('reorderBanner');
    const daysEl = document.getElementById('reorderDays');
    const dismissBtn = document.getElementById('reorderDismiss');
    const reorderBtn = document.getElementById('reorderBtn');
    if (!banner || !daysEl) return;

    try {
        const saved = JSON.parse(localStorage.getItem('mdd_customer'));
        if (!saved || !saved.lastOrder) return;

        const dismissed = localStorage.getItem('mdd_reorder_dismissed');
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

        const daysSince = Math.floor((Date.now() - saved.lastOrder) / (24 * 60 * 60 * 1000));
        if (daysSince < 30) return;

        daysEl.textContent = daysSince;
        banner.classList.remove('hidden-default');

        // Thêm text giảm giá vào banner
        const textEl = banner.querySelector('.reorder-text') || daysEl.parentElement;
        if (textEl && !banner.querySelector('.reorder-discount-hint')) {
            const hint = document.createElement('span');
            hint.className = 'reorder-discount-hint';
            hint.textContent = ` — Giảm ${REORDER_DISCOUNT_PERCENT}% cho khách quen`;
            hint.style.cssText = 'color: var(--gold-primary); font-weight: 600;';
            textEl.appendChild(hint);
        }

        // Khi click "Đặt Lại" → kích hoạt discount + cuộn xuống form
        if (reorderBtn) {
            reorderBtn.addEventListener('click', () => {
                sessionStorage.setItem('mdd_reorder_discount', '1');
            });
        }

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                localStorage.setItem('mdd_reorder_dismissed', Date.now().toString());
                banner.classList.add('hidden-default');
            });
        }
    } catch (e) { /* corrupted data */ }
}
