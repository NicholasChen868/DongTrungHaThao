import { fetchAllData } from './data.js';
import { initCTVSystem, registerCTV } from './ctv.js';
import { supabase } from './supabase.js';
import { escapeHTML, escapeCSS } from './utils/sanitize.js';
import { createSubmitGuard } from './utils/ratelimit.js';

const orderGuard = createSubmitGuard(5000);
const ctvGuard = createSubmitGuard(5000);
const contactGuard = createSubmitGuard(5000);

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
  // Start non-data-dependent init immediately
  initNavbar();
  initHeroParticles();
  initCountUp();

  // Fetch all data from Supabase (falls back to local data)
  const { product, testimonials, processSteps, affiliateTiers, affiliateSteps, healthStories } = await fetchAllData();

  // Store globally for quantity selector / order form
  window.__product = product;
  window.__testimonials = testimonials;

  // Render data-dependent sections
  renderBenefits(product);
  renderProcess(processSteps);
  renderProduct(product);
  renderTestimonials(testimonials);
  renderHealthStories(healthStories);
  renderAffiliateSteps(affiliateSteps);
  renderAffiliateTiers(affiliateTiers);
  initCarousel(testimonials);
  initQuantitySelector(product);
  initOrderForm();
  initCtvForm();
  initScrollAnimations();

  // Init CTV referral tracking + dashboard
  await initCTVSystem();
});

// ===================================
// NAVBAR
// ===================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// ===================================
// HERO PARTICLES
// ===================================
function initHeroParticles() {
  // Disabled for GPU performance — no particles created
  return;
}

// ===================================
// COUNT UP ANIMATION
// ===================================
function initCountUp() {
  const counters = document.querySelectorAll('.hero-stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCount(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCount(el, target) {
  const duration = 2000;
  const start = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('vi-VN');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ===================================
// RENDER BENEFITS
// ===================================
function renderBenefits(product) {
  const grid = document.getElementById('benefitsGrid');
  if (!grid || !product) return;

  grid.innerHTML = product.benefits.map((b, i) => `
    <div class="benefit-card animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <span class="benefit-icon">${escapeHTML(b.icon)}</span>
      <h3 class="benefit-title">${escapeHTML(b.title)}</h3>
      <p class="benefit-desc">${escapeHTML(b.desc)}</p>
    </div>
  `).join('');
}

// ===================================
// RENDER PROCESS TIMELINE
// ===================================
function renderProcess(processSteps) {
  const timeline = document.getElementById('processTimeline');
  if (!timeline || !processSteps) return;

  timeline.innerHTML = processSteps.map((step, i) => `
    <div class="process-item animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <div class="process-dot">${escapeHTML(step.icon)}</div>
      <div class="process-content">
        <div class="process-step-num">Bước ${parseInt(step.step)}</div>
        <h3 class="process-title">${escapeHTML(step.title)}</h3>
        <p class="process-desc">${escapeHTML(step.description)}</p>
        <span class="process-duration">⏱ ${escapeHTML(step.duration)}</span>
      </div>
    </div>
  `).join('');
}

// ===================================
// RENDER PRODUCT
// ===================================
function renderProduct(product) {
  if (!product) return;
  const nameEl = document.getElementById('productName');
  const descEl = document.getElementById('productDesc');
  const capsulesEl = document.getElementById('productCapsules');
  const ingredientsEl = document.getElementById('productIngredients');
  const usageEl = document.getElementById('productUsage');
  const priceEl = document.getElementById('productPrice');
  const totalEl = document.getElementById('totalPrice');

  if (nameEl) nameEl.textContent = product.name;
  if (descEl) descEl.textContent = product.description;
  if (capsulesEl) capsulesEl.textContent = product.capsuleCount + ' ' + product.capsuleUnit;
  if (priceEl) priceEl.textContent = product.priceFormatted;
  if (totalEl) totalEl.textContent = product.priceFormatted;

  if (ingredientsEl) {
    const ul = ingredientsEl.querySelector('ul');
    ul.innerHTML = product.ingredients.map(i => `<li>${escapeHTML(i)}</li>`).join('');
  }

  if (usageEl) {
    usageEl.querySelector('p').textContent = product.usage;
  }
}

// ===================================
// RENDER TESTIMONIALS
// ===================================
function renderTestimonials(testimonials) {
  const track = document.getElementById('testimonialsTrack');
  const dots = document.getElementById('carouselDots');
  if (!track || !dots || !testimonials) return;

  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-inner">
        <div class="testimonial-stars">${'★'.repeat(parseInt(t.rating) || 0)}${'☆'.repeat(5 - (parseInt(t.rating) || 0))}</div>
        <p class="testimonial-quote">${escapeHTML(t.quote)}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${escapeHTML(t.avatar)}</div>
          <div>
            <div class="testimonial-name">${escapeHTML(t.name)}, ${parseInt(t.age) || ''} tuổi</div>
            <div class="testimonial-location">${escapeHTML(t.location)}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  dots.innerHTML = testimonials.map((_, i) => `
    <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
  `).join('');
}

// ===================================
// CAROUSEL
// ===================================
function initCarousel(testimonials) {
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track || !prevBtn || !nextBtn || !testimonials) return;

  let current = 0;
  const total = testimonials.length;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('carousel-dot')) {
      goTo(parseInt(e.target.dataset.index));
    }
  });

  // Auto play
  let interval = setInterval(() => goTo(current + 1), 5000);
  track.closest('.testimonials-carousel').addEventListener('mouseenter', () => clearInterval(interval));
  track.closest('.testimonials-carousel').addEventListener('mouseleave', () => {
    interval = setInterval(() => goTo(current + 1), 5000);
  });
}

// ===================================
// HEALTH STORIES
// ===================================
function renderHealthStories(stories) {
  const grid = document.getElementById('storiesGrid');
  if (!grid || !stories || stories.length === 0) return;

  grid.innerHTML = stories.map((s, i) => `
    <div class="story-card animate-on-scroll" style="transition-delay: ${i * 0.15}s">
      <div class="story-header">
        <div class="story-avatar">${s.avatar.startsWith('/') ? `<img src="${escapeHTML(s.avatar)}" alt="${escapeHTML(s.name)}" loading="lazy">` : escapeHTML(s.avatar)}</div>
        <div class="story-meta">
          <div class="story-name">${escapeHTML(s.name)}, ${parseInt(s.age) || ''} tuổi</div>
          <div class="story-location">${escapeHTML(s.location)}</div>
        </div>
        <div class="story-condition">${escapeHTML(s.condition)}</div>
      </div>
      <h3 class="story-title">${escapeHTML(s.title)}</h3>
      <div class="story-timeline">
        <div class="story-phase story-before">
          <div class="phase-label">😔 Trước khi dùng</div>
          <p>${escapeHTML(s.before)}</p>
        </div>
        <div class="story-arrow">⬇️ Sau ${escapeHTML(s.duration)}</div>
        <div class="story-phase story-after">
          <div class="phase-label">😊 Sau khi dùng</div>
          <p>${escapeHTML(s.after)}</p>
        </div>
      </div>
      <blockquote class="story-quote">"${escapeHTML(s.quote)}"</blockquote>
      <div class="story-rating">${'★'.repeat(parseInt(s.rating) || 0)}${'☆'.repeat(5 - (parseInt(s.rating) || 0))}</div>
    </div>
  `).join('');
}

// ===================================
// AFFILIATE STEPS
// ===================================
function renderAffiliateSteps(steps) {
  const container = document.getElementById('affiliateSteps');
  if (!container || !steps) return;

  container.innerHTML = steps.map((s, i) => `
    <div class="affiliate-step animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <div class="step-number">${parseInt(s.step)}</div>
      <h3 class="step-title">${escapeHTML(s.title)}</h3>
      <p class="step-desc">${escapeHTML(s.desc)}</p>
    </div>
  `).join('');
}

// ===================================
// AFFILIATE TIERS
// ===================================
function renderAffiliateTiers(affiliateTiers) {
  const container = document.getElementById('affiliateTiers');
  if (!container || !affiliateTiers) return;

  container.innerHTML = affiliateTiers.map((tier, i) => `
    <div class="tier-card animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <style>.tier-card:nth-child(${i + 1})::before { background: ${escapeCSS(tier.gradient)}; }</style>
      <span class="tier-icon">${escapeHTML(tier.icon)}</span>
      <h3 class="tier-name" style="color: ${escapeCSS(tier.color)}">${escapeHTML(tier.name)}</h3>
      <div class="tier-range">${parseInt(tier.minSales)} — ${tier.maxSales ? parseInt(tier.maxSales) : '∞'} sản phẩm/tháng</div>
      <div class="tier-commission" style="color: ${escapeCSS(tier.color)}">${parseInt(tier.commission)}%</div>
      <div class="tier-commission-label">Chiết khấu</div>
      <ul class="tier-perks">
        ${tier.perks.map(p => `<li style="--check-color: ${escapeCSS(tier.color)}"><span style="color: ${escapeCSS(tier.color)}">✓</span> ${escapeHTML(p.replace('✓', ''))}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ===================================
// QUANTITY SELECTOR
// ===================================
function initQuantitySelector(product) {
  const minusBtn = document.getElementById('qtyMinus');
  const plusBtn = document.getElementById('qtyPlus');
  const valueEl = document.getElementById('qtyValue');
  const totalEl = document.getElementById('totalPrice');

  if (!minusBtn || !plusBtn || !product) return;

  let qty = 1;

  function updateQty(newQty) {
    qty = Math.max(1, Math.min(99, newQty));
    valueEl.textContent = qty;
    const total = qty * product.price;
    totalEl.textContent = total.toLocaleString('vi-VN') + '₫';
  }

  minusBtn.addEventListener('click', () => updateQty(qty - 1));
  plusBtn.addEventListener('click', () => updateQty(qty + 1));
}

// ===================================
// ORDER FORM
// ===================================
function initOrderForm() {
  const form = document.getElementById('orderForm');
  const qtySelect = document.getElementById('orderQty');
  const subtotalEl = document.getElementById('orderSubtotal');
  const totalEl = document.getElementById('orderTotal');

  if (!form) return;

  const discounts = { 1: 0, 2: 0, 3: 0.05, 5: 0.10, 10: 0.15 };

  qtySelect.addEventListener('change', () => {
    const p = window.__product;
    if (!p) return;
    const qty = parseInt(qtySelect.value);
    const discount = discounts[qty] || 0;
    const subtotal = qty * p.price;
    const total = subtotal * (1 - discount);

    subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + '₫';
    totalEl.textContent = total.toLocaleString('vi-VN') + '₫';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const og = orderGuard();
    if (!og.allowed) {
      showToast(`Vui lòng đợi ${Math.ceil(og.remainingMs / 1000)}s trước khi gửi lại`, false);
      return;
    }

    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const qty = parseInt(qtySelect.value);
    const ctvCode = document.getElementById('orderCtvCode')?.value.trim() || null;
    const note = document.getElementById('orderNote')?.value.trim() || null;

    if (!name || !phone || !address) {
      showToast('Vui lòng điền đầy đủ thông tin!', false);
      return;
    }

    // Calculate total
    const p = window.__product;
    const unitPrice = p?.price || 850000;
    const discount = discounts[qty] || 0;
    const subtotal = qty * unitPrice;
    const total = Math.round(subtotal * (1 - discount));

    // Disable button while submitting
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
      const { data, error } = await supabase.from('orders').insert({
        customer_name: name,
        phone: phone,
        address: address,
        quantity: qty,
        unit_price: unitPrice,
        discount_percent: discount * 100,
        total_amount: total,
        ctv_code: ctvCode,
        note: note,
        status: 'pending',
      }).select().single();

      if (error) throw error;

      showToast(`Cảm ơn ${name}! Đơn hàng #${data.id} đã được ghi nhận. Theo dõi tại: /tra-cuu.html`);
      form.reset();
      qtySelect.dispatchEvent(new Event('change'));
    } catch (err) {
      console.error('Order submit error:', err);
      showToast('Đặt hàng thất bại. Vui lòng gọi Hotline hoặc thử lại!', false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
    }
  });
}

function initCtvForm() {
  const form = document.getElementById('ctvForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cg = ctvGuard();
    if (!cg.allowed) {
      showToast(`Vui lòng đợi ${Math.ceil(cg.remainingMs / 1000)}s`, false);
      return;
    }

    const name = document.getElementById('ctvName').value;
    const phone = document.getElementById('ctvPhone')?.value;
    const email = document.getElementById('ctvEmail')?.value;

    if (!name || !phone) {
      showToast('Vui lòng điền họ tên và số điện thoại!', false);
      return;
    }

    // Register CTV in Supabase
    const result = await registerCTV(name, phone, email);
    if (result?.ok) {
      if (result.existing) {
        showToast(`Chào mừng trở lại! Mã CTV của bạn: ${result.referral_code}`);
      } else {
        showToast(`Đăng ký thành công! Mã CTV: ${result.referral_code} — Chia sẻ link để nhận điểm!`);
      }
      form.reset();
      // Reload to show dashboard
      setTimeout(() => window.location.reload(), 2000);
    } else {
      showToast('Đăng ký thất bại. Vui lòng thử lại!', false);
    }
  });
}

// ===================================
// TOAST
// ===================================
function showToast(message, success = true) {
  const toast = document.getElementById('toast');
  const toastIcon = toast.querySelector('.toast-icon');
  const toastMessage = document.getElementById('toastMessage');

  toastIcon.textContent = success ? '✅' : '⚠️';
  toastMessage.textContent = message;
  toast.style.borderColor = success ? 'var(--success)' : 'var(--gold-primary)';
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');

  // Immediately show elements already in viewport
  const checkVisibility = (el) => {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < windowHeight && rect.bottom > 0;
  };

  // Small delay to let browser render, then check initial visibility
  requestAnimationFrame(() => {
    elements.forEach(el => {
      if (checkVisibility(el)) {
        el.classList.add('visible');
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px',
  });

  elements.forEach(el => {
    if (!el.classList.contains('visible')) {
      observer.observe(el);
    }
  });
}
