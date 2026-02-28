// ===================================
// EXIT-INTENT POPUP
// Khi khách chuẩn bị rời trang → hiển thị popup giữ chân
// Giảm cart abandonment (data: 81% bỏ đi)
// ===================================

/**
 * Khởi tạo exit-intent detection
 * - Desktop: chuột rời viewport phía trên
 * - Mobile: nhấn nút back / visibility change
 * - Chỉ hiện 1 lần per session
 * - Không hiện nếu khách đã đặt hàng thành công
 */
export function initExitIntent() {
  // Chỉ hiện 1 lần per session
  if (sessionStorage.getItem('mdd_exit_shown')) return;

  // Không hiện nếu đã mua hàng
  try {
    const customer = JSON.parse(localStorage.getItem('mdd_customer'));
    if (customer?.lastOrder) {
      const daysSince = (Date.now() - customer.lastOrder) / (24 * 60 * 60 * 1000);
      if (daysSince < 1) return; // Vừa mua trong ngày → không show
    }
  } catch (e) { /* ignore */ }

  // Tạo popup HTML
  createExitPopup();

  // Đợi 15 giây trước khi bật detection (tránh trigger sớm)
  setTimeout(() => {
    // Desktop: mouse leave ở phía trên viewport
    document.addEventListener('mouseout', handleMouseOut);

    // Mobile: visibility change (chuyển tab, nhấn home)
    document.addEventListener('visibilitychange', handleVisibility);
  }, 15000);
}

function handleMouseOut(e) {
  // Chỉ trigger khi chuột rời qua cạnh trên (ý định đóng tab/back)
  if (e.clientY <= 0 && e.relatedTarget === null) {
    showExitPopup();
    document.removeEventListener('mouseout', handleMouseOut);
  }
}

function handleVisibility() {
  // Khi user chuyển tab → lưu timestamp
  // Khi quay lại sau >5 giây → show popup
  if (document.hidden) {
    sessionStorage.setItem('mdd_exit_left', Date.now().toString());
  } else {
    const leftAt = parseInt(sessionStorage.getItem('mdd_exit_left') || '0', 10);
    if (leftAt && Date.now() - leftAt > 5000) {
      showExitPopup();
      document.removeEventListener('visibilitychange', handleVisibility);
    }
    sessionStorage.removeItem('mdd_exit_left');
  }
}

function showExitPopup() {
  if (sessionStorage.getItem('mdd_exit_shown')) return;
  sessionStorage.setItem('mdd_exit_shown', '1');

  const popup = document.getElementById('exitIntentPopup');
  if (!popup) return;

  popup.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function createExitPopup() {
  // Nếu popup đã tồn tại (Antigravity đã tạo trong HTML) → dùng luôn
  if (document.getElementById('exitIntentPopup')) {
    bindExitPopupEvents();
    return;
  }

  // Tạo popup DOM
  const popup = document.createElement('div');
  popup.id = 'exitIntentPopup';
  popup.className = 'popup-overlay';
  popup.innerHTML = `
    <div class="popup-content exit-intent-popup">
      <button class="popup-close" id="exitIntentClose">&times;</button>
      <div class="exit-intent-body">
      <div class="exit-intent-icon">🤔</div>
        <h3 class="exit-intent-title">Đang phân vân?</h3>
        <p class="exit-intent-desc">
          Tôi hiểu. 1.450.000₫ không phải số nhỏ.<br>
          Nhưng tính ra: <strong>48.000₫/ngày</strong> — ít hơn một ly cà phê sáng. Cho sức khỏe cả tháng.<br>
          100% con nhộng nguyên chất. Không pha. Không trộn. Không ngoại lệ.
        </p>
        <div class="exit-intent-trust">
          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:text-bottom;margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg> GMP — WHO</span>
          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:text-bottom;margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg> Đổi trả 7 ngày</span>
          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:text-bottom;margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg> 15 năm — một sản phẩm</span>
        </div>
        <div class="exit-intent-actions">
          <a href="tel:0903940171" class="btn btn-primary exit-intent-call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Gọi tư vấn miễn phí
          </a>
          <a href="https://zalo.me/0903940171" target="_blank" rel="noopener" class="btn btn-secondary exit-intent-zalo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg> Chat Zalo
          </a>
        </div>
        <p class="exit-intent-note">
          Hoặc cuộn xuống để <a href="#contact" id="exitIntentOrder">đặt hàng trực tiếp</a> →
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  bindExitPopupEvents();
}

function bindExitPopupEvents() {
  const popup = document.getElementById('exitIntentPopup');
  if (!popup) return;

  const closeBtn = document.getElementById('exitIntentClose');
  const orderLink = document.getElementById('exitIntentOrder');

  function closeExit() {
    popup.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeExit);

  popup.addEventListener('click', (e) => {
    if (e.target === popup) closeExit();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('active')) {
      closeExit();
    }
  });

  if (orderLink) {
    orderLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeExit();
      const contact = document.getElementById('contact');
      contact?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
