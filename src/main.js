import { product } from '../data/products.js';
import { testimonials } from '../data/testimonials.js';
import { affiliateTiers, affiliateProgram } from '../data/affiliateTiers.js';
import { processSteps } from '../data/processSteps.js';

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroParticles();
  initCountUp();
  renderBenefits();
  renderProcess();
  renderProduct();
  renderTestimonials();
  renderAffiliateSteps();
  renderAffiliateTiers();
  initCarousel();
  initQuantitySelector();
  initOrderForm();
  initCtvForm();
  initScrollAnimations();
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
  const container = document.getElementById('heroParticles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 1;
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(212, 168, 83, ${Math.random() * 0.5 + 0.1}), transparent);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
      animation-delay: ${Math.random() * 4}s;
    `;
    container.appendChild(particle);
  }
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
function renderBenefits() {
  const grid = document.getElementById('benefitsGrid');
  if (!grid) return;

  grid.innerHTML = product.benefits.map((b, i) => `
    <div class="benefit-card animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <span class="benefit-icon">${b.icon}</span>
      <h3 class="benefit-title">${b.title}</h3>
      <p class="benefit-desc">${b.desc}</p>
    </div>
  `).join('');
}

// ===================================
// RENDER PROCESS TIMELINE
// ===================================
function renderProcess() {
  const timeline = document.getElementById('processTimeline');
  if (!timeline) return;

  timeline.innerHTML = processSteps.map((step, i) => `
    <div class="process-item animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <div class="process-dot">${step.icon}</div>
      <div class="process-content">
        <div class="process-step-num">Bước ${step.step}</div>
        <h3 class="process-title">${step.title}</h3>
        <p class="process-desc">${step.description}</p>
        <span class="process-duration">⏱ ${step.duration}</span>
      </div>
    </div>
  `).join('');
}

// ===================================
// RENDER PRODUCT
// ===================================
function renderProduct() {
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
    ul.innerHTML = product.ingredients.map(i => `<li>${i}</li>`).join('');
  }

  if (usageEl) {
    usageEl.querySelector('p').textContent = product.usage;
  }
}

// ===================================
// RENDER TESTIMONIALS
// ===================================
function renderTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const dots = document.getElementById('carouselDots');
  if (!track || !dots) return;

  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-inner">
        <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <p class="testimonial-quote">${t.quote}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.avatar}</div>
          <div>
            <div class="testimonial-name">${t.name}, ${t.age} tuổi</div>
            <div class="testimonial-location">${t.location}</div>
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
function initCarousel() {
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track || !prevBtn || !nextBtn) return;

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
// AFFILIATE STEPS
// ===================================
function renderAffiliateSteps() {
  const container = document.getElementById('affiliateSteps');
  if (!container) return;

  container.innerHTML = affiliateProgram.howItWorks.map((s, i) => `
    <div class="affiliate-step animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <div class="step-number">${s.step}</div>
      <h3 class="step-title">${s.title}</h3>
      <p class="step-desc">${s.desc}</p>
    </div>
  `).join('');
}

// ===================================
// AFFILIATE TIERS
// ===================================
function renderAffiliateTiers() {
  const container = document.getElementById('affiliateTiers');
  if (!container) return;

  container.innerHTML = affiliateTiers.map((tier, i) => `
    <div class="tier-card animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <style>.tier-card:nth-child(${i + 1})::before { background: ${tier.gradient}; }</style>
      <span class="tier-icon">${tier.icon}</span>
      <h3 class="tier-name" style="color: ${tier.color}">${tier.name}</h3>
      <div class="tier-range">${tier.minSales} — ${tier.maxSales ? tier.maxSales : '∞'} sản phẩm/tháng</div>
      <div class="tier-commission" style="color: ${tier.color}">${tier.commission}%</div>
      <div class="tier-commission-label">Chiết khấu</div>
      <ul class="tier-perks">
        ${tier.perks.map(p => `<li style="--check-color: ${tier.color}"><span style="color: ${tier.color}">✓</span> ${p.replace('✓', '')}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// ===================================
// QUANTITY SELECTOR
// ===================================
function initQuantitySelector() {
  const minusBtn = document.getElementById('qtyMinus');
  const plusBtn = document.getElementById('qtyPlus');
  const valueEl = document.getElementById('qtyValue');
  const totalEl = document.getElementById('totalPrice');

  if (!minusBtn || !plusBtn) return;

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
    const qty = parseInt(qtySelect.value);
    const discount = discounts[qty] || 0;
    const subtotal = qty * product.price;
    const total = subtotal * (1 - discount);

    subtotalEl.textContent = subtotal.toLocaleString('vi-VN') + '₫';
    totalEl.textContent = total.toLocaleString('vi-VN') + '₫';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('orderName').value;
    const phone = document.getElementById('orderPhone').value;

    if (!name || !phone) {
      showToast('Vui lòng điền đầy đủ thông tin!', false);
      return;
    }

    showToast(`Cảm ơn ${name}! Đơn hàng đã được ghi nhận. Chúng tôi sẽ liên hệ qua ${phone} sớm nhất.`);
    form.reset();
    qtySelect.dispatchEvent(new Event('change'));
  });
}

// ===================================
// CTV FORM
// ===================================
function initCtvForm() {
  const form = document.getElementById('ctvForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('ctvName').value;

    if (!name) {
      showToast('Vui lòng điền họ tên!', false);
      return;
    }

    showToast(`Cảm ơn ${name}! Đăng ký CTV thành công. Đội ngũ sẽ liên hệ trong vòng 24h.`);
    form.reset();
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
