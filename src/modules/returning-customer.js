// ===================================
// RETURNING CUSTOMER GREETING
// ===================================

export function initReturningCustomer() {
    const banner = document.getElementById('greetingBanner');
    const nameEl = document.getElementById('greetingName');
    const dismissBtn = document.getElementById('greetingDismiss');
    if (!banner || !nameEl) return;

    try {
        const saved = JSON.parse(localStorage.getItem('mdd_customer'));
        if (!saved || !saved.name) return;

        nameEl.textContent = saved.name;
        banner.classList.remove('hidden-default');

        const nameInput = document.getElementById('orderName');
        const phoneInput = document.getElementById('orderPhone');
        if (nameInput && !nameInput.value) nameInput.value = saved.name;
        if (phoneInput && !phoneInput.value && saved.phone) phoneInput.value = saved.phone;

        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                localStorage.removeItem('mdd_customer');
                banner.classList.add('hidden-default');
                if (nameInput) nameInput.value = '';
                if (phoneInput) phoneInput.value = '';
            });
        }
    } catch (e) { /* corrupted data */ }
}
