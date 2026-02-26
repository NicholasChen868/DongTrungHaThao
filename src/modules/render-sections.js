// ===================================
// RENDER SECTIONS — Benefits, Process, Product, Stories, Affiliate
// ===================================
import { escapeHTML, escapeCSS } from '../utils/sanitize.js';

export function renderBenefits(product) {
  const grid = document.getElementById('benefitsGrid');
  if (!grid || !product) return;

  const benefits = product.benefits || [];
  if (benefits.length < 5) return;

  // Split: 0,2,3 = Phục hồi bên trong; 1,4 = Bảo vệ mỗi ngày; extra at 5 if exists
  const colA = [benefits[0], benefits[2], benefits[3]];
  const colB = benefits.length >= 6
    ? [benefits[1], benefits[4], benefits[5]]
    : [benefits[1], benefits[4]];

  // Highlight key terms in descriptions
  const highlight = (text) => {
    const terms = [
      'Cordycepin', 'Adenosine', 'SOD', 'Catalase', 'Polysaccharide',
      'tế bào NK', 'Natural Killer', 'GMP', 'WHO',
      'hệ miễn dịch', 'chống oxy hóa', 'giãn mạch', 'giãn phế quản',
      'giấc ngủ', 'năng lượng', 'cholesterol', 'gốc tự do',
      'kháng viêm', 'tuần hoàn', 'hấp thu oxy', 'caffeine',
    ];
    let result = escapeHTML(text);
    terms.forEach(term => {
      const re = new RegExp(`(${term})`, 'gi');
      result = result.replace(re, '<strong class="benefit-highlight">$1</strong>');
    });
    return result;
  };

  const renderItems = (items) => items.map((b, i) => `
    <div class="benefit-item animate-on-scroll" style="transition-delay: ${i * 0.1}s">
      <h4 class="benefit-item-title">${escapeHTML(b.title)}</h4>
      <p class="benefit-item-desc">${highlight(b.desc)}</p>
    </div>
  `).join('');

  grid.innerHTML = `
    <div class="benefits-block animate-on-scroll">
      <div class="benefits-block-header">
        <div>
          <h3 class="benefits-block-title">Phục Hồi — Từ Bên Trong</h3>
          <p class="benefits-block-sub">Giấc ngủ · Đề kháng · Hô hấp</p>
        </div>
      </div>
      <div class="benefits-block-items">
        ${renderItems(colA)}
      </div>
    </div>
    <div class="benefits-block animate-on-scroll">
      <div class="benefits-block-header">
        <div>
          <h3 class="benefits-block-title">Bảo Vệ — Vững Vàng Mỗi Ngày</h3>
          <p class="benefits-block-sub">Năng lượng · Bớt mệt · Trẻ lâu</p>
        </div>
      </div>
      <div class="benefits-block-items">
        ${renderItems(colB)}
      </div>
    </div>
  `;
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
