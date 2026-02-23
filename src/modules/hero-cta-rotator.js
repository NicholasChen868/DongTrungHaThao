// ===================================
// HERO CTA ROTATOR
// Random thay đổi Hero CTA + subtitle mỗi lần load trang
// Tạo khát vọng phục hồi sinh lực bằng nguồn dinh dưỡng cao cấp
// ===================================

const HERO_CTAS = [
  {
    text: '2 Viên Mỗi Sáng — Phục Hồi Sinh Lực Từ Gốc',
    subtitle: 'Nguồn dinh dưỡng cao cấp từ 100% con nhộng nguyên chất — phục hồi sinh lực, bồi đắp đề kháng, mỗi ngày một chút.'
  },
  {
    text: 'Mỗi Sáng 2 Viên — Để Cơ Thể Sống Thật Sự Khỏe',
    subtitle: 'Không phải thuốc. Không thay thế bác sĩ. Nhưng mỗi ngày, cơ thể bạn cần thêm một đồng minh từ thiên nhiên.'
  },
  {
    text: 'Phục Hồi Sinh Lực — Bắt Đầu Từ Viên Nang Đầu Tiên',
    subtitle: 'Viên nang nguyên chất 100% con nhộng — bồi đắp từ gốc, để bạn khỏe hơn, ít mệt hơn, sống trọn vẹn hơn.'
  },
  {
    text: '2 Viên Mỗi Sáng — Dinh Dưỡng Cao Cấp, Phục Hồi Từ Bên Trong',
    subtitle: 'Đề kháng vững vàng, giấc ngủ sâu hơn, buổi sáng nhẹ nhàng hơn — hành trình bắt đầu từ 2 viên mỗi sáng.'
  },
  {
    text: 'Khỏe Từ Gốc — 2 Viên Mỗi Sáng',
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
  // Nếu chỉ có 1 item thì trả 0
  if (arr.length <= 1) return 0;
  // Random khác lần trước
  do {
    newIndex = Math.floor(Math.random() * arr.length);
  } while (newIndex === lastIndex);
  sessionStorage.setItem(storageKey, newIndex.toString());
  return newIndex;
}

/**
 * Khởi tạo Hero CTA Rotator
 * Gọi trong DOMContentLoaded
 */
export function initHeroCTARotator() {
  // Tìm elements
  const heroCTABtn = document.querySelector('.hero-actions .btn-primary span');
  const heroSubCTA = document.querySelector('.hero-actions .btn-secondary');
  const heroSubtitle = document.querySelector('.hero-subtitle');

  // Nếu không tìm thấy elements → thoát (không phải trang chủ)
  if (!heroCTABtn) return;

  // Random CTA chính + subtitle
  const ctaIndex = getRandomIndex(HERO_CTAS, 'mdd_hero_cta');
  const chosen = HERO_CTAS[ctaIndex];

  heroCTABtn.textContent = chosen.text;

  if (heroSubtitle) {
    heroSubtitle.textContent = chosen.subtitle;
  }

  // Random CTA phụ
  if (heroSubCTA) {
    const subIndex = getRandomIndex(HERO_SUB_CTAS, 'mdd_hero_sub');
    heroSubCTA.textContent = HERO_SUB_CTAS[subIndex];
  }

  // Đổi hero CTA link: trỏ thẳng #contact (giảm friction theo data)
  const heroCTALink = document.querySelector('.hero-actions .btn-primary');
  if (heroCTALink) {
    heroCTALink.setAttribute('href', '#contact');
  }
}
