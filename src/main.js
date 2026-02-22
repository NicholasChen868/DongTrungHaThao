import { fetchAllData } from './data.js';
import { initCTVSystem, registerCTV, getAutoRef, validateCtvCode } from './ctv.js';
import { supabase } from './supabase.js';
import { escapeHTML, escapeCSS } from './utils/sanitize.js';
import { checkRateLimit, recordAttempt, createSubmitGuard } from './utils/ratelimit.js';
import './utils/tracker.js';
import './auth.js';

// Swiper.js — premium slider/carousel
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectCoverflow, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import 'swiper/css/effect-cards';

const contactGuard = createSubmitGuard(5000);

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
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
  // Start non-data-dependent init immediately
  initNavbar();
  initHeroParticles();
  initCountUp();
  initReturningCustomer();
  initFloatingOrderBtn();
  initContactWidget();
  initReorderReminder();

  // Load pricing from backend (parallel with fetchAllData)
  const [allData] = await Promise.all([fetchAllData(), loadPricing()]);
  const { product, testimonials, processSteps, affiliateTiers, affiliateSteps, healthStories } = allData;

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
  initTestimonialsSwiper();
  initGallerySwiper();
  initQuantitySelector(product);
  initOrderForm();
  initPaymentModal();
  initCtvForm();
  initScrollAnimations();
  initSocialProof();

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
    navLinks.classList.toggle('active');
  });

  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close on click outside (overlay)
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
      ${b.image ? `<div class="benefit-bg" style="background-image: url('${b.image}')"></div>` : ''}
      <div class="benefit-content">
        <h3 class="benefit-title">${escapeHTML(b.title)}</h3>
        <p class="benefit-desc">${escapeHTML(b.desc)}</p>
      </div>
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
        <span class="process-duration">${escapeHTML(step.duration)}</span>
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
  if (priceEl) priceEl.textContent = PRICING.unit_price.toLocaleString('vi-VN') + '₫';
  if (totalEl) totalEl.textContent = PRICING.unit_price.toLocaleString('vi-VN') + '₫';

  if (ingredientsEl) {
    const ul = ingredientsEl.querySelector('ul');
    ul.innerHTML = product.ingredients.map(i => `<li>${escapeHTML(i)}</li>`).join('');
  }

  if (usageEl) {
    usageEl.querySelector('p').textContent = product.usage;
  }
}

// ===================================
// RENDER TESTIMONIALS (Swiper slides)
// ===================================
function renderTestimonials(testimonials) {
  const track = document.getElementById('testimonialsTrack');
  if (!track || !testimonials) return;

  track.innerHTML = testimonials.map(t => {
    const avatarHtml = t.avatar && t.avatar.startsWith('/')
      ? `<img src="${escapeHTML(t.avatar)}" alt="${escapeHTML(t.name)}" loading="lazy">`
      : escapeHTML(t.avatar || '👤');
    return `
    <div class="swiper-slide">
      <div class="testimonial-card">
        <div class="testimonial-inner">
          <div class="testimonial-stars">${'★'.repeat(parseInt(t.rating) || 0)}${'☆'.repeat(5 - (parseInt(t.rating) || 0))}</div>
          <p class="testimonial-quote">${escapeHTML(t.quote)}</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${avatarHtml}</div>
            <div class="testimonial-info">
              <div class="testimonial-name">${escapeHTML(t.name)}, ${parseInt(t.age) || ''} tuổi</div>
              <div class="testimonial-location">${escapeHTML(t.location)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

// ===================================
// TESTIMONIALS SWIPER
// ===================================
function initTestimonialsSwiper() {
  const el = document.getElementById('testimonialsSwiper');
  if (!el) return;

  new Swiper(el, {
    modules: [Navigation, Pagination, Autoplay],
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    speed: 800,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.testimonials-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      prevEl: '.testimonials-prev',
      nextEl: '.testimonials-next',
    },
    breakpoints: {
      768: {
        slidesPerView: 1,
        spaceBetween: 32,
      }
    }
  });
}

// ===================================
// GALLERY SWIPER (Coverflow 3D)
// ===================================
function initGallerySwiper() {
  const el = document.getElementById('gallerySwiper');
  if (!el) return;

  new Swiper(el, {
    modules: [Pagination, Autoplay, EffectCoverflow],
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    speed: 700,
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 120,
      modifier: 2,
      slideShadows: false,
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.gallery-pagination',
      clickable: true,
      dynamicBullets: true,
    },
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
          <div class="phase-label">Trước khi dùng</div>
          <p>${escapeHTML(s.before)}</p>
        </div>
        <div class="story-arrow">Sau ${escapeHTML(s.duration)}</div>
        <div class="story-phase story-after">
          <div class="phase-label">Sau khi dùng</div>
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
  const unitPrice = PRICING.unit_price || product.price || 1450000;

  function updateQty(newQty) {
    qty = Math.max(1, Math.min(99, newQty));
    valueEl.textContent = qty;
    const discountPercent = PRICING.discounts[qty] || 0;
    const subtotal = qty * unitPrice;
    const total = Math.round(subtotal * (1 - discountPercent / 100));
    totalEl.textContent = total.toLocaleString('vi-VN') + '₫';
  }

  minusBtn.addEventListener('click', () => updateQty(qty - 1));
  plusBtn.addEventListener('click', () => updateQty(qty + 1));
}

// ===================================
// ORDER FORM (with Payment)
// ===================================
const SHIPPING_FEE = 30000;
const BANK_CONFIG = {
  bankId: 'MB',        // MB Bank — mã VietQR
  accountNo: '0903940171',
  accountName: 'MAL DALLA DUY DUC',
  template: 'compact2',
};

function calcOrderTotals(qty) {
  const unitPrice = PRICING.unit_price || 1450000;
  const discountPercent = PRICING.discounts[qty] || 0;
  const subtotal = qty * unitPrice;
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const freeShip = qty >= (PRICING.free_shipping_min || 3);
  const shipping = freeShip ? 0 : SHIPPING_FEE;
  const total = subtotal - discountAmount + shipping;
  return { unitPrice, discountPercent, subtotal, discountAmount, shipping, total, freeShip };
}

function initOrderForm() {
  const form = document.getElementById('orderForm');
  const qtySelect = document.getElementById('orderQty');
  const subtotalEl = document.getElementById('orderSubtotal');
  const totalEl = document.getElementById('orderTotal');
  const shippingEl = document.getElementById('orderShipping');
  const discountEl = document.getElementById('orderDiscount');
  const discountRow = document.getElementById('orderDiscountRow');
  const freeShipNote = document.getElementById('freeShipNote');

  if (!form) return;

  // --- Payment method toggle ---
  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      paymentOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      opt.querySelector('input[type="radio"]').checked = true;
    });
  });

  // --- Quantity change → recalculate ---
  function updateSummary() {
    const qty = parseInt(qtySelect.value);
    const t = calcOrderTotals(qty);
    subtotalEl.textContent = t.subtotal.toLocaleString('vi-VN') + '₫';
    shippingEl.textContent = t.freeShip ? 'Miễn phí' : t.shipping.toLocaleString('vi-VN') + '₫';
    if (t.freeShip && shippingEl) shippingEl.style.color = '#4ade80';
    else if (shippingEl) shippingEl.style.color = '';
    if (t.discountAmount > 0) {
      discountRow.style.display = '';
      discountEl.textContent = '-' + t.discountAmount.toLocaleString('vi-VN') + '₫';
    } else {
      discountRow.style.display = 'none';
    }
    freeShipNote.style.display = t.freeShip ? '' : 'none';
    totalEl.textContent = t.total.toLocaleString('vi-VN') + '₫';
  }

  qtySelect.addEventListener('change', updateSummary);
  updateSummary(); // Initial

  // Auto-detect CTV ref from cookie
  const autoRef = getAutoRef();
  if (autoRef) {
    const autoGroup = document.getElementById('ctvAutoRefGroup');
    const manualGroup = document.getElementById('ctvManualGroup');
    const autoText = document.getElementById('ctvAutoRefText');
    if (autoGroup && manualGroup && autoText) {
      autoGroup.style.display = 'block';
      manualGroup.style.display = 'none';
      autoText.textContent = `Bạn được giới thiệu bởi ${autoRef}`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rl = checkRateLimit('order', 3, 60000);
    if (!rl.allowed) {
      showToast(`Quá nhiều lần gửi. Vui lòng đợi ${Math.ceil(rl.remainingMs / 1000)}s`, false);
      return;
    }
    recordAttempt('order', 60000);

    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const email = document.getElementById('orderEmail')?.value.trim() || null;
    const address = document.getElementById('orderAddress').value.trim();
    const qty = parseInt(qtySelect.value);
    const manualCode = document.getElementById('orderCtvCode')?.value.trim() || null;
    const rawCtvCode = manualCode || getAutoRef();
    const note = document.getElementById('orderNote')?.value.trim() || null;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

    if (!name || !phone || !address) {
      showToast('Vui lòng điền đầy đủ thông tin!', false);
      return;
    }

    // Phone validation
    const phoneClean = phone.replace(/[\s\-().]/g, '');
    if (!/^(0|\+84)\d{9,10}$/.test(phoneClean)) {
      showToast('Số điện thoại không hợp lệ!', false);
      return;
    }

    const t = calcOrderTotals(qty);

    // Disable button while submitting
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
      // Anti-self-referral: chặn CTV tự giới thiệu chính mình
      const ctvCode = await validateCtvCode(rawCtvCode, phone);

      const { data, error } = await supabase.from('orders').insert({
        customer_name: name,
        phone: phone,
        email: email,
        address: address,
        quantity: qty,
        unit_price: t.unitPrice,
        discount_percent: t.discountPercent,
        shipping_fee: t.shipping,
        total_amount: t.total,
        ctv_code: ctvCode,
        note: note,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
      }).select().single();

      if (error) throw error;

      // Save customer info for returning customer greeting
      try {
        localStorage.setItem('mdd_customer', JSON.stringify({ name, phone, lastOrder: Date.now() }));
      } catch (_e) { /* quota exceeded */ }

      if (paymentMethod === 'bank_transfer') {
        // Mở modal QR chuyển khoản
        showPaymentModal(data.order_code || `MDD-${String(data.id).padStart(6, '0')}`, t.total);
        showToast(
          `Đơn hàng <strong>${escapeHTML(data.order_code || '')}</strong> đã được tạo. Vui lòng hoàn tất thanh toán!`,
          true,
          { html: true, duration: 6000 }
        );
      } else {
        // COD — hiển thị thông báo thành công
        showToast(
          `Cảm ơn ${escapeHTML(name)}! Đơn hàng <strong>${escapeHTML(data.order_code || '#' + data.id)}</strong> đã được ghi nhận.`
          + `<br>Chúng tôi sẽ liên hệ xác nhận trong 30 phút.`
          + `<br><a href="/tra-cuu.html" style="color:var(--gold-light);font-weight:600">Tra cứu đơn</a>`
          + ` &nbsp;|&nbsp; <a href="/thanh-vien.html" style="color:var(--gold-light);font-weight:600">Thành viên</a>`,
          true,
          { html: true, duration: 8000 }
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      form.reset();
      // Re-select COD after reset
      const codRadio = document.querySelector('input[name="paymentMethod"][value="cod"]');
      if (codRadio) {
        codRadio.checked = true;
        paymentOptions.forEach(o => o.classList.remove('active'));
        codRadio.closest('.payment-option')?.classList.add('active');
      }
      updateSummary();
    } catch (err) {
      console.error('Order submit error:', err);
      showToast('Đặt hàng thất bại. Vui lòng gọi Hotline hoặc thử lại!', false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = origText;
    }
  });
}

// ===================================
// PAYMENT MODAL (VietQR)
// ===================================
function showPaymentModal(orderCode, amount) {
  const modal = document.getElementById('paymentModal');
  if (!modal) return;

  // Populate modal
  const codeEl = document.getElementById('modalOrderCode');
  const amountEl = document.getElementById('modalAmount');
  const qrImg = document.getElementById('modalQrImage');
  const contentEl = document.getElementById('modalTransferContent');

  const transferContent = orderCode.replace(/-/g, '');

  if (codeEl) codeEl.textContent = orderCode;
  if (amountEl) amountEl.textContent = amount.toLocaleString('vi-VN') + '₫';
  if (contentEl) contentEl.textContent = transferContent;

  // VietQR URL — chuẩn quốc gia, mọi app ngân hàng đều quét được
  const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-${BANK_CONFIG.template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
  if (qrImg) qrImg.src = qrUrl;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function initPaymentModal() {
  const modal = document.getElementById('paymentModal');
  const closeBtn = document.getElementById('paymentModalClose');
  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Copy buttons
  modal.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.copy;
      let text = '';
      if (type === 'bankAccount') {
        text = document.getElementById('modalBankAccount')?.textContent || '';
      } else if (type === 'transferContent') {
        text = document.getElementById('modalTransferContent')?.textContent || '';
      }
      try {
        await navigator.clipboard.writeText(text);
        const orig = btn.textContent;
        btn.textContent = '✓ Đã sao chép';
        btn.style.background = 'var(--gold-primary)';
        btn.style.color = '#0A0E1A';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      } catch (_e) {
        showToast('Không thể sao chép. Vui lòng copy thủ công.', false);
      }
    });
  });
}

function initCtvForm() {
  const form = document.getElementById('ctvForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rl = checkRateLimit('ctv_register', 3, 60000);
    if (!rl.allowed) {
      showToast(`Quá nhiều lần đăng ký. Vui lòng đợi ${Math.ceil(rl.remainingMs / 1000)}s`, false);
      return;
    }
    recordAttempt('ctv_register', 60000);

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
        showToast(
          `Chào mừng trở lại! Mã CTV: <strong>${escapeHTML(result.referral_code)}</strong>`
          + `<br><a href="/chia-se.html" style="color:var(--gold-light);font-weight:600">Viết bài chia sẻ</a>`
          + ` &nbsp;|&nbsp; <a href="/ctv-dashboard.html" style="color:var(--gold-light);font-weight:600">Dashboard CTV</a>`,
          true,
          { html: true, duration: 8000 }
        );
      } else {
        showToast(
          `Đăng ký thành công! Mã CTV: <strong>${escapeHTML(result.referral_code)}</strong>`
          + `<br><br><span style="font-size:14px">Mật khẩu Dashboard mặc định là <strong>Số điện thoại</strong> của bạn. Vui lòng đăng nhập và đổi mật khẩu sớm.</span>`
          + `<br><a href="/chia-se.html" style="color:var(--gold-light);font-weight:600">Viết bài chia sẻ (+3đ)</a>`
          + ` &nbsp;|&nbsp; <a href="/ctv-dashboard.html" style="color:var(--gold-light);font-weight:600">Dashboard CTV</a>`,
          true,
          { html: true, duration: 8000 }
        );
      }
      form.reset();
      // Reload to show dashboard
      setTimeout(() => window.location.reload(), 8000);
    } else {
      showToast('Đăng ký thất bại. Vui lòng thử lại!', false);
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

// ===================================
// RETURNING CUSTOMER GREETING
// ===================================
function initReturningCustomer() {
  const banner = document.getElementById('greetingBanner');
  const nameEl = document.getElementById('greetingName');
  const dismissBtn = document.getElementById('greetingDismiss');
  if (!banner || !nameEl) return;

  try {
    const saved = JSON.parse(localStorage.getItem('mdd_customer'));
    if (!saved || !saved.name) return;

    // Show greeting
    nameEl.textContent = saved.name;
    banner.classList.remove('hidden-default');

    // Auto-fill order form
    const nameInput = document.getElementById('orderName');
    const phoneInput = document.getElementById('orderPhone');
    if (nameInput && !nameInput.value) nameInput.value = saved.name;
    if (phoneInput && !phoneInput.value && saved.phone) phoneInput.value = saved.phone;

    // Dismiss = clear saved data
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

// ===================================
// FLOATING ORDER BUTTON
// ===================================
function initFloatingOrderBtn() {
  const btn = document.getElementById('floatingOrderBtn');
  const contactSection = document.getElementById('contact');
  if (!btn || !contactSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      btn.classList.toggle('hidden', entry.isIntersecting);
    });
  }, { threshold: 0.1 });

  observer.observe(contactSection);

  // Smooth scroll
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    contactSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// ===================================
// REORDER REMINDER
// ===================================
function initReorderReminder() {
  const banner = document.getElementById('reorderBanner');
  const daysEl = document.getElementById('reorderDays');
  const dismissBtn = document.getElementById('reorderDismiss');
  if (!banner || !daysEl) return;

  try {
    const saved = JSON.parse(localStorage.getItem('mdd_customer'));
    if (!saved || !saved.lastOrder) return;

    // Check if dismissed recently (7 days)
    const dismissed = localStorage.getItem('mdd_reorder_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Calculate days since last order
    const daysSince = Math.floor((Date.now() - saved.lastOrder) / (24 * 60 * 60 * 1000));
    if (daysSince < 30) return;

    // Show banner
    daysEl.textContent = daysSince;
    banner.classList.remove('hidden-default');

    // Dismiss handler
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        localStorage.setItem('mdd_reorder_dismissed', Date.now().toString());
        banner.classList.add('hidden-default');
      });
    }
  } catch (e) { /* corrupted data */ }
}

// ===================================
// FLOATING CONTACT WIDGET
// ===================================
function initContactWidget() {
  const widget = document.getElementById('contactWidget');
  const toggle = document.getElementById('cwToggle');
  if (!widget || !toggle) return;

  // Toggle open/close
  toggle.addEventListener('click', () => {
    widget.classList.toggle('open');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target) && widget.classList.contains('open')) {
      widget.classList.remove('open');
    }
  });

  // Fetch contact info from DB and update links
  loadContactLinks();

  // CTV Float Home collapse on scroll
  const ctvFloat = document.getElementById('ctvFloatHome');
  if (ctvFloat) {
    window.addEventListener('scroll', () => {
      ctvFloat.classList.toggle('collapsed', window.scrollY > 300);
    }, { passive: true });
  }
}

async function loadContactLinks() {
  try {
    const { data, error } = await supabase.rpc('get_contact_info');
    if (error || !data) return;

    const cwCall = document.getElementById('cwCall');
    const cwZalo = document.getElementById('cwZalo');
    const cwMessenger = document.getElementById('cwMessenger');

    if (cwCall && data.phone) {
      cwCall.href = `tel:${data.phone.replace(/\s/g, '')}`;
    }

    if (cwZalo && data.zalo) {
      // If zalo is a number, use zalo.me link; if it's a URL, use directly
      cwZalo.href = data.zalo.startsWith('http') ? data.zalo : `https://zalo.me/${data.zalo}`;
    }

    if (cwMessenger && data.messenger) {
      cwMessenger.href = data.messenger;
      cwMessenger.style.display = '';
    } else if (cwMessenger) {
      // Hide messenger button if no link configured
      cwMessenger.style.display = 'none';
    }
  } catch (e) {
    console.warn('⚠️ Could not load contact info:', e.message);
  }
}

// ===================================
// SOCIAL PROOF NOTIFICATIONS
// Fake realtime: đơn hàng, CTV mới, chia sẻ...
// ===================================
function initSocialProof() {
  const el = document.getElementById('socialProof');
  const iconEl = document.getElementById('spIcon');
  const textEl = document.getElementById('spText');
  const timeEl = document.getElementById('spTime');
  const closeBtn = document.getElementById('spClose');
  if (!el || !iconEl || !textEl || !timeEl) return;

  // --- DATA MẪU ---
  const FIRST_NAMES = [
    'Lan', 'Hương', 'Mai', 'Thu', 'Hạnh', 'Ngọc', 'Linh', 'Phương',
    'Minh', 'Tuấn', 'Hùng', 'Đức', 'Bình', 'Thảo', 'Trang', 'Yến',
    'Quỳnh', 'Thanh', 'Hiền', 'Nhung', 'Hoa', 'Dung', 'Anh', 'Vân'
  ];

  const CITIES = [
    'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Huế', 'Nha Trang',
    'Biên Hòa', 'Bình Dương', 'Vũng Tàu', 'Hải Phòng', 'Đà Lạt',
    'Long An', 'Bắc Ninh', 'Quảng Ninh', 'Thanh Hóa', 'Nghệ An'
  ];

  const RELATIONS = [
    'Chị', 'Anh', 'Cô', 'Chú', 'Bác', 'Dì', 'Mẹ'
  ];

  const notifications = [
    // --- ĐƠN HÀNG MỚI ---
    () => {
      const name = pick(FIRST_NAMES);
      const city = pick(CITIES);
      const rel = pick(RELATIONS);
      const qty = pickQty();
      const qtyText = qty === 1 ? '1 hộp' : `${qty} hộp`;
      return {
        type: 'order',
        icon: '🛒',
        text: `<strong>${rel} ${name}</strong> (${city}) vừa đặt ${qtyText}`,
        time: randTime()
      };
    },
    () => {
      const name = pick(FIRST_NAMES);
      const city = pick(CITIES);
      return {
        type: 'order',
        icon: '📦',
        text: `Đơn hàng cho <strong>${pick(RELATIONS)} ${name}</strong> (${city}) đang được chuẩn bị giao`,
        time: randTime()
      };
    },
    // --- CTV MỚI GIA NHẬP ---
    () => {
      const name = pick(FIRST_NAMES);
      const city = pick(CITIES);
      return {
        type: 'ctv',
        icon: '🤝',
        text: `<strong>${name}</strong> (${city}) vừa trở thành Cộng Tác Viên`,
        time: randTime()
      };
    },
    () => {
      const name = pick(FIRST_NAMES);
      return {
        type: 'ctv',
        icon: '🎉',
        text: `Chào mừng CTV <strong>${name}</strong> gia nhập đại gia đình!`,
        time: randTime()
      };
    },
    // --- CHIA SẺ SỨC KHỎE ---
    () => {
      const name = pick(FIRST_NAMES);
      const rel = pick(RELATIONS);
      const shares = [
        'Uống 2 tuần thấy ngủ ngon hẳn',
        'Dùng 1 tháng, cảm giác khỏe hơn rõ rệt',
        'Mua tặng ba mẹ, hai bác rất hài lòng',
        'Đợt này đặt thêm cho cả nhà',
        'Sáng dậy thấy nhẹ nhõm, không còn mệt'
      ];
      return {
        type: 'share',
        icon: '💬',
        text: `<strong>${rel} ${name}:</strong> "${pick(shares)}"`,
        time: randTime()
      };
    },
    // --- MỐC ĐÁNG MỪNG ---
    () => {
      const milestones = [
        { icon: '🏆', text: `Hôm nay đã có <strong>${rand(80, 200)}+ đơn hàng</strong> được xử lý` },
        { icon: '📈', text: `<strong>${rand(15, 45)} CTV mới</strong> đăng ký trong tuần này` },
        { icon: '💛', text: `Hơn <strong>${rand(2000, 5000)} khách hàng</strong> đã tin dùng sản phẩm` },
        { icon: '⭐', text: `Đánh giá trung bình: <strong>4.${rand(7, 9)}/5</strong> từ khách hàng` }
      ];
      const m = pick(milestones);
      return {
        type: 'health',
        icon: m.icon,
        text: m.text,
        time: 'Vừa cập nhật'
      };
    }
  ];

  // --- HELPERS ---
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pickQty() {
    const r = Math.random();
    if (r < 0.5) return 1;
    if (r < 0.75) return 2;
    if (r < 0.9) return 3;
    return rand(4, 6);
  }
  function randTime() {
    const mins = rand(1, 45);
    if (mins <= 1) return 'Vừa xong';
    if (mins <= 5) return `${mins} phút trước`;
    return `${mins} phút trước`;
  }

  // --- SHOW/HIDE LOGIC ---
  let timer = null;
  let index = 0;
  let paused = false;
  const shuffled = shuffle([...Array(notifications.length).keys()]);

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showNext() {
    if (paused) return;
    const fn = notifications[shuffled[index % shuffled.length]];
    const data = fn();

    iconEl.className = `social-proof-icon ${data.type}`;
    iconEl.textContent = data.icon;
    textEl.innerHTML = data.text;
    timeEl.textContent = data.time;

    el.classList.add('show');

    // Auto-hide after 5.5s
    clearTimeout(timer);
    timer = setTimeout(() => {
      el.classList.remove('show');
      index++;
      // Next notification after 12-25 seconds (random interval for natural feel)
      setTimeout(showNext, rand(12000, 25000));
    }, 5500);
  }

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      el.classList.remove('show');
      clearTimeout(timer);
      // Pause longer after manual close: 30-60s
      setTimeout(showNext, rand(30000, 60000));
    });
  }

  // Start after 8 seconds on page
  setTimeout(showNext, 8000);
}
