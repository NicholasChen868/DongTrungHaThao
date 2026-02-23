// ===================================
// HERO CTA ROTATOR
// Random thay đổi Hero CTA message + subtitle mỗi lần load trang
// Desktop → full text, Mobile portrait → short text
// ===================================

const HERO_CTAS = [
  {
    text: '2 Viên Mỗi Sáng — Phục Hồi Sinh Lực Từ Gốc',
    shortText: 'Phục Hồi Sinh Lực Từ Gốc',
    subtitle: 'Nguồn dinh dưỡng cao cấp từ 100% con nhộng nguyên chất — phục hồi sinh lực, bồi đắp đề kháng, mỗi ngày một chút.'
  },
  {
    text: 'Mỗi Sáng 2 Viên — Để Cơ Thể Sống Thật Sự Khỏe',
    shortText: 'Cho Cơ Thể Khỏe Từ Bên Trong',
    subtitle: 'Không phải thuốc. Không thay thế bác sĩ. Nhưng mỗi ngày, cơ thể bạn cần thêm một đồng minh từ thiên nhiên.'
  },
  {
    text: 'Phục Hồi Sinh Lực — Bắt Đầu Từ Viên Nang Đầu Tiên',
    shortText: 'Bắt Đầu Từ Viên Nang Đầu Tiên',
    subtitle: 'Viên nang nguyên chất 100% con nhộng — bồi đắp từ gốc, để bạn khỏe hơn, ít mệt hơn, sống trọn vẹn hơn.'
  },
  {
    text: '2 Viên Mỗi Sáng — Dinh Dưỡng Cao Cấp, Phục Hồi Từ Bên Trong',
    shortText: 'Dinh Dưỡng Cao Cấp Mỗi Ngày',
    subtitle: 'Đề kháng vững vàng, giấc ngủ sâu hơn, buổi sáng nhẹ nhàng hơn — hành trình bắt đầu từ 2 viên mỗi sáng.'
  },
  {
    text: 'Khỏe Từ Gốc — 2 Viên Mỗi Sáng',
    shortText: 'Khỏe Từ Gốc Mỗi Ngày',
    subtitle: 'Nuôi cấy khép kín, sấy thăng hoa, đóng viên nguyên chất. Mỗi viên đều được làm với một tiêu chuẩn: xứng đáng cho ba mẹ mình.'
  }
];

// CTA phụ — nút thứ 2 cũng random
const HERO_SUB_CTAS = [
  'Câu Chuyện 15 Năm Của Chúng Tôi',
  'Vì Sao 10.000+ Người Tin Dùng?',
  'Xem Quy Trình Sản Xuất',
  'Tìm Hiểu Thêm'
];

// Tránh lặp lại CTA lần trước (dùng sessionStorage)
function getRandomIndex(arr, storageKey) {
  const lastIndex = parseInt(sessionStorage.getItem(storageKey) || '-1', 10);
  let newIndex;
  if (arr.length <= 1) return 0;
  do {
    newIndex = Math.floor(Math.random() * arr.length);
  } while (newIndex === lastIndex);
  sessionStorage.setItem(storageKey, newIndex.toString());
  return newIndex;
}

// Detect mobile portrait
function isMobilePortrait() {
  return window.innerWidth <= 480 && window.innerHeight > window.innerWidth;
}

/**
 * Khởi tạo Hero CTA Rotator
 * Gọi trong DOMContentLoaded
 */
export function initHeroCTARotator() {
  const heroCtaMsg = document.getElementById('heroCtaMsg');
  const heroSubCTA = document.querySelector('.hero-actions .btn-secondary');
  const heroSubtitle = document.querySelector('.hero-subtitle');

  if (!heroCtaMsg) return;

  // Random CTA chính + subtitle
  const ctaIndex = getRandomIndex(HERO_CTAS, 'mdd_hero_cta');
  const chosen = HERO_CTAS[ctaIndex];

  // Pick text dựa theo viewport
  const displayText = isMobilePortrait() ? chosen.shortText : chosen.text;
  heroCtaMsg.textContent = displayText;

  if (heroSubtitle) {
    heroSubtitle.textContent = chosen.subtitle;
  }

  // Random CTA phụ
  if (heroSubCTA) {
    const subIndex = getRandomIndex(HERO_SUB_CTAS, 'mdd_hero_sub');
    heroSubCTA.textContent = HERO_SUB_CTAS[subIndex];
  }

  // Respond to orientation/resize changes
  let currentPortrait = isMobilePortrait();
  window.addEventListener('resize', () => {
    const nowPortrait = isMobilePortrait();
    if (nowPortrait !== currentPortrait) {
      currentPortrait = nowPortrait;
      heroCtaMsg.textContent = currentPortrait ? chosen.shortText : chosen.text;
    }
  }, { passive: true });
}
