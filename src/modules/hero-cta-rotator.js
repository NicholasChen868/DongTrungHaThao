// ===================================
// HERO CTA ROTATOR
// Random thay đổi Hero CTA message + subtitle mỗi lần load trang
// Desktop → full text, Mobile portrait → short text
// ===================================

const HERO_CTAS = [
  {
    text: 'Mỗi viên nang — tôi đều dám cho bố mẹ mình\u00A0uống.',
    shortText: 'Dám cho bố mẹ mình\u00A0uống.',
  },
  {
    text: 'Mười lăm năm chỉ làm một thứ. Và làm cho tới nơi tới\u00A0chốn.',
    shortText: 'Một thứ. Tới nơi tới\u00A0chốn.',
  },
  {
    text: '100% con nhộng nguyên chất. Không pha. Không\u00A0trộn.',
    shortText: '100% nguyên chất. Không\u00A0pha.',
  },
  {
    text: 'Từ Tây Tạng đến Sài Gòn — một quy trình khép\u00A0kín.',
    shortText: 'Tây Tạng → Sài Gòn. Khép\u00A0kín.',
  },
  {
    text: 'Phần lớn khách hàng đến với chúng tôi qua lời giới thiệu của người\u00A0thân.',
    shortText: 'Khách đến từ lời người\u00A0thân.',
  }
];

// CTA phụ — nút thứ 2 cũng random
const HERO_SUB_CTAS = [
  'Tìm hiểu câu chuyện của chúng tôi',
  'Đọc câu chuyện 15 năm',
  'Câu chuyện đằng sau mỗi viên nang',
  'Vì sao chỉ một sản phẩm?'
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
  const heroSubtitle = document.querySelector('.hero-description');

  if (!heroCtaMsg) return;

  // Random CTA chính + subtitle
  const ctaIndex = getRandomIndex(HERO_CTAS, 'mdd_hero_cta');
  const chosen = HERO_CTAS[ctaIndex];

  // Pick text dựa theo viewport
  const displayText = isMobilePortrait() ? chosen.shortText : chosen.text;
  heroCtaMsg.textContent = displayText;

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
