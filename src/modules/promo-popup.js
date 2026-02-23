// ===================================
// PROMOTION POPUP — Multi-promo carousel
// Fetches all active promotions, shows as pages
// ===================================
import { supabase } from '../supabase.js';

let promos = [];       // All active promotions
let currentIndex = 0;  // Current page

export function getActivePromo() {
    return promos[currentIndex] || null;
}

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
            const discount = promos[currentIndex]?.discount_percent || 5;
            if (showToast) {
                setTimeout(() => {
                    showToast(`Ưu đãi ${discount}% đã được áp dụng!`, true, { duration: 4000 });
                }, 800);
            }
        });
    }

    // Fetch all active promos (hide FAB if none available)
    loadActivePromos(promoBtn);
}

async function loadActivePromos(promoBtn) {
    // Hardcoded fallback expiry (matches HTML promo)
    const FALLBACK_EXPIRY = new Date('2026-02-28T23:59:59');

    try {
        // Try new multi-promo RPC first
        const { data, error } = await supabase.rpc('get_all_active_promotions');
        if (!error && data?.ok && data.promotions?.length > 0) {
            promos = data.promotions;
            currentIndex = 0;
            renderPromo(promos[0]);
            if (promos.length > 1) renderPagination();
            return;
        }

        // Fallback to single-promo RPC
        const { data: single, error: err2 } = await supabase.rpc('get_active_promotion');
        if (!err2 && single?.ok) {
            promos = [single];
            currentIndex = 0;
            renderPromo(single);
            return;
        }

        // No DB promos — check fallback expiry
        if (new Date() > FALLBACK_EXPIRY && promoBtn) {
            promoBtn.style.display = 'none';
        }
    } catch {
        // No connection — check fallback expiry
        if (new Date() > FALLBACK_EXPIRY && promoBtn) {
            promoBtn.style.display = 'none';
        }
    }
}

function goToPage(index) {
    if (index < 0 || index >= promos.length) return;
    currentIndex = index;

    // Slide animation
    const popupEl = document.querySelector('.promo-popup');
    if (popupEl) {
        popupEl.classList.add('promo-transitioning');
        setTimeout(() => {
            renderPromo(promos[index]);
            renderPagination();
            popupEl.classList.remove('promo-transitioning');
        }, 200);
    } else {
        renderPromo(promos[index]);
        renderPagination();
    }
}

function renderPagination() {
    const popup = document.querySelector('.promo-popup');
    if (!popup || promos.length <= 1) return;

    // Remove existing pagination
    popup.querySelector('.promo-pagination')?.remove();

    const nav = document.createElement('div');
    nav.className = 'promo-pagination';

    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'promo-page-btn promo-page-prev';
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentIndex === 0;
    prevBtn.setAttribute('aria-label', 'Ưu đãi trước');
    prevBtn.addEventListener('click', () => goToPage(currentIndex - 1));

    // Dots
    const dots = document.createElement('div');
    dots.className = 'promo-page-dots';
    promos.forEach((p, i) => {
        const dot = document.createElement('button');
        dot.className = `promo-page-dot${i === currentIndex ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Ưu đãi ${i + 1}: ${p.title}`);
        dot.addEventListener('click', () => goToPage(i));
        dots.appendChild(dot);
    });

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'promo-page-btn promo-page-next';
    nextBtn.textContent = '›';
    nextBtn.disabled = currentIndex === promos.length - 1;
    nextBtn.setAttribute('aria-label', 'Ưu đãi tiếp');
    nextBtn.addEventListener('click', () => goToPage(currentIndex + 1));

    // Counter text
    const counter = document.createElement('span');
    counter.className = 'promo-page-counter';
    counter.textContent = `${currentIndex + 1} / ${promos.length}`;

    nav.appendChild(prevBtn);
    nav.appendChild(dots);
    nav.appendChild(nextBtn);
    nav.appendChild(counter);

    // Insert after header
    const header = popup.querySelector('.promo-popup-header');
    if (header) {
        header.after(nav);
    } else {
        popup.prepend(nav);
    }
}

function renderPromo(promo) {
    if (!promo) return;

    // Title
    const titleEl = document.getElementById('promoPopupTitle');
    if (titleEl) titleEl.textContent = promo.title;

    // Icon
    const iconEl = document.querySelector('.promo-popup-icon');
    if (iconEl) iconEl.textContent = promo.icon || '★';

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

    // Countdown badge
    if (promo.ends_at) {
        const end = new Date(promo.ends_at);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
        if (daysLeft <= 7 && daysLeft > 0) {
            const badgeEl2 = document.querySelector('.promo-badge');
            if (badgeEl2) badgeEl2.textContent += ` · Còn ${daysLeft} ngày`;
        }
    }
}
