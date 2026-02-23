// ===================================
// CTV POINTS SYSTEM
// ===================================
import { supabase } from './supabase.js';
import { escapeHTML } from './utils/sanitize.js';
import { apiCall } from './utils/api.js';

// --- Local Storage helpers ---
const CTV_KEY = 'ctv_ref_code';
function getStoredRef() { return localStorage.getItem(CTV_KEY); }
function setStoredRef(code) { localStorage.setItem(CTV_KEY, code); }

// --- Check URL for ?ref= parameter (tracking incoming clicks) ---
export function initRefTracking() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (!ref) return;

    // Save ref code to localStorage for auto-fill in order form (30-day cookie)
    saveRefCookie(ref);

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

// --- Save referral cookie (30-day TTL) ---
const REF_COOKIE_KEY = 'mdd_ref';
const REF_COOKIE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

function saveRefCookie(refCode) {
    const data = { code: refCode, ts: Date.now() };
    localStorage.setItem(REF_COOKIE_KEY, JSON.stringify(data));
}

// --- Get auto-ref code (for order form auto-fill) ---
export function getAutoRef() {
    try {
        const raw = localStorage.getItem(REF_COOKIE_KEY);
        if (!raw) return null;
        const { code, ts } = JSON.parse(raw);
        if (Date.now() - ts > REF_COOKIE_TTL) {
            localStorage.removeItem(REF_COOKIE_KEY);
            return null;
        }
        return code;
    } catch {
        return null;
    }
}

// --- Validate CTV code: chặn tự ref chính mình ---
export async function validateCtvCode(ctvCode, customerPhone) {
    if (!ctvCode || !customerPhone) return ctvCode;

    try {
        // Query CTV profile by ref code → check phone match
        const { data, error } = await supabase
            .from('ctv_profiles')
            .select('phone')
            .eq('referral_code', ctvCode)
            .single();

        if (error || !data) return ctvCode; // CTV not found → let backend handle

        // Normalize phone (remove spaces, +84 → 0)
        const normalize = (p) => p.replace(/\s+/g, '').replace(/^\+84/, '0');
        const ctvPhone = normalize(data.phone);
        const orderPhone = normalize(customerPhone);

        if (ctvPhone === orderPhone) {
            console.warn(`⚠️ Self-referral detected: ${ctvCode} → phone match`);
            return null; // Block self-referral
        }

        return ctvCode;
    } catch (err) {
        console.warn('CTV validation error:', err.message);
        return ctvCode; // On error, keep code (let backend verify)
    }
}

// --- Register CTV ---
export async function registerCTV(name, phone, email) {
    try {
        // Create a default password using phone number
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(phone));
        const defaultPasswordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        const { data, error } = await apiCall(
            () => supabase.rpc('register_ctv', {
                p_name: name,
                p_phone: phone,
                p_email: email || null,
                p_password_hash: defaultPasswordHash,
                p_referrer_code: null,
            }),
            { retries: 2, context: 'Đăng ký CTV' }
        );
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
        const { data, error } = await apiCall(
            () => supabase.rpc('get_ctv_dashboard', {
                p_ref_code: refCode,
            }),
            { retries: 2, context: 'Tải dashboard CTV' }
        );
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

// --- Register CTV (dashboard page) ---
export async function handleCTVRegister({ name, phone, email, passwordHash, referrerCode }) {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('register_ctv', {
                p_name: name,
                p_phone: phone,
                p_email: email || null,
                p_password_hash: passwordHash,
                p_referrer_code: referrerCode || null,
            }),
            { retries: 2, context: 'Đăng ký CTV (dashboard)' }
        );
        if (error) throw error;
        if (data?.ok) {
            setStoredRef(data.referral_code);
        }
        return data;
    } catch (err) {
        console.error('CTV register error:', err.message);
        return { ok: false, error: err.message };
    }
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
