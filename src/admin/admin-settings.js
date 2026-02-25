// ===================================
// ADMIN SETTINGS — Cài đặt sản phẩm, hero, liên hệ, CTV, thông báo
// ===================================
import { escapeHTML } from '../utils/sanitize.js';
import { apiCall } from '../utils/api.js';

// Shared state cho settings
let allSettings = {};

/**
 * Tải và render tất cả cài đặt
 */
export async function loadProductSettings({ supabase, getSessionToken, showAdminToast }) {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_get_settings', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải cài đặt' }
        );
        if (error) throw error;
        allSettings = {};
        (data || []).forEach(s => { allSettings[s.key] = s.value; });

        renderPricingEditor(allSettings);
        renderHeroEditor(allSettings);
        renderContactEditor(allSettings);
        renderCTVConfigEditor(allSettings);
        renderAnnouncementEditor(allSettings);
    } catch (err) { showAdminToast('Lỗi tải settings: ' + err.message, 'error'); }
}

function renderPricingEditor(settings) {
    const pricing = settings.product_pricing || {};
    document.getElementById('pricingEditor').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Tên sản phẩm</label>
        <input class="admin-input" id="sp_name" value="${escapeHTML(pricing.product_name || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Mô tả ngắn</label>
        <input class="admin-input" id="sp_subtitle" value="${escapeHTML(pricing.product_subtitle || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">💰 Đơn giá (VNĐ)</label>
        <input class="admin-input" type="number" id="sp_price" value="${pricing.unit_price || 850000}" step="10000" min="0" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">🚚 Free ship từ (hộp)</label>
        <input class="admin-input" type="number" id="sp_freeship" value="${pricing.free_shipping_min || 3}" min="1" />
    </div>
</div>
<div style="margin-bottom:16px">
    <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:8px">📊 Giảm giá theo số lượng (%)</label>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
        ${(pricing.quantity_options || [1, 2, 3, 5, 10]).map(q => `
        <div style="text-align:center">
<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${q} hộp</div>
<input class="admin-input" type="number" id="sp_disc_${q}" value="${(pricing.discounts || {})[q] || 0}" min="0" max="50" step="1" style="text-align:center" />
        </div>
    `).join('')}
    </div>
</div>
<button class="btn-action btn-approve" onclick="savePricing()" style="padding:10px 24px;font-size:14px">💾 Lưu Bảng Giá</button>
`;
}

function renderHeroEditor(settings) {
    const hero = settings.hero_content || {};
    document.getElementById('heroEditor').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Tiêu đề Hero</label>
        <input class="admin-input" id="hero_title" value="${escapeHTML(hero.title || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Subtitle</label>
        <input class="admin-input" id="hero_subtitle" value="${escapeHTML(hero.subtitle || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Nút CTA</label>
        <input class="admin-input" id="hero_cta" value="${escapeHTML(hero.cta_text || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Badge text</label>
        <input class="admin-input" id="hero_badge" value="${escapeHTML(hero.badge_text || '')}" />
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveHero()" style="padding:10px 24px;font-size:14px">💾 Lưu Hero</button>
`;
}

function renderContactEditor(settings) {
    const contact = settings.contact_info || {};
    document.getElementById('contactEditor').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">📱 Số điện thoại</label>
        <input class="admin-input" id="ct_phone" value="${escapeHTML(contact.phone || '')}" placeholder="0374867868" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">💬 Zalo (SĐT hoặc link)</label>
        <input class="admin-input" id="ct_zalo" value="${escapeHTML(contact.zalo || '')}" placeholder="0374867868" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">💙 Messenger (link m.me/...)</label>
        <input class="admin-input" id="ct_messenger" value="${escapeHTML(contact.messenger || '')}" placeholder="https://m.me/username" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">📍 Địa chỉ</label>
        <input class="admin-input" id="ct_address" value="${escapeHTML(contact.address || '')}" />
    </div>
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">🕐 Giờ làm việc</label>
        <input class="admin-input" id="ct_hours" value="${escapeHTML(contact.working_hours || '')}" />
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveContact()" style="padding:10px 24px;font-size:14px">💾 Lưu Liên Hệ</button>
`;
}

function renderCTVConfigEditor(settings) {
    const ctv = settings.ctv_config || {};
    const rates = ctv.commission_rates || { silver: 8, gold: 12, diamond: 15 };
    document.getElementById('ctvConfigEditor').innerHTML = `
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px">
    <div style="text-align:center">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">🥈 Silver (%)</div>
        <input class="admin-input" type="number" id="ctv_silver" value="${rates.silver}" min="0" max="50" style="text-align:center" />
    </div>
    <div style="text-align:center">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">🥇 Gold (%)</div>
        <input class="admin-input" type="number" id="ctv_gold" value="${rates.gold}" min="0" max="50" style="text-align:center" />
    </div>
    <div style="text-align:center">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">💎 Diamond (%)</div>
        <input class="admin-input" type="number" id="ctv_diamond" value="${rates.diamond}" min="0" max="50" style="text-align:center" />
    </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Rút tối thiểu (VNĐ)</label>
        <input class="admin-input" type="number" id="ctv_minwd" value="${ctv.min_withdrawal || 200000}" step="50000" />
    </div>
    <div style="display:flex;align-items:end;gap:8px;padding-bottom:2px">
        <label style="font-size:13px;color:var(--text-sec)">
<input type="checkbox" id="ctv_open" ${ctv.registration_enabled !== false ? 'checked' : ''} /> Cho phép đăng ký CTV
        </label>
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveCtvConfig()" style="padding:10px 24px;font-size:14px">💾 Lưu CTV</button>
`;
}

function renderAnnouncementEditor(settings) {
    const ann = settings.site_announcement || {};
    document.getElementById('announcementEditor').innerHTML = `
<div style="margin-bottom:14px">
    <label style="font-size:13px;color:var(--text-sec)">
        <input type="checkbox" id="ann_enabled" ${ann.enabled ? 'checked' : ''} /> Hiển thị thông báo
    </label>
</div>
<div style="margin-bottom:14px">
    <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Nội dung</label>
    <input class="admin-input" id="ann_msg" value="${escapeHTML(ann.message || '')}" placeholder="VD: 🎉 Khuyến mãi mua 3 tặng 1!" />
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">
    <div>
        <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Loại</label>
        <select class="admin-input" id="ann_type">
<option value="info" ${ann.type === 'info' ? 'selected' : ''}>ℹ️ Info</option>
<option value="success" ${ann.type === 'success' ? 'selected' : ''}>✅ Thành công</option>
<option value="warning" ${ann.type === 'warning' ? 'selected' : ''}>⚠️ Cảnh báo</option>
<option value="promo" ${ann.type === 'promo' ? 'selected' : ''}>🔥 Khuyến mãi</option>
        </select>
    </div>
    <div style="display:flex;align-items:end;gap:8px;padding-bottom:2px">
        <label style="font-size:13px;color:var(--text-sec)">
<input type="checkbox" id="ann_dismiss" ${ann.dismissible !== false ? 'checked' : ''} /> Cho phép đóng
        </label>
    </div>
</div>
<button class="btn-action btn-approve" onclick="saveAnnouncement()" style="padding:10px 24px;font-size:14px">💾 Lưu Thông Báo</button>
`;
}

// --- Save helpers ---
async function saveSetting(key, value, { supabase, getSessionToken, showAdminToast }) {
    const { error } = await supabase.rpc('admin_update_setting', {
        p_session_token: getSessionToken(), p_key: key, p_value: value
    });
    if (error) throw error;
    showAdminToast('Đã lưu thành công! ✅');
}

export async function savePricing({ supabase, getSessionToken, showAdminToast }) {
    try {
        const pricing = allSettings.product_pricing || {};
        pricing.product_name = document.getElementById('sp_name').value;
        pricing.product_subtitle = document.getElementById('sp_subtitle').value;
        pricing.unit_price = parseInt(document.getElementById('sp_price').value) || 850000;
        pricing.free_shipping_min = parseInt(document.getElementById('sp_freeship').value) || 3;
        (pricing.quantity_options || [1, 2, 3, 5, 10]).forEach(q => {
            const el = document.getElementById('sp_disc_' + q);
            if (el) pricing.discounts[q] = parseInt(el.value) || 0;
        });
        await saveSetting('product_pricing', pricing, { supabase, getSessionToken, showAdminToast });
    } catch (err) { showAdminToast('Lỗi lưu giá: ' + err.message, 'error'); }
}

export async function saveHero({ supabase, getSessionToken, showAdminToast }) {
    try {
        await saveSetting('hero_content', {
            title: document.getElementById('hero_title').value,
            subtitle: document.getElementById('hero_subtitle').value,
            cta_text: document.getElementById('hero_cta').value,
            cta_link: '#contact',
            badge_text: document.getElementById('hero_badge').value,
        }, { supabase, getSessionToken, showAdminToast });
    } catch (err) { showAdminToast('Lỗi lưu hero: ' + err.message, 'error'); }
}

export async function saveContact({ supabase, getSessionToken, showAdminToast }) {
    try {
        await saveSetting('contact_info', {
            phone: document.getElementById('ct_phone').value,
            zalo: document.getElementById('ct_zalo').value,
            messenger: document.getElementById('ct_messenger').value,
            address: document.getElementById('ct_address').value,
            working_hours: document.getElementById('ct_hours').value,
        }, { supabase, getSessionToken, showAdminToast });
    } catch (err) { showAdminToast('Lỗi lưu liên hệ: ' + err.message, 'error'); }
}

export async function saveCtvConfig({ supabase, getSessionToken, showAdminToast }) {
    try {
        await saveSetting('ctv_config', {
            commission_rates: {
                silver: parseInt(document.getElementById('ctv_silver').value) || 8,
                gold: parseInt(document.getElementById('ctv_gold').value) || 12,
                diamond: parseInt(document.getElementById('ctv_diamond').value) || 15,
            },
            min_withdrawal: parseInt(document.getElementById('ctv_minwd').value) || 200000,
            registration_enabled: document.getElementById('ctv_open').checked,
            auto_approve: false,
        }, { supabase, getSessionToken, showAdminToast });
    } catch (err) { showAdminToast('Lỗi lưu CTV: ' + err.message, 'error'); }
}

export async function saveAnnouncement({ supabase, getSessionToken, showAdminToast }) {
    try {
        await saveSetting('site_announcement', {
            enabled: document.getElementById('ann_enabled').checked,
            message: document.getElementById('ann_msg').value,
            type: document.getElementById('ann_type').value,
            dismissible: document.getElementById('ann_dismiss').checked,
        }, { supabase, getSessionToken, showAdminToast });
    } catch (err) { showAdminToast('Lỗi lưu thông báo: ' + err.message, 'error'); }
}
