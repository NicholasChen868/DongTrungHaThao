// ===================================
// ADMIN CTV — Quản lý CTV
// Load list, render table, upgrade tier
// ===================================
import { escapeHTML } from '../utils/sanitize.js';
import { apiCall, handleApiError } from '../utils/api.js';

/**
 * Tải danh sách CTV
 */
export async function loadCTVList({ supabase, getSessionToken, showAdminToast }) {
    try {
        const { data, error } = await apiCall(
            () => supabase.rpc('admin_list_ctv', { p_session_token: getSessionToken() }),
            { retries: 2, context: 'Tải danh sách CTV' }
        );
        if (error) throw error;
        renderCTVTable('allCTV', data || []);
    } catch (err) {
        handleApiError(err, 'Tải danh sách CTV', showAdminToast);
    }
}

function renderCTVTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!data?.length) {
        container.innerHTML = '<div class="admin-empty">Chưa có CTV</div>';
        return;
    }

    const tierMap = { silver: '🥈 Bạc', gold: '🥇 Vàng', diamond: '💎 Kim Cương' };
    const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });

    const tableHTML = `
<div class="ctv-table-wrapper">
<table class="admin-table">
<thead><tr><th>Mã CTV</th><th>Tên</th><th>SĐT</th><th>Email</th><th>Hạng</th><th>Điểm</th><th>VNĐ</th><th>Ngày ĐK</th><th>Nâng hạng</th></tr></thead>
<tbody>
${data.map(c => {
        const nextTier = c.tier === 'silver' ? 'gold' : c.tier === 'gold' ? 'diamond' : null;
        const upgradeBtn = nextTier
            ? `<button class="btn-action btn-approve" data-ref="${escapeHTML(c.referral_code)}" data-tier="${escapeHTML(nextTier)}" onclick="upgradeCTV(this.dataset.ref,this.dataset.tier)">${tierMap[nextTier]}</button>`
            : '<span class="text-muted">Max</span>';
        return `<tr>
        <td><code>${escapeHTML(c.referral_code)}</code></td>
        <td>${escapeHTML(c.name)}</td>
        <td>${escapeHTML(c.phone)}</td>
        <td>${escapeHTML(c.email) || '—'}</td>
        <td>${tierMap[c.tier] || escapeHTML(c.tier)}</td>
        <td>${parseInt(c.total_points) || 0}</td>
        <td>${Number(c.available_vnd || 0).toLocaleString('vi-VN')}₫</td>
        <td>${fmtDate(c.created_at)}</td>
        <td>${upgradeBtn}</td>
    </tr>`;
    }).join('')}
</tbody>
</table>
</div>`;

    const cardsHTML = `
<div class="ctv-cards">
<div class="ctv-cards-grid">
${data.map(c => {
        const nextTier = c.tier === 'silver' ? 'gold' : c.tier === 'gold' ? 'diamond' : null;
        const upgradeBtn = nextTier
            ? `<button class="btn-action btn-approve" data-ref="${escapeHTML(c.referral_code)}" data-tier="${escapeHTML(nextTier)}" onclick="upgradeCTV(this.dataset.ref,this.dataset.tier)">${tierMap[nextTier]}</button>`
            : '';
        return `
<div class="ctv-card">
    <div class="ctv-card-header">
        <span class="ctv-card-code">${escapeHTML(c.referral_code)}</span>
        <span class="badge badge-info">${tierMap[c.tier] || escapeHTML(c.tier)}</span>
    </div>
    <div class="ctv-card-name">${escapeHTML(c.name)}</div>
    <div class="ctv-card-info">
        <div class="ctv-card-row">
<span class="label">SĐT</span>
<span class="val">${escapeHTML(c.phone)}</span>
        </div>
        <div class="ctv-card-row">
<span class="label">Điểm</span>
<span class="val">${parseInt(c.total_points) || 0}</span>
        </div>
        <div class="ctv-card-row">
<span class="label">VNĐ khả dụng</span>
<span class="val">${Number(c.available_vnd || 0).toLocaleString('vi-VN')}₫</span>
        </div>
        <div class="ctv-card-row">
<span class="label">Ngày ĐK</span>
<span class="val">${fmtDate(c.created_at)}</span>
        </div>
    </div>
    ${upgradeBtn ? `<div class="ctv-card-footer">${upgradeBtn}</div>` : ''}
</div>`;
    }).join('')}
</div>
</div>`;

    container.innerHTML = tableHTML + cardsHTML;
}

/**
 * Nâng hạng CTV
 */
export async function upgradeCTV(refCode, newTier, { supabase, getSessionToken, showAdminToast, loaded, loadCTVList: reloadCTVList }) {
    const tierMap = { gold: 'Vàng', diamond: 'Kim Cương' };
    if (!confirm(`Nâng hạng ${refCode} lên ${tierMap[newTier]}?`)) return;

    try {
        const { error } = await supabase.rpc('admin_upgrade_ctv', {
            p_session_token: getSessionToken(), p_ref_code: refCode, p_new_tier: newTier
        });
        if (error) throw error;
        showAdminToast(`${refCode} → ${tierMap[newTier]}`);
        loaded.ctv = false;
        await reloadCTVList();
    } catch (err) {
        showAdminToast('Lỗi nâng hạng: ' + err.message, 'error');
    }
}
