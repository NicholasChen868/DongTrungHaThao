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

// (Pricing removed — founder site doesn't sell directly)

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
  renderProduct(localProduct, null);
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
      { initContactWidget },
      { initLoginPopup, openLoginPopup },
      { initHeroCTARotator },
      { initStickyCTA },
      { initCtvBanner },
      authModule,
    ] = await Promise.all([
      import('./modules/floating-buttons.js'),
      import('./modules/login-popup.js'),
      import('./modules/hero-cta-rotator.js'),
      import('./modules/sticky-cta.js'),
      import('./modules/ctv-banner.js'),
      import('./auth.js'),
    ]);

    const { getCurrentUser } = authModule;

    initHeroCTARotator();
    initContactWidget();
    initCtvBanner(showToast);
    initLoginPopup(showToast);
    initStickyCTA();

    // Partnership form handler
    initPartnershipForm(showToast);

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
  ]).then(([allData]) => {
    const { product, testimonials, healthStories } = allData;
    if (product && product !== localProduct) {
      window.__product = product;
      renderProduct(product, null);
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
    // CTV system (still needed for dealer referral tracking)
    import('./ctv.js').then(m => m.initCTVSystem());
    // Event tracking + Vercel Analytics
    import('./modules/event-tracking.js').then(m => m.initEventTracking());
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
// PARTNERSHIP FORM (Liên Hệ Hợp Tác)
// ===================================
function initPartnershipForm(showToast) {
  const form = document.getElementById('partnershipForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('partnerName')?.value?.trim();
    const phone = document.getElementById('partnerPhone')?.value?.trim();
    const email = document.getElementById('partnerEmail')?.value?.trim();
    const type = document.getElementById('partnerType')?.value;
    const location = document.getElementById('partnerLocation')?.value?.trim();
    const note = document.getElementById('partnerNote')?.value?.trim();

    if (!name || !phone) {
      showToast('Vui lòng nhập họ tên và số điện thoại', false);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) submitBtn.textContent = 'Đang gửi...';

    try {
      const { error } = await supabase.from('partnership_inquiries').insert({
        name, phone, email, type, location, note,
      });

      if (error) throw error;

      showToast('🤝 Cảm ơn! Chúng tôi sẽ liên hệ trong 24 giờ.', true, { duration: 6000 });
      form.reset();
    } catch (err) {
      console.warn('Partnership form error:', err);
      showToast('Gửi thất bại. Vui lòng gọi 0903.940.171', false);
    } finally {
      if (submitBtn) submitBtn.textContent = originalText;
    }
  });
}

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

    // Helper: get best name (mdd_customer has diacritics, prefer it)
    function getBestName(user) {
      let customerName = null;
      try {
        const saved = JSON.parse(localStorage.getItem('mdd_customer'));
        if (saved?.name) customerName = saved.name;
      } catch { }
      if (user) {
        // Prefer mdd_customer name if it looks more complete (has diacritics)
        const authName = user.display_name || user.name || '';
        if (customerName && customerName.length > authName.length) return customerName;
        return authName || customerName || 'Tài khoản';
      }
      return customerName;
    }

    const userIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>`;

    if (user) {
      const config = getRoleConfig ? getRoleConfig(user.role) : {};
      navAccount.classList.add('logged-in');

      const displayName = getBestName(user);

      // Name — right side of pill
      if (nameEl) {
        nameEl.textContent = displayName;
        nameEl.style.display = '';
      }
      if (infoEl) infoEl.style.display = '';

      // Icon → left pill with role label + role color background
      if (iconEl) {
        const roleLabel = config.label || '';
        const bg = config.color || '#64748b';
        if (roleLabel) {
          iconEl.textContent = roleLabel;
          iconEl.style.background = bg;
        } else {
          iconEl.innerHTML = userIcon;
          iconEl.style.background = 'none';
        }
      }

      // Hide separate badge
      if (badgeEl) badgeEl.style.display = 'none';

      // Update dropdown details
      if (fullnameEl) fullnameEl.textContent = displayName;
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
          dashLink.href = '/';
          dashLink.textContent = '🏠 Trang chủ';
        }
      }
    } else {
      navAccount.classList.remove('logged-in');
      const customerName = getBestName(null);

      if (nameEl) {
        nameEl.textContent = customerName || 'Đăng Nhập';
        nameEl.style.display = '';
      }
      if (badgeEl) badgeEl.style.display = 'none';
      if (iconEl) {
        iconEl.style.background = 'none';
        iconEl.innerHTML = userIcon;
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
