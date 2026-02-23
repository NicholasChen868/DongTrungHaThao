// ===================================
// REORDER REMINDER
// ===================================

export function initReorderReminder() {
    const banner = document.getElementById('reorderBanner');
    const daysEl = document.getElementById('reorderDays');
    const dismissBtn = document.getElementById('reorderDismiss');
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

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                localStorage.setItem('mdd_reorder_dismissed', Date.now().toString());
                banner.classList.add('hidden-default');
            });
        }
    } catch (e) { /* corrupted data */ }
}
