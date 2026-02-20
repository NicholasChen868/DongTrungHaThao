// ===================================
// CTV POINTS SYSTEM
// ===================================
import { supabase } from './supabase.js';
import { escapeHTML } from './utils/sanitize.js';

// --- Local Storage helpers ---
const CTV_KEY = 'ctv_ref_code';
function getStoredRef() { return localStorage.getItem(CTV_KEY); }
function setStoredRef(code) { localStorage.setItem(CTV_KEY, code); }

// --- Check URL for ?ref= parameter (tracking incoming clicks) ---
export function initRefTracking() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    // Track the visit — record after 5 seconds (minimum dwell time)
    const contentType = params.get('t') || 'page';
    const contentId = params.get('id') || null;

    setTimeout(async () => {
        try {
            const { data, error } = await supabase.rpc('record_share_click', {
                p_ref_code: ref,
                p_content_type: contentType,
                p_content_id: contentId,
                p_ip: 'client', // Server will see actual IP via Supabase
                p_user_agent: navigator.userAgent.substring(0, 100),
                p_dwell_time: 5,
            });
            if (data?.ok) {
                console.log(`✅ Click tracked: +${data.points} points for ${ref}`);
            }
        } catch (err) {
            console.warn('Click tracking failed:', err.message);
        }
    }, 5000); // Wait 5 seconds before recording (anti-bot)
}

// --- Register CTV ---
export async function registerCTV(name, phone, email) {
    try {
        const { data, error } = await supabase.rpc('register_ctv', {
            p_name: name,
            p_phone: phone,
            p_email: email || null,
        });
        if (error) throw error;
        if (data?.ok) {
            setStoredRef(data.referral_code);
            return data;
        }
        return { ok: false, error: 'Registration failed' };
    } catch (err) {
        console.error('CTV registration error:', err.message);
        return { ok: false, error: err.message };
    }
}

// --- Get CTV Dashboard ---
export async function getCTVDashboard(refCode) {
    try {
        const { data, error } = await supabase.rpc('get_ctv_dashboard', {
            p_ref_code: refCode,
        });
        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Dashboard fetch error:', err.message);
        return { ok: false, error: err.message };
    }
}

// --- Generate Share URL ---
export function getShareURL(contentType, contentId) {
    const ref = getStoredRef();
    if (!ref) return window.location.origin;
    const base = window.location.origin;
    let url = `${base}/?ref=${ref}&t=${contentType}`;
    if (contentId) url += `&id=${contentId}`;
    return url;
}

// --- Copy share link to clipboard ---
export async function copyShareLink(contentType, contentId) {
    const url = getShareURL(contentType, contentId);
    try {
        await navigator.clipboard.writeText(url);
        return { ok: true, url };
    } catch {
        // Fallback
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        return { ok: true, url };
    }
}

// --- Init Share Buttons ---
export function initShareButtons() {
    const ref = getStoredRef();
    if (!ref) return; // Only show share buttons for registered CTVs

    // Add share buttons to story cards
    document.querySelectorAll('.story-card').forEach((card, i) => {
        const btn = document.createElement('button');
        btn.className = 'share-btn';
        btn.innerHTML = '📤 Chia sẻ (+3đ)';
        btn.addEventListener('click', async () => {
            const result = await copyShareLink('story', String(i + 1));
            if (result.ok) {
                btn.innerHTML = '✅ Đã copy link!';
                btn.classList.add('share-btn--copied');
                setTimeout(() => {
                    btn.innerHTML = '📤 Chia sẻ (+3đ)';
                    btn.classList.remove('share-btn--copied');
                }, 2000);
            }
        });
        card.appendChild(btn);
    });

    // Add share button to product section
    const productSection = document.getElementById('product');
    if (productSection) {
        const btn = document.createElement('button');
        btn.className = 'share-btn share-btn--product';
        btn.innerHTML = '📤 Chia sẻ sản phẩm (+5đ)';
        btn.addEventListener('click', async () => {
            const result = await copyShareLink('product', 'dtht-capsule-001');
            if (result.ok) {
                btn.innerHTML = '✅ Đã copy link!';
                btn.classList.add('share-btn--copied');
                setTimeout(() => {
                    btn.innerHTML = '📤 Chia sẻ sản phẩm (+5đ)';
                    btn.classList.remove('share-btn--copied');
                }, 2000);
            }
        });
        const pricing = productSection.querySelector('.product-pricing');
        if (pricing) pricing.after(btn);
    }
}

// --- Render CTV Dashboard ---
export function renderCTVDashboard(data) {
    const container = document.getElementById('ctvDashboard');
    if (!container || !data?.ok) return;

    const tierMap = { silver: '🥈 Bạc', gold: '🥇 Vàng', diamond: '💎 Kim Cương' };
    container.innerHTML = `
    <div class="ctv-dashboard-card">
      <div class="ctv-dash-header">
        <h3>🏆 Xin chào, ${escapeHTML(data.name)}</h3>
        <span class="ctv-tier ctv-tier--${escapeHTML(data.tier)}">${tierMap[data.tier] || '👑 Đại Lý'}</span>
      </div>
      <div class="ctv-dash-stats">
        <div class="ctv-stat">
          <div class="ctv-stat-value">${parseInt(data.total_points) || 0}</div>
          <div class="ctv-stat-label">Điểm đã duyệt</div>
        </div>
        <div class="ctv-stat">
          <div class="ctv-stat-value">${parseInt(data.pending_points) || 0}</div>
          <div class="ctv-stat-label">Đang chờ duyệt</div>
        </div>
        <div class="ctv-stat">
          <div class="ctv-stat-value">${Number(data.available_vnd || 0).toLocaleString('vi-VN')}₫</div>
          <div class="ctv-stat-label">Số dư khả dụng</div>
        </div>
        <div class="ctv-stat">
          <div class="ctv-stat-value">${parseInt(data.total_clicks) || 0}</div>
          <div class="ctv-stat-label">Lượt click</div>
        </div>
      </div>
      <div class="ctv-dash-ref">
        <span>Mã giới thiệu:</span>
        <code class="ctv-ref-code">${escapeHTML(data.referral_code)}</code>
        <button class="ctv-copy-btn" id="copyRefBtn">📋 Copy</button>
      </div>
      <div class="ctv-dash-info">
        <p>📊 Hôm nay: <strong>${parseInt(data.today_points) || 0}/50 điểm</strong> &nbsp;|&nbsp; 💰 100 điểm = 10.000₫</p>
      </div>
    </div>
  `;

    // Copy ref code button
    document.getElementById('copyRefBtn')?.addEventListener('click', async () => {
        const url = `${window.location.origin}/?ref=${data.referral_code}`;
        await navigator.clipboard.writeText(url);
        const btn = document.getElementById('copyRefBtn');
        btn.textContent = '✅ Đã copy!';
        setTimeout(() => btn.textContent = '📋 Copy', 2000);
    });
}

// --- Init CTV System ---
export async function initCTVSystem() {
    // Track incoming referral clicks
    initRefTracking();

    // If CTV is logged in, show dashboard + share buttons
    const ref = getStoredRef();
    if (ref) {
        const dashboard = await getCTVDashboard(ref);
        if (dashboard?.ok) {
            renderCTVDashboard(dashboard);
            initShareButtons();
        }
    }
}
