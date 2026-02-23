// ===================================
// CTV BANNER — Info panel + auto-login/logout
// Shows CTV status, rank, goals, motivational quotes
// ===================================
import { supabase } from '../supabase.js';
import { escapeHTML } from '../utils/sanitize.js';

// Built-in motivational quotes (no GPT API needed)
const MOTIVATIONAL_QUOTES = [
    'Mỗi bước nhỏ hôm nay là nền tảng cho thành công lớn ngày mai.',
    'Thành công không đến từ việc đợi chờ — mà từ hành động.',
    'Đừng so sánh bạn hôm nay với người khác — hãy so với chính bạn hôm qua.',
    'Kiên trì tạo nên kỳ tích. Mỗi ngày bạn đều tiến thêm 1 bước.',
    'Người giỏi nhất không phải người bắt đầu sớm — mà là người không bao giờ bỏ cuộc.',
    'Hành trình ngàn dặm bắt đầu từ một bước chân.',
    'Bạn đang xây dựng thu nhập thụ động — mỗi đơn hàng đều đáng giá.',
    'Hạng Diamond đang chờ bạn — chỉ cần tiếp tục chia sẻ!',
    'Cơ hội thuộc về người hành động, không phải người suy nghĩ.',
    'Maldala tin vào bạn — và con số hoa hồng sẽ chứng minh.',
    'Sức khỏe là vàng — bạn đang mang giá trị đến cho mọi người.',
    'Top CTV tháng này đều bắt đầu từ 0 đơn. Bạn hoàn toàn có thể.',
    'Mỗi lần chia sẻ là một cơ hội kiếm tiền. Đừng bỏ lỡ!',
    'Niềm tin tạo nên sự khác biệt — khách hàng tin bạn vì bạn thật.',
    'Silver → Gold → Diamond: Chặng đường thăng hạng nằm trong tay bạn.',
];

const RANK_MAP = {
    bronze: { emoji: '🥉', label: 'Bronze', next: 'Silver', nextEmoji: '🥈', reqOrders: 5 },
    silver: { emoji: '🥈', label: 'Silver', next: 'Gold', nextEmoji: '🥇', reqOrders: 15 },
    gold: { emoji: '🥇', label: 'Gold', next: 'Diamond', nextEmoji: '💎', reqOrders: 50 },
    diamond: { emoji: '💎', label: 'Diamond', next: null, nextEmoji: null, reqOrders: null },
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CTV_SESSION_KEY = 'ctv_session';

function getRandomQuote() {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

function formatDuration(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    const mins = Math.floor(ms / (1000 * 60));
    return `${mins}m`;
}

function formatCurrency(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'tr';
    if (num >= 1000) return Math.floor(num / 1000) + 'k';
    return num.toLocaleString('vi-VN') + '₫';
}

/**
 * Init CTV banner — check stored session, auto-login, populate UI
 */
export function initCtvBanner(showToast) {
    const banner = document.getElementById('ctvBanner');
    if (!banner) return;

    // Check for saved session
    const session = getCtvSession();
    if (!session) return; // Not logged in → banner stays hidden

    // Check auto-logout (1 week)
    if (Date.now() - session.loginAt > ONE_WEEK_MS) {
        clearCtvSession();
        return;
    }

    // Show the banner with saved data
    showBanner(session);

    // Async: refresh data from API
    refreshCtvData(session.referral_code);

    // Banner toggle
    const bannerBtn = document.getElementById('ctvBannerBtn');
    if (bannerBtn) {
        bannerBtn.addEventListener('click', () => {
            banner.classList.toggle('open');
        });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!banner.contains(e.target) && banner.classList.contains('open')) {
            banner.classList.remove('open');
        }
    });

    // Logout
    const logoutBtn = document.getElementById('ctvLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearCtvSession();
            banner.style.display = 'none';
            banner.classList.remove('open');
            showToast?.('Đã đăng xuất CTV', true);
        });
    }
}

/**
 * Store CTV session after successful login/registration
 */
export function saveCtvSession(data) {
    const session = {
        referral_code: data.referral_code,
        name: data.name || data.referral_code,
        rank: data.rank || 'bronze',
        points: data.points || 0,
        total_orders: data.total_orders || 0,
        total_earnings: data.total_earnings || 0,
        loginAt: Date.now(),
    };
    localStorage.setItem(CTV_SESSION_KEY, JSON.stringify(session));
    return session;
}

function getCtvSession() {
    try {
        const raw = localStorage.getItem(CTV_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function clearCtvSession() {
    localStorage.removeItem(CTV_SESSION_KEY);
}

function showBanner(session) {
    const banner = document.getElementById('ctvBanner');
    if (!banner) return;

    const rankInfo = RANK_MAP[session.rank] || RANK_MAP.bronze;
    const loginDuration = formatDuration(Date.now() - session.loginAt);

    // Banner button
    const nameEl = document.getElementById('ctvBannerName');
    const rankEl = document.getElementById('ctvBannerRank');
    const timeEl = document.getElementById('ctvBannerTime');
    if (nameEl) nameEl.textContent = session.name;
    if (rankEl) rankEl.textContent = `${rankInfo.emoji} ${rankInfo.label}`;
    if (timeEl) timeEl.textContent = `Online ${loginDuration}`;

    // Detail panel
    const detailName = document.getElementById('ctvDetailName');
    const detailBadge = document.getElementById('ctvDetailBadge');
    const detailRankLabel = document.getElementById('ctvDetailRankLabel');
    if (detailName) detailName.textContent = session.name;
    if (detailBadge) detailBadge.textContent = rankInfo.emoji;
    if (detailRankLabel) detailRankLabel.textContent = `Hạng ${rankInfo.label}`;

    // Stats
    const pointsEl = document.getElementById('ctvStatPoints');
    const ordersEl = document.getElementById('ctvStatOrders');
    const earningsEl = document.getElementById('ctvStatEarnings');
    if (pointsEl) pointsEl.textContent = session.points;
    if (ordersEl) ordersEl.textContent = session.total_orders;
    if (earningsEl) earningsEl.textContent = formatCurrency(session.total_earnings);

    // Goal
    if (rankInfo.next) {
        const goalFill = document.getElementById('ctvGoalFill');
        const goalText = document.getElementById('ctvGoalText');
        const progress = Math.min(100, Math.round((session.total_orders / rankInfo.reqOrders) * 100));
        const remaining = Math.max(0, rankInfo.reqOrders - session.total_orders);
        if (goalFill) goalFill.style.width = `${progress}%`;
        if (goalText) goalText.textContent = `Thêm ${remaining} đơn nữa → ${rankInfo.next} ${rankInfo.nextEmoji}`;
    } else {
        const goalSection = document.getElementById('ctvGoalSection');
        if (goalSection) {
            goalSection.innerHTML = '<div class="ctv-goal-header"><span>🏆 Bạn đã đạt hạng cao nhất!</span></div>';
        }
    }

    // Random motivational quote
    const quoteEl = document.getElementById('ctvQuote');
    if (quoteEl) quoteEl.innerHTML = `<em>"${escapeHTML(getRandomQuote())}"</em>`;

    banner.style.display = '';
}

async function refreshCtvData(referralCode) {
    try {
        const { data, error } = await supabase.rpc('get_ctv_info', { p_referral_code: referralCode });
        if (error || !data) return;

        const session = getCtvSession();
        if (!session) return;

        // Update session with fresh data
        session.rank = data.rank || session.rank;
        session.points = data.points ?? session.points;
        session.total_orders = data.total_orders ?? session.total_orders;
        session.total_earnings = data.total_earnings ?? session.total_earnings;
        session.name = data.name || session.name;
        localStorage.setItem(CTV_SESSION_KEY, JSON.stringify(session));

        // Re-render banner with fresh data
        showBanner(session);
    } catch (e) {
        console.warn('⚠️ Could not refresh CTV data:', e.message);
    }
}
