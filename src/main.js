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

  // Nav login button
  const navLoginBtn = document.getElementById('navLoginBtn');
  if (navLoginBtn) {
    function updateNavLoginState() {
      const user = getCurrentUser();
      if (user) {
        const name = user.display_name || user.name || 'Tài khoản';
        const shortName = name.length > 10 ? name.substring(0, 10) + '…' : name;
        const roleIcon = user.role === 'ctv' ? '💼' : '👤';
        navLoginBtn.innerHTML = `${roleIcon} ${shortName}`;
        navLoginBtn.classList.add('logged-in');
        navLoginBtn.title = `${name} — ${user.role === 'ctv' ? 'CTV' : 'Thành viên'}`;
      } else {
        navLoginBtn.innerHTML = '🔐 Đăng&nbsp;Nhập';
        navLoginBtn.classList.remove('logged-in');
        navLoginBtn.title = 'Đăng nhập';
      }
    }
    updateNavLoginState();

    navLoginBtn.addEventListener('click', () => {
      const user = getCurrentUser();
      if (user) {
        // Already logged in — navigate based on role
        if (user.role === 'ctv') {
          window.location.href = '/ctv-dashboard.html';
        } else {
          window.location.href = '/thanh-vien.html';
        }
      } else {
        openLoginPopup({ role: 'customer' });
      }
    });

    // Re-check state periodically (when login popup closes)
    setInterval(updateNavLoginState, 2000);
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
