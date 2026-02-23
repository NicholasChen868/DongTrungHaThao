// ===================================
// RENDER SECTIONS — Benefits, Process, Product, Stories, Affiliate
// ===================================
import { escapeHTML, escapeCSS } from '../utils/sanitize.js';

export function renderBenefits(product) {
  const grid = document.getElementById('benefitsGrid');
  if (!grid || !product) return;

  const benefits = product.benefits || [];

  // AG-3: Split into 2 thematic columns if 6 benefits
  if (benefits.length >= 6) {
    const colA = benefits.filter((_, i) => [0, 2, 3].includes(i)); // Miễn dịch, Phổi, Tim
    const colB = benefits.filter((_, i) => [1, 4, 5].includes(i)); // Năng lượng, Ngủ, Trẻ lâu

    const renderCards = (items) => items.map((b, i) => `
          <div class="benefit-card animate-on-scroll" style="transition-delay: ${i * 0.1}s">
            ${b.image ? `<div class="benefit-bg" style="background-image: url('${b.image}')"></div>` : ''}
            <div class="benefit-content">
              <h3 class="benefit-title">${escapeHTML(b.title)}</h3>
              <p class="benefit-desc">${escapeHTML(b.desc)}</p>
            </div>
          </div>
        `).join('');

    grid.innerHTML = `
          <div class="benefits-column">
            <div class="benefits-col-header animate-on-scroll">
              <span class="benefits-col-icon">🛡️</span>
              <h3>Khỏe Từ Bên Trong</h3>
              <p>Đề kháng · Hô hấp · Tim mạch</p>
            </div>
            ${renderCards(colA)}
          </div>
          <div class="benefits-column">
            <div class="benefits-col-header animate-on-scroll">
              <span class="benefits-col-icon">✨</span>
              <h3>Phục Hồi Mỗi Ngày</h3>
              <p>Năng lượng · Giấc ngủ · Trẻ lâu</p>
            </div>
            ${renderCards(colB)}
          </div>
        `;
  } else {
    // Fallback: flat grid
    grid.innerHTML = benefits.map((b, i) => `
          <div class="benefit-card animate-on-scroll" style="transition-delay: ${i * 0.1}s">
            ${b.image ? `<div class="benefit-bg" style="background-image: url('${b.image}')"></div>` : ''}
            <div class="benefit-content">
              <h3 class="benefit-title">${escapeHTML(b.title)}</h3>
              <p class="benefit-desc">${escapeHTML(b.desc)}</p>
            </div>
          </div>
        `).join('');
  }
}

export function renderProcess(processSteps) {
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

export function renderProduct(product, PRICING) {
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

export function renderHealthStories(stories) {
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

export function renderAffiliateSteps(steps) {
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

export function renderAffiliateTiers(affiliateTiers) {
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
