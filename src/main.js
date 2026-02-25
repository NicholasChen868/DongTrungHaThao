// ===================================
// MAIN.JS — Entry point
// 3-phase loading for maximum performance
// ===================================

// === CRITICAL PATH ONLY ===
// Only import what's needed for first paint
import { supabase } from './supabase.js';
import { initNetworkStatus } from './utils/api.js';
import { initScrollAnimations, initCountUp } from './modules/animations.js';
import { renderBenefits, renderProcess, renderProduct, renderHealthStories, renderAffiliateSteps, renderAffiliateTiers } from './modules/render-sections.js';

// Critical CSS (navbar, hero, base layout)
import './css/bottom-bar.css';

// ===================================
// DYNAMIC PRICING (inline, no import needed)
// ===================================
let PRICING = {
  unit_price: 1450000,
  discounts: { 1: 0, 2: 0, 3: 5, 5: 10, 10: 15 },
  free_shipping_min: 3,
};

async function loadPricing() {
  try {
    const { data } = await supabase.rpc('get_product_pricing');
    if (data) PRICING = data;
  } catch (e) { console.warn('Dùng giá mặc định'); }
}

// ===================================
// NAVBAR (inline — critical for first paint)
// ===================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

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
}

// ===================================
// TOAST (inline — used everywhere)
// ===================================
function showToast(message, success = true, { html = false, duration = 4000 } = {}) {
  const toast = document.getElementById('toast');
  const toastIcon = toast.querySelector('.toast-icon');
  const toastMessage = document.getElementById('toastMessage');
  toastIcon.textContent = success ? '✓' : '!';
  if (html) { toastMessage.innerHTML = message; }
  else { toastMessage.textContent = message; }
  toast.style.borderColor = success ? 'var(--success)' : 'var(--gold-primary)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===================================
// requestIdleCallback polyfill (Safari)
// ===================================
window.requestIdleCallback = window.requestIdleCallback || ((cb, opts) => {
  const start = Date.now();
  return setTimeout(() => cb({
    didTimeout: false,
    timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
  }), opts?.timeout || 1);
});

// ===================================
// INITIALIZATION — 4-phase progressive loading
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
  // Network status
  initNetworkStatus(
    () => showToast('Mất kết nối mạng.', false, { duration: 10000 }),
    () => showToast('Đã kết nối lại!', true, { duration: 3000 }),
  );

  // ══════════════════════════════════════════
  // PHASE 0: Critical UI — navbar + hero (instant)
  // ══════════════════════════════════════════
  initNavbar();
  initCountUp();
  initScrollAnimations();

  // ══════════════════════════════════════════
  // PHASE 1: Render content with LOCAL data (no network)
  // ══════════════════════════════════════════
  const [
    { product: localProduct },
    { testimonials: localTestimonials },
    { processSteps: localProcessSteps },
    { affiliateTiers: localTiers, affiliateProgram: localProgram },
  ] = await Promise.all([
    import('../data/products.js'),
    import('../data/testimonials.js'),
    import('../data/processSteps.js'),
    import('../data/affiliateTiers.js'),
  ]);

  window.__product = localProduct;
  window.__testimonials = localTestimonials;

  renderBenefits(localProduct);
  renderProcess(localProcessSteps);
  renderProduct(localProduct, PRICING);
  renderHealthStories([]);
  renderAffiliateSteps(localProgram.howItWorks);
  renderAffiliateTiers(localTiers);

  // Testimonials + Swiper (lazy-load Swiper CSS + JS)
  const { renderTestimonials, initTestimonialsSwiper, initGallerySwiper } =
    await import('./modules/testimonials.js');
  renderTestimonials(localTestimonials);
  initTestimonialsSwiper();
  initGallerySwiper();
  initScrollAnimations(); // re-check new elements

  // ══════════════════════════════════════════
  // PHASE 2: Interactive modules (after content visible)
  // ══════════════════════════════════════════
  const loadInteractive = async () => {
    const [
      { initQuantitySelector, initOrderForm, initPaymentModal, initCtvForm },
      { initFloatingOrderBtn, initContactWidget, initCtvPopup },
      { initLoginPopup, openLoginPopup },
      { initHeroCTARotator },
      { initStickyCTA },
      { initCtvBanner },
      { initReturningCustomer },
      { initReorderReminder },
      authModule,
    ] = await Promise.all([
      import('./modules/order-form.js'),
      import('./modules/floating-buttons.js'),
      import('./modules/login-popup.js'),
      import('./modules/hero-cta-rotator.js'),
      import('./modules/sticky-cta.js'),
      import('./modules/ctv-banner.js'),
      import('./modules/returning-customer.js'),
      import('./modules/reorder-reminder.js'),
      import('./auth.js'),
    ]);

    const { getCurrentUser } = authModule;

    initHeroCTARotator();
    initFloatingOrderBtn();
    initContactWidget();
    initCtvPopup(showToast);
    initCtvBanner(showToast);
    initLoginPopup(showToast);
    initReturningCustomer();
    initReorderReminder();
    initStickyCTA();
    initQuantitySelector(localProduct, PRICING);
    initOrderForm(PRICING, showToast);
    initPaymentModal(showToast);
    initCtvForm(showToast);

    // Auth interceptor
    document.addEventListener('click', (e) => {
      const authLink = e.target.closest('[data-auth]');
      if (!authLink) return;
      const user = getCurrentUser();
      if (user) return;
      e.preventDefault();
      const role = authLink.dataset.auth || 'ctv';
      const href = authLink.getAttribute('href');
      openLoginPopup({
        role,
        onSuccess: () => { if (href) window.location.href = href; },
      });
    });

    // Nav account button
    initNavAccount(openLoginPopup, getCurrentUser, authModule.getRoleConfig);
  };

  // Run interactive init immediately (non-blocking)
  loadInteractive();

  // ══════════════════════════════════════════
  // PHASE 3: Supabase data refresh (background)
  // ══════════════════════════════════════════
  Promise.all([
    import('./data.js').then(m => m.fetchAllData()),
    loadPricing(),
  ]).then(([allData]) => {
    const { product, testimonials, healthStories } = allData;
    if (product && product !== localProduct) {
      window.__product = product;
      renderProduct(product, PRICING);
    }
    if (testimonials?.length) {
      window.__testimonials = testimonials;
      renderTestimonials(testimonials);
      initTestimonialsSwiper();
    }
    if (healthStories?.length) {
      renderHealthStories(healthStories);
    }
    initScrollAnimations();
  }).catch(err => console.warn('Supabase refresh skipped:', err.message));

  // ══════════════════════════════════════════
  // PHASE 4: Non-critical modules (when browser idle)
  // ══════════════════════════════════════════
  requestIdleCallback(() => {
    // CTV system
    import('./ctv.js').then(m => m.initCTVSystem());
    // Social proof, promo, exit intent, tracking, AB test
    import('./modules/social-proof.js').then(m => m.initSocialProof());
    import('./modules/promo-popup.js').then(m => m.initPromoPopup(showToast));
    import('./modules/exit-intent.js').then(m => m.initExitIntent(showToast));
    import('./modules/event-tracking.js').then(m => m.initEventTracking());
    import('./modules/ab-test.js').then(m => { if (m.isABTestActive()) m.applyABTest(); });
    // Page view tracker + Vercel Analytics
    import('./utils/tracker.js');
    import('@vercel/analytics').then(m => m.inject());
  }, { timeout: 3000 });

  // ══════════════════════════════════════════
  // PWA Service Worker (deferred)
  // ══════════════════════════════════════════
  if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.onstatechange = () => {
            if (newWorker.state === 'activated') {
              showToast('Phiên bản mới đã sẵn sàng!', true, { duration: 8000 });
            }
          };
        };
      })
      .catch(err => console.warn('[SW] Registration failed:', err));
  }
});

// ===================================
// NAV ACCOUNT (extracted helper)
// ===================================
function initNavAccount(openLoginPopup, getCurrentUser, getRoleConfig) {
  const navAccount = document.getElementById('navAccount');
  const navDropdown = document.getElementById('navAccountDropdown');
  if (!navAccount) return;

  function updateNavAccount() {
    const user = getCurrentUser();
    const nameEl = document.getElementById('navAccountName');
    const iconEl = document.getElementById('navAccountIcon');
    const badgeEl = document.getElementById('navAccountRoleBadge');
    const fullnameEl = document.getElementById('navAccountFullname');
    const rankEl = document.getElementById('navAccountRank');
    const pointsEl = document.getElementById('navAccountPoints');
    const dashLink = document.getElementById('navAccountDashboard');
    const infoEl = document.getElementById('navAccountInfo');

    if (user) {
      const config = getRoleConfig ? getRoleConfig(user.role) : {};
      navAccount.classList.add('logged-in');

      // Update name (always visible on mobile, hover-visible on desktop)
      if (nameEl) {
        nameEl.textContent = user.display_name || user.name || 'Tài khoản';
        nameEl.style.display = '';
      }
      // Show info container on mobile
      if (infoEl) infoEl.style.display = '';

      // Update icon to role emoji
      if (iconEl && config.icon) {
        iconEl.innerHTML = `<span style="font-size:20px">${config.icon}</span>`;
      }

      // Show role badge
      if (badgeEl && config.label) {
        badgeEl.textContent = config.label;
        badgeEl.style.display = 'block';
        if (config.gradient && config.gradient !== 'none') {
          badgeEl.style.background = config.gradient;
        }
      }

      // Update dropdown details
      if (fullnameEl) fullnameEl.textContent = user.display_name || user.name;
      if (rankEl) rankEl.textContent = `${config.icon || ''} ${config.label || 'Thành viên'}`;
      if (pointsEl) pointsEl.textContent = `${user.total_points || 0} điểm`;

      if (dashLink) {
        if (user.role === 'admin') {
          dashLink.href = '/admin.html';
          dashLink.textContent = '📊 Dashboard Admin';
        } else if (user.referral_code || user.role === 'ctv') {
          dashLink.href = '/ctv-dashboard.html';
          dashLink.textContent = '📊 Dashboard CTV';
        } else {
          dashLink.href = '/thanh-vien.html';
          dashLink.textContent = '👤 Tài khoản';
        }
      }
    } else {
      navAccount.classList.remove('logged-in');
      if (nameEl) { nameEl.textContent = 'Đăng Nhập'; nameEl.style.display = ''; }
      if (badgeEl) badgeEl.style.display = 'none';
      if (iconEl) {
        iconEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>`;
      }
    }
  }

  updateNavAccount();

  navAccount.addEventListener('click', (e) => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (user) {
      navDropdown?.classList.toggle('open');
    } else {
      openLoginPopup({ role: 'customer', onSuccess: () => updateNavAccount() });
    }
  });

  document.addEventListener('click', (e) => {
    if (!navAccount.contains(e.target) && navDropdown?.classList.contains('open')) {
      navDropdown.classList.remove('open');
    }
  });

  const logoutBtn = document.getElementById('navAccountLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      navDropdown?.classList.remove('open');
      localStorage.removeItem('maldala_user');
      sessionStorage.removeItem('maldala_session');
      updateNavAccount();
      showToast('Đã đăng xuất. Hẹn gặp lại! 👋', true);
    });
  }

  setInterval(updateNavAccount, 5000);
}
