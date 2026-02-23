// ===================================
// PROMOTION POPUP — Dynamic from Supabase
// Falls back to hardcoded HTML if DB unavailable
// ===================================
import { supabase } from '../supabase.js';

let activePromo = null; // Cached promo data

export function getActivePromo() { return activePromo; }

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
        const widget = document.getElementById('fabWidget');
        widget?.classList.remove('open');
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (promoBtn) promoBtn.addEventListener('click', openPromo);
    if (closeBtn) closeBtn.addEventListener('click', closePromo);
    popup.addEventListener('click', (e) => { if (e.target === popup) closePromo(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popup.classList.contains('active')) closePromo();
    });

    if (orderBtn) {
        orderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closePromo();
            const contact = document.getElementById('contact');
            contact?.scrollIntoView({ behavior: 'smooth' });
            const discount = activePromo?.discount_percent || 5;
            if (showToast) {
                setTimeout(() => {
                    showToast(`🎁 Ưu đãi ${discount}% đã được áp dụng tự động!`, true, { duration: 4000 });
                }, 800);
            }
        });
    }

    // Fetch active promo from DB and render
    loadActivePromo();
}

async function loadActivePromo() {
    try {
        const { data, error } = await supabase.rpc('get_active_promotion');
        if (error || !data?.ok) return; // Keep hardcoded fallback

        activePromo = data;
        renderPromo(data);
    } catch {
        // Silent — use hardcoded HTML fallback
    }
}

function renderPromo(promo) {
    // Title
    const titleEl = document.getElementById('promoPopupTitle');
    if (titleEl) titleEl.textContent = promo.title;

    // Icon
    const iconEl = document.querySelector('.promo-popup-icon');
    if (iconEl) iconEl.textContent = promo.icon || '🔥';

    // Tagline
    const taglineEl = document.querySelector('.promo-popup-tagline');
    if (taglineEl) taglineEl.textContent = promo.tagline || '';

    // Image
    if (promo.image_url) {
        const imgEl = document.querySelector('.promo-popup-header .popup-hero-img');
        if (imgEl) imgEl.src = promo.image_url;
    }

    // Badge
    const badgeEl = document.querySelector('.promo-badge');
    if (badgeEl) badgeEl.textContent = promo.badge_text || `GIẢM ${promo.discount_percent}%`;

    // Program name
    const programEl = document.querySelector('.promo-card-title');
    if (programEl && promo.program_name) {
        programEl.innerHTML = `Chương trình <strong>${promo.program_name}</strong>`;
    }

    // Story HTML
    const descEl = document.querySelector('.promo-card-desc');
    if (descEl && promo.story_html) {
        descEl.innerHTML = promo.story_html;
    }

    // Benefits
    if (promo.benefits?.length) {
        const benefitsEl = document.querySelector('.promo-popup-benefits');
        if (benefitsEl) {
            benefitsEl.innerHTML = promo.benefits.map(b =>
                `<div class="promo-benefit">
                    <span class="promo-benefit-icon">${b.icon}</span>
                    <span>${b.text}</span>
                </div>`
            ).join('');
        }
    }

    // CTA
    const ctaEl = document.getElementById('promoOrderBtn');
    if (ctaEl && promo.cta_text) ctaEl.textContent = promo.cta_text;

    // CTA note
    const noteEl = document.querySelector('.promo-popup-cta .promo-popup-note');
    if (noteEl && promo.cta_note) noteEl.textContent = promo.cta_note;

    // Footer quote
    const footerEl = document.querySelector('.promo-popup-footer em');
    if (footerEl && promo.footer_quote) footerEl.textContent = promo.footer_quote;

    // If promo has end date, show countdown hint
    if (promo.ends_at) {
        const end = new Date(promo.ends_at);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
        if (daysLeft <= 7 && daysLeft > 0) {
            const badgeEl2 = document.querySelector('.promo-badge');
            if (badgeEl2) badgeEl2.textContent += ` • Còn ${daysLeft} ngày`;
        }
    }
}
