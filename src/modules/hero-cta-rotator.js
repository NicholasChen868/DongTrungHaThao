// ===================================
// HERO CTA ROTATOR
// Random thay đổi Hero CTA message + subtitle mỗi lần load trang
// Desktop → full text, Mobile portrait → short text
// ===================================

const HERO_CTAS = [
  {
    text: 'Mỗi viên nang — tôi đều dám cho bố mẹ mình uống.',
    shortText: 'Dám cho bố mẹ mình uống.',
    subtitle: 'Đông Trùng Hạ Thảo Maldalla Duy Đức — 100% con nhộng nguyên chất. Không pha trộn. Không phụ gia. Từ vùng nguyên liệu đến viên nang — một đường thẳng.'
  },
  {
    text: 'Mười lăm năm chỉ làm một thứ. Và làm cho tới nơi tới chốn.',
    shortText: 'Một thứ. Tới nơi tới chốn.',
    subtitle: '100% con nhộng nguyên chất. Không pha. Không trộn. Không ngoại lệ. Mỗi viên nang 500mg — sấy thăng hoa giữ nguyên dưỡng chất.'
  },
  {
    text: 'Hơn 50% khách hàng đến từ lời giới thiệu của người thân.',
    shortText: '50% khách đến từ người thân.',
    subtitle: 'Mười lăm năm, Maldalla lớn lên nhờ một kênh duy nhất: người thật giới thiệu cho người thật. Không có chiến dịch quảng cáo nào mạnh bằng một câu nói của người bạn tin tưởng.'
  },
  {
    text: '100% con nhộng nguyên chất. Không pha. Không trộn. Không ngoại lệ.',
    shortText: '100% nguyên chất. Không ngoại lệ.',
    subtitle: 'Từ vùng nguyên liệu Tây Tạng, qua nhà máy Hà Giang, đến tay bạn — một quy trình khép kín mà tôi kiểm soát từ đầu đến cuối.'
  },
  {
    text: '48.000đ mỗi ngày — ít hơn một ly cà phê. Cho sức khỏe cả tháng.',
    shortText: '48.000đ/ngày. Cho cả tháng.',
    subtitle: 'Tôi không xin lỗi về giá. Bởi vì giá ấy là giá của sự thật. Và sự thật thì không bao giờ rẻ.'
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
