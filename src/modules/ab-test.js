// ===================================
// D7: A/B TEST — CTA Variant System
// Random user vào group A/B
// Track: CTA hiển thị + clicks + conversions
// Dùng event_logs table (đã có sẵn)
// ===================================

const STORAGE_KEY = 'mdd_ab_variant';
const EXPERIMENT_NAME = 'cta_style_v1';

// Bộ CTA: A = empowerment (giọng Tây), B = bình dân (giọng Việt)
const CTA_VARIANTS = {
    A: {
        hero_cta: 'Tôi Muốn Thử Cảm Giác Khỏe Thật Sự',
        order_cta: 'Đặt Hàng — Cảm Nhận Sự Khác Biệt',
        sticky_cta: 'Thử Ngay',
        promo_cta: '💊 2 viên/ngày — Khỏe re!',
        label: 'empowerment',
    },
    B: {
        hero_cta: 'Đặt Thử 1 Hộp — Xem Có Hợp Không',
        order_cta: 'Đặt Hàng Ngay',
        sticky_cta: 'Đặt Thử Ngay',
        promo_cta: '💊 Đặt 1 hộp dùng thử',
        label: 'binh_dan',
    },
};

/**
 * Lấy hoặc gán variant cho user.
 * Mỗi user chỉ thấy 1 variant suốt session.
 */
export function getVariant() {
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored === 'A' || stored === 'B') return stored;

        // Random 50/50
        const variant = Math.random() < 0.5 ? 'A' : 'B';
        sessionStorage.setItem(STORAGE_KEY, variant);
        return variant;
    } catch {
        return 'A'; // Fallback
    }
}

/**
 * Lấy nội dung CTA theo variant hiện tại
 */
export function getCTAContent(key) {
    const variant = getVariant();
    return CTA_VARIANTS[variant]?.[key] || CTA_VARIANTS.A[key];
}

/**
 * Áp dụng variant CTA vào các element trên trang.
 * Gọi sau DOMContentLoaded.
 */
export function applyABTest() {
    const variant = getVariant();
    const content = CTA_VARIANTS[variant];
    if (!content) return;

    // Hero CTA buttons
    const heroCTAs = document.querySelectorAll('.hero-actions .btn-primary, .hero-cta-rotator .btn-primary');
    heroCTAs.forEach(btn => {
        // Chỉ thay text nếu đang là variant A content gốc
        if (variant === 'B') {
            btn.textContent = content.hero_cta;
        }
    });

    // Sticky CTA button
    const stickyBtn = document.getElementById('stickyCtaBtn');
    if (stickyBtn) {
        stickyBtn.textContent = content.sticky_cta;
    }

    // Log impression
    logABEvent('impression', variant);
}

/**
 * Log A/B test event vào Supabase event_logs
 */
async function logABEvent(action, variant) {
    try {
        const { supabase } = await import('../supabase.js');
        await supabase.rpc('log_event', {
            p_event_type: 'ab_test',
            p_event_data: {
                experiment: EXPERIMENT_NAME,
                variant,
                variant_label: CTA_VARIANTS[variant]?.label,
                action, // 'impression' | 'click' | 'conversion'
                page: window.location.pathname,
                timestamp: new Date().toISOString(),
            },
        });
    } catch {
        // Silent — non-critical
    }
}

/**
 * Track A/B CTA click
 * Gọi khi user click CTA button
 */
export function trackABClick(ctaKey) {
    const variant = getVariant();
    logABEvent('click', variant);
}

/**
 * Track A/B conversion
 * Gọi khi user submit order form thành công
 */
export function trackABConversion() {
    const variant = getVariant();
    logABEvent('conversion', variant);
}

/**
 * Helper: check nếu A/B test đang bật
 * Trả về false để tạm vô hiệu — set true khi muốn chạy test
 */
export function isABTestActive() {
    return false; // ← ĐỔI THÀNH true KHI BẮT ĐẦU CHẠY TEST
}
