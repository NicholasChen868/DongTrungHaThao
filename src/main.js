// ===================================
// MAIN.JS — Entry point (imports + initialization)
// Refactored from 1131-line monolith → modular architecture
// ===================================

import { fetchAllData } from './data.js';
import { initCTVSystem } from './ctv.js';
import { supabase } from './supabase.js';
import { createSubmitGuard } from './utils/ratelimit.js';
import { initNetworkStatus } from './utils/api.js';
import './utils/tracker.js';
import './auth.js';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-cards';

// --- Modules ---
import { initHeroParticles, initCountUp, initScrollAnimations } from './modules/animations.js';
import { renderBenefits, renderProcess, renderProduct, renderHealthStories, renderAffiliateSteps, renderAffiliateTiers } from './modules/render-sections.js';
import { renderTestimonials, initTestimonialsSwiper, initGallerySwiper } from './modules/testimonials.js';
import { initQuantitySelector, initOrderForm, initPaymentModal, initCtvForm } from './modules/order-form.js';
import { initReturningCustomer } from './modules/returning-customer.js';
import { initReorderReminder } from './modules/reorder-reminder.js';
import { initFloatingOrderBtn, initContactWidget, initCtvPopup } from './modules/floating-buttons.js';
import { initCtvBanner, saveCtvSession } from './modules/ctv-banner.js';
import { initPromoPopup } from './modules/promo-popup.js';
import { initLoginPopup, openLoginPopup } from './modules/login-popup.js';
import { getCurrentUser } from './auth.js';
import './css/bottom-bar.css';
import { initSocialProof } from './modules/social-proof.js';
import { initHeroCTARotator } from './modules/hero-cta-rotator.js';
import { initExitIntent } from './modules/exit-intent.js';
import { initEventTracking } from './modules/event-tracking.js';
import { inject as injectVercelAnalytics } from '@vercel/analytics';
import { initStickyCTA } from './modules/sticky-cta.js';
import { applyABTest, isABTestActive } from './modules/ab-test.js';

// ===================================
// DYNAMIC PRICING
// ===================================
let PRICING = {
  unit_price: 1450000,
  discounts: { 1: 0, 2: 0, 3: 5, 5: 10, 10: 15 },
  free_shipping_min: 3
};

async function loadPricing() {
  try {
    const { data } = await supabase.rpc('get_product_pricing');
    if (data) PRICING = data;
  } catch (e) { console.warn('Dùng giá mặc định'); }
}

// ===================================
// NAVBAR
// ===================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !navToggle.contains(e.target)) {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });
}

// ===================================
// TOAST
// ===================================
function showToast(message, success = true, { html = false, duration = 4000 } = {}) {
  const toast = document.getElementById('toast');
  const toastIcon = toast.querySelector('.toast-icon');
  const toastMessage = document.getElementById('toastMessage');

  toastIcon.textContent = success ? '✓' : '!';
  if (html) {
    toastMessage.innerHTML = message;
  } else {
    toastMessage.textContent = message;
  }
  toast.style.borderColor = success ? 'var(--success)' : 'var(--gold-primary)';
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
  // Network status monitoring
  initNetworkStatus(
    () => showToast('Mất kết nối mạng. Một số tính năng có thể không hoạt động.', false, { duration: 10000 }),
    () => showToast('Đã kết nối lại!', true, { duration: 3000 })
  );

  // Start non-data-dependent init immediately
  initNavbar();
  initHeroCTARotator();
  initHeroParticles();
  initCountUp();
  initReturningCustomer();
  initFloatingOrderBtn();
  initContactWidget();
  initCtvPopup(showToast);
  initCtvBanner(showToast);
  initPromoPopup(showToast);
  initLoginPopup(showToast);
  initReorderReminder();
  initExitIntent();
  initEventTracking();
  injectVercelAnalytics();
  initStickyCTA();
  if (isABTestActive()) applyABTest();

  // Auth interceptor — links with data-auth="ctv|customer" require login
  document.addEventListener('click', (e) => {
    const authLink = e.target.closest('[data-auth]');
    if (!authLink) return;
    const user = getCurrentUser();
    if (user) return; // Already logged in, let normal navigation proceed
    e.preventDefault();
    const role = authLink.dataset.auth || 'ctv';
    const href = authLink.getAttribute('href');
    openLoginPopup({
      role,
      onSuccess: () => { if (href) window.location.href = href; },
    });
  });

  // Nav account card
  const navAccount = document.getElementById('navAccount');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navDropdown = document.getElementById('navAccountDropdown');
  if (navLoginBtn && navAccount) {
    const RANK_LABELS = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond' };

    function updateNavAccount() {
      const user = getCurrentUser();
      const iconEl = document.getElementById('navAccountIcon');
      const nameEl = document.getElementById('navAccountName');
      const infoEl = document.getElementById('navAccountInfo');
      const badgeEl = document.getElementById('navAccountRoleBadge');

      if (user) {
        const name = user.display_name || user.name || 'Tài khoản';
        const shortName = name.length > 8 ? name.substring(0, 8) + '…' : name;
        const tier = user.tier || 'bronze';
        const points = user.total_points || 0;

        // Show initials (2 chars) as avatar
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
        if (iconEl) iconEl.textContent = initials || '👤';
        if (nameEl) nameEl.textContent = shortName;

        // Add meta line with points
        let metaEl = infoEl?.querySelector('.nav-account-meta');
        if (!metaEl && infoEl) {
          metaEl = document.createElement('span');
          metaEl.className = 'nav-account-meta';
          infoEl.appendChild(metaEl);
        }
        if (metaEl) metaEl.textContent = `${points} điểm`;

        navAccount.classList.add('logged-in');

        // CTV role badge
        if (badgeEl) {
          if (user.role === 'ctv') {
            badgeEl.textContent = 'CTV';
            badgeEl.style.display = '';
          } else {
            badgeEl.textContent = 'TV';
            badgeEl.style.background = 'linear-gradient(135deg, #60a5fa, #3b82f6)';
            badgeEl.style.display = '';
          }
        }

        // Update dropdown details
        const rankEl = document.getElementById('navAccountRank');
        const fullEl = document.getElementById('navAccountFullname');
        const ptsEl = document.getElementById('navAccountPoints');
        if (rankEl) rankEl.textContent = `${RANK_LABELS[tier] || 'Bronze'}`;
        if (fullEl) fullEl.textContent = name;
        if (ptsEl) ptsEl.textContent = `${points} điểm thưởng`;

        // Dashboard link based on role
        const dashEl = document.getElementById('navAccountDashboard');
        if (dashEl) {
          if (user.role === 'ctv') {
            dashEl.href = '/ctv-dashboard.html';
            dashEl.textContent = 'Dashboard CTV';
          } else {
            dashEl.href = '/thanh-vien.html';
            dashEl.textContent = 'Trang Thành Viên';
          }
        }
      } else {
        if (iconEl) iconEl.textContent = '→';
        if (nameEl) nameEl.textContent = 'Đăng Nhập';
        const metaEl = infoEl?.querySelector('.nav-account-meta');
        if (metaEl) metaEl.remove();
        if (badgeEl) badgeEl.style.display = 'none';
        navAccount.classList.remove('logged-in');
      }
    }
    updateNavAccount();

    // Click handler
    navLoginBtn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (user) {
        // Toggle dropdown
        navDropdown?.classList.toggle('open');
      } else {
        openLoginPopup({
          role: 'customer',
          onSuccess: () => updateNavAccount(),
        });
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!navAccount.contains(e.target) && navDropdown?.classList.contains('open')) {
        navDropdown.classList.remove('open');
      }
    });

    // Logout button
    const logoutBtn = document.getElementById('navAccountLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        navDropdown?.classList.remove('open');
        localStorage.removeItem('maldala_user');
        sessionStorage.removeItem('maldala_session');
        updateNavAccount();
        if (showToast) showToast('Đã đăng xuất. Hẹn gặp lại! 👋', true);
      });
    }

    // Re-check state
    setInterval(updateNavAccount, 2000);
  }

  // Load pricing from backend (parallel with fetchAllData)
  const [allData] = await Promise.all([fetchAllData(), loadPricing()]);
  const { product, testimonials, processSteps, affiliateTiers, affiliateSteps, healthStories } = allData;

  // Store globally for quantity selector / order form
  window.__product = product;
  window.__testimonials = testimonials;

  // Render data-dependent sections
  renderBenefits(product);
  renderProcess(processSteps);
  renderProduct(product, PRICING);
  renderTestimonials(testimonials);
  renderHealthStories(healthStories);
  renderAffiliateSteps(affiliateSteps);
  renderAffiliateTiers(affiliateTiers);
  initTestimonialsSwiper();
  initGallerySwiper();
  initQuantitySelector(product, PRICING);
  initOrderForm(PRICING, showToast);
  initPaymentModal(showToast);
  initCtvForm(showToast);
  initScrollAnimations();
  initSocialProof();

  // Init CTV referral tracking + dashboard
  await initCTVSystem();
});
