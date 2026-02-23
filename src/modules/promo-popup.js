// ===================================
// PROMOTION POPUP — Seasonal discounts
// ===================================

export function initPromoPopup(showToast) {
    const popup = document.getElementById('promoPopup');
    const closeBtn = document.getElementById('promoPopupClose');
    const promoBtn = document.getElementById('fabPromo');
    const orderBtn = document.getElementById('promoOrderBtn');
    if (!popup) return;

    function closePromo() {
        popup.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openPromo() {
        // Close FAB
        const widget = document.getElementById('fabWidget');
        widget?.classList.remove('open');
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // FAB promo button
    if (promoBtn) promoBtn.addEventListener('click', openPromo);

    // Close
    if (closeBtn) closeBtn.addEventListener('click', closePromo);
    popup.addEventListener('click', (e) => { if (e.target === popup) closePromo(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) closePromo();
    });

    // Order button inside promo → scroll to contact
    if (orderBtn) {
        orderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closePromo();
            const contact = document.getElementById('contact');
            contact?.scrollIntoView({ behavior: 'smooth' });
            if (showToast) {
                setTimeout(() => {
                    showToast('🎁 Ưu đãi 5% đã được áp dụng tự động!', true, { duration: 4000 });
                }, 800);
            }
        });
    }
}
